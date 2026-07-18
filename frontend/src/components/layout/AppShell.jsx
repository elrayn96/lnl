import { Home, History, MessageCircleQuestion, Settings, Video } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import PermanentAdSlot from '../ads/PermanentAdSlot'

const links = [
  ['/', Home, 'Início'], ['/rooms', MessageCircleQuestion, 'Salas'],
  ['/video', Video, 'Vídeo'], ['/activity', History, 'Actividade'], ['/settings', Settings, 'Definições'],
]
export default function AppShell({ children }) {
  const { pathname } = useLocation()
  const video = pathname === '/video'
  return <div className={`app-shell ${video ? 'app-shell--video' : ''}`}>
    <header className="desktop-nav glass-card">
      <NavLink to="/" className="brand"><span>Link</span>&Live<i /></NavLink>
      <nav>{links.map(([to, Icon, label]) => <NavLink key={to} to={to} end={to === '/'}><Icon />{label}</NavLink>)}</nav>
      <span className="live-pill"><i /> Ao vivo</span>
    </header>
    <main>{children}</main>
    <PermanentAdSlot />
    <nav className="mobile-nav glass-card" aria-label="Navegação principal">
      {links.map(([to, Icon, label]) => <NavLink key={to} to={to} end={to === '/'}><Icon /><span>{label}</span></NavLink>)}
    </nav>
  </div>
}
