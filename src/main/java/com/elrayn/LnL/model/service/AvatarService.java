package com.elrayn.LnL.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elrayn.LnL.model.entity.Avatar;
import com.elrayn.LnL.model.repository.AvatarRepository;

@Service
public class AvatarService {

    @Autowired
    private AvatarRepository avatarRepository;

    public List<Avatar> findAll() {
        return avatarRepository.findAll();
    }

    public Avatar save(Avatar avatar) {
        return avatarRepository.save(avatar);
    }

}