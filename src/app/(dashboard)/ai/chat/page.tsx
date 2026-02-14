'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Sparkles, Send, User, Bot, Loader2, AlertCircle } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AIChatPage() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending || !user) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMsg])
    setMessage('')
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          conversationId,
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'エラーが発生しました')
        return
      }

      if (data.conversationId) {
        setConversationId(data.conversationId)
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages(prev => [...prev, aiMsg])
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setSending(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question)
  }

  const suggestedQuestions = [
    '最近のチームの成績はどう？',
    'チーム平均と比較して',
    '改善が必要な選手は？',
    '次の目標を提案して',
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AIチャット</h1>
        <p className="text-muted-foreground mt-2">
          AIとチャットしてパフォーマンスデータについて質問できます
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

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
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">CORENOVA AIアシスタント</p>
                <p className="text-sm text-muted-foreground mt-1">
                  チームのパフォーマンスデータについて質問してみましょう
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className={`h-8 w-8 shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-muted'}`}>
                <div className="flex h-full w-full items-center justify-center">
                  {msg.role === 'assistant' ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </Avatar>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div
                  className={`rounded-lg p-3 ${
                    msg.role === 'user'
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

          {sending && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-purple-500 to-blue-500">
                <div className="flex h-full w-full items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </Avatar>
              <div className="rounded-lg p-3 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !message.trim()}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
