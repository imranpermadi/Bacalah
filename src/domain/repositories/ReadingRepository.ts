import {
  ChildProfile,
  GameProgressState,
  GoogleAccount,
  LetterAccuracyStats,
  LetterConfusion,
  LevelProgress,
  VoiceStats,
} from '../entities/LetterAccuracyStats';

export interface ReadingRepository {
  // Profil Anak (Multi-Profile)
  getProfiles(): Promise<ChildProfile[]>;
  getProfile(id?: number): Promise<ChildProfile>;
  createProfile(data: { name: string; birthDate?: string; avatar: string }): Promise<ChildProfile>;
  updateProfile(id: number, patch: Partial<Omit<ChildProfile, 'id'>>): Promise<ChildProfile>;
  deleteProfile(id: number): Promise<void>;
  getActiveProfileId(): Promise<number>;
  setActiveProfileId(id: number): Promise<void>;
  addStars(n: number, profileId?: number): Promise<ChildProfile>;

  // Statistik Huruf (Scoped per profil)
  getAllLetterStats(profileId?: number): Promise<LetterAccuracyStats[]>;
  recordLetterResult(letter: string, correct: boolean, pressed?: string, profileId?: number): Promise<void>;
  getLetterConfusions(profileId?: number): Promise<LetterConfusion[]>;

  // Level & Evaluasi (Scoped per profil)
  recordLevelSession(level: number, stars: number, profileId?: number): Promise<{ unlockedNext: boolean }>;
  getLevelProgress(profileId?: number): Promise<LevelProgress[]>;
  unlockLevel(level: number, profileId?: number): Promise<void>;

  // Game Progress (30 Soal & Continue)
  getGameProgress(gameId: string, profileId?: number): Promise<GameProgressState | null>;
  saveGameProgress(progress: GameProgressState): Promise<void>;
  resetGameProgress(gameId: string, profileId?: number): Promise<void>;

  // Voice Evaluation
  saveVoiceScore(target: string, transcript: string, similarity: number, stars: number, profileId?: number): Promise<void>;
  getVoiceStats(profileId?: number): Promise<VoiceStats>;

  // Cloud & Session
  getLoginStatus(): Promise<boolean>;
  setLoginStatus(isLoggedIn: boolean): Promise<void>;
  getGoogleAccount(): Promise<GoogleAccount | null>;
  saveGoogleAccount(account: GoogleAccount | null): Promise<void>;
  getBackupSnapshot(): Promise<string>;
  restoreBackupSnapshot(jsonStr: string): Promise<void>;

  resetAll(profileId?: number): Promise<void>;
}

