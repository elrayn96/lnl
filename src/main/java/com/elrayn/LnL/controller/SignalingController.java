package com.elrayn.LnL.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    private static final ConcurrentLinkedQueue<String> waitingSessions = new ConcurrentLinkedQueue<>();
    private static final ConcurrentHashMap<String, String> peers = new ConcurrentHashMap<>();

    @MessageMapping("/video.join")
    public void join(Message<?> message) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(message);
        String sessionId = accessor.getSessionId();
        if (sessionId == null || peers.containsKey(sessionId))
            return;

        peers.put(sessionId, "waiting");
        waitingSessions.add(sessionId);
        tryMatch();
    }

    private void tryMatch() {
        while (waitingSessions.size() >= 2) {
            String a = waitingSessions.poll();
            String b = waitingSessions.poll();

            if (a == null || b == null || a.equals(b)) {
                if (a != null)
                    waitingSessions.add(a);
                continue;
            }

            if (!"waiting".equals(peers.get(a)) || !"waiting".equals(peers.get(b)))
                continue;

            peers.put(a, b);
            peers.put(b, a);

            Map<String, Object> forA = new HashMap<>();
            forA.put("peer", b);
            forA.put("initiator", true);

            Map<String, Object> forB = new HashMap<>();
            forB.put("peer", a);
            forB.put("initiator", false);

            messagingTemplate.convertAndSend("/topic/match/" + a, forA);
            messagingTemplate.convertAndSend("/topic/match/" + b, forB);
            return;
        }
    }

    @MessageMapping("/video.signal")
    public void signal(Message<SignalMessage> message) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(message);
        String sender = accessor.getSessionId();
        SignalMessage payload = message.getPayload();

        if (sender == null || payload == null)
            return;
        String receiver = peers.get(sender);
        if (receiver != null && !"waiting".equals(receiver)) {
            messagingTemplate.convertAndSend("/topic/signal/" + receiver, payload);
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        String id = event.getMessage().getHeaders().get("simpSessionId", String.class);
        if (id != null) {
            String peer = peers.remove(id);
            waitingSessions.remove(id);
            if (peer != null && !"waiting".equals(peer)) {
                peers.remove(peer);
                messagingTemplate.convertAndSend("/topic/disconnect/" + peer, "peer-left");
            }
        }
    }

    public static class SignalMessage {
        public String type;
        public Object data;
    }
}