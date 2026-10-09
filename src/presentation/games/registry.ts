import React from 'react';
import { colors } from '../../core/theme';
import { DetektifKalimat } from './detektif-kalimat/DetektifKalimat';
import { KeretaKata } from './kereta-kata/KeretaKata';
import { KotakPosHuruf } from './kotak-pos/KotakPosHuruf';
import { LompatTeratai } from './lompat-teratai/LompatTeratai';
import { MancingHuruf } from './mancing-huruf/MancingHuruf';
import { MemoriBunyi } from './memori-bunyi/MemoriBunyi';
import { PotongSukuKata } from './potong-suku-kata/PotongSukuKata';
import { SusunKata } from './susun-kata/SusunKata';
import { TangkapBalonHuruf } from './tangkap-balon-huruf/TangkapBalonHuruf';
import { TekaTekiHuruf } from './teka-teki-huruf/TekaTekiHuruf';
import { TirukanCici } from './tirukan-cici/TirukanCici';

export interface GameDef {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  color: string;
  edge: string;
  Component: React.ComponentType<{ onExit: () => void }>;
}

export const GAMES: GameDef[] = [
  // 3 Game Baru Tingkat Lebih Sulit
  {
    id: 'susun-kata',
    title: 'Susun Kata Acak',
    emoji: '🔤',
    desc: 'Tantangan anagram: Susun balok huruf acak menjadi kata utuh',
    color: colors.coral,
    edge: colors.coralDark,
    Component: SusunKata,
  },
  {
    id: 'detektif-kalimat',
    title: 'Detektif Kalimat',
    emoji: '🕵️',
    desc: 'Lengkapi kata yang hilang dalam kalimat cerita Cici',
    color: colors.peach,
    edge: colors.peachDark,
    Component: DetektifKalimat,
  },
  {
    id: 'memori-bunyi',
    title: 'Memori Kartu Bunyi',
    emoji: '🧠',
    desc: 'Buka kartu flip 3D & cocokkan pasangan bunyi suku kata',
    color: colors.lavender,
    edge: colors.lavenderDark,
    Component: MemoriBunyi,
  },

  // 8 Game Edukatif Inti
  {
    id: 'balon',
    title: 'Tangkap Balon Huruf',
    emoji: '🎈',
    desc: 'Pecahkan balon huruf yang Cici sebut',
    color: colors.sky,
    edge: colors.skyDark,
    Component: TangkapBalonHuruf,
  },
  {
    id: 'mancing',
    title: 'Mancing Huruf',
    emoji: '🎣',
    desc: 'Pancing huruf sesuai suara',
    color: colors.mint,
    edge: colors.mintDark,
    Component: MancingHuruf,
  },
  {
    id: 'kereta',
    title: 'Kereta Kata Cici',
    emoji: '🚂',
    desc: 'Susun gerbong suku kata',
    color: colors.coral,
    edge: colors.coralDark,
    Component: KeretaKata,
  },
  {
    id: 'tirukan',
    title: 'Tirukan Cici',
    emoji: '🎤',
    desc: 'Ucapkan lalu dapat bintang',
    color: colors.lavender,
    edge: colors.lavenderDark,
    Component: TirukanCici,
  },
  {
    id: 'teka',
    title: 'Teka-Teki Huruf',
    emoji: '🧩',
    desc: 'Isi huruf yang hilang',
    color: colors.peach,
    edge: colors.peachDark,
    Component: TekaTekiHuruf,
  },
  {
    id: 'teratai',
    title: 'Lompat Teratai',
    emoji: '🏃',
    desc: 'Bantu Cici menyeberang kolam',
    color: colors.mint,
    edge: colors.mintDark,
    Component: LompatTeratai,
  },
  {
    id: 'potong',
    title: 'Potong Suku Kata',
    emoji: '🍕',
    desc: 'Potong kata jadi suku kata',
    color: colors.coral,
    edge: colors.coralDark,
    Component: PotongSukuKata,
  },
  {
    id: 'pos',
    title: 'Kotak Pos Huruf',
    emoji: '📦',
    desc: 'Huruf kecil ke kotak huruf besar',
    color: colors.sunny,
    edge: colors.sunnyDark,
    Component: KotakPosHuruf,
  },
];
