import { useMemo, useState } from 'react'
import { useBrokers } from './lib/useBrokers'
import { useAuth } from './lib/useAuth'
import { supabaseEnabled } from './lib/supabaseClient'
import { isDue, todayISO } from './lib/dates'
import DueBanner from './components/DueBanner'
import Filters from './components/Filters'
import BrokerList from './components/BrokerList'
import AddBrokerForm from './components/AddBrokerForm'
import Analytics from './components/Analytics'
import ExportImportBar from './components/ExportImportBar'
import AuthBar from './components/AuthBar'
import './App.css'

const DEFAULT_FILTERS = { status: 'all', method: 'all', dueOnly: false, search: '' }

const SYNC_LABELS = {
  local: supabaseEnabled ? 'Not signed in — saved to this browser only' : 'Saved to this browser only',
  syncing: 'Syncing…',
  synced: 'Synced to cloud',
  error: 'Sync error — your changes are still saved locally',
}

export default function App() {
  const auth = useAuth()
  const brokersState = useBrokers(auth.user?.id)
  const { brokers, addBroker, exportJSON, importJSON, dueCount, syncState, syncError } = brokersState
  const [tab, setTab] = useState('list')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const visibleBrokers = useMemo(() => {
    return brokers.filter((b) => {
      if (filters.status !== 'all' && b.status !== filters.status) return false
      if (filters.method !== 'all' && b.method !== filters.method) return false
      if (filters.dueOnly && !isDue(b.nextRecheckDate)) return false
      if (filters.search && !b.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [brokers, filters])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Data Broker Opt-Out Tracker</h1>
        <nav className="tabs">
          <button type="button" className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
            Brokers
          </button>
          <button type="button" className={tab === 'analytics' ? 'active' : ''} onClick={() => setTab('analytics')}>
            Analytics
          </button>
        </nav>
      </header>

      {supabaseEnabled && !auth.loading && <AuthBar auth={auth} />}

      <DueBanner
        dueCount={dueCount}
        onShowDue={() => {
          setTab('list')
          setFilters({ ...DEFAULT_FILTERS, dueOnly: true })
        }}
      />

      {tab === 'list' ? (
        <>
          <Filters filters={filters} onChange={setFilters} />
          <BrokerList brokers={visibleBrokers} actions={brokersState} />
          <AddBrokerForm onAdd={addBroker} />
        </>
      ) : (
        <Analytics brokers={brokers} />
      )}

      <footer className="app-footer">
        <ExportImportBar onExport={exportJSON} onImport={importJSON} />
        <p className="footer-note">
          {SYNC_LABELS[syncState]}
          {syncState === 'error' && syncError ? ` (${syncError})` : ''}. Export/Import is still available as a manual
          backup. Last loaded {todayISO()}.
        </p>
      </footer>
    </div>
  )
}
