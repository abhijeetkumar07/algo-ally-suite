package com.placementgpt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "problems")
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String difficulty; // EASY, MEDIUM, HARD

    @Column(nullable = false)
    private String topic; // Arrays & Strings, Binary Search, Linked Lists, Trees, Dynamic Programming

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String examples;

    @Column(columnDefinition = "TEXT")
    private String starterCodeJava;

    @Column(columnDefinition = "TEXT")
    private String starterCodePython;

    @Column(columnDefinition = "TEXT")
    private String starterCodeCpp;

    @Column(columnDefinition = "TEXT")
    private String starterCodeC;

    @Column(columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String hiddenTestCasesJson;

    @Column(columnDefinition = "TEXT")
    private String hintsJson;

    public Problem() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getConstraints() {
        return constraints;
    }

    public void setConstraints(String constraints) {
        this.constraints = constraints;
    }

    public String getExamples() {
        return examples;
    }

    public void setExamples(String examples) {
        this.examples = examples;
    }

    public String getStarterCodeJava() {
        return starterCodeJava;
    }

    public void setStarterCodeJava(String starterCodeJava) {
        this.starterCodeJava = starterCodeJava;
    }

    public String getStarterCodePython() {
        return starterCodePython;
    }

    public void setStarterCodePython(String starterCodePython) {
        this.starterCodePython = starterCodePython;
    }

    public String getStarterCodeCpp() {
        return starterCodeCpp;
    }

    public void setStarterCodeCpp(String starterCodeCpp) {
        this.starterCodeCpp = starterCodeCpp;
    }

    public String getStarterCodeC() {
        return starterCodeC;
    }

    public void setStarterCodeC(String starterCodeC) {
        this.starterCodeC = starterCodeC;
    }

    public String getHiddenTestCasesJson() {
        return hiddenTestCasesJson;
    }

    public void setHiddenTestCasesJson(String hiddenTestCasesJson) {
        this.hiddenTestCasesJson = hiddenTestCasesJson;
    }

    public String getHintsJson() {
        return hintsJson;
    }

    public void setHintsJson(String hintsJson) {
        this.hintsJson = hintsJson;
    }
}
