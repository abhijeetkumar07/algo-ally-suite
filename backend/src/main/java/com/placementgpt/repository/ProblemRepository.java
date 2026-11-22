package com.placementgpt.repository;

import com.placementgpt.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Optional<Problem> findBySlug(String slug);
    List<Problem> findByTopic(String topic);
    List<Problem> findByDifficulty(String difficulty);
}
