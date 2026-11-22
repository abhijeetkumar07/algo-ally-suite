package com.placementgpt.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placementgpt.model.InterviewSession;
import com.placementgpt.model.User;
import com.placementgpt.repository.InterviewSessionRepository;
import com.placementgpt.repository.UserRepository;
import com.placementgpt.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    public static class StartRequest {
        public String category = "DSA";
        public String difficulty = "MEDIUM";
    }

    public static class RespondRequest {
        public String message;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startInterview(@RequestBody(required = false) StartRequest req) {
        User user = getCurrentUser();
        String cat = req != null && req.category != null ? req.category : "DSA";
        String diff = req != null && req.difficulty != null ? req.difficulty : "MEDIUM";

        Map<String, Object> aiStart = aiService.startInterview(cat, diff);

        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setCategory(cat);
        session.setDifficulty(diff);
        session.setRoundTitle((String) aiStart.getOrDefault("roundTitle", "Round 1: DSA (Medium)"));
        session.setStatus("IN_PROGRESS");

        List<Map<String, String>> history = new ArrayList<>();
        history.add(Map.of(
                "role", "interviewer",
                "content", (String) aiStart.getOrDefault("interviewerMessage", "Welcome to your interview!")
        ));
        try {
            session.setDialogueHistoryJson(mapper.writeValueAsString(history));
        } catch (Exception ignored) {}

        InterviewSession saved = interviewSessionRepository.save(session);
        aiStart.put("sessionId", saved.getId());
        return ResponseEntity.ok(aiStart);
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody RespondRequest req) {
        User user = getCurrentUser();
        InterviewSession session = interviewSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<Map<String, String>> history = new ArrayList<>();
        try {
            if (session.getDialogueHistoryJson() != null) {
                history = mapper.readValue(session.getDialogueHistoryJson(), new TypeReference<List<Map<String, String>>>() {});
            }
        } catch (Exception ignored) {}

        history.add(Map.of("role", "candidate", "content", req.message));

        Map<String, Object> aiResp = aiService.respondInterview(req.message, session.getRoundTitle());
        String interviewerMsg = (String) aiResp.getOrDefault("interviewerMessage", "");
        history.add(Map.of("role", "interviewer", "content", interviewerMsg));

        try {
            session.setDialogueHistoryJson(mapper.writeValueAsString(history));
        } catch (Exception ignored) {}

        interviewSessionRepository.save(session);
        return ResponseEntity.ok(aiResp);
    }

    @PostMapping("/{id}/evaluate")
    public ResponseEntity<?> evaluate(@PathVariable Long id) {
        User user = getCurrentUser();
        InterviewSession session = interviewSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<Map<String, String>> history = new ArrayList<>();
        try {
            if (session.getDialogueHistoryJson() != null) {
                history = mapper.readValue(session.getDialogueHistoryJson(), new TypeReference<List<Map<String, String>>>() {});
            }
        } catch (Exception ignored) {}

        Map<String, Object> eval = aiService.evaluateInterview(history);
        session.setStatus("COMPLETED");
        session.setCompletedAt(Instant.now());
        if (eval.containsKey("overallScore")) {
            session.setOverallScore((Integer) eval.get("overallScore"));
        }
        try {
            session.setEvaluationJson(mapper.writeValueAsString(eval));
        } catch (Exception ignored) {}

        interviewSessionRepository.save(session);
        return ResponseEntity.ok(eval);
    }

    @GetMapping("/my")
    public ResponseEntity<List<InterviewSession>> getMySessions() {
        User user = getCurrentUser();
        return ResponseEntity.ok(interviewSessionRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable Long id) {
        User user = getCurrentUser();
        InterviewSession session = interviewSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(session);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
