package com.placementgpt.controller;

import com.placementgpt.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiService aiService;

    public static class TutorChatRequest {
        public String query;
        public String level = "Beginner";
        public Boolean hintMode = false;
        public Integer hintStage = 1;
        public String codeContext;
    }

    public static class CodeReviewApiRequest {
        public String code;
        public String language = "java";
    }

    public static class InterviewStartApiRequest {
        public String category = "DSA";
        public String difficulty = "MEDIUM";
    }

    public static class InterviewRespondApiRequest {
        public String message;
        public String roundTitle = "Round 1: DSA (Medium)";
    }

    public static class InterviewEvaluateApiRequest {
        public List<Map<String, String>> dialogueHistory;
    }

    @PostMapping("/tutor/chat")
    public ResponseEntity<?> tutorChat(@RequestBody TutorChatRequest req) {
        if (req.query == null || req.query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
        }
        return ResponseEntity.ok(aiService.tutorChat(req.query, req.level, req.hintMode, req.hintStage, req.codeContext));
    }

    @PostMapping("/code-review")
    public ResponseEntity<?> codeReview(@RequestBody CodeReviewApiRequest req) {
        if (req.code == null || req.code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code cannot be empty"));
        }
        return ResponseEntity.ok(aiService.codeReview(req.code, req.language));
    }

    @PostMapping("/interview/start")
    public ResponseEntity<?> startInterview(@RequestBody(required = false) InterviewStartApiRequest req) {
        String category = req != null && req.category != null ? req.category : "DSA";
        String difficulty = req != null && req.difficulty != null ? req.difficulty : "MEDIUM";
        return ResponseEntity.ok(aiService.startInterview(category, difficulty));
    }

    @PostMapping("/interview/respond")
    public ResponseEntity<?> respondInterview(@RequestBody InterviewRespondApiRequest req) {
        if (req.message == null || req.message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        return ResponseEntity.ok(aiService.respondInterview(req.message, req.roundTitle));
    }

    @PostMapping("/interview/evaluate")
    public ResponseEntity<?> evaluateInterview(@RequestBody InterviewEvaluateApiRequest req) {
        return ResponseEntity.ok(aiService.evaluateInterview(req.dialogueHistory));
    }
}
