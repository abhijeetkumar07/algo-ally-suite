package com.placementgpt.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String code;

    @Column(nullable = false)
    private String language; // java, python, cpp, c

    @Column(nullable = false)
    private String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, COMPILATION_ERROR, RUNTIME_ERROR

    private Long executionTimeMs = 0L;
    private Long memoryKb = 0L;
    private int testCasesPassed = 0;
    private int totalTestCases = 0;

    @Column(columnDefinition = "TEXT")
    private String compilerOutput;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Submission() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public Long getMemoryKb() {
        return memoryKb;
    }

    public void setMemoryKb(Long memoryKb) {
        this.memoryKb = memoryKb;
    }

    public int getTestCasesPassed() {
        return testCasesPassed;
    }

    public void setTestCasesPassed(int testCasesPassed) {
        this.testCasesPassed = testCasesPassed;
    }

    public int getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(int totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public String getCompilerOutput() {
        return compilerOutput;
    }

    public void setCompilerOutput(String compilerOutput) {
        this.compilerOutput = compilerOutput;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
