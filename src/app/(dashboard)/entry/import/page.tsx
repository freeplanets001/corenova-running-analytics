'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, X, Download, AlertCircle } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportSuccess(false);
  };

  const handleImport = async () => {
    setIsImporting(true);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsImporting(false);
    setImportSuccess(true);
  };

  const mockPreviewData = [
    { player: '田中 太郎', run1: 28.5, run2: 29.1, run3: 28.8, run4: 29.2, run5: 28.6 },
    { player: '佐藤 花子', run1: 27.8, run2: 28.2, run3: 27.9, run4: 28.5, run5: 27.7 },
    { player: '鈴木 一郎', run1: 30.1, run2: 29.8, run3: 30.3, run4: 29.9, run5: 30.0 },
  ];

  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Excelインポート</h1>
        <p className="text-gray-500 mt-2">Excelファイルから走行データを一括インポート</p>
      </div>

      {/* Supported Formats */}
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

      {/* Upload Area */}
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

      {/* Preview */}
      {file && !importSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
            <CardDescription>インポートされるデータの確認</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left font-semibold">
                      選手名
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">
                      ラン 1
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">
                      ラン 2
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">
                      ラン 3
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">
                      ラン 4
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">
                      ラン 5
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockPreviewData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{row.player}</td>
                      <td className="border border-gray-300 p-3 text-center">{row.run1}</td>
                      <td className="border border-gray-300 p-3 text-center">{row.run2}</td>
                      <td className="border border-gray-300 p-3 text-center">{row.run3}</td>
                      <td className="border border-gray-300 p-3 text-center">{row.run4}</td>
                      <td className="border border-gray-300 p-3 text-center">{row.run5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              3行のデータが検出されました
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Mapping */}
      {file && !importSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>列マッピング</CardTitle>
            <CardDescription>
              Excelの列とデータベースのフィールドの対応を確認
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">列 A</span>
                <span className="text-gray-500">→</span>
                <Badge variant="secondary">選手名</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">列 B</span>
                <span className="text-gray-500">→</span>
                <Badge variant="secondary">ラン 1</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">列 C</span>
                <span className="text-gray-500">→</span>
                <Badge variant="secondary">ラン 2</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">列 D</span>
                <span className="text-gray-500">→</span>
                <Badge variant="secondary">ラン 3</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">列 E</span>
                <span className="text-gray-500">→</span>
                <Badge variant="secondary">ラン 4</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">列 F</span>
                <span className="text-gray-500">→</span>
                <Badge variant="secondary">ラン 5</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {file && !importSuccess && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleRemoveFile}>
            キャンセル
          </Button>
          <Button onClick={handleImport} disabled={isImporting} size="lg">
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? 'インポート中...' : 'インポート実行'}
          </Button>
        </div>
      )}

      {/* Template Download */}
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
  );
}
