"""
AI Code Reviewer: Performs structured static code inspection, complexity profiling,
edge-case identification, and optimization recommendations.
"""

from typing import Dict, Any, List
import re

class CodeReviewer:
    def review(self, code: str, language: str) -> Dict[str, Any]:
        lang = language.lower() if language else "java"
        issues: List[Dict[str, str]] = []
        optimizations: List[str] = []
        edge_cases: List[str] = []

        time_complexity = "O(n)"
        space_complexity = "O(1)"

        # Check for nested loops
        nested_loop = False
        if lang in ["java", "cpp", "c"]:
            for_matches = len(re.findall(r"\bfor\s*\(", code))
            while_matches = len(re.findall(r"\bwhile\s*\(", code))
            if for_matches + while_matches >= 2:
                nested_loop = True
                time_complexity = "O(n²)"
        elif lang == "python":
            for_matches = len(re.findall(r"\bfor\s+\w+\s+in\b", code))
            while_matches = len(re.findall(r"\bwhile\b", code))
            if for_matches + while_matches >= 2:
                nested_loop = True
                time_complexity = "O(n²)"

        if nested_loop:
            issues.append({
                "severity": "Medium",
                "type": "Algorithmic Efficiency",
                "message": "Nested iteration detected. If the dataset exceeds 10^4 elements, O(n²) may trigger Time Limit Exceeded (TLE)."
            })
            optimizations.append("Consider replacing the inner loop with a Hash Map or Two Pointers to reduce runtime to O(n) or O(n log n).")

        # Check for recursion without base case or deep recursion
        if "return" in code and ("(" in code):
            edge_cases.append("Check for recursion depth limit / stack overflow when input size N > 10^4.")

        # Common edge cases
        edge_cases.extend([
            "Empty input array or string (length == 0).",
            "Single element array (n == 1).",
            "Negative integer values or integer overflow beyond 32-bit signed limits [-2^31, 2^31 - 1].",
            "All elements identical or completely reverse-sorted."
        ])

        # Readability & Code Quality
        optimizations.append("Ensure variables have descriptive domain names rather than generic single letters where appropriate.")
        optimizations.append("Always handle invalid input early with guard clauses to minimize indentation levels.")

        summary = (
            f"Code analysis completed for {lang.upper()}. Detected time complexity is estimated at {time_complexity} "
            f"with auxiliary space complexity of {space_complexity}. "
            f"Review the highlighted edge cases and algorithmic optimizations below."
        )

        return {
            "summary": summary,
            "language": lang,
            "timeComplexity": time_complexity,
            "spaceComplexity": space_complexity,
            "issues": issues,
            "edgeCases": edge_cases,
            "optimizations": optimizations,
            "disclaimer": "Note: AI Code Review performs static heuristic analysis. Functional correctness must always be verified via the Online Coding Judge test suite."
        }

code_reviewer = CodeReviewer()
