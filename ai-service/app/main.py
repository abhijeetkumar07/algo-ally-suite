"""
Algo Ally Pro - AI Service
FastAPI REST API orchestrating LangChain, RAG knowledge retrieval, AI DSA Tutor,
AI Code Review, and Mock Technical Interviews.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from .tutor import tutor
from .code_reviewer import code_reviewer
from .interview_simulator import interview_simulator
from .rag_engine import rag_engine

app = FastAPI(
    title="Algo Ally Pro - AI Microservice",
    description="Intelligent AI engine powering DSA tutoring, RAG retrieval, code review, and mock technical interviews.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TutorRequest(BaseModel):
    query: str
    level: Optional[str] = "Beginner"
    hintMode: Optional[bool] = False
    hintStage: Optional[int] = 1
    codeContext: Optional[str] = None

class CodeReviewRequest(BaseModel):
    code: str
    language: Optional[str] = "java"

class InterviewStartRequest(BaseModel):
    category: Optional[str] = "DSA"
    difficulty: Optional[str] = "MEDIUM"

class InterviewRespondRequest(BaseModel):
    message: str
    roundTitle: Optional[str] = "Round 1: DSA (Medium)"

class InterviewEvaluateRequest(BaseModel):
    dialogueHistory: List[Dict[str, str]]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Algo Ally Pro AI Service",
        "version": "1.0.0"
    }

@app.post("/api/tutor/chat")
def tutor_chat(req: TutorRequest):
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    return tutor.explain(
        query=req.query,
        level=req.level or "Beginner",
        hint_mode=req.hintMode or False,
        hint_stage=req.hintStage or 1,
        code_context=req.codeContext
    )

@app.post("/api/code-review")
def review_code(req: CodeReviewRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")
    return code_reviewer.review(req.code, req.language or "java")

@app.post("/api/interview/start")
def start_interview(req: InterviewStartRequest):
    return interview_simulator.start_session(
        category=req.category or "DSA",
        difficulty=req.difficulty or "MEDIUM"
    )

@app.post("/api/interview/respond")
def respond_interview(req: InterviewRespondRequest):
    return interview_simulator.respond(
        message=req.message,
        round_title=req.roundTitle or "Round 1: DSA (Medium)"
    )

@app.post("/api/interview/evaluate")
def evaluate_interview(req: InterviewEvaluateRequest):
    return interview_simulator.evaluate(req.dialogueHistory)

@app.get("/api/rag/search")
def search_knowledge(q: str):
    return rag_engine.retrieve(q)
