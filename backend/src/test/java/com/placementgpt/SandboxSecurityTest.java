package com.placementgpt;

import com.placementgpt.service.SandboxExecutionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SandboxSecurityTest {

    @Autowired
    private SandboxExecutionService sandboxExecutionService;

    @Test
    public void testDangerousJavaCodeIsBlocked() {
        String dangerousCode = "public class Solution { public static void main(String[] args) { Runtime.getRuntime().exec(\"calc\"); } }";
        SandboxExecutionService.ExecutionResult result = sandboxExecutionService.runCustomInput(dangerousCode, "java", "");
        assertEquals("SECURITY_VIOLATION", result.status);
        assertTrue(result.compilerOutput.contains("Security Violation"));
    }

    @Test
    public void testDangerousPythonCodeIsBlocked() {
        String dangerousCode = "import os\nos.system('dir')";
        SandboxExecutionService.ExecutionResult result = sandboxExecutionService.runCustomInput(dangerousCode, "python", "");
        assertEquals("SECURITY_VIOLATION", result.status);
    }

    @Test
    public void testValidCodeRunsSuccessfully() {
        String safePython = "print('Hello AlgoAlly Pro')";
        SandboxExecutionService.ExecutionResult result = sandboxExecutionService.runCustomInput(safePython, "python", "");
        assertEquals("ACCEPTED", result.status);
        assertTrue(result.output.contains("Hello AlgoAlly Pro"));
    }
}
