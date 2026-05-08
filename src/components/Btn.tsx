import { C } from '../styles/tokens'

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type BtnSize = 'sm' | 'md' | 'lg'

const sizes = {
  sm: { padding: '6px 14px',  fontSize: 12 },
  md: { padding: '10px 20px', fontSize: 14 },
  lg: { padding: '13px 28px', fontSize: 16 },
}

const variants: Record<BtnVariant, { bg: string; color: string; bd: string }> = {
  primary:   { bg: C.teal,        color: C.deep,  bd: 'none' },
  secondary: { bg: 'transparent', color: C.teal,  bd: `1.5px solid ${C.teal}` },
  ghost:     { bg: C.card,        color: C.fg2,   bd: `1px solid ${C.border}` },
  danger:    { bg: C.error,       color: '#fff',  bd: 'none' },
}

interface BtnProps {
  children: React.ReactNode
  variant?: BtnVariant
  size?: BtnSize
  style?: React.CSSProperties
  onClick?: () => void
  disabled?: boolean
}

export function Btn({ children, variant = 'primary', size = 'md', style = {}, onClick, disabled }: BtnProps) {
  const sz = sizes[size]
  const v = variants[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'inherit', fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 9999, ...sz,
        background: v.bg, color: v.color, border: v.bd,
        opacity: disabled ? 0.5 : 1, ...style,
      }}
    >
      {children}
    </button>
  )
}
