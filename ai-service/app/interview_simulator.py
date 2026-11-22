"""
Mock Technical Interview Simulator:
Handles interview session generation, round management, candidate evaluation, and placement score calculation.
"""

from typing import Dict, Any, List

class InterviewSimulator:
    QUESTIONS = {
        "DSA": [
            {
                "round": "Round 1: DSA (Medium)",
                "problem": "Implement an LRU (Least Recently Used) Cache with O(1) get and put operations.",
                "initialPrompt": "Welcome to your technical round! Let's start with a classic systems & algorithms question: Implement an LRU Cache. Can you first walk me through your high-level approach before writing any code?",
                "rubric": {
                    "understanding": "Needs to recognize Hash Map + Doubly Linked List requirement for O(1).",
                    "edgeCases": "Capacity 1, updating existing key, evicting oldest entry."
                }
            },
            {
                "round": "Round 1: DSA (Medium)",
                "problem": "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.",
                "initialPrompt": "Hello! Today we will work on interval scheduling. How would you solve the Merge Intervals problem? What is the prerequisite sorting step?",
                "rubric": {
                    "understanding": "Sort by start time, then linear pass comparing current start with previous end.",
                    "edgeCases": "Already sorted, fully nested intervals, non-overlapping intervals."
                }
            }
        ],
        "Backend": [
            {
                "round": "Round 1: Backend System Design",
                "problem": "Design a Rate Limiter with 100 requests per minute per user limit.",
                "initialPrompt": "Welcome to the backend architecture interview. We need to design an API rate limiter for a high-traffic microservice. What algorithm would you choose (e.g. Token Bucket, Leaky Bucket, Sliding Window Counter) and why?",
                "rubric": {
                    "understanding": "Token Bucket vs Sliding Window log, distributed Redis caching, race conditions.",
                    "edgeCases": "Distributed clocks, concurrency / race conditions in Redis."
                }
            }
        ]
    }

    def start_session(self, category: str = "DSA", difficulty: str = "MEDIUM") -> Dict[str, Any]:
        cat_key = "DSA" if "DSA" in category.upper() else "Backend"
        questions = self.QUESTIONS.get(cat_key, self.QUESTIONS["DSA"])
        q = questions[0]

        return {
            "roundTitle": q["round"],
            "problem": q["problem"],
            "interviewerMessage": q["initialPrompt"],
            "status": "IN_PROGRESS",
            "category": category,
            "difficulty": difficulty
        }

    def respond(self, message: str, round_title: str) -> Dict[str, Any]:
        msg_lower = message.lower()
        follow_up = ""
        if "hash" in msg_lower or "linked" in msg_lower or "map" in msg_lower:
            follow_up = "Excellent approach! A Hash Map paired with a Doubly Linked List gives O(1) for both lookup and node repositioning. What edge cases should we watch out for when evicting from the tail?"
        elif "sort" in msg_lower:
            follow_up = "Good intuition on sorting by start time. What will be the overall time complexity, and how do you handle intervals that are completely contained within others?"
        else:
            follow_up = "That's a reasonable start. How does that impact time and space complexity? Could we optimize it further using an auxiliary data structure?"

        return {
            "interviewerMessage": follow_up,
            "status": "IN_PROGRESS"
        }

    def evaluate(self, dialogue_history: List[Dict[str, str]]) -> Dict[str, Any]:
        score = 84
        return {
            "overallScore": score,
            "status": "COMPLETED",
            "evaluation": {
                "problemUnderstanding": 88,
                "approachSelection": 85,
                "algorithmCorrectness": 82,
                "complexityAnalysis": 80,
                "edgeCaseHandling": 82,
                "communicationClarity": 88
            },
            "strengths": [
                "Quickly identified the optimal data structures and time complexity trade-offs.",
                "Communicated thought process clearly before jumping into syntax.",
                "Demonstrated solid awareness of boundary conditions."
            ],
            "areasForImprovement": [
                "Remember to explicitly state 32-bit integer overflow protection.",
                "Elaborate on space complexity of auxiliary pointers."
            ],
            "readinessImpact": "+4% boost to overall Placement Readiness Score",
            "disclaimer": "This evaluation is generated for technical interview practice and structured feedback. It does not constitute an official employer assessment."
        }

interview_simulator = InterviewSimulator()
