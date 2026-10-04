import { useMemo } from 'react'
import { todayISO } from '../lib/dates'

function countEvent(history, event) {
  return history.filter((h) => h.event === event).length
}

export default function Analytics({ brokers }) {
  const stats = useMemo(() => {
    const today = todayISO()
    const totalFound = brokers.filter((b) => b.foundOnSearch).length
    const totalSubmitted = brokers.filter((b) => b.lastSubmittedDate).length
    const totalDue = brokers.filter((b) => b.nextRecheckDate && b.nextRecheckDate <= today).length

    const perBroker = brokers.map((b) => {
      const submitted = countEvent(b.history, 'submitted')
      const reappeared = countEvent(b.history, 'reappeared')
      const clean = countEvent(b.history, 'rechecked-clean')
      const rate = submitted > 0 ? reappeared / submitted : null
      return { id: b.id, name: b.name, submitted, reappeared, clean, rate }
    })

    const submittedCycles = perBroker.reduce((sum, p) => sum + p.submitted, 0)
    const reappearedCycles = perBroker.reduce((sum, p) => sum + p.reappeared, 0)
    const overallRate = submittedCycles > 0 ? reappearedCycles / submittedCycles : null

    return {
      totalFound,
      totalSubmitted,
      totalDue,
      overallRate,
      perBroker: perBroker
        .filter((p) => p.submitted > 0)
        .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1)),
    }
  }, [brokers])

  return (
    <div className="analytics">
      <div className="analytics-counts">
        <div className="stat-tile">
          <div className="stat-value">{stats.totalFound}</div>
          <div className="stat-label">Found on search</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.totalSubmitted}</div>
          <div className="stat-label">Opt-outs submitted</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.totalDue}</div>
          <div className="stat-label">Due for recheck now</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{stats.overallRate === null ? '—' : `${Math.round(stats.overallRate * 100)}%`}</div>
          <div className="stat-label">Overall reappearance rate</div>
        </div>
      </div>

      <h3>Per-broker persistence</h3>
      {stats.perBroker.length === 0 ? (
        <p className="empty-state">No opt-outs submitted yet — once you submit one, it'll show up here.</p>
      ) : (
        <table className="persistence-table">
          <thead>
            <tr>
              <th>Broker</th>
              <th>Submitted</th>
              <th>Reappeared</th>
              <th>Stayed clean</th>
              <th>Reappearance rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.perBroker.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.submitted}</td>
                <td>{p.reappeared}</td>
                <td>{p.clean}</td>
                <td>{p.rate === null ? '—' : `${Math.round(p.rate * 100)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
