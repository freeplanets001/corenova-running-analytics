import { format, parseISO, isValid } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatDate(date: string | Date, pattern: string = 'yyyy/MM/dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '---'
  return format(d, pattern, { locale: ja })
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'M/d')
}

export function formatDateFull(date: string | Date): string {
  return formatDate(date, 'yyyy年M月d日')
}

export function formatDateWithDay(date: string | Date): string {
  return formatDate(date, 'M/d (E)', )
}

export function formatValue(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '---'
  return value.toFixed(decimals)
}

export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '---'
  return `${value.toFixed(decimals)}%`
}

export function formatChange(value: number, decimals: number = 1): string {
  if (value === 0) return '±0'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}`
}

export function formatRank(rank: number): string {
  return `${rank}位`
}

export function formatUnit(value: number, unit: string, decimals: number = 1): string {
  return `${value.toFixed(decimals)}${unit}`
}
