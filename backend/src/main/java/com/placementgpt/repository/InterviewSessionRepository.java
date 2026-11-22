package com.placementgpt.repository;

import com.placementgpt.model.InterviewSession;
import com.placementgpt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUserOrderByCreatedAtDesc(User user);
}
