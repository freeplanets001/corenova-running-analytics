'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Sparkles, Send, User, Bot } from 'lucide-react';
import { useState } from 'react';

export default function AIChatPage() {
  const [message, setMessage] = useState('');

  const mockMessages = [
    {
      id: 1,
      type: 'ai',
      content: 'こんにちは！CORENOVA AIアシスタントです。あなたのパフォーマンスデータについて何でもお聞きください。',
      timestamp: '10:30'
    },
    {
      id: 2,
      type: 'user',
      content: '最近の垂直跳びの記録はどう？',
      timestamp: '10:31'
    },
    {
      id: 3,
      type: 'ai',
      content: '素晴らしい質問ですね！過去1ヶ月の垂直跳びの記録を分析すると、平均で65cmを記録しており、先月と比較して3.2cm（約5%）向上しています。\n\n特に注目すべきは、2月に入ってから3回連続で自己ベストを更新していることです。この調子でトレーニングを続ければ、目標の70cmも近いうちに達成できそうです。',
      timestamp: '10:31'
    },
    {
      id: 4,
      type: 'user',
      content: 'もっと記録を伸ばすにはどうしたらいい？',
      timestamp: '10:32'
    },
    {
      id: 5,
      type: 'ai',
      content: '垂直跳びの記録を向上させるためのアドバイスをいくつかご紹介します：\n\n1. **プライオメトリクストレーニング**: ボックスジャンプやデプスジャンプを週2-3回取り入れましょう\n2. **下半身の筋力強化**: スクワットやランジで大腿四頭筋とハムストリングスを鍛えましょう\n3. **体幹トレーニング**: プランクやロシアンツイストで体幹を安定させます\n4. **柔軟性の向上**: ダイナミックストレッチで可動域を広げましょう\n\nあなたのデータを見ると、火曜日と木曜日のトレーニング後にパフォーマンスが良い傾向があります。この日にジャンプトレーニングを重点的に行うと効果的かもしれません。',
      timestamp: '10:32'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  const suggestedQuestions = [
    '今週のパフォーマンスをまとめて',
    'チーム平均と比較して',
    '次の目標を提案して',
    '改善が必要な項目は？'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIチャット</h1>
        <p className="text-muted-foreground mt-2">
          AIとチャットしてパフォーマンスデータについて質問できます
        </p>
      </div>

      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI機能について
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            このチャットはGoogle Gemini APIを使用しています。あなたの測定データを分析し、
            改善提案やパフォーマンスに関する質問に答えます。
          </p>
        </CardContent>
      </Card>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">CORENOVA AI</CardTitle>
              <CardDescription className="text-xs">パフォーマンスアシスタント</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className={`h-8 w-8 ${msg.type === 'ai' ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-muted'}`}>
                <div className="flex h-full w-full items-center justify-center">
                  {msg.type === 'ai' ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </Avatar>
              <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div
                  className={`rounded-lg p-3 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}
        </CardContent>

        <div className="border-t p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">質問例</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="p-2 rounded bg-muted">
            「先月と比較して改善した項目は？」
          </div>
          <div className="p-2 rounded bg-muted">
            「チームメイトの平均と比べてどう？」
          </div>
          <div className="p-2 rounded bg-muted">
            「次の目標を達成するためのアドバイスは？」
          </div>
          <div className="p-2 rounded bg-muted">
            「今週の調子はどう？」
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
