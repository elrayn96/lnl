package com.elrayn.LnL.model.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.elrayn.LnL.model.entity.VideoSession;
import java.util.Optional;

@Repository
public interface VideoSessionRepository extends JpaRepository<VideoSession, Long> {

    Optional<VideoSession> findBySessionUUID(UUID sessionUUID);

}
