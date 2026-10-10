import { ALPHABET, CONFUSABLE, LETTERS, letterInfo } from '../../data/content/alphabet';
import { OPEN_SYLLABLES, SENTENCES, wordsForLevel } from '../../data/content/curriculum';
import { DictationExercise } from '../entities/DictationExercise';
import { AlphabetMasteryEngine, LetterWeights } from './AlphabetMasteryEngine';

const weightOfText = (text: string, weights: LetterWeights) =>
  text.split('').reduce((a, c) => a + (weights[c] ?? 1), 0) / (text.length || 1);

let counter = 0;

export const DictationGenerator = {
  /** Soal dikte level 1–6 (minimal 30 soal per level), dipilih berbobot sesuai huruf lemah anak. */
  generate(level: number, count: number, weights: LetterWeights): DictationExercise[] {
    let pool: DictationExercise[];
    if (level === 1) {
      // 26 huruf + 10 variasi fonik konsonan & vokal penting (total 36 item)
      const basePool: DictationExercise[] = ALPHABET.map((a) => ({
        id: `L-${a.letter}`,
        kind: 'letter' as const,
        level: 1,
        target: a.letter,
        speakText: `${a.letter}. ${a.word}`,
        slowParts: [a.letter],
        emoji: a.emoji,
      }));
      // Ekstra varian fonik agar minimal 30 soal unik
      const extraVowels = ['A', 'I', 'U', 'E', 'O', 'B', 'M', 'S', 'T', 'N'].map((char) => {
        const info = letterInfo(char);
        return {
          id: `L-extra-${char}`,
          kind: 'letter' as const,
          level: 1,
          target: char,
          speakText: `${info.letter}. ${info.word}`,
          slowParts: [info.letter],
          emoji: info.emoji,
        };
      });
      pool = [...basePool, ...extraVowels];
    } else if (level === 2) {
      pool = OPEN_SYLLABLES.map((s) => ({
        id: `S-${s}`,
        kind: 'syllable' as const,
        level: 2,
        target: s,
        speakText: s.toLowerCase(),
        slowParts: s.split('').map((c) => letterInfo(c).speak),
      }));
    } else if (level === 6) {
      pool = SENTENCES.map((st) => ({
        id: `ST-${st.id}`,
        kind: 'sentence' as const,
        level: 6,
        target: st.answer.toUpperCase(),
        speakText: st.text,
        slowParts: [st.question],
        emoji: st.emoji,
      }));
    } else {
      pool = wordsForLevel(level).map((w) => ({
        id: `W-${w.word}`,
        kind: 'word' as const,
        level,
        target: w.word,
        speakText: w.word.toLowerCase(),
        slowParts: w.syllables.map((s) => s.toLowerCase()),
        emoji: w.emoji,
      }));
    }

    const actualCount = Math.min(count, pool.length);
    return AlphabetMasteryEngine.weightedSample(pool, actualCount, (e) => weightOfText(e.target, weights)).map(
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
