package com.elrayn.LnL.controller;

import com.elrayn.LnL.model.service.AdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ad")
public class AdController {

    @Autowired
    private AdService adService;

    @PostMapping("/impression")
    public ResponseEntity<Void> logImpression(@RequestBody Map<String, Object> request) {
        String adType = (String) request.get("adType");
        String adProvider = (String) request.get("adProvider");
        Boolean clicked = (Boolean) request.getOrDefault("clicked", false);
        String sessionUUIDStr = (String) request.get("sessionUUID");

        UUID sessionUUID = sessionUUIDStr != null ? UUID.fromString(sessionUUIDStr) : null;
        adService.logImpression(adType, adProvider, clicked, sessionUUID);
        return ResponseEntity.ok().build();
    }
}