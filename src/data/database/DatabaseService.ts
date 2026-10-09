import type { SQLiteDatabase } from 'expo-sqlite';
import { openDatabaseAsync } from 'expo-sqlite';

/** Migrasi skema berurutan; versi disimpan di PRAGMA user_version. */
const MIGRATIONS: string[][] = [
  // v1
  [
    `CREATE TABLE IF NOT EXISTS profile (
       id INTEGER PRIMARY KEY CHECK (id = 1),
       name TEXT NOT NULL DEFAULT 'Teman Cici',
       stars INTEGER NOT NULL DEFAULT 0,
       mode TEXT NOT NULL DEFAULT 'pemula'
     );`,
    `INSERT OR IGNORE INTO profile (id) VALUES (1);`,
    `CREATE TABLE IF NOT EXISTS letter_accuracy_stats (
       letter TEXT PRIMARY KEY,
       correct_count INTEGER NOT NULL DEFAULT 0,
       wrong_count INTEGER NOT NULL DEFAULT 0,
       attempts INTEGER NOT NULL DEFAULT 0,
       streak INTEGER NOT NULL DEFAULT 0,
       last_seen INTEGER
     );`,
    `CREATE TABLE IF NOT EXISTS level_progress (
       level INTEGER PRIMARY KEY,
       best_stars INTEGER NOT NULL DEFAULT 0,
       sessions INTEGER NOT NULL DEFAULT 0
     );`,
  ],
  // v2: riwayat salah-ketik (huruf tertukar) & skor suara
  [
    `CREATE TABLE IF NOT EXISTS letter_confusions (
       expected TEXT NOT NULL,
       pressed TEXT NOT NULL,
       times INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (expected, pressed)
     );`,
    `CREATE TABLE IF NOT EXISTS voice_scores (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       target TEXT NOT NULL,
       transcript TEXT NOT NULL,
       similarity REAL NOT NULL,
       stars INTEGER NOT NULL,
       created_at INTEGER NOT NULL
     );`,
  ],
  // v3: Akun Google & Cloud Sync backup snapshot
  [
    `CREATE TABLE IF NOT EXISTS cloud_sync (
       id INTEGER PRIMARY KEY CHECK (id = 1),
       google_id TEXT,
       email TEXT,
       display_name TEXT,
       photo_url TEXT,
       backup_json TEXT,
       last_synced INTEGER
     );`,
    `INSERT OR IGNORE INTO cloud_sync (id) VALUES (1);`,
  ],
  // v4: Multi-profil anak, Game Progress (Continue Soal 1-30), & Leveling Bertahap
  [
    `CREATE TABLE IF NOT EXISTS child_profiles (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       user_id TEXT,
       name TEXT NOT NULL DEFAULT 'Teman Cici',
       birth_date TEXT,
       avatar TEXT NOT NULL DEFAULT '🐱',
       stars INTEGER NOT NULL DEFAULT 0,
       mode TEXT NOT NULL DEFAULT 'pemula',
       unlocked_level INTEGER NOT NULL DEFAULT 1,
       created_at INTEGER NOT NULL
     );`,
    `CREATE TABLE IF NOT EXISTS active_session (
       id INTEGER PRIMARY KEY CHECK (id = 1),
       active_profile_id INTEGER,
       user_id TEXT,
       is_logged_in INTEGER NOT NULL DEFAULT 0
     );`,
    `INSERT OR IGNORE INTO active_session (id, active_profile_id, is_logged_in) VALUES (1, 1, 0);`,
    `CREATE TABLE IF NOT EXISTS game_progress (
       profile_id INTEGER NOT NULL,
       game_id TEXT NOT NULL,
       current_round INTEGER NOT NULL DEFAULT 0,
       score INTEGER NOT NULL DEFAULT 0,
       completed_questions TEXT NOT NULL DEFAULT '[]',
       last_played_at INTEGER NOT NULL,
       PRIMARY KEY (profile_id, game_id)
     );`,
    `CREATE TABLE IF NOT EXISTS profile_letter_stats (
       profile_id INTEGER NOT NULL,
       letter TEXT NOT NULL,
       correct_count INTEGER NOT NULL DEFAULT 0,
       wrong_count INTEGER NOT NULL DEFAULT 0,
       attempts INTEGER NOT NULL DEFAULT 0,
       streak INTEGER NOT NULL DEFAULT 0,
       last_seen INTEGER,
       PRIMARY KEY (profile_id, letter)
     );`,
    `CREATE TABLE IF NOT EXISTS profile_level_progress (
       profile_id INTEGER NOT NULL,
       level INTEGER NOT NULL,
       best_stars INTEGER NOT NULL DEFAULT 0,
       sessions INTEGER NOT NULL DEFAULT 0,
       unlocked INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (profile_id, level)
     );`,
    `CREATE TABLE IF NOT EXISTS profile_confusions (
       profile_id INTEGER NOT NULL,
       expected TEXT NOT NULL,
       pressed TEXT NOT NULL,
       times INTEGER NOT NULL DEFAULT 0,
       PRIMARY KEY (profile_id, expected, pressed)
     );`,
    `CREATE TABLE IF NOT EXISTS profile_voice_scores (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       profile_id INTEGER NOT NULL,
       target TEXT NOT NULL,
       transcript TEXT NOT NULL,
       similarity REAL NOT NULL,
       stars INTEGER NOT NULL,
       created_at INTEGER NOT NULL
     );`,
    // Migrasi profil awal jika belum ada
    `INSERT OR IGNORE INTO child_profiles (id, name, avatar, stars, mode, unlocked_level, created_at)
     SELECT 1, name, '🐱', stars, mode, 1, 1700000000000 FROM profile WHERE id = 1;`,
    `INSERT OR IGNORE INTO profile_level_progress (profile_id, level, best_stars, sessions, unlocked)
     VALUES (1, 1, 0, 0, 1), (1, 2, 0, 0, 0), (1, 3, 0, 0, 0), (1, 4, 0, 0, 0), (1, 5, 0, 0, 0), (1, 6, 0, 0, 0);`,
  ],
];

export class DatabaseService {
  private db: SQLiteDatabase | null = null;
  private opening: Promise<SQLiteDatabase> | null = null;

  async get(): Promise<SQLiteDatabase> {
    if (this.db) return this.db;
    if (!this.opening) this.opening = this.open();
    return this.opening;
  }

  private async open(): Promise<SQLiteDatabase> {
    const db = await openDatabaseAsync('bacalah.db');
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await this.migrate(db);
    this.db = db;
    return db;
  }

  private async migrate(db: SQLiteDatabase) {
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    let version = row?.user_version ?? 0;
    while (version < MIGRATIONS.length) {
      const statements = MIGRATIONS[version];
      await db.withTransactionAsync(async () => {
        for (const sql of statements) await db.execAsync(sql);
      });
      version += 1;
      await db.execAsync(`PRAGMA user_version = ${version}`);
    }
    // Pastikan seluruh 26 huruf A–Z ada di tabel statistik.
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    await db.withTransactionAsync(async () => {
      for (const l of letters) {
        await db.runAsync('INSERT OR IGNORE INTO letter_accuracy_stats (letter) VALUES (?)', l);
      }
    });
  }
}

