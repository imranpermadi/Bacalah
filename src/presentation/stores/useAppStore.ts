import { create } from 'zustand';
import { container } from '../../core/di/container';
import {
  ChildProfile,
  GameProgressState,
  GoogleAccount,
  LetterAccuracyStats,
  LetterConfusion,
  LevelProgress,
  VoiceStats,
} from '../../domain/entities/LetterAccuracyStats';
import { AlphabetMasteryEngine, LetterWeights } from '../../domain/services/AlphabetMasteryEngine';

interface AppState {
  ready: boolean;
  error: string | null;
  isLoggedIn: boolean;
  isProfileSelected: boolean;
  profiles: ChildProfile[];
  profile: ChildProfile;
  stats: LetterAccuracyStats[];
  weights: LetterWeights;
  levels: LevelProgress[];
  voice: VoiceStats;
  confusions: LetterConfusion[];
  googleAccount: GoogleAccount | null;
  isSyncing: boolean;
  lastSyncMessage: string | null;
  gameProgress: Record<string, GameProgressState>;

  init(): Promise<void>;
  switchProfile(profileId: number): Promise<void>;
  createProfile(name: string, birthDate?: string, avatar?: string): Promise<ChildProfile>;
  updateCurrentProfile(patch: Partial<Omit<ChildProfile, 'id'>>): Promise<void>;
  deleteProfile(profileId: number): Promise<void>;
  selectProfile(profileId: number): Promise<void>;
  unselectProfile(): void;

  recordLetter(letter: string, correct: boolean, pressed?: string): void;
  addStars(n: number): void;
  finishSession(level: number, stars: number): Promise<{ unlockedNext: boolean }>;
  saveVoice(target: string, transcript: string, sim: number, stars: number): void;
  setMode(mode: 'pemula' | 'mandiri'): void;

  // Game Persistence (30 Soal & Continue)
  getGameSessionState(gameId: string): Promise<GameProgressState | null>;
  recordGameRound(gameId: string, round: number, score: number, questionId: string): Promise<void>;
  resetGameSession(gameId: string): Promise<void>;

  // Auth & Cloud
  loginGoogleSSO(): Promise<void>;
  loginGoogle(email?: string, name?: string): Promise<void>;
  logoutGoogle(): Promise<void>;
  syncCloud(): Promise<void>;
  restoreCloud(): Promise<void>;
  reset(): Promise<void>;
}

const repo = container.repository;
const sync = container.sync;
const emptyWeights = AlphabetMasteryEngine.computeWeights([]);

const defaultProfile: ChildProfile = {
  id: 1,
  name: 'Teman Cici',
  avatar: '🐱',
  stars: 0,
  mode: 'pemula',
  unlockedLevel: 1,
  createdAt: Date.now(),
};

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  error: null,
  isLoggedIn: false,
  isProfileSelected: false,
  profiles: [],
  profile: defaultProfile,
  stats: [],
  weights: emptyWeights,
  levels: [],
  voice: { attempts: 0, avgStars: 0 },
  confusions: [],
  googleAccount: null,
  isSyncing: false,
  lastSyncMessage: null,
  gameProgress: {},

  async init() {
    try {
      const [isLoggedIn, googleAccount, profiles, activeId] = await Promise.all([
        repo.getLoginStatus(),
        repo.getGoogleAccount(),
        repo.getProfiles(),
        repo.getActiveProfileId(),
      ]);

      const currentProfile = profiles.find((p) => p.id === activeId) || profiles[0] || defaultProfile;

      const [stats, levels, voice, confusions] = await Promise.all([
        repo.getAllLetterStats(currentProfile.id),
        repo.getLevelProgress(currentProfile.id),
        repo.getVoiceStats(currentProfile.id),
        repo.getLetterConfusions(currentProfile.id),
      ]);

      set({
        ready: true,
        isLoggedIn: isLoggedIn || !!googleAccount,
        isProfileSelected: false, // Setiap buka aplikasi, suguhkan pilih profil sesuai permintaan pengguna
        profiles,
        profile: currentProfile,
        stats,
        levels,
        voice,
        confusions,
        googleAccount,
        weights: AlphabetMasteryEngine.computeWeights(stats),
      });
    } catch (e) {
      set({ ready: true, error: String(e) });
    }
  },

  async selectProfile(profileId: number) {
    await get().switchProfile(profileId);
    set({ isProfileSelected: true });
  },

  unselectProfile() {
    set({ isProfileSelected: false });
  },

  async switchProfile(profileId: number) {
    try {
      await repo.setActiveProfileId(profileId);
      const profile = await repo.getProfile(profileId);
      const [stats, levels, voice, confusions] = await Promise.all([
        repo.getAllLetterStats(profileId),
        repo.getLevelProgress(profileId),
        repo.getVoiceStats(profileId),
        repo.getLetterConfusions(profileId),
      ]);

      set({
        profile,
        stats,
        levels,
        voice,
        confusions,
        weights: AlphabetMasteryEngine.computeWeights(stats),
      });
    } catch (e) {
      console.warn('Gagal switch profil:', e);
    }
  },

  async createProfile(name: string, birthDate?: string, avatar: string = '🐱') {
    const newProfile = await repo.createProfile({ name, birthDate, avatar });
    const profiles = await repo.getProfiles();
    set({ profiles });
    await get().switchProfile(newProfile.id);
    set({ isProfileSelected: true });
    if (get().googleAccount) {
      sync.syncToCloud().catch(() => {});
    }
    return newProfile;
  },

  async updateCurrentProfile(patch) {
    const id = get().profile.id;
    const updated = await repo.updateProfile(id, patch);
    const profiles = await repo.getProfiles();
    set({ profile: updated, profiles });
    if (get().googleAccount) {
      sync.syncToCloud().catch(() => {});
    }
  },

  async deleteProfile(profileId: number) {
    await repo.deleteProfile(profileId);
    const profiles = await repo.getProfiles();
    set({ profiles });
    if (profiles.length > 0) {
      await get().switchProfile(profiles[0].id);
    }
    if (get().googleAccount) {
      sync.syncToCloud().catch(() => {});
    }
  },

  recordLetter(letter, correct, pressed) {
    const profileId = get().profile.id;
    const stats = get().stats.map((s) =>
      s.letter !== letter.toUpperCase()
        ? s
        : {
            ...s,
            attempts: s.attempts + 1,
            correct: s.correct + (correct ? 1 : 0),
            wrong: s.wrong + (correct ? 0 : 1),
            streak: correct ? s.streak + 1 : 0,
            lastSeen: Date.now(),
          }
    );
    set({ stats, weights: AlphabetMasteryEngine.computeWeights(stats) });
    repo.recordLetterResult(letter, correct, pressed, profileId).then(() => {
      if (!correct && pressed) {
        repo.getLetterConfusions(profileId).then((confusions) => set({ confusions }));
      }
    }).catch(() => {});
  },

  addStars(n) {
    const profileId = get().profile.id;
    const newStars = get().profile.stars + n;
    set({ profile: { ...get().profile, stars: newStars } });
    repo.addStars(n, profileId).then(async () => {
      const profiles = await repo.getProfiles();
      set({ profiles });
    }).catch(() => {});
  },

  async finishSession(level, stars) {
    const profileId = get().profile.id;
    const { unlockedNext } = await repo.recordLevelSession(level, stars, profileId);
    const [levels, profiles, profile] = await Promise.all([
      repo.getLevelProgress(profileId),
      repo.getProfiles(),
      repo.getProfile(profileId),
    ]);
    set({ levels, profiles, profile });
    get().addStars(stars);

    if (get().googleAccount) {
      sync.syncToCloud().catch(() => {});
    }
    return { unlockedNext };
  },

  saveVoice(target, transcript, sim, stars) {
    const profileId = get().profile.id;
    repo
      .saveVoiceScore(target, transcript, sim, stars, profileId)
      .then(() => repo.getVoiceStats(profileId))
      .then((voice) => set({ voice }))
      .catch(() => {});
  },

  setMode(mode) {
    get().updateCurrentProfile({ mode });
  },

  // Game Persistence
  async getGameSessionState(gameId: string) {
    const profileId = get().profile.id;
    const prog = await repo.getGameProgress(gameId, profileId);
    if (prog) {
      set({ gameProgress: { ...get().gameProgress, [gameId]: prog } });
    }
    return prog;
  },

  async recordGameRound(gameId: string, round: number, score: number, questionId: string) {
    const profileId = get().profile.id;
    const current = get().gameProgress[gameId] || {
      profileId,
      gameId,
      currentRound: 0,
      score: 0,
      completedQuestionIds: [],
      lastPlayedAt: Date.now(),
    };

    const updated: GameProgressState = {
      profileId,
      gameId,
      currentRound: round,
      score,
      completedQuestionIds: Array.from(new Set([...current.completedQuestionIds, questionId])),
      lastPlayedAt: Date.now(),
    };

    set({ gameProgress: { ...get().gameProgress, [gameId]: updated } });
    await repo.saveGameProgress(updated);
  },

  async resetGameSession(gameId: string) {
    const profileId = get().profile.id;
    await repo.resetGameProgress(gameId, profileId);
    const copy = { ...get().gameProgress };
    delete copy[gameId];
    set({ gameProgress: copy });
  },

  async loginGoogleSSO() {
    set({ isSyncing: true });
    try {
      const account = await sync.signInWithGoogleSSO();
      await repo.setLoginStatus(true);
      set({
        googleAccount: account,
        isLoggedIn: true,
        isSyncing: false,
        lastSyncMessage: `SSO Google berhasil! Data ${account.name} aman di Cloud! ☁️`,
      });
    } catch {
      set({ isSyncing: false, lastSyncMessage: 'Gagal login SSO Google.' });
    }
  },

  async loginGoogle(email, name) {
    set({ isSyncing: true });
    try {
      const account = await sync.signInWithGoogle(email, name);
      await repo.setLoginStatus(true);
      set({
        googleAccount: account,
        isLoggedIn: true,
        isSyncing: false,
        lastSyncMessage: 'Akun Google terhubung & data tersimpan di Cloud! ☁️',
      });
    } catch {
      set({ isSyncing: false, lastSyncMessage: 'Gagal menghubungkan Google.' });
    }
  },

  async logoutGoogle() {
    await sync.signOut();
    await repo.setLoginStatus(false);
    set({
      googleAccount: null,
      isLoggedIn: false,
      isProfileSelected: false,
      lastSyncMessage: 'Akun Google diputus.',
    });
  },

  async syncCloud() {
    set({ isSyncing: true });
    try {
      const res = await sync.syncToCloud();
      const account = await repo.getGoogleAccount();
      set({
        isSyncing: false,
        googleAccount: account,
        lastSyncMessage: res.summary,
      });
    } catch {
      set({ isSyncing: false, lastSyncMessage: 'Gagal sinkronisasi ke Cloud.' });
    }
  },

  async restoreCloud() {
    set({ isSyncing: true });
    try {
      const res = await sync.restoreFromCloud();
      await get().init();
      set({
        isSyncing: false,
        lastSyncMessage: `Data berhasil dipulihkan! ${res.stars} ⭐ bintang kembali.`,
      });
    } catch {
      set({ isSyncing: false, lastSyncMessage: 'Gagal memulihkan cadangan.' });
    }
  },

  async reset() {
    const profileId = get().profile.id;
    await repo.resetAll(profileId);
    await get().init();
  },
}));
