const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const praise = [
  'Hebat sekali! 🎉',
  'Pintar! Cici bangga padamu! 🌟',
  'Yeay, benar! Kamu keren! 😸',
  'Wah, tepat sekali! 👏',
  'Mantap! Terus semangat ya! 💪',
];

export const hints = [
  'Hampir tepat! Ayo dengar sekali lagi bersama Cici! 🎧',
  'Tidak apa-apa, ayo coba lagi pelan-pelan ya! 💛',
  'Cici bantu ya, lihat huruf yang menyala! ✨',
  'Sedikit lagi! Dengarkan baik-baik ya! 👂',
];

export const encouragement = {
  low: 'Kamu sudah berusaha keras! Besok kita coba lagi ya! 💛',
  mid: 'Bagus sekali! Sedikit lagi jadi bintang tiga! 🌟',
  high: 'Luar biasa! Kamu jago membaca! 🏆',
};

export const randomPraise = () => pick(praise);
export const randomHint = () => pick(hints);

