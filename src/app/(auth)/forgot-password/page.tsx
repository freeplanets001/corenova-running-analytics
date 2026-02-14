'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('メールアドレスを入力してください')
      return
    }
    setIsLoading(true)
    try {
      const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/callback?redirect=/settings/profile`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })
      if (error) {
        toast.error(`送信エラー: ${error.message}`)
        return
      }
      setSubmitted(true)
    } catch {
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">送信完了</CardTitle>
          <CardDescription>
            パスワードリセットのメールを送信しました
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
            <p className="mb-2">
              {email} にパスワードリセットのリンクを送信しました。
            </p>
            <p>
              メールが届かない場合は、迷惑メールフォルダをご確認ください。
            </p>
          </div>
          <Link href="/login" className="block">
            <Button className="w-full" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ログイン画面に戻る
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">パスワードリセット</CardTitle>
        <CardDescription>
          登録されているメールアドレスを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="example@corenova.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? '送信中...' : 'リセットメールを送信'}
          </Button>

          <Link href="/login" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ログイン画面に戻る
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
