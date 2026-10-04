const LABELS = {
  not_checked: 'Not checked',
  not_found: 'Not found',
  submitted: 'Submitted',
  confirmed_removed: 'Confirmed removed',
  reappeared: 'Reappeared',
}

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>
}
