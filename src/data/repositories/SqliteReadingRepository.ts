import { ReadingRepository } from '../../domain/repositories/ReadingRepository';
import {
  ChildProfile,
  LetterAccuracyStats,
  LevelProgress,
  VoiceStats,
} from '../../domain/entities/LetterAccuracyStats';
import { DatabaseService } from '../database/DatabaseService';

export class SqliteReadingRepository implements ReadingRepository {
  constructor(private readonly dbs: DatabaseService) {}

  async getProfile(): Promise<ChildProfile> {
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{ id: number; name: string; stars: number; mode: string }>(
      'SELECT * FROM profile WHERE id = 1'
    );
    return { id: 1, name: r!.name, stars: r!.stars, mode: r!.mode === 'mandiri' ? 'mandiri' : 'pemula' };
  }

  async updateProfile(patch: Partial<Omit<ChildProfile, 'id'>>): Promise<ChildProfile> {
    const db = await this.dbs.get();
    if (patch.name !== undefined) await db.runAsync('UPDATE profile SET name = ? WHERE id = 1', patch.name);
    if (patch.mode !== undefined) await db.runAsync('UPDATE profile SET mode = ? WHERE id = 1', patch.mode);
    if (patch.stars !== undefined) await db.runAsync('UPDATE profile SET stars = ? WHERE id = 1', patch.stars);
    return this.getProfile();
  }

  async addStars(n: number): Promise<ChildProfile> {
    const db = await this.dbs.get();
    await db.runAsync('UPDATE profile SET stars = stars + ? WHERE id = 1', n);
    return this.getProfile();
  }

  async getAllLetterStats(): Promise<LetterAccuracyStats[]> {
    const db = await this.dbs.get();
    const rows = await db.getAllAsync<{
      letter: string; correct_count: number; wrong_count: number; attempts: number; streak: number; last_seen: number | null;
    }>('SELECT * FROM letter_accuracy_stats ORDER BY letter');
    return rows.map((r) => ({
      letter: r.letter,
      correct: r.correct_count,
      wrong: r.wrong_count,
      attempts: r.attempts,
      streak: r.streak,
      lastSeen: r.last_seen,
    }));
  }

  async recordLetterResult(letter: string, correct: boolean, pressed?: string): Promise<void> {
    const db = await this.dbs.get();
    const L = letter.toUpperCase();
    const now = Date.now();
    await db.withTransactionAsync(async () => {
      if (correct) {
        await db.runAsync(
          `UPDATE letter_accuracy_stats
             SET correct_count = correct_count + 1, attempts = attempts + 1, streak = streak + 1, last_seen = ?
           WHERE letter = ?`,
          now, L
        );
      } else {
        await db.runAsync(
          `UPDATE letter_accuracy_stats
             SET wrong_count = wrong_count + 1, attempts = attempts + 1, streak = 0, last_seen = ?
           WHERE letter = ?`,
          now, L
        );
        if (pressed && pressed.toUpperCase() !== L) {
          await db.runAsync(
            `INSERT INTO letter_confusions (expected, pressed, times) VALUES (?, ?, 1)
             ON CONFLICT(expected, pressed) DO UPDATE SET times = times + 1`,
            L, pressed.toUpperCase()
          );
        }
      }
    });
  }

  async recordLevelSession(level: number, stars: number): Promise<void> {
    const db = await this.dbs.get();
    await db.runAsync(
      `INSERT INTO level_progress (level, best_stars, sessions) VALUES (?, ?, 1)
       ON CONFLICT(level) DO UPDATE SET best_stars = MAX(best_stars, excluded.best_stars), sessions = sessions + 1`,
      level, stars
    );
  }

  async getLevelProgress(): Promise<LevelProgress[]> {
    const db = await this.dbs.get();
    const rows = await db.getAllAsync<{ level: number; best_stars: number; sessions: number }>(
      'SELECT * FROM level_progress ORDER BY level'
    );
    return rows.map((r) => ({ level: r.level, bestStars: r.best_stars, sessions: r.sessions }));
  }

  async saveVoiceScore(target: string, transcript: string, similarity: number, stars: number): Promise<void> {
    const db = await this.dbs.get();
    await db.runAsync(
      'INSERT INTO voice_scores (target, transcript, similarity, stars, created_at) VALUES (?, ?, ?, ?, ?)',
      target, transcript, similarity, stars, Date.now()
    );
  }

  async getVoiceStats(): Promise<VoiceStats> {
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{ n: number; avg: number | null }>(
      'SELECT COUNT(*) AS n, AVG(stars) AS avg FROM voice_scores'
    );
    return { attempts: r?.n ?? 0, avgStars: r?.avg ?? 0 };
  }

  async resetAll(): Promise<void> {
    const db = await this.dbs.get();
    await db.withTransactionAsync(async () => {
      await db.runAsync("UPDATE profile SET stars = 0, mode = 'pemula' WHERE id = 1");
      await db.runAsync(
        'UPDATE letter_accuracy_stats SET correct_count = 0, wrong_count = 0, attempts = 0, streak = 0, last_seen = NULL'
      );
      await db.runAsync('DELETE FROM level_progress');
      await db.runAsync('DELETE FROM letter_confusions');
      await db.runAsync('DELETE FROM voice_scores');
    });
  }
}

