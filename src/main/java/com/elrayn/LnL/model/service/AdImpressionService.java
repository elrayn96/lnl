
package com.elrayn.LnL.model.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elrayn.LnL.model.entity.AdImpression;
import com.elrayn.LnL.model.repository.AdImpressionRepository;

@Service
public class AdImpressionService {

    @Autowired
    private AdImpressionRepository adImpressionRepository;

    public AdImpression save(AdImpression adImpression) {
        return adImpressionRepository.save(adImpression);
    }

    public List<AdImpression> findAll() {
        return adImpressionRepository.findAll();
    }

    public Optional<AdImpression> findBySessioUUID(UUID sessioUUID) {
        return adImpressionRepository.findBySessioUUID(sessioUUID);
    }
    
}
