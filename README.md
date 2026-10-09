# 📖 BACALAH (Aplikasi Belajar Cepat Membaca & Menulis Anak)
> **Aplikasi Edukasi Cepat Membaca & Menulis Bahasa Indonesia untuk Anak Usia 4–8 Tahun**  
> Menguasai Seluruh 26 Huruf Alfabet (A–Z), Fonik, Suku Kata, Kata, dan Kalimat Pendek Bergambar.  
> Dipandu oleh Maskot Ceria: **Cici si Kucing Putih** 🐱

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📲 Unduh & Pasang Langsung di HP Android

File installer APK standalone hasil build cloud EAS Expo dapat langsung diunduh dan dipasang:
- 🚀 **[Download File APK v1.0.4 Universal ~28.1 MB (Direct Download APK)](https://expo.dev/artifacts/eas/Gye7PcNGycHbh8xxLo_iGoBBZDjSPl6pN7w5Vgkj7tY.apk)**
- 🌐 **[Halaman Build EAS Expo (v1.0.4)](https://expo.dev/accounts/akhiimron/projects/bacalah/builds/9aa938cc-8864-4ed1-a6c7-56112a15158f)**

> 📱 **Kompatibilitas Sistem Operasi & Perangkat:**  
> - **Dual-Architecture Universal:** Mendukung **32-bit (`armeabi-v7a`)** dan **64-bit (`arm64-v8a`)**.  
> - **Didukung Penuh:** Tecno Spark (Android 13 / HiOS), Infinix, Xiaomi Redmi Note 14 (HyperOS / Android 14/15/16), Samsung, dan seluruh HP Android (Android 7.0+).  
>  
> 💡 **Tips Pemasangan (Sideload APK):**  
> 1. Jika di HP sudah ada versi BACALAH sebelumnya, **hapus/uninstall** terlebih dahulu versi lama agar tidak terjadi konflik signature.  
> 2. Jika muncul peringatan keamanan Google Play Protect, ketuk **"Detail" / "Rincian"** lalu pilih **"Tetap Pasang" (Install anyway)**.

---

## ✨ Fitur Utama

### 1. 🔤 Penguasaan Penuh 26 Huruf Alfabet (A sampai Z)
- Mencakup **seluruh 26 huruf alfabet**: 5 Vokal (A, I, U, E, O) dan 21 Konsonan (B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z).
- Dilengkapi audio fonik murni Bahasa Indonesia (`id-ID`, pitch 1.15 ramah anak) serta contoh kata asosiasi bergambar (A = Apel 🍎, B = Bola ⚽ ... Z = Zebra 🦓).
- Tombol **"Dengar Cici"** (kecepatan normal 0.85) dan **"Cici Pelan-Pelan"** (ultra-slow 0.6) untuk artikulasi fonem yang sangat jernih.

### 2. 📝 Dikte Cerdas Cici (Dengar Suara 🎧 lalu Ketik ⌨️)
- Menjembatani kemampuan auditori ke tulisan (*Auditory-to-Orthographic Mapping*).
- Anak mendengar bunyi huruf/suku kata/kata, lalu mengetikkannya pada papan tombol taktil.
- **Scaffolding Adaptif**:
  - **Mode Pemula 🐣**: Menampilkan 3–4 pilihan huruf gelembung acak dengan prioritas huruf mirip/tertukar (*confusable pairs* seperti B/D/P, M/N, U/V).
  - **Mode Mandiri 🦁**: Menampilkan papan tombol alfabet A–Z lengkap.
- **Gentle Feedback**:
  - Tidak ada suara buzzer "tetot" yang menakutkan.
  - Tombol bergoyang lembut (*wobble animation*) dengan suara *boop* lembut dan petunjuk ramah dari Cici.

### 3. 📊 Pelacak Huruf Lemah Dinamis di SQLite (`letter_accuracy_stats`)
- Database SQLite lokal mencatat statistik akurasi seluruh 26 huruf (benar, salah, streak, percobaan).
- **Algoritma Adaptif**: Huruf-huruf yang paling sering keliru dijawab oleh anak otomatis **lebih sering dimunculkan** dalam latihan harian dan permainan hingga tingkat akurasinya mencapai 100%.

### 4. ⌨️ BubbleKeyboard Taktil 3D Khusus Anak
- Tombol gelembung alfabet 3D membal dengan `borderBottomWidth: 4` dan efek kilau (*shine*).
- Dirancang khusus untuk jemari anak kecil tanpa menggunakan keyboard bawaan sistem operasi.

### 5. 🎤 Evaluasi Suara (Voice Challenge)
- Anak menirukan ucapan huruf atau kata dari Cici lewat mikrofon.
- Algoritma pencocokan kemiripan jarak lafal memberikan apresiasi 1–3 bintang ⭐.

### 6. 🎮 8 Mini Games Edukatif Menjangkau Seluruh Huruf A–Z
1. 🎈 **Tangkap Balon Huruf A–Z**: Cici menyebut bunyi huruf, anak memecahkan balon yang cocok.
2. 🎣 **Mancing Huruf & Kata**: Memancing huruf yang sesuai dengan suara yang diperdengarkan.
3. 🚂 **Kereta Kata Cici**: Menyusun gerbong suku kata menjadi kata yang tepat.
4. 🎤 **Tirukan Cici**: Tantangan bersuara menirukan lafal huruf/kata.
5. 🧩 **Teka-Teki Huruf Rumpang**: Mengisi huruf yang hilang pada kata bergambar.
6. 🏃 **Lompat Teratai Huruf**: Membantu Cici melompat ke teratai huruf yang tepat.
7. 🍕 **Potong Suku Kata**: Memotong kata menjadi suku kata dengan mengetuk celah bergunting.
8. 📦 **Kotak Pos Huruf**: Menjodohkan amplop huruf kecil ke kotak pos huruf kapital yang benar.

### 7. 📚 Kurikulum 6 Level Membaca Berjenjang
- **Level 1**: Pengenalan 26 Huruf Alfabet & Fonik (A–Z).
- **Level 2**: Suku Kata Terbuka 2 Huruf (BA, BI, BU, BE, BO, CA, CI...).
- **Level 3**: Gabung Kata 2 Suku Kata Terbuka (BUKU, BOLA, SAPU, KUDA, MEJA).
- **Level 4**: Suku Kata Tertutup (MAKAN, RUMAH, MOBIL, IKAN, GAJAH).
- **Level 5**: Diftong & Konsonan Rangkap (BUNGA, NYAMUK, KERBAU, PISANG).
- **Level 6**: Kalimat Pendek Bergambar & Pemahaman Cerita Interaktif.

---

## 🏛️ Arsitektur Kode (Clean Architecture)

Mengadopsi pola **Clean Architecture** yang terstruktur rapi:

```text
src/
├── core/
│   ├── sound/
│   │   ├── SoundService.ts          # TTS id-ID pitch 1.15, slow-rate & SFX lembut expo-audio
│   │   └── VoiceEvaluatorService.ts # Voice Challenge STT & pencocokan Levenshtein
│   ├── di/
│   │   └── container.ts             # Composition root / DI singleton
│   └── theme/
│       └── index.ts                 # Warna pastel ceria, raised 3D tactility, tipografi Nunito
├── domain/
│   ├── entities/
│   │   ├── AlphabetLetter.ts        # Entitas 26 huruf A-Z lengkap
│   │   ├── DictationExercise.ts     # Entitas dikte huruf, suku kata, kata, & kalimat
│   │   └── LetterAccuracyStats.ts   # Entitas statistik akurasi per huruf A-Z
│   ├── repositories/
│   │   └── ReadingRepository.ts     # Kontrak antarmuka repository
│   └── services/
│       ├── AlphabetMasteryEngine.ts # Logika pembobotan dinamis huruf lemah anak
│       └── DictationGenerator.ts    # Generator soal adaptif dengan pasangan distraktor mirip
├── data/
│   ├── content/
│   │   ├── alphabet.ts              # Data 26 huruf A-Z & kamus huruf tertukar (confusable pairs)
│   │   ├── curriculum.ts            # Data kurikulum Level 1-6 membaca Bahasa Indonesia
│   │   └── feedback.ts              # Umpan balik motivatif dan santun dari Cici
│   ├── database/
│   │   └── DatabaseService.ts       # SQLite lokal (WAL Mode + Migrasi Skema)
│   └── repositories/
│       └── SqliteReadingRepository.ts # Implementasi database SQLite offline
└── presentation/
    ├── navigation/
    │   └── BottomTabs.tsx           # 4 Tab: Belajar 📖, Dikte & Kuis 📝, Games 🎮, Profil 👤
    ├── screens/
    │   ├── belajar/BelajarScreen.tsx
    │   ├── dikte-kuis/DikteKuisScreen.tsx
    │   ├── games/GamesScreen.tsx
    │   └── profil/ProfilScreen.tsx   # Rapor Alfabet 26 Huruf & Prioritas Huruf Lemah
    ├── games/
    │   ├── tangkap-balon-huruf/
    │   ├── mancing-huruf/
    │   ├── kereta-kata/
    │   ├── tirukan-cici/
    │   ├── teka-teki-huruf/
    │   ├── lompat-teratai/
    │   ├── potong-suku-kata/
    │   ├── kotak-pos/
    │   ├── GameShell.tsx
    │   └── registry.ts
    ├── components/
    │   ├── play/
    │   │   ├── BubbleKeyboard.tsx    # Papan ketik gelembung taktil 3D khusus anak
    │   │   ├── DictationInputSlot.tsx# Slot huruf berkedip interaktif
    │   │   ├── AlphabetCard.tsx      # Kartu huruf besar bergambar & fonik
    │   │   ├── MascotCici.tsx        # Animasi maskot Cici (idle, talk, happy, hint)
    │   │   └── VoiceMicButton.tsx    # Tombol mikrofon latihan lafal
    │   └── common/
    │       ├── Celebration.tsx       # Konfeti bintang Reanimated + sparkle Lottie
    │       └── ui.tsx                # BigButton raised 3D, Stars, Header
    └── stores/
        └── useAppStore.ts            # State store terpusat (Zustand)
```

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 18+)
- [Git](https://git-scm.com/)
- Expo Go di HP atau Emulator Android / iOS

### Langkah Menjalankan:
```bash
# 1. Clone repositori
git clone https://github.com/imranpermadi/Bacalah.git
cd Bacalah

# 2. Pasang dependensi
npm install

# 3. Buat file efek suara (SFX) lokal jika diperlukan
npm run sfx

# 4. Jalankan Expo Development Server
npx expo start
```

Scan QR code yang tampil di terminal menggunakan aplikasi **Expo Go** pada HP Android Anda.

---

## 🛠️ Perintah Skrip yang Tersedia

- `npm run start`: Menjalankan Expo development server.
- `npm run typecheck`: Menjalankan verifikasi tipe TypeScript (`tsc --noEmit`).
- `npm run sfx`: Menghasilkan efek suara WAV prosedural (tap, pop, chime, clap, boop).
- `npx expo export`: Memvalidasi pembuatan bundle Hermes untuk produksi.

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE).
Dikembangkan dengan penuh dedikasi untuk pendidikan membaca anak-anak Indonesia. 🇮🇩✨

