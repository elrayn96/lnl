package com.elrayn.LnL.model.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VideoSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID sessionUUID;

    @Column(nullable = false)
    private String peerAId;

    @Column(nullable = false)
    private String peerBId;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant  startedAt;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant  endedAt;

    @Column(nullable = false)
    private Integer durationSeconds;

    @Column(nullable = true)
    private String endedBy;

    @Column(unique = false)
    private boolean wasReported;
}
