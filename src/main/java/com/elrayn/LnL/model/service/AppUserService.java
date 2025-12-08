package com.elrayn.LnL.model.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elrayn.LnL.model.entity.AppUser;
import com.elrayn.LnL.model.repository.AppUserRepository;

@Service
public class AppUserService {

    @Autowired
    private AppUserRepository appUserRepository;

    public List<AppUser> findAll() {
        return appUserRepository.findAll();
    }

    public AppUser save(AppUser host) {
        return appUserRepository.save(host);
    }

    public AppUser findByUuid(UUID uuid) {
        return appUserRepository.findByUuid(uuid);
    }

    
}