import { GoogleGenAI } from '@google/genai'

export function createGeminiClient(apiKey: string) {
  return new GoogleGenAI({ apiKey })
}

export const DEFAULT_MODEL = 'gemini-2.0-flash'

export interface AIAnalysisResult {
  title: string
  content: string
  summary: string
  severity: 'info' | 'warning' | 'positive' | 'critical'
}

export async function generateSessionInsight(
  apiKey: string,
  sessionData: {
    date: string
    testType: string
    players: Array<{
      name: string
      runs: number[]
      average: number
      best: number
      worst: number
      fatigueIndex: number
    }>
    teamAverage: number
  },
  model: string = DEFAULT_MODEL
): Promise<AIAnalysisResult> {
  const ai = createGeminiClient(apiKey)

  const prompt = `あなたはバスケットボールチームのフィットネスコーチAIアシスタントです。
以下のランニングセッションデータを分析し、日本語でインサイトを提供してください。

## セッション情報
- 日付: ${sessionData.date}
- テストタイプ: ${sessionData.testType}
- チーム平均: ${sessionData.teamAverage}

## 選手データ
${sessionData.players.map(p => `- ${p.name}: 平均=${p.average}, ベスト=${p.best}, ワースト=${p.worst}, 疲労指数=${p.fatigueIndex}, 本数=${p.runs.length}`).join('\n')}

以下の形式でJSON出力してください:
{
  "title": "セッション分析タイトル（簡潔に）",
  "content": "詳細な分析結果（改善点、注目選手、トレンドなど）",
  "summary": "1-2文の要約",
  "severity": "info|warning|positive|critical"
}`

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  })

  const text = response.text ?? '{}'
  return JSON.parse(text) as AIAnalysisResult
}

export async function chatWithAI(
  apiKey: string,
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  systemPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  const ai = createGeminiClient(apiKey)

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: systemPrompt,
    },
    history: messages.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  })

  const lastMessage = messages[messages.length - 1]
  const response = await chat.sendMessage({ message: lastMessage.content })

  return response.text ?? ''
}
