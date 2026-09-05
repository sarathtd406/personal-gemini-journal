import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Save,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  ListTodo,
  FileText,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { JournalMessage, JournalEntry, AuthUserProfile } from '../types';
import { chatWithGemini, summarizeJournal, SummaryResult } from '../lib/api';
import { saveJournalEntry } from '../lib/firebase';

interface NewJournalViewProps {
  user: AuthUserProfile;
  onSavedSuccess: (entry: JournalEntry) => void;
  onNavigateToHistory: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Daily Unpack',
    prompt: "I'd like to reflect on how today went, what felt energizing, and what felt draining.",
  },
  {
    title: 'Untangle a Challenge',
    prompt: "I'm facing a difficult decision or feeling stuck. Can you help me gently untangle my thoughts?",
  },
  {
    title: 'Gratitude & Joy',
    prompt: "I want to notice three moments of genuine gratitude or peace from this past week.",
  },
  {
    title: 'Intentions & Focus',
    prompt: "I want to set clear, realistic intentions for my upcoming days and reflect on what matters most.",
  },
];

export const NewJournalView: React.FC<NewJournalViewProps> = ({
  user,
  onSavedSuccess,
  onNavigateToHistory,
}) => {
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Post-save modal / review state
  const [savedEntry, setSavedEntry] = useState<JournalEntry | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Handle sending a conversational message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

    setErrorMessage(null);
    const userMsg: JournalMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');

    setIsSending(true);
    try {
      const reply = await chatWithGemini(updatedMessages);
      const modelMsg: JournalMessage = {
        id: 'msg-' + (Date.now() + 1) + '-' + Math.random().toString(36).substring(2, 7),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to receive reflection from Gemini. Please check your network.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset conversation
  const handleResetSession = () => {
    if (messages.length > 0) {
      const confirmed = window.confirm('Are you sure you want to start a fresh journal session? Unsaved thoughts will be cleared.');
      if (!confirmed) return;
    }
    setMessages([]);
    setErrorMessage(null);
    setSavedEntry(null);
  };

  // Save Journal with AI Summarization
  const handleSaveJournal = async () => {
    if (messages.length === 0) {
      setErrorMessage('Write at least one reflection message before saving your journal.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. Generate server-side AI summary with Gemini
      const summaryResult: SummaryResult = await summarizeJournal(messages);

      // 2. Prepare structured Firestore record
      const journalId = 'jnl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const now = new Date().toISOString();

      const newEntry: JournalEntry = {
        id: journalId,
        userId: user.uid,
        title: summaryResult.title || 'Personal Reflection',
        summary: summaryResult.summary || 'Mindful reflection session.',
        themes: summaryResult.themes || [],
        actionItems: summaryResult.actionItems || [],
        messages,
        createdAt: now,
        updatedAt: now,
      };

      // 3. Save securely in Firestore under users/{uid}/journals/{journalId}
      await saveJournalEntry(user.uid, newEntry);

      setSavedEntry(newEntry);
      onSavedSuccess(newEntry);
    } catch (err: any) {
      console.error('Save journal error:', err);
      setErrorMessage(err.message || 'Failed to save journal to your private Firestore. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      
      {/* Session Header / Controls */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-serif-journal text-xl font-semibold text-stone-900">
              Active Journal Session
            </h2>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{messages.length} {messages.length === 1 ? 'reflection' : 'reflections'}</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Reflect freely with Gemini. When ready, click "Save Journal" to generate your AI summary & key themes.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          {messages.length > 0 && (
            <button
              id="btn-reset-session"
              onClick={handleResetSession}
              disabled={isSending || isSaving}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            id="btn-save-journal"
            onClick={handleSaveJournal}
            disabled={isSending || isSaving || messages.length === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-900 hover:bg-amber-800 active:bg-amber-950 transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Generating Summary...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Journal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Saved Entry Success Banner */}
      {savedEntry && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 text-emerald-900 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Journal Saved Securely to Your Private Firestore</span>
            </div>
            <button
              onClick={() => setSavedEntry(null)}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-4 bg-white/90 rounded-xl p-5 border border-emerald-100 space-y-3.5">
            <div>
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">AI Generated Title</span>
              <h3 className="font-serif-journal text-lg font-semibold text-stone-900 mt-0.5">
                {savedEntry.title}
              </h3>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Summary</span>
              <p className="text-sm text-stone-700 font-sans leading-relaxed mt-0.5">
                {savedEntry.summary}
              </p>
            </div>

            {savedEntry.themes.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Key Themes</span>
                <div className="flex flex-wrap gap-1.5">
                  {savedEntry.themes.map((theme, i) => (
                    <span key={i} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/60">
                      <Tag className="w-3 h-3 text-amber-800" />
                      <span>{theme}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {savedEntry.actionItems.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">Goals & Takeaways</span>
                <ul className="space-y-1">
                  {savedEntry.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-xs text-stone-700">
                      <ListTodo className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-end space-x-3">
            <button
              onClick={handleResetSession}
              className="px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-emerald-100/50 rounded-lg transition-colors"
            >
              Start Another Journal
            </button>
            <button
              onClick={onNavigateToHistory}
              className="flex items-center space-x-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <span>View in Journal History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col min-h-[460px] overflow-hidden">
        
        {/* Messages transcript */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[560px]">
          {messages.length === 0 ? (
            <div className="py-8 text-center space-y-6 max-w-lg mx-auto">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif-journal text-lg font-semibold text-stone-900">
                  Welcome to your journal, {user.displayName?.split(' ')[0] || 'Friend'}
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-1 max-w-sm mx-auto leading-relaxed">
                  Write freely without judgment. Gemini acts as an introspective companion to help you unpack thoughts, notice insights, and clarify priorities.
                </p>
              </div>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {STARTER_PROMPTS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(starter.prompt)}
                    className="p-3.5 rounded-xl border border-stone-200/90 hover:border-amber-700/40 hover:bg-amber-50/40 transition-all text-left group cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-stone-800 group-hover:text-amber-900">
                      {starter.title}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      "{starter.prompt}"
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-stone-400 font-sans">
                    <span>{isUser ? 'You' : 'Gemini Companion'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed transition-all ${
                      isUser
                        ? 'bg-amber-900 text-amber-50 font-serif-journal shadow-xs rounded-br-xs'
                        : 'bg-[#f6f4ee] text-stone-800 font-sans border border-stone-200/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-stone-400">
                <span>Gemini Companion</span>
                <span>•</span>
                <span>Reflecting...</span>
              </div>
              <div className="bg-[#f6f4ee] rounded-2xl px-4 py-3 border border-stone-200/80 rounded-bl-xs flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-amber-800 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-amber-800 animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 rounded-full bg-amber-800 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#faf8f5] border-t border-stone-200">
          <div className="relative rounded-xl bg-white border border-stone-300 focus-within:border-amber-900/50 focus-within:ring-2 focus-within:ring-amber-900/10 transition-all shadow-xs">
            <textarea
              id="input-journal-message"
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending || isSaving}
              placeholder={
                messages.length === 0
                  ? "Write your first thought or choose a prompt above..."
                  : "Continue your reflection... (Shift + Enter for new line)"
              }
              rows={2}
              className="w-full px-4 py-3 text-sm text-stone-800 placeholder-stone-400 bg-transparent resize-none focus:outline-hidden font-sans"
            />
            
            <div className="px-3 pb-2.5 flex items-center justify-between text-xs text-stone-400">
              <span className="text-[11px] hidden sm:inline">
                Press Enter to share thought • Shift+Enter for new line
              </span>
              
              <button
                id="btn-send-message"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending || isSaving}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white font-medium hover:bg-amber-800 active:bg-amber-950 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reflect</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
