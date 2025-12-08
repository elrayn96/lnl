package com.elrayn.LnL.model.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elrayn.LnL.model.entity.Answer;
import com.elrayn.LnL.model.entity.Room;
import com.elrayn.LnL.model.repository.AnswerRepository;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerRepository;

    public Answer save(Answer answer) {
        return answerRepository.save(answer);
    }

    public Optional<Answer> findById(long id) {
        return answerRepository.findById(id);
    }

    public List<Answer> findByRoom(Room room) {
        return answerRepository.findAll().stream()
                .filter(p -> p.getQuestion().getRoom().getUuid().equals(room.getUuid())).collect(Collectors.toList());
    }

}
