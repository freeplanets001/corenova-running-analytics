import { z } from 'zod'

export const createSessionSchema = z.object({
  team_id: z.string().uuid(),
  test_type_id: z.string().uuid(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付形式が不正です'),
  target_run_count: z.number().int().min(1).max(12).optional(),
  location: z.string().max(200).optional(),
  weather: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

export const sessionRunSchema = z.object({
  session_id: z.string().uuid(),
  player_id: z.string().uuid(),
  run_number: z.number().int().min(1).max(12),
  value: z.number().positive('値は正の数である必要があります'),
})

export const bulkRunsSchema = z.object({
  session_id: z.string().uuid(),
  runs: z.array(
    z.object({
      player_id: z.string().uuid(),
      values: z.array(z.number().positive()).min(1).max(12),
    })
  ),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type SessionRunInput = z.infer<typeof sessionRunSchema>
export type BulkRunsInput = z.infer<typeof bulkRunsSchema>
