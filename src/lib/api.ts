import { getCurrentIdToken } from './firebase';
import { JournalMessage, JournalEntry } from '../types';

export interface SummaryResult {
  title: string;
  summary: string;
  themes: string[];
  actionItems: string[];
}

export interface WeeklyReflectionResult {
  themes: string[];
  goals: string[];
  interests: string[];
  concerns: string[];
  reflectionQuestion: string;
  encouragement: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getCurrentIdToken();
  if (!token) {
    throw new Error('Authentication required. Please sign in to continue.');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function chatWithGemini(messages: JournalMessage[]): Promise<string> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'Failed to receive reflection from Gemini.');
  }

  const data = await response.json();
  return data.reply;
}

export async function summarizeJournal(messages: JournalMessage[]): Promise<SummaryResult> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'Failed to generate journal summary.');
  }

  return response.json();
}

export async function requestWeeklyReflection(
  summaries: Array<Pick<JournalEntry, 'title' | 'summary' | 'themes' | 'actionItems' | 'createdAt'>>
): Promise<WeeklyReflectionResult> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/gemini/weekly-reflection', {
    method: 'POST',
    headers,
    body: JSON.stringify({ summaries }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || 'Failed to synthesize weekly reflection.');
  }

  return response.json();
}
