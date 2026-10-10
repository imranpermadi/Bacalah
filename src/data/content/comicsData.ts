/**
 * 20 Komik Suara Interaktif untuk Melatih Anak Membaca Percakapan
 * Alur: Anak membaca dialog Karakter A (via rekam suara / mic 🎙️)
 * Jika dinilai tepat, balon percakapan Karakter B otomatis terbuka dengan animasi & suara respons!
 */

export interface ComicCharacter {
  name: string;
  avatar: string;
  color: string;
}

export interface ComicPanel {
  panelNumber: number;
  setting: string;
  characterA: ComicCharacter;
  promptText: string; // Teks yang harus dibaca oleh anak
  characterB: ComicCharacter;
  replyText: string;  // Teks balasan yang baru terbuka setelah anak membaca
  audioReplyPrompt?: string;
}

export interface InteractiveComic {
  id: string;
  title: string;
  theme: string;
  coverEmoji: string;
  accentColor: string;
  panels: ComicPanel[];
}

export const INTERACTIVE_COMICS: InteractiveComic[] = [
  {
    id: 'komik-1',
    title: 'Cici dan Kiki di Kebun Wortel',
    theme: 'Persahabatan',
    coverEmoji: '🥕',
    accentColor: '#FB923C',
    panels: [
      {
        panelNumber: 1,
        setting: 'Kebun Wortel Segar',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Halo Kiki! Apa yang sedang kamu tanam di kebun hari ini?',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Halo Cici! Aku sedang menanam wortel oranye yang manis dan segar!',
      },
      {
        panelNumber: 2,
        setting: 'Di Bawah Pohon Rindang',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Wah seru sekali! Bolehkah aku membantumu menyiram tanamannya?',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Tentu saja boleh! Ini ember kecil untukmu, ayo kita siram bersama!',
      },
      {
        panelNumber: 3,
        setting: 'Waktu Istirahat',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Terima kasih Kiki! Bekerja sama membuat kebun jadi sangat indah.',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Sama-sama sahabatku Cici! Nanti sore kita petik wortel bersama ya!',
      },
    ],
  },
  {
    id: 'komik-2',
    title: 'Petualangan Bubu Beruang Mencari Madu',
    theme: 'Keberanian',
    coverEmoji: '🍯',
    accentColor: '#FBBF24',
    panels: [
      {
        panelNumber: 1,
        setting: 'Tepi Hutan Cemara',
        characterA: { name: 'Bubu Beruang', avatar: '🐻', color: '#854D0E' },
        promptText: 'Hai Cici! Apakah kamu melihat sarang lebah madu yang manis?',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Ada di atas dahan pohon beringin Bubu! Tapi kamu harus sopan ya!',
      },
      {
        panelNumber: 2,
        setting: 'Dekat Pohon Beringin',
        characterA: { name: 'Bubu Beruang', avatar: '🐻', color: '#854D0E' },
        promptText: 'Permisi Lebah Manis, bolehkah aku meminta sedikit madumu?',
        characterB: { name: 'Ratu Lebah', avatar: '🐝', color: '#EAB308' },
        replyText: 'Tentu Bubu! Karena kamu bertanya dengan sangat sopan, ini satu mangkuk madu!',
      },
    ],
  },
  {
    id: 'komik-3',
    title: 'Burung Pipit Belajar Bernyanyi',
    theme: 'Semangat Belajar',
    coverEmoji: '🎶',
    accentColor: '#38BDF8',
    panels: [
      {
        panelNumber: 1,
        setting: 'Dahan Pohon Apel',
        characterA: { name: 'Pipit Kecil', avatar: '🐦', color: '#0284C7' },
        promptText: 'Cici, suaraku masih serak saat mencoba bernyanyi lagu pagi.',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Jangan menyerah Pipit! Minumlah tetesan embun dan coba tarik napas dalam.',
      },
      {
        panelNumber: 2,
        setting: 'Pagi Hari Berembun',
        characterA: { name: 'Pipit Kecil', avatar: '🐦', color: '#0284C7' },
        promptText: 'Ciut-ciut cuit! Dengarkan, sekarang kicauanku sudah merdu!',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Hebat sekali Pipit! Suaramu terdengar sangat indah dan merdu!',
      },
    ],
  },
  {
    id: 'komik-4',
    title: 'Kura-Kura dan Kancil Lomba Jalan Santai',
    theme: 'Sportivitas',
    coverEmoji: '🐢',
    accentColor: '#4ADE80',
    panels: [
      {
        panelNumber: 1,
        setting: 'Jalan Setapak Padang Rumput',
        characterA: { name: 'Kancil Lincah', avatar: '🦌', color: '#EA580C' },
        promptText: 'Kura-kura, apakah kamu siap jalan santai mengelilingi danau?',
        characterB: { name: 'Kura-Kura Ruri', avatar: '🐢', color: '#16A34A' },
        replyText: 'Aku selalu siap Kancil! Yang penting kita jalan dengan gembira dan sehat!',
      },
      {
        panelNumber: 2,
        setting: 'Garis Akhir Danau',
        characterA: { name: 'Kancil Lincah', avatar: '🦌', color: '#EA580C' },
        promptText: 'Langkahmu sangat mantap Kura-kura! Ayo kita tos bersama!',
        characterB: { name: 'Kura-Kura Ruri', avatar: '🐢', color: '#16A34A' },
        replyText: 'Tos Kancil! Tubuh kita bugar dan kita berdua adalah juara!',
      },
    ],
  },
  {
    id: 'komik-5',
    title: 'Monyet Momo dan Buah Pisang Emas',
    theme: 'Kejujuran',
    coverEmoji: '🍌',
    accentColor: '#FACC15',
    panels: [
      {
        panelNumber: 1,
        setting: 'Pohon Pisang Raja',
        characterA: { name: 'Momo Monyet', avatar: '🐵', color: '#CA8A04' },
        promptText: 'Cici, lihat pisang ini! Apakah pisang ini milik Paman Gajah?',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Benar Momo! Kemarin Paman Gajah menanam pohon pisang ini di kebunnya.',
      },
      {
        panelNumber: 2,
        setting: 'Rumah Paman Gajah',
        characterA: { name: 'Momo Monyet', avatar: '🐵', color: '#CA8A04' },
        promptText: 'Paman Gajah, ini pisang matang yang jatuh dari kebun paman.',
        characterB: { name: 'Paman Gajah', avatar: '🐘', color: '#475569' },
        replyText: 'Terima kasih anak jujur! Ambil tiga buah untukmu dan Cici ya!',
      },
    ],
  },
  {
    id: 'komik-6',
    title: 'Kucing Cici Merapikan Buku Cerita',
    theme: 'Tanggung Jawab',
    coverEmoji: '📚',
    accentColor: '#818CF8',
    panels: [
      {
        panelNumber: 1,
        setting: 'Perpustakaan Mini',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Ibu, aku sudah selesai membaca buku dongeng tentang bintang.',
        characterB: { name: 'Ibu Kucing', avatar: '🧕', color: '#9333EA' },
        replyText: 'Anak pintar! Jangan lupa letakkan kembali di rak buku nomor satu ya.',
      },
      {
        panelNumber: 2,
        setting: 'Rak Buku Rapi',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Sudah beres Ibu! Semua buku sudah tersusun rapi dan bersih.',
        characterB: { name: 'Ibu Kucing', avatar: '🧕', color: '#9333EA' },
        replyText: 'Luar biasa Cici! Kamu anak yang rajin dan bertanggung jawab!',
      },
    ],
  },
  {
    id: 'komik-7',
    title: 'Anjing Doki Menemukan Sepatu Kancil',
    theme: 'Saling Menolong',
    coverEmoji: '👟',
    accentColor: '#34D399',
    panels: [
      {
        panelNumber: 1,
        setting: 'Taman Bermain',
        characterA: { name: 'Doki Anjing', avatar: '🐶', color: '#D97706' },
        promptText: 'Kancil! Apakah ini sepatu merahmu yang tertinggal di ayunan?',
        characterB: { name: 'Kancil Lincah', avatar: '🦌', color: '#EA580C' },
        replyText: 'Wah iya benar Doki! Dari tadi aku mencarinya ke mana-mana!',
      },
      {
        panelNumber: 2,
        setting: 'Bangku Taman',
        characterA: { name: 'Doki Anjing', avatar: '🐶', color: '#D97706' },
        promptText: 'Lain kali ingat masukkan ke dalam tas sebelum bermain ya kawan!',
        characterB: { name: 'Kancil Lincah', avatar: '🦌', color: '#EA580C' },
        replyText: 'Siap Doki! Terima kasih banyak sudah menjaganya untukku!',
      },
    ],
  },
  {
    id: 'komik-8',
    title: 'Panda Panpan Mengajak Minum Air Putih',
    theme: 'Kesehatan',
    coverEmoji: '💧',
    accentColor: '#60A5FA',
    panels: [
      {
        panelNumber: 1,
        setting: 'Lapangan Olahraga',
        characterA: { name: 'Panpan Panda', avatar: '🐼', color: '#1E293B' },
        promptText: 'Kiki, kamu tampak sangat haus setelah berlari lima putaran!',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Iya Panpan, tenggorokanku terasa sangat kering dan panas.',
      },
      {
        panelNumber: 2,
        setting: 'Pojok Minum',
        characterA: { name: 'Panpan Panda', avatar: '🐼', color: '#1E293B' },
        promptText: 'Ini botol air putih hangat untukmu. Minumlah secara perlahan.',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Segar sekali! Tubuhku langsung terasa berenergi dan bugar kembali!',
      },
    ],
  },
  {
    id: 'komik-9',
    title: 'Singa Simba Belajar Berkata Tolong',
    theme: 'Kesantunan',
    coverEmoji: '🦁',
    accentColor: '#F59E0B',
    panels: [
      {
        panelNumber: 1,
        setting: 'Hulu Sungai',
        characterA: { name: 'Simba Singa', avatar: '🦁', color: '#B45309' },
        promptText: 'Cici, bisakah kamu tolong ambilkan bola warnaku di seberang sana?',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Tentu saja Simba! Karena kamu meminta dengan kata tolong yang sopan.',
      },
      {
        panelNumber: 2,
        setting: 'Tepian Sungai',
        characterA: { name: 'Simba Singa', avatar: '🦁', color: '#B45309' },
        promptText: 'Terima kasih banyak Cici! Sekarang kita bisa bermain oper bola lagi.',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Sama-sama Simba! Kata tolong dan terima kasih adalah kunci persahabatan.',
      },
    ],
  },
  {
    id: 'komik-10',
    title: 'Bebek Boni Belajar Berenang Lurus',
    theme: 'Ketekunan',
    coverEmoji: '🦆',
    accentColor: '#2DD4BF',
    panels: [
      {
        panelNumber: 1,
        setting: 'Danau Bunga Teratai',
        characterA: { name: 'Boni Bebek', avatar: '🦆', color: '#0F766E' },
        promptText: 'Ibu, kakiku cepat lelah saat mendayung di antara bunga teratai.',
        characterB: { name: 'Ibu Bebek', avatar: '🦢', color: '#0369A1' },
        replyText: 'Gerakkan kakimu bergantian kiri dan kanan dengan rileks anakku.',
      },
      {
        panelNumber: 2,
        setting: 'Tengah Danau',
        characterA: { name: 'Boni Bebek', avatar: '🦆', color: '#0F766E' },
        promptText: 'Kwek kwek! Lihat Ibu, aku sekarang bisa berenang lurus dan cepat!',
        characterB: { name: 'Ibu Bebek', avatar: '🦢', color: '#0369A1' },
        replyText: 'Hebat Boni! Latihan tekun selalu membuat kita semakin mahir!',
      },
    ],
  },
  {
    id: 'komik-11',
    title: 'Cici dan Kucing Oren Membagi Ikan',
    theme: 'Keadilan & Berbagi',
    coverEmoji: '🐟',
    accentColor: '#FB923C',
    panels: [
      {
        panelNumber: 1,
        setting: 'Dapur Cici',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Oren, kita mendapat dua potong ikan bakar hangat yang lezat!',
        characterB: { name: 'Kucing Oren', avatar: '🐈', color: '#D97706' },
        replyText: 'Nyam! Satu potong untukmu dan satu potong untukku, adil bukan?',
      },
      {
        panelNumber: 2,
        setting: 'Meja Makan',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Sangat adil Oren! Selamat makan bersama sahabat terbaikku!',
        characterB: { name: 'Kucing Oren', avatar: '🐈', color: '#D97706' },
        replyText: 'Selamat makan Cici! Makanan terasa nikmat jika dimakan bersama!',
      },
    ],
  },
  {
    id: 'komik-12',
    title: 'Jerapah Juki Membantu Mengambil Layangan',
    theme: 'Tolong Menolong',
    coverEmoji: '🪁',
    accentColor: '#FDE047',
    panels: [
      {
        panelNumber: 1,
        setting: 'Lapangan Berangin',
        characterA: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        promptText: 'Paman Juki, layang-layangku tersangkut di dahan pohon yang tinggi!',
        characterB: { name: 'Juki Jerapah', avatar: '🦒', color: '#EAB308' },
        replyText: 'Tenang Kiki, leherku yang panjang bisa menjangkaunya dengan mudah!',
      },
      {
        panelNumber: 2,
        setting: 'Bawah Pohon',
        characterA: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        promptText: 'Hore! Layanganku selamat dan tidak robek sama sekali!',
        characterB: { name: 'Juki Jerapah', avatar: '🦒', color: '#EAB308' },
        replyText: 'Ini layanganmu Kiki. Sekarang terbangkan di tempat terbuka ya!',
      },
    ],
  },
  {
    id: 'komik-13',
    title: 'Kucing Cici Menanam Biji Tomat',
    theme: 'Cinta Lingkungan',
    coverEmoji: '🍅',
    accentColor: '#EF4444',
    panels: [
      {
        panelNumber: 1,
        setting: 'Pot Bunga Depan Rumah',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Ayah, apakah biji tomat kecil ini bisa tumbuh menjadi pohon besar?',
        characterB: { name: 'Ayah Kucing', avatar: '👨‍💼', color: '#1E293B' },
        replyText: 'Bisa Cici! Jika diberi tanah subur, sinar matahari, dan disiram teratur.',
      },
      {
        panelNumber: 2,
        setting: 'Tiga Minggu Kemudian',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Ayah lihat! Sudah muncul buah tomat kecil berwarna merah cerah!',
        characterB: { name: 'Ayah Kucing', avatar: '👨‍💼', color: '#1E293B' },
        replyText: 'Alhamdulillah! Buah manis dari kesabaranmu merawatnya setiap hari!',
      },
    ],
  },
  {
    id: 'komik-14',
    title: 'Tupai Tupi Menyimpan Kenari untuk Musim Dingin',
    theme: 'Hemat & Rencana Masa Depan',
    coverEmoji: '🌰',
    accentColor: '#B45309',
    panels: [
      {
        panelNumber: 1,
        setting: 'Hutan Pohon Kenari',
        characterA: { name: 'Tupi Tupai', avatar: '🐿️', color: '#78350F' },
        promptText: 'Cici, aku mengumpulkan sepuluh buah kenari untuk musim hujan nanti.',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Kamu sangat pintar Tupi! Menabung makanan membuatmu tidak kelaparan.',
      },
      {
        panelNumber: 2,
        setting: 'Rongga Pohon Tupi',
        characterA: { name: 'Tupi Tupai', avatar: '🐿️', color: '#78350F' },
        promptText: 'Aku juga menyisihkan dua buah untuk Kiki jika dia membutuhkan.',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Hatimu mulia Tupi! Selalu ingat teman adalah sifat anak hebat.',
      },
    ],
  },
  {
    id: 'komik-15',
    title: 'Kucing Cici Mengucapkan Maaf',
    theme: 'Memaafkan & Meminta Maaf',
    coverEmoji: '💐',
    accentColor: '#A855F7',
    panels: [
      {
        panelNumber: 1,
        setting: 'Halaman Rumah Kiki',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Kiki, maafkan aku ya, tadi tidak sengaja menjatuhkan pot bungamu.',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Tidak apa-apa Cici, aku tahu kamu tidak sengaja. Bunganya masih utuh kok!',
      },
      {
        panelNumber: 2,
        setting: 'Taman Bunga',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Ayo kita rapikan tanahnya dan masukkan kembali ke pot bunga.',
        characterB: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        replyText: 'Ayo Cici! Memaafkan dan memperbaiki bersama membuat hati tenang.',
      },
    ],
  },
  {
    id: 'komik-16',
    title: 'Katak Kiko Belajar Melompat Jauh',
    theme: 'Semangat Pantang Menyerah',
    coverEmoji: '🐸',
    accentColor: '#10B981',
    panels: [
      {
        panelNumber: 1,
        setting: 'Kolam Daun Teratai',
        characterA: { name: 'Kiko Katak', avatar: '🐸', color: '#047857' },
        promptText: 'Aku takut jatuh ke dalam air jika melompat ke teratai itu.',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Fokuskan pandanganmu, tekuk kakimu kuat-kuat, dan lompatlah Kiko!',
      },
      {
        panelNumber: 2,
        setting: 'Atas Daun Teratai',
        characterA: { name: 'Kiko Katak', avatar: '🐸', color: '#047857' },
        promptText: 'Hup! Yippie, aku berhasil mendarat tepat di tengah daun!',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Lompatan yang sempurna Kiko! Keberanian mengalahkan rasa takut!',
      },
    ],
  },
  {
    id: 'komik-17',
    title: 'Kucing Cici Mengingatkan Cuci Tangan',
    theme: 'Kebersihan Diri',
    coverEmoji: '🧼',
    accentColor: '#06B6D4',
    panels: [
      {
        panelNumber: 1,
        setting: 'Kran Air Bersih',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Boni, cucilah tanganmu dengan sabun sebelum mengambil roti itu!',
        characterB: { name: 'Boni Beruang', avatar: '🐻', color: '#854D0E' },
        replyText: 'Oh iya hampir lupa Cici! Tanganku baru saja kotor memegang tanah.',
      },
      {
        panelNumber: 2,
        setting: 'Meja Roti',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Bagus sekali Boni! Tangan bersih bebas dari kuman penyakit.',
        characterB: { name: 'Boni Beruang', avatar: '🐻', color: '#854D0E' },
        replyText: 'Sekarang roti madunya siap disantap dengan sehat dan lezat!',
      },
    ],
  },
  {
    id: 'komik-18',
    title: 'Burung Camar dan Pesan Surat Laut',
    theme: 'Menepati Janji',
    coverEmoji: '📜',
    accentColor: '#3B82F6',
    panels: [
      {
        panelNumber: 1,
        setting: 'Pantai Pasir Putih',
        characterA: { name: 'Camar Putih', avatar: '🕊️', color: '#2563EB' },
        promptText: 'Cici, aku membawakan surat undangan pesta kerang dari Paman Penyu!',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Terima kasih Camar! Kamu selalu tepat waktu menyampaikan kabar.',
      },
      {
        panelNumber: 2,
        setting: 'Dermaga Kayu',
        characterA: { name: 'Camar Putih', avatar: '🕊️', color: '#2563EB' },
        promptText: 'Menepati janji adalah tugasku sebagai pembawa kabar laut yang jujur.',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Kamu sahabat yang sangat bisa dipercaya Camar! Ayo kita ke pesta!',
      },
    ],
  },
  {
    id: 'komik-19',
    title: 'Kucing Cici dan Kacamata Nenek Kucing',
    theme: 'Menghormati Orang Tua',
    coverEmoji: '👓',
    accentColor: '#D946EF',
    panels: [
      {
        panelNumber: 1,
        setting: 'Ruang Tamu Nenek',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Nenek, ini kacamata baca Nenek yang tertinggal di atas meja rajut.',
        characterB: { name: 'Nenek Kucing', avatar: '👵', color: '#A21CAF' },
        replyText: 'Alhamdulillah cucuku yang baik! Mata Nenek sudah kabur mencarinya.',
      },
      {
        panelNumber: 2,
        setting: 'Sofa Nyaman',
        characterA: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        promptText: 'Sekarang Nenek bisa membaca Al-Quran dan koran dengan jelas kembali.',
        characterB: { name: 'Nenek Kucing', avatar: '👵', color: '#A21CAF' },
        replyText: 'Terima kasih sayang. Semoga Cici menjadi anak yang sholeh dan pintar.',
      },
    ],
  },
  {
    id: 'komik-20',
    title: 'Melihat Bintang Jatuh Bersama Sahabat',
    theme: 'Harapan & Kebahagiaan',
    coverEmoji: '🌠',
    accentColor: '#8B5CF6',
    panels: [
      {
        panelNumber: 1,
        setting: 'Bukit Bintang Malam Hari',
        characterA: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        promptText: 'Cici, lihat ke atas langit! Ada bintang jatuh meluncur cepat sekali!',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Subhanallah indahnya! Cahaya putih keemasan menghiasi langit gelap!',
      },
      {
        panelNumber: 2,
        setting: 'Puncak Bukit yang Hangat',
        characterA: { name: 'Kiki Kelinci', avatar: '🐰', color: '#EC4899' },
        promptText: 'Apa doa dan harapanmu malam ini wahai sahabat terbaikku?',
        characterB: { name: 'Cici Kucing', avatar: '🐱', color: '#F97316' },
        replyText: 'Aku berdoa agar kita selalu bersahabat dan giat belajar selamanya!',
      },
    ],
  },
];

