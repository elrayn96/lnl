export default function LoadingState({ label = 'A carregar…', compact = false }) {
  return <div className={`state-view ${compact ? 'state-view--compact' : ''}`} role="status"><span className="loader" /><p>{label}</p></div>
}
