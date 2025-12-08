package com.elrayn.LnL.controller;

import com.elrayn.LnL.model.entity.*;
import com.elrayn.LnL.model.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class RoomWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final RoomService roomService;
    private final AppUserService appUserService;
    private final QuestionService questionService;
    private final AnswerService answerService;

    @MessageMapping("/room.message")
    @Transactional
    public void handleMessage(@Payload String payload) throws Exception {
        ClientMessage clientMsg = objectMapper.readValue(payload, ClientMessage.class);

        if (clientMsg.getRoomUuid() == null || clientMsg.getText() == null || clientMsg.getAuthorUuid() == null) {
            return;
        }

        Optional<Room> roomOpt = roomService.findByUuid(clientMsg.getRoomUuid());
        if (roomOpt.isEmpty() || Instant.now().isAfter(roomOpt.get().getExpiresAt())) {
            return;
        }
        Room room = roomOpt.get();

        AppUser author = appUserService.findByUuid(clientMsg.getAuthorUuid());
        if (author == null) {
            return;
        }

        String text = clientMsg.getText().trim();
        if (text.isEmpty())
            return;

        ServerMessage serverMsg = new ServerMessage();
        serverMsg.setRoomUuid(clientMsg.getRoomUuid());
        serverMsg.setAuthorUuid(clientMsg.getAuthorUuid());
        serverMsg.setAuthorName(author.getUsername());
        serverMsg.setText(text);
        serverMsg.setCreatedAt(Instant.now());

        if (clientMsg.getInReplyTo() != null) {
            Optional<Question> questionOpt = questionService.findById(clientMsg.getInReplyTo());
            if (questionOpt.isPresent()) {
                Answer answer = new Answer();
                answer.setQuestion(questionOpt.get());
                answer.setAuthor(author);
                answer.setText(text);
                answer.setCreatedAt(Instant.now());
                answer.setPublished(true);
                answer = answerService.save(answer);

                serverMsg.setId(answer.getId());
                serverMsg.setType("answer");
                serverMsg.setInReplyTo(clientMsg.getInReplyTo());
                serverMsg.setOriginalAuthorName(questionOpt.get().getAuthor().getUsername());
                serverMsg.setOriginalMessageSnippet(questionOpt.get().getText());
            } else {
                return;
            }
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

            serverMsg.setId(question.getId());
            serverMsg.setType("question");
        }

        messagingTemplate.convertAndSend("/topic/room/" + clientMsg.getRoomUuid() + "/messages", serverMsg);
    }

    public static class ClientMessage {
        private UUID roomUuid;
        private UUID authorUuid;
        private String text;
        private Long inReplyTo;

        public UUID getRoomUuid() {
            return roomUuid;
        }

        public void setRoomUuid(UUID roomUuid) {
            this.roomUuid = roomUuid;
        }

        public UUID getAuthorUuid() {
            return authorUuid;
        }

        public void setAuthorUuid(UUID authorUuid) {
            this.authorUuid = authorUuid;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public Long getInReplyTo() {
            return inReplyTo;
        }

        public void setInReplyTo(Long inReplyTo) {
            this.inReplyTo = inReplyTo;
        }
    }

    public static class ServerMessage {
        private Long id;
        private String type;
        private UUID roomUuid;
        private UUID authorUuid;
        private String authorName;
        private String text;
        private Instant createdAt;
        private Long inReplyTo;
        private String originalAuthorName;
        private String originalMessageSnippet;

        // Getters e setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public UUID getRoomUuid() {
            return roomUuid;
        }

        public void setRoomUuid(UUID roomUuid) {
            this.roomUuid = roomUuid;
        }

        public UUID getAuthorUuid() {
            return authorUuid;
        }

        public void setAuthorUuid(UUID authorUuid) {
            this.authorUuid = authorUuid;
        }

        public String getAuthorName() {
            return authorName;
        }

        public void setAuthorName(String authorName) {
            this.authorName = authorName;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }

        public Long getInReplyTo() {
            return inReplyTo;
        }

        public void setInReplyTo(Long inReplyTo) {
            this.inReplyTo = inReplyTo;
        }

        public String getOriginalAuthorName() {
            return originalAuthorName;
        }

        public void setOriginalAuthorName(String originalAuthorName) {
            this.originalAuthorName = originalAuthorName;
        }

        public String getOriginalMessageSnippet() {
            return originalMessageSnippet;
        }

        public void setOriginalMessageSnippet(String originalMessageSnippet) {
            this.originalMessageSnippet = originalMessageSnippet;
        }
    }
}