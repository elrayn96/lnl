package com.elrayn.LnL.model.service;

import com.elrayn.LnL.model.entity.AdImpression;
import com.elrayn.LnL.model.repository.AdImpressionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AdService {

    @Autowired
    private AdImpressionRepository adImpressionRepository;

    public void logImpression(String adTypeStr, String adProvider, boolean clicked, UUID sessionUUID) {
        AdImpression impression = new AdImpression();
        impression.setAdType(adTypeStr);
        impression.setAdProvider(adProvider);
        impression.setImpressionTime(Instant.now());
        impression.setClicked(clicked);
        impression.setSessionUUID(sessionUUID == null ? UUID.randomUUID() : sessionUUID);
        adImpressionRepository.save(impression);
    }
}