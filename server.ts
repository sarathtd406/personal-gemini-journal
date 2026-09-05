import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

dotenv.config();

// Load Firebase configuration for auth token validation
let firebaseApiKey = '';
let firebaseProjectId = '';
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    firebaseApiKey = configData.apiKey || '';
    firebaseProjectId = configData.projectId || '';
  }
} catch (e) {
  console.error('Error loading firebase-applet-config.json:', e);
}

// Initialize official Firebase Admin SDK for server-side ID token verification
const adminApp = getAdminApps().length === 0
  ? initAdminApp({ projectId: firebaseProjectId || 'ai-agents-project-492205' })
  : getAdminApps()[0];
const adminAuth = getAdminAuth(adminApp);

// In-memory token verification cache (token -> { uid, email, expiresAt })
const tokenCache = new Map<string, { uid: string; email: string; expiresAt: number }>();

// Simple rate limiter per user UID (max 30 requests per 60 seconds)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 30;
  const userRate = rateLimitMap.get(uid);

  if (!userRate || now > userRate.resetTime) {
    rateLimitMap.set(uid, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRate.count >= maxRequests) {
    return false;
  }

  userRate.count += 1;
  return true;
}

// Periodic cleanup of expired rate limit and token cache entries (runs every 60 seconds)
export function cleanupExpiredEntries(): { cleanedRateLimits: number; cleanedTokens: number } {
  const now = Date.now();
  let cleanedRateLimits = 0;
  let cleanedTokens = 0;

  for (const [uid, rate] of rateLimitMap.entries()) {
    if (now > rate.resetTime) {
      rateLimitMap.delete(uid);
      cleanedRateLimits++;
    }
  }

  for (const [token, item] of tokenCache.entries()) {
    if (now > item.expiresAt) {
      tokenCache.delete(token);
      cleanedTokens++;
    }
  }

  return { cleanedRateLimits, cleanedTokens };
}

const cleanupInterval = setInterval(() => {
  cleanupExpiredEntries();
}, 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

// Lazy Gemini client initialization with standard aistudio-build telemetry header
let genAiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!genAiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is not configured in server runtime.');
    }
    genAiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Strip any sensitive credentials or keys from error messages before sending or logging
function sanitizeErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred during processing.';
  let msg = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
  // Redact potential API keys or authorization bearer tokens
  msg = msg.replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]');
  msg = msg.replace(/AIza[a-zA-Z0-9_\-]{30,45}/g, '[REDACTED_KEY]');
  msg = msg.replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
  return msg;
}

// Resilient Gemini model caller:
// Primary models: gemini-3.8-flash, gemini-3.6-flash, gemini-3.1-flash-lite, gemini-flash-latest
// Implements multi-model fallback and short backoff if a quota/rate-limit burst occurs
async function generateWithModelFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: any;
    config?: any;
  }
) {
  const models = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...requestParams,
        model,
      });
      return { response, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const status = err?.status;
      console.warn(`Gemini model ${model} invocation error:`, status || err?.message || 'Unknown');
      // If model not found (404), high demand / unavailable (503), or rate limit (429), try next fallback
      if (status === 404 || status === 503 || status === 429) {
        continue;
      }
      // For prompt syntax errors or 400s, break early
      break;
    }
  }

  // If all primary models were hit with 429, wait 3 seconds and retry with gemini-3.1-flash-lite or gemini-3.8-flash
  if (lastError?.status === 429) {
    console.log('Briefly backing off for 3 seconds due to rate limit, retrying...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    for (const retryModel of ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash']) {
      try {
        const response = await ai.models.generateContent({
          ...requestParams,
          model: retryModel,
        });
        return { response, modelUsed: retryModel };
      } catch (retryErr: any) {
        lastError = retryErr;
      }
    }
  }

  throw lastError;
}

// Authenticate Firebase ID Token using official Firebase Admin SDK verifyIdToken()
async function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header.' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token is empty.' });
  }

  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    (req as any).user = { uid: cached.uid, email: cached.email };
    return next();
  }

  try {
    // Official Firebase Admin SDK verification:
    // Verifies cryptographic signature, expiration, Firebase project audience, and authenticity.
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token identity.' });
    }

    // Cache verified token (respecting token expiration)
    const tokenExpMs = decodedToken.exp ? decodedToken.exp * 1000 : now + 5 * 60 * 1000;
    const cacheExpiresAt = Math.min(now + 5 * 60 * 1000, tokenExpMs);
    tokenCache.set(token, {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      expiresAt: cacheExpiresAt,
    });

    // Derive req.user.uid strictly from verified token
    (req as any).user = { uid: decodedToken.uid, email: decodedToken.email || '' };
    next();
  } catch (error: any) {
    console.error('Authentication verification error:', sanitizeErrorMessage(error));

    // Distinguish between invalid tokens (401) vs network/service outage (503)
    const errorCode = error?.code || '';
    if (
      errorCode === 'app/network-timeout' ||
      errorCode === 'app/network-error' ||
      error?.message?.includes('ETIMEDOUT') ||
      error?.message?.includes('ECONNREFUSED')
    ) {
      return res.status(503).json({ error: 'Authentication service temporarily unavailable. Please try again.' });
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token.' });
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parser with security size limit
  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Personal Gemini Journal API',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      projectId: firebaseProjectId,
    });
  });

  // 1. Multi-turn Conversational Journal endpoint
  app.post('/api/gemini/chat', authenticateUser, async (req, res) => {
    const user = (req as any).user;
    if (!checkRateLimit(user.uid)) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment before sending another message.' });
    }

    const { messages, userIntent } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Sanitize input
    const sanitizedMessages = messages.slice(-20).map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }));

    try {
      const ai = getGemini();

      const systemInstruction = `You are Personal Gemini Journal, a calm, deeply empathetic, and thoughtful digital journaling companion.
Your role is to guide the user in private reflection, brainstorming, mindful planning, and self-discovery.
Tone: Warm, grounded, perceptive, unhurried, and supportive.
Guidelines:
1. Listen closely to what the user shares. Reflect back meaningful observations.
2. Ask one gentle, open-ended guiding question at a time to help them explore their feelings, perspectives, or next steps.
3. Keep your replies focused, graceful, and natural (1 to 3 short paragraphs).
4. CRITICAL SAFETY DIRECTIVE: You are an introspective journaling companion, NOT a clinician, therapist, or medical professional. Never provide medical or psychological diagnosis. If the user expresses acute psychological crisis or intent of self-harm, compassionately guide them to certified help lines (e.g., 988 Suicide & Crisis Lifeline).`;

      // Convert to contents format for @google/genai
      const contents = sanitizedMessages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const { response } = await generateWithModelFallback(ai, {
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "I'm reflecting on your thoughts. What aspect feels most significant to you right now?";
      return res.json({ reply: replyText });
    } catch (error: any) {
      const safeError = sanitizeErrorMessage(error);
      console.error('Error generating chat reply:', safeError);
      return res.status(500).json({
        error: 'Unable to process your reflection right now. Please try again.',
      });
    }
  });

  // 2. Journal Summarizer (Extracts title, summary, key themes, action items)
  app.post('/api/gemini/summarize', authenticateUser, async (req, res) => {
    const user = (req as any).user;
    if (!checkRateLimit(user.uid)) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment.' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Transcript messages are required.' });
    }

    const transcriptText = messages
      .map((m: any) => `${m.role === 'model' ? 'Companion' : 'User'}: ${String(m.content || '').slice(0, 3000)}`)
      .join('\n\n');

    try {
      const ai = getGemini();

      const prompt = `Analyze the following private journal session transcript between a user and their journal companion.
Transcript:
---
${transcriptText}
---

Generate a structured reflection summary.
Requirements:
1. "title": A concise, reflective, meaningful title (max 7 words).
2. "summary": A thoughtful paragraph capturing the core essence, feelings, key shifts, and insights of this session (3-4 sentences).
3. "themes": An array of 2 to 5 succinct themes (e.g., "Work-Life Balance", "Creative Momentum", "Self-Compassion").
4. "actionItems": An array of 1 to 5 concrete intentions, practical steps, or mindful takeaways discussed.`;

      const { response, modelUsed } = await generateWithModelFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              themes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'summary', 'themes', 'actionItems'],
          },
          temperature: 0.3,
        },
      });

      console.log(`Journal summary generated successfully using model: ${modelUsed}`);
      const responseText = response.text || '{}';
      let parsed = {
        title: 'Reflective Journal Entry',
        summary: 'A mindful journal session exploring thoughts and intentions.',
        themes: ['Reflection', 'Personal Growth'],
        actionItems: ['Continue mindful practice'],
      };

      try {
        const rawParsed = JSON.parse(responseText);
        parsed = {
          title: String(rawParsed.title || 'Reflective Journal Entry').trim(),
          summary: String(rawParsed.summary || 'A mindful journal session exploring thoughts and intentions.').trim(),
          themes: Array.isArray(rawParsed.themes) && rawParsed.themes.length > 0
            ? rawParsed.themes.map((t: any) => String(t).trim()).filter(Boolean)
            : ['Reflection', 'Personal Growth'],
          actionItems: Array.isArray(rawParsed.actionItems) && rawParsed.actionItems.length > 0
            ? rawParsed.actionItems.map((a: any) => String(a).trim()).filter(Boolean)
            : ['Continue mindful practice'],
        };
      } catch (parseErr) {
        console.error('Failed to parse summary JSON from model response, using default structure');
      }

      return res.json(parsed);
    } catch (error: any) {
      const safeError = sanitizeErrorMessage(error);
      console.error('Error generating journal summary:', safeError);
      return res.status(500).json({
        error: 'Unable to generate the summary right now. Please try again.',
      });
    }
  });

  // 3. Weekly Reflection Analyzer (Analyzes ONLY the authenticated user's saved summaries)
  app.post('/api/gemini/weekly-reflection', authenticateUser, async (req, res) => {
    const user = (req as any).user;
    if (!checkRateLimit(user.uid)) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment.' });
    }

    const { summaries } = req.body;
    if (!summaries || !Array.isArray(summaries) || summaries.length === 0) {
      return res.status(400).json({ error: 'At least one journal summary is required to generate a reflection.' });
    }

    // Format summaries for privacy and focused analysis
    const formattedSummaries = summaries.slice(0, 30).map((s: any, idx: number) => {
      const themes = Array.isArray(s.themes) ? s.themes.join(', ') : '';
      const actions = Array.isArray(s.actionItems) ? s.actionItems.join('; ') : '';
      return `Entry ${idx + 1} (${s.createdAt ? s.createdAt.slice(0, 10) : 'Recent'}):
Title: ${String(s.title || 'Untitled')}
Summary: ${String(s.summary || '')}
Themes: ${themes}
Goals/Actions: ${actions}`;
    }).join('\n\n');

    try {
      const ai = getGemini();

      const prompt = `You are analyzing the personal journal summaries of ONE authenticated user over the past week/period.
Journal Summaries:
---
${formattedSummaries}
---

Your task is to provide a holistic Weekly Reflection synthesis that helps the user recognize their patterns, celebrate progress, and gently face friction.

STRICT SAFETY MANDATE:
- Do NOT provide medical or psychological diagnosis.
- Do NOT label medical or psychiatric disorders.
- Focus strictly on personal reflection, productivity, self-awareness, emotions, and mindful intentionality.`;

      const { response, modelUsed } = await generateWithModelFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themes: { type: Type.ARRAY, items: { type: Type.STRING } },
              goals: { type: Type.ARRAY, items: { type: Type.STRING } },
              interests: { type: Type.ARRAY, items: { type: Type.STRING } },
              concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
              reflectionQuestion: { type: Type.STRING },
              encouragement: { type: Type.STRING },
            },
            required: ['themes', 'goals', 'interests', 'concerns', 'reflectionQuestion', 'encouragement'],
          },
          temperature: 0.4,
        },
      });

      console.log(`Weekly reflection generated successfully using model: ${modelUsed}`);
      const responseText = response.text || '{}';
      let parsed = {
        themes: ['Consistency', 'Mindful Reflection'],
        goals: ['Maintain daily clarity'],
        interests: ['Self-discovery'],
        concerns: ['Pacing and balance'],
        reflectionQuestion: 'What is one thing you can release this week to create more ease in your days?',
        encouragement: 'Taking time to pause and reflect is an act of courage and kindness to yourself.',
      };

      try {
        const raw = JSON.parse(responseText);
        parsed = {
          themes: Array.isArray(raw.themes) ? raw.themes : parsed.themes,
          goals: Array.isArray(raw.goals) ? raw.goals : parsed.goals,
          interests: Array.isArray(raw.interests) ? raw.interests : parsed.interests,
          concerns: Array.isArray(raw.concerns) ? raw.concerns : parsed.concerns,
          reflectionQuestion: String(raw.reflectionQuestion || parsed.reflectionQuestion),
          encouragement: String(raw.encouragement || parsed.encouragement),
        };
      } catch (parseErr) {
        console.error('Failed to parse weekly reflection JSON, using default structure');
      }

      return res.json(parsed);
    } catch (error: any) {
      const safeError = sanitizeErrorMessage(error);
      console.error('Error generating weekly reflection:', safeError);
      return res.status(500).json({
        error: 'Unable to generate the weekly reflection right now. Please try again.',
      });
    }
  });

  // Vite middleware in dev; static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Gemini Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
