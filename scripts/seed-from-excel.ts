import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Excel serial date to ISO date string
function excelDateToISO(serial: number): string {
  const date = new Date((serial - 25569) * 86400 * 1000)
  return date.toISOString().split('T')[0]
}

async function main() {
  console.log('=== CORENOVA データインポート開始 ===\n')

  const excelPath = path.resolve(__dirname, '../../ランニングセッション.xlsx')
  const wb = XLSX.readFile(excelPath)
  const ws = wb.Sheets['シート1']
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]

  // Step 1: Create team
  console.log('1. チーム作成...')
  const { data: team, error: teamErr } = await supabase
    .from('teams')
    .upsert({ name: 'CORENOVA', description: 'バスケットボールチーム' }, { onConflict: 'name' })
    .select()
    .single()

  if (teamErr) {
    // teams may not have unique constraint on name, try insert
    const { data: existingTeams } = await supabase.from('teams').select().eq('name', 'CORENOVA')
    if (existingTeams && existingTeams.length > 0) {
      console.log('  チーム既存:', existingTeams[0].id)
      var teamId = existingTeams[0].id
    } else {
      const { data: newTeam, error: insertErr } = await supabase
        .from('teams')
        .insert({ name: 'CORENOVA', description: 'バスケットボールチーム' })
        .select()
        .single()
      if (insertErr) throw insertErr
      console.log('  チーム作成完了:', newTeam.id)
      var teamId = newTeam.id
    }
  } else {
    var teamId = team.id
    console.log('  チーム作成完了:', teamId)
  }

  // Step 2: Create test type
  console.log('\n2. テストタイプ作成...')
  const { data: existingTypes } = await supabase
    .from('test_types')
    .select()
    .eq('name', 'ランニングドリル')
    .is('team_id', null)

  let testTypeId: string
  if (existingTypes && existingTypes.length > 0) {
    testTypeId = existingTypes[0].id
    console.log('  テストタイプ既存:', testTypeId)
  } else {
    const { data: tt, error: ttErr } = await supabase
      .from('test_types')
      .insert({
        team_id: teamId,
        name: 'ランニングドリル',
        description: '一定距離を走るタイム計測',
        unit: '秒',
        direction: 'decrease',
        min_value: 30,
        max_value: 180,
        max_runs: 12,
      })
      .select()
      .single()
    if (ttErr) throw ttErr
    testTypeId = tt.id
    console.log('  テストタイプ作成完了:', testTypeId)
  }

  // Step 3: Create profiles for all players
  console.log('\n3. 選手プロフィール作成...')
  const playerNames = [
    'ロイ', 'ミイク', 'マミ', 'ゴン', 'サキ', 'ナナ',
    'アオ', 'メグ', 'リナ', 'ヒロヨ', 'ルカ', 'マイ',
    'アスカ', 'メイ', 'コヨミ', 'ミヤビ', 'ハウィ', 'Iza',
  ]

  const playerMap = new Map<string, string>() // name -> profile_id

  for (const name of playerNames) {
    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('player_name', name)

    if (existing && existing.length > 0) {
      playerMap.set(name, existing[0].id)
      continue
    }

    // Create auth user via admin API
    const email = `${name.toLowerCase().replace(/[^a-z]/g, '') || 'player'}${Math.random().toString(36).slice(2, 6)}@corenova.local`
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password: 'CoReN0vA2026!',
      email_confirm: true,
      user_metadata: { display_name: name, player_name: name },
    })

    if (authErr) {
      console.error(`  ⚠ ${name}: ${authErr.message}`)
      continue
    }

    // Create profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email,
        display_name: name,
        player_name: name,
        role: 'player',
        is_active: true,
        locale: 'ja',
      })

    if (profileErr) {
      console.error(`  ⚠ ${name} profile: ${profileErr.message}`)
      continue
    }

    // Add to team
    await supabase.from('team_members').upsert({
      team_id: teamId,
      profile_id: authUser.user.id,
      role: 'player',
    })

    playerMap.set(name, authUser.user.id)
    console.log(`  ✓ ${name} (${authUser.user.id.slice(0, 8)}...)`)
  }

  console.log(`  合計 ${playerMap.size} 名の選手を登録`)

  // Step 4: Parse sessions and runs from Excel
  console.log('\n4. セッション＋記録データ投入...')
  const header = rows[0] as string[]

  // Find run columns (containing '本目')
  const runCols: { index: number; runNumber: number }[] = []
  header.forEach((h, idx) => {
    if (typeof h === 'string' && h.includes('本目')) {
      const match = h.match(/(\d+)本目/)
      if (match) runCols.push({ index: idx, runNumber: parseInt(match[1]) })
    }
  })
  console.log(`  本数列: ${runCols.map(c => `${c.runNumber}本目(col ${c.index})`).join(', ')}`)

  // Group rows by date
  const sessionMap = new Map<number, Array<{ name: string; runs: Array<{ runNumber: number; value: number }> }>>()

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as (number | string | undefined)[]
    const dateSerial = row[0] as number | undefined
    const name = row[1] as string | undefined

    if (!dateSerial || !name) continue

    if (!sessionMap.has(dateSerial)) {
      sessionMap.set(dateSerial, [])
    }

    const runs: Array<{ runNumber: number; value: number }> = []
    for (const col of runCols) {
      const val = row[col.index]
      if (typeof val === 'number' && val > 0) {
        runs.push({ runNumber: col.runNumber, value: val })
      }
    }

    if (runs.length > 0) {
      sessionMap.get(dateSerial)!.push({ name, runs })
    }
  }

  console.log(`  セッション数: ${sessionMap.size}`)

  let totalRuns = 0

  for (const [dateSerial, players] of [...sessionMap.entries()].sort((a, b) => a[0] - b[0])) {
    const dateStr = excelDateToISO(dateSerial)

    // Skip anomalous date
    if (dateStr === '2026-12-31') {
      console.log(`  ⚠ ${dateStr}: 日付異常のためスキップ`)
      continue
    }

    // Check if session already exists
    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('team_id', teamId)
      .eq('test_type_id', testTypeId)
      .eq('session_date', dateStr)

    let sessionId: string
    if (existingSessions && existingSessions.length > 0) {
      sessionId = existingSessions[0].id
      console.log(`  ${dateStr}: 既存セッション使用 (${players.length}名)`)
    } else {
      const { data: session, error: sessionErr } = await supabase
        .from('sessions')
        .insert({
          team_id: teamId,
          test_type_id: testTypeId,
          session_date: dateStr,
          target_run_count: Math.max(...players.map(p => p.runs.length)),
          notes: `Excelインポート (${players.length}名)`,
          is_locked: false,
        })
        .select()
        .single()

      if (sessionErr) {
        console.error(`  ✗ ${dateStr}: ${sessionErr.message}`)
        continue
      }
      sessionId = session.id
      console.log(`  ✓ ${dateStr}: セッション作成 (${players.length}名)`)
    }

    // Insert runs for each player
    for (const player of players) {
      const playerId = playerMap.get(player.name)
      if (!playerId) {
        console.error(`    ⚠ ${player.name}: プロフィール未登録`)
        continue
      }

      const runInserts = player.runs.map(r => ({
        session_id: sessionId,
        player_id: playerId,
        run_number: r.runNumber,
        value: Math.round(r.value * 100) / 100,
        is_valid: true,
        source: 'excel_import' as const,
      }))

      const { error: runErr } = await supabase
        .from('session_runs')
        .upsert(runInserts, { onConflict: 'session_id,player_id,run_number' })

      if (runErr) {
        console.error(`    ✗ ${player.name}: ${runErr.message}`)
      } else {
        totalRuns += runInserts.length
      }
    }
  }

  console.log(`\n=== インポート完了 ===`)
  console.log(`チーム: CORENOVA (${teamId})`)
  console.log(`選手: ${playerMap.size}名`)
  console.log(`セッション: ${sessionMap.size - 1}件 (異常日付1件除外)`)
  console.log(`記録: ${totalRuns}件`)
}

main().catch(console.error)
