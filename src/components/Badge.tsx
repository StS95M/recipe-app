'use client'

const colors: Record<string, { background: string; color: string }> = {
  sage:       { background: '#d4e6d0', color: '#2d5a27' },
  terracotta: { background: '#f5e6dc', color: '#8b3a1a' },
  cream:      { background: '#f5f0e8', color: '#6b5c3e' },
  slate:      { background: '#e2e8f0', color: '#334155' },
}

export default function Badge({ children, color = 'cream' }: { children: React.ReactNode; color?: string }) {
  const s = colors[color] ?? colors.cream
  return (
    <span style={{
      ...s,
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
    </span>
  )
}
