const STORAGE_KEY = 'debroker.brokers.v1'

export function loadBrokers(seed) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return seed
    return parsed
  } catch {
    return seed
  }
}

export function saveBrokers(brokers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brokers))
  } catch {
    // localStorage unavailable (private mode, quota, etc) — data stays in-memory for this session
  }
}

export function exportBrokersFile(brokers) {
  const blob = new Blob([JSON.stringify(brokers, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `debroker-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseImportedBrokers(text) {
  const parsed = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of brokers')
  return parsed
}
