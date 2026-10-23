import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bookmark,
  Share2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Type,
  Heart,
  Info,
  WifiOff,
  CheckCircle2,
  Check,
  Layers,
  Radio,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { MushafPageReader } from './MushafPageReader';
import {
  QURAN_RECITERS,
  Reciter,
  SURAH_START_PAGES,
  getReciterAudioUrl,
  getAyahAudioUrl,
} from '../../data/quranMetadata';
import { ReciterAvatar } from './ReciterAvatar';

interface SurahMetadata {
  number: number;
  nameArabic: string;
  nameFrench: string;
  namePhonetic: string;
  versesCount: number;
  revelationPlace: 'Mecquoise' | 'Médinoise';
  revelationOrder: number;
}

export interface VerseData {
  verseNumber: number;
  arabic: string;
  phonetic: string;
  french: string;
}

// Master list of all 114 Surahs
export const ALL_SURAHS: SurahMetadata[] = [
  { number: 1, nameArabic: 'الفَاتِحَة', nameFrench: 'L\'Ouverture', namePhonetic: 'Al-Fatiha', versesCount: 7, revelationPlace: 'Mecquoise', revelationOrder: 5 },
  { number: 2, nameArabic: 'البَقَرَة', nameFrench: 'La Vache', namePhonetic: 'Al-Baqarah', versesCount: 286, revelationPlace: 'Médinoise', revelationOrder: 87 },
  { number: 3, nameArabic: 'آل عِمْرَان', nameFrench: 'La Famille d\'Imran', namePhonetic: 'Ali \'Imran', versesCount: 200, revelationPlace: 'Médinoise', revelationOrder: 89 },
  { number: 4, nameArabic: 'النِّسَاء', nameFrench: 'Les Femmes', namePhonetic: 'An-Nisa', versesCount: 176, revelationPlace: 'Médinoise', revelationOrder: 92 },
  { number: 5, nameArabic: 'المَائِدَة', nameFrench: 'La Table Servie', namePhonetic: 'Al-Ma\'idah', versesCount: 120, revelationPlace: 'Médinoise', revelationOrder: 112 },
  { number: 6, nameArabic: 'الأَنْعَام', nameFrench: 'Les Bestiaux', namePhonetic: 'Al-An\'am', versesCount: 165, revelationPlace: 'Mecquoise', revelationOrder: 55 },
  { number: 7, nameArabic: 'الأَعْرَاف', nameFrench: 'Les Murailles', namePhonetic: 'Al-A\'raf', versesCount: 206, revelationPlace: 'Mecquoise', revelationOrder: 39 },
  { number: 8, nameArabic: 'الأَنْفَال', nameFrench: 'Le Butin', namePhonetic: 'Al-Anfal', versesCount: 75, revelationPlace: 'Médinoise', revelationOrder: 88 },
  { number: 9, nameArabic: 'التَّوْبَة', nameFrench: 'Le Repentir', namePhonetic: 'At-Tawbah', versesCount: 129, revelationPlace: 'Médinoise', revelationOrder: 113 },
  { number: 10, nameArabic: 'يُونُس', nameFrench: 'Jonas', namePhonetic: 'Yunus', versesCount: 109, revelationPlace: 'Mecquoise', revelationOrder: 51 },
  { number: 11, nameArabic: 'هُود', nameFrench: 'Houd', namePhonetic: 'Hud', versesCount: 123, revelationPlace: 'Mecquoise', revelationOrder: 52 },
  { number: 12, nameArabic: 'يُوسُف', nameFrench: 'Joseph', namePhonetic: 'Yusuf', versesCount: 111, revelationPlace: 'Mecquoise', revelationOrder: 53 },
  { number: 13, nameArabic: 'الرَّعْد', nameFrench: 'Le Tonnerre', namePhonetic: 'Ar-Ra\'d', versesCount: 43, revelationPlace: 'Médinoise', revelationOrder: 96 },
  { number: 14, nameArabic: 'إِبْرَاهِيم', nameFrench: 'Abraham', namePhonetic: 'Ibrahim', versesCount: 52, revelationPlace: 'Mecquoise', revelationOrder: 72 },
  { number: 15, nameArabic: 'الحِجْر', nameFrench: 'Al-Hijr', namePhonetic: 'Al-Hijr', versesCount: 99, revelationPlace: 'Mecquoise', revelationOrder: 54 },
  { number: 16, nameArabic: 'النَّحْل', nameFrench: 'Les Abeilles', namePhonetic: 'An-Nahl', versesCount: 128, revelationPlace: 'Mecquoise', revelationOrder: 70 },
  { number: 17, nameArabic: 'الإِسْرَاء', nameFrench: 'Le Voyage Nocturne', namePhonetic: 'Al-Isra', versesCount: 111, revelationPlace: 'Mecquoise', revelationOrder: 50 },
  { number: 18, nameArabic: 'الكَهْف', nameFrench: 'La Caverne', namePhonetic: 'Al-Kahf', versesCount: 110, revelationPlace: 'Mecquoise', revelationOrder: 69 },
  { number: 19, nameArabic: 'مَرْيَم', nameFrench: 'Marie', namePhonetic: 'Maryam', versesCount: 98, revelationPlace: 'Mecquoise', revelationOrder: 44 },
  { number: 20, nameArabic: 'طه', nameFrench: 'Ta-Ha', namePhonetic: 'Ta-Ha', versesCount: 135, revelationPlace: 'Mecquoise', revelationOrder: 45 },
  { number: 21, nameArabic: 'الأَنْبِيَاء', nameFrench: 'Les Prophètes', namePhonetic: 'Al-Anbiya', versesCount: 112, revelationPlace: 'Mecquoise', revelationOrder: 73 },
  { number: 22, nameArabic: 'الحَجّ', nameFrench: 'Le Pèlerinage', namePhonetic: 'Al-Hajj', versesCount: 78, revelationPlace: 'Médinoise', revelationOrder: 103 },
  { number: 23, nameArabic: 'المُؤْمِنُون', nameFrench: 'Les Croyants', namePhonetic: 'Al-Mu\'minun', versesCount: 118, revelationPlace: 'Mecquoise', revelationOrder: 74 },
  { number: 24, nameArabic: 'النُّور', nameFrench: 'La Lumière', namePhonetic: 'An-Nur', versesCount: 64, revelationPlace: 'Médinoise', revelationOrder: 102 },
  { number: 25, nameArabic: 'الفُرْقَان', nameFrench: 'Le Discernement', namePhonetic: 'Al-Furqan', versesCount: 77, revelationPlace: 'Mecquoise', revelationOrder: 42 },
  { number: 26, nameArabic: 'الشُّعَرَاء', nameFrench: 'Les Poètes', namePhonetic: 'Ash-Shu\'ara', versesCount: 227, revelationPlace: 'Mecquoise', revelationOrder: 47 },
  { number: 27, nameArabic: 'النَّمْل', nameFrench: 'Les Fourmis', namePhonetic: 'An-Naml', versesCount: 93, revelationPlace: 'Mecquoise', revelationOrder: 48 },
  { number: 28, nameArabic: 'القَصَص', nameFrench: 'Le Récit', namePhonetic: 'Al-Qasas', versesCount: 88, revelationPlace: 'Mecquoise', revelationOrder: 49 },
  { number: 29, nameArabic: 'العَنْكَبُوت', nameFrench: 'L\'Araignée', namePhonetic: 'Al-\'Ankabut', versesCount: 69, revelationPlace: 'Mecquoise', revelationOrder: 85 },
  { number: 30, nameArabic: 'الرُّوم', nameFrench: 'Les Romains', namePhonetic: 'Ar-Rum', versesCount: 60, revelationPlace: 'Mecquoise', revelationOrder: 84 },
  { number: 31, nameArabic: 'لُقْمَان', nameFrench: 'Luqman', namePhonetic: 'Luqman', versesCount: 34, revelationPlace: 'Mecquoise', revelationOrder: 57 },
  { number: 32, nameArabic: 'السَّجْدَة', nameFrench: 'La Prosternation', namePhonetic: 'As-Sajdah', versesCount: 30, revelationPlace: 'Mecquoise', revelationOrder: 75 },
  { number: 33, nameArabic: 'الأَحْزَاب', nameFrench: 'Les Coalisés', namePhonetic: 'Al-Ahzab', versesCount: 73, revelationPlace: 'Médinoise', revelationOrder: 90 },
  { number: 34, nameArabic: 'سَبَأ', nameFrench: 'Saba', namePhonetic: 'Saba', versesCount: 54, revelationPlace: 'Mecquoise', revelationOrder: 58 },
  { number: 35, nameArabic: 'فَاطِر', nameFrench: 'Le Créateur', namePhonetic: 'Fatir', versesCount: 45, revelationPlace: 'Mecquoise', revelationOrder: 43 },
  { number: 36, nameArabic: 'يس', nameFrench: 'Ya-Sin', namePhonetic: 'Ya-Sin', versesCount: 83, revelationPlace: 'Mecquoise', revelationOrder: 41 },
  { number: 37, nameArabic: 'الصَّافَّات', nameFrench: 'Les Rangés', namePhonetic: 'As-Saffat', versesCount: 182, revelationPlace: 'Mecquoise', revelationOrder: 56 },
  { number: 38, nameArabic: 'ص', nameFrench: 'Sad', namePhonetic: 'Sad', versesCount: 88, revelationPlace: 'Mecquoise', revelationOrder: 38 },
  { number: 39, nameArabic: 'الزُّمَر', nameFrench: 'Les Groupes', namePhonetic: 'Az-Zumar', versesCount: 75, revelationPlace: 'Mecquoise', revelationOrder: 59 },
  { number: 40, nameArabic: 'غَافِر', nameFrench: 'Le Pardonneur', namePhonetic: 'Ghafir', versesCount: 85, revelationPlace: 'Mecquoise', revelationOrder: 60 },
  { number: 41, nameArabic: 'فُصِّلَت', nameFrench: 'Les Versets Détaillés', namePhonetic: 'Fussilat', versesCount: 54, revelationPlace: 'Mecquoise', revelationOrder: 61 },
  { number: 42, nameArabic: 'الشُّورَى', nameFrench: 'La Consultation', namePhonetic: 'Ash-Shura', versesCount: 53, revelationPlace: 'Mecquoise', revelationOrder: 62 },
  { number: 43, nameArabic: 'الزُّخْرُف', nameFrench: 'L\'Ornement', namePhonetic: 'Az-Zukhruf', versesCount: 89, revelationPlace: 'Mecquoise', revelationOrder: 63 },
  { number: 44, nameArabic: 'الدُّخَان', nameFrench: 'La Fumée', namePhonetic: 'Ad-Dukhan', versesCount: 59, revelationPlace: 'Mecquoise', revelationOrder: 64 },
  { number: 45, nameArabic: 'الجَاثِيَة', nameFrench: 'L\'Agenouillée', namePhonetic: 'Al-Jathiyah', versesCount: 37, revelationPlace: 'Mecquoise', revelationOrder: 65 },
  { number: 46, nameArabic: 'الأَحْقَاف', nameFrench: 'Al-Ahqaf', namePhonetic: 'Al-Ahqaf', versesCount: 35, revelationPlace: 'Mecquoise', revelationOrder: 66 },
  { number: 47, nameArabic: 'مُحَمَّد', nameFrench: 'Muhammad', namePhonetic: 'Muhammad', versesCount: 38, revelationPlace: 'Médinoise', revelationOrder: 95 },
  { number: 48, nameArabic: 'الفَتْح', nameFrench: 'La Victoire Éclatante', namePhonetic: 'Al-Fath', versesCount: 29, revelationPlace: 'Médinoise', revelationOrder: 111 },
  { number: 49, nameArabic: 'الحُجُرَات', nameFrench: 'Les Appartements', namePhonetic: 'Al-Hujurat', versesCount: 18, revelationPlace: 'Médinoise', revelationOrder: 106 },
  { number: 50, nameArabic: 'ق', nameFrench: 'Qaf', namePhonetic: 'Qaf', versesCount: 45, revelationPlace: 'Mecquoise', revelationOrder: 34 },
  { number: 51, nameArabic: 'الذَّارِيَات', nameFrench: 'Qui Éparpillent', namePhonetic: 'Adh-Dhariyat', versesCount: 60, revelationPlace: 'Mecquoise', revelationOrder: 67 },
  { number: 52, nameArabic: 'الطُّور', nameFrench: 'Le Mont', namePhonetic: 'At-Tur', versesCount: 49, revelationPlace: 'Mecquoise', revelationOrder: 76 },
  { number: 53, nameArabic: 'النَّجْم', nameFrench: 'L\'Étoile', namePhonetic: 'An-Najm', versesCount: 62, revelationPlace: 'Mecquoise', revelationOrder: 23 },
  { number: 54, nameArabic: 'القَمَر', nameFrench: 'La Lune', namePhonetic: 'Al-Qamar', versesCount: 55, revelationPlace: 'Mecquoise', revelationOrder: 37 },
  { number: 55, nameArabic: 'الرَّحْمَن', nameFrench: 'Le Tout Miséricordieux', namePhonetic: 'Ar-Rahman', versesCount: 78, revelationPlace: 'Médinoise', revelationOrder: 97 },
  { number: 56, nameArabic: 'الوَاقِعَة', nameFrench: 'L\'Événement Inéluctable', namePhonetic: 'Al-Waqi\'ah', versesCount: 96, revelationPlace: 'Mecquoise', revelationOrder: 46 },
  { number: 57, nameArabic: 'الحَدِيد', nameFrench: 'Le Fer', namePhonetic: 'Al-Hadid', versesCount: 29, revelationPlace: 'Médinoise', revelationOrder: 94 },
  { number: 58, nameArabic: 'المُجَادَلَة', nameFrench: 'La Discussion', namePhonetic: 'Al-Mujadilah', versesCount: 22, revelationPlace: 'Médinoise', revelationOrder: 105 },
  { number: 59, nameArabic: 'الحَشْر', nameFrench: 'L\'Exode', namePhonetic: 'Al-Hashr', versesCount: 24, revelationPlace: 'Médinoise', revelationOrder: 101 },
  { number: 60, nameArabic: 'المُمْتَحَنَة', nameFrench: 'L\'Éprouvée', namePhonetic: 'Al-Mumtahanah', versesCount: 13, revelationPlace: 'Médinoise', revelationOrder: 91 },
  { number: 61, nameArabic: 'الصَّفّ', nameFrench: 'Le Rang', namePhonetic: 'As-Saff', versesCount: 14, revelationPlace: 'Médinoise', revelationOrder: 109 },
  { number: 62, nameArabic: 'الجُمُعَة', nameFrench: 'Le Vendredi', namePhonetic: 'Al-Jumu\'ah', versesCount: 11, revelationPlace: 'Médinoise', revelationOrder: 110 },
  { number: 63, nameArabic: 'المُنَافِقُون', nameFrench: 'Les Hypocrites', namePhonetic: 'Al-Munafiqun', versesCount: 11, revelationPlace: 'Médinoise', revelationOrder: 104 },
  { number: 64, nameArabic: 'التَّغَابُن', nameFrench: 'La Grande Perte', namePhonetic: 'At-Taghabun', versesCount: 18, revelationPlace: 'Médinoise', revelationOrder: 108 },
  { number: 65, nameArabic: 'الطَّلَاق', nameFrench: 'Le Divorce', namePhonetic: 'At-Talaq', versesCount: 12, revelationPlace: 'Médinoise', revelationOrder: 99 },
  { number: 66, nameArabic: 'التَّحْرِيم', nameFrench: 'L\'Interdiction', namePhonetic: 'At-Tahrim', versesCount: 12, revelationPlace: 'Médinoise', revelationOrder: 107 },
  { number: 67, nameArabic: 'المُلْك', nameFrench: 'La Royauté', namePhonetic: 'Al-Mulk', versesCount: 30, revelationPlace: 'Mecquoise', revelationOrder: 77 },
  { number: 68, nameArabic: 'القَلَم', nameFrench: 'La Plume', namePhonetic: 'Al-Qalam', versesCount: 52, revelationPlace: 'Mecquoise', revelationOrder: 2 },
  { number: 69, nameArabic: 'الحَاقَّة', nameFrench: 'Celle qui montre la vérité', namePhonetic: 'Al-Haqqah', versesCount: 52, revelationPlace: 'Mecquoise', revelationOrder: 78 },
  { number: 70, nameArabic: 'المَعَارِج', nameFrench: 'Les Voies d\'Ascension', namePhonetic: 'Al-Ma\'arij', versesCount: 44, revelationPlace: 'Mecquoise', revelationOrder: 79 },
  { number: 71, nameArabic: 'نُوح', nameFrench: 'Noé', namePhonetic: 'Nuh', versesCount: 28, revelationPlace: 'Mecquoise', revelationOrder: 71 },
  { number: 72, nameArabic: 'الجِنّ', nameFrench: 'Les Djinns', namePhonetic: 'Al-Jinn', versesCount: 28, revelationPlace: 'Mecquoise', revelationOrder: 40 },
  { number: 73, nameArabic: 'المُزَّمِّل', nameFrench: 'L\'Enveloppé', namePhonetic: 'Al-Muzzammil', versesCount: 20, revelationPlace: 'Mecquoise', revelationOrder: 3 },
  { number: 74, nameArabic: 'المُدَّثِّر', nameFrench: 'Le Revêtu d\'un manteau', namePhonetic: 'Al-Muddaththir', versesCount: 56, revelationPlace: 'Mecquoise', revelationOrder: 4 },
  { number: 75, nameArabic: 'القِيَامَة', nameFrench: 'La Résurrection', namePhonetic: 'Al-Qiyamah', versesCount: 40, revelationPlace: 'Mecquoise', revelationOrder: 31 },
  { number: 76, nameArabic: 'الإِنْسَان', nameFrench: 'L\'Homme', namePhonetic: 'Al-Insan', versesCount: 31, revelationPlace: 'Médinoise', revelationOrder: 98 },
  { number: 77, nameArabic: 'المُرْسَلَات', nameFrench: 'Les Envoyés', namePhonetic: 'Al-Mursalat', versesCount: 50, revelationPlace: 'Mecquoise', revelationOrder: 33 },
  { number: 78, nameArabic: 'النَّبَأ', nameFrench: 'La Nouvelle', namePhonetic: 'An-Naba', versesCount: 40, revelationPlace: 'Mecquoise', revelationOrder: 80 },
  { number: 79, nameArabic: 'النَّازِعَات', nameFrench: 'Les Anges qui arrachent', namePhonetic: 'An-Nazi\'at', versesCount: 46, revelationPlace: 'Mecquoise', revelationOrder: 81 },
  { number: 80, nameArabic: 'عَبَسَ', nameFrench: 'Il s\'est renfrogné', namePhonetic: '\'Abasa', versesCount: 42, revelationPlace: 'Mecquoise', revelationOrder: 24 },
  { number: 81, nameArabic: 'التَّكْوِير', nameFrench: 'L\'Obscurcissement', namePhonetic: 'At-Takwir', versesCount: 29, revelationPlace: 'Mecquoise', revelationOrder: 7 },
  { number: 82, nameArabic: 'الانْفِطَار', nameFrench: 'La Rupture', namePhonetic: 'Al-Infitar', versesCount: 19, revelationPlace: 'Mecquoise', revelationOrder: 82 },
  { number: 83, nameArabic: 'المُطَفِّفِين', nameFrench: 'Les Fraudeurs', namePhonetic: 'Al-Mutaffifin', versesCount: 36, revelationPlace: 'Mecquoise', revelationOrder: 86 },
  { number: 84, nameArabic: 'الانْشِقَاق', nameFrench: 'La Déchirure', namePhonetic: 'Al-Inshiqaq', versesCount: 25, revelationPlace: 'Mecquoise', revelationOrder: 83 },
  { number: 85, nameArabic: 'البُرُوج', nameFrench: 'Les Constellations', namePhonetic: 'Al-Buruj', versesCount: 22, revelationPlace: 'Mecquoise', revelationOrder: 27 },
  { number: 86, nameArabic: 'الطَّارِق', nameFrench: 'L\'Astre Nocturne', namePhonetic: 'At-Tariq', versesCount: 17, revelationPlace: 'Mecquoise', revelationOrder: 36 },
  { number: 87, nameArabic: 'الأَعْلَى', nameFrench: 'Le Très-Haut', namePhonetic: 'Al-A\'la', versesCount: 19, revelationPlace: 'Mecquoise', revelationOrder: 8 },
  { number: 88, nameArabic: 'الغَاشِيَة', nameFrench: 'L\'Enveloppante', namePhonetic: 'Al-Ghashiyah', versesCount: 26, revelationPlace: 'Mecquoise', revelationOrder: 68 },
  { number: 89, nameArabic: 'الفَجْر', nameFrench: 'L\'Aube', namePhonetic: 'Al-Fajr', versesCount: 30, revelationPlace: 'Mecquoise', revelationOrder: 10 },
  { number: 90, nameArabic: 'البَلَد', nameFrench: 'La Cité', namePhonetic: 'Al-Balad', versesCount: 20, revelationPlace: 'Mecquoise', revelationOrder: 35 },
  { number: 91, nameArabic: 'الشَّمْس', nameFrench: 'Le Soleil', namePhonetic: 'Ash-Shams', versesCount: 15, revelationPlace: 'Mecquoise', revelationOrder: 26 },
  { number: 92, nameArabic: 'اللَّيْل', nameFrench: 'La Nuit', namePhonetic: 'Al-Layl', versesCount: 21, revelationPlace: 'Mecquoise', revelationOrder: 9 },
  { number: 93, nameArabic: 'الضُّحَى', nameFrench: 'Le Jour Montant', namePhonetic: 'Ad-Duha', versesCount: 11, revelationPlace: 'Mecquoise', revelationOrder: 11 },
  { number: 94, nameArabic: 'الشَّرْح', nameFrench: 'L\'Ouverture du Cœur', namePhonetic: 'Ash-Sharh', versesCount: 8, revelationPlace: 'Mecquoise', revelationOrder: 12 },
  { number: 95, nameArabic: 'التِّين', nameFrench: 'Le Figuier', namePhonetic: 'At-Tin', versesCount: 8, revelationPlace: 'Mecquoise', revelationOrder: 28 },
  { number: 96, nameArabic: 'العَلَق', nameFrench: 'L\'Adhérence', namePhonetic: 'Al-\'Alaq', versesCount: 19, revelationPlace: 'Mecquoise', revelationOrder: 1 },
  { number: 97, nameArabic: 'القَدْر', nameFrench: 'La Destinée', namePhonetic: 'Al-Qadr', versesCount: 5, revelationPlace: 'Mecquoise', revelationOrder: 25 },
  { number: 98, nameArabic: 'البَيِّنَة', nameFrench: 'La Preuve Décisive', namePhonetic: 'Al-Bayyinah', versesCount: 8, revelationPlace: 'Médinoise', revelationOrder: 100 },
  { number: 99, nameArabic: 'الزَّلْزَلَة', nameFrench: 'La Secousse', namePhonetic: 'Az-Zalzalah', versesCount: 8, revelationPlace: 'Médinoise', revelationOrder: 93 },
  { number: 100, nameArabic: 'العَادِيَات', nameFrench: 'Les Coursiers', namePhonetic: 'Al-\'Adiyat', versesCount: 11, revelationPlace: 'Mecquoise', revelationOrder: 14 },
  { number: 101, nameArabic: 'القَارِعَة', nameFrench: 'Le Fracas', namePhonetic: 'Al-Qari\'ah', versesCount: 11, revelationPlace: 'Mecquoise', revelationOrder: 30 },
  { number: 102, nameArabic: 'التَّكَاثُر', nameFrench: 'La Course aux Richesses', namePhonetic: 'At-Takathur', versesCount: 8, revelationPlace: 'Mecquoise', revelationOrder: 16 },
  { number: 103, nameArabic: 'العَصْر', nameFrench: 'Le Temps', namePhonetic: 'Al-\'Asr', versesCount: 3, revelationPlace: 'Mecquoise', revelationOrder: 13 },
  { number: 104, nameArabic: 'الهُمَزَة', nameFrench: 'Les Diffamateurs', namePhonetic: 'Al-Humazah', versesCount: 9, revelationPlace: 'Mecquoise', revelationOrder: 32 },
  { number: 105, nameArabic: 'الفِيل', nameFrench: 'L\'Éléphant', namePhonetic: 'Al-Fil', versesCount: 5, revelationPlace: 'Mecquoise', revelationOrder: 19 },
  { number: 106, nameArabic: 'قُرَيْش', nameFrench: 'Les Quraych', namePhonetic: 'Quraysh', versesCount: 4, revelationPlace: 'Mecquoise', revelationOrder: 29 },
  { number: 107, nameArabic: 'المَاعُون', nameFrench: 'L\'Ustensile', namePhonetic: 'Al-Ma\'un', versesCount: 7, revelationPlace: 'Mecquoise', revelationOrder: 17 },
  { number: 108, nameArabic: 'الكَوْثَر', nameFrench: 'L\'Abondance', namePhonetic: 'Al-Kawthar', versesCount: 3, revelationPlace: 'Mecquoise', revelationOrder: 15 },
  { number: 109, nameArabic: 'الكَافِرُون', nameFrench: 'Les Infidèles', namePhonetic: 'Al-Kafirun', versesCount: 6, revelationPlace: 'Mecquoise', revelationOrder: 18 },
  { number: 110, nameArabic: 'النَّصْر', nameFrench: 'Le Secours', namePhonetic: 'An-Nasr', versesCount: 3, revelationPlace: 'Médinoise', revelationOrder: 114 },
  { number: 111, nameArabic: 'المَسَد', nameFrench: 'Les Fibres', namePhonetic: 'Al-Masad', versesCount: 5, revelationPlace: 'Mecquoise', revelationOrder: 6 },
  { number: 112, nameArabic: 'الإِخْلَاص', nameFrench: 'Le Monothéisme Pur', namePhonetic: 'Al-Ikhlas', versesCount: 4, revelationPlace: 'Mecquoise', revelationOrder: 22 },
  { number: 113, nameArabic: 'الفَلَق', nameFrench: 'L\'Aube Naissante', namePhonetic: 'Al-Falaq', versesCount: 5, revelationPlace: 'Mecquoise', revelationOrder: 20 },
  { number: 114, nameArabic: 'النَّاس', nameFrench: 'Les Hommes', namePhonetic: 'An-Nas', versesCount: 6, revelationPlace: 'Mecquoise', revelationOrder: 21 },
];

// Rich text library for the most revered and recited Surahs
const REVERED_SURAHS_CONTENT: Record<number, VerseData[]> = {
  // Sura 1: Al-Fatiha
  1: [
    {
      verseNumber: 1,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      phonetic: 'Bismi Allāhi ar-raḥmāni ar-raḥīm',
      french: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
    },
    {
      verseNumber: 2,
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      phonetic: 'Al-ḥamdu lillāhi rabbi al-\'ālamīn',
      french: 'Louange à Allah, Seigneur de l\'univers.',
    },
    {
      verseNumber: 3,
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      phonetic: 'Ar-raḥmāni ar-raḥīm',
      french: 'Le Tout Miséricordieux, le Très Miséricordieux,',
    },
    {
      verseNumber: 4,
      arabic: 'مَالِكِ يَوْمِ الدِّينِ',
      phonetic: 'Māliki yawmi ad-dīn',
      french: 'Maître du Jour de la rétribution.',
    },
    {
      verseNumber: 5,
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      phonetic: 'Iyyāka na\'budu wa-iyyāka nasta\'īn',
      french: 'C\'est Toi [Seul] que nous adorons, et c\'est Toi [Seul] dont nous implorons secours.',
    },
    {
      verseNumber: 6,
      arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      phonetic: 'Ihdinā aṣ-ṣirāṭa al-mustaqīm',
      french: 'Guide-nous dans le droit chemin,',
    },
    {
      verseNumber: 7,
      arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      phonetic: 'Ṣirāṭa alladhīna an\'amta \'alayhim ghayri al-maghḍūbi \'alayhim walā aḍ-ḍāllīn',
      french: 'le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.',
    },
  ],

  // Sura 2: Ayat Al-Kursi & Fins de Baqarah
  2: [
    {
      verseNumber: 255,
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      phonetic: 'Allāhu lā ilāha illā huwa al-ḥayyu al-qayyūm, lā ta’khudhuhu sinatun walā nawm, lahu mā fī as-samāwāti wamā fī al-arḍ...',
      french: '[Ayat Al-Kursi - Le Verset du Trône] Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même "Al-Qayyum". Ni somnolence ni sommeil ne Le saisissent. À Lui appartient tout ce qui est dans les cieux et sur la terre. Qui peut intercéder auprès de Lui sans Sa permission ? Il sait leur passé et leur futur. Et, de Sa science, ils n\'embrassent que ce qu\'Il veut. Son Trône "Kursiy" déborde les cieux et la terre, dont la garde ne Lui coûte aucune peine. Et Il est le Très Haut, le Très Grand.',
    },
    {
      verseNumber: 285,
      arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ',
      phonetic: 'Āmana ar-rasūlu bimā unzila ilayhi min rabbihi wal-mu’minūn...',
      french: 'Le Messager a cru en ce qu\'on a fait descendre vers lui venant de son Seigneur, et aussi les croyants : tous ont cru en Allah, en Ses anges, à Ses livres et en Ses messagers...',
    },
    {
      verseNumber: 286,
      arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
      phonetic: 'Lā yukallifu Allāhu nafsan illā wus\'ahā, lahā mā kasabat wa\'alayhā mā iktasabat...',
      french: 'Allah n\'impose à aucune âme une charge supérieure à sa capacité. Elle sera récompensée du bien qu\'elle aura fait, punie du mal qu\'elle aura fait. Seigneur, ne nous châtie pas s\'il nous arrive d\'oublier ou de commettre une erreur...',
    },
  ],

  // Sura 22: Al-Hajj (Le Pèlerinage)
  22: [
    {
      verseNumber: 27,
      arabic: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ',
      phonetic: 'Wa-adhdhin fī an-nāsi bil-ḥajji ya’tūka rijālan wa\'alā kulli ḍāmirin ya’tīna min kulli fajjin \'amīq',
      french: '« Et fais aux gens une annonce pour le Hajj. Ils viendront vers toi, à pied, et aussi sur toute monture venant de tout chemin éloigné, »',
    },
    {
      verseNumber: 28,
      arabic: 'لِّيَشْهَدُوا مَنَافِعَ لَهُمْ وَيَذْكُرُوا اسْمَ اللَّهِ فِي أَيَّامٍ مَّعْلُومَاتٍ عَلَىٰ مَا رَزَقَهُم مِّن بَهِيمَةِ الْأَنْعَامِ ۖ فَكُلُوا مِنْهَا وَأَطْعِمُوا الْبَائِسَ الْفَقِيرَ',
      phonetic: 'Liyashhadū manāfi\'a lahum wayadhkurū isma Allāhi fī ayyāmin ma\'lūmāt...',
      french: 'pour participer aux avantages qui leur ont été accordés et pour invoquer le nom d\'Allah aux jours fixés, sur la bête de cheptel qu\'Il leur a attribuée. Mangez-en vous-mêmes et faites-en manger le besogneux misérable.',
    },
    {
      verseNumber: 29,
      arabic: 'ثُمَّ لْيَقْضُوا تَفَثَهُمْ وَلْيُوفُوا نُذُورَهُمْ وَلْيَطَّوَّفُوا بِالْبَيْتِ الْعَتِيقِ',
      phonetic: 'Thumma l-yaqḍū tafathahum wal-yūfū nudhūrahum wal-yaṭṭawwafū bil-bayti al-\'atīq',
      french: 'Puis qu\'ils mettent fin à leurs interdits (qu\'ils se nettoient), qu\'ils accomplissent leurs vœux, et qu\'ils fassent les circuits autour de l\'Antique Maison (la Kaaba).',
    },
  ],

  // Sura 36: Ya-Sin
  36: [
    {
      verseNumber: 1,
      arabic: 'يس',
      phonetic: 'Yā-Sīn',
      french: 'Yâ-Sîn.',
    },
    {
      verseNumber: 2,
      arabic: 'وَالْقُرْآنِ الْحَكِيمِ',
      phonetic: 'Wal-qur’āni al-ḥakīm',
      french: 'Par le Coran plein de sagesse.',
    },
    {
      verseNumber: 3,
      arabic: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
      phonetic: 'Innaka lamina al-mursalīn',
      french: 'Tu es certes du nombre des messagers,',
    },
    {
      verseNumber: 4,
      arabic: 'عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ',
      phonetic: '\'Alā ṣirāṭin mustaqīm',
      french: 'sur un chemin droit.',
    },
    {
      verseNumber: 5,
      arabic: 'تَنزِيلَ الْعَزِيزِ الرَّحِيمِ',
      phonetic: 'Tanzīla al-\'azīzi ar-raḥīm',
      french: 'C\'est une révélation de la part du Tout-Puissant, du Très Miséricordieux.',
    },
  ],

  // Sura 67: Al-Mulk
  67: [
    {
      verseNumber: 1,
      arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      phonetic: 'Tabāraka alladhī biyadihi al-mulku wahuwa \'alā kulli shay’in qadīr',
      french: 'Béni soit celui dans la main de qui est la royauté, et Il est Omnipotent.',
    },
    {
      verseNumber: 2,
      arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
      phonetic: 'Alladhī khalaqa al-mawta wal-ḥayāta liyabluwakum ayyukum aḥsanu \'amalā...',
      french: 'Celui qui a créé la mort et la vie afin de vous éprouver (et de savoir) qui de vous est le meilleur en œuvre, et c\'est Lui le Puissant, le Pardonneur.',
    },
    {
      verseNumber: 3,
      arabic: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
      phonetic: 'Alladhī khalaqa sab\'a samāwātin ṭibāqā...',
      french: 'Celui qui a créé sept cieux superposés sans que tu voies de disproportion en la création du Tout Miséricordieux. Ramène sur elle ton regard. Y vois-tu une brèche ?',
    },
  ],

  // Sura 97: Al-Qadr
  97: [
    {
      verseNumber: 1,
      arabic: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
      phonetic: 'Innā anzalnāhu fī laylati al-qadr',
      french: 'Nous l\'avons certes, fait descendre (le Coran) pendant la nuit d\'Al-Qadr.',
    },
    {
      verseNumber: 2,
      arabic: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ',
      phonetic: 'Wamā adrāka mā laylatu al-qadr',
      french: 'Et qui te dira ce qu\'est la nuit d\'Al-Qadr ?',
    },
    {
      verseNumber: 3,
      arabic: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
      phonetic: 'Laylatu al-qadri khayrun min alfi shahr',
      french: 'La nuit d\'Al-Qadr est meilleure que mille mois.',
    },
    {
      verseNumber: 4,
      arabic: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ',
      phonetic: 'Tanazzalu al-malā’ikatu war-rūḥu fīhā bi’idhni rabbihim min kulli amr',
      french: 'Durant celle-ci descendent les Anges ainsi que l\'Esprit, par permission de leur Seigneur pour tout ordre.',
    },
    {
      verseNumber: 5,
      arabic: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
      phonetic: 'Salāmun hiya ḥattā maṭla\'i al-fajr',
      french: 'Elle est paix et salut jusqu\'à l\'apparition de l\'aube.',
    },
  ],

  // Sura 112: Al-Ikhlas
  112: [
    {
      verseNumber: 1,
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      phonetic: 'Qul huwa Allāhu aḥad',
      french: 'Dis : « Il est Allah, Unique.',
    },
    {
      verseNumber: 2,
      arabic: 'اللَّهُ الصَّمَدُ',
      phonetic: 'Allāhu aṣ-ṣamad',
      french: 'Allah, Le Seul à être imploré pour ce que nous désirons.',
    },
    {
      verseNumber: 3,
      arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      phonetic: 'Lam yalid walam yūlad',
      french: 'Il n\'a jamais engendré, n\'a pas été engendré non plus.',
    },
    {
      verseNumber: 4,
      arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      phonetic: 'Walam yakun lahu kufuwan aḥad',
      french: 'Et nul n\'est égal à Lui. »',
    },
  ],

  // Sura 113: Al-Falaq
  113: [
    {
      verseNumber: 1,
      arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      phonetic: 'Qul a\'ūdhu birabbi al-falaq',
      french: 'Dis : « Je cherche protection auprès du Seigneur de l\'aube naissante,',
    },
    {
      verseNumber: 2,
      arabic: 'مِن شَرِّ مَا خَلَقَ',
      phonetic: 'Min sharri mā khalaq',
      french: 'contre le mal des êtres qu\'Il a créés,',
    },
    {
      verseNumber: 3,
      arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      phonetic: 'Wamin sharri ghāsiqin idhā waqab',
      french: 'contre le mal de l\'obscurité quand elle s\'approfondit,',
    },
    {
      verseNumber: 4,
      arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
      phonetic: 'Wamin sharri an-naffāthāti fī al-\'uqad',
      french: 'contre le mal de celles qui soufflent sur les nœuds,',
    },
    {
      verseNumber: 5,
      arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      phonetic: 'Wamin sharri ḥāsidin idhā ḥasad',
      french: 'et contre le mal de l\'envieux quand il envie. »',
    },
  ],

  // Sura 114: An-Nas
  114: [
    {
      verseNumber: 1,
      arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      phonetic: 'Qul a\'ūdhu birabbi an-nās',
      french: 'Dis : « Je cherche protection auprès du Seigneur des hommes.',
    },
    {
      verseNumber: 2,
      arabic: 'مَلِكِ النَّاسِ',
      phonetic: 'Maliki an-nās',
      french: 'Le Souverain des hommes,',
    },
    {
      verseNumber: 3,
      arabic: 'إِلَٰهِ النَّاسِ',
      phonetic: 'Ilāhi an-nās',
      french: 'Dieu des hommes,',
    },
    {
      verseNumber: 4,
      arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      phonetic: 'Min sharri al-waswāsi al-khannās',
      french: 'contre le mal du mauvais conseiller, furtif,',
    },
    {
      verseNumber: 5,
      arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
      phonetic: 'Alladhī yuwaswisu fī ṣudūri an-nās',
      french: 'qui souffle le mal dans les poitrines des hommes,',
    },
    {
      verseNumber: 6,
      arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
      phonetic: 'Mina al-jinnati wan-nās',
      french: 'qu\'il soit d\'entre les djinns ou les hommes. »',
    },
  ],
};

// Essential Hajj & Umrah Pilgrimage Du'as
const PILGRIMAGE_DUAS = [
  {
    title: 'La Talbiyah Sacrée (Répétée durant le Hajj et la Oumra)',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ',
    phonetic: 'Labbayka Allāhumma labbayk, labbayka lā shareeka laka labbayk. Inna al-ḥamda wan-ni\'mata laka wal-mulk, lā shareeka lak.',
    french: '« Me voici, Ô Allah, me voici ! Me voici, Tu n\'as point d\'associé, me voici ! Certes, la louange, les bienfaits et la royauté T\'appartiennent, Tu n\'as point d\'associé. »',
    moment: 'Dès la formulation de l\'Ihrâm et jusqu\'au jet de la première pierre de Jamarat al-Aqaba.',
  },
  {
    title: 'Invocation du Tawaf (Entre le Coin Yéménite et la Pierre Noire)',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    phonetic: 'Rabbanā ātinā fī ad-dunyā ḥasanatan wa-fī al-ākhirati ḥasanatan wa-qinā \'adhāba an-nār.',
    french: '« Seigneur ! Accorde-nous belle part ici-bas, et belle part aussi dans l\'au-delà ; et protège-nous du châtiment du Feu ! » (Sourate Al-Baqarah 2:201)',
    moment: 'Récité lors de chaque tour de la Kaaba entre le Rukn Al-Yamani et Al-Hajar Al-Aswad.',
  },
  {
    title: 'Invocation au sommet de Safa et Marwah (Le Sa\'i)',
    arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ... أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ. لا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    phonetic: 'Inna aṣ-Ṣafā wal-Marwata min sha\'ā’iri Allāh... Abda’u bimā bada’a Allāhu bih. Lā ilāha illā Allāh waḥdahu lā shareeka lah, lahu al-mulku wa lahu al-ḥamdu wa huwa \'alā kulli shay’in qadīr...',
    french: '« Certes, As-Safa et Al-Marwah sont parmi les rituels sacrés d\'Allah... Je commence par ce par quoi Allah a commencé. Nulle divinité digne d\'adoration sauf Allah Seul, sans associé... »',
    moment: 'En montant sur le mont Safa puis sur Marwah, face à la Kaaba.',
  },
  {
    title: 'Meilleure Invocation du Jour d\'Arafat (Le Cœur du Hajj)',
    arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    phonetic: 'Lā ilāha illā Allāhu waḥdahu lā shareeka lah, lahu al-mulku wa lahu al-ḥamdu, wa huwa \'alā kulli shay’in qadīr.',
    french: '« Nulle divinité n\'est digne d\'être adorée en dehors d\'Allah Seul sans associé. À Lui appartient la royauté et à Lui revient la louange, et Il est Omnipotent. »',
    moment: 'Le Prophète ﷺ a dit : « La meilleure des invocations est celle du jour d\'Arafat. »',
  },
];

export const HolyQuranReader: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1);
  const [activeViewMode, setActiveViewMode] = useState<'PAGES' | 'SURAHS' | 'DUAS'>('PAGES');
  const [targetMushafPage, setTargetMushafPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fontSizeClass, setFontSizeClass] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [showPhonetics, setShowPhonetics] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);

  // Reciter Selection State (11 prestigious reciters with photo portraits)
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    const savedId = localStorage.getItem('eva_quran_reciter_id');
    const found = QURAN_RECITERS.find((r) => r.id === savedId);
    return found || QURAN_RECITERS[0];
  });
  const [isReciterModalOpen, setIsReciterModalOpen] = useState<boolean>(false);

  // Audio Playback Mode: 'SYNC_VERSES' (Synchronized Ayah-by-Ayah with text highlight) vs 'FULL_SURAH'
  const [audioPlaybackMode, setAudioPlaybackMode] = useState<'SYNC_VERSES' | 'FULL_SURAH'>('SYNC_VERSES');
  const [activeAyahIndex, setActiveAyahIndex] = useState<number>(0);

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic verses list for the selected surah
  const [dynamicVerses, setDynamicVerses] = useState<VerseData[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);

  const selectedSurah = ALL_SURAHS.find((s) => s.number === selectedSurahNumber) || ALL_SURAHS[0];

  // Fetch full verses of selected surah for real-time text synchronization
  useEffect(() => {
    let isCancelled = false;

    // Check if we have rich local content
    const localContent = REVERED_SURAHS_CONTENT[selectedSurahNumber];
    if (localContent && localContent.length > 0) {
      setDynamicVerses(localContent);
      setActiveAyahIndex(0);
      return;
    }

    // Otherwise fetch from the cached AlQuran Cloud API
    setIsLoadingVerses(true);
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/editions/quran-uthmani,fr.hamidullah`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isCancelled) return;
        if (data?.data && Array.isArray(data.data) && data.data.length >= 2) {
          const uthmaniAyahs = data.data[0].ayahs;
          const frenchAyahs = data.data[1].ayahs;
          const mapped: VerseData[] = uthmaniAyahs.map((a: any, i: number) => ({
            verseNumber: a.numberInSurah,
            arabic: a.text,
            phonetic: `Verset ${a.numberInSurah}`,
            french: frenchAyahs[i]?.text || '',
          }));
          setDynamicVerses(mapped);
        } else {
          setDynamicVerses([]);
        }
        setActiveAyahIndex(0);
        setIsLoadingVerses(false);
      })
      .catch((err) => {
        console.warn('Could not fetch surah verses:', err);
        if (!isCancelled) {
          setDynamicVerses([]);
          setIsLoadingVerses(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedSurahNumber]);

  // Filtered surahs for the catalog
  const filteredSurahs = ALL_SURAHS.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.nameFrench.toLowerCase().includes(q) ||
      s.namePhonetic.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      String(s.number) === q
    );
  });

  // Current active verse
  const currentActiveVerse = dynamicVerses[activeAyahIndex];

  // Dynamic Audio Stream URL
  const audioSrc =
    audioPlaybackMode === 'SYNC_VERSES' && currentActiveVerse
      ? getAyahAudioUrl(selectedReciter, selectedSurahNumber, currentActiveVerse.verseNumber)
      : getReciterAudioUrl(selectedReciter, selectedSurahNumber);

  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [audioSrc]);

  // Auto-scroll active verse card into view when recitation advances!
  useEffect(() => {
    if (isPlaying && audioPlaybackMode === 'SYNC_VERSES') {
      const el = document.getElementById(`verse-card-${activeAyahIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeAyahIndex, isPlaying, audioPlaybackMode]);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Audio playback error', e);
          setIsPlaying(false);
        });
    }
  };

  const handleAudioEnded = () => {
    if (audioPlaybackMode === 'SYNC_VERSES') {
      if (activeAyahIndex < dynamicVerses.length - 1) {
        setActiveAyahIndex((prev) => prev + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playVerse = (index: number) => {
    setAudioPlaybackMode('SYNC_VERSES');
    setActiveAyahIndex(index);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 40);
  };

  const handlePrevVerse = () => {
    if (activeAyahIndex > 0) {
      setActiveAyahIndex((i) => i - 1);
      setIsPlaying(true);
    }
  };

  const handleNextVerse = () => {
    if (activeAyahIndex < dynamicVerses.length - 1) {
      setActiveAyahIndex((i) => i + 1);
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioProgress(audioRef.current.currentTime);
    setAudioDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setAudioProgress(target);
    }
  };

  const formatAudioTime = (sec: number) => {
    if (isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleNextSurah = () => {
    if (selectedSurahNumber < 114) {
      setSelectedSurahNumber(selectedSurahNumber + 1);
    }
  };

  const handlePrevSurah = () => {
    if (selectedSurahNumber > 1) {
      setSelectedSurahNumber(selectedSurahNumber - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* Hero Header with Islamic Theme - Majestic Emerald Green & White */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white p-6 sm:p-8 shadow-2xl border-2 border-emerald-600/40">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-white text-[#064e3b] shadow-xs">
                <BookOpen className="w-4 h-4 text-[#064e3b]" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                Parole d'Allah · القرآن الكريم
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Le Saint Coran : Pages du Mushaf & Récitations Synchronisées
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Consultez les 604 pages du Mushaf authentique de Médine avec zoom et marque-page, ou suivez la lecture verset par verset synchronisée avec la voix des plus grands récitateurs de l'Islam.
            </p>
          </div>

          {/* Sub Navigation Switcher - Green and White */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-emerald-950/70 rounded-2xl border border-emerald-500/40 text-xs font-bold shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveViewMode('PAGES')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeViewMode === 'PAGES'
                  ? 'bg-white text-[#064e3b] shadow-sm font-black'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📄 Pages du Mushaf (1-604)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('SURAHS')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeViewMode === 'SURAHS'
                  ? 'bg-white text-[#064e3b] shadow-sm font-black'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>📖 Récitation & Passages</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('DUAS')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeViewMode === 'DUAS'
                  ? 'bg-white text-[#064e3b] shadow-sm font-black'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <span>🤲 Invocations</span>
            </button>
          </div>
        </div>
      </div>

      {/* Offline & HD Reciters Guarantee Ribbon - White with Emerald accents */}
      <div className="px-4 py-3 rounded-2xl bg-white border-2 border-emerald-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <span className="font-extrabold text-[#064e3b]">
              {isOnline
                ? 'Récitations HD & Synchronisation sur le Livre :'
                : 'Mode Hors-Connexion Actif :'}
            </span>{' '}
            <span className="text-stone-600">
              {QURAN_RECITERS.length} récitateurs de renom avec portraits photos, suivi du passage récité en temps réel et sauvegarde automatique du marque-page.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Reciter pill button */}
          <button
            type="button"
            onClick={() => setIsReciterModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#064e3b] font-bold text-[11px] flex items-center gap-2 shadow-2xs"
          >
            <ReciterAvatar reciter={selectedReciter} size="xs" isPlaying={isPlaying} />
            <span>{selectedReciter.nameFrench.replace('Cheikh ', '')}</span>
          </button>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            24/7 Disponible
          </span>
        </div>
      </div>

      {/* VIEW 1: MUSHAF PAGE-BY-PAGE READER (PAGES 1 A 604 AVEC PASSAGES SYNCHRONISES) */}
      {activeViewMode === 'PAGES' && (
        <MushafPageReader initialPage={targetMushafPage} />
      )}

      {/* VIEW 2: SURAHS WITH TRANSLATION, PHONETICS & PASSAGE SYNCHRONIZATION */}
      {activeViewMode === 'SURAHS' && (
        <div className="space-y-6">
          {/* Audio Reciter Player Floating Bar - Emerald Green & Crisp White */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              {/* Reciter Portrait Avatar */}
              <div
                onClick={() => setIsReciterModalOpen(true)}
                className="cursor-pointer group flex items-center gap-3"
                title="Changer de récitateur"
              >
                <ReciterAvatar reciter={selectedReciter} size="md" isPlaying={isPlaying} />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block truncate">
                      {selectedReciter.nameFrench}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReciterModalOpen(true)}
                      className="text-[10px] text-amber-600 hover:text-amber-700 underline font-bold"
                    >
                      (Changer)
                    </button>
                  </div>
                  <span className="text-sm font-black text-stone-900 truncate block">
                    Sourate {selectedSurah.number}. {selectedSurah.namePhonetic} ({selectedSurah.nameArabic})
                  </span>
                </div>
              </div>

              {/* Play / Pause button */}
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-11 h-11 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 cursor-pointer ml-auto md:ml-2"
                title={isPlaying ? 'Pause' : 'Écouter'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
              </button>
            </div>

            {/* Sync Mode Switcher */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAudioPlaybackMode('SYNC_VERSES');
                  setIsPlaying(true);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  audioPlaybackMode === 'SYNC_VERSES'
                    ? 'bg-[#047857] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-emerald-950'
                }`}
                title="Lecture synchronisée verset par verset avec surlignage en direct"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Passages synchronisés</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAudioPlaybackMode('FULL_SURAH');
                  setIsPlaying(true);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  audioPlaybackMode === 'FULL_SURAH'
                    ? 'bg-[#047857] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-emerald-950'
                }`}
                title="Écouter la sourate en continu"
              >
                Sourate complète
              </button>
            </div>

            {/* Verse Navigation if in SYNC_VERSES mode */}
            {audioPlaybackMode === 'SYNC_VERSES' && dynamicVerses.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevVerse}
                  disabled={activeAyahIndex <= 0}
                  className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 disabled:opacity-30"
                  title="Verset précédent"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-200">
                  Verset {activeAyahIndex + 1} / {dynamicVerses.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextVerse}
                  disabled={activeAyahIndex >= dynamicVerses.length - 1}
                  className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] border border-emerald-200 disabled:opacity-30"
                  title="Verset suivant"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrubber & Progress */}
            <div className="flex-1 w-full max-w-xs flex items-center gap-2 text-xs font-mono text-stone-500">
              <span className="text-[11px]">{formatAudioTime(audioProgress)}</span>
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                value={audioProgress}
                onChange={handleSeek}
                className="flex-1 accent-[#047857] h-1.5 rounded-lg bg-emerald-100 cursor-pointer"
              />
              <span className="text-[11px]">{formatAudioTime(audioDuration)}</span>
            </div>

            {/* Mute button */}
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
                }
              }}
              className="p-2 text-stone-500 hover:text-emerald-950 rounded-xl hover:bg-emerald-50"
              title={isMuted ? 'Rétablir le son' : 'Couper le son'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Surah Directory & Search Bar */}
          <div className="bg-white rounded-3xl p-5 border-2 border-emerald-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une sourate (ex: Al-Fatiha, Ya-Sin, 112)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-emerald-200 bg-[#fbfdfb] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]"
                />
              </div>

              {/* View options: Font size, phonetics toggle */}
              <div className="flex items-center gap-2">
                {/* Font size picker */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-700">
                  <span className="px-2 text-[10px] text-stone-500 uppercase">Police:</span>
                  <button
                    type="button"
                    onClick={() => setFontSizeClass('sm')}
                    className={`px-2 py-1 rounded-lg ${fontSizeClass === 'sm' ? 'bg-white shadow-xs text-[#064e3b]' : ''}`}
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizeClass('lg')}
                    className={`px-2 py-1 rounded-lg ${fontSizeClass === 'lg' ? 'bg-white shadow-xs text-[#064e3b]' : ''}`}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSizeClass('xl')}
                    className={`px-2 py-1 rounded-lg ${fontSizeClass === 'xl' ? 'bg-white shadow-xs text-[#064e3b]' : ''}`}
                  >
                    A+
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPhonetics(!showPhonetics)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    showPhonetics
                      ? 'bg-emerald-50 text-[#064e3b] border-emerald-300'
                      : 'bg-white text-stone-500 border-stone-200'
                  }`}
                  title="Afficher/masquer la phonétique"
                >
                  Phonétique
                </button>
              </div>
            </div>

            {/* Quick Pills Carousel of Surahs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {filteredSurahs.slice(0, 15).map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setSelectedSurahNumber(s.number)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    selectedSurahNumber === s.number
                      ? 'bg-[#047857] text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-emerald-50 text-stone-700'
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-70">{s.number}.</span>
                  <span>{s.namePhonetic}</span>
                  <span className="font-amiri text-xs font-normal">({s.nameArabic})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Surah Title Banner & Navigation - Emerald & Gold */}
          <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 rounded-3xl p-6 border-2 border-emerald-300 text-center space-y-3 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevSurah}
                disabled={selectedSurahNumber === 1}
                className="p-2 rounded-xl text-stone-600 hover:bg-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Précédente</span>
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-200">
                  Sourate N° {selectedSurah.number} · {selectedSurah.revelationPlace} · {selectedSurah.versesCount} versets
                </span>
                <h3 className="font-amiri text-3xl sm:text-4xl font-bold text-[#064e3b] mt-1">
                  سُورَةُ {selectedSurah.nameArabic}
                </h3>
                <h4 className="text-base font-bold text-stone-800">
                  {selectedSurah.namePhonetic} - {selectedSurah.nameFrench}
                </h4>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetMushafPage(SURAH_START_PAGES[selectedSurah.number] || 1);
                      setActiveViewMode('PAGES');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-black text-xs shadow-xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ouvrir la page {SURAH_START_PAGES[selectedSurah.number] || 1} dans le Mushaf</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextSurah}
                disabled={selectedSurahNumber === 114}
                className="p-2 rounded-xl text-stone-600 hover:bg-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 text-xs font-bold"
              >
                <span className="hidden sm:inline">Suivante</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bismillah */}
            {selectedSurahNumber !== 9 && (
              <div className="pt-3 border-t-2 border-emerald-100">
                <p className="font-amiri text-2xl sm:text-3xl text-emerald-950 font-bold leading-loose">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="text-xs text-stone-600 italic mt-0.5">
                  « Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux »
                </p>
              </div>
            )}
          </div>

          {/* Verses Reader Stream with Real-Time Audio Synchronized Highlight */}
          {isLoadingVerses ? (
            <div className="bg-white rounded-3xl p-12 border-2 border-emerald-100 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-stone-600">Chargement des versets de la sourate...</p>
            </div>
          ) : dynamicVerses.length > 0 ? (
            <div className="space-y-4">
              {dynamicVerses.map((v, idx) => {
                const isCurrentlyRecited = audioPlaybackMode === 'SYNC_VERSES' && activeAyahIndex === idx;
                return (
                  <div
                    key={v.verseNumber}
                    id={`verse-card-${idx}`}
                    className={`rounded-3xl p-6 transition-all duration-300 space-y-4 ${
                      isCurrentlyRecited
                        ? 'bg-[#ecfdf5] border-2 border-[#047857] shadow-xl ring-2 ring-emerald-400/30'
                        : 'bg-white border-2 border-stone-200/80 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    {/* Top verse number tag and Play button */}
                    <div className="flex items-center justify-between border-b border-emerald-100/80 pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => playVerse(idx)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                            isCurrentlyRecited && isPlaying
                              ? 'bg-[#047857] text-white shadow-md'
                              : 'bg-emerald-100 hover:bg-[#047857] hover:text-white text-emerald-950'
                          }`}
                          title="Écouter la récitation de ce verset"
                        >
                          {isCurrentlyRecited && isPlaying ? (
                            <Volume2 className="w-4 h-4 animate-pulse" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                          )}
                        </button>
                        <div>
                          <span className="font-mono text-xs font-black text-emerald-900 block">
                            Verset {v.verseNumber}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            sur {selectedSurah.versesCount}
                          </span>
                        </div>
                      </div>

                      {/* Recitation Status Badge */}
                      {isCurrentlyRecited ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-xs animate-pulse">
                          <Radio className="w-3.5 h-3.5" />
                          <span>Récitation en direct ({selectedReciter.nameFrench.replace('Cheikh ', '')})</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => playVerse(idx)}
                          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline decoration-dotted"
                        >
                          Écouter ce passage
                        </button>
                      )}
                    </div>

                    {/* Arabic text with Uthmani typography */}
                    <p
                      className={`font-amiri text-right font-bold leading-loose tracking-wide ${
                        isCurrentlyRecited ? 'text-[#064e3b]' : 'text-stone-900'
                      } ${
                        fontSizeClass === 'sm'
                          ? 'text-xl'
                          : fontSizeClass === 'lg'
                          ? 'text-2xl sm:text-3xl'
                          : 'text-3xl sm:text-4xl'
                      }`}
                    >
                      {v.arabic}
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-mono mr-2 align-middle ${
                          isCurrentlyRecited
                            ? 'border-emerald-600 bg-emerald-100 text-emerald-900 font-black'
                            : 'border-amber-400 text-amber-700'
                        }`}
                      >
                        {v.verseNumber}
                      </span>
                    </p>

                    {/* Phonetics */}
                    {showPhonetics && (
                      <p className="text-xs sm:text-sm text-[#064e3b] italic font-medium leading-relaxed bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                        {v.phonetic}
                      </p>
                    )}

                    {/* French Translation */}
                    {showTranslation && (
                      <p className="text-xs sm:text-sm text-stone-700 font-normal leading-relaxed pt-1">
                        {v.french}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback notice */
            <div className="bg-white rounded-3xl p-8 border-2 border-emerald-100 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-900 mx-auto flex items-center justify-center font-amiri text-2xl font-bold">
                {selectedSurah.number}
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-lg">
                  Sourate {selectedSurah.namePhonetic} ({selectedSurah.nameArabic})
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                  Cette sourate comporte <strong>{selectedSurah.versesCount} versets</strong> et a été révélée à <strong>{selectedSurah.revelationPlace}</strong>.
                  Vous pouvez écouter sa récitation intégrale ou ouvrir sa page dédiée dans le Mushaf.
                </p>
              </div>
              <button
                type="button"
                onClick={togglePlayAudio}
                className="px-5 py-2.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Mettre en pause' : 'Lancer la récitation audio'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DUAS TAB: Invocations Spéciales Hajj & Oumra */}
      {activeViewMode === 'DUAS' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 text-xs text-emerald-950 leading-relaxed font-medium">
            <strong>Invocations indispensables pour le Pèlerin :</strong> Répétez ces du'as authentiques transmises par le Messager d'Allah ﷺ durant vos étapes sacrées (Tawaf, Sa'i, Arafat, Mina et Muzdalifah).
          </div>

          <div className="space-y-4">
            {PILGRIMAGE_DUAS.map((dua, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border-2 border-emerald-100 shadow-sm space-y-4 hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-950 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <h3 className="font-black text-stone-900 text-sm">
                      {dua.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Recommandé
                  </span>
                </div>

                {/* Arabic text */}
                <p className="font-amiri text-right text-emerald-950 text-2xl font-bold leading-loose">
                  {dua.arabic}
                </p>

                {/* Phonetics */}
                <p className="text-xs sm:text-sm text-[#064e3b] italic font-medium leading-relaxed bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                  {dua.phonetic}
                </p>

                {/* French */}
                <p className="text-xs sm:text-sm text-stone-700 font-normal leading-relaxed">
                  {dua.french}
                </p>

                {/* Context moment */}
                <div className="pt-2 border-t border-emerald-100 flex items-center gap-2 text-[11px] text-stone-500">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span><strong>Moment propice :</strong> {dua.moment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reciter Selection Modal with Portraits */}
      {isReciterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-emerald-600 text-stone-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-2xl bg-white text-[#064e3b] font-bold shadow-sm">
                  <Volume2 className="w-5 h-5 text-[#064e3b]" />
                </span>
                <div>
                  <h3 className="font-black text-lg text-white">
                    Choix des Récitateurs du Saint Coran
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Sélectionnez la voix qui accompagnera votre écoute ({QURAN_RECITERS.length} imams et grands récitateurs)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReciterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 divide-y divide-emerald-100 bg-[#fbfdfb]">
              {QURAN_RECITERS.map((reciter) => {
                const isSelected = selectedReciter.id === reciter.id;
                return (
                  <div
                    key={reciter.id}
                    onClick={() => {
                      setSelectedReciter(reciter);
                      localStorage.setItem('eva_quran_reciter_id', reciter.id);
                      setIsReciterModalOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-300'
                        : 'bg-white hover:bg-emerald-50/60 border border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <ReciterAvatar reciter={reciter} size="md" isPlaying={isSelected && isPlaying} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-emerald-950">
                            {reciter.nameFrench}
                          </span>
                          {reciter.badge && (
                            <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              {reciter.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-amiri text-sm text-amber-700 font-bold mt-0.5">
                          {reciter.nameArabic}
                        </p>
                        <p className="text-[11px] text-stone-600 font-medium">
                          {reciter.origin} · {reciter.mosqueOrStyle}
                        </p>
                        {reciter.biography && (
                          <p className="text-[10px] text-stone-400 italic line-clamp-1 mt-0.5">
                            {reciter.biography}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs ${
                          isSelected
                            ? 'bg-[#047857] text-white'
                            : 'bg-stone-100 hover:bg-emerald-100 text-emerald-950 border border-stone-300'
                        }`}
                      >
                        {isSelected ? 'Sélectionné' : 'Choisir'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-emerald-50 border-t-2 border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
              <span>Récitations complètes disponibles pour les 114 sourates</span>
              <button
                type="button"
                onClick={() => setIsReciterModalOpen(false)}
                className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-xl shadow-xs"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
