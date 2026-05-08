import { C } from '../styles/tokens'

type BadgeVariant =
  | 'teal' | 'green' | 'red' | 'yellow' | 'gray'
  | 'baseball' | 'soccer' | 'basketball'

const variantStyles: Record<BadgeVariant, { bg: string; color: string; bd: string }> = {
  teal:       { bg: 'rgba(93,187,160,0.15)',  color: C.teal,    bd: 'rgba(93,187,160,0.3)' },
  green:      { bg: 'rgba(62,207,142,0.12)',  color: C.success, bd: 'rgba(62,207,142,0.25)' },
  red:        { bg: 'rgba(239,68,68,0.12)',   color: C.error,   bd: 'rgba(239,68,68,0.25)' },
  yellow:     { bg: 'rgba(245,158,11,0.12)',  color: C.warning, bd: 'rgba(245,158,11,0.25)' },
  gray:       { bg: C.elevated,               color: C.fg3,     bd: C.border },
  baseball:   { bg: 'rgba(232,0,61,0.15)',    color: '#ff8fa3', bd: 'rgba(232,0,61,0.3)' },
  soccer:     { bg: 'rgba(27,107,58,0.2)',    color: '#4ade80', bd: 'rgba(27,107,58,0.4)' },
  basketball: { bg: 'rgba(249,115,22,0.15)',  color: '#fdba74', bd: 'rgba(249,115,22,0.3)' },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: React.CSSProperties
}

export function Badge({ children, variant = 'teal', style = {} }: BadgeProps) {
  const v = variantStyles[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      background: v.bg, color: v.color, border: `1px solid ${v.bd}`, ...style,
    }}>
      {children}
    </span>
  )
}
