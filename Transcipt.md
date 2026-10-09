# 📘 PRD & MASTER PROMPT: APLIKASI "BACALAH"
> **Aplikasi Cepat Membaca & Menulis Bahasa Indonesia (Penguasaan Menyeluruh Seluruh Huruf A–Z)**  
> *Sistem Fonik & Dengar-Ketik Multisensori untuk Seluruh 26 Huruf Alfabet*  
> *Arsitektur & Fondasi Teknologi: ( Expo, SQLite, Zustand, Reanimated)*

---

## 📑 BAGIAN 1: PRODUCT REQUIREMENT DOCUMENT (PRD)

### 1. INFORMASI & TUJUAN PRODUK
- **Nama Aplikasi**: BACALAH
- **Target Pengguna**: Anak usia 4–8 tahun (PAUD, TK, SD Kelas 1–2), dirancang inklusif termasuk untuk anak yang mengalami keterlambatan membaca atau kesulitan menghubungkan apa yang didengar dengan apa yang ditulis.
- **Tujuan Utama**: 
  - Membantu anak **menghafal, mengenali bunyi (fonik), membedakan bentuk visual, dan mampu mengetik/menuliskan SELURUH 26 HURUF (A sampai Z) tanpa terbalik atau tertukar**.
  - Menjembatani kesenjangan auditori-ke-tulisan (*Auditory-to-Orthographic Mapping*): Anak bisa langsung mengetikkan huruf atau kata yang diucapkan sistem secara tepat.
- **Maskot Utama**: **Cici si Kucing Putih Ceria** 🐱 (Pemandu belajar yang artikulatif, ekspresif, dan ramah).

---

### 2. TECH STACK (Identik 100% dengan Math Fun)
- **Framework**: Expo SDK (React Native 0.86+, TypeScript)
- **Navigasi**: `@react-navigation/native` & `@react-navigation/bottom-tabs` (Belajar 📖, Dikte & Kuis 📝, Games 🎮, Profil 👤)
- **State Management**: `zustand` (Profil anak, riwayat akurasi 26 huruf, bintang, level progress)
- **Database Lokal**: `expo-sqlite` (WAL Mode, skema migrasi tabel profil, progres belajar, dan skor akurasi per huruf A–Z)
- **Audio & Suara**:
  - **TTS Sistem**: `expo-speech` (`language: 'id-ID'`, pitch 1.15 ramah anak, kontrol ultra-slow rate 0.5x – 0.85x untuk pemisahan artikulasi fonem)
  - **SFX**: `expo-audio` (`AudioPlayer` untuk sfx tap, pop, chime, perayaan)
  - **Voice Challenge (STT)**: Evaluasi lafal suara anak
- **Animasi & Interaksi**: `react-native-reanimated`, `lottie-react-native`, `react-native-gesture-handler`
- **Papan Ketik Taktil**: `BubbleKeyboard` kustom (Tombol gelembung alfabet A–Z 3D taktil, membal, warna cerah, dirancang khusus untuk jemari anak)

---

### 3. FITUR UTAMA & PENGUASAAN MENYELURUH ALFABET A–Z

#### 3.1. Modul "Eksplorasi 26 Huruf Alfabet" (A sampai Z Lengkap) 🔤
- Mencakup **seluruh 26 huruf**: 5 Vokal (A, I, U, E, O) dan 21 Konsonan (B, C, D, F, G, H, J, K, L, M, N, P, Q, R, S, T, V, W, X, Y, Z).
- Setiap huruf memiliki:
  1. **Bunyi Fonik Asli**: Cici melafalkan bunyi huruf murni (bukan hanya nama huruf, tapi bunyi konsonan/vokalnya).
  2. **Visual Karakter & Kata Asosiasi**: Contoh gambar benda yang diawali huruf tersebut (A = Apel, B = Bola, C = Ceri, D = Daun ... Z = Zebra).
  3. **Visual Artikulasi Cici**: Animasi mulut Cici saat membunyikan huruf tersebut.

#### 3.2. Fitur "Dikte Cerdas Cici" (Dengar Suara 🎧 lalu Ketik ⌨️ untuk Seluruh Huruf & Kata)
- **Mekanisme Kerja**:
  1. Cici membacakan bunyi huruf, suku kata, atau kata secara jelas (contoh: bunyi huruf tunggal `/d/`, suku kata `BA`, atau kata `KUCING`).
  2. Layar menampilkan kotak slot input berkedip lucu.
  3. Anak mengetikkan huruf pada **BubbleKeyboard** (tombol gelembung huruf A–Z).
  4. Tombol pendukung:
     - **"Dengar Cici"**: Mengulang suara normal.
     - **"Cici Pelan-Pelan"**: Memperlambat suara fonem per fonem agar anak bisa membedakan setiap bunyi dengan jelas.
- **Sistem Bantuan Bertahap (Adaptive Scaffolding)**:
  - *Tahap 1 (Fokus Pembeda)*: Layar hanya memunculkan 3-4 gelembung huruf acak yang mengandung jawaban benar (agar anak pemula tidak bingung mencari di antara 26 huruf).
  - *Tahap 2 (Alfabet Lengkap)*: Tampil seluruh tombol A–Z bergaya BubbleKeyboard.

#### 3.3. Sistem Pelacak Huruf Lemah Dinamis (Universal Letter Tracker di SQLite) 📊
- Aplikasi **TIDAK mengunci hanya pada huruf tertentu**, melainkan memiliki algoritma cerdas yang memantau performa **seluruh huruf A sampai Z**:
  - Database mencatat setiap kali anak menekan tombol huruf untuk setiap soal:
    - Huruf yang berhasil dijawab benar.
    - Huruf yang sering salah ditekan (misal anak sering salah saat soal huruf B, D, P, M, N, U, V, dll.).
  - **Algoritma Adaptif**: Huruf-huruf yang memiliki tingkat kesalahan tertinggi pada profil anak tersebut akan otomatis **lebih sering dimunculkan** dalam latihan harian dan mini games sampai tingkat akurasi huruf tersebut mencapai 100%.

#### 3.4. Sistem Umpan Balik Positif & Anti-Frustrasi (Gentle Feedback)
- Tidak ada suara buzzer "tetot" yang menakutkan jika anak salah memilih huruf.
- Jika anak keliru menekan huruf:
  - Tombol huruf yang salah bergoyang lembut (*gentle wobble animation*).
  - Cici memberikan petunjuk ramah: *"Hampir tepat! Ayo dengar sekali lagi bersama Cici!"*.
  - Huruf yang benar menyala berkedip lembut (*visual hint*).

#### 3.5. 8+ Mini Games Edukatif Menjangkau Seluruh Huruf A–Z
1. 🎈 **Tangkap Balon Huruf A–Z**: Cici menyebut bunyi huruf, anak memecahkan balon huruf yang cocok.
2. 🎣 **Mancing Huruf & Kata**: Cici memancing huruf yang sesuai dengan suara yang diperdengarkan.
3. 🚂 **Kereta Kata Cici**: Menyusun gerbong suku kata dan huruf dari kata yang diucapkan.
4. 🎤 **Tirukan Cici (Voice Challenge)**: Anak mengucapkan huruf/kata ke mikrofon dan dinilai akurasinya.
5. 🧩 **Teka-Teki Huruf Rumpang**: Mengisi huruf yang hilang pada kata bergambar dari A sampai Z.
6. 🏃 **Lompat Teratai Huruf**: Bantu Cici melompati huruf yang benar untuk menyeberangi kolam.
7. 🍕 **Potong Suku Kata**: Memotong kata menjadi suku kata yang benar.
8. 📦 **Kotak Pos Huruf**: Menaruh surat huruf ke kotak pos alfabet yang tepat.

---

### 4. STRUKTUR ARSITEKTUR KODE
```text
src/
├── core/
│   ├── sound/
│   │   ├── SoundService.ts          // TTS Bahasa Indonesia (pitch ramah, ultra-slow phoneme rate)
│   │   └── VoiceEvaluatorService.ts // STT & evaluasi kemiripan pengucapan
│   ├── di/
│   │   └── container.ts
│   └── theme/
│       └── index.ts                 // Tema ceria, kontras tinggi, tombol 3D taktil
├── domain/
│   ├── entities/
│   │   ├── AlphabetLetter.ts        // Entitas 26 huruf A-Z (huruf, fonik, kata contoh, aset)
│   │   ├── DictationExercise.ts     // Soal dengar & ketik
│   │   └── LetterAccuracyStats.ts   // Statistik akurasi per huruf A-Z
│   ├── repositories/
│   │   └── ReadingRepository.ts
│   └── services/
│       ├── AlphabetMasteryEngine.ts // Logika kurikulum A-Z & pembobotan huruf lemah
│       └── DictationGenerator.ts    // Generator soal dengar & ketik dinamis
├── data/
│   ├── database/
│   │   └── DatabaseService.ts       // SQLite tabel profil, alphabet_accuracy (A-Z), quiz attempts
│   └── repositories/
│       └── SqliteReadingRepository.ts
└── presentation/
    ├── navigation/
    │   └── BottomTabs.tsx           // [Belajar 📖] [Dikte & Kuis 📝] [Games 🎮] [Profil 👤]
    ├── screens/
    │   ├── belajar/BelajarScreen.tsx      // Modul 26 Huruf Alfabet & Suku Kata
    │   ├── dikte-kuis/DikteKuisScreen.tsx // Arena Dengar & Ketik (Dictation) + Uji Pemahaman
    │   ├── games/GamesScreen.tsx          // 8+ Mini Games Edukatif A-Z
    │   └── profil/ProfilScreen.tsx        // Peta Penguasaan 26 Huruf (Rapor Alfabet Anak)
    ├── games/
    │   ├── tangkap-balon-huruf/
    │   ├── mancing-huruf/
    │   ├── kereta-kata/
    │   ├── tirukan-cici/
    │   └── registry.ts
    ├── components/
    │   ├── play/
    │   │   ├── BubbleKeyboard.tsx     // Papan ketik gelembung huruf A-Z taktil khusus anak
    │   │   ├── DictationInputSlot.tsx // Kotak input huruf interaktif berkedip
    │   │   ├── AlphabetCard.tsx       // Kartu huruf interaktif A-Z dengan audio fonik
    │   │   ├── MascotCici.tsx         // Maskot Cici beranimasi
    │   │   └── VoiceMicButton.tsx
    │   └── common/
    │       └── Celebration.tsx
    └── stores/
        └── useAppStore.ts
```