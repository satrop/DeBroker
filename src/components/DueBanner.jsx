export default function DueBanner({ dueCount, onShowDue }) {
  if (dueCount === 0) return null
  return (
    <div className="due-banner">
      <span>
        {dueCount} broker{dueCount === 1 ? '' : 's'} due for recheck
      </span>
      <button type="button" onClick={onShowDue}>
        Show them
      </button>
    </div>
  )
}
