# Incident Response Agent (PS5 Community Edition)

## Problem Statement Selected

**PS5 Community Edition: Incident Response Agent**

Technical communities and open-source projects regularly face operational incidents, service outages, security concerns, and infrastructure failures. Learning from previous incidents is essential for improving response times.

Build an AI agent that remembers past incidents, root causes, mitigation strategies, and resolution processes. The agent should leverage previous experiences to recommend solutions when similar incidents occur in the future.

The project should clearly demonstrate how historical knowledge improves future incident management.

---

## Solution Overview

The **Incident Response Agent** is an AI-powered Site Reliability Engineering (SRE) assistant designed to handle the end-to-end incident lifecycle. Instead of relying purely on generalized LLM knowledge, it builds a **Semantic Vector Memory** of your organization's unique historical incidents. 

## Features Implemented

- 🚨 **Incident Command Center**: A sleek, real-time dashboard to monitor, track, and manage the lifecycle of ongoing system outages and security alerts.
- 🧠 **Semantic Vector Memory System**: Uses local Machine Learning (`sentence-transformers`) to convert resolved incidents into dense vector embeddings. Uses cosine similarity to mathematically match incoming incident symptoms with past resolutions.
- 🤖 **AI-Powered Root Cause Diagnosis**: Leverages the Groq LLM API to analyze the current failure alongside historical context, providing a root cause hypothesis, confidence score, impact analysis, and step-by-step mitigation strategies.
- 📝 **Automated RCA Generation**: Once an incident is marked as resolved by a human operator, the agent acts as a Senior SRE to automatically draft a comprehensive, blameless Markdown Post-Mortem report (including Impact, Timeline, Resolution, and Preventive Actions).
- 🎮 **Built-in Incident Simulator**: A sandbox feature to easily trigger realistic mock incidents (e.g., Database Connection Pool Exhaustion, Redis Eviction Storms, Security Brute Force) to test the agent's memory and diagnosis capabilities.

## Technology Stack Used

**Frontend:**
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Icons:** Lucide React

**Backend:**
- **Framework:** FastAPI (Python)
- **Database:** MongoDB
- **ODM / Driver:** Beanie & Motor (Async MongoDB)

**AI & Machine Learning:**
- **Large Language Models:** Groq API (High-speed inference)
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Vector Math:** `numpy` (Cosine similarity calculations)

## Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** running locally (port `27017`) or a remote MongoDB Atlas URI.
- A **Groq API Key** (Get one at [console.groq.com](https://console.groq.com/))

### 1. Backend Setup

1. Clone the repository and navigate to the project root.
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   
   # Windows:
   .\.venv\Scripts\activate
   # Mac/Linux:
   source .venv/bin/activate
   ```
3. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory and add your environment variables:
   ```env
   DATABASE_URL=mongodb://localhost:27017/incidentiq
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will be available at `http://localhost:8000`*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`*

### 3. Usage Guide
1. Open the frontend and navigate to the **Simulate Incident** page.
2. Trigger an incident to generate mock data.
3. Click **Diagnose** to have the AI attempt to find the root cause (Since memory is empty, the first diagnosis relies purely on LLM logic).
4. **Resolve** the incident to save the fix into the Semantic Memory database.
5. Trigger the *same* or a *similar* incident again. Click **Diagnose**, and you will see the AI successfully pull your past resolution from Memory and incorporate it into the new diagnosis!
6. Click **Generate RCA** on any resolved incident to create your automated Post-Mortem.