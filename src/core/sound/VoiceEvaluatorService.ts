/**
 * Voice Challenge: merekam ucapan anak (STT id-ID) lalu menilai kemiripan dengan target.
 * Memakai `expo-speech-recognition` (butuh development build, tidak jalan di Expo Go).
 * Bila modul tidak tersedia, `isAvailable()` bernilai false dan UI memakai mode latihan.
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

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function similarity(target: string, heard: string): number {
  const a = normalize(target);
  const b = normalize(heard);
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

export const starsFor = (sim: number): 1 | 2 | 3 => (sim >= 0.8 ? 3 : sim >= 0.5 ? 2 : 1);

export class VoiceEvaluatorService {
  isAvailable(): boolean {
    try {
      return !!mod && mod.isRecognitionAvailable();
    } catch {
      return false;
    }
  }

  /** Nilai teks yang terdengar terhadap target (tanpa mikrofon; berguna untuk uji). */
  evaluate(target: string, alternatives: string[]): VoiceResult {
    let best = { t: '', s: 0 };
    for (const t of alternatives) {
      const s = similarity(target, t);
      if (s > best.s) best = { t, s };
    }
    return { transcript: best.t, similarity: best.s, stars: starsFor(best.s) };
  }

  /** Dengarkan satu ucapan dan nilai. Reject bila izin ditolak / tidak tersedia. */
  async listenAndScore(target: string, accepted: string[] = [target]): Promise<VoiceResult> {
    if (!mod) throw new Error('unavailable');
    const perm = await mod.requestPermissionsAsync();
    if (!perm.granted) throw new Error('permission');

    return new Promise<VoiceResult>((resolve, reject) => {
      const subs: { remove(): void }[] = [];
      let finished = false;
      let alternatives: string[] = [];
      const cleanup = () => subs.forEach((s) => s.remove());
      const finish = (fn: () => void) => {
        if (finished) return;
        finished = true;
        cleanup();
        fn();
      };
      subs.push(
        mod!.addListener('result', (e) => {
          const alts: string[] = (e.results ?? []).map((r: { transcript: string }) => r.transcript);
          alternatives = alts;
          if (e.isFinal) {
            finish(() => {
              const scored = accepted.map((t) => this.evaluate(t, alts));
              resolve(scored.sort((x, y) => y.similarity - x.similarity)[0] ?? this.evaluate(target, alts));
            });
          }
        }),
        mod!.addListener('error', (e) => finish(() => (e?.error === 'no-speech' ? resolve(this.evaluate(target, [])) : reject(new Error(e?.error ?? 'error'))))),
        mod!.addListener('end', () =>
          finish(() => resolve(this.evaluate(target, alternatives)))
        )
      );
      try {
        mod!.start({ lang: 'id-ID', interimResults: false, maxAlternatives: 5, continuous: false });
      } catch (err) {
        finish(() => reject(err));
      }
      setTimeout(() => finish(() => { try { mod!.stop(); } catch {} resolve(this.evaluate(target, alternatives)); }), 8000);
    });
  }

  cancel() {
    try {
      mod?.abort();
    } catch {
      /* abaikan */
    }
  }
}

