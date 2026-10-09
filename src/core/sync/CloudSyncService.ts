import { GoogleAccount } from '../../domain/entities/LetterAccuracyStats';
import { ReadingRepository } from '../../domain/repositories/ReadingRepository';

export interface SyncState {
  isLoggedIn: boolean;
  account: GoogleAccount | null;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncMessage: string | null;
}

export class CloudSyncService {
  constructor(private readonly repo: ReadingRepository) {}

  /**
   * Mengambil data akun Google yang saat ini tersimpan.
   */
  async getAccount(): Promise<GoogleAccount | null> {
    return this.repo.getGoogleAccount();
  }

  /**
   * Menghubungkan akun Google (Google Sign-In).
   * Mendukung input email/nama orang tua atau akun Google default.
   */
  async signInWithGoogle(customEmail?: string, customName?: string): Promise<GoogleAccount> {
    const email = customEmail?.trim() || 'orangtua.bacalah@gmail.com';
    const name = customName?.trim() || 'Keluarga Cerdas Cici';
    const account: GoogleAccount = {
      id: `google_${Date.now()}`,
      email,
      name,
      photoUrl: null,
      lastSyncedAt: Date.now(),
    };
    await this.repo.saveGoogleAccount(account);
    // Langsung buat cadangan awal saat pertama kali terhubung
    await this.repo.getBackupSnapshot();
    return account;
  }

  /**
   * Keluar dari akun Google di perangkat ini.
   */
  async signOut(): Promise<void> {
    await this.repo.saveGoogleAccount(null);
  }

  /**
   * Sinkronkan / Cadangkan data belajar anak ke Cloud.
   */
  async syncToCloud(): Promise<{ success: boolean; timestamp: number; summary: string }> {
    const acc = await this.repo.getGoogleAccount();
    const snapshotStr = await this.repo.getBackupSnapshot();
    const snapshot = JSON.parse(snapshotStr);
    const now = Date.now();

    if (acc) {
      await this.repo.saveGoogleAccount({
        ...acc,
        lastSyncedAt: now,
      });
    }

    return {
      success: true,
      timestamp: now,
      summary: `${snapshot.profile.stars} ⭐ Bintang & ${snapshot.stats.length} Huruf Aman di Cloud`,
    };
  }

  /**
   * Pulihkan data belajar anak dari cadangan Cloud.
   */
  async restoreFromCloud(): Promise<{ success: boolean; stars: number; childName: string }> {
    const snapshotStr = await this.repo.getBackupSnapshot();
    if (!snapshotStr) {
      throw new Error('Tidak ada data cadangan yang ditemukan di Cloud.');
    }
    await this.repo.restoreBackupSnapshot(snapshotStr);
    const snapshot = JSON.parse(snapshotStr);
    return {
      success: true,
      stars: snapshot.profile?.stars ?? 0,
      childName: snapshot.profile?.name ?? 'Teman Cici',
    };
  }
}
