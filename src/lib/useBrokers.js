import { useEffect, useMemo, useRef, useState } from 'react'
import seedData from '../data/brokers.seed.json'
import { loadBrokers, saveBrokers, exportBrokersFile, parseImportedBrokers } from './storage'
import { addDaysISO, todayISO, RECHECK_DAYS } from './dates'
import { supabaseEnabled } from './supabaseClient'
import { fetchRemoteBrokers, upsertRemoteBroker, deleteRemoteBroker, replaceAllRemoteBrokers } from './brokersRemote'

function normalize(broker) {
  return {
    foundOnSearch: false,
    status: 'not_checked',
    lastSubmittedDate: null,
    nextRecheckDate: null,
    history: [],
    notes: '',
    ...broker,
  }
}

function slugify(name) {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base}-${Math.random().toString(36).slice(2, 6)}`
}

export function useBrokers(userId) {
  const [brokers, setBrokers] = useState(() => loadBrokers(seedData.map(normalize)))
  const [syncState, setSyncState] = useState('local') // 'local' | 'syncing' | 'synced' | 'error'
  const [syncError, setSyncError] = useState('')
  const hasHydratedForUser = useRef(null)

  useEffect(() => {
    saveBrokers(brokers)
  }, [brokers])

  // On sign-in, pull the cloud copy. If the cloud has nothing yet, seed it
  // with whatever's currently in this browser (first-time migration).
  useEffect(() => {
    if (!supabaseEnabled || !userId || hasHydratedForUser.current === userId) return
    hasHydratedForUser.current = userId
    setSyncState('syncing')
    setSyncError('')
    ;(async () => {
      try {
        const remote = await fetchRemoteBrokers(userId)
        if (remote.length === 0) {
          await replaceAllRemoteBrokers(userId, brokers)
        } else {
          setBrokers(remote)
        }
        setSyncState('synced')
      } catch (err) {
        setSyncState('error')
        setSyncError(err.message)
      }
    })()
    // brokers intentionally excluded: this runs once per sign-in to decide
    // between "pull from cloud" and "push current browser state up"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (!userId) hasHydratedForUser.current = null
  }, [userId])

  function remoteUpsert(broker) {
    if (!supabaseEnabled || !userId) return Promise.resolve()
    return upsertRemoteBroker(userId, broker)
      .then(() => setSyncState('synced'))
      .catch((err) => {
        setSyncState('error')
        setSyncError(err.message)
        throw err
      })
  }

  function remoteDelete(id) {
    if (!supabaseEnabled || !userId) return
    deleteRemoteBroker(userId, id)
      .then(() => setSyncState('synced'))
      .catch((err) => {
        setSyncState('error')
        setSyncError(err.message)
      })
  }

  function addHistory(broker, event) {
    return [...broker.history, { date: todayISO(), event }]
  }

  function setFoundOnSearch(id, found) {
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const updated = found
          ? { ...b, foundOnSearch: true, status: b.status === 'not_found' ? 'not_checked' : b.status }
          : { ...b, foundOnSearch: false, status: 'not_found', history: addHistory(b, 'checked-not-found') }
        remoteUpsert(updated)
        return updated
      }),
    )
  }

  function submitOptOut(id) {
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const today = todayISO()
        const updated = {
          ...b,
          status: 'submitted',
          lastSubmittedDate: today,
          nextRecheckDate: addDaysISO(today, RECHECK_DAYS),
          history: addHistory(b, 'submitted'),
        }
        remoteUpsert(updated)
        return updated
      }),
    )
  }

  function logRecheck(id, result) {
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const today = todayISO()
        const updated =
          result === 'reappeared'
            ? { ...b, status: 'reappeared', nextRecheckDate: null, history: addHistory(b, 'reappeared') }
            : {
                ...b,
                status: 'confirmed_removed',
                nextRecheckDate: addDaysISO(today, RECHECK_DAYS),
                history: addHistory(b, 'rechecked-clean'),
              }
        remoteUpsert(updated)
        return updated
      }),
    )
  }

  function updateBroker(id, patch) {
    let pending = Promise.resolve()
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const updated = { ...b, ...patch }
        pending = remoteUpsert(updated)
        return updated
      }),
    )
    return pending
  }

  function addBroker({ name, optOutUrl, method, notes }) {
    const newBroker = normalize({
      id: slugify(name || 'broker'),
      name,
      optOutUrl,
      method,
      notes: notes || '',
    })
    setBrokers((prev) => [...prev, newBroker])
    remoteUpsert(newBroker)
  }

  function removeBroker(id) {
    setBrokers((prev) => prev.filter((b) => b.id !== id))
    remoteDelete(id)
  }

  function exportJSON() {
    exportBrokersFile(brokers)
  }

  function importJSON(text) {
    const imported = parseImportedBrokers(text).map(normalize)
    setBrokers(imported)
    if (supabaseEnabled && userId) {
      setSyncState('syncing')
      replaceAllRemoteBrokers(userId, imported)
        .then(() => setSyncState('synced'))
        .catch((err) => {
          setSyncState('error')
          setSyncError(err.message)
        })
    }
  }

  const dueCount = useMemo(
    () => brokers.filter((b) => b.nextRecheckDate && b.nextRecheckDate <= todayISO()).length,
    [brokers],
  )

  return {
    brokers,
    updateBroker,
    setFoundOnSearch,
    submitOptOut,
    logRecheck,
    addBroker,
    removeBroker,
    exportJSON,
    importJSON,
    dueCount,
    syncState,
    syncError,
  }
}
