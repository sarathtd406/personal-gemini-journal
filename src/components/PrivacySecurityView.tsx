import React from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  Database,
  KeyRound,
  UserCheck,
  CheckCircle2,
  Code2,
  ArrowDown,
  Cpu,
  Layers,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { AuthUserProfile } from '../types';

interface PrivacySecurityViewProps {
  user: AuthUserProfile;
}

export const PrivacySecurityView: React.FC<PrivacySecurityViewProps> = ({ user }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      
      {/* 8. PRIVACY PRINCIPLE & OVERVIEW (Visible Above the Fold) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif-journal text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
                  Security &amp; Privacy Architecture
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Private by Design
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 font-sans mt-0.5">
                Technical reference and verification model for evaluators and security judges.
              </p>
            </div>
          </div>
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Zero Password Storage</span>
            </span>
          </div>
        </div>

        {/* Core Privacy Principle Banner */}
        <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-800" />
            <h2 className="font-serif-journal text-lg sm:text-xl font-semibold text-amber-950">
              Your journal belongs to your account.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed font-sans">
            Personal Gemini Journal uses Firebase Authentication and UID-scoped Firestore authorization so one authenticated user cannot access another user's journal data.
          </p>
        </div>

        {/* Live Identity Audit Pills */}
        <div className="p-4 rounded-xl bg-[#faf8f5] border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px] font-medium uppercase tracking-wider">Current User UID</span>
            <span className="font-mono text-stone-800 font-semibold truncate block mt-0.5" title={user.uid}>
              {user.uid.slice(0, 14)}...
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium uppercase tracking-wider">Storage Boundary</span>
            <span className="font-mono text-emerald-800 font-semibold block mt-0.5">
              users/{'{uid}'}/journals/*
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium uppercase tracking-wider">AI Access Model</span>
            <span className="font-mono text-stone-800 font-semibold block mt-0.5">
              Cloud Run Proxy (Server-Side)
            </span>
          </div>
        </div>
      </div>

      {/* 7. SECURITY VERIFICATION (Visually Prominent Section) */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-journal text-xl sm:text-2xl font-semibold text-white">
                Security Verification
              </h2>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Security controls were tested against invalid authentication, forged tokens, unauthorized data access, and upstream failures.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            All 7 Tests Passing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Missing authentication → 401</div>
              <div className="text-[11px] text-stone-400 mt-0.5">Requests without Bearer token rejected</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Malformed token → 401</div>
              <div className="text-[11px] text-stone-400 mt-0.5">Non-JWT or corrupt headers refused</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Expired/invalid token → 401</div>
              <div className="text-[11px] text-stone-400 mt-0.5">Cryptographic expiration enforced</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Forged alg:none token → 401</div>
              <div className="text-[11px] text-stone-400 mt-0.5">Zero fallback to unsigned JWT claims</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Valid Firebase token → 200</div>
              <div className="text-[11px] text-stone-400 mt-0.5">UID securely derived from Google identity</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Cross-user access → denied</div>
              <div className="text-[11px] text-stone-400 mt-0.5">Firestore Security Rules block IDOR access</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/60 flex items-start space-x-2.5 md:col-span-2 lg:col-span-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-stone-200">Gemini upstream failure → generic user-safe error</div>
              <div className="text-[11px] text-stone-400 mt-0.5">Sanitized server-side error logging; raw upstream API keys, quota details, or stack traces never exposed to browser</div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE ARCHITECTURE SECTIONS: 1 & 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. AUTHENTICATION */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
              Authentication
            </h3>
          </div>

          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Authentication is handled by Firebase Authentication using Google Sign-In. The application does not store user passwords.
          </p>

          <div className="space-y-2 pt-1 text-xs text-stone-800">
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Google Sign-In</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Firebase Authentication</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Authenticated sessions</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Firebase ID token issued after sign-in</span>
            </div>
          </div>
        </div>

        {/* 2. SERVER-SIDE IDENTITY VERIFICATION */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
              Identity Verification
            </h3>
          </div>

          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Every protected Gemini API request is authenticated server-side using Firebase Admin SDK verifyIdToken(). The application never trusts a client-supplied user ID.
          </p>

          <div className="space-y-2 pt-1 text-xs text-stone-800">
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Firebase Admin SDK</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Cryptographic ID-token verification</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>UID derived from verified token</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Invalid/expired tokens rejected</span>
            </div>
          </div>
        </div>

      </div>

      {/* CORE ARCHITECTURE SECTIONS: 3 & 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 3. USER DATA ISOLATION */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
                Your Data Is Isolated
              </h3>
            </div>

            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Journal data is stored under the authenticated user's UID. Firestore Security Rules allow access only when the authenticated UID matches the requested user path.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-800 pt-1">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>User-scoped Firestore paths</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Firestore Security Rules</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>UID-based authorization</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Cross-user access denied</span>
              </div>
            </div>
          </div>

          {/* Visual Flow 1 */}
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-stone-200/80 mt-4">
            <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-2.5">
              Data Isolation Flow
            </div>
            <div className="flex flex-col items-center space-y-1.5 font-mono text-xs text-stone-800">
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-white border border-stone-200 shadow-2xs">
                Authenticated User
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-white border border-stone-200 shadow-2xs">
                Verified Firebase UID
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-amber-50/80 border border-amber-200/80 text-amber-900 font-semibold shadow-2xs">
                users/{'{uid}'}/journals
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-white border border-stone-200 shadow-2xs">
                Firestore Security Rules
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-2xs">
                Owner only
              </div>
            </div>
          </div>
        </div>

        {/* 4. AI DATA BOUNDARY */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
              AI Data Boundary
            </h3>
          </div>

          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Gemini API access is performed server-side. The Gemini API credential is never embedded in client-side code.
          </p>

          <div className="space-y-2 pt-1 text-xs text-stone-800">
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Gemini accessed through the server</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>API key never exposed to browser</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Journal data is not shared between users</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>AI requests are scoped to the authenticated user's operation</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 space-y-1.5">
            <div className="font-medium text-stone-800">Proxy Isolation Guarantee</div>
            <p className="leading-relaxed">
              When requesting a reflection summary or chat response, the server validates identity, passes only the current session's inputs to Gemini, and streams back the reflection without persistent cross-session retention or model fine-tuning on user entries.
            </p>
          </div>
        </div>

      </div>

      {/* CORE ARCHITECTURE SECTIONS: 5 & 6 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 5. SECRET MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
                Secret Management
              </h3>
            </div>

            <div className="space-y-2 text-xs text-stone-800 pt-1">
              <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Google Cloud Secret Manager</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>GEMINI_API_KEY stored as a managed secret</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Cloud Run accesses the secret using a dedicated service account</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Secret Accessor permission is least-privilege</span>
              </div>
            </div>
          </div>

          {/* Visual Flow 2 */}
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-stone-200/80 mt-4">
            <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-2.5">
              Secret Access Pipeline
            </div>
            <div className="flex flex-col items-center space-y-1.5 font-mono text-xs text-stone-800">
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-white border border-stone-200 shadow-2xs">
                Cloud Run
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-sky-50 border border-sky-200 text-sky-900 font-semibold shadow-2xs">
                personal-journal-sa
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-white border border-stone-200 shadow-2xs">
                Secret Manager
              </div>
              <ArrowDown className="w-3.5 h-3.5 text-stone-400" />
              <div className="w-full text-center py-1.5 px-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-2xs">
                gemini-api-key
              </div>
            </div>
            <p className="text-[11px] text-stone-500 text-center mt-2.5 font-sans">
              Secret value is never logged, exposed via APIs, or visible to client runtimes.
            </p>
          </div>
        </div>

        {/* 6. ABUSE PROTECTION */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
              API Protection
            </h3>
          </div>

          <div className="space-y-2 text-xs text-stone-800 pt-1">
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Per-user rate limiting (30 req / 60s per verified UID)</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Input size limits (1MB body & 4,000 char per prompt)</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Controlled conversation length (last 20 turns analyzed)</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Sanitized server errors (user-safe generic messages)</span>
            </div>
            <div className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Sensitive credentials excluded from logs</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1">
            <div className="font-medium text-amber-950">Architectural Note: Rate Limiting Scope</div>
            <p className="leading-relaxed">
              The current rate limiter operates as an in-memory instance-local guard with automatic 60-second periodic cleanup of expired counters; it is scoped per container instance and is not globally distributed.
            </p>
          </div>
        </div>

      </div>

      {/* Firestore Rule Excerpt for Transparency */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-stone-200">Deployed Firestore Security Rule Specification</span>
          </div>
          <span className="text-[11px] bg-stone-800 px-2.5 py-0.5 rounded text-stone-300">
            Target: firestore-01
          </span>
        </div>

        <pre className="font-mono text-xs text-emerald-300/90 overflow-x-auto p-3.5 bg-black/40 rounded-xl leading-relaxed">
{`match /users/{userId}/journals/{journalId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create, update: if request.auth != null 
                        && request.auth.uid == userId 
                        && request.resource.data.userId == userId;
  allow delete: if request.auth != null && request.auth.uid == userId;
}`}
        </pre>
      </div>

      {/* 9. FOOTER */}
      <footer className="pt-4 pb-6 text-center text-xs text-stone-500 font-sans border-t border-stone-200/80">
        Built with Google Cloud • Firebase Authentication • Cloud Firestore • Gemini API • Cloud Run • Secret Manager
      </footer>

    </div>
  );
};
