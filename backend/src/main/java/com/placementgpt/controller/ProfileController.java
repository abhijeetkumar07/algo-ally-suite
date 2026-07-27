package com.placementgpt.controller;

import com.placementgpt.model.Profile;
import com.placementgpt.model.User;
import com.placementgpt.repository.ProfileRepository;
import com.placementgpt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/sync-leetcode")
    public ResponseEntity<?> syncLeetcode(@RequestBody Map<String, Object> stats) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("[LeetCode Sync] Processing request for email: " + email);

            if (email == null || email.equals("anonymousUser")) {
                return ResponseEntity.status(401).body("User not authenticated. Please log in again.");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found for email: " + email));

            Profile profile = profileRepository.findByUserId(user.getId()).orElse(new Profile());
            profile.setUser(user);

            if (stats.containsKey("leetcodeUsername"))
                profile.setLeetcodeUsername((String) stats.get("leetcodeUsername"));

            // Handle potential Integer vs Double from JSON
            if (stats.containsKey("leetcodeEasy"))
                profile.setLeetcodeEasy(((Number) stats.get("leetcodeEasy")).intValue());
            if (stats.containsKey("leetcodeMedium"))
                profile.setLeetcodeMedium(((Number) stats.get("leetcodeMedium")).intValue());
            if (stats.containsKey("leetcodeHard"))
                profile.setLeetcodeHard(((Number) stats.get("leetcodeHard")).intValue());

            profile.setOnboardingCompleted(true);

            Profile saved = profileRepository.save(profile);
            System.out.println("[LeetCode Sync] Success for " + email);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("[LeetCode Sync] ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving profile: " + e.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody Profile updatedProfile) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId()).orElse(new Profile());
        profile.setUser(user);

        if (updatedProfile.getFullName() != null)
            profile.setFullName(updatedProfile.getFullName());
        if (updatedProfile.getCollege() != null)
            profile.setCollege(updatedProfile.getCollege());
        if (updatedProfile.getDegree() != null)
            profile.setDegree(updatedProfile.getDegree());
        if (updatedProfile.getGraduationYear() != null)
            profile.setGraduationYear(updatedProfile.getGraduationYear());
        if (updatedProfile.getTargetCompanyType() != null)
            profile.setTargetCompanyType(updatedProfile.getTargetCompanyType());
        if (updatedProfile.getDsaLevel() != null)
            profile.setDsaLevel(updatedProfile.getDsaLevel());
        if (updatedProfile.getPreferredTechStack() != null) {
            profile.setPreferredTechStack(updatedProfile.getPreferredTechStack());
        }

        if (updatedProfile.getLeetcodeUsername() != null)
            profile.setLeetcodeUsername(updatedProfile.getLeetcodeUsername());
        if (updatedProfile.getLeetcodeEasy() != null)
            profile.setLeetcodeEasy(updatedProfile.getLeetcodeEasy());
        if (updatedProfile.getLeetcodeMedium() != null)
            profile.setLeetcodeMedium(updatedProfile.getLeetcodeMedium());
        if (updatedProfile.getLeetcodeHard() != null)
            profile.setLeetcodeHard(updatedProfile.getLeetcodeHard());
        if (updatedProfile.getGithubUsername() != null)
            profile.setGithubUsername(updatedProfile.getGithubUsername());
        if (updatedProfile.getLinkedinUsername() != null)
            profile.setLinkedinUsername(updatedProfile.getLinkedinUsername());

        if (updatedProfile.isOnboardingCompleted())
            profile.setOnboardingCompleted(true);

        return ResponseEntity.ok(profileRepository.save(profile));
    }

}
