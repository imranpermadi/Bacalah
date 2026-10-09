import { ReadingRepository } from '../../domain/repositories/ReadingRepository';
import {
  ChildProfile,
  GameProgressState,
  GoogleAccount,
  LetterAccuracyStats,
  LetterConfusion,
  LevelProgress,
  VoiceStats,
} from '../../domain/entities/LetterAccuracyStats';
import { DatabaseService } from '../database/DatabaseService';

export class SqliteReadingRepository implements ReadingRepository {
  constructor(private readonly dbs: DatabaseService) {}

  async getActiveProfileId(): Promise<number> {
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{ active_profile_id: number | null }>(
      'SELECT active_profile_id FROM active_session WHERE id = 1'
    );
    return r?.active_profile_id ?? 1;
  }

  async setActiveProfileId(id: number): Promise<void> {
    const db = await this.dbs.get();
    await db.runAsync('UPDATE active_session SET active_profile_id = ? WHERE id = 1', id);
  }

  async getLoginStatus(): Promise<boolean> {
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{ is_logged_in: number }>(
      'SELECT is_logged_in FROM active_session WHERE id = 1'
    );
    return (r?.is_logged_in ?? 0) === 1;
  }

  async setLoginStatus(isLoggedIn: boolean): Promise<void> {
    const db = await this.dbs.get();
    await db.runAsync('UPDATE active_session SET is_logged_in = ? WHERE id = 1', isLoggedIn ? 1 : 0);
  }

  async getProfiles(): Promise<ChildProfile[]> {
    const db = await this.dbs.get();
    const rows = await db.getAllAsync<{
      id: number;
      user_id: string | null;
      name: string;
      birth_date: string | null;
      avatar: string;
      stars: number;
      mode: string;
      unlocked_level: number;
      created_at: number;
    }>('SELECT * FROM child_profiles ORDER BY id ASC');

    if (rows.length === 0) {
      // Buat profil default jika belum ada
      const initial = await this.createProfile({ name: 'Teman Cici', avatar: '🐱' });
      return [initial];
    }

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id ?? undefined,
      name: r.name,
      birthDate: r.birth_date ?? undefined,
      avatar: r.avatar || '🐱',
      stars: r.stars,
      mode: r.mode === 'mandiri' ? 'mandiri' : 'pemula',
      unlockedLevel: r.unlocked_level || 1,
      createdAt: r.created_at || Date.now(),
    }));
  }

  async getProfile(id?: number): Promise<ChildProfile> {
    const targetId = id ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{
      id: number;
      user_id: string | null;
      name: string;
      birth_date: string | null;
      avatar: string;
      stars: number;
      mode: string;
      unlocked_level: number;
      created_at: number;
    }>('SELECT * FROM child_profiles WHERE id = ?', targetId);

    if (!r) {
      const all = await this.getProfiles();
      return all[0];
    }

    return {
      id: r.id,
      userId: r.user_id ?? undefined,
      name: r.name,
      birthDate: r.birth_date ?? undefined,
      avatar: r.avatar || '🐱',
      stars: r.stars,
      mode: r.mode === 'mandiri' ? 'mandiri' : 'pemula',
      unlockedLevel: r.unlocked_level || 1,
      createdAt: r.created_at || Date.now(),
    };
  }

  async createProfile(data: { name: string; birthDate?: string; avatar: string }): Promise<ChildProfile> {
    const db = await this.dbs.get();
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO child_profiles (name, birth_date, avatar, stars, mode, unlocked_level, created_at)
       VALUES (?, ?, ?, 0, 'pemula', 1, ?)`,
      data.name.trim() || 'Teman Cici',
      data.birthDate || null,
      data.avatar || '🐱',
      now
    );
    const newId = result.lastInsertRowId;

    // Inisialisasi level progress untuk anak baru: Level 1 unlocked, Level 2-6 locked
    await db.withTransactionAsync(async () => {
      for (let lvl = 1; lvl <= 6; lvl++) {
        await db.runAsync(
          `INSERT OR IGNORE INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
           VALUES (?, ?, 0, 0, ?)`,
          newId,
          lvl,
          lvl === 1 ? 1 : 0
        );
      }
      // Inisialisasi 26 huruf
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      for (const l of letters) {
        await db.runAsync(
          `INSERT OR IGNORE INTO profile_letter_stats (profile_id, letter) VALUES (?, ?)`,
          newId,
          l
        );
      }
    });

    return this.getProfile(newId);
  }

  async updateProfile(id: number, patch: Partial<Omit<ChildProfile, 'id'>>): Promise<ChildProfile> {
    const db = await this.dbs.get();
    if (patch.name !== undefined) await db.runAsync('UPDATE child_profiles SET name = ? WHERE id = ?', patch.name, id);
    if (patch.avatar !== undefined) await db.runAsync('UPDATE child_profiles SET avatar = ? WHERE id = ?', patch.avatar, id);
    if (patch.birthDate !== undefined) await db.runAsync('UPDATE child_profiles SET birth_date = ? WHERE id = ?', patch.birthDate, id);
    if (patch.mode !== undefined) await db.runAsync('UPDATE child_profiles SET mode = ? WHERE id = ?', patch.mode, id);
    if (patch.stars !== undefined) await db.runAsync('UPDATE child_profiles SET stars = ? WHERE id = ?', patch.stars, id);
    if (patch.unlockedLevel !== undefined) {
      await db.runAsync('UPDATE child_profiles SET unlocked_level = ? WHERE id = ?', patch.unlockedLevel, id);
    }
    return this.getProfile(id);
  }

  async deleteProfile(id: number): Promise<void> {
    const db = await this.dbs.get();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM child_profiles WHERE id = ?', id);
      await db.runAsync('DELETE FROM profile_letter_stats WHERE profile_id = ?', id);
      await db.runAsync('DELETE FROM profile_level_progress WHERE profile_id = ?', id);
      await db.runAsync('DELETE FROM profile_confusions WHERE profile_id = ?', id);
      await db.runAsync('DELETE FROM profile_voice_scores WHERE profile_id = ?', id);
      await db.runAsync('DELETE FROM game_progress WHERE profile_id = ?', id);
    });
    const remaining = await this.getProfiles();
    await this.setActiveProfileId(remaining[0].id);
  }

  async addStars(n: number, profileId?: number): Promise<ChildProfile> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    await db.runAsync('UPDATE child_profiles SET stars = stars + ? WHERE id = ?', n, targetId);
    return this.getProfile(targetId);
  }

  async getAllLetterStats(profileId?: number): Promise<LetterAccuracyStats[]> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();

    // Pastikan 26 huruf ada
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const existing = await db.getAllAsync<{ letter: string }>(
      'SELECT letter FROM profile_letter_stats WHERE profile_id = ?',
      targetId
    );
    const existingSet = new Set(existing.map((e) => e.letter));
    const missing = letters.filter((l) => !existingSet.has(l));
    if (missing.length > 0) {
      await db.withTransactionAsync(async () => {
        for (const m of missing) {
          await db.runAsync(
            'INSERT OR IGNORE INTO profile_letter_stats (profile_id, letter) VALUES (?, ?)',
            targetId,
            m
          );
        }
      });
    }

    const rows = await db.getAllAsync<{
      letter: string;
      correct_count: number;
      wrong_count: number;
      attempts: number;
      streak: number;
      last_seen: number | null;
    }>('SELECT * FROM profile_letter_stats WHERE profile_id = ? ORDER BY letter', targetId);

    return rows.map((r) => ({
      letter: r.letter,
      correct: r.correct_count,
      wrong: r.wrong_count,
      attempts: r.attempts,
      streak: r.streak,
      lastSeen: r.last_seen,
    }));
  }

  async recordLetterResult(letter: string, correct: boolean, pressed?: string, profileId?: number): Promise<void> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    const L = letter.toUpperCase();
    const now = Date.now();

    await db.withTransactionAsync(async () => {
      // Pastikan baris huruf ada
      await db.runAsync(
        'INSERT OR IGNORE INTO profile_letter_stats (profile_id, letter) VALUES (?, ?)',
        targetId,
        L
      );

      if (correct) {
        await db.runAsync(
          `UPDATE profile_letter_stats
             SET correct_count = correct_count + 1, attempts = attempts + 1, streak = streak + 1, last_seen = ?
           WHERE profile_id = ? AND letter = ?`,
          now,
          targetId,
          L
        );
      } else {
        await db.runAsync(
          `UPDATE profile_letter_stats
             SET wrong_count = wrong_count + 1, attempts = attempts + 1, streak = 0, last_seen = ?
           WHERE profile_id = ? AND letter = ?`,
          now,
          targetId,
          L
        );
        if (pressed && pressed.toUpperCase() !== L) {
          await db.runAsync(
            `INSERT INTO profile_confusions (profile_id, expected, pressed, times) VALUES (?, ?, ?, 1)
             ON CONFLICT(profile_id, expected, pressed) DO UPDATE SET times = times + 1`,
            targetId,
            L,
            pressed.toUpperCase()
          );
        }
      }
    });
  }

  async getLetterConfusions(profileId?: number): Promise<LetterConfusion[]> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    const rows = await db.getAllAsync<{ expected: string; pressed: string; times: number }>(
      'SELECT expected, pressed, times FROM profile_confusions WHERE profile_id = ? ORDER BY times DESC LIMIT 10',
      targetId
    );
    return rows.map((r) => ({
      expected: r.expected,
      pressed: r.pressed,
      times: r.times,
    }));
  }

  async recordLevelSession(level: number, stars: number, profileId?: number): Promise<{ unlockedNext: boolean }> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    const passed = stars >= 2; // Opsi A: minimal akurasi 80% / 2-3 bintang
    let unlockedNext = false;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
         VALUES (?, ?, ?, 1, 1)
         ON CONFLICT(profile_id, level) DO UPDATE SET
           best_stars = MAX(best_stars, excluded.best_stars),
           sessions = sessions + 1,
           unlocked = 1`,
        targetId,
        level,
        stars
      );

      // Jika lulus (bintang >= 2), buka level berikutnya!
      if (passed && level < 6) {
        const nextLevel = level + 1;
        await db.runAsync(
          `INSERT INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
           VALUES (?, ?, 0, 0, 1)
           ON CONFLICT(profile_id, level) DO UPDATE SET unlocked = 1`,
          targetId,
          nextLevel
        );

        // Update juga unlocked_level di child_profiles jika lebih tinggi
        await db.runAsync(
          `UPDATE child_profiles SET unlocked_level = MAX(unlocked_level, ?) WHERE id = ?`,
          nextLevel,
          targetId
        );
        unlockedNext = true;
      }
    });

    return { unlockedNext };
  }

  async getLevelProgress(profileId?: number): Promise<LevelProgress[]> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();

    // Pastikan 6 level tercatat
    for (let lvl = 1; lvl <= 6; lvl++) {
      await db.runAsync(
        `INSERT OR IGNORE INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
         VALUES (?, ?, 0, 0, ?)`,
        targetId,
        lvl,
        lvl === 1 ? 1 : 0
      );
    }

    const rows = await db.getAllAsync<{ level: number; best_stars: number; sessions: number; unlocked: number }>(
      'SELECT level, best_stars, sessions, unlocked FROM profile_level_progress WHERE profile_id = ? ORDER BY level',
      targetId
    );
    return rows.map((r) => ({
      level: r.level,
      bestStars: r.best_stars,
      sessions: r.sessions,
      unlocked: r.unlocked === 1,
    }));
  }

  async unlockLevel(level: number, profileId?: number): Promise<void> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
         VALUES (?, ?, 0, 0, 1)
         ON CONFLICT(profile_id, level) DO UPDATE SET unlocked = 1`,
        targetId,
        level
      );
      await db.runAsync(
        `UPDATE child_profiles SET unlocked_level = MAX(unlocked_level, ?) WHERE id = ?`,
        level,
        targetId
      );
    });
  }

  async getGameProgress(gameId: string, profileId?: number): Promise<GameProgressState | null> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{
      profile_id: number;
      game_id: string;
      current_round: number;
      score: number;
      completed_questions: string;
      last_played_at: number;
    }>(
      'SELECT profile_id, game_id, current_round, score, completed_questions, last_played_at FROM game_progress WHERE profile_id = ? AND game_id = ?',
      targetId,
      gameId
    );
    if (!r) return null;
    let completedQuestionIds: string[] = [];
    try {
      completedQuestionIds = JSON.parse(r.completed_questions);
    } catch {
      completedQuestionIds = [];
    }
    return {
      profileId: r.profile_id,
      gameId: r.game_id,
      currentRound: r.current_round,
      score: r.score,
      completedQuestionIds,
      lastPlayedAt: r.last_played_at,
    };
  }

  async saveGameProgress(progress: GameProgressState): Promise<void> {
    const db = await this.dbs.get();
    await db.runAsync(
      `INSERT INTO game_progress (profile_id, game_id, current_round, score, completed_questions, last_played_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(profile_id, game_id) DO UPDATE SET
         current_round = excluded.current_round,
         score = excluded.score,
         completed_questions = excluded.completed_questions,
         last_played_at = excluded.last_played_at`,
      progress.profileId,
      progress.gameId,
      progress.currentRound,
      progress.score,
      JSON.stringify(progress.completedQuestionIds),
      Date.now()
    );
  }

  async resetGameProgress(gameId: string, profileId?: number): Promise<void> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    await db.runAsync(
      'DELETE FROM game_progress WHERE profile_id = ? AND game_id = ?',
      targetId,
      gameId
    );
  }

  async saveVoiceScore(
    target: string,
    transcript: string,
    similarity: number,
    stars: number,
    profileId?: number
  ): Promise<void> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    await db.runAsync(
      'INSERT INTO profile_voice_scores (profile_id, target, transcript, similarity, stars, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      targetId,
      target,
      transcript,
      similarity,
      stars,
      Date.now()
    );
  }

  async getVoiceStats(profileId?: number): Promise<VoiceStats> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{ n: number; avg: number | null }>(
      'SELECT COUNT(*) AS n, AVG(stars) AS avg FROM profile_voice_scores WHERE profile_id = ?',
      targetId
    );
    return { attempts: r?.n ?? 0, avgStars: r?.avg ?? 0 };
  }

  async getGoogleAccount(): Promise<GoogleAccount | null> {
    const db = await this.dbs.get();
    const r = await db.getFirstAsync<{
      google_id: string | null;
      email: string | null;
      display_name: string | null;
      photo_url: string | null;
      last_synced: number | null;
    }>('SELECT google_id, email, display_name, photo_url, last_synced FROM cloud_sync WHERE id = 1');
    if (!r || !r.email) return null;
    return {
      id: r.google_id || 'google_user',
      email: r.email,
      name: r.display_name || 'Akun Google',
      photoUrl: r.photo_url,
      lastSyncedAt: r.last_synced,
    };
  }

  async saveGoogleAccount(account: GoogleAccount | null): Promise<void> {
    const db = await this.dbs.get();
    if (!account) {
      await db.runAsync(
        'UPDATE cloud_sync SET google_id = NULL, email = NULL, display_name = NULL, photo_url = NULL, last_synced = NULL WHERE id = 1'
      );
      await this.setLoginStatus(false);
    } else {
      await db.runAsync(
        `UPDATE cloud_sync 
         SET google_id = ?, email = ?, display_name = ?, photo_url = ?, last_synced = ? 
         WHERE id = 1`,
        account.id,
        account.email,
        account.name,
        account.photoUrl,
        account.lastSyncedAt ?? Date.now()
      );
      await this.setLoginStatus(true);
    }
  }

  async getBackupSnapshot(): Promise<string> {
    const profiles = await this.getProfiles();
    const activeProfileId = await this.getActiveProfileId();
    const db = await this.dbs.get();

    const allStats = await db.getAllAsync('SELECT * FROM profile_letter_stats');
    const allLevels = await db.getAllAsync('SELECT * FROM profile_level_progress');
    const allConfusions = await db.getAllAsync('SELECT * FROM profile_confusions');
    const allVoice = await db.getAllAsync('SELECT * FROM profile_voice_scores');
    const allGameProgress = await db.getAllAsync('SELECT * FROM game_progress');

    const snapshot = {
      version: 2,
      exportedAt: Date.now(),
      activeProfileId,
      profiles,
      stats: allStats,
      levels: allLevels,
      confusions: allConfusions,
      voiceScores: allVoice,
      gameProgress: allGameProgress,
    };

    const jsonStr = JSON.stringify(snapshot);
    await db.runAsync(
      'UPDATE cloud_sync SET backup_json = ?, last_synced = ? WHERE id = 1',
      jsonStr,
      snapshot.exportedAt
    );
    return jsonStr;
  }

  async restoreBackupSnapshot(jsonStr: string): Promise<void> {
    const data = JSON.parse(jsonStr);
    const db = await this.dbs.get();
    await db.withTransactionAsync(async () => {
      if (Array.isArray(data.profiles)) {
        for (const p of data.profiles) {
          await db.runAsync(
            `INSERT INTO child_profiles (id, user_id, name, birth_date, avatar, stars, mode, unlocked_level, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               name = excluded.name,
               avatar = excluded.avatar,
               birth_date = excluded.birth_date,
               stars = excluded.stars,
               mode = excluded.mode,
               unlocked_level = excluded.unlocked_level`,
            p.id,
            p.userId ?? null,
            p.name,
            p.birthDate ?? null,
            p.avatar || '🐱',
            p.stars ?? 0,
            p.mode || 'pemula',
            p.unlockedLevel || 1,
            p.createdAt || Date.now()
          );
        }
      }
      if (Array.isArray(data.stats)) {
        for (const s of data.stats) {
          await db.runAsync(
            `INSERT INTO profile_letter_stats (profile_id, letter, correct_count, wrong_count, attempts, streak, last_seen)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(profile_id, letter) DO UPDATE SET
               correct_count = excluded.correct_count,
               wrong_count = excluded.wrong_count,
               attempts = excluded.attempts,
               streak = excluded.streak,
               last_seen = excluded.last_seen`,
            s.profile_id,
            s.letter,
            s.correct_count,
            s.wrong_count,
            s.attempts,
            s.streak,
            s.last_seen
          );
        }
      }
      if (Array.isArray(data.levels)) {
        for (const l of data.levels) {
          await db.runAsync(
            `INSERT INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(profile_id, level) DO UPDATE SET
               best_stars = excluded.best_stars,
               sessions = excluded.sessions,
               unlocked = excluded.unlocked`,
            l.profile_id,
            l.level,
            l.best_stars,
            l.sessions,
            l.unlocked
          );
        }
      }
      if (Array.isArray(data.gameProgress)) {
        for (const g of data.gameProgress) {
          await db.runAsync(
            `INSERT INTO game_progress (profile_id, game_id, current_round, score, completed_questions, last_played_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(profile_id, game_id) DO UPDATE SET
               current_round = excluded.current_round,
               score = excluded.score,
               completed_questions = excluded.completed_questions,
               last_played_at = excluded.last_played_at`,
            g.profile_id,
            g.game_id,
            g.current_round,
            g.score,
            g.completed_questions,
            g.last_played_at
          );
        }
      }
      await db.runAsync('UPDATE cloud_sync SET backup_json = ?, last_synced = ? WHERE id = 1', jsonStr, Date.now());
    });
  }

  async resetAll(profileId?: number): Promise<void> {
    const targetId = profileId ?? (await this.getActiveProfileId());
    const db = await this.dbs.get();
    await db.withTransactionAsync(async () => {
      await db.runAsync("UPDATE child_profiles SET stars = 0, mode = 'pemula', unlocked_level = 1 WHERE id = ?", targetId);
      await db.runAsync(
        'UPDATE profile_letter_stats SET correct_count = 0, wrong_count = 0, attempts = 0, streak = 0, last_seen = NULL WHERE profile_id = ?',
        targetId
      );
      await db.runAsync('DELETE FROM profile_level_progress WHERE profile_id = ?', targetId);
      await db.runAsync('DELETE FROM profile_confusions WHERE profile_id = ?', targetId);
      await db.runAsync('DELETE FROM profile_voice_scores WHERE profile_id = ?', targetId);
      await db.runAsync('DELETE FROM game_progress WHERE profile_id = ?', targetId);

      // Re-init levels for profile
      for (let lvl = 1; lvl <= 6; lvl++) {
        await db.runAsync(
          `INSERT INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
           VALUES (?, ?, 0, 0, ?)`,
          targetId,
          lvl,
          lvl === 1 ? 1 : 0
        );
      }
    });
  }
}
