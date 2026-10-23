export interface Reciter {
  id: string;
  nameFrench: string;
  nameArabic: string;
  title: string;
  mosqueOrStyle: string;
  badge?: string;
  serverUrl: string;
  imageUrl: string;
  everyAyahFolder: string;
  origin: string;
  biography?: string;
}

export const QURAN_RECITERS: Reciter[] = [
  {
    id: 'alafasy',
    nameFrench: 'Cheikh Mishary Rashid Al-Afasy',
    nameArabic: 'مشاري بن راشد العفاسي',
    title: 'Grand Récitateur International',
    mosqueOrStyle: 'Koweït · Voix mélodieuse & claire (Hafs)',
    badge: 'Populaire',
    serverUrl: 'https://server8.mp3quran.net/afs/',
    imageUrl: '/assets/reciters/alafasy.jpg',
    everyAyahFolder: 'Alafasy_128kbps',
    origin: 'Koweït',
    biography: 'Diplômé de l\'Université Islamique de Médine (Faculté du Saint Coran), réputé pour sa voix limpide et son tajwîd exemplaire.',
  },
  {
    id: 'sudais',
    nameFrench: 'Cheikh Abdul Rahman Al-Sudais',
    nameArabic: 'عبدالرحمن السديس',
    title: 'Chef des Imams de la Grande Mosquée de La Mecque',
    mosqueOrStyle: 'Masjid Al-Haram · La Mecque (Hafs)',
    badge: 'Imam La Mecque',
    serverUrl: 'https://server11.mp3quran.net/sds/',
    imageUrl: '/assets/reciters/sudais.jpg',
    everyAyahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
    origin: 'La Mecque, Arabie Saoudite',
    biography: 'Imam et prédicateur en chef du sanctuaire sacré de La Mecque depuis plus de 40 ans, voix emblématique du Hajj.',
  },
  {
    id: 'muaiqly',
    nameFrench: 'Cheikh Maher Al-Muaiqly',
    nameArabic: 'ماهر المعيقلي',
    title: 'Imam de la Grande Mosquée',
    mosqueOrStyle: 'Masjid Al-Haram · La Mecque',
    badge: 'Imam La Mecque',
    serverUrl: 'https://server12.mp3quran.net/maher/',
    imageUrl: '/assets/reciters/muaiqly.jpg',
    everyAyahFolder: 'Maher_AlMuaiqly_64kbps',
    origin: 'Médine & La Mecque',
    biography: 'Imam réputé de la Kaaba et orateur du sermon d\'Arafat, sa récitation vibrante et posée touche des millions de pèlerins.',
  },
  {
    id: 'basit',
    nameFrench: 'Cheikh Abdul Basit Abdul Samad',
    nameArabic: 'عبد الباسط عبد الصمد',
    title: 'La Voix d\'Or de l\'Islam',
    mosqueOrStyle: 'Le Caire · Égypte (Tartil de Référence)',
    badge: 'Légende',
    serverUrl: 'https://server7.mp3quran.net/basit/',
    imageUrl: '/assets/reciters/basit.jpg',
    everyAyahFolder: 'Abdul_Basit_Murattal_192kbps',
    origin: 'Le Caire, Égypte',
    biography: 'Considéré comme l\'un des plus illustres récitateurs de tous les temps, surnommé « La Voix d\'Or » et « La Voix de La Mecque ».',
  },
  {
    id: 'husary',
    nameFrench: 'Cheikh Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    title: 'Cheikh des Récitateurs d\'Égypte',
    mosqueOrStyle: 'Tartil académique & Tajwîd parfait',
    badge: 'Tartil Pur',
    serverUrl: 'https://server13.mp3quran.net/husr/',
    imageUrl: '/assets/reciters/husary.jpg',
    everyAyahFolder: 'Husary_128kbps',
    origin: 'Égypte',
    biography: 'Pionnier de l\'enregistrement mondial du Coran, maître incontesté des règles de Tajwîd et doyen des maîtres coraniques.',
  },
  {
    id: 'minshawi',
    nameFrench: 'Cheikh Mohamed Siddiq Al-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    title: 'La Voix Émouvante & Pleurante',
    mosqueOrStyle: 'Récitation pieuse, spirituelle et poignante',
    badge: 'Spirituel',
    serverUrl: 'https://server10.mp3quran.net/minsh/',
    imageUrl: '/assets/reciters/minshawi.jpg',
    everyAyahFolder: 'Minshawy_Murattal_128kbps',
    origin: 'Sohag, Égypte',
    biography: 'Surnommé « La Voix Sanglotante » pour l\'émotion et la dévotion inégalées qui émanent de ses récitations.',
  },
  {
    id: 'dossari',
    nameFrench: 'Cheikh Yasser Al-Dossari',
    nameArabic: 'ياسر الدوسري',
    title: 'Imam de la Grande Mosquée',
    mosqueOrStyle: 'Masjid Al-Haram · La Mecque',
    badge: 'Imam La Mecque',
    serverUrl: 'https://server11.mp3quran.net/yasser/',
    imageUrl: '/assets/reciters/dossari.jpg',
    everyAyahFolder: 'Yasser_Ad-Dussary_128kbps',
    origin: 'Riyadh & La Mecque',
    biography: 'Docteur en jurisprudence islamique et imam de la Grande Mosquée, sa récitation fervente captive les fidèles du monde entier.',
  },
  {
    id: 'shuraim',
    nameFrench: 'Cheikh Saud Al-Shuraim',
    nameArabic: 'سعود الشريم',
    title: 'Doyen des Imams de la Kaaba',
    mosqueOrStyle: 'Masjid Al-Haram · La Mecque',
    badge: 'Empreinte Haram',
    serverUrl: 'https://server7.mp3quran.net/shur/',
    imageUrl: '/assets/reciters/shuraim.jpg',
    everyAyahFolder: 'Saood_ash-Shuraym_128kbps',
    origin: 'La Mecque, Arabie Saoudite',
    biography: 'Ancien doyen et imam émérite de la Kaaba pendant plus de trois décennies, auteur et poète islamique.',
  },
  {
    id: 'ghamidi',
    nameFrench: 'Cheikh Saad Al-Ghamdi',
    nameArabic: 'سعد الغامدي',
    title: 'Récitateur Émérite',
    mosqueOrStyle: 'Dammam · Arabie Saoudite',
    badge: 'Mélodieux',
    serverUrl: 'https://server7.mp3quran.net/s_gmd/',
    imageUrl: '/assets/reciters/ghamidi.jpg',
    everyAyahFolder: 'Ghamadi_40kbps',
    origin: 'Dammam, Arabie Saoudite',
    biography: 'Diplômé en sciences de la Charia, il a marqué les esprits par sa récitation harmonieuse et apaisante.',
  },
  {
    id: 'shatri',
    nameFrench: 'Cheikh Abu Bakr Al-Shatri',
    nameArabic: 'أبو بكر الشاطري',
    title: 'Imam à Djeddah',
    mosqueOrStyle: 'Djeddah · Style doux et méditatif',
    badge: 'Doux & Paisible',
    serverUrl: 'https://server11.mp3quran.net/shatri/',
    imageUrl: '/assets/reciters/shatri.jpg',
    everyAyahFolder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    origin: 'Djeddah, Arabie Saoudite',
    biography: 'Imam à la mosquée Al-Furqan de Djeddah, célèbre pour son intonation douce, fluide et posée.',
  },
  {
    id: 'ajamy',
    nameFrench: 'Cheikh Ahmed Al-Ajamy',
    nameArabic: 'أحمد بن علي العجمي',
    title: 'Récitateur Célèbre de Khobar',
    mosqueOrStyle: 'Al-Khobar · Arabie Saoudite',
    badge: 'Émotionnel',
    serverUrl: 'https://server10.mp3quran.net/ajm/',
    imageUrl: '/assets/reciters/ajamy.jpg',
    everyAyahFolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
    origin: 'Al-Khobar, Arabie Saoudite',
    biography: 'Titulaire d\'un doctorat en interprétation coranique, voix puissante et émouvante adorée des fidèles.',
  },
];

export interface SurahMeta {
  number: number;
  nameArabic: string;
  namePhonetic: string;
  nameFrench: string;
  versesCount: number;
  revelationPlace: 'Mecquoise' | 'Médinoise';
  startPage: number;
}

export const SURAH_START_PAGES: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603,
  111: 603, 112: 604, 113: 604, 114: 604,
};

export const JUZ_DATA: { juz: number; startPage: number; nameArabic: string; nameFrench: string }[] = [
  { juz: 1, startPage: 1, nameArabic: 'الجزء الأول', nameFrench: 'Juz 1 (Al-Fatiha - Al-Baqarah 141)' },
  { juz: 2, startPage: 22, nameArabic: 'سَيَقُولُ', nameFrench: 'Juz 2 (Al-Baqarah 142 - 252)' },
  { juz: 3, startPage: 42, nameArabic: 'تِلْكَ الرُّسُلُ', nameFrench: 'Juz 3 (Al-Baqarah 253 - Ali \'Imran 92)' },
  { juz: 4, startPage: 62, nameArabic: 'لَنْ تَنَالُوا', nameFrench: 'Juz 4 (Ali \'Imran 93 - An-Nisa 23)' },
  { juz: 5, startPage: 82, nameArabic: 'وَالْمُحْصَنَاتُ', nameFrench: 'Juz 5 (An-Nisa 24 - 147)' },
  { juz: 6, startPage: 102, nameArabic: 'لَا يُحِبُّ اللَّهُ', nameFrench: 'Juz 6 (An-Nisa 148 - Al-Ma\'idah 81)' },
  { juz: 7, startPage: 121, nameArabic: 'وَإِذَا سَمِعُوا', nameFrench: 'Juz 7 (Al-Ma\'idah 82 - Al-An\'am 110)' },
  { juz: 8, startPage: 142, nameArabic: 'وَلَوْ أَنَّنَا', nameFrench: 'Juz 8 (Al-An\'am 111 - Al-A\'raf 87)' },
  { juz: 9, startPage: 162, nameArabic: 'قَالَ الْمَلَأُ', nameFrench: 'Juz 9 (Al-A\'raf 88 - Al-Anfal 40)' },
  { juz: 10, startPage: 182, nameArabic: 'وَاعْلَمُوا', nameFrench: 'Juz 10 (Al-Anfal 41 - At-Tawbah 92)' },
  { juz: 11, startPage: 201, nameArabic: 'يَعْتَذِرُونَ', nameFrench: 'Juz 11 (At-Tawbah 93 - Hud 5)' },
  { juz: 12, startPage: 222, nameArabic: 'وَمَا مِنْ دَابَّةٍ', nameFrench: 'Juz 12 (Hud 6 - Yusuf 52)' },
  { juz: 13, startPage: 242, nameArabic: 'وَمَا أُبَرِّئُ', nameFrench: 'Juz 13 (Yusuf 53 - Ibrahim 52)' },
  { juz: 14, startPage: 262, nameArabic: 'رُبَمَا', nameFrench: 'Juz 14 (Al-Hijr 1 - An-Nahl 128)' },
  { juz: 15, startPage: 282, nameArabic: 'سُبْحَانَ الَّذِي', nameFrench: 'Juz 15 (Al-Isra 1 - Al-Kahf 74)' },
  { juz: 16, startPage: 302, nameArabic: 'قَالَ أَلَمْ', nameFrench: 'Juz 16 (Al-Kahf 75 - Ta-Ha 135)' },
  { juz: 17, startPage: 322, nameArabic: 'اقْتَرَبَ لِلنَّاسِ', nameFrench: 'Juz 17 (Al-Anbiya 1 - Al-Hajj 78)' },
  { juz: 18, startPage: 342, nameArabic: 'قَدْ أَفْلَحَ', nameFrench: 'Juz 18 (Al-Mu\'minun 1 - Al-Furqan 20)' },
  { juz: 19, startPage: 362, nameArabic: 'وَقَالَ الَّذِينَ', nameFrench: 'Juz 19 (Al-Furqan 21 - An-Naml 55)' },
  { juz: 20, startPage: 382, nameArabic: 'فَمَا كَانَ جَوَابَ', nameFrench: 'Juz 20 (An-Naml 56 - Al-\'Ankabut 45)' },
  { juz: 21, startPage: 402, nameArabic: 'وَلَا تُجَادِلُوا', nameFrench: 'Juz 21 (Al-\'Ankabut 46 - Al-Ahzab 30)' },
  { juz: 22, startPage: 422, nameArabic: 'وَمَنْ يَقْنُتْ', nameFrench: 'Juz 22 (Al-Ahzab 31 - Ya-Sin 27)' },
  { juz: 23, startPage: 442, nameArabic: 'وَمَا لِيَ', nameFrench: 'Juz 23 (Ya-Sin 28 - Az-Zumar 31)' },
  { juz: 24, startPage: 462, nameArabic: 'فَمَنْ أَظْلَمُ', nameFrench: 'Juz 24 (Az-Zumar 32 - Fussilat 46)' },
  { juz: 25, startPage: 482, nameArabic: 'إِلَيْهِ يُرَدُّ', nameFrench: 'Juz 25 (Fussilat 47 - Al-Jathiyah 37)' },
  { juz: 26, startPage: 502, nameArabic: 'حم (الأحقاف)', nameFrench: 'Juz 26 (Al-Ahqaf 1 - Adh-Dhariyat 30)' },
  { juz: 27, startPage: 522, nameArabic: 'قَالَ فَمَا خَطْبُكُمْ', nameFrench: 'Juz 27 (Adh-Dhariyat 31 - Al-Hadid 29)' },
  { juz: 28, startPage: 542, nameArabic: 'قَدْ سَمِعَ اللَّهُ', nameFrench: 'Juz 28 (Al-Mujadilah 1 - At-Tahrim 12)' },
  { juz: 29, startPage: 562, nameArabic: 'تَبَارَكَ الَّذِي', nameFrench: 'Juz 29 (Al-Mulk 1 - Al-Mursalat 50)' },
  { juz: 30, startPage: 582, nameArabic: 'عَمَّ يَتَسَاءَلُونَ', nameFrench: 'Juz 30 (Juz \'Amma - An-Naba 1 - An-Nas 6)' },
];

export const getSurahForPage = (pageNumber: number): number => {
  let matched = 1;
  for (let s = 1; s <= 114; s++) {
    if (SURAH_START_PAGES[s] <= pageNumber) {
      matched = s;
    } else {
      break;
    }
  }
  return matched;
};

export const getJuzForPage = (pageNumber: number): number => {
  let matched = 1;
  for (const j of JUZ_DATA) {
    if (j.startPage <= pageNumber) {
      matched = j.juz;
    } else {
      break;
    }
  }
  return matched;
};

/** Full Surah MP3 stream URL */
export const getReciterAudioUrl = (reciter: Reciter, surahNumber: number): string => {
  const padded = String(surahNumber).padStart(3, '0');
  return `${reciter.serverUrl}${padded}.mp3`;
};

/** Individual Ayah-by-Ayah MP3 URL for real-time passage synchronization */
export const getAyahAudioUrl = (
  reciter: Reciter,
  surahNumber: number,
  verseNumber: number
): string => {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(verseNumber).padStart(3, '0');
  return `https://everyayah.com/data/${reciter.everyAyahFolder}/${paddedSurah}${paddedAyah}.mp3`;
};

/** Medina Mushaf Authentic scanned page */
export const getMushafPageImageUrl = (pageNumber: number): string => {
  const cleanPage = Math.min(604, Math.max(1, pageNumber));
  return `https://quran.ksu.edu.sa/ayat/safahat1/${cleanPage}.png`;
};
