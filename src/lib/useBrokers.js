import { useEffect, useMemo, useState } from 'react'
import seedData from '../data/brokers.seed.json'
import { loadBrokers, saveBrokers, exportBrokersFile, parseImportedBrokers } from './storage'
import { addDaysISO, todayISO, RECHECK_DAYS } from './dates'

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

export function useBrokers() {
  const [brokers, setBrokers] = useState(() => loadBrokers(seedData.map(normalize)))

  useEffect(() => {
    saveBrokers(brokers)
  }, [brokers])

  function updateBroker(id, patch) {
    setBrokers((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function addHistory(broker, event) {
    return [...broker.history, { date: todayISO(), event }]
  }

  function setFoundOnSearch(id, found) {
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        if (found) {
          return { ...b, foundOnSearch: true, status: b.status === 'not_checked' ? 'not_checked' : b.status }
        }
        return { ...b, foundOnSearch: false, status: 'not_found' }
      }),
    )
  }

  function submitOptOut(id) {
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const today = todayISO()
        return {
          ...b,
          status: 'submitted',
          lastSubmittedDate: today,
          nextRecheckDate: addDaysISO(today, RECHECK_DAYS),
          history: addHistory(b, 'submitted'),
        }
      }),
    )
  }

  function logRecheck(id, result) {
    setBrokers((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        const today = todayISO()
        if (result === 'reappeared') {
          return {
            ...b,
            status: 'reappeared',
            nextRecheckDate: null,
            history: addHistory(b, 'reappeared'),
          }
        }
        return {
          ...b,
          status: 'confirmed_removed',
          nextRecheckDate: addDaysISO(today, RECHECK_DAYS),
          history: addHistory(b, 'rechecked-clean'),
        }
      }),
    )
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
  }

  function removeBroker(id) {
    setBrokers((prev) => prev.filter((b) => b.id !== id))
  }

  function exportJSON() {
    exportBrokersFile(brokers)
  }

  function importJSON(text) {
    const imported = parseImportedBrokers(text).map(normalize)
    setBrokers(imported)
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
  }
}
