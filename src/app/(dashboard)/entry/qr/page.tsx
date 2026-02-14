'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Scan, Download, CheckCircle, Calendar, Users } from 'lucide-react';

export default function QRPage() {
  const [selectedSession, setSelectedSession] = useState('2024-01-15 朝練習');
  const [scannedPlayers, setScannedPlayers] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleGenerateQR = () => {
    alert('QRコードを生成しました');
  };

  const handleDownloadQR = () => {
    alert('QRコードをダウンロードしました');
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const players = ['田中 太郎', '佐藤 花子', '鈴木 一郎', '山田 美咲'];
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      if (!scannedPlayers.includes(randomPlayer)) {
        setScannedPlayers([...scannedPlayers, randomPlayer]);
      }
      setIsScanning(false);
    }, 1000);
  };

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

        {/* Generate QR Tab */}
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
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 px-3"
              >
                <option value="2024-01-15 朝練習">2024-01-15 朝練習</option>
                <option value="2024-01-15 午後練習">2024-01-15 午後練習</option>
                <option value="2024-01-16 朝練習">2024-01-16 朝練習</option>
                <option value="2024-01-16 午後練習">2024-01-16 午後練習</option>
              </select>

              <div className="flex gap-3">
                <Button onClick={handleGenerateQR} className="flex-1">
                  <QrCode className="mr-2 h-4 w-4" />
                  QRコード生成
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>生成されたQRコード</CardTitle>
              <CardDescription>
                選手はこのQRコードをスキャンしてチェックインします
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder QR Code */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-64 h-64 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">{selectedSession}</p>
                  </div>
                </div>

                <div className="w-full max-w-md space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">セッション</span>
                    <Badge variant="secondary">{selectedSession}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">QRコードID</span>
                    <code className="text-sm bg-white px-2 py-1 rounded">QR-20240115-001</code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">有効期限</span>
                    <span className="text-sm">2024-01-15 23:59</span>
                  </div>
                </div>

                <Button onClick={handleDownloadQR} variant="outline" className="w-full max-w-md">
                  <Download className="mr-2 h-4 w-4" />
                  QRコードをダウンロード
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan QR Tab */}
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
              {/* Scanner Placeholder */}
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
                  {/* Scanner frame overlay */}
                  <div className="absolute inset-8 border-2 border-blue-500 rounded-lg"></div>
                </div>

                <Button
                  onClick={simulateScan}
                  disabled={isScanning}
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
                    <span className="font-medium">セッション名</span>
                    <span>{selectedSession}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">チェックイン数</span>
                    <Badge variant="secondary">{scannedPlayers.length}名</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">出席率</span>
                    <Badge variant="secondary">
                      {((scannedPlayers.length / 20) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
