package com.elrayn.LnL.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.Message;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Slf4j
@Controller
@RequiredArgsConstructor
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;
    private static final ConcurrentLinkedQueue<String> waiting = new ConcurrentLinkedQueue<>();
    private static final ConcurrentHashMap<String, String> pairs = new ConcurrentHashMap<>();

    // ✅ Este método é ESSENCIAL
    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        String sessionId = event.getMessage().getHeaders().get("simpSessionId", String.class);
        if (sessionId != null) {
            log.info("✅ Usuário conectado: {}", sessionId);
            // ✅ Envie para um tópico EXPLÍCITO com o sessionId
            messagingTemplate.convertAndSend("/topic/welcome/" + sessionId, sessionId);
        }
    }

    @MessageMapping("/video.join")
    public void join(@Header("simpSessionId") String sessionId) {
        if (sessionId == null || pairs.containsKey(sessionId) || waiting.contains(sessionId)) {
            return;
        }
        log.info("📥 Usuário entrou na fila: {}", sessionId);
        waiting.add(sessionId);
        tryPair();
    }

    @MessageMapping("/video.register")
    public void register(Map<String, Object> payload, @Header("simpSessionId") String sessionId) {
        Object token = payload.get("clientToken");
        if (sessionId == null || token == null) {
            return;
        }
        String safeToken = token.toString().replaceAll("[^a-zA-Z0-9-]", "");
        if (!safeToken.isBlank()) {
            messagingTemplate.convertAndSend("/topic/video/register/" + safeToken,
                    Map.of("sessionId", sessionId));
        }
    }

    private synchronized void tryPair() {
        while (waiting.size() >= 2) {
            String a = waiting.poll();
            String b = waiting.poll();
            if (a == null || b == null || a.equals(b))
                continue;

            pairs.put(a, b);
            pairs.put(b, a);
            log.info("🔗 Emparelhado: {} ↔ {}", a, b);

            messagingTemplate.convertAndSend("/topic/pair/" + a, Map.of("peer", b, "initiator", true));
            messagingTemplate.convertAndSend("/topic/pair/" + b, Map.of("peer", a, "initiator", false));
        }
    }

    @MessageMapping("/video.signal")
    public void signal(Map<String, Object> payload, @Header("simpSessionId") String sender) {
        String receiver = pairs.get(sender);
        if (receiver != null) {
            messagingTemplate.convertAndSend("/topic/signal/" + receiver, payload);
        }
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        String id = event.getSessionId();
        if (id != null) {
            waiting.remove(id);
            String peer = pairs.remove(id);
            if (peer != null) {
                pairs.remove(peer);
                messagingTemplate.convertAndSend("/topic/signal/" + peer, Map.of("type", "peerLeft"));
            }
            log.info("👋 Usuário desconectado: {}", id);
        }
    }

    @MessageMapping("/get-session-id")
    public void getSessionId(Message<?> msg) {
        String sessionId = SimpMessageHeaderAccessor.wrap(msg).getSessionId();
        if (sessionId != null) {
            messagingTemplate.convertAndSend("/topic/welcome-ack", sessionId);
        }
    }

}
