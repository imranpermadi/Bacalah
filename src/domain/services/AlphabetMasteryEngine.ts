import { LETTERS } from '../../data/content/alphabet';
import { LetterAccuracyStats, MasteryLabel } from '../entities/LetterAccuracyStats';

export type LetterWeights = Record<string, number>;

export const accuracyOf = (s?: LetterAccuracyStats) =>
  !s || s.attempts === 0 ? null : s.correct / s.attempts;

export const AlphabetMasteryEngine = {
  /**
   * Bobot kemunculan tiap huruf A–Z. Semakin sering salah => bobot semakin besar.
   * Huruf yang belum pernah dicoba mendapat bobot sedang; huruf yang sudah
   * benar beruntun & akurat mendapat bobot kecil (tetap muncul untuk ulangan).
   */
  computeWeights(stats: LetterAccuracyStats[]): LetterWeights {
    const byLetter = new Map(stats.map((s) => [s.letter, s]));
    const weights: LetterWeights = {};
    for (const l of LETTERS) {
      const s = byLetter.get(l);
      if (!s || s.attempts === 0) {
        weights[l] = 1.5;
        continue;
      }
      const errorRate = s.wrong / s.attempts;
      let w = 0.4 + errorRate * 6;
      if (s.wrong > 0 && s.streak < 3) w += 1.5; // masih sering keliru baru-baru ini
      if (errorRate === 0 && s.attempts >= 5) w = 0.3;
      weights[l] = w;
    }
    return weights;
  },

  mastery(s?: LetterAccuracyStats): MasteryLabel {
    const acc = accuracyOf(s);
    if (acc === null || !s) return 'baru';
    if (s.attempts < 3) return 'belajar';
    if (acc >= 0.95) return 'hebat';
    if (acc >= 0.7) return 'hampir';
    return 'belajar';
  },

  weakest(stats: LetterAccuracyStats[], k = 5): LetterAccuracyStats[] {
    return stats
      .filter((s) => s.wrong > 0 && s.correct / Math.max(1, s.attempts) < 1)
      .sort((a, b) => b.wrong / b.attempts - a.wrong / a.attempts || b.wrong - a.wrong)
      .slice(0, k);
  },

  weightedPick<T>(items: T[], weightOf: (i: T) => number, exclude: Set<T> = new Set()): T {
    const pool = items.filter((i) => !exclude.has(i));
    const source = pool.length ? pool : items;
    const total = source.reduce((a, i) => a + weightOf(i), 0);
    let r = Math.random() * total;
    for (const i of source) {
      r -= weightOf(i);
      if (r <= 0) return i;
    }
    return source[source.length - 1];
  },

  weightedSample<T>(items: T[], count: number, weightOf: (i: T) => number): T[] {
    const chosen: T[] = [];
    const used = new Set<T>();
    while (chosen.length < Math.min(count, items.length)) {
      const p = AlphabetMasteryEngine.weightedPick(items, weightOf, used);
      used.add(p);
      chosen.push(p);
    }
    return chosen;
  },
};

