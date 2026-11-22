# 🚀 Algo Ally Pro

**Algo Ally Pro** is an AI-powered technical interview preparation platform and developer ecosystem. It teaches algorithms, evaluates coding ability in a secure online judge, tracks interview readiness with transparent assessed analytics, and guides candidates through a structured, personalized placement journey.

---

## 🌟 Key Modules

### 1. 🤖 AI DSA Tutor
- Built with **FastAPI**, **LangChain**, and **RAG (Retrieval-Augmented Generation)** over a curated DSA knowledge base.
- **Multi-Level Explanations**:
  - **Beginner**: Intuition and real-world analogies.
  - **Intermediate**: Algorithmic logic and step-by-step walkthroughs.
  - **Advanced**: Time/space complexity proofs, CPU cache locality, and hardware-level trade-offs.
  - **Interview**: How to clearly communicate solutions to an interviewer.
- **Hint-First Progressive Mode**: Provides structured progressive hints (Conceptual &rarr; Directional &rarr; Algorithmic &rarr; Pseudocode &rarr; Solution) without giving away answers immediately.

### 2. 🛡️ Secure Online Coding Judge
- Sandboxed, isolated execution engine supporting **Java**, **Python**, **C**, and **C++**.
- Execution isolation: Isolated temporary directory, non-root execution, CPU and wall-clock execution timeouts (3.5s execution, 6s compile), 16KB output limit.
- Security sanitization: Blocks forbidden system calls, subprocess execution, reflection exploits, and network socket operations.
- Test Evaluation: Automatically validates code against hidden test cases and custom stdin inputs.

### 3. 🗺️ Personalized Adaptive DSA Roadmap
- Assessed topic mastery engine (Arrays & Strings, Binary Search, Linked Lists, Trees, Graphs, Dynamic Programming) calculated from verified test suite problem submissions.
- Prerequisite milestone locking and unlocking graph.

### 4. 🎙️ Mock Technical Interview Simulator
- Interactive AI technical interviewer for live practice rounds (DSA, Backend System Design, etc.).
- Evaluates problem comprehension, approach selection, correctness, edge-case coverage, and communication clarity.
- Generates a structured evaluation report with actionable placement feedback.

### 5. 🔍 AI Code Review & Debugging
- Static code inspection identifying logical vulnerabilities, boundary edge cases, time/space complexity bottlenecks, and optimization opportunities.

### 6. 📊 Placement Readiness Analytics
- Transparent readiness formula: 40% DSA Mastery + 25% Problem Solving + 20% Mock Interview + 15% Consistency.
- Interactive donut chart, sub-category breakdown, and personalized next action recommendations.
- Preserved and enhanced LeetCode statistics integration with explicit availability states (`AVAILABLE`, `UNAVAILABLE`, `STALE_DATA`).

---

## 🏗️ Architecture & Security Upgrades

```text
AlgoAllyPro/
├── algo-ally-suite-main/   # React + TypeScript + Vite + Tailwind + Shadcn UI
├── backend/                # Spring Boot (Java 17/24), Spring Security, JPA, Coding Judge
├── ai-service/             # FastAPI, LangChain, RAG, ChromaDB knowledge base
├── database/               # PostgreSQL (prod) / H2 (dev)
├── docker-compose.yml      # Multi-container local & production orchestration
└── .github/workflows/ci.yml # Automated CI test and build workflow
```

### Critical Security Issues Resolved:
1. **Spring Security**: Eliminated `anyRequest().permitAll()`. All authenticated APIs (`/api/profiles/**`, `/api/tasks/**`, `/api/submissions/**`, `/api/roadmap/**`, `/api/interviews/**`, `/api/ai/**`) are strictly secured with JWT authentication, custom 401 unauthorized and 403 access-denied handlers.
2. **Code Execution Sandbox**: Replaced direct host execution with `SandboxExecutionService` featuring process isolation, timeout enforcement, output limits, and automated cleanup.
3. **Identity System**: Replaced competing Supabase/Spring identities with Spring Boot as the unified source of truth.
4. **Persistent JWT Secrets**: Replaced in-memory ephemeral signing keys with persistent, configurable secrets (`JWT_SECRET`) and refresh token rotation (`RefreshTokenService`).
5. **LeetCode Status**: Eliminated zero-fallback deception. Explicit status flags (`AVAILABLE`, `UNAVAILABLE`, `STALE_DATA`) are returned with cached data indicators.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- JDK 17 or JDK 24
- Python 3.11+
- Maven

### Running the Services Locally

#### 1. Backend (Spring Boot on port 8081)
```bash
cd backend
./mvnw spring-boot:run
```
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI Docs: `http://localhost:8081/v3/api-docs`

#### 2. AI Service (Python FastAPI on port 8000)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
- Interactive AI Docs: `http://localhost:8000/docs`

#### 3. Frontend (React + Vite on port 5173)
```bash
cd algo-ally-suite-main
npm install --legacy-peer-deps
npm run dev
```

---

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
./mvnw test
```

### AI Service Tests
```bash
cd ai-service
pytest tests/
```

### Frontend Tests
```bash
cd algo-ally-suite-main
npm test
```

---

## 🐳 Docker Deployment

To launch the complete production stack (PostgreSQL, Spring Boot Backend, Python AI Microservice, Frontend):
```bash
docker compose up --build
```
Access the application at `http://localhost:3000`.
