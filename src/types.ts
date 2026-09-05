export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  themes: string[];
  actionItems: string[];
  messages: JournalMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReflection {
  id: string;
  userId: string;
  themes: string[];
  goals: string[];
  interests: string[];
  concerns: string[];
  reflectionQuestion: string;
  encouragement: string;
  createdAt: string;
  analyzedEntriesCount: number;
}

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type ActiveTab = 'new-journal' | 'history' | 'weekly-reflection' | 'privacy-security';
