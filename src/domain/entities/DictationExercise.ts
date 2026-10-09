export type DictationKind = 'letter' | 'syllable' | 'word';

export interface DictationExercise {
  id: string;
  kind: DictationKind;
  level: number;
  /** Huruf kapital yang harus diketik. */
  target: string;
  /** Teks yang diucapkan Cici pada kecepatan normal. */
  speakText: string;
  /** Potongan untuk mode "Cici Pelan-Pelan" (huruf/suku kata). */
  slowParts: string[];
  emoji?: string;
}

export interface ReadingSentence {
  id: string;
  text: string;
  emoji: string;
  question: string;
  choices: { label: string; emoji: string }[];
  answer: string; // label jawaban benar
}

export interface WordItem {
  word: string;
  syllables: string[];
  emoji: string;
  level: number;
}

