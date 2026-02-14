import { z } from 'zod'

export const createGoalSchema = z.object({
  team_id: z.string().uuid(),
  scope: z.enum(['personal', 'team', 'individual_target']),
  metric: z.enum(['average_value', 'best_value', 'consistency', 'run_count', 'improvement_rate', 'attendance']),
  test_type_id: z.string().uuid().optional().nullable(),
  player_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, '目標タイトルを入力してください').max(200),
  description: z.string().max(2000).optional(),
  target_value: z.number(),
  baseline_value: z.number().optional(),
  unit: z.string().default('秒'),
  direction: z.enum(['increase', 'decrease']),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付形式が不正です'),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
