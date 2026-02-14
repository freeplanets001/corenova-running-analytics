import type { UserRole } from '@/types'

export interface Permission {
  viewTeamDashboard: boolean
  viewAllPlayerDetails: boolean
  viewOwnPlayerDetails: boolean
  createSession: boolean
  manageTestTypes: boolean
  enterDataForAll: boolean
  enterDataForSelf: boolean
  bulkEntry: boolean
  excelImport: boolean
  editDeleteData: boolean
  editOwnData: boolean
  viewTeamInsights: boolean
  viewAllPlayerInsights: boolean
  viewOwnInsights: boolean
  aiChat: boolean
  aiChatFullContext: boolean
  generateAIReports: boolean
  setTeamGoals: boolean
  setPersonalGoals: boolean
  setIndividualTargets: boolean
  manageUsers: boolean
  exportAll: boolean
  exportOwn: boolean
}

export function hasPermission(role: UserRole | null, permission: keyof Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.[permission] ?? false
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    viewTeamDashboard: true,
    viewAllPlayerDetails: true,
    viewOwnPlayerDetails: true,
    createSession: true,
    manageTestTypes: true,
    enterDataForAll: true,
    enterDataForSelf: true,
    bulkEntry: true,
    excelImport: true,
    editDeleteData: true,
    editOwnData: true,
    viewTeamInsights: true,
    viewAllPlayerInsights: true,
    viewOwnInsights: true,
    aiChat: true,
    aiChatFullContext: true,
    generateAIReports: true,
    setTeamGoals: true,
    setPersonalGoals: false,
    setIndividualTargets: true,
    manageUsers: true,
    exportAll: true,
    exportOwn: true,
  },
  player: {
    viewTeamDashboard: true,
    viewAllPlayerDetails: false,
    viewOwnPlayerDetails: true,
    createSession: false,
    manageTestTypes: false,
    enterDataForAll: false,
    enterDataForSelf: true,
    bulkEntry: false,
    excelImport: false,
    editDeleteData: false,
    editOwnData: true,
    viewTeamInsights: true,
    viewAllPlayerInsights: false,
    viewOwnInsights: true,
    aiChat: true,
    aiChatFullContext: false,
    generateAIReports: false,
    setTeamGoals: false,
    setPersonalGoals: true,
    setIndividualTargets: false,
    manageUsers: false,
    exportAll: false,
    exportOwn: true,
  },
  viewer: {
    viewTeamDashboard: true,
    viewAllPlayerDetails: false,
    viewOwnPlayerDetails: false,
    createSession: false,
    manageTestTypes: false,
    enterDataForAll: false,
    enterDataForSelf: false,
    bulkEntry: false,
    excelImport: false,
    editDeleteData: false,
    editOwnData: false,
    viewTeamInsights: true,
    viewAllPlayerInsights: false,
    viewOwnInsights: false,
    aiChat: false,
    aiChatFullContext: false,
    generateAIReports: false,
    setTeamGoals: false,
    setPersonalGoals: false,
    setIndividualTargets: false,
    manageUsers: false,
    exportAll: false,
    exportOwn: false,
  },
}
