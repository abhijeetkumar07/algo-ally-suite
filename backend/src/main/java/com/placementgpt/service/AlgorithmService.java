package com.placementgpt.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AlgorithmService {

    @Autowired
    private SandboxExecutionService sandboxExecutionService;

    public Map<String, Object> runAlgorithm(String name, String code, String language) {
        if (language == null) language = "java";
        language = language.toLowerCase();

        SandboxExecutionService.ExecutionResult res = sandboxExecutionService.runCustomInput(code, language, "");

        Map<String, Object> response = new HashMap<>();
        response.put("name", name);
        response.put("language", language);
        response.put("status", "ACCEPTED".equals(res.status) ? "success" : "fail");
        response.put("executionTimeMs", res.executionTimeMs);
        response.put("memoryKb", res.memoryKb);

        if ("ACCEPTED".equals(res.status)) {
            response.put("output", res.output != null ? res.output : "");
        } else {
            response.put("error", res.compilerOutput != null && !res.compilerOutput.isEmpty() ? res.compilerOutput : res.status);
            response.put("output", res.output != null ? res.output : "");
        }
        return response;
    }
}
