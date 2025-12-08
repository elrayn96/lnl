package com.elrayn.LnL.model.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.elrayn.LnL.model.entity.Question;
import com.elrayn.LnL.model.entity.Room;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByRoomOrderByCreatedAtAsc(Room room);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.author WHERE q.room = :room ORDER BY q.createdAt ASC")
    List<Question> findByRoomWithAuthor(@Param("room") Room room);
}
