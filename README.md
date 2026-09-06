# Personal Gemini Journal

> Private-by-design, AI-augmented mindful reflection workspace powered by Google Cloud, Firebase, and the Gemini API.

---

## Architecture Diagram

<img width="749" height="796" alt="Architecture" src="https://github.com/user-attachments/assets/5e19a011-f4e5-477b-b01d-78b15508189f" />


## Frontend + Backend Source

This repository is organized as a unified full-stack TypeScript project:

**Frontend (src/):**

src/App.tsx: Main application container and tab navigation state.

src/components/: Modular views (JournalEditor, HistoryView, WeeklyReflectionView, PrivacySecurityView, AuthScreen, Header).

src/lib/firebase.ts: Firebase client SDK initialization (Auth, Firestore, Google Sign-In provider).

src/lib/geminiApi.ts: Client HTTP service dispatching authenticated requests with Firebase Bearer tokens to /api/gemini/*.

**Backend (server.ts):**

Express.js API server running on Node.js (listens on 0.0.0.0:${PORT || 3000}).

authenticateUser middleware: Validates Firebase ID tokens using the official Firebase Admin SDK (verifyIdToken()).

Protected endpoints: /api/gemini/chat, /api/gemini/summarize, /api/gemini/weekly-reflection.

Security controls: In-memory per-UID rate limiting, request size caps (1MB), and sanitized error logs.

Static SPA serving: Delivers bundled Vite assets from dist/ in production mode.
