/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, mapFirebaseUser, logoutUser, testConnection } from './lib/firebase';
import { AuthUserProfile, ActiveTab, JournalEntry } from './types';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { NewJournalView } from './components/NewJournalView';
import { JournalHistoryView } from './components/JournalHistoryView';
import { WeeklyReflectionView } from './components/WeeklyReflectionView';
import { PrivacySecurityView } from './components/PrivacySecurityView';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('new-journal');

  useEffect(() => {
    // 1. Test connection to Firestore on initial boot (Firebase skill requirement)
    testConnection();

    // 2. Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(mapFirebaseUser(firebaseUser));
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setActiveTab('new-journal');
  };

  const handleJournalSaved = (_entry: JournalEntry) => {
    // Saved successfully, stay on session with summary or user can navigate
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-900/10 text-amber-900 flex items-center justify-center mx-auto border border-amber-900/15">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif-journal text-base font-semibold text-stone-800">
              Personal Gemini Journal
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Connecting securely to private workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col selection:bg-amber-100 selection:text-amber-950 text-stone-900 font-sans">
      {/* Persistent Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'new-journal' && (
          <NewJournalView
            user={user}
            onSavedSuccess={handleJournalSaved}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <JournalHistoryView
            user={user}
            onNavigateToNewJournal={() => setActiveTab('new-journal')}
          />
        )}

        {activeTab === 'weekly-reflection' && (
          <WeeklyReflectionView
            user={user}
            onNavigateToNewJournal={() => setActiveTab('new-journal')}
          />
        )}

        {activeTab === 'privacy-security' && (
          <PrivacySecurityView user={user} />
        )}
      </main>

      {/* Persistent Footer with Security Badges */}
      <footer className="border-t border-stone-200/80 bg-[#f7f4ee]/70 py-5 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              Google Cloud Run & Firestore (<code className="text-stone-700 font-mono text-[11px]">firestore-01</code>) • Server-Side Gemini 2.5 Flash
            </span>
          </div>
          <div className="text-[11px] text-stone-400">
            Personal reflection workspace • Non-diagnostic mindful AI
          </div>
        </div>
      </footer>
    </div>
  );
}
