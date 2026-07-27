package com.placementgpt.service;

import org.springframework.stereotype.Service;
import javax.tools.*;
import java.io.*;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
public class AlgorithmService {

    public Map<String, Object> runAlgorithm(String name, String code, String language) {
        if (language == null)
            language = "java";
        language = language.toLowerCase();

        switch (language) {
            case "python":
                return runPython(code);
            case "cpp":
                return runCpp(code);
            case "c":
                return runC(code);
            case "java":
            default:
                return runJava(code);
        }
    }

    private Map<String, Object> runPython(String code) {
        Map<String, Object> result = new HashMap<>();
        try {
            Path tempFile = Files.createTempFile("algo-", ".py");
            Files.writeString(tempFile, code);
            return executeProcess(new String[] { "python", tempFile.toString() });
        } catch (Exception e) {
            result.put("error", "Python Execution Error: " + e.getMessage());
            result.put("status", "error");
            return result;
        }
    }

    private Map<String, Object> runCpp(String code) {
        return runCompiled(code, ".cpp", "g++");
    }

    private Map<String, Object> runC(String code) {
        return runCompiled(code, ".c", "gcc");
    }

    private Map<String, Object> runCompiled(String code, String ext, String compiler) {
        Map<String, Object> result = new HashMap<>();
        try {
            Path tempDir = Files.createTempDirectory("compile-");
            Path sourceFile = tempDir.resolve("solution" + ext);
            Path exeFile = tempDir.resolve("solution.exe");
            Files.writeString(sourceFile, code);

            // Compile
            Map<String, Object> compileRes = executeProcess(
                    new String[] { compiler, sourceFile.toString(), "-o", exeFile.toString() });
            if (!"success".equals(compileRes.get("status"))) {
                String errorDetails = (String) compileRes.getOrDefault("output", compileRes.get("error"));
                compileRes.put("error", "Compilation Failed:\n" + errorDetails);
                return compileRes;
            }

            // Execute
            return executeProcess(new String[] { exeFile.toString() });
        } catch (Exception e) {
            result.put("error", compiler + " Error: " + e.getMessage());
            result.put("status", "error");
            return result;
        }
    }

    private Map<String, Object> executeProcess(String[] command) {
        Map<String, Object> result = new HashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newSingleThreadExecutor();
            java.util.concurrent.Future<String> outputFuture = executor.submit(() -> {
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                StringBuilder output = new StringBuilder();
                String line;
                int length = 0;
                int MAX_OUTPUT_LENGTH = 10000;
                while ((line = reader.readLine()) != null) {
                    if (length > MAX_OUTPUT_LENGTH) {
                        output.append("\n...[Output Truncated]...");
                        break;
                    }
                    output.append(line).append("\n");
                    length += line.length() + 1;
                }
                return output.toString();
            });

            boolean finished = process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                executor.shutdownNow();
                result.put("error", "Execution Timeout: Code took >5s (check for infinite loops).");
                result.put("status", "fail");
                return result;
            }

            String output = outputFuture.get(1, java.util.concurrent.TimeUnit.SECONDS);
            executor.shutdownNow();

            int exitCode = process.exitValue();
            result.put("output", output);
            result.put("status", exitCode == 0 ? "success" : "fail");
            if (exitCode != 0)
                result.put("error", "Exit code: " + exitCode);
        } catch (Exception e) {
            result.put("error", "Process Execution Failed: " + e.getMessage());
            result.put("status", "error");
        }
        return result;
    }

    private Map<String, Object> runJava(String code) {
        Map<String, Object> result = new HashMap<>();
        try {
            Path tempDir = Files.createTempDirectory("java-exec-");
            String className = "DynamicAlgorithm";
            java.util.regex.Pattern classPattern = java.util.regex.Pattern.compile("class\\s+([a-zA-Z0-9_]+)");
            java.util.regex.Matcher matcher = classPattern.matcher(code);

            if (matcher.find()) {
                className = matcher.group(1);
            } else {
                code = "public class " + className + " {\n" +
                        "    public Object execute() {\n" +
                        "        " + code + "\n" +
                        "        return \"Execution complete\";\n" +
                        "    }\n" +
                        "}";
            }

            Path javaFile = tempDir.resolve(className + ".java");

            if (code.contains("Scanner") && code.contains("System.in")) {
                result.put("error",
                        "Interactive input (Scanner with System.in) is not supported in the playground yet. Please initialize your variables directly (e.g., int a = 10;) so your code can execute instantly!");
                result.put("status", "fail");
                return result;
            }

            Files.writeString(javaFile, code);

            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            if (compiler == null) {
                result.put("error", "JDK is required for Java! Please ensure you're on a JDK.");
                return result;
            }

            DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
            StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);
            Iterable<? extends JavaFileObject> units = fileManager
                    .getJavaFileObjectsFromFiles(Arrays.asList(javaFile.toFile()));

            JavaCompiler.CompilationTask task = compiler.getTask(null, fileManager, diagnostics, null, null, units);
            boolean success = task.call();
            fileManager.close();

            if (success) {
                URLClassLoader classLoader = URLClassLoader.newInstance(new URL[] { tempDir.toUri().toURL() });
                Class<?> cls = Class.forName(className, true, classLoader);
                Object instance = cls.getDeclaredConstructor().newInstance();
                final Object finalInstance = instance;
                final Class<?> finalCls = cls;

                // Execute with 5-second timeout to prevent server hangs
                java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors
                        .newSingleThreadExecutor();
                java.util.concurrent.Future<Map<String, Object>> future = executor.submit(() -> {
                    Map<String, Object> innerResult = new HashMap<>();
                    PrintStream originalOut = System.out;
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    try (PrintStream newOut = new PrintStream(baos)) {
                        System.setOut(newOut);
                        Object output = null;
                        try {
                            java.lang.reflect.Method executeMethod = finalCls.getMethod("execute");
                            output = executeMethod.invoke(finalInstance);
                        } catch (NoSuchMethodException e) {
                            try {
                                java.lang.reflect.Method mainMethod = finalCls.getMethod("main", String[].class);
                                String[] args = new String[0];
                                mainMethod.invoke(null, (Object) args);
                            } catch (NoSuchMethodException e2) {
                                output = "Class compiled (no execute/main found)";
                            }
                        }
                        System.out.flush();
                        innerResult.put("captured", baos.toString());
                        innerResult.put("returned", output);
                    } catch (Exception e) {
                        innerResult.put("error", e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
                    } finally {
                        System.setOut(originalOut);
                    }
                    return innerResult;
                });

                try {
                    Map<String, Object> execRes = future.get(5, java.util.concurrent.TimeUnit.SECONDS);
                    if (execRes.containsKey("error")) {
                        result.put("output", "Runtime Error: " + execRes.get("error"));
                    } else {
                        String captured = (String) execRes.getOrDefault("captured", "");
                        Object returned = execRes.get("returned");
                        if (returned != null && !returned.toString().isEmpty()
                                && !returned.toString().contains("Class compiled")) {
                            result.put("output", captured + "\nResult: " + returned);
                        } else {
                            result.put("output", captured.isEmpty() ? "Execution complete (no output)" : captured);
                        }
                    }
                    result.put("status", "success");
                } catch (java.util.concurrent.TimeoutException e) {
                    future.cancel(true);
                    result.put("error",
                            "Execution Timeout: Code took >5s (check for infinite loops or unsupported Scanner calls).");
                    result.put("status", "fail");
                } catch (Exception e) {
                    result.put("error", "Execution Failed: " + e.getMessage());
                    result.put("status", "error");
                } finally {
                    executor.shutdownNow();
                }

            } else {
                StringBuilder sb = new StringBuilder();
                for (Diagnostic<? extends JavaFileObject> d : diagnostics.getDiagnostics()) {
                    sb.append(String.format("Line %d: %s%n", d.getLineNumber(), d.getMessage(null)));
                }
                result.put("error", sb.toString());
                result.put("status", "fail");
            }
        } catch (Exception e) {
            result.put("error", "Java Error: " + e.getMessage());
            result.put("status", "error");
        }
        return result;
    }
}
