import * as Speech from 'expo-speech';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

export const RATE_NORMAL = 0.85;
export const RATE_SLOW = 0.6;
const PITCH = 1.15;
const LANG = 'id-ID';

export type SfxName = 'tap' | 'pop' | 'boop' | 'chime' | 'clap';

const SFX_SOURCES: Record<SfxName, number> = {
  tap: require('../../../assets/sfx/tap.wav'),
  pop: require('../../../assets/sfx/pop.wav'),
  boop: require('../../../assets/sfx/boop.wav'),
  chime: require('../../../assets/sfx/chime.wav'),
  clap: require('../../../assets/sfx/clap.wav'),
};

/** TTS Cici (id-ID, pitch ramah anak) + SFX lembut. */
export class SoundService {
  private players: Partial<Record<SfxName, AudioPlayer>> = {};
  private token = 0;
  private audioReady = false;

  private async ensureAudio() {
    if (this.audioReady) return;
    this.audioReady = true;
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
    } catch {
      /* abaikan */
    }
  }

  /** Mengucapkan satu teks; resolve saat selesai (atau dihentikan/gagal). */
  speak(text: string, rate = RATE_NORMAL): Promise<void> {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: LANG,
        pitch: PITCH,
        rate,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
    });
  }

  /** Ucapkan beberapa potongan berurutan dengan jeda kecil (artikulasi jernih). */
  async speakParts(parts: string[], rate = RATE_SLOW, gapMs = 350): Promise<void> {
    const my = ++this.token;
    Speech.stop();
    for (const p of parts) {
      if (my !== this.token) return;
      await this.speak(p, rate);
      if (my !== this.token) return;
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }

  /** "Dengar Cici": kecepatan normal 0.85. */
  async hear(text: string): Promise<void> {
    this.token++;
    Speech.stop();
    await this.speak(text, RATE_NORMAL);
  }

  /** "Cici Pelan-Pelan": kecepatan ultra pelan 0.6, per potongan. */
  async hearSlow(parts: string[]): Promise<void> {
    await this.speakParts(parts, RATE_SLOW, 450);
  }

  /** Pesan Cici (umpan balik) — tidak memotong urutan lain bila sedang bicara. */
  async say(text: string): Promise<void> {
    this.token++;
    Speech.stop();
    await this.speak(text, RATE_NORMAL);
  }

  stop() {
    this.token++;
    Speech.stop();
  }

  async sfx(name: SfxName): Promise<void> {
    try {
      await this.ensureAudio();
      let p = this.players[name];
      if (!p) {
        p = createAudioPlayer(SFX_SOURCES[name]);
        this.players[name] = p;
      }
      await p.seekTo(0);
      p.play();
    } catch {
      /* SFX tidak boleh menghentikan pembelajaran */
    }
  }
}

