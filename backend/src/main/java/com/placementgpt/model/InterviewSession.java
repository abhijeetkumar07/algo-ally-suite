package com.placementgpt.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "interview_sessions")
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String category;
    private String difficulty;
    private String roundTitle;
    private String status; // IN_PROGRESS, COMPLETED
    private Integer overallScore;

    @Column(columnDefinition = "TEXT")
    private String dialogueHistoryJson;

    @Column(columnDefinition = "TEXT")
    private String evaluationJson;

    private Instant createdAt = Instant.now();
    private Instant completedAt;

    public InterviewSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getRoundTitle() { return roundTitle; }
    public void setRoundTitle(String roundTitle) { this.roundTitle = roundTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public String getDialogueHistoryJson() { return dialogueHistoryJson; }
    public void setDialogueHistoryJson(String dialogueHistoryJson) { this.dialogueHistoryJson = dialogueHistoryJson; }

    public String getEvaluationJson() { return evaluationJson; }
    public void setEvaluationJson(String evaluationJson) { this.evaluationJson = evaluationJson; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
