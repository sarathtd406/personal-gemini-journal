import React, { useState } from 'react';
import { BookOpen, Shield, Lock, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { AuthUserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setErrorMsg('Browser popup was blocked. Please allow popups for this site or open in a new tab to complete Google Sign-In.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in was cancelled before completion.');
      } else {
        setErrorMsg(err?.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Banner */}
      <div className="border-b border-stone-200/80 px-6 py-4 bg-[#f7f4ee]/70 backdrop-blur-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-900/10 text-amber-900 flex items-center justify-center border border-amber-900/20">
              <BookOpen className="w-4 h-4 text-amber-900" />
            </div>
            <span className="font-serif-journal font-semibold text-stone-900 text-lg">
              Personal Gemini Journal
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-stone-600 bg-white/80 px-3 py-1 rounded-full border border-stone-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted • Private Workspace</span>
          </div>
        </div>
      </div>

      {/* Main Hero & Sign-in card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 sm:p-10 border border-stone-200 shadow-sm transition-all">
          
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 mb-1">
              <Sparkles className="w-7 h-7 text-amber-800" />
            </div>
            <h1 className="font-serif-journal text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              A mindful sanctuary for your thoughts.
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              Reflect with conversational AI, uncover recurring themes, and reflect on your growth with privacy-first isolation.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            id="btn-google-sign-in"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 px-5 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white font-medium text-sm transition-all duration-200 shadow-xs hover:shadow disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connecting securely...</span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.3.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 11.2 0 14c0 2.8.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Privacy Guarantees */}
          <div className="mt-8 pt-6 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Strict Firestore database isolation (<code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded text-[11px]">users/{"{uid}"}/...</code>)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Gemini AI API key kept strictly server-side (Cloud Run)</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Non-diagnostic personal reflection companion</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-stone-500 border-t border-stone-200/60">
        <p>Personal Gemini Journal • Built with Google Cloud AI & Firebase Firestore</p>
      </footer>
    </div>
  );
};
