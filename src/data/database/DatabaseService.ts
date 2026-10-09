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

