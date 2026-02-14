export const ROUTES = {
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  OVERVIEW: '/overview',

  // Sessions
  SESSIONS: '/sessions',
  SESSION_NEW: '/sessions/new',
  SESSION_DETAIL: (id: string) => `/sessions/${id}`,

  // Data Entry
  ENTRY: '/entry',
  ENTRY_SINGLE: '/entry/single',
  ENTRY_BULK: '/entry/bulk',
  ENTRY_IMPORT: '/entry/import',
  ENTRY_QR: '/entry/qr',

  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_TEAM: '/analytics/team',
  ANALYTICS_PLAYER: (id: string) => `/analytics/player/${id}`,
  ANALYTICS_COMPARISON: '/analytics/comparison',
  ANALYTICS_TRENDS: '/analytics/trends',
  ANALYTICS_RANKINGS: '/analytics/rankings',

  // Goals
  GOALS: '/goals',
  GOAL_NEW: '/goals/new',
  GOAL_DETAIL: (id: string) => `/goals/${id}`,
  GOAL_SUGGESTIONS: '/goals/suggestions',

  // AI
  AI: '/ai',
  AI_CHAT: '/ai/chat',
  AI_REPORTS: '/ai/reports',

  // Gamification
  GAMIFICATION: '/gamification',
  LEADERBOARD: '/gamification/leaderboard',

  // Notifications
  NOTIFICATIONS: '/notifications',

  // Settings
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_MEMBERS: '/settings/members',
  SETTINGS_TEST_TYPES: '/settings/test-types',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
} as const
