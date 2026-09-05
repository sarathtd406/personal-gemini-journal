import React from 'react';
import { BookOpen, History, Sparkles, ShieldCheck, LogOut, Lock, Leaf } from 'lucide-react';
import { ActiveTab, AuthUserProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: AuthUserProfile;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-[#faf8f5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand & Privacy Indicator */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-800/10 text-amber-900 flex items-center justify-center border border-amber-900/15 shadow-xs">
            <BookOpen className="w-5 h-5 text-amber-900" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif-journal font-semibold text-stone-900 text-lg tracking-tight">
                Personal Gemini Journal
              </span>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <Lock className="w-3 h-3 text-emerald-700" />
                <span>Private & Encrypted</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 font-sans hidden sm:block">
              Private AI reflection workspace • Isolated Firestore data
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5" aria-label="Main Navigation">
          <button
            id="tab-new-journal"
            onClick={() => setActiveTab('new-journal')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'new-journal'
                ? 'bg-amber-900/10 text-amber-950 font-semibold border border-amber-900/20 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Leaf className="w-4 h-4 text-amber-800" />
            <span className="whitespace-nowrap">New Journal</span>
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-amber-900/10 text-amber-950 font-semibold border border-amber-900/20 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <History className="w-4 h-4 text-amber-800" />
            <span className="whitespace-nowrap">Journal History</span>
          </button>

          <button
            id="tab-weekly-reflection"
            onClick={() => setActiveTab('weekly-reflection')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'weekly-reflection'
                ? 'bg-amber-900/10 text-amber-950 font-semibold border border-amber-900/20 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span className="whitespace-nowrap">Weekly Reflection</span>
          </button>

          <button
            id="tab-privacy-security"
            onClick={() => setActiveTab('privacy-security')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'privacy-security'
                ? 'bg-amber-900/10 text-amber-950 font-semibold border border-amber-900/20 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span className="whitespace-nowrap hidden md:inline">Privacy & Security</span>
          </button>
        </nav>

        {/* User profile & Logout */}
        <div className="flex items-center space-x-3 pl-2 border-l border-stone-200/80">
          <div className="flex items-center space-x-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border border-stone-300 shadow-xs object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-xs font-semibold">
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-stone-800 leading-tight truncate max-w-[120px]">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-stone-500 truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
          </div>

          <button
            id="btn-logout"
            onClick={onLogout}
            title="Sign out of journal"
            className="p-2 text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
