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
  name: string;
  stars: number;
  mode: 'pemula' | 'mandiri';
}

export interface LevelProgress {
  level: number;
  bestStars: number;
  sessions: number;
}

export interface VoiceStats {
  attempts: number;
  avgStars: number;
}

