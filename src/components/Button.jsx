const variants = {
  primary: 'bg-ink text-white hover:bg-ink-2 border border-ink',
  gold: 'bg-gold text-white hover:bg-gold-2 border border-gold',
  secondary: 'bg-surface text-ink border border-line hover:border-ink/40',
  ghost: 'bg-transparent text-ink hover:bg-paper-2 border border-transparent',
  danger: 'bg-surface text-danger border border-danger/30 hover:bg-danger-bg',
}

const sizes = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-4 py-2.5 text-[0.95rem]',
}

export default function Button({ variant = 'secondary', size = 'md', icon: Icon, className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={16} strokeWidth={2} /> : null}
      {children}
    </button>
  )
}
