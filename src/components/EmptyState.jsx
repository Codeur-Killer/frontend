export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line py-16 text-center">
      {Icon ? (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-2 text-muted">
          <Icon size={20} strokeWidth={1.75} />
        </div>
      ) : null}
      <div>
        <p className="font-medium text-ink">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
