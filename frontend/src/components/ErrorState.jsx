export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state-block error-state">
      <div className="state-icon">⚠️</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
