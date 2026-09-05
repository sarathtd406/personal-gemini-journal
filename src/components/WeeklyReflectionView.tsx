import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Layers,
  Target,
  Compass,
  AlertCircle,
  HelpCircle,
  Heart,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { WeeklyReflection, JournalEntry, AuthUserProfile } from '../types';
import { requestWeeklyReflection } from '../lib/api';
import {
  getUserJournals,
  getUserWeeklyReflections,
  saveWeeklyReflectionToDb,
} from '../lib/firebase';

interface WeeklyReflectionViewProps {
  user: AuthUserProfile;
  onNavigateToNewJournal: () => void;
}

export const WeeklyReflectionView: React.FC<WeeklyReflectionViewProps> = ({
  user,
  onNavigateToNewJournal,
}) => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [savedReflections, setSavedReflections] = useState<WeeklyReflection[]>([]);
  const [currentReflection, setCurrentReflection] = useState<WeeklyReflection | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingData(true);
    setErrorMsg(null);
    try {
      const [userJournals, reflections] = await Promise.all([
        getUserJournals(user.uid),
        getUserWeeklyReflections(user.uid),
      ]);
      setJournals(userJournals);
      setSavedReflections(reflections);
      if (reflections.length > 0 && !currentReflection) {
        setCurrentReflection(reflections[0]);
      }
    } catch (err: any) {
      console.error('Error loading reflection data:', err);
      setErrorMsg('Failed to load user data from Firestore.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.uid]);

  const handleGenerateReflection = async () => {
    if (journals.length === 0) {
      setErrorMsg('Please save at least one journal entry before generating a weekly reflection.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      // Extract ONLY the summaries, themes, and action items (never raw transcripts of other users)
      const summariesPayload = journals.slice(0, 25).map((j) => ({
        title: j.title,
        summary: j.summary,
        themes: j.themes,
        actionItems: j.actionItems,
        createdAt: j.createdAt,
      }));

      const result = await requestWeeklyReflection(summariesPayload);

      const newReflection: WeeklyReflection = {
        id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        userId: user.uid,
        themes: result.themes || [],
        goals: result.goals || [],
        interests: result.interests || [],
        concerns: result.concerns || [],
        reflectionQuestion: result.reflectionQuestion || 'What gave you the most peace this week?',
        encouragement: result.encouragement || 'Keep honoring your rhythm and self-reflection.',
        createdAt: new Date().toISOString(),
        analyzedEntriesCount: summariesPayload.length,
      };

      // Save in Firestore under users/{uid}/reflections/{reflectionId}
      await saveWeeklyReflectionToDb(user.uid, newReflection);

      setCurrentReflection(newReflection);
      setSavedReflections((prev) => [newReflection, ...prev]);
    } catch (err: any) {
      console.error('Weekly reflection generation error:', err);
      setErrorMsg(err.message || 'Failed to synthesize weekly reflection. Please verify your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <h2 className="font-serif-journal text-2xl font-semibold text-stone-900">
              Weekly Reflection
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/60">
              Multi-entry AI Synthesis
            </span>
          </div>
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            Analyzes <strong className="font-semibold text-stone-800">ONLY your authenticated journal summaries</strong> ({journals.length} available) to surface recurring themes, repeated goals, and emerging interests.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            id="btn-generate-weekly-reflection"
            onClick={handleGenerateReflection}
            disabled={isGenerating || journals.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 active:bg-amber-950 text-white font-medium text-xs shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Insights...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{savedReflections.length > 0 ? 'Synthesize New Reflection' : 'Generate Weekly Reflection'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* No Journals Warning */}
      {journals.length === 0 && !loadingData && (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
              No journal summaries to analyze yet
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              The Weekly Reflection engine derives patterns exclusively from your saved journal summaries. Create your first reflection to get started.
            </p>
          </div>
          <button
            onClick={onNavigateToNewJournal}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition-colors"
          >
            <span>Write New Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      {currentReflection && (
        <div className="space-y-6">
          
          {/* Active Reflection Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-3">
              <div>
                <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                  Weekly Synthesis
                </span>
                <h3 className="font-serif-journal text-xl font-semibold text-stone-900 mt-0.5">
                  Reflective Synthesis & Patterns
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs text-stone-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Generated {new Date(currentReflection.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>{currentReflection.analyzedEntriesCount || journals.length} journals analyzed</span>
              </div>
            </div>

            {/* Core 4 Pillar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Recurring Themes */}
              <div className="p-5 rounded-xl bg-[#faf8f5] border border-stone-200/70 space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-semibold text-sm">
                  <Layers className="w-4 h-4 text-amber-800" />
                  <span>Recurring Themes</span>
                </div>
                <ul className="space-y-2">
                  {currentReflection.themes.map((theme, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-stone-700 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-800 mt-1.5 shrink-0" />
                      <span>{theme}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. Repeated Goals */}
              <div className="p-5 rounded-xl bg-[#faf8f5] border border-stone-200/70 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-900 font-semibold text-sm">
                  <Target className="w-4 h-4 text-emerald-700" />
                  <span>Repeated Goals & Intentions</span>
                </div>
                <ul className="space-y-2">
                  {currentReflection.goals.map((goal, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-stone-700 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Emerging Interests */}
              <div className="p-5 rounded-xl bg-[#faf8f5] border border-stone-200/70 space-y-3">
                <div className="flex items-center space-x-2 text-sky-900 font-semibold text-sm">
                  <Compass className="w-4 h-4 text-sky-700" />
                  <span>Emerging Interests</span>
                </div>
                <ul className="space-y-2">
                  {currentReflection.interests.map((interest, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-stone-700 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-700 mt-1.5 shrink-0" />
                      <span>{interest}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Important Concerns */}
              <div className="p-5 rounded-xl bg-[#faf8f5] border border-stone-200/70 space-y-3">
                <div className="flex items-center space-x-2 text-stone-900 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Important Concerns & Friction</span>
                </div>
                <ul className="space-y-2">
                  {currentReflection.concerns.map((concern, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-stone-700 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Suggested Reflection Question (Evocative Highlight) */}
            <div className="bg-amber-900/5 rounded-2xl p-6 border border-amber-900/15 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-900 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-amber-800" />
                <span>Suggested Reflection Question for Your Next Session</span>
              </div>
              <blockquote className="font-serif-journal text-lg sm:text-xl font-medium text-stone-900 italic leading-snug pt-1">
                "{currentReflection.reflectionQuestion}"
              </blockquote>
            </div>

            {/* Encouragement Note */}
            <div className="bg-[#f7f5ef] rounded-2xl p-6 border border-stone-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-700 uppercase tracking-wider">
                <Heart className="w-4 h-4 text-rose-700" />
                <span>Encouraging Reflection</span>
              </div>
              <p className="font-sans text-sm text-stone-800 leading-relaxed">
                {currentReflection.encouragement}
              </p>
            </div>

            {/* Safety & Non-Diagnosis Disclaimer */}
            <div className="pt-4 border-t border-stone-100 flex items-start space-x-3 text-stone-500 text-xs">
              <ShieldAlert className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <p>
                <strong>Mindful Reflection Disclaimer:</strong> Personal Gemini Journal provides supportive personal journaling synthesis and does not provide medical or psychological diagnosis, clinical advice, or mental health treatment.
              </p>
            </div>

          </div>

          {/* Past Weekly Reflections List */}
          {savedReflections.length > 1 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-4 h-4 text-stone-500" />
                <h4 className="font-serif-journal text-base font-semibold text-stone-900">
                  Previous Weekly Reflections ({savedReflections.length})
                </h4>
              </div>

              <div className="divide-y divide-stone-100">
                {savedReflections.map((ref) => (
                  <div
                    key={ref.id}
                    onClick={() => setCurrentReflection(ref)}
                    className={`py-3.5 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      currentReflection.id === ref.id ? 'bg-amber-50/70 border border-amber-200/60' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-stone-800">
                        Reflection from {new Date(ref.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        Question: "{ref.reflectionQuestion}"
                      </p>
                    </div>

                    <span className="text-xs font-medium text-amber-900">
                      {currentReflection.id === ref.id ? 'Active' : 'View'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
