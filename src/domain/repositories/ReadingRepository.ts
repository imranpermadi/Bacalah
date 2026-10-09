import {
  ChildProfile,
  LetterAccuracyStats,
  LevelProgress,
  VoiceStats,
} from '../entities/LetterAccuracyStats';

export interface ReadingRepository {
  getProfile(): Promise<ChildProfile>;
  updateProfile(patch: Partial<Omit<ChildProfile, 'id'>>): Promise<ChildProfile>;
  addStars(n: number): Promise<ChildProfile>;

  getAllLetterStats(): Promise<LetterAccuracyStats[]>;
  recordLetterResult(letter: string, correct: boolean, pressed?: string): Promise<void>;

  recordLevelSession(level: number, stars: number): Promise<void>;
  getLevelProgress(): Promise<LevelProgress[]>;

  saveVoiceScore(target: string, transcript: string, similarity: number, stars: number): Promise<void>;
  getVoiceStats(): Promise<VoiceStats>;

  resetAll(): Promise<void>;
}

