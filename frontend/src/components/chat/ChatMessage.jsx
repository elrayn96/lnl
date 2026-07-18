import { Reply } from 'lucide-react'
import AnonymousAvatar from '../common/AnonymousAvatar'
export default function ChatMessage({ message, mine, onReply }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return <article className={`chat-message ${mine ? 'chat-message--mine' : ''}`}>
    {!mine && <AnonymousAvatar name={message.authorName} />}
    <div><span className="message-author">{mine ? 'Tu' : message.authorName}</span>
      <div className="message-bubble">{message.inReplyTo && <div className="reply-context"><b>{message.originalAuthorName}</b><span>{message.originalMessageSnippet}</span></div>}<p>{message.text}</p></div>
      <span className="message-meta">{time} · {message.type === 'answer' ? 'Resposta' : 'Pergunta'}</span>
      <button className="reply-link" onClick={() => onReply(message)}><Reply /> Responder</button>
    </div>
  </article>
}
