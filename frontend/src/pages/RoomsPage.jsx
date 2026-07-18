import { ArrowRight, Link2, MessageCircleQuestion, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/common/GlassCard'
export default function RoomsPage() {
  return <div className="page narrow-page"><div className="page-heading"><span className="eyebrow">Q&A ANÓNIMO</span><h1>A tua sala, as perguntas deles.</h1><p>Escolhe como queres começar.</p></div>
    <div className="choice-grid">
      <GlassCard><Plus /><h2>Criar uma sala</h2><p>Define um tema, escolhe a duração e partilha o link.</p><Link className="button button--primary" to="/rooms/create">Criar agora <ArrowRight /></Link></GlassCard>
      <GlassCard><Link2 /><h2>Entrar com link</h2><p>Recebeste um convite? Cola o link ou o código da sala.</p><Link className="button button--soft" to="/rooms/join">Entrar numa sala</Link></GlassCard>
    </div>
    <div className="privacy-note"><MessageCircleQuestion /><span><b>Identidade protegida</b> — cada participante recebe um nome temporário.</span></div>
  </div>
}
