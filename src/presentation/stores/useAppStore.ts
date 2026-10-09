import { create } from 'zustand';
import { container } from '../../core/di/container';
import { ChildProfile, LetterAccuracyStats, LevelProgress, VoiceStats } from '../../domain/entities/LetterAccuracyStats';
import { AlphabetMasteryEngine, LetterWeights } from '../../domain/services/AlphabetMasteryEngine';

interface AppState {
  ready: boolean;
  error: string | null;
  profile: ChildProfile;
  stats: LetterAccuracyStats[];
  weights: LetterWeights;
  levels: LevelProgress[];
  voice: VoiceStats;

  init(): Promise<void>;
  recordLetter(letter: string, correct: boolean, pressed?: string): void;
  addStars(n: number): void;
  finishSession(level: number, stars: number): void;
  saveVoice(target: string, transcript: string, sim: number, stars: number): void;
  setMode(mode: 'pemula' | 'mandiri'): void;
  reset(): Promise<void>;
}

const repo = container.repository;
const emptyWeights = AlphabetMasteryEngine.computeWeights([]);

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  error: null,
  profile: { id: 1, name: 'Teman Cici', stars: 0, mode: 'pemula' },
  stats: [],
  weights: emptyWeights,
  levels: [],
  voice: { attempts: 0, avgStars: 0 },

  async init() {
    try {
      const [profile, stats, levels, voice] = await Promise.all([
        repo.getProfile(),
        repo.getAllLetterStats(),
        repo.getLevelProgress(),
        repo.getVoiceStats(),
      ]);
      set({ ready: true, profile, stats, levels, voice, weights: AlphabetMasteryEngine.computeWeights(stats) });
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
    repo.recordLetterResult(letter, correct, pressed).catch(() => {});
  },

  addStars(n) {
    set({ profile: { ...get().profile, stars: get().profile.stars + n } });
    repo.addStars(n).catch(() => {});
  },

  finishSession(level, stars) {
    repo.recordLevelSession(level, stars).then(() => repo.getLevelProgress()).then((levels) => set({ levels })).catch(() => {});
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

  async reset() {
    await repo.resetAll();
    await get().init();
  },
}));

