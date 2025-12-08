package com.elrayn.LnL.model.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elrayn.LnL.model.entity.Room;
import com.elrayn.LnL.model.repository.RoomRepository;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public Room save(Room room) {
        return roomRepository.save(room);
    }

    public Optional<Room> findByUuid(UUID uuid) {
        return roomRepository.findByUuid(uuid);
    }

}