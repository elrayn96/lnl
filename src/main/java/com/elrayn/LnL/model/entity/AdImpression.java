package com.elrayn.LnL.model.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdImpression {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AdType adType;

    @Column(nullable = false)
    private String adProvider;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private Instant  impressionTime;
        
    @Column(nullable = false)
    private boolean clicked;

    @Column(nullable = false)
    private UUID sessioUUID;

}

enum AdType {
    BANNER, VIDEO_INTER
}
