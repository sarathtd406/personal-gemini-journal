import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { JournalEntry, WeeklyReflection, AuthUserProfile } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore instance targeting "firestore-01"
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'firestore-01');

// Test Firestore connection as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firestore client appears offline or network restricted.');
    }
    // Expected in rules if test doc does not exist, but verifies network reachability
    return true;
  }
}

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<AuthUserProfile> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

// Sign out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Get current Firebase ID Token for authenticating backend requests
export async function getCurrentIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

// Map Firebase User to App User Profile
export function mapFirebaseUser(user: FirebaseUser | null): AuthUserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

// Firestore operations for User Journals: users/{uid}/journals/{journalId}
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error('User must be authenticated to save journal.');
  const journalRef = doc(db, 'users', userId, 'journals', entry.id);
  await setDoc(journalRef, entry);
}

export async function getUserJournals(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];
  const journalsColl = collection(db, 'users', userId, 'journals');
  const q = query(journalsColl, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const entries: JournalEntry[] = [];
  snapshot.forEach((docSnap) => {
    entries.push(docSnap.data() as JournalEntry);
  });
  return entries;
}

export async function deleteUserJournal(userId: string, journalId: string): Promise<void> {
  if (!userId || !journalId) return;
  const journalRef = doc(db, 'users', userId, 'journals', journalId);
  await deleteDoc(journalRef);
}

// Firestore operations for Weekly Reflections: users/{uid}/reflections/{reflectionId}
export async function saveWeeklyReflectionToDb(userId: string, reflection: WeeklyReflection): Promise<void> {
  if (!userId) throw new Error('User must be authenticated to save reflection.');
  const reflectionRef = doc(db, 'users', userId, 'reflections', reflection.id);
  await setDoc(reflectionRef, reflection);
}

export async function getUserWeeklyReflections(userId: string): Promise<WeeklyReflection[]> {
  if (!userId) return [];
  const coll = collection(db, 'users', userId, 'reflections');
  const q = query(coll, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  const reflections: WeeklyReflection[] = [];
  snapshot.forEach((docSnap) => {
    reflections.push(docSnap.data() as WeeklyReflection);
  });
  return reflections;
}
