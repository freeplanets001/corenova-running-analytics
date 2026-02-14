import * as XLSX from 'xlsx'

export interface ParsedRun {
  runNumber: number
  value: number
}

export interface ParsedPlayerSession {
  date: string
  playerName: string
  runs: ParsedRun[]
  average: number | null
  isAnomalous: boolean
}

export interface ParsedExcelData {
  sessions: ParsedPlayerSession[]
  dates: string[]
  playerNames: string[]
  errors: string[]
}

/**
 * Parse the ランニングセッション.xlsx file from シート1 (2) format (wide: one row per player per session)
 * Columns: Date, Name, 1本目, 2本目, ..., 8本目, 平均
 */
export function parseExcelFile(buffer: ArrayBuffer): ParsedExcelData {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const errors: string[] = []

  // Try シート1 (2) first as it's cleaner, fallback to シート1
  const sheetName = workbook.SheetNames.includes('シート1 (2)')
    ? 'シート1 (2)'
    : workbook.SheetNames.includes('シート1')
      ? 'シート1'
      : workbook.SheetNames[0]

  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    return { sessions: [], dates: [], playerNames: [], errors: ['シートが見つかりません'] }
  }

  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  if (rawData.length < 2) {
    return { sessions: [], dates: [], playerNames: [], errors: ['データが空です'] }
  }

  // Skip header row
  const header = rawData[0] as string[]
  const sessions: ParsedPlayerSession[] = []
  const dateSet = new Set<string>()
  const nameSet = new Set<string>()

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0] || !row[1]) continue

    // Parse date
    let dateStr: string
    const rawDate = row[0]
    if (typeof rawDate === 'number') {
      // Excel serial date
      const date = XLSX.SSF.parse_date_code(rawDate)
      dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    } else if (rawDate instanceof Date) {
      dateStr = rawDate.toISOString().split('T')[0]
    } else {
      const parsed = new Date(String(rawDate))
      if (isNaN(parsed.getTime())) {
        errors.push(`行${i + 1}: 無効な日付 "${rawDate}"`)
        continue
      }
      dateStr = parsed.toISOString().split('T')[0]
    }

    const playerName = String(row[1]).trim()
    if (!playerName) continue

    // Parse run values - find columns between Name and 平均
    const runs: ParsedRun[] = []
    let runNum = 1

    // Determine which columns have run data
    // In シート1 (2): columns 2-9 are 1本目-8本目, column 10 is 平均
    // In シート1: columns 2-7 are 1本目-6本目, column 8 is empty, 9-11 are 7本目-9本目, 12 is 平均
    const avgColIndex = header.findIndex((h) => h && String(h).includes('平均'))
    const endCol = avgColIndex > 0 ? avgColIndex : row.length - 1

    for (let col = 2; col < endCol; col++) {
      const headerVal = header[col]
      // Skip empty header columns (like the gap in シート1)
      if (headerVal === undefined || headerVal === null || String(headerVal).trim() === '') continue
      // Skip if header doesn't look like a run number
      if (!String(headerVal).includes('本目')) continue

      const val = row[col]
      if (val === undefined || val === null || val === '' || (typeof val === 'string' && isNaN(Number(val)))) continue

      const numVal = Number(val)
      if (isNaN(numVal) || numVal <= 0) continue

      runs.push({ runNumber: runNum, value: numVal })
      runNum++
    }

    // Detect anomalous session (2026-02-04 data has values 12-19 instead of 46-87)
    const isAnomalous = runs.length > 0 && runs.every((r) => r.value < 30)

    // Filter contaminated values in anomalous sessions (some column H values are ~64-84)
    const cleanRuns = isAnomalous
      ? runs.filter((r) => r.value < 30)
      : runs

    // Parse or compute average
    let average: number | null = null
    if (avgColIndex > 0 && row[avgColIndex] !== undefined && row[avgColIndex] !== null) {
      const avgVal = Number(row[avgColIndex])
      if (!isNaN(avgVal) && avgVal > 0) {
        average = avgVal
      }
    }
    if (average === null && cleanRuns.length > 0) {
      average = cleanRuns.reduce((sum, r) => sum + r.value, 0) / cleanRuns.length
    }

    if (cleanRuns.length === 0 && average === null) {
      // Player was listed but has no data (absent)
      continue
    }

    dateSet.add(dateStr)
    nameSet.add(playerName)

    sessions.push({
      date: dateStr,
      playerName,
      runs: cleanRuns.map((r, idx) => ({ ...r, runNumber: idx + 1 })),
      average,
      isAnomalous,
    })
  }

  return {
    sessions,
    dates: Array.from(dateSet).sort(),
    playerNames: Array.from(nameSet).sort(),
    errors,
  }
}

/**
 * Parse the クエリ sheet (normalized format: one row per run)
 * Columns: Date, Name, 本数 (run label like "1本目"), 記録 (value)
 */
export function parseNormalizedSheet(buffer: ArrayBuffer): ParsedExcelData {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const errors: string[] = []

  const sheet = workbook.Sheets['クエリ']
  if (!sheet) {
    return { sessions: [], dates: [], playerNames: [], errors: ['クエリシートが見つかりません'] }
  }

  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  if (rawData.length < 2) {
    return { sessions: [], dates: [], playerNames: [], errors: ['データが空です'] }
  }

  // Group by date + player
  const grouped = new Map<string, ParsedRun[]>()
  const dateSet = new Set<string>()
  const nameSet = new Set<string>()

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i]
    if (!row || !row[0] || !row[1]) continue

    let dateStr: string
    const rawDate = row[0]
    if (typeof rawDate === 'number') {
      const date = XLSX.SSF.parse_date_code(rawDate)
      dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    } else {
      const parsed = new Date(String(rawDate))
      if (isNaN(parsed.getTime())) continue
      dateStr = parsed.toISOString().split('T')[0]
    }

    const playerName = String(row[1]).trim()
    const runLabel = String(row[2] || '')
    const value = Number(row[3])

    if (!playerName || isNaN(value) || value <= 0) continue

    // Extract run number from label like "1本目"
    const match = runLabel.match(/(\d+)本目/)
    const runNumber = match ? parseInt(match[1], 10) : 1

    const key = `${dateStr}|${playerName}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push({ runNumber, value })

    dateSet.add(dateStr)
    nameSet.add(playerName)
  }

  const sessions: ParsedPlayerSession[] = []
  for (const [key, runs] of grouped) {
    const [date, playerName] = key.split('|')
    const sortedRuns = runs.sort((a, b) => a.runNumber - b.runNumber)
    const isAnomalous = sortedRuns.every((r) => r.value < 30)
    const average = sortedRuns.reduce((sum, r) => sum + r.value, 0) / sortedRuns.length

    sessions.push({ date, playerName, runs: sortedRuns, average, isAnomalous })
  }

  return {
    sessions: sessions.sort((a, b) => a.date.localeCompare(b.date) || a.playerName.localeCompare(b.playerName)),
    dates: Array.from(dateSet).sort(),
    playerNames: Array.from(nameSet).sort(),
    errors,
  }
}

/**
 * Auto-detect sheet format and parse accordingly
 */
export function autoParseExcel(buffer: ArrayBuffer): ParsedExcelData {
  const workbook = XLSX.read(buffer, { type: 'array' })

  // Prefer シート1 (2) for the widest clean dataset
  if (workbook.SheetNames.includes('シート1 (2)') || workbook.SheetNames.includes('シート1')) {
    return parseExcelFile(buffer)
  }

  // Fallback to normalized format
  if (workbook.SheetNames.includes('クエリ')) {
    return parseNormalizedSheet(buffer)
  }

  // Try to auto-detect: if second column header contains 本目, it's wide format
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const header: unknown[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, range: 0 })
  if (header[0] && header[0].some((h) => String(h || '').includes('本目'))) {
    return parseExcelFile(buffer)
  }

  return parseNormalizedSheet(buffer)
}
