package com.elrayn.LnL.model.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.elrayn.LnL.model.entity.AdImpression;

@Repository
public interface AdImpressionRepository extends JpaRepository<AdImpression, Long> {
    Optional<AdImpression> findBySessionUUID(UUID sessionUUID);
}
