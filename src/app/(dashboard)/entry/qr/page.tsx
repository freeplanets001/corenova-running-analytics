'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QrCode, Scan, Download, CheckCircle, Calendar, Users, Loader2 } from 'lucide-react'

interface SessionItem {
  id: string
  date: string
  testType: string
}

interface PlayerItem {
  id: string
  name: string
}

export default function QRPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [players, setPlayers] = useState<PlayerItem[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [scannedPlayers, setScannedPlayers] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, playersRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/players'),
        ])
        const sessionsJson = await sessionsRes.json()
        const playersJson = await playersRes.json()

        const sessionList = (sessionsJson.sessions || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          date: s.date as string,
          testType: s.testType as string,
        }))
        setSessions(sessionList)
        if (sessionList.length > 0) setSelectedSessionId(sessionList[0].id)

        setPlayers(
          (playersJson.players || []).map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
          }))
        )
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const selectedSession = sessions.find(s => s.id === selectedSessionId)

  const handleGenerateQR = () => {
    if (!selectedSession) return
    alert('QRコードを生成しました')
  }

  const handleDownloadQR = () => {
    alert('QRコードをダウンロードしました')
  }

  const simulateScan = () => {
    if (players.length === 0) return
    setIsScanning(true)
    setTimeout(() => {
      const unscanned = players.filter(p => !scannedPlayers.includes(p.name))
      if (unscanned.length > 0) {
        const random = unscanned[Math.floor(Math.random() * unscanned.length)]
        setScannedPlayers(prev => [...prev, random.name])
      }
      setIsScanning(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QRコード管理</h1>
        <p className="text-gray-500 mt-2">QRコードで練習セッションへのチェックインを管理</p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR生成
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            QRスキャン
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                セッション選択
              </CardTitle>
              <CardDescription>
                QRコードを生成する練習セッションを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-sm">セッションがありません</p>
              ) : (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 px-3"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.date} {s.testType}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex gap-3">
                <Button onClick={handleGenerateQR} className="flex-1" disabled={!selectedSession}>
                  <QrCode className="mr-2 h-4 w-4" />
                  QRコード生成
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedSession && (
            <Card>
              <CardHeader>
                <CardTitle>生成されたQRコード</CardTitle>
                <CardDescription>
                  選手はこのQRコードをスキャンしてチェックインします
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-64 h-64 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 font-medium">{selectedSession.date}</p>
                    </div>
                  </div>

                  <div className="w-full max-w-md space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">セッション</span>
                      <Badge variant="secondary">{selectedSession.date} {selectedSession.testType}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">セッションID</span>
                      <code className="text-xs bg-white px-2 py-1 rounded">{selectedSession.id.slice(0, 8)}</code>
                    </div>
                  </div>

                  <Button onClick={handleDownloadQR} variant="outline" className="w-full max-w-md">
                    <Download className="mr-2 h-4 w-4" />
                    QRコードをダウンロード
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scan" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                QRコードスキャン
              </CardTitle>
              <CardDescription>
                選手がチェックインするためにQRコードをスキャンします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full max-w-md aspect-square bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  {isScanning ? (
                    <div className="text-center">
                      <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-white">スキャン中...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Scan className="h-16 w-16 text-white mx-auto mb-4" />
                      <p className="text-white">QRコードをカメラに向けてください</p>
                    </div>
                  )}
                  <div className="absolute inset-8 border-2 border-blue-500 rounded-lg"></div>
                </div>

                <Button
                  onClick={simulateScan}
                  disabled={isScanning || players.length === 0}
                  size="lg"
                  className="w-full max-w-md"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  {isScanning ? 'スキャン中...' : 'スキャン開始（デモ）'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                チェックイン済み選手
                <Badge variant="secondary">{scannedPlayers.length}名</Badge>
              </CardTitle>
              <CardDescription>
                今回のセッションでチェックインした選手一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scannedPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだチェックインした選手がいません
                </div>
              ) : (
                <div className="space-y-2">
                  {scannedPlayers.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{player}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date().toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {scannedPlayers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>セッション情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">セッション</span>
                    <span>{selectedSession ? `${selectedSession.date} ${selectedSession.testType}` : '未選択'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">チェックイン数</span>
                    <Badge variant="secondary">{scannedPlayers.length}名</Badge>
                  </div>
                  {players.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">出席率</span>
                      <Badge variant="secondary">
                        {((scannedPlayers.length / players.length) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
