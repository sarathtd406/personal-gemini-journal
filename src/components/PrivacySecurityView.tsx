import React from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  Database,
  KeyRound,
  EyeOff,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { AuthUserProfile } from '../types';

interface PrivacySecurityViewProps {
  user: AuthUserProfile;
}

export const PrivacySecurityView: React.FC<PrivacySecurityViewProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-journal text-2xl font-semibold text-stone-900">
              Security & Privacy Architecture
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Threat-model-driven design engineered for absolute privacy and data isolation.
            </p>
          </div>
        </div>

        {/* Live Identity Audit Box */}
        <div className="mt-6 p-4 rounded-xl bg-[#faf8f5] border border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px] font-medium uppercase tracking-wider">Authenticated Identity</span>
            <span className="font-mono text-stone-800 font-semibold truncate block mt-0.5" title={user.uid}>
              {user.uid.slice(0, 14)}...
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium uppercase tracking-wider">Firestore Target DB</span>
            <span className="font-mono text-emerald-800 font-semibold block mt-0.5">
              firestore-01 (Active)
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px] font-medium uppercase tracking-wider">Gemini Secret Mode</span>
            <span className="font-mono text-stone-800 font-semibold block mt-0.5">
              Cloud Secret Manager (Server)
            </span>
          </div>
        </div>
      </div>

      {/* Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: No Client Secrets */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="font-serif-journal text-base font-semibold text-stone-900">
            Zero Client-Side AI Keys
          </h3>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            The Gemini API key is managed server-side via Google Cloud Secret Manager. It is never transmitted to the browser, stored in local storage, or bundled into JavaScript assets.
          </p>
          <ul className="space-y-1.5 pt-2 text-xs text-stone-700">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Express backend proxies all AI requests</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>No stack traces or tokens leaked in responses</span>
            </li>
          </ul>
        </div>

        {/* Pillar 2: Strict Firestore Data Isolation */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="font-serif-journal text-base font-semibold text-stone-900">
            Cryptographic Data Isolation
          </h3>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Your journals are stored strictly at <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px] text-stone-800">users/{'{uid}'}/journals/{'{journalId}'}</code>. Firestore security rules cryptographically block IDOR and horizontal privilege escalation.
          </p>
          <ul className="space-y-1.5 pt-2 text-xs text-stone-700">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>User A can never read or mutate User B's entries</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Hardened path ID validation & length limits</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Verified User Identity */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="font-serif-journal text-base font-semibold text-stone-900">
            Server-Verified User Identity
          </h3>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Every backend API call requires a cryptographically signed Firebase ID token passed in the Authorization header. User UID is derived from the verified token, never from untrusted body parameters.
          </p>
          <ul className="space-y-1.5 pt-2 text-xs text-stone-700">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Identity verification prevents impersonation</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Rate limiting per verified UID blocks abuse</span>
            </li>
          </ul>
        </div>

        {/* Pillar 4: Non-Diagnostic Privacy & Safety */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-serif-journal text-base font-semibold text-stone-900">
            Private Synthesis & Non-Diagnostic Care
          </h3>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Weekly reflection analyzes only the authenticated user's saved entries. Journal contents are never logged on the server. The AI companion is bound by strict ethical guidelines.
          </p>
          <ul className="space-y-1.5 pt-2 text-xs text-stone-700">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>No clinical or psychological diagnosis provided</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>No cross-user pooling or training on your journals</span>
            </li>
          </ul>
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

    </div>
  );
};
