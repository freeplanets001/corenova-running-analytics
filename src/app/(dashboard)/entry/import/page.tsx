'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileSpreadsheet, CheckCircle, X, Download, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface PreviewRow {
  player: string
  runs: number[]
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewRow[]>([])
  const [maxRuns, setMaxRuns] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseExcel = async (f: File) => {
    try {
      const buffer = await f.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

      const rows: PreviewRow[] = []
      let max = 0
      for (const row of json) {
        if (!row || row.length < 2) continue
        const player = String(row[0]).trim()
        if (!player) continue
        const runs = row.slice(1).map(v => Number(v)).filter(v => !isNaN(v) && v > 0)
        if (runs.length === 0) continue
        max = Math.max(max, runs.length)
        rows.push({ player, runs })
      }

      setPreviewData(rows)
      setMaxRuns(max)
    } catch {
      toast.error('Excelファイルの読み取りに失敗しました')
      setFile(null)
    }
  }

  const handleFile = (f: File) => {
    if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
      setFile(f)
      setImportSuccess(false)
      setPreviewData([])
      parseExcel(f)
    } else {
      toast.error('.xlsx または .xls ファイルを選択してください')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFile(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setImportSuccess(false)
    setPreviewData([])
    setMaxRuns(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImport = async () => {
    if (previewData.length === 0) return
    setIsImporting(true)

    try {
      // Create session first
      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
      })
      const sessionJson = await sessionRes.json()
      if (!sessionJson.id) throw new Error('セッション作成に失敗')

      // Get players to match names
      const playersRes = await fetch('/api/players')
      const playersJson = await playersRes.json()
      const playerMap = new Map<string, string>()
      for (const p of playersJson.players || []) {
        playerMap.set(p.name, p.id)
      }

      // Submit runs
      const runs: Array<{ sessionId: string; playerId: string; runNumber: number; value: number }> = []
      for (const row of previewData) {
        const playerId = playerMap.get(row.player)
        if (!playerId) continue
        row.runs.forEach((value, i) => {
          runs.push({ sessionId: sessionJson.id, playerId, runNumber: i + 1, value })
        })
      }

      if (runs.length > 0) {
        await fetch(`/api/sessions/${sessionJson.id}/runs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runs }),
        })
      }

      setImportSuccess(true)
      toast.success(`${previewData.length}名のデータをインポートしました`)
    } catch {
      toast.error('インポートに失敗しました')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Excelインポート</h1>
        <p className="text-gray-500 mt-2">Excelファイルから走行データを一括インポート</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>サポート形式</CardTitle>
          <CardDescription>以下のファイル形式に対応しています</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <FileSpreadsheet className="h-4 w-4" />
              .xlsx
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <FileSpreadsheet className="h-4 w-4" />
              .xls
            </Badge>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              ファイルは以下の形式である必要があります: 1列目に選手名、2列目以降に各ランのデータ
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ファイルアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                ファイルをドラッグ＆ドロップ
              </p>
              <p className="text-gray-500 mb-4">または</p>
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    ファイルを選択
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {importSuccess && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">インポートが完了しました</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview from actual file */}
      {file && !importSuccess && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
            <CardDescription>ファイルから読み取ったデータ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">
                      選手名
                    </th>
                    {Array.from({ length: maxRuns }, (_, i) => (
                      <th key={i} className="border border-gray-300 p-3 text-center font-semibold">
                        ラン {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{row.player}</td>
                      {Array.from({ length: maxRuns }, (_, i) => (
                        <td key={i} className="border border-gray-300 p-3 text-center">
                          {row.runs[i] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {previewData.length}名のデータが検出されました
            </div>
          </CardContent>
        </Card>
      )}

      {file && !importSuccess && previewData.length > 0 && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleRemoveFile}>
            キャンセル
          </Button>
          <Button onClick={handleImport} disabled={isImporting} size="lg">
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isImporting ? 'インポート中...' : 'インポート実行'}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>テンプレートダウンロード</CardTitle>
          <CardDescription>
            サンプルのExcelファイルをダウンロードして参考にできます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            テンプレートをダウンロード
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
