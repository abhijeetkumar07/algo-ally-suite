package com.placementgpt.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placementgpt.model.Profile;
import com.placementgpt.model.User;
import com.placementgpt.repository.ProfileRepository;
import com.placementgpt.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/leetcode")
@CrossOrigin(origins = "*")
public class LeetcodeController {

    private static final Logger logger = LoggerFactory.getLogger(LeetcodeController.class);
    private final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getLeetcodeStats(@RequestParam("username") String username) {
        logger.info("LeetCode sync request received for: {}", username);
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "FAILED",
                    "message", "LeetCode username cannot be empty."
            ));
        }

        String cleanUsername = username.trim();
        if (cleanUsername.contains("/")) {
            cleanUsername = cleanUsername.substring(cleanUsername.lastIndexOf("/") + 1).replace("/", "");
        }

        // Try 1: Official GraphQL
        try {
            Map<String, Object> stats = fetchFromGraphQL(cleanUsername);
            if (stats != null && stats.containsKey("totalSolved")) {
                stats.put("status", "AVAILABLE");
                stats.put("provider", "official_graphql");
                stats.put("syncedAt", Instant.now().toString());
                return ResponseEntity.ok(stats);
            }
        } catch (Exception e) {
            logger.warn("LeetCode GraphQL request failed for {}: {}", cleanUsername, e.getMessage());
        }

        // Try 2: Alternative Public Mirror APIs
        String[] providers = {
                "https://alfa-leetcode-api.onrender.com/userProfile/" + cleanUsername,
                "https://leetcode-api-faisalshohag.vercel.app/api/v1/" + cleanUsername,
                "https://leetcode-stats-api.herokuapp.com/" + cleanUsername
        };

        for (String urlStr : providers) {
            try {
                String body = fetchUrl(urlStr);
                if (body == null || body.isBlank()) continue;
                JsonNode root = mapper.readTree(body);
                JsonNode data = root.has("data") ? root.get("data")
                        : (root.has("matchedUser") ? root.get("matchedUser") : root);

                int easy = findInt(data, "easySolved", "easy_solved", "totalEasy", "easy");
                int medium = findInt(data, "mediumSolved", "medium_solved", "totalMedium", "medium");
                int hard = findInt(data, "hardSolved", "hard_solved", "totalHard", "hard");
                int total = findInt(data, "totalSolved", "total_solved", "totalCount", "total");

                if (total == 0) total = easy + medium + hard;
                if (total > 0 || (easy + medium + hard > 0)) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("easySolved", easy);
                    response.put("mediumSolved", medium);
                    response.put("hardSolved", hard);
                    response.put("totalSolved", total);
                    response.put("status", "AVAILABLE");
                    response.put("provider", "mirror_api");
                    response.put("syncedAt", Instant.now().toString());
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                logger.warn("LeetCode mirror provider {} failed: {}", urlStr, e.getMessage());
            }
        }

        // Try 3: Check cached stats from current authenticated user profile (STALE_DATA)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            Optional<User> userOpt = userRepository.findByEmail(auth.getName());
            if (userOpt.isPresent()) {
                Optional<Profile> profileOpt = profileRepository.findByUserId(userOpt.get().getId());
                if (profileOpt.isPresent()) {
                    Profile p = profileOpt.get();
                    if (cleanUsername.equalsIgnoreCase(p.getLeetcodeUsername()) &&
                            (p.getLeetcodeEasy() != null || p.getLeetcodeMedium() != null || p.getLeetcodeHard() != null)) {
                        int easy = p.getLeetcodeEasy() != null ? p.getLeetcodeEasy() : 0;
                        int medium = p.getLeetcodeMedium() != null ? p.getLeetcodeMedium() : 0;
                        int hard = p.getLeetcodeHard() != null ? p.getLeetcodeHard() : 0;
                        Map<String, Object> response = new HashMap<>();
                        response.put("easySolved", easy);
                        response.put("mediumSolved", medium);
                        response.put("hardSolved", hard);
                        response.put("totalSolved", easy + medium + hard);
                        response.put("status", "STALE_DATA");
                        response.put("message", "Live LeetCode sync temporarily unavailable. Displaying previously cached metrics.");
                        response.put("cached", true);
                        return ResponseEntity.ok(response);
                    }
                }
            }
        }

        // Never fake 0 as verified success. Return explicit UNAVAILABLE status.
        logger.warn("External LeetCode providers unreachable and no cached stats found for: {}", cleanUsername);
        Map<String, Object> unavailableResponse = new HashMap<>();
        unavailableResponse.put("status", "UNAVAILABLE");
        unavailableResponse.put("message", "External LeetCode providers are currently unreachable or the profile is private.");
        unavailableResponse.put("easySolved", null);
        unavailableResponse.put("mediumSolved", null);
        unavailableResponse.put("hardSolved", null);
        unavailableResponse.put("totalSolved", null);
        return ResponseEntity.status(503).body(unavailableResponse);
    }

    private int findInt(JsonNode node, String... keys) {
        for (String key : keys) {
            if (node.has(key) && !node.get(key).isNull()) {
                return node.get(key).asInt();
            }
        }
        return 0;
    }

    private Map<String, Object> fetchFromGraphQL(String username) throws Exception {
        URL url = new URL("https://leetcode.com/graphql");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        String query = "{\"query\":\"query getUserProfile($username: String!) { matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count } } } }\",\"variables\":{\"username\":\"" + username + "\"}}";

        try (OutputStream os = conn.getOutputStream()) {
            os.write(query.getBytes(StandardCharsets.UTF_8));
        }

        int code = conn.getResponseCode();
        if (code != 200) {
            throw new RuntimeException("HTTP response code: " + code);
        }

        try (InputStream is = conn.getInputStream()) {
            String jsonStr = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonNode root = mapper.readTree(jsonStr);
            JsonNode acSubmissions = root.path("data").path("matchedUser").path("submitStats").path("acSubmissionNum");

            if (acSubmissions.isArray()) {
                int easy = 0, medium = 0, hard = 0, total = 0;
                for (JsonNode item : acSubmissions) {
                    String diff = item.path("difficulty").asText();
                    int count = item.path("count").asInt();
                    if ("All".equalsIgnoreCase(diff)) total = count;
                    else if ("Easy".equalsIgnoreCase(diff)) easy = count;
                    else if ("Medium".equalsIgnoreCase(diff)) medium = count;
                    else if ("Hard".equalsIgnoreCase(diff)) hard = count;
                }
                if (total == 0) total = easy + medium + hard;

                Map<String, Object> res = new HashMap<>();
                res.put("easySolved", easy);
                res.put("mediumSolved", medium);
                res.put("hardSolved", hard);
                res.put("totalSolved", total);
                return res;
            }
        }
        return null;
    }

    private String fetchUrl(String urlStr) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(4000);
        conn.setReadTimeout(4000);
        conn.setRequestProperty("User-Agent", "AlgoAllyPro/1.0");

        int code = conn.getResponseCode();
        if (code != 200) return null;

        try (InputStream is = conn.getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
