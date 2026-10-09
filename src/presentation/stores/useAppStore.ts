import { create } from 'zustand';
import { container } from '../../core/di/container';
import {
  ChildProfile,
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
  profile: ChildProfile;
  stats: LetterAccuracyStats[];
  weights: LetterWeights;
  levels: LevelProgress[];
  voice: VoiceStats;
  confusions: LetterConfusion[];
  googleAccount: GoogleAccount | null;
  isSyncing: boolean;
  lastSyncMessage: string | null;

  init(): Promise<void>;
  recordLetter(letter: string, correct: boolean, pressed?: string): void;
  addStars(n: number): void;
  finishSession(level: number, stars: number): void;
  saveVoice(target: string, transcript: string, sim: number, stars: number): void;
  setMode(mode: 'pemula' | 'mandiri'): void;
  loginGoogle(email?: string, name?: string): Promise<void>;
  logoutGoogle(): Promise<void>;
  syncCloud(): Promise<void>;
  restoreCloud(): Promise<void>;
  reset(): Promise<void>;
}

const repo = container.repository;
const sync = container.sync;
const emptyWeights = AlphabetMasteryEngine.computeWeights([]);

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  error: null,
  profile: { id: 1, name: 'Teman Cici', stars: 0, mode: 'pemula' },
  stats: [],
  weights: emptyWeights,
  levels: [],
  voice: { attempts: 0, avgStars: 0 },
  confusions: [],
  googleAccount: null,
  isSyncing: false,
  lastSyncMessage: null,

  async init() {
    try {
      const [profile, stats, levels, voice, confusions, googleAccount] = await Promise.all([
        repo.getProfile(),
        repo.getAllLetterStats(),
        repo.getLevelProgress(),
        repo.getVoiceStats(),
        repo.getLetterConfusions(),
        repo.getGoogleAccount(),
      ]);
      set({
        ready: true,
        profile,
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

  recordLetter(letter, correct, pressed) {
    // Pembaruan optimistik agar bobot adaptif langsung berlaku.
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
    repo.recordLetterResult(letter, correct, pressed).then(() => {
      if (!correct && pressed) {
        repo.getLetterConfusions().then((confusions) => set({ confusions }));
      }
    }).catch(() => {});
  },

  addStars(n) {
    set({ profile: { ...get().profile, stars: get().profile.stars + n } });
    repo.addStars(n).catch(() => {});
  },

  finishSession(level, stars) {
    repo
      .recordLevelSession(level, stars)
      .then(() => repo.getLevelProgress())
      .then((levels) => {
        set({ levels });
        // Auto-sync jika sudah terhubung ke Google
        if (get().googleAccount) {
          sync.syncToCloud().catch(() => {});
        }
      })
      .catch(() => {});
    get().addStars(stars);
  },

  saveVoice(target, transcript, sim, stars) {
    repo
      .saveVoiceScore(target, transcript, sim, stars)
      .then(() => repo.getVoiceStats())
      .then((voice) => set({ voice }))
      .catch(() => {});
  },

  setMode(mode) {
    set({ profile: { ...get().profile, mode } });
    repo.updateProfile({ mode }).catch(() => {});
  },

  async loginGoogle(email, name) {
    set({ isSyncing: true });
    try {
      const account = await sync.signInWithGoogle(email, name);
      set({
        googleAccount: account,
        isSyncing: false,
        lastSyncMessage: 'Akun Google terhubung & data tersimpan di Cloud! ☁️',
      });
    } catch (e) {
      set({ isSyncing: false, lastSyncMessage: 'Gagal menghubungkan Google.' });
    }
  },

  async logoutGoogle() {
    await sync.signOut();
    set({ googleAccount: null, lastSyncMessage: 'Akun Google diputus.' });
  },

  async syncCloud() {
    set({ isSyncing: true });
    try {
      const res = await sync.syncToCloud();
      const account = await repo.getGoogleAccount();
      set({
        isSyncing: false,
        googleAccount: account,
        lastSyncMessage: `Sinkronisasi berhasil! ${res.summary}`,
      });
    } catch (e) {
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
    } catch (e) {
      set({ isSyncing: false, lastSyncMessage: 'Gagal memulihkan cadangan.' });
    }
  },

  async reset() {
    await repo.resetAll();
    await get().init();
  },
}));

