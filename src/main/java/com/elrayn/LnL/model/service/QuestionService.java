package com.elrayn.LnL.model.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.elrayn.LnL.model.entity.Question;
import com.elrayn.LnL.model.entity.Room;
import com.elrayn.LnL.model.repository.QuestionRepository;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public List<Question> findByRoomOrderByCreatedAtAsc(Room room) {
        return questionRepository.findByRoomOrderByCreatedAtAsc(room);
    }

    public Question save(Question question) {
        return questionRepository.save(question);
    }

    public List<Question> findByRoomWithAuthor(Room room) {
        return questionRepository.findByRoomWithAuthor(room);
    }

    public Optional<Question> findById(long inReplyTo) {
        return questionRepository.findById(inReplyTo);
    }

}