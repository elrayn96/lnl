import { ArrowLeft, Clock3, Share2, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { roomApi } from '../api/roomApi'
import ChatComposer from '../components/chat/ChatComposer'
import ChatMessage from '../components/chat/ChatMessage'
import LoadingState from '../components/common/LoadingState'
import StateView from '../components/common/StateView'
import { useToast } from '../contexts/ToastContext'
import { useRoomSocket } from '../hooks/useRoomSocket'

export default function RoomPage() {
  const { uuid } = useParams()
  const [room, setRoom] = useState(null)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)
  const [reply, setReply] = useState(null)
  const endRef = useRef(null)
  const toast = useToast()
  useEffect(() => { Promise.all([roomApi.get(uuid), roomApi.initUser()]).then(([r,u]) => { setRoom(r); setMessages(r.messages); setUser(u) }).catch(setError) }, [uuid])
  const addMessage = (message) => setMessages((items) => items.some((x) => x.id === message.id && x.type === message.type) ? items : [...items, message])
  const { status } = useRoomSocket(uuid, user, addMessage)
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])
  const submit = async (text) => {
    try {
      const message = await roomApi.sendMessage(uuid, {
        text,
        inReplyTo: reply?.type === 'question' ? reply.id : reply?.inReplyTo || null,
      })
      addMessage(message)
      setReply(null)
    } catch (e) {
      toast.show(e.message, 'error')
    }
  }
  const share = async () => { const url = location.href; if (navigator.share) await navigator.share({ title: room.title, url }); else { await navigator.clipboard.writeText(url); toast.show('Link copiado.') } }
  if (error) return <div className="page"><StateView tone="error" title="Sala indisponível" message={error.status === 410 ? 'Esta sala já expirou.' : 'Não encontrámos esta sala.'} action={<Link className="button button--soft" to="/rooms">Voltar às salas</Link>} /></div>
  if (!room || !user) return <LoadingState label="A abrir a sala…" />
  const remaining = Math.max(0, Math.ceil((new Date(room.expiresAt) - Date.now()) / 60000))
  return <div className="room-page">
    <header className="room-header glass-card"><Link to="/rooms" aria-label="Sair"><ArrowLeft /></Link><div><span className="room-status"><i /> Sala activa</span><h1>{room.title}</h1><p>por {room.ownerName}</p></div><div className="room-facts"><span><Clock3 /> {remaining} min</span><span><Users /> Até {room.maxVisitors}</span></div><button onClick={share}><Share2 /> <span>Partilhar</span></button></header>
    <div className={`socket-status socket-status--${status}`}>{status === 'connected' ? 'Ligado em tempo real' : status === 'reconnecting' ? 'A restabelecer ligação…' : 'A ligar…'}</div>
    <section className="message-list" aria-live="polite">
      {messages.length === 0 ? <StateView title="Ainda está tudo em silêncio" message="Sê a primeira pessoa a deixar uma pergunta." /> : messages.map((message) => <ChatMessage key={`${message.type}-${message.id}`} message={message} mine={message.authorUuid === user.uuid} onReply={setReply} />)}
      <div ref={endRef} />
    </section>
    <ChatComposer onSend={submit} disabled={!room || !user} reply={reply} onCancelReply={() => setReply(null)} />
  </div>
}
