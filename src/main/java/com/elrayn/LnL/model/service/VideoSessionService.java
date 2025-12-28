package com.elrayn.LnL.model.service;

import com.elrayn.LnL.model.entity.VideoSession;
import com.elrayn.LnL.model.repository.VideoSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class VideoSessionService {

    @Autowired
    private VideoSessionRepository videoSessionRepository;

    public VideoSession startSession(String peerAId, String peerBId, UUID sessionUUID) {
        VideoSession session = new VideoSession();
        session.setSessionUUID(sessionUUID);
        session.setPeerAId(peerAId);
        session.setPeerBId(peerBId);
        session.setStartedAt(Instant.now());
        session.setEndedAt(null);
        session.setDurationSeconds(null);
        session.setEndedBy(null);
        session.setWasReported(false);
        return videoSessionRepository.save(session);
    }

    public void endSession(UUID sessionUUID, String endedBy, int durationSeconds) {
        videoSessionRepository.findBySessionUUID(sessionUUID)
                .ifPresent(session -> {
                    session.setEndedAt(Instant.now());
                    session.setDurationSeconds(durationSeconds);
                    session.setEndedBy(endedBy);
                    videoSessionRepository.save(session);
                });
    }
}