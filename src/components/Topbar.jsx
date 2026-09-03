import { Link } from 'react-router-dom'
import { BellRing } from 'lucide-react'

export default function Topbar({ breadcrumb = [], alertHref, alertCount }) {
  return (
    <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-6">
      <div className="flex items-center gap-1.5 text-sm text-muted">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 ? <span className="text-line">/</span> : null}
            <span className={i === breadcrumb.length - 1 ? 'font-medium text-ink' : ''}>{crumb}</span>
          </span>
        ))}
      </div>

      {alertHref ? (
        <Link
          to={alertHref}
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-paper-2 hover:text-ink"
          title="Alertes stock"
        >
          <BellRing size={18} />
          {alertCount ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] font-semibold text-white">
              {alertCount}
            </span>
          ) : null}
        </Link>
      ) : (
        <span />
      )}
    </header>
  )
}
