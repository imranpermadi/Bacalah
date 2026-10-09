export interface AlphabetLetter {
  letter: string; // 'A'..'Z'
  /** Teks yang diucapkan TTS untuk bunyi/nama huruf (Indonesia). */
  speak: string;
  word: string; // contoh kata, huruf kapital
  emoji: string;
  isVowel: boolean;
}

