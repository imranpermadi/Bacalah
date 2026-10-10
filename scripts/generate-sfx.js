// Menghasilkan SFX lembut (WAV 16-bit mono) ke assets/sfx. Jalankan: npm run sfx
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const outDir = path.join(__dirname, '..', 'assets', 'sfx');
fs.mkdirSync(outDir, { recursive: true });

function writeWav(name, samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => {
    const v = Math.max(-1, Math.min(1, s));
    data.writeInt16LE(Math.round(v * 32767 * 0.6), i * 2);
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(outDir, name + '.wav'), Buffer.concat([header, data]));
}

const n = (sec) => Math.floor(sec * RATE);

function tone(freq, sec, { sweepTo, decay = 6, attack = 0.005 } = {}) {
  const out = [];
  const len = n(sec);
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / RATE;
    const f = sweepTo ? freq + (sweepTo - freq) * (i / len) : freq;
    phase += (2 * Math.PI * f) / RATE;
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    out.push(Math.sin(phase) * env);
  }
  return out;
}

function mix(parts) {
  const len = Math.max(...parts.map((p) => p.offset + p.data.length));
  const out = new Array(len).fill(0);
  parts.forEach(({ offset, data }) => data.forEach((s, i) => (out[offset + i] += s)));
  return out;
}

// tap: ketukan lembut
writeWav('tap', tone(660, 0.08, { decay: 40 }));
// pop: gelembung
writeWav('pop', tone(380, 0.14, { sweepTo: 900, decay: 22 }));
// boop: umpan balik salah yang lembut (bukan buzzer)
writeWav('boop', tone(330, 0.22, { sweepTo: 260, decay: 10 }).map((s) => s * 0.5));
// swoosh: desingan cepat meluncur
writeWav('swoosh', tone(750, 0.18, { sweepTo: 180, decay: 15 }));
// error_buzz: getaran dengung kartun saat anak menjawab salah
writeWav(
  'error_buzz',
  mix([
    { offset: 0, data: tone(160, 0.28, { sweepTo: 110, decay: 7 }) },
    { offset: 0, data: tone(215, 0.28, { sweepTo: 145, decay: 7 }) },
  ])
);
// tada_magic: jingle magis ceria kemenangan saat anak menjawab benar
writeWav(
  'tada_magic',
  mix([
    { offset: n(0.0), data: tone(523.25, 0.45, { decay: 4 }) }, // C5
    { offset: n(0.08), data: tone(659.25, 0.45, { decay: 4 }) }, // E5
    { offset: n(0.16), data: tone(783.99, 0.5, { decay: 3.5 }) }, // G5
    { offset: n(0.24), data: tone(1046.5, 0.65, { decay: 3 }) }, // C6
    { offset: n(0.32), data: tone(1318.51, 0.75, { decay: 2.5 }) }, // E6 sparkle
  ])
);
// chime: tiga nada naik
writeWav(
  'chime',
  mix([523.25, 659.25, 783.99, 1046.5].map((f, i) => ({ offset: n(i * 0.11), data: tone(f, 0.5, { decay: 5 }) })))
);
// tepuk tangan: ledakan noise pendek berulang
(function clap() {
  const parts = [];
  for (let c = 0; c < 18; c++) {
    const len = n(0.05);
    const data = [];
    for (let i = 0; i < len; i++) data.push((Math.random() * 2 - 1) * Math.exp(-i / (len / 5)) * 0.7);
    parts.push({ offset: n(c * 0.085 + Math.random() * 0.03), data });
  }
  writeWav('clap', mix(parts));
})();

console.log('SFX dibuat di', outDir);

