package com.placementgpt.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/leetcode")
@CrossOrigin(origins = "*")
public class LeetcodeController {

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/stats")
    public ResponseEntity<?> getLeetcodeStats(@RequestParam("username") String username) {
        System.out.println(">>> [LeetCode] Sync Request Received for: " + username + " <<<");
        // Sanitization: Handle full URLs or dirty inputs
        String cleanUsername = username.trim();
        if (cleanUsername.contains("/")) {
            cleanUsername = cleanUsername.substring(cleanUsername.lastIndexOf("/") + 1).replace("/", "");
        }

        try {
            // 1. Official GraphQL
            try {
                Map<String, Object> stats = fetchFromGraphQL(cleanUsername);
                if (stats != null && stats.containsKey("totalSolved")) {
                    return ResponseEntity.ok(stats);
                }
            } catch (Exception e) {
                System.err.println("[LeetCode] GraphQL failed: " + e.getMessage());
            }

            // 2. Fallback Providers
            String[] providers = {
                    "https://alfa-leetcode-api.onrender.com/userProfile/" + cleanUsername,
                    "https://leetcode-api-faisalshohag.vercel.app/api/v1/" + cleanUsername,
                    "https://leetcode-stats-api.herokuapp.com/" + cleanUsername
            };

            for (String urlStr : providers) {
                try {
                    String body = fetchUrl(urlStr);
                    if (body == null || body.isBlank())
                        continue;
                    JsonNode root = mapper.readTree(body);
                    JsonNode data = root.has("data") ? root.get("data")
                            : (root.has("matchedUser") ? root.get("matchedUser") : root);

                    int easy = findInt(data, "easySolved", "easy_solved", "totalEasy", "easy");
                    int medium = findInt(data, "mediumSolved", "medium_solved", "totalMedium", "medium");
                    int hard = findInt(data, "hardSolved", "hard_solved", "totalHard", "hard");
                    int total = findInt(data, "totalSolved", "total_solved", "totalCount", "total");

                    if (total == 0)
                        total = easy + medium + hard;
                    if (total > 0 || (easy + medium + hard > 0)) {
                        return ResponseEntity.ok(Map.of("easySolved", easy, "mediumSolved", medium, "hardSolved", hard,
                                "totalSolved", total));
                    }
                } catch (Exception e) {
                    System.err.println("[LeetCode] Provider fail: " + e.getMessage());
                }
            }
        } catch (Exception globalEx) {
            System.err.println("[LeetCode] Global Logic Cluster-Fail: " + globalEx.getMessage());
        }

        // 3. THE "NEVER-FAIL" GUARANTEE
        // We return 0s so the frontend stays happy even if LeetCode is totally down.
        System.out.println("[LeetCode] Safe Mode activated for: " + cleanUsername);
        return ResponseEntity.ok(Map.of("easySolved", 0, "mediumSolved", 0, "hardSolved", 0, "totalSolved", 0, "status",
                "offline_fallback"));
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
        conn.setConnectTimeout(8000);
        conn.setReadTimeout(8000);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        String query = "{\"query\":\"query getUserProfile($username: String!) { matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count } } } }\",\"variables\":{\"username\":\""
                + username + "\"}}";

        try (java.io.OutputStream os = conn.getOutputStream()) {
            os.write(query.getBytes(StandardCharsets.UTF_8));
        }

        if (conn.getResponseCode() != 200)
            return null;

        JsonNode root = mapper.readTree(conn.getInputStream());
        JsonNode acSubmissionNum = root.path("data").path("matchedUser").path("submitStats").path("acSubmissionNum");

        if (acSubmissionNum.isMissingNode() || acSubmissionNum.isNull())
            return null;

        Map<String, Object> result = new HashMap<>();
        for (JsonNode item : acSubmissionNum) {
            String diff = item.path("difficulty").asText();
            int count = item.path("count").asInt();
            if (diff.equals("Easy"))
                result.put("easySolved", count);
            else if (diff.equals("Medium"))
                result.put("mediumSolved", count);
            else if (diff.equals("Hard"))
                result.put("hardSolved", count);
            else if (diff.equals("All"))
                result.put("totalSolved", count);
        }
        return result;
    }

    private String fetchUrl(String urlStr) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            if (conn.getResponseCode() != 200)
                return null;
            try (InputStream is = conn.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            return null;
        }
    }
}
