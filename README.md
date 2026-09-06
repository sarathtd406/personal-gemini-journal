# Personal Gemini Journal

> Private-by-design, AI-augmented mindful reflection workspace powered by Google Cloud, Firebase, and the Gemini API.

---

## Architecture Diagram

```text
[ Browser / Client (React 19 + Vite + Tailwind) ]
       |                                |
       | 1. Google Sign-In & Auth       | 3. Direct Isolated DB Reads/Writes
       v                                v
[ Firebase Authentication ]     [ Cloud Firestore (Database: firestore-01) ]
       |                        Path: /users/{userId}/journals/*
       | (Firebase ID Token)    Rules: Owner-only matching request.auth.uid
       v
[ Backend API (Express.js on Cloud Run) ]
       |
       +---> Firebase Admin SDK: Cryptographic ID Token Verification (`verifyIdToken`)
       |
       +---> Secret Manager: Accesses GEMINI_API_KEY via Service Account
       |
       v
[ Google Gemini API (`@google/genai`) ]
(Multi-turn Conversational Journaling, Summarization, Weekly Reflection)
