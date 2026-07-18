import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import crypto from 'node:crypto'

const base = process.argv[2] || 'http://localhost:8092'

function connectClient(name) {
  return new Promise((resolve, reject) => {
    const token = crypto.randomUUID()
    const client = new Client({
      webSocketFactory: () => new SockJS(`${base}/ws`),
      connectionTimeout: 10000,
      reconnectDelay: 0,
      onStompError: (frame) => reject(new Error(`${name}: ${frame.headers.message}`)),
      onWebSocketError: () => reject(new Error(`${name}: websocket error`)),
      onConnect: () => {
        const registration = client.subscribe(`/topic/video/register/${token}`, (frame) => {
          registration.unsubscribe()
          const { sessionId } = JSON.parse(frame.body)
          client.subscribe(`/topic/pair/${sessionId}`, (pairFrame) => {
            resolve({ client, sessionId, pair: JSON.parse(pairFrame.body) })
          })
          client.publish({ destination: '/app/video.join', body: '' })
        })
        setTimeout(() => {
          client.publish({
            destination: '/app/video.register',
            body: JSON.stringify({ clientToken: token }),
          })
        }, 100)
      },
    })
    client.activate()
  })
}

const [first, second] = await Promise.all([connectClient('first'), connectClient('second')])
console.log(JSON.stringify({
  first: { sessionId: first.sessionId, pair: first.pair },
  second: { sessionId: second.sessionId, pair: second.pair },
}))
await Promise.all([first.client.deactivate(), second.client.deactivate()])
