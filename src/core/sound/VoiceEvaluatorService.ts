import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';

/**
 * Voice Challenge: merekam ucapan anak (STT id-ID) lalu menilai kemiripan dengan target.
 * Terhubung dengan `expo-speech-recognition` dan fallback ke `expo-audio`.
 */
type SpeechModule = {
  isRecognitionAvailable(): boolean;
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  start(opts: Record<string, unknown>): void;
  stop(): void;
  abort(): void;
  addListener(event: string, cb: (e: any) => void): { remove(): void };
};

let mod: SpeechModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  mod = require('expo-speech-recognition').ExpoSpeechRecognitionModule as SpeechModule;
} catch {
  mod = null;
}

export interface VoiceResult {
  transcript: string;
  similarity: number; // 0..1
  stars: 1 | 2 | 3;
}

const clean = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function similarity(target: string, heard: string): number {
  const tClean = clean(target);
  const hClean = clean(heard);
  if (!tClean || !hClean) return 0;

  const tNorm = tClean.replace(/[^a-z0-9]/g, '');
  const hNorm = hClean.replace(/[^a-z0-9]/g, '');

  if (!tNorm || !hNorm) return 0;
  if (tNorm === hNorm) return 1.0;

  // Split into words
  const tWords = tClean.split(/[\s,.\-!?;:"'()]+/).filter((w) => w.length > 0);
  const hWords = hClean.split(/[\s,.\-!?;:"'()]+/).filter((w) => w.length > 0);

  // Kasus Kalimat Panjang / Frasa (Cerita, Komik, Fakta Sains):
  if (tWords.length > 1) {
    let matchedCount = 0;
    for (const tw of tWords) {
      const twNorm = tw.replace(/[^a-z0-9]/g, '');
      if (!twNorm) continue;
      const matched = hWords.some((hw) => {
        const hwNorm = hw.replace(/[^a-z0-9]/g, '');
        if (!hwNorm) return false;
        if (hwNorm === twNorm || hwNorm.includes(twNorm) || twNorm.includes(hwNorm)) return true;
        const d = levenshtein(twNorm, hwNorm);
        return d <= 1 && Math.max(twNorm.length, hwNorm.length) >= 3;
      });
      if (matched) matchedCount++;
    }
    const coverage = matchedCount / tWords.length;
    if (coverage >= 0.7) return Math.max(0.9, coverage);
    if (coverage >= 0.45) return 0.75;
    if (coverage >= 0.25) return 0.5;
    return coverage;
  }

  // Kasus Kata Tunggal / Suku Kata / Huruf:
  if (hNorm.includes(tNorm) || tNorm.includes(hNorm)) {
    return 0.95;
  }

  let bestTokenSim = 0;
  for (const w of hWords) {
    const wNorm = w.replace(/[^a-z0-9]/g, '');
    if (!wNorm) continue;
    if (wNorm === tNorm) return 1.0;
    if (wNorm.includes(tNorm) || tNorm.includes(wNorm)) {
      bestTokenSim = Math.max(bestTokenSim, 0.92);
      continue;
    }
    const dist = levenshtein(tNorm, wNorm);
    const maxLen = Math.max(tNorm.length, wNorm.length);
    const score = 1 - dist / maxLen;
    // Toleransi 1 karakter untuk anak usia dini (4-8 tahun)
    if (dist <= 1 && maxLen <= 5) {
      bestTokenSim = Math.max(bestTokenSim, 0.88);
    } else {
      bestTokenSim = Math.max(bestTokenSim, score);
    }
  }

  if (bestTokenSim >= 0.65) {
    return Math.max(bestTokenSim, 0.85);
  }

  const fullDist = levenshtein(tNorm, hNorm);
  const fullSim = 1 - fullDist / Math.max(tNorm.length, hNorm.length);

  return Math.max(bestTokenSim, fullSim);
}

export const starsFor = (sim: number): 1 | 2 | 3 => (sim >= 0.65 ? 3 : sim >= 0.35 ? 2 : 1);

export class VoiceEvaluatorService {
  /**
   * Cek apakah perangkat mendukung perekaman audio / Speech Recognition.
   */
  isAvailable(): boolean {
    if (!mod) return false;
    try {
      return mod.isRecognitionAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Minta izin mikrofon baik dari expo-speech-recognition maupun expo-audio.
   */
  async ensurePermissions(): Promise<boolean> {
    try {
      if (mod && typeof mod.requestPermissionsAsync === 'function') {
        const res = await mod.requestPermissionsAsync();
        if (res.granted) return true;
      }
    } catch {
      // Abaikan dan coba lewat expo-audio
    }

    try {
      const current = await getRecordingPermissionsAsync();
      if (current.granted) return true;
      const requested = await requestRecordingPermissionsAsync();
      return requested.granted;
    } catch {
      return false;
    }
  }

  /** Nilai teks yang terdengar terhadap target. */
  evaluate(target: string, alternatives: string[]): VoiceResult {
    const validAlts = (alternatives || []).filter((a) => Boolean(a && a.trim()));
    if (validAlts.length === 0) {
      return { transcript: '', similarity: 0, stars: 1 };
    }
    let best = { t: validAlts[0], s: similarity(target, validAlts[0]) };
    for (const t of validAlts) {
      const s = similarity(target, t);
      if (s > best.s) best = { t, s };
    }
    return { transcript: best.t, similarity: best.s, stars: starsFor(best.s) };
  }

  /** Nilai alternatif suara terhadap seluruh variasi kata yang diterima (target + accepted). */
  evaluateCandidates(candidates: string[], alternatives: string[]): VoiceResult {
    const validAlts = (alternatives || []).filter((a) => Boolean(a && a.trim()));
    if (validAlts.length === 0) {
      return { transcript: '', similarity: 0, stars: 1 };
    }
    let bestResult: VoiceResult = { transcript: validAlts[0], similarity: 0, stars: 1 };
    for (const cand of candidates) {
      const scored = this.evaluate(cand, validAlts);
      if (scored.similarity > bestResult.similarity) {
        bestResult = scored;
      }
    }
    return bestResult;
  }

  /** Dengarkan ucapan anak dan nilai secara nyata. */
  async listenAndScore(target: string, accepted: string[] = [target]): Promise<VoiceResult> {
    const hasPerm = await this.ensurePermissions();
    if (!hasPerm) {
      throw new Error('permission');
    }

    const validCandidates = Array.from(new Set([target, ...accepted]));

    if (mod) {
      return new Promise<VoiceResult>((resolve) => {
        const subs: { remove(): void }[] = [];
        let finished = false;
        let alternatives: string[] = [];

        const cleanup = () => {
          subs.forEach((s) => {
            try {
              s.remove();
            } catch {}
          });
        };

        const finish = (fn: () => void) => {
          if (finished) return;
          finished = true;
          cleanup();
          fn();
        };

        try {
          subs.push(
            mod!.addListener('result', (e: any) => {
              const alts: string[] = (e.results ?? [])
                .map((r: { transcript: string }) => r.transcript)
                .filter((t: string) => Boolean(t && t.trim()));
              if (alts.length > 0) {
                alternatives = alts;
              }

              if (e.isFinal && alternatives.length > 0) {
                finish(() => {
                  resolve(this.evaluateCandidates(validCandidates, alternatives));
                });
              }
            }),
            mod!.addListener('nomatch', () => {
              finish(() => {
                // Tidak ada ucapan yang cocok / hening
                resolve({ transcript: '', similarity: 0, stars: 1 });
              });
            }),
            mod!.addListener('error', (_e: any) => {
              finish(() => {
                // Jika error (timeout / no-speech / dsb), kembalikan kosong (jangan dimanipulasi jadi bintang 3)
                if (alternatives.length > 0) {
                  resolve(this.evaluateCandidates(validCandidates, alternatives));
                } else {
                  resolve({ transcript: '', similarity: 0, stars: 1 });
                }
              });
            }),
            mod!.addListener('end', () => {
              finish(() => {
                if (alternatives.length > 0) {
                  resolve(this.evaluateCandidates(validCandidates, alternatives));
                } else {
                  resolve({ transcript: '', similarity: 0, stars: 1 });
                }
              });
            })
          );

          mod!.start({
            lang: 'id-ID',
            interimResults: true,
            maxAlternatives: 5,
            continuous: false,
          });
        } catch (_err) {
          finish(() => {
            resolve({ transcript: '', similarity: 0, stars: 1 });
          });
        }

        // Timeout 6 detik jika anak belum bersuara
        setTimeout(() => {
          finish(() => {
            try {
              mod!.stop();
            } catch {}
            if (alternatives.length > 0) {
              resolve(this.evaluateCandidates(validCandidates, alternatives));
            } else {
              resolve({ transcript: '', similarity: 0, stars: 1 });
            }
          });
        }, 6000);
      });
    }

    // Jika modul tidak tersedia di perangkat: jangan berikan bintang 3 palsu!
    throw new Error('engine_unavailable');
  }

  cancel() {
    try {
      mod?.abort();
    } catch {
      /* abaikan */
    }
  }
}


