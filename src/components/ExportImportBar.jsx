import { useRef, useState } from 'react'

export default function ExportImportBar({ onExport, onImport }) {
  const fileInput = useRef(null)
  const [error, setError] = useState('')

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        onImport(reader.result)
        setError('')
      } catch {
        setError('Could not import that file — expected a JSON export from this app.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="export-import-bar">
      <button type="button" onClick={onExport}>
        Export JSON
      </button>
      <button type="button" onClick={() => fileInput.current?.click()}>
        Import JSON
      </button>
      <input ref={fileInput} type="file" accept="application/json" hidden onChange={handleFile} />
      {error && <span className="import-error">{error}</span>}
    </div>
  )
}
