export default function StatusPill({ config, size = 'md' }) {
  const Icon = config.icon
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.color} ${padding}`}>
      {Icon ? <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2.25} /> : (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  )
}
