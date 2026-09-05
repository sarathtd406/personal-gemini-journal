import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  Tag,
  ListTodo,
  ChevronRight,
  Trash2,
  X,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { JournalEntry, AuthUserProfile } from '../types';
import { getUserJournals, deleteUserJournal } from '../lib/firebase';

interface JournalHistoryViewProps {
  user: AuthUserProfile;
  onNavigateToNewJournal: () => void;
}

export const JournalHistoryView: React.FC<JournalHistoryViewProps> = ({
  user,
  onNavigateToNewJournal,
}) => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchJournals = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getUserJournals(user.uid);
      setJournals(data);
    } catch (err: any) {
      console.error('Error fetching user journals:', err);
      setErrorMsg('Failed to load journals. Please verify your Firestore connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [user.uid]);

  const handleDeleteJournal = async (journalId: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this journal entry? This cannot be undone.');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteUserJournal(user.uid, journalId);
      setJournals((prev) => prev.filter((j) => j.id !== journalId));
      if (selectedJournal?.id === journalId) {
        setSelectedJournal(null);
      }
    } catch (err: any) {
      console.error('Error deleting journal:', err);
      alert('Failed to delete journal entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter journals based on search query
  const filteredJournals = journals.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = j.title?.toLowerCase().includes(q);
    const summaryMatch = j.summary?.toLowerCase().includes(q);
    const themeMatch = j.themes?.some((t) => t.toLowerCase().includes(q));
    return titleMatch || summaryMatch || themeMatch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif-journal text-2xl font-semibold text-stone-900">
            Journal History
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Private records for <span className="font-medium text-stone-700">{user.email}</span> ({journals.length} {journals.length === 1 ? 'entry' : 'entries'})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-history"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, themes..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-900/40 focus:ring-1 focus:ring-amber-900/20"
            />
          </div>

          <button
            onClick={fetchJournals}
            title="Refresh history"
            className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 text-xs transition-colors"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-sans">Loading your private journals from Firestore...</p>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
              {searchQuery ? 'No matching journal entries found' : 'No journal entries yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Try a different search keyword or clear your filter.'
                : 'Begin your personal journaling journey. Share your thoughts with Gemini and save structured reflections.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={onNavigateToNewJournal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-900 hover:bg-amber-800 active:bg-amber-950 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create First Journal Entry</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJournals.map((journal) => {
            const dateStr = new Date(journal.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const timeStr = new Date(journal.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={journal.id}
                id={`journal-card-${journal.id}`}
                onClick={() => setSelectedJournal(journal)}
                className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-amber-900/30 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-2">
                    <span className="inline-flex items-center space-x-1 font-medium text-stone-500">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{dateStr} • {timeStr}</span>
                    </span>
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-600">
                      {journal.messages?.length || 0} messages
                    </span>
                  </div>

                  <h3 className="font-serif-journal text-base font-semibold text-stone-900 group-hover:text-amber-950 transition-colors line-clamp-1">
                    {journal.title}
                  </h3>

                  <p className="text-xs text-stone-600 font-sans mt-2 line-clamp-3 leading-relaxed">
                    {journal.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1 max-w-[75%]">
                    {journal.themes?.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                    {(journal.themes?.length || 0) > 2 && (
                      <span className="text-[10px] text-stone-400">
                        +{(journal.themes?.length || 0) - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-amber-900 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Slide-over detail view */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
              <div className="flex-1 pr-4">
                <span className="text-[11px] text-stone-500 flex items-center space-x-1.5 mb-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>
                    {new Date(selectedJournal.createdAt).toLocaleString(undefined, {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </span>
                </span>
                <h3 className="font-serif-journal text-xl font-semibold text-stone-900">
                  {selectedJournal.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="btn-delete-journal-modal"
                  onClick={() => handleDeleteJournal(selectedJournal.id)}
                  disabled={isDeleting}
                  title="Delete Journal"
                  className="p-2 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedJournal(null)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* AI Summary Block */}
              <div className="bg-[#f9f7f2] rounded-xl p-5 border border-amber-900/10 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-900 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                  <span>AI Reflection Summary</span>
                </div>
                <p className="text-sm text-stone-800 font-sans leading-relaxed">
                  {selectedJournal.summary}
                </p>

                {selectedJournal.themes && selectedJournal.themes.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Themes Identified</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJournal.themes.map((theme, i) => (
                        <span key={i} className="inline-flex items-center space-x-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100/60 text-amber-900 border border-amber-200">
                          <Tag className="w-3 h-3 text-amber-800" />
                          <span>{theme}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedJournal.actionItems && selectedJournal.actionItems.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-medium text-stone-500 block mb-1.5">Goals & Action Items</span>
                    <ul className="space-y-1.5">
                      {selectedJournal.actionItems.map((action, i) => (
                        <li key={i} className="flex items-start space-x-2 text-xs text-stone-700">
                          <ListTodo className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Complete Session Transcript */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-stone-500" />
                  <h4 className="font-serif-journal text-base font-semibold text-stone-900">
                    Journal Session Transcript
                  </h4>
                  <span className="text-xs text-stone-400">
                    ({selectedJournal.messages?.length || 0} exchanges)
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {selectedJournal.messages?.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-stone-400 mb-1 px-1">
                          {isUser ? 'You' : 'Gemini Companion'} • {msg.timestamp}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-amber-900 text-amber-50 font-serif-journal'
                              : 'bg-stone-100 text-stone-800 font-sans border border-stone-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-[#faf8f5] flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                Firestore doc ID: {selectedJournal.id}
              </span>
              <button
                onClick={() => setSelectedJournal(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                Close Entry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
