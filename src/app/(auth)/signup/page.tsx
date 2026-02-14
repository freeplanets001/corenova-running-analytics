'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod/v4'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants/config'
import { ROUTES } from '@/lib/constants/routes'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

const signupSchema = z
  .object({
    email: z.email('有効なメールアドレスを入力してください'),
    password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
    confirmPassword: z.string().min(1, 'パスワードを再度入力してください'),
    displayName: z.string().min(1, '表示名を入力してください').max(50, '表示名は50文字以内で入力してください'),
    playerName: z.string().max(50, '選手名は50文字以内で入力してください').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      playerName: '',
    },
  })

  const onSubmit = async (values: SignupValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
          data: {
            display_name: values.displayName,
            player_name: values.playerName || null,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('このメールアドレスは既に登録されています')
        } else {
          toast.error(`登録エラー: ${error.message}`)
        }
        return
      }

      setIsComplete(true)
      toast.success('登録メールを送信しました')
    } catch {
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Mail className="h-6 w-6 text-emerald-500" />
          </div>
          <CardTitle className="text-xl">メールを確認してください</CardTitle>
          <CardDescription>
            確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(ROUTES.LOGIN)}
          >
            ログインページに戻る
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
          CN
        </div>
        <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
        <CardDescription>
          新しいアカウントを作成してください
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="pl-10"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">表示名</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="displayName"
                type="text"
                placeholder="田中 太郎"
                className="pl-10"
                {...form.register('displayName')}
              />
            </div>
            {form.formState.errors.displayName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerName">
              選手名{' '}
              <span className="text-xs text-muted-foreground">(任意)</span>
            </Label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="playerName"
                type="text"
                placeholder="選手としての登録名"
                className="pl-10"
                {...form.register('playerName')}
              />
            </div>
            {form.formState.errors.playerName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.playerName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="6文字以上"
                className="pl-10"
                {...form.register('password')}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード確認</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                className="pl-10"
                {...form.register('confirmPassword')}
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            登録後、管理者によってロールが設定されます。初期ロールは「閲覧者」です。
          </p>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            アカウントを作成
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          既にアカウントをお持ちの方は{' '}
          <Link
            href={ROUTES.LOGIN}
            className="font-medium text-primary hover:underline"
          >
            ログイン
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
