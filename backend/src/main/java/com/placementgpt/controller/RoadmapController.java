package com.placementgpt.controller;

import com.placementgpt.model.User;
import com.placementgpt.repository.UserRepository;
import com.placementgpt.service.RoadmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roadmap")
@CrossOrigin(origins = "*")
public class RoadmapController {

    @Autowired
    private RoadmapService roadmapService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getRoadmap() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(roadmapService.getRoadmapAndReadiness(user));
    }
}
