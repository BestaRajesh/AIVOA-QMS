# AIVOA QMS — AI-Powered Pharmaceutical Complaint Management System

An AI-native **Pharmaceutical Complaint Management System (QMS)** designed to streamline complaint intake, intelligent data extraction, risk assessment, duplicate detection, investigation support, and CAPA recommendations.

## 🚀 Overview

AIVOA QMS helps pharmaceutical organizations manage customer complaints and non-conformities through an intelligent workflow.

The system combines a modern React frontend with AI-powered backend services to transform unstructured complaint information into structured, actionable quality data.

### Key Capabilities

* 📋 Pharmaceutical complaint intake
* 📄 PDF/document upload and AI extraction
* 🤖 AI-powered complaint classification
* 🔍 Duplicate complaint detection
* ⚠️ Risk and severity assessment
* 🧠 AI-generated complaint insights
* 🔬 Investigation assistance
* 🛠️ CAPA recommendations
* 📊 Quality management dashboard
* 🔎 Advanced complaint search and filtering
* 📝 Complaint lifecycle tracking
* 👥 Customer and healthcare entity management

## 🛠️ Tech Stack

### Frontend

* React
* JavaScript / TypeScript
* Vite
* Redux / Redux Toolkit
* Lucide React
* Custom CSS Design System (Google Inter Font, Glassmorphism)

### Backend

* Python
* FastAPI
* SQLAlchemy
* REST APIs

### AI Framework & LLMs

* LangGraph State Graph Workflow
* Groq API (`gemma2-9b-it`, `llama-3.3-70b-versatile`)
* AI-powered document extraction
* Complaint classification & 21 CFR 211.198 Regulatory Reportability Check
* 5-Whys & 6-M Ishikawa (Fishbone) Root Cause Analysis
* CAPA recommendation generation

### Database

* SQLite / PostgreSQL / MySQL with SQLAlchemy ORM

## 📂 Project Structure

```text
AIVOA-QMS/
├── backend/
│   ├── agents/
│   │   ├── langgraph_workflow.py
│   │   └── llm_client.py
│   ├── routers/
│   │   ├── complaints.py
│   │   ├── agents.py
│   │   ├── products.py
│   │   ├── capa.py
│   │   ├── analytics.py
│   │   └── settings.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── seed_data.py
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── DashboardView.jsx
│   │   │   ├── IntakeView.jsx
│   │   │   ├── AgentStudioView.jsx
│   │   │   ├── ComplaintDossierView.jsx
│   │   │   ├── CAPAHubView.jsx
│   │   │   └── SettingsModal.jsx
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   ├── complaintSlice.js
│   │   │   ├── agentSlice.js
│   │   │   ├── capaSlice.js
│   │   │   ├── analyticsSlice.js
│   │   │   └── uiSlice.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 📋 Complaint Intake Workflow

The complaint management workflow follows these stages:

```text
Complaint Intake
       ↓
Document / Form Processing
       ↓
AI Data Extraction
       ↓
Complaint Classification (Node 1)
       ↓
Batch Line Traceability (Node 2)
       ↓
RCA 5-Whys & Fishbone (Node 3)
       ↓
CAPA Recommendation (Node 4)
       ↓
21 CFR 211.198 Regulatory Check (Node 5)
       ↓
Quality Review & Closure
```

## 🧪 Example Complaint Scenarios

The application supports pharmaceutical quality scenarios such as:

### API Impurity / Discoloration Spike

Identifies complaints related to unexpected API impurity levels (e.g. Metformin Hydrochloride API yellowing) and assists with risk classification and investigation.

### Sterile Vial Seal / Packaging Defect

Processes complaints involving vial sealing defects, potential container closure issues (e.g. Ceftriaxone Injection glass micro-cracks), and product quality risks.

### USP Dissolution Non-Conformance

Handles complaints where customer or hospital testing shows dissolution rate failures (e.g. Paracetamol 500mg tablets at Day 30 stability).

## 📄 Document Intelligence

Users can upload complaint documents or PDFs.

The AI processing pipeline extracts important information such as:

* Customer / healthcare entity
* Customer type
* Country
* Product name
* Product category (API vs FDF)
* Batch number
* Manufacturing date
* Complaint description
* Event date
* Quantity affected
* Severity
* Potential patient impact
* Regulatory relevance (FDA 21 CFR 211.198)

Extracted information can then be reviewed and processed through the QMS workflow.

## 🤖 AI Intelligence

AIVOA QMS uses AI to assist quality teams with:

### Complaint Classification

Automatically identifies the relevant complaint category and quality domain.

### Risk Assessment

Evaluates complaint characteristics and helps determine appropriate priority and severity.

### Root Cause Analysis (RCA)

Generates 6-M Ishikawa (Fishbone) diagrams and 5-Whys cause-and-effect chains.

### CAPA Suggestions

Provides AI-assisted corrective and preventive action suggestions based on complaint information.

> AI-generated recommendations are intended to assist qualified quality professionals and should be reviewed before making quality or regulatory decisions.

## ⚙️ Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AIVOA
```

Install dependencies:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
python -m venv venv
venv\Scripts\python -m pip install fastapi uvicorn sqlalchemy pydantic groq langgraph pypdf
```

## ▶️ Development

Start the backend server:

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

Start the frontend development server:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🏗️ Production Build

Create a production build:

```bash
cd frontend
npm run build
```

## 🔐 Environment Variables

Do not commit API keys or secrets to GitHub.

Example:

```env
GROQ_API_KEY=gsk_your_groq_api_key
DATABASE_URL=sqlite:///./pharma_qms.db
PORT=8000
```

## 📊 Dashboard

The dashboard provides visibility into complaint activity and quality intelligence, including:

* Total complaints
* Open complaints
* Critical risk complaints
* Complaint status
* Product categories (API vs FDF)
* Defect pareto categories
* Recent complaint activity

## 🎯 Project Goals

AIVOA QMS is designed to demonstrate how AI can improve traditional pharmaceutical quality workflows by reducing manual data entry and helping quality teams process complaint information more efficiently.

The primary goals are:

1. Reduce manual complaint registration.
2. Extract structured information from unstructured documents.
3. Improve complaint triage.
4. Identify potentially high-risk cases earlier.
5. Detect duplicate or related complaints.
6. Assist investigators with AI-generated insights (Ishikawa & 5-Whys).
7. Support CAPA decision-making.
8. Provide a centralized complaint intelligence dashboard.

## ⚠️ Important

This application is a software demonstration and AI-assisted QMS prototype.

It does not replace validated pharmaceutical quality systems, qualified personnel, regulatory procedures, or required human review.

## 👨‍💻 Author

**BESTA RAJESH**

Full Stack Developer | AI Enthusiast

### Skills

* Java
* JavaScript
* TypeScript
* React.js
* Node.js / Python FastAPI
* Full Stack Development
* AI / Generative AI / LangGraph
* REST APIs
* Database Development

## 📜 License

This project is intended for educational, portfolio, and demonstration purposes.
