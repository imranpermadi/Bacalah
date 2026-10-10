/**
 * 20 Cerita Mendidik Anak Bergambar & Beranimasi Kartun
 * Melatih anak membaca kalimat panjang dengan nilai budi pekerti, kejujuran, dan persahabatan.
 */

export interface StoryPage {
  text: string;
  illustrationEmoji: string;
  characterMood: 'happy' | 'curious' | 'kind' | 'brave' | 'celebrate';
  highlightWords: string[];
}

export interface EducationalStory {
  id: string;
  title: string;
  category: string;
  moral: string;
  coverEmoji: string;
  themeColor: string;
  pages: StoryPage[];
}

export const EDUCATIONAL_STORIES: EducationalStory[] = [
  {
    id: 'cerita-1',
    title: 'Kancil dan Burung Pipit yang Jujur',
    category: 'Kejujuran',
    moral: 'Kejujuran selalu membawa kebaikan dan teman sejati.',
    coverEmoji: '🦌',
    themeColor: '#4ADE80',
    pages: [
      {
        text: 'Di sebuah hutan yang hijau dan sejuk, hiduplah seekor Kancil yang lincah dan Burung Pipit kecil yang ramah. Mereka sering bermain bersama di dekat pohon apel yang rindang.',
        illustrationEmoji: '🌳',
        characterMood: 'happy',
        highlightWords: ['hutan', 'kancil', 'burung', 'ramah'],
      },
      {
        text: 'Suatu sore, Kancil melihat buah mangga matang terjatuh di rumput. Kancil tahu bahwa mangga itu milik Kura-Kura yang sedang mencari makan di tepi sungai.',
        illustrationEmoji: '🥭',
        characterMood: 'curious',
        highlightWords: ['mangga', 'rumput', 'kura-kura', 'sungai'],
      },
      {
        text: 'Burung Pipit mengingatkan Kancil untuk tidak memakannya. "Kita harus mengembalikan mangga ini kepada Kura-Kura," kata Pipit dengan lembut dan tersenyum.',
        illustrationEmoji: '🐦',
        characterMood: 'kind',
        highlightWords: ['mengembalikan', 'lembut', 'tersenyum'],
      },
      {
        text: 'Kura-Kura sangat berterima kasih atas kejujuran mereka. Kura-Kura lalu memotong mangga manis itu untuk dinikmati bersama-sama dengan gembira.',
        illustrationEmoji: '🐢',
        characterMood: 'celebrate',
        highlightWords: ['kejujuran', 'manis', 'gembira', 'bersama'],
      },
    ],
  },
  {
    id: 'cerita-2',
    title: 'Kucing Cici Belajar Berbagi',
    category: 'Berbagi',
    moral: 'Berbagi makanan dan mainan membuat hati menjadi senang.',
    coverEmoji: '🐱',
    themeColor: '#FB923C',
    pages: [
      {
        text: 'Cici si anak kucing memiliki tiga potong kue ikan yang renyah. Cici mencium aroma kue itu dan merasa sangat lapar setelah seharian belajar membaca.',
        illustrationEmoji: '🐟',
        characterMood: 'happy',
        highlightWords: ['kucing', 'ikan', 'aroma', 'belajar'],
      },
      {
        text: 'Tiba-tiba, datanglah Kiki si kelinci yang kelelahan. Kiki belum makan siang karena wortel di kebunnya belum bisa dipanen hari ini.',
        illustrationEmoji: '🐰',
        characterMood: 'curious',
        highlightWords: ['kelinci', 'kelelahan', 'wortel', 'kebun'],
      },
      {
        text: 'Tanpa ragu, Cici membagi kuenya menjadi dua bagian. "Ini untukmu, Kiki. Ayo kita makan bersama di bawah pohon apel!" ajak Cici riang.',
        illustrationEmoji: '🍰',
        characterMood: 'kind',
        highlightWords: ['membagi', 'pohon', 'apel', 'riang'],
      },
      {
        text: 'Kiki sangat senang dan mengucapkan terima kasih. Berbagi ternyata membuat kue ikan terasa berkali-kali lipat lebih lezat dan hati Cici bahagia.',
        illustrationEmoji: '💖',
        characterMood: 'celebrate',
        highlightWords: ['senang', 'berbagi', 'lezat', 'bahagia'],
      },
    ],
  },
  {
    id: 'cerita-3',
    title: 'Semut Hitam yang Pantang Menyerah',
    category: 'Ketekunan',
    moral: 'Usaha yang dilakukan terus-menerus akan membuahkan hasil.',
    coverEmoji: '🐜',
    themeColor: '#FBBF24',
    pages: [
      {
        text: 'Soni adalah seekor semut hitam yang rajin. Setiap pagi, Soni menyapa teman-temannya lalu berjalan mencari remah roti untuk persediaan di sarang.',
        illustrationEmoji: '🍞',
        characterMood: 'happy',
        highlightWords: ['semut', 'rajin', 'roti', 'sarang'],
      },
      {
        text: 'Hari ini Soni menemukan sebutir gula batu yang cukup besar. Gula itu lebih besar dari tubuh Soni, namun Soni tidak berkecil hati.',
        illustrationEmoji: '🍬',
        characterMood: 'curious',
        highlightWords: ['gula', 'besar', 'tubuh'],
      },
      {
        text: 'Soni mencoba mendorongnya berkali-kali. Meski sempat tergelincir di atas batu licin, Soni bangkit kembali dan meminta bantuan kawan-kawannya.',
        illustrationEmoji: '💪',
        characterMood: 'brave',
        highlightWords: ['mendorong', 'bangkit', 'bantuan', 'kawan'],
      },
      {
        text: 'Dengan gotong royong dan pantang menyerah, gula batu itu berhasil dibawa ke dalam sarang. Semua semut merayakan keberhasilan dengan pesta manis.',
        illustrationEmoji: '🎉',
        characterMood: 'celebrate',
        highlightWords: ['gotong royong', 'berhasil', 'pesta'],
      },
    ],
  },
  {
    id: 'cerita-4',
    title: 'Gajah Boni dan Tikus Kecil Miko',
    category: 'Menghargai Sesama',
    moral: 'Ukuran tubuh tidak menentukan seberapa besar pertolongan kita.',
    coverEmoji: '🐘',
    themeColor: '#38BDF8',
    pages: [
      {
        text: 'Boni adalah anak gajah bertubuh besar dengan belalai yang kuat. Sedangkan Miko adalah anak tikus bertubuh mungil yang tinggal di celah rumput.',
        illustrationEmoji: '🐭',
        characterMood: 'happy',
        highlightWords: ['gajah', 'belalai', 'tikus', 'mungil'],
      },
      {
        text: 'Suatu hari, kaki Boni tertusuk duri tajam saat berjalan di semak-semak. Boni merasa kesakitan dan belalainya yang besar kesulitan mencabut duri itu.',
        illustrationEmoji: '🌵',
        characterMood: 'curious',
        highlightWords: ['kaki', 'duri', 'kesakitan', 'semak'],
      },
      {
        text: 'Miko melihat Boni yang menangis. Dengan jari-jarinya yang kecil dan gesit, Miko berhasil mencabut duri tersebut tanpa rasa sakit.',
        illustrationEmoji: '✨',
        characterMood: 'brave',
        highlightWords: ['menangis', 'gesit', 'mencabut', 'sakit'],
      },
      {
        text: 'Boni sangat bersyukur. Sejak hari itu, Boni dan Miko menjadi sahabat karib yang selalu saling menjaga di hutan luas.',
        illustrationEmoji: '🤝',
        characterMood: 'celebrate',
        highlightWords: ['bersyukur', 'sahabat', 'menjaga', 'hutan'],
      },
    ],
  },
  {
    id: 'cerita-5',
    title: 'Bintang Kecil yang Ingin Terang',
    category: 'Percaya Diri',
    moral: 'Setiap anak memiliki cahaya dan keunikan masing-masing.',
    coverEmoji: '⭐',
    themeColor: '#A78BFA',
    pages: [
      {
        text: 'Jauh di langit malam, ada sebuah bintang kecil bernama Tara. Tara merasa cahayanya tidak seterang bintang-bintang lain yang bersinar megah.',
        illustrationEmoji: '🌌',
        characterMood: 'curious',
        highlightWords: ['langit', 'bintang', 'cahaya', 'megah'],
      },
      {
        text: 'Bulan yang bijaksana menghampiri Tara dan berkata, "Tara, jangan bersedih. Cahayamu yang lembut justru menuntun anak-anak tidur dengan tenang."',
        illustrationEmoji: '🌙',
        characterMood: 'kind',
        highlightWords: ['bulan', 'bijaksana', 'lembut', 'tenang'],
      },
      {
        text: 'Tara melihat ke bumi. Di bawah sana, seorang anak kecil tersenyum melihat kedipan cahaya Tara dari jendela kamarnya yang hangat.',
        illustrationEmoji: '🏡',
        characterMood: 'happy',
        highlightWords: ['bumi', 'tersenyum', 'jendela', 'hangat'],
      },
      {
        text: 'Tara kini bangga dan percaya diri. Tara menyadari bahwa setiap ciptaan memiliki keindahan dan manfaat yang sangat berharga.',
        illustrationEmoji: '🌟',
        characterMood: 'celebrate',
        highlightWords: ['bangga', 'percaya diri', 'keindahan', 'berharga'],
      },
    ],
  },
  {
    id: 'cerita-6',
    title: 'Lumba-Lumba Penolong di Laut Biru',
    category: 'Tolong Menolong',
    moral: 'Siap menolong siapapun yang membutuhkan bantuan.',
    coverEmoji: '🐬',
    themeColor: '#06B6D4',
    pages: [
      {
        text: 'Domi si lumba-lumba berenang lincah di samudra biru. Domi suka melompat tinggi menyapa burung camar yang terbang di atas ombak.',
        illustrationEmoji: '🌊',
        characterMood: 'happy',
        highlightWords: ['lumba-lumba', 'samudra', 'melompat', 'ombak'],
      },
      {
        text: 'Tiba-tiba Domi mendengar suara meminta tolong. Ada seekor anak penyu yang tersangkut di antara jaring kayu lapuk.',
        illustrationEmoji: '🐢',
        characterMood: 'curious',
        highlightWords: ['tolong', 'penyu', 'tersangkut', 'jaring'],
      },
      {
        text: 'Dengan dorongan moncongnya yang kuat dan hati-hati, Domi melepaskan jaring tersebut hingga anak penyu bisa berenang bebas kembali.',
        illustrationEmoji: '🏊',
        characterMood: 'brave',
        highlightWords: ['dorongan', 'hati-hati', 'bebas', 'berenang'],
      },
      {
        text: 'Ibu penyu datang dan berterima kasih. Domi tersenyum gembira karena bisa menolong sahabat kecilnya dengan tulus.',
        illustrationEmoji: '💙',
        characterMood: 'celebrate',
        highlightWords: ['terima kasih', 'gembira', 'sahabat', 'tulus'],
      },
    ],
  },
  {
    id: 'cerita-7',
    title: 'Kupu-Kupu dan Bunga Matahari',
    category: 'Persahabatan',
    moral: 'Sahabat sejati selalu saling mendukung dan memberi semangat.',
    coverEmoji: '🦋',
    themeColor: '#F472B6',
    pages: [
      {
        text: 'Meli adalah kupu-kupu bersayap ungu yang anggun. Sahabat karibnya adalah Bunga Matahari kuning yang selalu mekar menghadap mentari.',
        illustrationEmoji: '🌻',
        characterMood: 'happy',
        highlightWords: ['kupu-kupu', 'sayap', 'matahari', 'mentari'],
      },
      {
        text: 'Saat hujan deras turun, angin bertiup kencang membuat sayap Meli basah kuyup. Meli kedinginan dan tidak bisa terbang pulang.',
        illustrationEmoji: '🌧️',
        characterMood: 'curious',
        highlightWords: ['hujan', 'angin', 'basah', 'kedinginan'],
      },
      {
        text: 'Bunga Matahari menundukkan kelopaknya yang lebar untuk memayungi Meli dari tetesan air hujan yang dingin.',
        illustrationEmoji: '☂️',
        characterMood: 'kind',
        highlightWords: ['menundukkan', 'kelopak', 'memayungi', 'dingin'],
      },
      {
        text: 'Saat pelangi muncul, Meli menari riang di atas bunga sebagai ucapan terima kasih atas persahabatan mereka yang indah.',
        illustrationEmoji: '🌈',
        characterMood: 'celebrate',
        highlightWords: ['pelangi', 'menari', 'indah', 'persahabatan'],
      },
    ],
  },
  {
    id: 'cerita-8',
    title: 'Anak Ayam yang Berani Membaca',
    category: 'Semangat Belajar',
    moral: 'Membaca membuka jendela ilmu dan petualangan baru.',
    coverEmoji: '🐥',
    themeColor: '#FDE047',
    pages: [
      {
        text: 'Ciko si anak ayam sangat suka melihat buku dongeng bergambar. Setiap petang, Ciko duduk di dekat induknya sambil mengeja huruf.',
        illustrationEmoji: '📖',
        characterMood: 'curious',
        highlightWords: ['ayam', 'buku', 'dongeng', 'mengeja'],
      },
      {
        text: 'Teman-temannya mengajak bermain kejar-kejaran, tapi Ciko bertekad menyelesaikan bacaan satu halaman penuh hari ini.',
        illustrationEmoji: '⏳',
        characterMood: 'brave',
        highlightWords: ['bermain', 'bertekad', 'halaman', 'bacaan'],
      },
      {
        text: 'Ciko mengeja kata demi kata dengan sabar. "B-U-K-U... Buku! P-O-H-O-N... Pohon!" seru Ciko penuh semangat.',
        illustrationEmoji: '💡',
        characterMood: 'happy',
        highlightWords: ['sabar', 'semangat', 'huruf', 'kata'],
      },
      {
        text: 'Ibu Ayam memeluk Ciko dengan bangga. Sekarang Ciko bisa membacakan cerita indah untuk adik-adiknya sebelum tidur.',
        illustrationEmoji: '🐣',
        characterMood: 'celebrate',
        highlightWords: ['memeluk', 'bangga', 'cerita', 'tidur'],
      },
    ],
  },
  {
    id: 'cerita-9',
    title: 'Pohon Mangga yang Ramah',
    category: 'Kebaikan Alam',
    moral: 'Menyayangi pepohonan membuat lingkungan kita sejuk dan asri.',
    coverEmoji: '🌳',
    themeColor: '#10B981',
    pages: [
      {
        text: 'Di halaman rumah Kiki, ada pohon mangga yang daunnya sangat lebat. Pohon itu menjadi tempat berteduh burung dan tupai kecil.',
        illustrationEmoji: '🐿️',
        characterMood: 'happy',
        highlightWords: ['halaman', 'mangga', 'lebat', 'berteduh'],
      },
      {
        text: 'Kiki selalu menyiram akar pohon itu setiap pagi dengan air bersih dan membersihkan daun-daun kering di sekitarnya.',
        illustrationEmoji: '🚿',
        characterMood: 'kind',
        highlightWords: ['menyiram', 'akar', 'bersih', 'kering'],
      },
      {
        text: 'Ketika musim panas tiba, pohon mangga memberikan naungan yang sejuk serta buah mangga yang harum dan manis untuk keluarga Kiki.',
        illustrationEmoji: '🥭',
        characterMood: 'curious',
        highlightWords: ['musim panas', 'naungan', 'harum', 'manis'],
      },
      {
        text: 'Alam selalu membalas kebaikan kita. Merawat satu pohon berarti menjaga kehidupan banyak makhluk hidup di bumi.',
        illustrationEmoji: '🌱',
        characterMood: 'celebrate',
        highlightWords: ['alam', 'kebaikan', 'merawat', 'kehidupan'],
      },
    ],
  },
  {
    id: 'cerita-10',
    title: 'Burung Hantu yang Menjaga Malam',
    category: 'Tanggung Jawab',
    moral: 'Menjalankan tugas dengan sungguh-sungguh membawa kedamaian.',
    coverEmoji: '🦉',
    themeColor: '#6366F1',
    pages: [
      {
        text: 'Bubu adalah burung hantu bermata bulat yang tajam. Saat semua hewan hutan tertidur pulas, Bubu mulai terbang berpatroli.',
        illustrationEmoji: '🌌',
        characterMood: 'curious',
        highlightWords: ['burung hantu', 'mata', 'tertidur', 'patroli'],
      },
      {
        text: 'Bubu memastikan tidak ada ranting jatuh yang membahayakan sarang kelinci dan memastikan aliran sungai tetap lancar.',
        illustrationEmoji: '🌿',
        characterMood: 'brave',
        highlightWords: ['memastikan', 'ranting', 'sarang', 'sungai'],
      },
      {
        text: 'Suatu malam, Bubu membantu anak rusa yang tersesat kembali ke pelukan induknya dengan panduan suara kepakan sayapnya.',
        illustrationEmoji: '🦌',
        characterMood: 'kind',
        highlightWords: ['membantu', 'rusa', 'tersesat', 'sayap'],
      },
      {
        text: 'Pagi menjelang, Bubu beristirahat dengan damai. Semua hewan hutan berterima kasih atas penjagaan Bubu yang setia.',
        illustrationEmoji: '🌅',
        characterMood: 'celebrate',
        highlightWords: ['istirahat', 'damai', 'setia', 'terima kasih'],
      },
    ],
  },
  {
    id: 'cerita-11',
    title: 'Kancil dan Jembatan Pelangi',
    category: 'Kreativitas',
    moral: 'Berpikir tenang dan kreatif dapat mengatasi segala rintangan.',
    coverEmoji: '🌈',
    themeColor: '#EC4899',
    pages: [
      {
        text: 'Kancil ingin menyeberang sungai berarus deras untuk memetik buah beri manis di bukit seberang.',
        illustrationEmoji: '🌊',
        characterMood: 'curious',
        highlightWords: ['sungai', 'arus', 'buah', 'bukit'],
      },
      {
        text: 'Jembatan kayu tua telah rusak terbawa air hujan kemarin malam. Kancil duduk tenang di bawah pohon untuk memikirkan jalan keluar.',
        illustrationEmoji: '🪵',
        characterMood: 'kind',
        highlightWords: ['jembatan', 'rusak', 'tenang', 'jalan keluar'],
      },
      {
        text: 'Kancil mengajak kawan-kawan berang-berang menyusun batang bambu kokoh membentuk jembatan baru yang dihiasi bunga warna-warni.',
        illustrationEmoji: '🦫',
        characterMood: 'brave',
        highlightWords: ['berang-berang', 'bambu', 'kokoh', 'bunga'],
      },
      {
        text: 'Jembatan itu tampak indah seperti pelangi. Sekarang semua hewan hutan bisa menyeberang sungai dengan aman dan nyaman.',
        illustrationEmoji: '🎉',
        characterMood: 'celebrate',
        highlightWords: ['pelangi', 'aman', 'nyaman', 'indah'],
      },
    ],
  },
  {
    id: 'cerita-12',
    title: 'Panda Panpan yang Suka Merapikan Mainan',
    category: 'Kerapian',
    moral: 'Menjaga kebersihan kamar membuat tidur nyenyak dan hati ceria.',
    coverEmoji: '🐼',
    themeColor: '#14B8A6',
    pages: [
      {
        text: 'Panpan si anak panda gemar menggambar dan bermain balok warna-warni di ruang tengah rumahnya.',
        illustrationEmoji: '🎨',
        characterMood: 'happy',
        highlightWords: ['panda', 'gambar', 'balok', 'rumah'],
      },
      {
        text: 'Setelah bermain, Panpan selalu mengembalikan krayon ke kotaknya dan menyusun buku cerita di rak kayu secara rapi.',
        illustrationEmoji: '📦',
        characterMood: 'kind',
        highlightWords: ['krayon', 'kotak', 'menyusun', 'rapi'],
      },
      {
        text: 'Ibu Panda tersenyum manis melihat ruangan yang bersih tanpa mainan berserakan di lantai.',
        illustrationEmoji: '✨',
        characterMood: 'curious',
        highlightWords: ['senyum', 'bersih', 'lantai'],
      },
      {
        text: 'Panpan merasa nyaman di kamarnya yang harum. Membiasakan hidup rapi sejak kecil adalah tanda anak mandiri dan hebat.',
        illustrationEmoji: '🏆',
        characterMood: 'celebrate',
        highlightWords: ['nyaman', 'harum', 'mandiri', 'hebat'],
      },
    ],
  },
  {
    id: 'cerita-13',
    title: 'Kancil Menjaga Kejujuran di Pasar Hutan',
    category: 'Kejujuran',
    moral: 'Barang temuan yang bukan milik kita harus segera dikembalikan.',
    coverEmoji: '👛',
    themeColor: '#EAB308',
    pages: [
      {
        text: 'Kancil sedang berjalan-jalan di pasar buah hutan yang ramai. Banyak pedagang buah menjajakan pisang, apel, dan madu segar.',
        illustrationEmoji: '🍌',
        characterMood: 'happy',
        highlightWords: ['pasar', 'buah', 'pisang', 'madu'],
      },
      {
        text: 'Di dekat bangku kayu, Kancil melihat sebuah dompet kain rajut berisi kancing emas terjatuh di tanah.',
        illustrationEmoji: '🪙',
        characterMood: 'curious',
        highlightWords: ['bangku', 'dompet', 'emas', 'tanah'],
      },
      {
        text: 'Kancil langsung membawa dompet itu ke pos penjaga Beruang dan mengumumkannya ke seluruh penjuru pasar.',
        illustrationEmoji: '🐻',
        characterMood: 'brave',
        highlightWords: ['penjaga', 'beruang', 'mengumumkan'],
      },
      {
        text: 'Pemilik dompet yaitu Nenek Rubah terharu dan memberi Kancil sekeranjang apel manis sebagai tanda terima kasih.',
        illustrationEmoji: '🍎',
        characterMood: 'celebrate',
        highlightWords: ['terharu', 'apel', 'manis', 'terima kasih'],
      },
    ],
  },
  {
    id: 'cerita-14',
    title: 'Lebah Madu Loli yang Rajin Bekerja',
    category: 'Kerja Keras',
    moral: 'Kerja keras dan kerja sama menghasilkan madu yang paling manis.',
    coverEmoji: '🐝',
    themeColor: '#F59E0B',
    pages: [
      {
        text: 'Loli adalah lebah madu mungil yang bangun sebelum matahari terbit. Sayapnya berdengung lembut di antara kelopak bunga melati.',
        illustrationEmoji: '🌸',
        characterMood: 'happy',
        highlightWords: ['lebah', 'madu', 'sayap', 'melati'],
      },
      {
        text: 'Loli mengumpulkan nektar sari bunga setetes demi setetes dengan penuh ketelitian dan kesabaran.',
        illustrationEmoji: '🍯',
        characterMood: 'curious',
        highlightWords: ['nektar', 'sari bunga', 'teliti', 'sabar'],
      },
      {
        text: 'Bersama ratusan kawanan lebah lainnya, Loli membawa nektar itu kembali ke sarang heksagonal yang rapi.',
        illustrationEmoji: '🏰',
        characterMood: 'kind',
        highlightWords: ['kawanan', 'sarang', 'rapi'],
      },
      {
        text: 'Madu murni yang manis kini melimpah ruah. Kerja keras bersama selalu menghasilkan sesuatu yang bermanfaat bagi banyak orang.',
        illustrationEmoji: '✨',
        characterMood: 'celebrate',
        highlightWords: ['madu', 'murni', 'manis', 'bermanfaat'],
      },
    ],
  },
  {
    id: 'cerita-15',
    title: 'Anak Kancil dan Burung Pipit Menanam Benih',
    category: 'Menyayangi Tumbuhan',
    moral: 'Satu benih pohon yang ditanam hari ini menjadi keteduhan masa depan.',
    coverEmoji: '🌱',
    themeColor: '#22C55E',
    pages: [
      {
        text: 'Kancil dan Pipit menemukan segenggam biji bunga matahari di tepi jalan setapak pegunungan.',
        illustrationEmoji: '🌻',
        characterMood: 'happy',
        highlightWords: ['biji', 'bunga', 'matahari', 'gunung'],
      },
      {
        text: 'Mereka membuat lubang kecil di tanah gembur, memasukkan benih, lalu menutupnya dengan tanah subur.',
        illustrationEmoji: '🪴',
        characterMood: 'kind',
        highlightWords: ['lubang', 'tanah', 'benih', 'subur'],
      },
      {
        text: 'Setiap sore, Pipit membawakan tetesan air embun untuk membasahi tanah agar tunas hijau segera tumbuh.',
        illustrationEmoji: '💧',
        characterMood: 'curious',
        highlightWords: ['embun', 'tunas', 'hijau', 'tumbuh'],
      },
      {
        text: 'Dua minggu kemudian, bunga-bunga kuning cerah bermekaran menghiasi lereng bukit dengan semerbak wangi.',
        illustrationEmoji: '🌼',
        characterMood: 'celebrate',
        highlightWords: ['bermekaran', 'kuning', 'bukit', 'wangi'],
      },
    ],
  },
  {
    id: 'cerita-16',
    title: 'Kucing Cici Menggosok Gigi Sebelum Tidur',
    category: 'Kesehatan Diri',
    moral: 'Gigi yang bersih dan sehat membuat senyuman kita selalu ceria.',
    coverEmoji: '🪥',
    themeColor: '#3B82F6',
    pages: [
      {
        text: 'Malam telah tiba dan jam dinding berdentang sembilan kali. Cici bersiap-siap menuju kamar tidur dengan piyama lucunya.',
        illustrationEmoji: '⏰',
        characterMood: 'happy',
        highlightWords: ['malam', 'jam', 'piyama', 'lucu'],
      },
      {
        text: 'Namun Cici ingat pesan Ibu: jangan pernah tidur sebelum menggosok gigi dari sisa makanan manis!',
        illustrationEmoji: '🥛',
        characterMood: 'curious',
        highlightWords: ['pesan', 'ibu', 'menggosok', 'gigi'],
      },
      {
        text: 'Cici mengambil sikat gigi dan pasta beraroma stroberi segar, lalu menyikat giginya memutar atas dan bawah hingga bersih.',
        illustrationEmoji: '🍓',
        characterMood: 'kind',
        highlightWords: ['sikat gigi', 'pasta', 'stroberi', 'bersih'],
      },
      {
        text: 'Gigi Cici kini berkilau putih dan napasnya segar. Cici tidur pulas ditemani mimpi indah tentang bintang-bintang di langit.',
        illustrationEmoji: '✨',
        characterMood: 'celebrate',
        highlightWords: ['berkilau', 'putih', 'segar', 'mimpi'],
      },
    ],
  },
  {
    id: 'cerita-17',
    title: 'Burung Pipit Belajar Terbang Tinggi',
    category: 'Keberanian',
    moral: 'Rasa takut bisa dikalahkan jika kita berani mencoba perlahan-lahan.',
    coverEmoji: '🦅',
    themeColor: '#8B5CF6',
    pages: [
      {
        text: 'Pipit kecil berdiri di tepi dahan pohon oak yang tinggi. Angin bertiup lembut menggoyangkan dedaunan hijau di sekitarnya.',
        illustrationEmoji: '🍃',
        characterMood: 'curious',
        highlightWords: ['dahan', 'pohon', 'angin', 'dedaunan'],
      },
      {
        text: 'Pipit merasa takut ketinggian. Pipit melihat ke bawah dan mencengkeram ranting erat-erat dengan cakarnya.',
        illustrationEmoji: '😨',
        characterMood: 'brave',
        highlightWords: ['takut', 'tinggi', 'ranting', 'cakar'],
      },
      {
        text: 'Induk Pipit berkata dengan lembut, "Buka sayapmu, rasakan semilir angin, dan percayalah pada kemampuanmu sendiri."',
        illustrationEmoji: '🕊️',
        characterMood: 'kind',
        highlightWords: ['buka', 'sayap', 'percaya', 'kemampuan'],
      },
      {
        text: 'Pipit mengepakkan sayapnya dan melayang di udara! Pipit bersorak gembira menikmati pemandangan hutan dari angkasa.',
        illustrationEmoji: '☁️',
        characterMood: 'celebrate',
        highlightWords: ['mengepakkan', 'melayang', 'gembira', 'angkasa'],
      },
    ],
  },
  {
    id: 'cerita-18',
    title: 'Ikan Mas Koki dan Mutiara Kejujuran',
    category: 'Kejujuran',
    moral: 'Kebenaran adalah harta paling berharga di dunia ini.',
    coverEmoji: '🐠',
    themeColor: '#F97316',
    pages: [
      {
        text: 'Kiko si ikan mas koki berenang ceria di dasar danau berair bening. Sisiknya berkilau keemasan diterpa sinar mentari pagi.',
        illustrationEmoji: '☀️',
        characterMood: 'happy',
        highlightWords: ['ikan', 'danau', 'bening', 'sisik'],
      },
      {
        text: 'Di sela-sela terumbu karang, Kiko melihat sebutir mutiara putih yang berkilau sangat indah.',
        illustrationEmoji: '🦪',
        characterMood: 'curious',
        highlightWords: ['terumbu', 'karang', 'mutiara', 'indah'],
      },
      {
        text: 'Kiko ingat bahwa Nenek Kerang baru saja kehilangan mutiaranya kemarin lusa. Kiko bergegas mengantarkannya ke gua Nenek Kerang.',
        illustrationEmoji: '👵',
        characterMood: 'kind',
        highlightWords: ['kerang', 'kehilangan', 'mengantarkan', 'gua'],
      },
      {
        text: 'Nenek Kerang menangis haru dan mendoakan Kiko menjadi ikan paling bahagia. Kebaikan Kiko dikenang oleh seluruh penghuni danau.',
        illustrationEmoji: '💎',
        characterMood: 'celebrate',
        highlightWords: ['menangis', 'bahagia', 'kebaikan', 'danau'],
      },
    ],
  },
  {
    id: 'cerita-19',
    title: 'Kancil Bergotong Royong Membersihkan Sungai',
    category: 'Peduli Lingkungan',
    moral: 'Sungai yang bersih adalah sumber kesehatan bagi semua makhluk hidup.',
    coverEmoji: '🌊',
    themeColor: '#0EA5E9',
    pages: [
      {
        text: 'Musim hujan hampir tiba, namun aliran sungai hutan tersumbat tumpukan ranting patah dan sampah daun kering.',
        illustrationEmoji: '🍂',
        characterMood: 'curious',
        highlightWords: ['sungai', 'tersumbat', 'ranting', 'sampah'],
      },
      {
        text: 'Kancil mengajak seluruh penghuni hutan untuk bekerja bakti bersama di tepi sungai pada hari Minggu pagi.',
        illustrationEmoji: '📢',
        characterMood: 'brave',
        highlightWords: ['penghuni', 'hutan', 'bekerja bakti', 'minggu'],
      },
      {
        text: 'Gajah mengangkat batang pohon besar, Kancil memungut daun, dan bebek berenang membersihkan lumut tebal di pinggiran.',
        illustrationEmoji: '🦆',
        characterMood: 'kind',
        highlightWords: ['batang pohon', 'memungut', 'bebek', 'lumut'],
      },
      {
        text: 'Air sungai kini mengalir jernih dan segar kembali. Semua ikan melompat gembira menyambut sungai yang sehat dan indah.',
        illustrationEmoji: '💦',
        characterMood: 'celebrate',
        highlightWords: ['mengalir', 'jernih', 'segar', 'sehat'],
      },
    ],
  },
  {
    id: 'cerita-20',
    title: 'Pesta Ulang Tahun Cici di Taman Bunga',
    category: 'Rasa Syukur',
    moral: 'Merayakan hari bahagia bersama sahabat penuh rasa syukur dan cinta.',
    coverEmoji: '🎂',
    themeColor: '#A855F7',
    pages: [
      {
        text: 'Hari ini adalah hari ulang tahun Cici yang keenam! Cici bangun pagi-pagi dengan senyum cerah dan hati berdebar gembira.',
        illustrationEmoji: '🎈',
        characterMood: 'happy',
        highlightWords: ['ulang tahun', 'senyum', 'gembira', 'pagi'],
      },
      {
        text: 'Di taman bunga, teman-teman Cici sudah menyiapkan kejutan manis: balon warna-warni dan kue stroberi bertingkat dua.',
        illustrationEmoji: '🍰',
        characterMood: 'curious',
        highlightWords: ['taman', 'kejutan', 'balon', 'stroberi'],
      },
      {
        text: 'Kiki memberikan topi pesta, Bubu membawakan buku cerita baru, dan Pipit menyanyikan lagu riang yang merdu.',
        illustrationEmoji: '🎶',
        characterMood: 'kind',
        highlightWords: ['topi', 'buku', 'lagu', 'merdu'],
      },
      {
        text: 'Cici meniup lilin sambil mengucap syukur kepada Tuhan atas keluarga yang menyayangi dan sahabat yang setia.',
        illustrationEmoji: '🎊',
        characterMood: 'celebrate',
        highlightWords: ['lilin', 'syukur', 'keluarga', 'sahabat'],
      },
    ],
  },
];

