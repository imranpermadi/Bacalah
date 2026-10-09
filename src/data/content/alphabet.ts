import { AlphabetLetter } from '../../domain/entities/AlphabetLetter';

const L = (letter: string, speak: string, word: string, emoji: string, isVowel = false): AlphabetLetter => ({
  letter,
  speak,
  word,
  emoji,
  isVowel,
});

/** Seluruh 26 huruf A–Z. `speak` = lafal huruf dalam Bahasa Indonesia untuk TTS. */
export const ALPHABET: AlphabetLetter[] = [
  L('A', 'a', 'APEL', '🍎', true),
  L('B', 'be', 'BOLA', '⚽'),
  L('C', 'ce', 'CERI', '🍒'),
  L('D', 'de', 'DAUN', '🍃'),
  L('E', 'e', 'ELANG', '🦅', true),
  L('F', 'ef', 'FILM', '🎬'),
  L('G', 'ge', 'GAJAH', '🐘'),
  L('H', 'ha', 'HATI', '❤️'),
  L('I', 'i', 'IKAN', '🐟', true),
  L('J', 'je', 'JERUK', '🍊'),
  L('K', 'ka', 'KUCING', '🐱'),
  L('L', 'el', 'LEBAH', '🐝'),
  L('M', 'em', 'MATA', '👀'),
  L('N', 'en', 'NASI', '🍚'),
  L('O', 'o', 'OWA', '🦉', true),
  L('P', 'pe', 'PISANG', '🍌'),
  L('Q', 'ki', 'QUR\'AN', '📗'),
  L('R', 'er', 'ROTI', '🍞'),
  L('S', 'es', 'SAPI', '🐄'),
  L('T', 'te', 'TOPI', '🧢'),
  L('U', 'u', 'ULAR', '🐍', true),
  L('V', 've', 'VAS', '🏺'),
  L('W', 'we', 'WORTEL', '🥕'),
  L('X', 'eks', 'XILOFON', '🎶'),
  L('Y', 'ye', 'YOYO', '🪀'),
  L('Z', 'zet', 'ZEBRA', '🦓'),
];

export const LETTERS = ALPHABET.map((a) => a.letter);
export const VOWELS = ['A', 'E', 'I', 'O', 'U'];
export const letterInfo = (l: string) => ALPHABET.find((a) => a.letter === l.toUpperCase())!;

/** Pasangan huruf yang sering tertukar secara visual/bunyi — dipakai sebagai pengecoh. */
export const CONFUSABLE: Record<string, string[]> = {
  B: ['D', 'P', 'R'],
  D: ['B', 'P', 'Q'],
  P: ['Q', 'B', 'D'],
  Q: ['P', 'G', 'O'],
  M: ['N', 'W', 'H'],
  N: ['M', 'H', 'U'],
  U: ['V', 'N', 'W'],
  V: ['U', 'W', 'Y'],
  W: ['M', 'V', 'U'],
  C: ['G', 'O', 'S'],
  G: ['C', 'Q', 'J'],
  O: ['Q', 'C', 'U'],
  E: ['F', 'I', 'A'],
  F: ['E', 'T', 'P'],
  I: ['L', 'J', 'E'],
  J: ['I', 'L', 'G'],
  L: ['I', 'J', 'T'],
  K: ['X', 'H', 'R'],
  X: ['K', 'Z', 'Y'],
  Y: ['V', 'X', 'K'],
  Z: ['S', 'N', 'X'],
  S: ['Z', 'C', 'E'],
  T: ['F', 'L', 'I'],
  H: ['N', 'M', 'K'],
  R: ['B', 'P', 'K'],
  A: ['E', 'O', 'H'],
};

