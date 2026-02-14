'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'

// Validation schemas
const passwordLoginSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
})

const magicLinkSchema = z.object({
  email: z.email('有効なメールアドレスを入力してください'),
})

type PasswordLoginValues = z.infer<typeof passwordLoginSchema>
type MagicLinkValues = z.infer<typeof magicLinkSchema>

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || ROUTES.OVERVIEW
  const supabase = createClient()

  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // Password login form
  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Magic link form
  const magicLinkForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  })

  const onPasswordLogin = async (values: PasswordLoginValues) => {
    setIsPasswordLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('メールアドレスまたはパスワードが正しくありません')
        } else {
          toast.error(`ログインエラー: ${error.message}`)
        }
        return
      }

      toast.success('ログインしました')
      router.push(redirectTo)
      router.refresh()
    } catch {
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const onMagicLink = async (values: MagicLinkValues) => {
    setIsMagicLinkLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      })

      if (error) {
        toast.error(`送信エラー: ${error.message}`)
        return
      }

      setMagicLinkSent(true)
      toast.success('ログインリンクをメールで送信しました')
    } catch {
      toast.error('予期しないエラーが発生しました')
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
          CN
        </div>
        <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
        <CardDescription>
          アカウントにログインしてください
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">パスワード</TabsTrigger>
            <TabsTrigger value="magic-link">マジックリンク</TabsTrigger>
          </TabsList>

          {/* Password Login Tab */}
          <TabsContent value="password">
            <form onSubmit={passwordForm.handleSubmit(onPasswordLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-email">メールアドレス</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pl-10"
                    {...passwordForm.register('email')}
                  />
                </div>
                {passwordForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">パスワード</Label>
                  <Link
                    href={ROUTES.FORGOT_PASSWORD}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    パスワードを忘れた方
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                    className="pl-10"
                    {...passwordForm.register('password')}
                  />
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPasswordLoading}>
                {isPasswordLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                ログイン
              </Button>
            </form>
          </TabsContent>

          {/* Magic Link Tab */}
          <TabsContent value="magic-link">
            {magicLinkSent ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  <Mail className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium">メールを確認してください</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ログインリンクをメールで送信しました。
                    メール内のリンクをクリックしてログインしてください。
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMagicLinkSent(false)}
                >
                  別のメールアドレスで試す
                </Button>
              </div>
            ) : (
              <form onSubmit={magicLinkForm.handleSubmit(onMagicLink)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="example@email.com"
                      className="pl-10"
                      {...magicLinkForm.register('email')}
                    />
                  </div>
                  {magicLinkForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {magicLinkForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  パスワード不要でログインできます。メールアドレスにログインリンクを送信します。
                </p>

                <Button type="submit" className="w-full" disabled={isMagicLinkLoading}>
                  {isMagicLinkLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  ログインリンクを送信
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          アカウントをお持ちでない方は{' '}
          <Link
            href={ROUTES.SIGNUP}
            className="font-medium text-primary hover:underline"
          >
            新規登録
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
