# Personal Gemini Journal

> Private-by-design, AI-augmented mindful reflection workspace powered by Google Cloud, Firebase, and the Gemini API.

---

## Architecture Diagram

                    ┌──────────────────────┐
                    │       Browser        │
                    │ Personal Gemini      │
                    │ Journal UI           │
                    └──────────┬───────────┘
                               │
                    Google Sign-In
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Firebase             │
                    │ Authentication       │
                    └──────────┬───────────┘
                               │
                         Verified UID
                               │
              ┌────────────────┴───────────────┐
              │                                │
              ▼                                ▼
   ┌──────────────────┐             ┌──────────────────┐
   │ Cloud Firestore  │             │    Cloud Run     │
   │                  │             │                  │
   │ users/{uid}/     │             │ Firebase Admin   │
   │ journals/*       │             │ verifyIdToken()  │
   │                  │             │        │         │
   │ Security Rules   │             │        ▼         │
   │ UID isolation    │             │ Gemini API       │
   └──────────────────┘             └────────┬─────────┘
                                             │
                                      Secret Manager
                                             │
                                      GEMINI_API_KEY
