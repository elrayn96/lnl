package com.elrayn.LnL.controller;

import com.elrayn.LnL.model.entity.*;
import com.elrayn.LnL.model.service.AnswerService;
import com.elrayn.LnL.model.service.AppUserService;
import com.elrayn.LnL.model.service.AvatarService;
import com.elrayn.LnL.model.service.QuestionService;
import com.elrayn.LnL.model.service.RoomService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.time.Instant;
import java.util.*;

@Controller
@RequestMapping("/room")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private AppUserService appUserService;

    @Autowired
    private AvatarService avatarService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;

    @GetMapping("/create")
    public String createRoomForm() {
        return "create-room";
    }

    @PostMapping("/create")
    public String createRoom(
            @RequestParam String title,
            @RequestParam String duration,
            @RequestParam String mode,
            HttpSession session,
            Model model) {

        // Validações mínimas
        if (title == null || title.trim().isEmpty()) {
            model.addAttribute("error", "Título é obrigatório.");
            return "create-room";
        }

        // Criar host (se não existir na sessão)
        AppUser host = (AppUser) session.getAttribute("currentUser");
        if (host == null) {
            List<Avatar> avatars = avatarService.findAll();
            Avatar randomAvatar = avatars.isEmpty() ? null : avatars.get(new Random().nextInt(avatars.size()));
            host = new AppUser();
            host.setUsername("Host_" + UUID.randomUUID().toString().substring(0, 6));
            host.setUuid(UUID.randomUUID());
            host.setCreatedAt(Instant.now());
            host.setLastSeenAt(Instant.now());
            host.setAvatar(randomAvatar);
            host.setBanned(false);
            host.setRole(AppUser.Role.APPUSER);
            host.setAvatar(randomAvatar);
            host = appUserService.save(host);

            session.setAttribute("currentUser", host);
        }

        // Mapear duração
        int durationMinutes = switch (duration) {
            case "1h" -> 60;
            case "24h" -> 24 * 60;
            default -> 15;
        };

        // Mapear modo
        Room.Mode roomMode = mode.equals("audio") ? Room.Mode.BOTH : Room.Mode.TEXT;

        // Criar sala
        Room room = new Room();
        room.setUuid(UUID.randomUUID());
        room.setOwner(host);
        room.setTitle(title.trim());
        room.setDescription("Sala de Q&A: " + title.trim());
        room.setMode(roomMode);
        room.setDurationMinutes(durationMinutes);
        room.setCreatedAt(Instant.now());
        room.setExpiresAt(Instant.now().plusSeconds(durationMinutes * 60L));
        room.setPublic(true);
        room.setArchieved(false);
        room.setMaxVisitors(100);

        room = roomService.save(room);

        return "redirect:/room/" + room.getUuid();
    }

    // =============== TELA DE ENTRADA POR LINK ===============
    @GetMapping("/join")
    public String joinRoomForm() {
        return "join-room";
    }

    @PostMapping("/join")
    public String joinRoom(
            @RequestParam String roomLink,
            Model model) {

        String cleanLink = roomLink.trim();

        Optional<Room> room = roomService.findByUuid(UUID.fromString(cleanLink));
        if (room.isPresent()) {
            return "redirect:/room/" + cleanLink;
        }

        if (!cleanLink.matches("https?://[^/]+/room(/join)?/[a-f0-9\\-]+")) {
            model.addAttribute("error", "Link inválido.");
            return "join-room";
        }

        // Extrair UUID
        String[] parts = cleanLink.split("/");
        String uuidStr = parts[parts.length - 1];

        try {
            UUID uuid = UUID.fromString(uuidStr);
            room = roomService.findByUuid(uuid);
            if (room.isEmpty()) {
                model.addAttribute("error", "Sala não existe.");
                return "join-room";
            }
            return "redirect:/room/" + uuid;
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", "UUID inválido.");
            return "join-room";
        }
    }

    private String generateRandomName() {
        String[] adjectives = { "Blue", "Cosmic", "Silent", "Mystic", "Wild", "Golden", "Shadow", "Neon" };
        String[] nouns = { "Tiger", "Owl", "Wolf", "Phoenix", "Dragon", "Fox", "Eagle", "Shark" };
        Random r = new Random();
        return adjectives[r.nextInt(adjectives.length)] + "_" + nouns[r.nextInt(nouns.length)]
                + UUID.randomUUID().toString().substring(0, 5);
    }

    @PostMapping("/{uuid}/question")
    public String addQuestion(@PathVariable UUID uuid, @RequestParam String text, HttpSession session) {

        Optional<Room> roomOpt = roomService.findByUuid(uuid);
        if (roomOpt.isEmpty()) {
            return "redirect:/room/join?error=Sala não encontrada";
        }

        Room room = roomOpt.get();
        if (Instant.now().isAfter(room.getExpiresAt())) {
            return "redirect:/room/join?error=Sala expirada";
        }

        AppUser visitor = (AppUser) session.getAttribute("visitorUser");
        if (visitor == null) {
            // Redirecionar para garantir que tenha visitante
            return "redirect:/room/" + uuid;
        }

        Question question = new Question();
        question.setRoom(room);
        question.setText(text.trim());
        question.setCreatedAt(Instant.now());
        question.setAuthor(visitor);
        question.setUpvotes(0);
        question.setPrivate(false);
        question.setStatus(Question.Status.PENDING); // ou PUBLISHED se quiser mostrar imediatamente

        question = questionService.save(question);

        return "redirect:/room/" + uuid;
    }

    @GetMapping("/{uuid}")
    public String viewRoom(@PathVariable UUID uuid, HttpSession session, Model model) {
        Optional<Room> roomOpt = roomService.findByUuid(uuid);
        if (roomOpt.isEmpty()) {
            model.addAttribute("error", "Sala não encontrada.");
            return "error";
        }
        Room room = roomOpt.get();
        if (Instant.now().isAfter(room.getExpiresAt())) {
            model.addAttribute("error", "Sala expirada.");
            return "error";
        }
        AppUser visitor = (AppUser) session.getAttribute("visitorUser");
        if (visitor == null) {
            List<Avatar> avatars = avatarService.findAll();
            Avatar randomAvatar = avatars.isEmpty() ? null : avatars.get(new Random().nextInt(avatars.size()));
            visitor = new AppUser();
            visitor.setUsername(generateRandomName());
            visitor.setUuid(UUID.randomUUID());
            visitor.setCreatedAt(Instant.now());
            visitor.setLastSeenAt(Instant.now());
            visitor.setAvatar(randomAvatar);
            visitor.setBanned(false);
            visitor.setRole(AppUser.Role.APPUSER);
            visitor = appUserService.save(visitor);
            session.setAttribute("visitorUser", visitor);
        }

        List<Question> questions = questionService.findByRoomWithAuthor(room);
        List<Answer> answers = answerService.findByRoom(room);
        List<MessageWrapper> allMessages = new ArrayList<>();
        for (Question q : questions)
            allMessages.add(new MessageWrapper(q));
        for (Answer a : answers)
            allMessages.add(new MessageWrapper(a));
        allMessages.sort(Comparator.comparing(MessageWrapper::getCreatedAt));

        model.addAttribute("allMessages", allMessages);
        model.addAttribute("room", room);
        model.addAttribute("visitor", visitor);
        model.addAttribute("visitorUuid", visitor.getUuid().toString()); // ← CORREÇÃO PRINCIPAL
        model.addAttribute("roomOwnerUuid", room.getOwner().getUuid().toString());
        return "qa-room";
    }

    @PostMapping("/{uuid}/message")
    public String addMessage(@PathVariable UUID uuid,
            @RequestParam String text,
            @RequestParam(required = false) Long inReplyTo,
            HttpSession session,
            Model model) {
        Optional<Room> roomOpt = roomService.findByUuid(uuid);
        if (roomOpt.isEmpty()) {
            return "redirect:/room/join?error=Sala não encontrada";
        }
        Room room = roomOpt.get();
        if (Instant.now().isAfter(room.getExpiresAt())) {
            return "redirect:/room/join?error=Sala expirada";
        }
        AppUser visitor = (AppUser) session.getAttribute("visitorUser");
        if (visitor == null) {
            return "redirect:/room/" + uuid;
        }

        if (inReplyTo != null) {
            Optional<Question> questionOpt = questionService.findById(inReplyTo);
            if (questionOpt.isPresent()) {
                Answer answer = new Answer();
                answer.setCreatedAt(Instant.now());
                answer.setQuestion(questionOpt.get());
                answer.setAuthor(visitor);
                answer.setText(text);
                answer.setPublished(true);
                answerService.save(answer);
            }
        } else {
            Question question = new Question();
            question.setAuthor(visitor);
            question.setCreatedAt(Instant.now());
            question.setPrivate(false);
            question.setUpvotes(0);
            question.setRoom(room);
            question.setStatus(Question.Status.PUBLISHED);
            question.setText(text.trim());
            questionService.save(question);
        }
        return "redirect:/room/" + uuid;
    }

    public static class MessageWrapper {
        private final Object source;
        private final Long id;
        private final String text;
        private final AppUser author;
        private final Instant createdAt;
        private final Integer upvotes;

        public MessageWrapper(Question q) {
            this.source = q;
            this.id = q.getId();
            this.text = q.getText();
            this.author = q.getAuthor();
            this.createdAt = q.getCreatedAt();
            this.upvotes = q.getUpvotes();
        }

        public MessageWrapper(Answer a) {
            this.source = a;
            this.id = a.getId();
            this.text = a.getText();
            this.author = a.getAuthor();
            this.createdAt = a.getCreatedAt();
            this.upvotes = 0; // ou carregar se tiver
        }

        // Getters obrigatórios para Thymeleaf
        public Long getId() {
            return id;
        }

        public String getText() {
            return text;
        }

        public AppUser getAuthor() {
            return author;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public Integer getUpvotes() {
            return upvotes;
        }

        // Opcional: tipo da mensagem
        public boolean isAnswer() {
            return source instanceof Answer;
        }

        public boolean isQuestion() {
            return source instanceof Question;
        }
    }

    // =============== NOVO ENDPOINT: Inicializar usuário visitante ===============
    @GetMapping("/api/user/init")
    @ResponseBody
    public Map<String, Object> initVisitorUser(HttpSession session) {
        AppUser visitor = (AppUser) session.getAttribute("visitorUser");
        if (visitor == null) {
            List<Avatar> avatars = avatarService.findAll();
            Avatar randomAvatar = avatars.isEmpty() ? null : avatars.get(new Random().nextInt(avatars.size()));
            visitor = new AppUser();
            visitor.setUsername(generateRandomName());
            visitor.setUuid(UUID.randomUUID());
            visitor.setCreatedAt(Instant.now());
            visitor.setLastSeenAt(Instant.now());
            visitor.setAvatar(randomAvatar);
            visitor.setBanned(false);
            visitor.setRole(AppUser.Role.APPUSER);
            visitor = appUserService.save(visitor);
            session.setAttribute("visitorUser", visitor);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("uuid", visitor.getUuid().toString());
        response.put("username", visitor.getUsername());
        return response;
    }

    // =============== Inicializar usuário para videochat ===============
    // Dentro de RoomController.java — substituir o método existente
    @GetMapping("/api/user/init-video")
    @ResponseBody
    public Map<String, Object> initVideoUser(HttpSession session) {
        AppUser visitor = (AppUser) session.getAttribute("visitorUser");
        if (visitor == null) {
            String username = generateRandomName();
            visitor = new AppUser();
            visitor.setUsername(username);
            visitor.setUuid(UUID.randomUUID());
            visitor.setCreatedAt(Instant.now());
            visitor.setLastSeenAt(Instant.now());
            visitor.setBanned(false);
            visitor.setRole(AppUser.Role.APPUSER);
            visitor = appUserService.save(visitor);
            session.setAttribute("visitorUser", visitor);
        }

        // ✅ Gerar sessionUUID único para esta sessão de videochat
        UUID sessionUUID = UUID.randomUUID();
        session.setAttribute("videoSessionUUID", sessionUUID);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", visitor.getUuid().toString());
        response.put("userName", visitor.getUsername());
        response.put("sessionUUID", sessionUUID.toString());
        return response;
    }

}