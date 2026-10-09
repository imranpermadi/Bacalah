export interface LetterAccuracyStats {
  letter: string;
  correct: number;
  wrong: number;
  attempts: number;
  streak: number; // jawaban benar beruntun terakhir
  lastSeen: number | null;
}

export type MasteryLabel = 'baru' | 'belajar' | 'hampir' | 'hebat';

export interface ChildProfile {
  id: number;
  userId?: string;
  name: string;
  birthDate?: string;
  avatar: string;
  stars: number;
  mode: 'pemula' | 'mandiri';
  unlockedLevel: number;
  createdAt: number;
}

export interface GameProgressState {
  profileId: number;
  gameId: string;
  currentRound: number;
  score: number;
  completedQuestionIds: string[];
  lastPlayedAt: number;
}

export interface LevelProgress {
  level: number;
  bestStars: number;
  sessions: number;
  unlocked: boolean;
}

export interface VoiceStats {
  attempts: number;
  avgStars: number;
}

export interface LetterConfusion {
  expected: string;
  pressed: string;
  times: number;
}

export interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  photoUrl: string | null;
  lastSyncedAt: number | null;
}

export interface LevelMasteryDetail {
  level: number;
  title: string;
  emoji: string;
  description: string;
  bestStars: number;
  sessions: number;
  status: 'locked' | 'in_progress' | 'completed';
}

export interface LanguageDiagnosis {
  overallMasteryPercent: number;
  currentMilestoneStage: string;
  totalLettersLearned: number;
  confusions: LetterConfusion[];
  weakestLetters: LetterAccuracyStats[];
  levels: LevelMasteryDetail[];
  voicePracticeCount: number;
  voiceAverageStars: number;
}

