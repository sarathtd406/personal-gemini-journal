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


## Cloud Run Deployment Instructions

1. Prerequisites

> Google Cloud Project with Cloud Run, Cloud Build, and Secret Manager enabled.

Authenticated gcloud CLI:
    gcloud auth login
    gcloud config set project <Project ID>

2. Store Gemini Secret in Secret Manager

> echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

3. Deploy from Source

Deploy directly using Google Cloud Buildpacks (Cloud Run runs npm run build and npm start automatically):
code Bash

gcloud run deploy personal-gemini-journal \
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
