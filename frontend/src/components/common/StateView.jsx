import { CircleAlert, Inbox } from 'lucide-react'
export default function StateView({ tone = 'empty', title, message, action }) {
  const Icon = tone === 'error' ? CircleAlert : Inbox
  return <div className={`state-view state-view--${tone}`}><Icon /><h2>{title}</h2><p>{message}</p>{action}</div>
}
