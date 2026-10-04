import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { formatDate, isDue, daysUntil } from '../lib/dates'

export default function BrokerRow({ broker, onSetFoundOnSearch, onSubmit, onRecheck, onUpdateNotes, onUpdateUrl, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(broker.notes)
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState(broker.optOutUrl)
  const [urlSaving, setUrlSaving] = useState(false)
  const [urlError, setUrlError] = useState('')
  const due = isDue(broker.nextRecheckDate)

  function saveNotes() {
    if (notes !== broker.notes) onUpdateNotes(broker.id, notes)
  }

  async function saveUrl(e) {
    e.preventDefault()
    setUrlSaving(true)
    setUrlError('')
    try {
      await onUpdateUrl(broker.id, urlDraft)
      setEditingUrl(false)
    } catch (err) {
      setUrlError(`Didn't save: ${err.message}`)
    } finally {
      setUrlSaving(false)
    }
  }

  return (
    <div className={`broker-row ${due ? 'is-due' : ''}`}>
      <div className="broker-row-main" onClick={() => setExpanded((v) => !v)}>
        <div className="broker-name">
          <a
            className="broker-link"
            href={broker.optOutUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
          >
            {broker.name} <span className="external-icon">↗</span>
          </a>
          <span className="method-tag">{broker.method}</span>
        </div>
        <StatusBadge status={broker.status} />
        <div className="recheck-date">
          {broker.nextRecheckDate
            ? due
              ? `Due ${formatDate(broker.nextRecheckDate)}`
              : `${daysUntil(broker.nextRecheckDate)} days`
            : 'Not applicable'}
        </div>
      </div>

      {expanded && (
        <div className="broker-row-detail">
          {editingUrl ? (
            <form className="edit-url-form" onSubmit={saveUrl}>
              <input
                type="url"
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="Opt-out URL"
              />
              <button type="submit" disabled={urlSaving}>
                {urlSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setUrlDraft(broker.optOutUrl); setUrlError(''); setEditingUrl(false) }}
              >
                Cancel
              </button>
              {urlError && <span className="auth-error">{urlError}</span>}
            </form>
          ) : (
            <button type="button" className="link-button edit-url-toggle" onClick={() => setEditingUrl(true)}>
              Edit opt-out link
            </button>
          )}

          <div className="workflow-actions">
            {broker.status === 'not_checked' && !broker.foundOnSearch && (
              <>
                <button type="button" onClick={() => onSetFoundOnSearch(broker.id, true)}>
                  Found on search
                </button>
                <button type="button" onClick={() => onSetFoundOnSearch(broker.id, false)}>
                  Checked — not found
                </button>
              </>
            )}

            {broker.status === 'not_found' && (
              <>
                <span className="workflow-note">Checked {formatDate(broker.history.at(-1)?.date)} — not listed</span>
                <button type="button" onClick={() => onSetFoundOnSearch(broker.id, true)}>
                  Actually, found it
                </button>
              </>
            )}

            {broker.foundOnSearch && broker.status !== 'submitted' && (
              <button type="button" onClick={() => onSubmit(broker.id)}>
                Mark submitted today
              </button>
            )}

            {broker.status === 'submitted' && (
              <>
                <button type="button" onClick={() => onRecheck(broker.id, 'clean')}>
                  Recheck: still gone
                </button>
                <button type="button" onClick={() => onRecheck(broker.id, 'reappeared')}>
                  Recheck: reappeared
                </button>
              </>
            )}

            {broker.status === 'confirmed_removed' && (
              <>
                <button type="button" onClick={() => onRecheck(broker.id, 'clean')}>
                  Recheck: still gone
                </button>
                <button type="button" onClick={() => onRecheck(broker.id, 'reappeared')}>
                  Recheck: reappeared
                </button>
              </>
            )}

            {broker.status === 'reappeared' && (
              <button type="button" onClick={() => onSubmit(broker.id)}>
                Resubmit today
              </button>
            )}

            <button type="button" className="danger" onClick={() => onRemove(broker.id)}>
              Remove broker
            </button>
          </div>

          <textarea
            className="notes-field"
            placeholder="Notes — quirks, requirements, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
          />

          {broker.history.length > 0 && (
            <ul className="history-list">
              {broker.history
                .slice()
                .reverse()
                .map((h, i) => (
                  <li key={i}>
                    {formatDate(h.date)} — {h.event}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
