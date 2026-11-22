package com.placementgpt.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placementgpt.model.Problem;
import com.placementgpt.model.Profile;
import com.placementgpt.model.Submission;
import com.placementgpt.model.User;
import com.placementgpt.repository.ProblemRepository;
import com.placementgpt.repository.ProfileRepository;
import com.placementgpt.repository.SubmissionRepository;
import com.placementgpt.repository.UserRepository;
import com.placementgpt.service.SandboxExecutionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionController.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private SandboxExecutionService sandboxExecutionService;

    public static class RunRequest {
        public Long problemId;
        public String code;
        public String language;
        public String customInput;
    }

    public static class SubmitRequest {
        public Long problemId;
        public String code;
        public String language;
    }

    @PostMapping("/run")
    public ResponseEntity<?> runCustomInput(@RequestBody RunRequest request) {
        if (request.code == null || request.code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code is required"));
        }

        SandboxExecutionService.ExecutionResult result = sandboxExecutionService.runCustomInput(
                request.code,
                request.language,
                request.customInput
        );

        Map<String, Object> resp = new HashMap<>();
        resp.put("status", result.status);
        resp.put("output", result.output);
        resp.put("compilerOutput", result.compilerOutput);
        resp.put("executionTimeMs", result.executionTimeMs);
        resp.put("memoryKb", result.memoryKb);
        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<?> submitSolution(@RequestBody SubmitRequest request) {
        User user = getCurrentUser();
        Problem problem = problemRepository.findById(request.problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found with id: " + request.problemId));

        List<SandboxExecutionService.TestCase> testCases = new ArrayList<>();
        try {
            if (problem.getHiddenTestCasesJson() != null && !problem.getHiddenTestCasesJson().isBlank()) {
                testCases = objectMapper.readValue(
                        problem.getHiddenTestCasesJson(),
                        new TypeReference<List<SandboxExecutionService.TestCase>>() {}
                );
            }
        } catch (Exception e) {
            logger.error("Failed to parse hidden test cases for problem {}: {}", problem.getId(), e.getMessage());
        }

        if (testCases.isEmpty()) {
            // Fallback default test case
            testCases.add(new SandboxExecutionService.TestCase("", ""));
        }

        SandboxExecutionService.ExecutionResult executionResult = sandboxExecutionService.executeAgainstTestCases(
                request.code,
                request.language,
                testCases,
                true
        );

        Submission submission = new Submission();
        submission.setUser(user);
        submission.setProblem(problem);
        submission.setCode(request.code);
        submission.setLanguage(request.language);
        submission.setStatus(executionResult.status);
        submission.setExecutionTimeMs(executionResult.executionTimeMs);
        submission.setMemoryKb(executionResult.memoryKb);
        submission.setTestCasesPassed(executionResult.testCasesPassed);
        submission.setTotalTestCases(executionResult.totalTestCases);
        submission.setCompilerOutput(executionResult.compilerOutput);
        submission.setCreatedAt(Instant.now());

        Submission saved = submissionRepository.save(submission);

        if ("ACCEPTED".equals(executionResult.status)) {
            updateStreakAndSolvedMetrics(user, problem);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("submissionId", saved.getId());
        response.put("status", saved.getStatus());
        response.put("testCasesPassed", saved.getTestCasesPassed());
        response.put("totalTestCases", saved.getTotalTestCases());
        response.put("executionTimeMs", saved.getExecutionTimeMs());
        response.put("memoryKb", saved.getMemoryKb());
        response.put("compilerOutput", saved.getCompilerOutput());
        response.put("output", executionResult.output);
        response.put("failedInput", executionResult.failedInput);
        response.put("expectedOutput", executionResult.expectedOutput);
        response.put("actualOutput", executionResult.actualOutput);
        response.put("createdAt", saved.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Submission>> getMySubmissions() {
        User user = getCurrentUser();
        return ResponseEntity.ok(submissionRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<Submission>> getProblemSubmissions(@PathVariable Long problemId) {
        User user = getCurrentUser();
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        return ResponseEntity.ok(submissionRepository.findByUserAndProblemOrderByCreatedAtDesc(user, problem));
    }

    private void updateStreakAndSolvedMetrics(User user, Problem problem) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) return;

        LocalDate today = LocalDate.now();
        LocalDate lastActive = profile.getLastActiveDate();

        if (lastActive == null) {
            profile.setCurrentStreak(1);
            profile.setTotalDaysActive(1);
        } else if (lastActive.equals(today.minusDays(1))) {
            profile.setCurrentStreak(profile.getCurrentStreak() + 1);
            profile.setTotalDaysActive(profile.getTotalDaysActive() + 1);
        } else if (!lastActive.equals(today)) {
            profile.setCurrentStreak(1);
            profile.setTotalDaysActive(profile.getTotalDaysActive() + 1);
        }

        if (profile.getCurrentStreak() > profile.getLongestStreak()) {
            profile.setLongestStreak(profile.getCurrentStreak());
        }

        profile.setLastActiveDate(today);
        profileRepository.save(profile);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }
}
