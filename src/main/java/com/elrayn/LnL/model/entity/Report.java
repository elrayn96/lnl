package com.elrayn.LnL.model.entity;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private AppUser reporter;

    @ManyToOne
    @JoinColumn(name = "reported_user_id")
    private AppUser reportedUser;

    @ManyToOne
    @JoinColumn(name = "video_session_id")
    private VideoSession videoSession;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private String reason;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant  createdAt;

    @Column(nullable = false)
    private boolean processed;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Action actionTaken;

}

enum Action {
    WARN, TEMP_BAN, PERM_BAN, NO_ACTION
}