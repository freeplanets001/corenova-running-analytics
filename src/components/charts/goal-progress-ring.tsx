'use client'

interface GoalProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}

export function GoalProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
}: GoalProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference

  const color =
    progress >= 100 ? '#F59E0B' :
    progress >= 70 ? '#10B981' :
    progress >= 30 ? '#FBBF24' :
    '#EF4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {Math.round(progress)}%
        </span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}
