package com.placementgpt.controller;

import com.placementgpt.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/algorithms")
@CrossOrigin(origins = "*")
public class AlgorithmController {

    @Autowired
    private AlgorithmService algorithmService;

    private final java.util.concurrent.ConcurrentHashMap<String, Long> rateLimits = new java.util.concurrent.ConcurrentHashMap<>();

    @PostMapping("/execute")
    public Map<String, Object> executeAlgorithm(@RequestBody Map<String, String> request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        long currentTime = System.currentTimeMillis();
        long lastTime = rateLimits.getOrDefault(clientIp, 0L);

        if (currentTime - lastTime < 2000) { // 2 seconds limit
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", "Rate limit exceeded. Please wait a few seconds before executing again.");
            error.put("status", "error");
            return error;
        }
        rateLimits.put(clientIp, currentTime);

        String code = request.get("code");
        String algorithmName = request.get("name");
        String language = request.getOrDefault("language", "java");
        return algorithmService.runAlgorithm(algorithmName, code, language);
    }

    @GetMapping("/status")
    public String getStatus() {
        return "Algorithm Engine is online";
    }
}
