# Personal Gemini Journal

Build a Personal Gemini Journal — a secure AI reflection space using Gemini, Firebase, Firestore and Cloud Run.

It doesn't just remember what you wrote. It analyzes your own journal history and creates a personalized Weekly Reflection.

- Firebase Authentication
- UID-scoped Firestore
- Google Gemini
- Cloud Run
- Secret Manager

**Private-by-design, AI-augmented mindful reflection workspace powered by Google Cloud, Firebase, and the Gemini API.**

---

## Architecture Diagram

<img width="749" height="796" alt="Architecture" src="https://github.com/user-attachments/assets/5e19a011-f4e5-477b-b01d-78b15508189f" />

## Cloud Run Deployment Instructions

1. Prerequisites

> Google Cloud Project with Cloud Run, Cloud Build, and Secret Manager enabled.

Authenticated gcloud CLI:

> gcloud auth login
> gcloud config set project <Project ID>

2. Store Gemini Secret in Secret Manager

> echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

3. Deploy from Source

Deploy directly using Google Cloud Buildpacks (Cloud Run runs npm run build and npm start automatically):
code Bash

> gcloud run deploy personal-gemini-journal \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --port 3000

4. Authorize Cloud Run Domain in Firebase Authentication

Once deployed, copy your Cloud Run service URL (https://<service-name>-<hash>-as.a.run.app):

> Go to Firebase Console -> Select project -> Authentication -> Settings.

> Under Authorized domains, click Add domain.

> Paste only your hostname (e.g. personal-gemini-journal-xxx.a.run.app).

## Local Deployment Commands

1. Install dependencies
> npm install

2. Start development server (port 3000 with Vite middleware)
> npm run dev

3. Run TypeScript type checks
> npm run lint

4. Compile production bundle (Vite + esbuild)
> npm run build

5. Start production server
> npm start

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


### Firestore Security & Data Isolation Capabilities

Personal Gemini Journal enforces a **zero-trust, private-by-design data model** at the database layer:

- **Cryptographic UID-Scoped Isolation**: All user entries are strictly scoped to `/users/{userId}/journals/{journalId}`. Security rules enforce that `request.auth.uid == userId`, making horizontal privilege escalation and IDOR (Insecure Direct Object Reference) impossible.
- **Strict Default-Deny Model**: A wildcard deny-all rule blocks unauthorized access across the entire document tree.
- **Granular Schema & Input Validation**: Document mutations require alphanumeric ID validation, schema boundary checks, payload field verification, and text length limits (e.g., maximum 500 characters for journal titles) before writes are committed.
- **Independent Database Partitioning**: Target database routing is pinned to the firestore database, isolating journaling collections from other cloud resources.
