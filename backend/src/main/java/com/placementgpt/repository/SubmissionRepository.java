package com.placementgpt.repository;

import com.placementgpt.model.Problem;
import com.placementgpt.model.Submission;
import com.placementgpt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserOrderByCreatedAtDesc(User user);
    List<Submission> findByUserAndProblemOrderByCreatedAtDesc(User user, Problem problem);
    long countByUserAndStatus(User user, String status);
    List<Submission> findByUserAndStatus(User user, String status);
}
