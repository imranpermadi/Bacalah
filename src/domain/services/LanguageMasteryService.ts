import {
  LanguageDiagnosis,
  LetterAccuracyStats,
  LetterConfusion,
  LevelMasteryDetail,
  LevelProgress,
  VoiceStats,
} from '../entities/LetterAccuracyStats';
import { levelMeta } from '../../core/theme';
import { AlphabetMasteryEngine } from './AlphabetMasteryEngine';

export class LanguageMasteryService {
  /**
   * Menghasilkan diagnosis lengkap capaian leveling anak dan kelemahannya.
   */
  static diagnose(
    stats: LetterAccuracyStats[],
    levels: LevelProgress[],
    confusions: LetterConfusion[],
    voice: VoiceStats
  ): LanguageDiagnosis {
    // 1. Analisis 6 Jenjang Kurikulum
    const levelMap = new Map<number, LevelProgress>();
    levels.forEach((l) => levelMap.set(l.level, l));

    const LEVEL_DESCRIPTIONS: Record<number, string> = {
      1: 'Mengenal bentuk dan lafal 26 huruf vokal dan konsonan.',
      2: 'Merangkai konsonan dan vokal menjadi suku kata terbuka.',
      3: 'Membaca kata 2 suku kata bermakna (buku, bola, meja).',
      4: 'Membaca suku kata tertutup (makan, rumah, mobil).',
      5: 'Kombinasi diftong & sengau (bunga, nyamuk, pulau).',
      6: 'Membaca kalimat pendek mandiri dan memahami cerita.',
    };

    const levelDetails: LevelMasteryDetail[] = levelMeta.map((meta) => {
      const prog = levelMap.get(meta.level);
      const bestStars = prog?.bestStars ?? 0;
      const sessions = prog?.sessions ?? 0;

      let status: 'locked' | 'in_progress' | 'completed' = 'locked';
      const isUnlocked = prog?.unlocked ?? (meta.level === 1);
      if (bestStars >= 2) {
        status = 'completed';
      } else if (isUnlocked) {
        status = 'in_progress';
      } else {
        status = 'locked';
      }

      return {
        level: meta.level,
        title: meta.title,
        emoji: meta.emoji,
        description: LEVEL_DESCRIPTIONS[meta.level] || 'Latihan penguasaan membaca',
        bestStars,
        sessions,
        status,
      };
    });

    // 2. Tahap Milestone Saat Ini
    let activeStageIndex = 0;
    for (let i = 0; i < levelDetails.length; i++) {
      if (levelDetails[i].bestStars > 0) {
        activeStageIndex = i;
      }
    }
    const stageTitles = [
      'Tahap 1: Pengenal Huruf A–Z',
      'Tahap 2: Perangkai Suku Kata',
      'Tahap 3: Pembaca Kata Sederhana',
      'Tahap 4: Penakluk Suku Kata Tertutup',
      'Tahap 5: Master Diftong & Sengau',
      'Tahap 6: Pembaca Kalimat Mandiri',
    ];
    const currentMilestoneStage = stageTitles[activeStageIndex] || stageTitles[0];

    // 3. Huruf Lemah & Huruf yang Sering Tertukar
    const weakestLetters = AlphabetMasteryEngine.weakest(stats, 5);
    const sortedConfusions = [...confusions].sort((a, b) => b.times - a.times).slice(0, 5);

    // 4. Persentase Penguasaan Keseluruhan
    const lettersWithPractice = stats.filter((s) => s.attempts > 0);
    const totalLettersLearned = lettersWithPractice.length;

    let lettersScore = 0;
    if (lettersWithPractice.length > 0) {
      const sumAccuracy = lettersWithPractice.reduce((acc, s) => {
        return acc + (s.correct / Math.max(1, s.attempts));
      }, 0);
      lettersScore = (sumAccuracy / 26) * 100;
    }

    const totalStarsPossible = 6 * 3;
    const earnedStars = levels.reduce((sum, l) => sum + Math.min(3, l.bestStars), 0);
    const levelsScore = (earnedStars / totalStarsPossible) * 100;

    // Bobot: 60% penguasaan alfabet & kuis + 40% progres milestone level
    const overallMasteryPercent = Math.min(100, Math.round(lettersScore * 0.6 + levelsScore * 0.4));

    return {
      overallMasteryPercent,
      currentMilestoneStage,
      totalLettersLearned,
      confusions: sortedConfusions,
      weakestLetters,
      levels: levelDetails,
      voicePracticeCount: voice.attempts,
      voiceAverageStars: voice.avgStars,
    };
  }
}
