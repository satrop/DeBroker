import { useState } from 'react'
import StatusBadge from './StatusBadge'
import { formatDate, isDue } from '../lib/dates'

export default function BrokerRow({ broker, onSetFoundOnSearch, onSubmit, onRecheck, onUpdateNotes, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(broker.notes)
  const due = isDue(broker.nextRecheckDate)

  function saveNotes() {
    if (notes !== broker.notes) onUpdateNotes(broker.id, notes)
  }

  return (
    <div className={`broker-row ${due ? 'is-due' : ''}`}>
      <div className="broker-row-main" onClick={() => setExpanded((v) => !v)}>
        <div className="broker-name">
          <a href={broker.optOutUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
            {broker.name}
          </a>
          <span className="method-tag">{broker.method}</span>
        </div>
        <StatusBadge status={broker.status} />
        <div className="recheck-date">
          {broker.nextRecheckDate ? (due ? `Due ${formatDate(broker.nextRecheckDate)}` : formatDate(broker.nextRecheckDate)) : 'Not applicable'}
        </div>
      </div>

      {expanded && (
        <div className="broker-row-detail">
          <div className="workflow-actions">
            <label>
              <input
                type="checkbox"
                checked={broker.foundOnSearch}
                onChange={(e) => onSetFoundOnSearch(broker.id, e.target.checked)}
              />
              Found on search
            </label>

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
