import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const base = process.argv[2] || 'http://localhost:8092'
async function call(path, options = {}, cookie = '') {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status} ${await response.text()}`)
  return {
    body: await response.json(),
    cookie: response.headers.get('set-cookie')?.split(';')[0] || cookie,
  }
}
function subscribe(roomUuid) {
  return new Promise((resolve, reject) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${base}/ws`),
      reconnectDelay: 0,
      connectionTimeout: 10000,
      onStompError: (frame) => reject(new Error(frame.headers.message)),
      onConnect: () => {
        client.subscribe(`/topic/room/${roomUuid}/messages`, (frame) => {
          resolve({ client, message: JSON.parse(frame.body) })
        })
      },
    })
    client.activate()
  })
}

const created = await call('/api/rooms', {
  method: 'POST',
  body: JSON.stringify({ title: 'Room sync test', duration: '15min', mode: 'text', isPublic: true }),
})
const visitor = await call('/api/users/anonymous')
const ownerMessage = subscribe(created.body.uuid)
const visitorMessage = subscribe(created.body.uuid)
await new Promise((resolve) => setTimeout(resolve, 400))
await call(`/api/rooms/${created.body.uuid}/messages`, {
  method: 'POST',
  body: JSON.stringify({ text: 'Mensagem sincronizada', inReplyTo: null }),
}, visitor.cookie)
const [ownerReceived, visitorReceived] = await Promise.all([ownerMessage, visitorMessage])
console.log(JSON.stringify({
  ownerReceived: ownerReceived.message.text,
  visitorReceived: visitorReceived.message.text,
}))
await Promise.all([ownerReceived.client.deactivate(), visitorReceived.client.deactivate()])
