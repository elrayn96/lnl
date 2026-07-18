package com.elrayn.LnL.controller;

import com.elrayn.LnL.model.entity.Answer;
import com.elrayn.LnL.model.entity.AppUser;
import com.elrayn.LnL.model.entity.Avatar;
import com.elrayn.LnL.model.entity.Question;
import com.elrayn.LnL.model.entity.Room;
import com.elrayn.LnL.model.service.AnswerService;
import com.elrayn.LnL.model.service.AppUserService;
import com.elrayn.LnL.model.service.AvatarService;
import com.elrayn.LnL.model.service.QuestionService;
import com.elrayn.LnL.model.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FrontendApiController {
    private static final Logger log = LoggerFactory.getLogger(FrontendApiController.class);
    private final RoomService roomService;
    private final AppUserService appUserService;
    private final AvatarService avatarService;
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/users/anonymous")
    public Map<String, Object> anonymousUser(HttpSession session) {
        AppUser user = getSessionUser(session);
        return Map.of(
                "uuid", user.getUuid().toString(),
                "username", user.getUsername(),
                "isOwner", session.getAttribute("currentUser") == user);
    }

    @GetMapping("/video/session")
    public Map<String, Object> videoSession(HttpSession session) {
        AppUser user = getOrCreateVisitor(session);
        UUID sessionUuid = UUID.randomUUID();
        session.setAttribute("videoSessionUUID", sessionUuid);
        List<Map<String, Object>> iceServers = new ArrayList<>();
        iceServers.add(Map.of("urls", "stun:stun.l.google.com:19302"));
        String turnUrl = System.getenv("TURN_URL");
        String turnUsername = System.getenv("TURN_USERNAME");
        String turnCredential = System.getenv("TURN_CREDENTIAL");
        if (turnUrl != null && !turnUrl.isBlank()
                && turnUsername != null && !turnUsername.isBlank()
                && turnCredential != null && !turnCredential.isBlank()) {
            iceServers.add(Map.of(
                    "urls", turnUrl,
                    "username", turnUsername,
                    "credential", turnCredential));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUuid().toString());
        response.put("userName", user.getUsername());
        response.put("sessionUUID", sessionUuid.toString());
        response.put("iceServers", iceServers);
        response.put("turnConfigured", iceServers.size() > 1);
        return response;
    }

    @PostMapping("/rooms")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest body, HttpSession session,
            HttpServletRequest request) {
        if (body.title() == null || body.title().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "O título da sala é obrigatório."));
        }
        AppUser owner = (AppUser) session.getAttribute("currentUser");
        if (owner == null) {
            owner = createUser("Host_" + UUID.randomUUID().toString().substring(0, 6));
            session.setAttribute("currentUser", owner);
        }
        int duration = switch (body.duration() == null ? "" : body.duration()) {
            case "1h" -> 60;
            case "24h" -> 1440;
            default -> 15;
        };
        Room room = new Room();
        room.setUuid(UUID.randomUUID());
        room.setOwner(owner);
        room.setTitle(body.title().trim());
        room.setDescription(body.description() == null || body.description().isBlank()
                ? "Sala de Q&A: " + room.getTitle() : body.description().trim());
        room.setMode("audio".equals(body.mode()) ? Room.Mode.BOTH : Room.Mode.TEXT);
        room.setDurationMinutes(duration);
        room.setCreatedAt(Instant.now());
        room.setExpiresAt(Instant.now().plusSeconds(duration * 60L));
        room.setPublic(body.isPublic() == null || body.isPublic());
        room.setArchieved(false);
        room.setMaxVisitors(100);
        room = roomService.save(room);
        String origin = request.getScheme() + "://" + request.getServerName()
                + ((request.getServerPort() == 80 || request.getServerPort() == 443) ? "" : ":" + request.getServerPort());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "uuid", room.getUuid().toString(),
                "title", room.getTitle(),
                "shareUrl", origin + "/rooms/" + room.getUuid()));
    }

    @GetMapping("/rooms/{uuid}")
    public ResponseEntity<?> getRoom(@PathVariable UUID uuid) {
        Optional<Room> optional = roomService.findByUuid(uuid);
        if (optional.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Sala não encontrada."));
        Room room = optional.get();
        if (Instant.now().isAfter(room.getExpiresAt())) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("message", "Esta sala expirou."));
        }
        List<Map<String, Object>> messages = new ArrayList<>();
        for (Question question : questionService.findByRoomWithAuthor(room)) {
            Map<String, Object> item = baseMessage(question.getId(), "question", question.getAuthor(),
                    question.getText(), question.getCreatedAt());
            item.put("upvotes", question.getUpvotes());
            messages.add(item);
        }
        for (Answer answer : answerService.findByRoom(room)) {
            Map<String, Object> item = baseMessage(answer.getId(), "answer", answer.getAuthor(),
                    answer.getText(), answer.getCreatedAt());
            item.put("inReplyTo", answer.getQuestion().getId());
            item.put("originalAuthorName", answer.getQuestion().getAuthor().getUsername());
            item.put("originalMessageSnippet", answer.getQuestion().getText());
            messages.add(item);
        }
        messages.sort(Comparator.comparing(item -> Instant.parse((String) item.get("createdAt"))));
        Map<String, Object> result = new HashMap<>();
        result.put("uuid", room.getUuid().toString());
        result.put("title", room.getTitle());
        result.put("description", room.getDescription());
        result.put("mode", room.getMode().name());
        result.put("ownerName", room.getOwner().getUsername());
        result.put("ownerUuid", room.getOwner().getUuid().toString());
        result.put("expiresAt", room.getExpiresAt().toString());
        result.put("maxVisitors", room.getMaxVisitors());
        result.put("messages", messages);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/rooms/{uuid}/messages")
    public ResponseEntity<?> sendRoomMessage(@PathVariable UUID uuid, @RequestBody MessageRequest body,
            HttpSession session) {
        Optional<Room> optional = roomService.findByUuid(uuid);
        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Sala não encontrada."));
        }
        Room room = optional.get();
        if (Instant.now().isAfter(room.getExpiresAt())) {
            return ResponseEntity.status(HttpStatus.GONE).body(Map.of("message", "Esta sala expirou."));
        }
        String text = body.text() == null ? "" : body.text().trim();
        if (text.isEmpty() || text.length() > 600) {
            return ResponseEntity.badRequest().body(Map.of("message", "A mensagem deve ter entre 1 e 600 caracteres."));
        }

        AppUser author = getSessionUser(session);
        Map<String, Object> message;
        if (body.inReplyTo() != null) {
            Optional<Question> question = questionService.findById(body.inReplyTo());
            if (question.isEmpty() || !question.get().getRoom().getUuid().equals(uuid)) {
                return ResponseEntity.badRequest().body(Map.of("message", "A pergunta respondida não pertence a esta sala."));
            }
            Answer answer = new Answer();
            answer.setQuestion(question.get());
            answer.setAuthor(author);
            answer.setText(text);
            answer.setCreatedAt(Instant.now());
            answer.setPublished(true);
            answer = answerService.save(answer);
            message = baseMessage(answer.getId(), "answer", author, text, answer.getCreatedAt());
            message.put("inReplyTo", question.get().getId());
            message.put("originalAuthorName", question.get().getAuthor().getUsername());
            message.put("originalMessageSnippet", question.get().getText());
        } else {
            Question question = new Question();
            question.setRoom(room);
            question.setAuthor(author);
            question.setText(text);
            question.setCreatedAt(Instant.now());
            question.setUpvotes(0);
            question.setPrivate(false);
            question.setStatus(Question.Status.PUBLISHED);
            question = questionService.save(question);
            message = baseMessage(question.getId(), "question", author, text, question.getCreatedAt());
            message.put("upvotes", 0);
        }
        messagingTemplate.convertAndSend("/topic/room/" + uuid + "/messages", message);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PostMapping("/reports")
    public ResponseEntity<?> report(@RequestBody Map<String, String> body, HttpSession session) {
        String reason = body.get("reason");
        String sessionUuid = body.get("sessionUUID");
        if (reason == null || reason.isBlank() || sessionUuid == null || sessionUuid.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dados da denúncia incompletos."));
        }
        // The current signalling backend does not map its transient socket peer to a
        // persisted AppUser. Keep a server-side moderation audit without inventing an ID.
        log.warn("Video moderation report received: session={}, reason={}, httpSession={}",
                sessionUuid, reason.replaceAll("[\\r\\n]", " "), session.getId());
        return ResponseEntity.accepted().body(Map.of("status", "accepted"));
    }

    private Map<String, Object> baseMessage(Long id, String type, AppUser author, String text, Instant createdAt) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("type", type);
        item.put("authorUuid", author.getUuid().toString());
        item.put("authorName", author.getUsername());
        item.put("text", text);
        item.put("createdAt", createdAt.toString());
        return item;
    }

    private AppUser getOrCreateVisitor(HttpSession session) {
        AppUser visitor = (AppUser) session.getAttribute("visitorUser");
        if (visitor == null) {
            String[] adjectives = { "Azul", "Cósmico", "Sereno", "Místico", "Dourado", "Neon" };
            String[] nouns = { "Tigre", "Coruja", "Lobo", "Fénix", "Raposa", "Águia" };
            Random random = new Random();
            visitor = createUser(adjectives[random.nextInt(adjectives.length)] + "_"
                    + nouns[random.nextInt(nouns.length)] + UUID.randomUUID().toString().substring(0, 4));
            session.setAttribute("visitorUser", visitor);
        }
        return visitor;
    }

    private AppUser getSessionUser(HttpSession session) {
        AppUser owner = (AppUser) session.getAttribute("currentUser");
        if (owner != null) {
            session.setAttribute("visitorUser", owner);
            return owner;
        }
        return getOrCreateVisitor(session);
    }

    private AppUser createUser(String username) {
        List<Avatar> avatars = avatarService.findAll();
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setUuid(UUID.randomUUID());
        user.setCreatedAt(Instant.now());
        user.setLastSeenAt(Instant.now());
        user.setAvatar(avatars.isEmpty() ? null : avatars.get(new Random().nextInt(avatars.size())));
        user.setBanned(false);
        user.setRole(AppUser.Role.APPUSER);
        return appUserService.save(user);
    }

    public record CreateRoomRequest(String title, String description, String duration, String mode, Boolean isPublic) {}
    public record MessageRequest(String text, Long inReplyTo) {}
}
