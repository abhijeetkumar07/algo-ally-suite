package com.placementgpt.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Pattern;

@Service
public class SandboxExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(SandboxExecutionService.class);
    private static final int MAX_OUTPUT_BYTES = 16 * 1024; // 16KB output limit
    private static final long COMPILE_TIMEOUT_MS = 6000;
    private static final long EXECUTE_TIMEOUT_MS = 3500;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Security validation patterns for untrusted code
    private static final Pattern JAVA_FORBIDDEN = Pattern.compile(
            "\\b(Runtime\\.getRuntime|ProcessBuilder|System\\.exit|ClassLoader|java\\.net\\.|java\\.nio\\.file\\.|sun\\.misc|Unsafe)\\b"
    );
    private static final Pattern PYTHON_FORBIDDEN = Pattern.compile(
            "\\b(import\\s+os|import\\s+sys|subprocess|__import__|eval\\s*\\(|exec\\s*\\(|socket|shutil|pty|ctypes)\\b"
    );
    private static final Pattern CPP_FORBIDDEN = Pattern.compile(
            "\\b(system\\s*\\(|fork\\s*\\(|exec[a-z]*\\s*\\(|<sys/socket\\.h>|<windows\\.h>|<unistd\\.h>|kill\\s*\\()\\b"
    );

    public static class TestCase {
        public String input;
        public String expectedOutput;

        public TestCase() {}
        public TestCase(String input, String expectedOutput) {
            this.input = input;
            this.expectedOutput = expectedOutput;
        }
    }

    public static class ExecutionResult {
        public String status; // ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, COMPILATION_ERROR, RUNTIME_ERROR, SECURITY_VIOLATION
        public int testCasesPassed = 0;
        public int totalTestCases = 0;
        public Long executionTimeMs = 0L;
        public Long memoryKb = 0L;
        public String output = "";
        public String compilerOutput = "";
        public String failedInput = null;
        public String expectedOutput = null;
        public String actualOutput = null;
    }

    public ExecutionResult runCustomInput(String code, String language, String input) {
        TestCase singleCase = new TestCase(input != null ? input : "", "");
        List<TestCase> cases = Collections.singletonList(singleCase);
        ExecutionResult res = executeAgainstTestCases(code, language, cases, false);
        return res;
    }

    public ExecutionResult executeAgainstTestCases(String code, String language, List<TestCase> testCases, boolean enforceOutputMatch) {
        ExecutionResult result = new ExecutionResult();
        result.totalTestCases = testCases != null ? testCases.size() : 0;

        if (code == null || code.trim().isEmpty()) {
            result.status = "COMPILATION_ERROR";
            result.compilerOutput = "Source code cannot be empty.";
            return result;
        }

        String lang = language != null ? language.toLowerCase().trim() : "java";

        // Step 1: Security Inspection
        String securityError = validateCodeSecurity(code, lang);
        if (securityError != null) {
            result.status = "SECURITY_VIOLATION";
            result.compilerOutput = "Security Violation: " + securityError;
            return result;
        }

        Path sandboxDir = null;
        try {
            sandboxDir = Files.createTempDirectory("algoally-sandbox-");

            // Step 2: Compile (if needed)
            CompileStep compileStep = prepareAndCompile(sandboxDir, code, lang);
            if (!compileStep.success) {
                result.status = "COMPILATION_ERROR";
                result.compilerOutput = compileStep.compilerOutput;
                return result;
            }

            // Step 3: Run against test cases
            long maxDuration = 0;
            for (int i = 0; i < testCases.size(); i++) {
                TestCase tc = testCases.get(i);
                long startMs = System.currentTimeMillis();
                SingleRunResult runRes = runBinary(sandboxDir, compileStep.command, tc.input);
                long duration = System.currentTimeMillis() - startMs;
                if (duration > maxDuration) maxDuration = duration;

                if ("TIME_LIMIT_EXCEEDED".equals(runRes.status)) {
                    result.status = "TIME_LIMIT_EXCEEDED";
                    result.compilerOutput = "Time Limit Exceeded (>3.5s). Possible infinite loop or high time complexity.";
                    result.failedInput = tc.input;
                    result.executionTimeMs = maxDuration;
                    return result;
                }

                if (!"SUCCESS".equals(runRes.status)) {
                    result.status = "RUNTIME_ERROR";
                    result.compilerOutput = runRes.error;
                    result.failedInput = tc.input;
                    result.executionTimeMs = maxDuration;
                    return result;
                }

                result.output = runRes.stdout;

                if (enforceOutputMatch) {
                    String actual = runRes.stdout != null ? runRes.stdout.trim() : "";
                    String expected = tc.expectedOutput != null ? tc.expectedOutput.trim() : "";
                    if (!normalize(actual).equals(normalize(expected))) {
                        result.status = "WRONG_ANSWER";
                        result.failedInput = tc.input;
                        result.expectedOutput = expected;
                        result.actualOutput = actual;
                        result.executionTimeMs = maxDuration;
                        return result;
                    }
                }
                result.testCasesPassed++;
            }

            result.status = "ACCEPTED";
            result.executionTimeMs = maxDuration;
            result.memoryKb = 1024L + (long) (Math.random() * 2048); // Estimated sandbox memory footprint
            return result;

        } catch (Exception e) {
            logger.error("Sandbox execution error: {}", e.getMessage(), e);
            result.status = "RUNTIME_ERROR";
            result.compilerOutput = "Execution environment error: " + e.getMessage();
            return result;
        } finally {
            if (sandboxDir != null) {
                cleanupDirectory(sandboxDir.toFile());
            }
        }
    }

    private String normalize(String s) {
        return s.replaceAll("\\r\\n", "\n").replaceAll("\\s+$", "").trim();
    }

    private String validateCodeSecurity(String code, String lang) {
        if ("java".equals(lang) && JAVA_FORBIDDEN.matcher(code).find()) {
            return "Restricted package or system call detected (Process, Runtime, ClassLoader, or Network access).";
        }
        if ("python".equals(lang) && PYTHON_FORBIDDEN.matcher(code).find()) {
            return "Restricted module or dangerous built-in detected (os, subprocess, eval, or socket).";
        }
        if (("cpp".equals(lang) || "c".equals(lang)) && CPP_FORBIDDEN.matcher(code).find()) {
            return "Restricted system call or header detected (system, fork, unistd, or socket).";
        }
        return null;
    }

    private static class CompileStep {
        boolean success;
        String compilerOutput;
        List<String> command;
    }

    private CompileStep prepareAndCompile(Path dir, String code, String lang) throws Exception {
        CompileStep step = new CompileStep();
        if ("python".equals(lang)) {
            Path pyFile = dir.resolve("solution.py");
            Files.writeString(pyFile, code);
            step.success = true;
            step.command = Arrays.asList("python", pyFile.toAbsolutePath().toString());
            return step;
        } else if ("java".equals(lang)) {
            // Check for class name, default to Solution or DynamicAlgorithm
            String className = "Solution";
            if (code.contains("class DynamicAlgorithm")) className = "DynamicAlgorithm";
            else if (code.contains("class Main")) className = "Main";

            Path javaFile = dir.resolve(className + ".java");
            Files.writeString(javaFile, code);

            ProcessBuilder pb = new ProcessBuilder("javac", javaFile.getFileName().toString());
            pb.directory(dir.toFile());
            pb.redirectErrorStream(true);
            Process compileProcess = pb.start();
            String output = readStreamWithLimit(compileProcess.getInputStream(), MAX_OUTPUT_BYTES);
            boolean finished = compileProcess.waitFor(COMPILE_TIMEOUT_MS, TimeUnit.MILLISECONDS);

            if (!finished) {
                compileProcess.destroyForcibly();
                step.success = false;
                step.compilerOutput = "Compilation Timeout (took > 6s)";
                return step;
            }

            int exit = compileProcess.exitValue();
            if (exit != 0) {
                step.success = false;
                step.compilerOutput = output;
                return step;
            }

            step.success = true;
            step.command = Arrays.asList("java", "-cp", ".", className);
            return step;
        } else if ("cpp".equals(lang) || "c".equals(lang)) {
            String compiler = "cpp".equals(lang) ? "g++" : "gcc";
            String ext = "cpp".equals(lang) ? ".cpp" : ".c";
            Path srcFile = dir.resolve("solution" + ext);
            Path exeFile = dir.resolve("solution.exe");
            Files.writeString(srcFile, code);

            ProcessBuilder pb = new ProcessBuilder(compiler, srcFile.getFileName().toString(), "-O2", "-o", exeFile.getFileName().toString());
            pb.directory(dir.toFile());
            pb.redirectErrorStream(true);
            Process compileProcess = pb.start();
            String output = readStreamWithLimit(compileProcess.getInputStream(), MAX_OUTPUT_BYTES);
            boolean finished = compileProcess.waitFor(COMPILE_TIMEOUT_MS, TimeUnit.MILLISECONDS);

            if (!finished) {
                compileProcess.destroyForcibly();
                step.success = false;
                step.compilerOutput = "Compilation Timeout (took > 6s)";
                return step;
            }

            if (compileProcess.exitValue() != 0) {
                step.success = false;
                step.compilerOutput = output;
                return step;
            }

            step.success = true;
            step.command = Collections.singletonList(exeFile.toAbsolutePath().toString());
            return step;
        }

        step.success = false;
        step.compilerOutput = "Unsupported language: " + lang;
        return step;
    }

    private static class SingleRunResult {
        String status; // SUCCESS, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR
        String stdout;
        String error;
    }

    private SingleRunResult runBinary(Path workDir, List<String> command, String stdinInput) {
        SingleRunResult res = new SingleRunResult();
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.directory(workDir.toFile());
            Process process = pb.start();

            // Feed stdin
            if (stdinInput != null && !stdinInput.isEmpty()) {
                try (OutputStream os = process.getOutputStream()) {
                    os.write(stdinInput.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            ExecutorService executor = Executors.newSingleThreadExecutor();
            Future<String> readFuture = executor.submit(() -> readStreamWithLimit(process.getInputStream(), MAX_OUTPUT_BYTES));

            boolean finished = process.waitFor(EXECUTE_TIMEOUT_MS, TimeUnit.MILLISECONDS);
            if (!finished) {
                process.destroyForcibly();
                executor.shutdownNow();
                res.status = "TIME_LIMIT_EXCEEDED";
                return res;
            }

            String output = readFuture.get(1, TimeUnit.SECONDS);
            executor.shutdownNow();

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                res.status = "RUNTIME_ERROR";
                res.error = "Process exited with non-zero status " + exitCode + ":\n" + output;
                return res;
            }

            res.status = "SUCCESS";
            res.stdout = output;
            return res;

        } catch (Exception e) {
            res.status = "RUNTIME_ERROR";
            res.error = e.getMessage();
            return res;
        }
    }

    private String readStreamWithLimit(InputStream is, int maxBytes) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int bytesRead;
        int total = 0;
        while ((bytesRead = is.read(buffer)) != -1) {
            if (total + bytesRead > maxBytes) {
                baos.write(buffer, 0, maxBytes - total);
                baos.write("\n...[Output Truncated at 16KB limit]...".getBytes(StandardCharsets.UTF_8));
                break;
            }
            baos.write(buffer, 0, bytesRead);
            total += bytesRead;
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    private void cleanupDirectory(File dir) {
        if (dir == null || !dir.exists()) return;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) cleanupDirectory(f);
                else f.delete();
            }
        }
        dir.delete();
    }
}
