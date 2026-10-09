import { ALPHABET, CONFUSABLE, LETTERS, letterInfo } from '../../data/content/alphabet';
import { OPEN_SYLLABLES, wordsForLevel } from '../../data/content/curriculum';
import { DictationExercise } from '../entities/DictationExercise';
import { AlphabetMasteryEngine, LetterWeights } from './AlphabetMasteryEngine';

const weightOfText = (text: string, weights: LetterWeights) =>
  text.split('').reduce((a, c) => a + (weights[c] ?? 1), 0) / text.length;

let counter = 0;

export const DictationGenerator = {
  /** Soal dikte level 1–5, dipilih berbobot sesuai huruf lemah anak. */
  generate(level: number, count: number, weights: LetterWeights): DictationExercise[] {
    let pool: DictationExercise[];
    if (level === 1) {
      pool = ALPHABET.map((a) => ({
        id: `L-${a.letter}`,
        kind: 'letter',
        level: 1,
        target: a.letter,
        speakText: a.speak,
        slowParts: [a.speak],
        emoji: a.emoji,
      }));
    } else if (level === 2) {
      pool = OPEN_SYLLABLES.map((s) => ({
        id: `S-${s}`,
        kind: 'syllable',
        level: 2,
        target: s,
        speakText: s.toLowerCase(),
        slowParts: s.split('').map((c) => letterInfo(c).speak),
      }));
    } else {
      pool = wordsForLevel(level).map((w) => ({
        id: `W-${w.word}`,
        kind: 'word',
        level,
        target: w.word,
        speakText: w.word.toLowerCase(),
        slowParts: w.syllables.map((s) => s.toLowerCase()),
        emoji: w.emoji,
      }));
    }
    return AlphabetMasteryEngine.weightedSample(pool, count, (e) => weightOfText(e.target, weights)).map(
      (e) => ({ ...e, id: `${e.id}-${counter++}` })
    );
  },

  /** Pilihan gelembung untuk mode Pemula: huruf benar + 2–3 pengecoh (prioritas huruf mirip). */
  choices(correct: string, total: number, weights: LetterWeights): string[] {
    const want = Math.max(2, total) - 1;
    const set = new Set<string>();
    const confusing = [...(CONFUSABLE[correct] ?? [])].sort(() => Math.random() - 0.5);
    for (const c of confusing) {
      if (set.size >= Math.ceil(want / 2)) break;
      if (c !== correct) set.add(c);
    }
    const rest = LETTERS.filter((l) => l !== correct && !set.has(l));
    const extra = AlphabetMasteryEngine.weightedSample(rest, want - set.size, (l) => weights[l] ?? 1);
    extra.forEach((l) => set.add(l));
    return [correct, ...set].sort(() => Math.random() - 0.5);
  },

  /** Satu soal huruf: target + pilihan (untuk mini games). */
  letterQuestion(weights: LetterWeights, optionCount: number, avoid?: string) {
    const target = AlphabetMasteryEngine.weightedPick(
      LETTERS,
      (l) => weights[l] ?? 1,
      new Set(avoid ? [avoid] : [])
    );
    return { target, options: DictationGenerator.choices(target, optionCount, weights) };
  },
};

