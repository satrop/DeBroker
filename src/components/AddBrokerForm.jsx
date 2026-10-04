import { useState } from 'react'

const EMPTY = { name: '', optOutUrl: '', method: 'form', notes: '' }

export default function AddBrokerForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd(form)
    setForm(EMPTY)
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" className="add-broker-toggle" onClick={() => setOpen(true)}>
        + Add custom broker
      </button>
    )
  }

  return (
    <form className="add-broker-form" onSubmit={submit}>
      <input
        placeholder="Broker name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        placeholder="Opt-out URL"
        type="url"
        value={form.optOutUrl}
        onChange={(e) => setForm({ ...form, optOutUrl: e.target.value })}
      />
      <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
        <option value="form">Form</option>
        <option value="email">Email</option>
        <option value="phone">Phone</option>
      </select>
      <input
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <div className="add-broker-form-actions">
        <button type="submit">Add</button>
        <button type="button" onClick={() => { setOpen(false); setForm(EMPTY) }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
