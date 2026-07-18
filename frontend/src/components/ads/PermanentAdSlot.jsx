import { useEffect, useState } from 'react'

export default function PermanentAdSlot() {
  const [state, setState] = useState('loading')
  useEffect(() => {
    const timer = setTimeout(() => setState('empty'), 700)
    return () => clearTimeout(timer)
  }, [])
  return <aside className="permanent-ad" aria-label="Publicidade">
    <span className="ad-label">Publicidade</span>
    {state === 'loading' ? <span className="ad-shimmer" /> : <span className="ad-fallback">Espaço publicitário reservado</span>}
  </aside>
}
