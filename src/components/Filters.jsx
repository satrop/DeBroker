const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'not_checked', label: 'Not checked' },
  { value: 'not_found', label: 'Not found' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'confirmed_removed', label: 'Confirmed removed' },
  { value: 'reappeared', label: 'Reappeared' },
]

const METHOD_OPTIONS = [
  { value: 'all', label: 'All methods' },
  { value: 'form', label: 'Form' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
]

export default function Filters({ filters, onChange }) {
  return (
    <div className="filters">
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <select
        value={filters.method}
        onChange={(e) => onChange({ ...filters, method: e.target.value })}
      >
        {METHOD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label className="due-only">
        <input
          type="checkbox"
          checked={filters.dueOnly}
          onChange={(e) => onChange({ ...filters, dueOnly: e.target.checked })}
        />
        Due for recheck only
      </label>
      <input
        className="search"
        type="search"
        placeholder="Search brokers…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
    </div>
  )
}
