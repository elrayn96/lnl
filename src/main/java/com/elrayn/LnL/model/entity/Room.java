package com.elrayn.LnL.model.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Mode mode;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant createdAt;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant  expiresAt;

    @Column(nullable = false)
    private boolean isPublic;

    @Column(nullable = false)
    private boolean archieved;

    
    @Column(nullable = false)
    private Integer maxVisitors;


    public enum Mode {
        TEXT, AUDIO, BOTH
    }

}

enum Mode {
    TEXT, AUDIO, BOTH
}
