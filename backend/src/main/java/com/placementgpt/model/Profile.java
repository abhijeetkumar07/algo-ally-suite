package com.placementgpt.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String fullName;
    private String college;
    private String degree;
    private Integer graduationYear;
    private String targetCompanyType;
    private String dsaLevel;

    @ElementCollection
    private List<String> preferredTechStack = new java.util.ArrayList<>();

    private String leetcodeUsername;
    private Integer leetcodeEasy = 0;
    private Integer leetcodeMedium = 0;
    private Integer leetcodeHard = 0;
    private String githubUsername;
    private String linkedinUsername;
    private boolean onboardingCompleted = false;
    private Integer currentStreak = 0;
    private Integer longestStreak = 0;
    private Integer totalDaysActive = 0;
    private java.time.LocalDate lastActiveDate;

    public Profile() {
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getTargetCompanyType() {
        return targetCompanyType;
    }

    public void setTargetCompanyType(String targetCompanyType) {
        this.targetCompanyType = targetCompanyType;
    }

    public String getDsaLevel() {
        return dsaLevel;
    }

    public void setDsaLevel(String dsaLevel) {
        this.dsaLevel = dsaLevel;
    }

    public List<String> getPreferredTechStack() {
        return preferredTechStack;
    }

    public void setPreferredTechStack(List<String> preferredTechStack) {
        this.preferredTechStack = preferredTechStack;
    }

    public String getLeetcodeUsername() {
        return leetcodeUsername;
    }

    public void setLeetcodeUsername(String leetcodeUsername) {
        this.leetcodeUsername = leetcodeUsername;
    }

    public Integer getLeetcodeEasy() {
        return leetcodeEasy;
    }

    public void setLeetcodeEasy(Integer leetcodeEasy) {
        this.leetcodeEasy = leetcodeEasy;
    }

    public Integer getLeetcodeMedium() {
        return leetcodeMedium;
    }

    public void setLeetcodeMedium(Integer leetcodeMedium) {
        this.leetcodeMedium = leetcodeMedium;
    }

    public Integer getLeetcodeHard() {
        return leetcodeHard;
    }

    public void setLeetcodeHard(Integer leetcodeHard) {
        this.leetcodeHard = leetcodeHard;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public String getLinkedinUsername() {
        return linkedinUsername;
    }

    public void setLinkedinUsername(String linkedinUsername) {
        this.linkedinUsername = linkedinUsername;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(Integer longestStreak) {
        this.longestStreak = longestStreak;
    }

    public Integer getTotalDaysActive() {
        return totalDaysActive;
    }

    public void setTotalDaysActive(Integer totalDaysActive) {
        this.totalDaysActive = totalDaysActive;
    }

    public java.time.LocalDate getLastActiveDate() {
        return lastActiveDate;
    }

    public void setLastActiveDate(java.time.LocalDate lastActiveDate) {
        this.lastActiveDate = lastActiveDate;
    }

    public static ProfileBuilder builder() {
        return new ProfileBuilder();
    }

    public static class ProfileBuilder {
        private User user;
        private String fullName;

        public ProfileBuilder user(User user) {
            this.user = user;
            return this;
        }

        public ProfileBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Profile build() {
            Profile p = new Profile();
            p.setUser(user);
            p.setFullName(fullName);
            return p;
        }
    }
}
