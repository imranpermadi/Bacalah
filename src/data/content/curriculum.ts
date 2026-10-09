import { ReadingSentence, WordItem } from '../../domain/entities/DictationExercise';

const W = (level: number, emoji: string, ...syllables: string[]): WordItem => ({
  level,
  emoji,
  syllables,
  word: syllables.join(''),
});

const CONSONANTS_FOR_SYLLABLES = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Y', 'Z'];
const VOWEL_ORDER = ['A', 'I', 'U', 'E', 'O'];

/** Level 2: suku kata terbuka 2 huruf (BA, BI, BU, BE, BO, CA, ...). */
export const OPEN_SYLLABLES: string[] = CONSONANTS_FOR_SYLLABLES.flatMap((c) => VOWEL_ORDER.map((v) => c + v));

export const WORDS: WordItem[] = [
  // Level 3 — 2 suku kata terbuka
  W(3, '📕', 'BU', 'KU'),
  W(3, '⚽', 'BO', 'LA'),
  W(3, '🧹', 'SA', 'PU'),
  W(3, '🐴', 'KU', 'DA'),
  W(3, '🪑', 'ME', 'JA'),
  W(3, '🦶', 'KA', 'KI'),
  W(3, '👀', 'MA', 'TA'),
  W(3, '🧢', 'TO', 'PI'),
  W(3, '☕', 'KO', 'PI'),
  W(3, '🐄', 'SA', 'PI'),
  W(3, '🍞', 'RO', 'TI'),
  W(3, '🍚', 'NA', 'SI'),
  W(3, '🦷', 'GI', 'GI'),
  W(3, '🎲', 'DA', 'DU'),
  W(3, '👟', 'SE', 'PA', 'TU'),
  // Level 4 — suku kata tertutup
  W(4, '🍽️', 'MA', 'KAN'),
  W(4, '🏠', 'RU', 'MAH'),
  W(4, '🚗', 'MO', 'BIL'),
  W(4, '🐟', 'I', 'KAN'),
  W(4, '🐘', 'GA', 'JAH'),
  W(4, '💡', 'LAM', 'PU'),
  W(4, '🌙', 'BU', 'LAN'),
  W(4, '🚀', 'RO', 'KET'),
  W(4, '🥚', 'TE', 'LUR'),
  W(4, '🍊', 'JE', 'RUK'),
  // Level 5 — NG, NY, diftong AU/AI
  W(5, '🌸', 'BU', 'NGA'),
  W(5, '🦟', 'NYA', 'MUK'),
  W(5, '🐃', 'KER', 'BAU'),
  W(5, '🍌', 'PI', 'SANG'),
  W(5, '⭐', 'BIN', 'TANG'),
  W(5, '🐱', 'KU', 'CING'),
  W(5, '✋', 'TA', 'NGAN'),
  W(5, '☂️', 'PA', 'YUNG'),
  W(5, '🐒', 'MO', 'NYET'),
  W(5, '🐦', 'BU', 'RUNG'),
  W(5, '🏝️', 'PU', 'LAU'),
];

export const wordsForLevel = (level: number) => WORDS.filter((w) => w.level === level);

export const SENTENCES: ReadingSentence[] = [
  {
    id: 's1', text: 'Ibu masak nasi.', emoji: '👩‍🍳',
    question: 'Ibu masak apa?',
    choices: [{ label: 'nasi', emoji: '🍚' }, { label: 'ikan', emoji: '🐟' }, { label: 'roti', emoji: '🍞' }],
    answer: 'nasi',
  },
  {
    id: 's2', text: 'Kucing minum susu.', emoji: '🐱',
    question: 'Kucing minum apa?',
    choices: [{ label: 'susu', emoji: '🥛' }, { label: 'kopi', emoji: '☕' }, { label: 'air', emoji: '💧' }],
    answer: 'susu',
  },
  {
    id: 's3', text: 'Adik makan pisang.', emoji: '🧒',
    question: 'Adik makan apa?',
    choices: [{ label: 'apel', emoji: '🍎' }, { label: 'pisang', emoji: '🍌' }, { label: 'jeruk', emoji: '🍊' }],
    answer: 'pisang',
  },
  {
    id: 's4', text: 'Bola itu bulat.', emoji: '⚽',
    question: 'Apa yang bulat?',
    choices: [{ label: 'meja', emoji: '🪑' }, { label: 'bola', emoji: '⚽' }, { label: 'buku', emoji: '📕' }],
    answer: 'bola',
  },
  {
    id: 's5', text: 'Ayah naik mobil.', emoji: '👨',
    question: 'Ayah naik apa?',
    choices: [{ label: 'roket', emoji: '🚀' }, { label: 'kuda', emoji: '🐴' }, { label: 'mobil', emoji: '🚗' }],
    answer: 'mobil',
  },
  {
    id: 's6', text: 'Burung terbang di langit.', emoji: '🐦',
    question: 'Burung terbang di mana?',
    choices: [{ label: 'langit', emoji: '☁️' }, { label: 'rumah', emoji: '🏠' }, { label: 'kolam', emoji: '🏊' }],
    answer: 'langit',
  },
  {
    id: 's7', text: 'Kakak baca buku.', emoji: '👧',
    question: 'Kakak baca apa?',
    choices: [{ label: 'buku', emoji: '📕' }, { label: 'topi', emoji: '🧢' }, { label: 'sapu', emoji: '🧹' }],
    answer: 'buku',
  },
  {
    id: 's8', text: 'Bulan terlihat di malam hari.', emoji: '🌙',
    question: 'Kapan bulan terlihat?',
    choices: [{ label: 'malam', emoji: '🌃' }, { label: 'siang', emoji: '☀️' }],
    answer: 'malam',
  },
];

