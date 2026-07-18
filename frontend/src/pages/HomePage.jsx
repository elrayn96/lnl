import { ArrowRight, MessageCircleQuestion, ShieldCheck, Sparkles, Video, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/common/GlassCard'

export default function HomePage() {
  return <div className="page home-page">
    <section className="hero">
      <div className="hero__copy">
        <span className="eyebrow"><Sparkles /> Conversas reais, sem complicações</span>
        <h1>Uma ligação pode começar com <em>uma pergunta.</em></h1>
        <p>Cria uma sala anónima para ouvir o que todos pensam ou conhece alguém novo numa conversa em vídeo.</p>
        <div className="hero__actions">
          <Link className="button button--primary" to="/video"><Video /> Começar vídeo <ArrowRight /></Link>
          <Link className="button button--soft" to="/rooms/create"><MessageCircleQuestion /> Criar sala Q&A</Link>
        </div>
        <div className="trust-row"><span><ShieldCheck /> Privado</span><span><Zap /> Instantâneo</span><span><i /> Pessoas online</span></div>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="orbit orbit--one" /><div className="orbit orbit--two" />
        <GlassCard className="visual-card visual-card--video"><div className="portrait portrait--one"><span>Olá! 👋</span></div><small><i /> Ligação estabelecida</small></GlassCard>
        <GlassCard className="visual-card visual-card--question"><b>anónimo</b><p>Qual foi a melhor parte do teu dia?</p><span>12 respostas</span></GlassCard>
      </div>
    </section>
    <section className="mode-grid">
      <GlassCard><span className="feature-icon feature-icon--purple"><MessageCircleQuestion /></span><p className="overline">PARTILHA</p><h2>Q&A anónimo</h2><p>Cria o teu link, partilha e recebe perguntas honestas em tempo real.</p><Link to="/rooms">Explorar salas <ArrowRight /></Link></GlassCard>
      <GlassCard><span className="feature-icon feature-icon--pink"><Video /></span><p className="overline">CONECTA</p><h2>Vídeo aleatório</h2><p>Um encontro de cada vez. Sem perfis longos, apenas uma conversa.</p><Link to="/video">Encontrar alguém <ArrowRight /></Link></GlassCard>
    </section>
  </div>
}
