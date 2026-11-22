package com.placementgpt.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String email;
    private List<String> roles;
    private boolean onboardingCompleted;

    public JwtResponse() {
    }

    public JwtResponse(String token, Long id, String email, List<String> roles, boolean onboardingCompleted) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.onboardingCompleted = onboardingCompleted;
    }

    public JwtResponse(String token, String refreshToken, Long id, String email, List<String> roles, boolean onboardingCompleted) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.roles = roles;
        this.onboardingCompleted = onboardingCompleted;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isOnboardingCompleted() {
        return onboardingCompleted;
    }

    public void setOnboardingCompleted(boolean onboardingCompleted) {
        this.onboardingCompleted = onboardingCompleted;
    }
}
