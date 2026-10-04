export const RECHECK_DAYS = 90

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function addDaysISO(isoDate, days) {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function isDue(isoDate) {
  if (!isoDate) return false
  return isoDate <= todayISO()
}

export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
