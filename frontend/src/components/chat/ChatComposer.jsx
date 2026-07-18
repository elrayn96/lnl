import { Send, X } from 'lucide-react'
import { useState } from 'react'
export default function ChatComposer({ onSend, disabled, reply, onCancelReply }) {
  const [text, setText] = useState('')
  const submit = (e) => { e.preventDefault(); if (!text.trim() || disabled) return; onSend(text.trim()); setText('') }
  return <form className="chat-composer glass-card" onSubmit={submit}>
    {reply && <div className="composer-reply"><span>A responder a <b>{reply.authorName}</b>: {reply.text.slice(0, 50)}</span><button type="button" onClick={onCancelReply}><X /></button></div>}
    <div><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={disabled ? 'A ligar à sala…' : 'Escreve uma pergunta…'} maxLength="600" rows="1" disabled={disabled} aria-label="Mensagem" /><span>{text.length}/600</span><button className="send-button" disabled={!text.trim() || disabled} aria-label="Enviar"><Send /></button></div>
  </form>
}
