"""
Automated unit tests for Algo Ally Pro AI Service.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_tutor_multilevel():
    payload = {
        "query": "Explain binary search like I'm a beginner.",
        "level": "Beginner",
        "hintMode": False
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data
    assert "allLevels" in data
    assert "Beginner" in data["allLevels"]
    assert "Interview" in data["allLevels"]

def test_tutor_hint_mode():
    payload = {
        "query": "Two Sum",
        "hintMode": True,
        "hintStage": 1
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["hintMode"] is True
    assert data["stage"] == 1
    assert "Conceptual Hint" in data["stageName"]

def test_code_review():
    code = """
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            System.out.println(i + j);
        }
    }
    """
    response = client.post("/api/code-review", json={"code": code, "language": "java"})
    assert response.status_code == 200
    data = response.json()
    assert "timeComplexity" in data
    assert data["timeComplexity"] == "O(n²)"

def test_interview_flow():
    # 1. Start interview
    start_res = client.post("/api/interview/start", json={"category": "DSA", "difficulty": "MEDIUM"})
    assert start_res.status_code == 200
    start_data = start_res.json()
    assert "roundTitle" in start_data
    assert "interviewerMessage" in start_data

    # 2. Respond to interviewer
    resp_res = client.post("/api/interview/respond", json={
        "message": "I will use a Hash Map combined with a Doubly Linked List for O(1) time.",
        "roundTitle": start_data["roundTitle"]
    })
    assert resp_res.status_code == 200
    assert "interviewerMessage" in resp_res.json()

    # 3. Evaluate interview
    eval_res = client.post("/api/interview/evaluate", json={
        "dialogueHistory": [
            {"role": "interviewer", "content": start_data["interviewerMessage"]},
            {"role": "candidate", "content": "Hash map and doubly linked list"}
        ]
    })
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "overallScore" in eval_data
    assert eval_data["status"] == "COMPLETED"
