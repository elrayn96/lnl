package com.elrayn.LnL.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elrayn.LnL.model.entity.Answer;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
}
