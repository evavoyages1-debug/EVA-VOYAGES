import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  BookOpen,
  ListFilter,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  Radio,
  SkipForward,
  SkipBack,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  QURAN_RECITERS,
  Reciter,
  SURAH_START_PAGES,
  JUZ_DATA,
  getSurahForPage,
  getJuzForPage,
  getReciterAudioUrl,
  getAyahAudioUrl,
  getMushafPageImageUrl,
} from '../../data/quranMetadata';
import { ALL_SURAHS } from './HolyQuranReader';
import { ReciterAvatar } from './ReciterAvatar';

interface MushafPageReaderProps {
  initialPage?: number;
  onClose?: () => void;
  isModal?: boolean;
}

interface PageAyah {
  numberInSurah: number;
  surahNumber: number;
  surahNameArabic: string;
  surahNamePhonetic: string;
  arabicText: string;
  frenchText?: string;
}

export const MushafPageReader: React.FC<MushafPageReaderProps> = ({
  initialPage = 1,
  onClose,
  isModal = false,
}) => {
  // Page state (1 to 604)
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const saved = localStorage.getItem('eva_quran_last_page');
    return initialPage || (saved ? Number(saved) : 1);
  });

  const [savedBookmark, setSavedBookmark] = useState<number | null>(() => {
    const saved = localStorage.getItem('eva_quran_bookmark');
    return saved ? Number(saved) : null;
  });

  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  // Reciter state
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(() => {
    const savedId = localStorage.getItem('eva_quran_reciter_id');
    const found = QURAN_RECITERS.find((r) => r.id === savedId);
    return found || QURAN_RECITERS[0];
  });
  const [isReciterModalOpen, setIsReciterModalOpen] = useState(false);
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);

  // Audio Playback Mode: 'PAGE_VERSES' (Synchronized ayah-by-ayah with book passages) vs 'FULL_SURAH'
  const [audioMode, setAudioMode] = useState<'PAGE_VERSES' | 'FULL_SURAH'>('PAGE_VERSES');

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Verses of current page for synchronized reading
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [showPassagesPanel, setShowPassagesPanel] = useState<boolean>(true);
  const [autoTurnPage, setAutoTurnPage] = useState<boolean>(true);

  // Zoom & UI state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState<string>(String(currentPage));
  const [imageLoading, setImageLoading] = useState(true);

  // Derived information for current page
  const currentSurahNumber = getSurahForPage(currentPage);
  const currentJuzNumber = getJuzForPage(currentPage);
  const currentSurah = ALL_SURAHS.find((s) => s.number === currentSurahNumber) || ALL_SURAHS[0];
  const currentJuz = JUZ_DATA.find((j) => j.juz === currentJuzNumber) || JUZ_DATA[0];

  // Save current page to history
  useEffect(() => {
    localStorage.setItem('eva_quran_last_page', String(currentPage));
    setPageInput(String(currentPage));
    setImageLoading(true);
    setCurrentAyahIndex(0);
  }, [currentPage]);

  // Fetch Ayahs for the current Mushaf page for real-time passage synchronization
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingAyahs(true);

    const fetchPageAyahs = async () => {
      try {
        const [arabicRes, frenchRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`).then((r) =>
            r.ok ? r.json() : null
          ),
          fetch(`https://api.alquran.cloud/v1/page/${currentPage}/fr.hamidullah`).then((r) =>
            r.ok ? r.json() : null
          ),
        ]);

        if (isCancelled) return;

        if (arabicRes?.data?.ayahs) {
          const frenchAyahs = frenchRes?.data?.ayahs || [];
          const mapped: PageAyah[] = arabicRes.data.ayahs.map((a: any, idx: number) => ({
            numberInSurah: a.numberInSurah,
            surahNumber: a.surah.number,
            surahNameArabic: a.surah.name,
            surahNamePhonetic: a.surah.englishName,
            arabicText: a.text,
            frenchText: frenchAyahs[idx]?.text || '',
          }));
          setPageAyahs(mapped);
          setIsLoadingAyahs(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch page ayahs from API, fallback to default surah', err);
      }

      if (isCancelled) return;

      // Local fallback for page 1 (Al-Fatiha) and others
      if (currentPage === 1) {
        setPageAyahs([
          { numberInSurah: 1, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', frenchText: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.' },
          { numberInSurah: 2, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', frenchText: 'Louange à Allah, Seigneur de l\'univers.' },
          { numberInSurah: 3, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'الرَّحْمَٰنِ الرَّحِيمِ', frenchText: 'Le Tout Miséricordieux, le Très Miséricordieux,' },
          { numberInSurah: 4, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'مَالِكِ يَوْمِ الدِّينِ', frenchText: 'Maître du Jour de la rétribution.' },
          { numberInSurah: 5, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', frenchText: 'C\'est Toi [Seul] que nous adorons, et c\'est Toi [Seul] dont nous implorons secours.' },
          { numberInSurah: 6, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', frenchText: 'Guide-nous dans le droit chemin,' },
          { numberInSurah: 7, surahNumber: 1, surahNameArabic: 'الفَاتِحَة', surahNamePhonetic: 'Al-Fatiha', arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', frenchText: 'le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.' },
        ]);
      } else {
        setPageAyahs([
          {
            numberInSurah: 1,
            surahNumber: currentSurahNumber,
            surahNameArabic: currentSurah.nameArabic,
            surahNamePhonetic: currentSurah.namePhonetic,
            arabicText: `Passage de la Sourate ${currentSurah.nameArabic} (Page ${currentPage})`,
            frenchText: `Récitation de la page ${currentPage} du Saint Coran par ${selectedReciter.nameFrench}.`,
          },
        ]);
      }
      setIsLoadingAyahs(false);
    };

    fetchPageAyahs();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, currentSurahNumber, selectedReciter.nameFrench]);

  // Current active audio source
  const currentAyah = pageAyahs[currentAyahIndex];
  const audioSrc =
    audioMode === 'PAGE_VERSES' && currentAyah
      ? getAyahAudioUrl(selectedReciter, currentAyah.surahNumber, currentAyah.numberInSurah)
      : getReciterAudioUrl(selectedReciter, currentSurahNumber);

  // Reload audio when source changes
  useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying;
      audioRef.current.pause();
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [audioSrc]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayAudio();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isPlaying]);

  const handleNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleGoToPage = (target: number) => {
    const clean = Math.min(604, Math.max(1, target));
    setCurrentPage(clean);
  };

  const handleSaveBookmark = () => {
    localStorage.setItem('eva_quran_bookmark', String(currentPage));
    setSavedBookmark(currentPage);
    setBookmarkToast(`Marque-page enregistré à la page ${currentPage}`);
    setTimeout(() => setBookmarkToast(null), 3000);
  };

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

  // When an individual Ayah ends in PAGE_VERSES mode, smoothly advance to the next Ayah!
  const handleAudioEnded = () => {
    if (audioMode === 'PAGE_VERSES') {
      if (currentAyahIndex < pageAyahs.length - 1) {
        setCurrentAyahIndex((prev) => prev + 1);
        setIsPlaying(true);
      } else {
        // End of current page! If autoTurnPage is active, turn page and continue reading!
        if (autoTurnPage && currentPage < 604) {
          setCurrentPage((prev) => prev + 1);
          setCurrentAyahIndex(0);
          setIsPlaying(true);
        } else {
          setIsPlaying(false);
        }
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playSpecificAyah = (index: number) => {
    setAudioMode('PAGE_VERSES');
    setCurrentAyahIndex(index);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }, 50);
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((i) => i - 1);
      setIsPlaying(true);
    } else if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextAyah = () => {
    if (currentAyahIndex < pageAyahs.length - 1) {
      setCurrentAyahIndex((i) => i + 1);
      setIsPlaying(true);
    } else if (currentPage < 604) {
      setCurrentPage((p) => p + 1);
      setCurrentAyahIndex(0);
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

  return (
    <div
      className={`bg-white text-stone-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-800/30 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* TOP BARRE DU SAINT CORAN - GREEN & WHITE THEME */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] text-white px-4 py-3.5 border-b-2 border-emerald-600/40 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        {/* Left: Title & Page / Surah Information */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#064e3b] flex items-center justify-center font-bold shadow-md shrink-0 border border-emerald-300">
            <BookOpen className="w-5 h-5 text-[#064e3b]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Mushaf de Médine · المصحف الشريف
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/20 text-white font-extrabold border border-white/30">
                Juz {currentJuz.juz}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm sm:text-base font-black text-white">
                Page {currentPage} / 604
              </h2>
              <span className="text-emerald-300">·</span>
              <span className="text-sm font-bold text-amber-200 font-amiri">
                {currentSurah.nameArabic}
              </span>
              <span className="text-xs text-emerald-100 hidden sm:inline">
                ({currentSurah.namePhonetic})
              </span>
            </div>
          </div>
        </div>

        {/* Center: Quick Page Navigator Input & Jump */}
        <div className="flex items-center gap-1.5 bg-emerald-950/60 p-1 rounded-2xl border border-emerald-500/40 shadow-inner">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-xl hover:bg-emerald-800 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Page précédente (Page de droite dans le Coran)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGoToPage(Number(pageInput));
            }}
            className="flex items-center gap-1 px-1"
          >
            <span className="text-[11px] text-emerald-200 font-semibold hidden xs:inline">Page :</span>
            <input
              type="number"
              min={1}
              max={604}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => handleGoToPage(Number(pageInput))}
              className="w-14 text-center font-mono font-bold text-xs bg-white border border-emerald-400 rounded-lg py-1 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-[11px] text-emerald-200 font-mono">/ 604</span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= 604}
            className="p-1.5 rounded-xl hover:bg-emerald-800 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Page suivante (Page de gauche dans le Coran)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions: Sommaire / Reciter / Bookmark / Zoom / Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Sommaire / Index button */}
          <button
            type="button"
            onClick={() => setIsIndexModalOpen(true)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors"
            title="Index des 114 Sourates & 30 Juz"
          >
            <ListFilter className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Index / Sommaire</span>
          </button>

          {/* Reciter Avatar & Quick Switch Button */}
          <button
            type="button"
            onClick={() => setIsReciterModalOpen(true)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-950 rounded-2xl text-xs font-bold border-2 border-emerald-300 flex items-center gap-2 transition-all shadow-sm group"
            title="Choisir le récitateur du Coran avec portrait photo"
          >
            <ReciterAvatar reciter={selectedReciter} size="xs" isPlaying={isPlaying} />
            <span className="max-w-[100px] sm:max-w-[130px] truncate font-extrabold text-[#064e3b]">
              {selectedReciter.nameFrench.replace('Cheikh ', '')}
            </span>
            <span className="text-[10px] text-amber-600 font-bold hidden md:inline">
              (Changer)
            </span>
          </button>

          {/* Bookmark button */}
          <button
            type="button"
            onClick={handleSaveBookmark}
            className={`p-2 rounded-xl border transition-colors ${
              savedBookmark === currentPage
                ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-sm font-bold'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title={
              savedBookmark === currentPage
                ? 'Marque-page enregistré à cette page'
                : 'Mémoriser cette page comme marque-page'
            }
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Toggle synchronized passages panel */}
          <button
            type="button"
            onClick={() => setShowPassagesPanel(!showPassagesPanel)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
              showPassagesPanel
                ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-xs'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
            title="Afficher/masquer les passages récités sur le livre"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Passages synchronisés</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-white/10 rounded-xl border border-white/20 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1 text-emerald-100 hover:text-white"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-1 text-[10px] font-mono font-bold text-white hover:text-amber-200"
              title="Réinitialiser zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
              className="p-1 text-emerald-100 hover:text-white"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 hidden sm:block"
            title={isFullscreen ? 'Quitter plein écran' : 'Mode Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close button if in modal */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-stone-100 rounded-xl text-xs font-bold"
            >
              Fermer ✕
            </button>
          )}
        </div>
      </div>

      {/* AUDIO PLAYER BAR - CRISP WHITE & EMERALD GREEN THEME */}
      <div className="bg-[#f0fdf4] px-4 py-3 border-b-2 border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Reciter Photo Portrait in Player */}
          <div
            onClick={() => setIsReciterModalOpen(true)}
            className="cursor-pointer group flex items-center gap-2.5"
            title="Changer de récitateur"
          >
            <ReciterAvatar reciter={selectedReciter} size="md" isPlaying={isPlaying} />
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider truncate">
                  Récitateur : {selectedReciter.nameFrench}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-stone-900 font-extrabold text-xs sm:text-sm truncate">
                {audioMode === 'PAGE_VERSES' && currentAyah ? (
                  <span>
                    Verset {currentAyah.numberInSurah} · Sourate {currentAyah.surahNamePhonetic} ({currentAyah.surahNameArabic})
                  </span>
                ) : (
                  <span>
                    Sourate {currentSurah.number}. {currentSurah.namePhonetic} ({currentSurah.nameArabic})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlayAudio}
            className="w-10 h-10 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white flex items-center justify-center shrink-0 shadow-md font-bold transition-transform active:scale-95 cursor-pointer ml-auto md:ml-2"
            title={isPlaying ? 'Pause' : 'Écouter'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            )}
          </button>
        </div>

        {/* Audio Mode Switcher (Verset par verset synchronisé vs Sourate intégrale) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-emerald-200 text-[11px] font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              setAudioMode('PAGE_VERSES');
              setIsPlaying(true);
            }}
            className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
              audioMode === 'PAGE_VERSES'
                ? 'bg-[#047857] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-emerald-900'
            }`}
            title="Lecture synchronisée verset par verset avec surlignage sur le livre"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Verset par verset (Sync)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAudioMode('FULL_SURAH');
              setIsPlaying(true);
            }}
            className={`px-2.5 py-1 rounded-xl transition-all ${
              audioMode === 'FULL_SURAH'
                ? 'bg-[#047857] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-emerald-900'
            }`}
            title="Écouter la sourate entière d'une traite"
          >
            Sourate complète
          </button>
        </div>

        {/* Verse by verse controls if in PAGE_VERSES mode */}
        {audioMode === 'PAGE_VERSES' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevAyah}
              className="p-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300"
              title="Verset précédent"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-950">
              {currentAyahIndex + 1} / {pageAyahs.length || 1}
            </span>
            <button
              type="button"
              onClick={handleNextAyah}
              className="p-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300"
              title="Verset suivant"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Audio Scrubber */}
        <div className="flex-1 w-full max-w-xs flex items-center gap-2 font-mono text-[11px] text-stone-600">
          <span>{formatAudioTime(audioProgress)}</span>
          <input
            type="range"
            min="0"
            max={audioDuration || 100}
            value={audioProgress}
            onChange={handleSeek}
            className="flex-1 accent-[#047857] h-1.5 rounded-lg bg-emerald-200 cursor-pointer"
          />
          <span>{formatAudioTime(audioDuration)}</span>
        </div>

        {/* Reciter modal shortcut */}
        <button
          type="button"
          onClick={() => setIsReciterModalOpen(true)}
          className="text-[11px] text-emerald-800 hover:text-emerald-950 font-extrabold underline decoration-emerald-400 hidden lg:inline shrink-0"
        >
          {QURAN_RECITERS.length} Récitateurs avec portraits 🎙️
        </button>
      </div>

      {/* Bookmark notification toast */}
      {bookmarkToast && (
        <div className="bg-[#047857] text-white text-xs font-bold py-2 px-4 text-center animate-in fade-in flex items-center justify-center gap-2 shadow-sm">
          <Bookmark className="w-3.5 h-3.5" />
          <span>{bookmarkToast}</span>
        </div>
      )}

      {/* MAIN MUSHAF PAGE CANVAS - SERENE IVORY & EMERALD AMBIANCE */}
      <div className="relative flex-1 min-h-[580px] bg-[#f8faf8] flex flex-col lg:flex-row items-center justify-center p-2 sm:p-6 overflow-auto gap-6">
        {/* Previous page arrow click zone on the right (Arabic reading order) */}
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-white/95 hover:bg-[#047857] hover:text-white border-2 border-emerald-500 text-emerald-800 flex items-center justify-center shadow-lg backdrop-blur-md transition-all hover:scale-110 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          title="Page précédente (Tourner à droite)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Next page arrow click zone on the left (Arabic reading order) */}
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage >= 604}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-white/95 hover:bg-[#047857] hover:text-white border-2 border-emerald-500 text-emerald-800 flex items-center justify-center shadow-lg backdrop-blur-md transition-all hover:scale-110 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
          title="Page suivante (Tourner à gauche)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Central Mushaf Page Container with authentic Emerald & Gold Islamic border */}
        <div
          className="relative transition-transform duration-200 ease-out max-w-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          {/* Authentic Emerald & Gold Frame wrapper */}
          <div className="p-1.5 sm:p-2.5 bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#064e3b] rounded-3xl shadow-2xl border-2 border-amber-400/40">
            <div className="bg-[#fffdf7] text-stone-900 rounded-2xl overflow-hidden p-2 sm:p-4 border-2 border-[#caa446] shadow-inner relative flex flex-col items-center">
              {/* Header inside the Mushaf Page: Juz and Hizb information */}
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-[#064e3b] border-b-2 border-emerald-100 pb-2 mb-2 font-amiri">
                <span className="font-bold">{currentJuz.nameArabic} (الجزء {currentJuz.juz})</span>
                <span className="font-sans font-black text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 uppercase border border-emerald-200">
                  Page {currentPage}
                </span>
                <span className="font-bold">سُورَةُ {currentSurah.nameArabic}</span>
              </div>

              {/* Scanned authentic Medina Mushaf Page Image */}
              <div className="relative min-w-[280px] sm:min-w-[420px] md:min-w-[480px] max-w-[620px] aspect-[1/1.5] flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-xs">
                {imageLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fffdf7] z-10 space-y-2">
                    <div className="w-10 h-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
                    <span className="text-xs font-bold text-emerald-900 font-amiri">
                      جاري تحميل الصفحة {currentPage} من المصحف الشريف...
                    </span>
                  </div>
                )}
                <img
                  src={getMushafPageImageUrl(currentPage)}
                  alt={`Saint Coran Page ${currentPage} - Sourate ${currentSurah.nameArabic}`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  className="w-full h-auto object-contain select-none"
                  draggable={false}
                />
              </div>

              {/* Footer inside the Mushaf Page */}
              <div className="w-full flex items-center justify-between text-[10px] text-emerald-900 font-bold border-t-2 border-emerald-100 pt-2 mt-2">
                <span>EVA Voyages · Hajj & Oumra</span>
                <span className="font-mono font-black text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                  {currentPage}
                </span>
                <span>{currentSurah.revelationPlace}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDE / BOTTOM SYNCHRONIZED PASSAGES HUD (Lecture synchronisée avec le livre) */}
        {showPassagesPanel && (
          <div className="w-full lg:w-96 bg-white rounded-3xl p-5 border-2 border-emerald-600/30 shadow-xl space-y-4 max-h-[620px] flex flex-col">
            {/* Header of the Passages HUD */}
            <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Radio className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-emerald-950">
                    Passages Récités sur le Livre
                  </h3>
                  <p className="text-[10px] text-stone-500 font-medium">
                    {pageAyahs.length} verset(s) présents sur la page {currentPage}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Direct Sync 🎙️
              </span>
            </div>

            {/* Currently Active Ayah Live Callout */}
            {currentAyah && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-[#ecfdf5] border-2 border-emerald-400 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-black text-emerald-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Verset {currentAyah.numberInSurah} ({currentAyah.surahNamePhonetic})
                  </span>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">
                    En récitation
                  </span>
                </div>
                <p className="font-amiri text-right text-emerald-950 text-xl font-bold leading-loose">
                  {currentAyah.arabicText}
                </p>
                {currentAyah.frenchText && (
                  <p className="text-xs text-stone-700 italic border-t border-emerald-200/60 pt-2">
                    « {currentAyah.frenchText} »
                  </p>
                )}
              </div>
            )}

            {/* List of Ayahs on this page with instant click-to-play */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-emerald-50">
              {isLoadingAyahs ? (
                <div className="py-8 text-center text-xs text-stone-500 space-y-2">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                  <span>Chargement des passages de la page...</span>
                </div>
              ) : (
                pageAyahs.map((ayah, idx) => {
                  const isCurrent = currentAyahIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => playSpecificAyah(idx)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-2.5 ${
                        isCurrent
                          ? 'bg-[#047857] text-white shadow-md ring-2 ring-emerald-300'
                          : 'bg-stone-50 hover:bg-emerald-50/70 text-stone-800 border border-stone-200/80'
                      }`}
                    >
                      <button
                        type="button"
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isCurrent
                            ? 'bg-white text-emerald-900 shadow-xs'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                        title="Écouter ce passage"
                      >
                        {isCurrent && isPlaying ? (
                          <Volume2 className="w-4 h-4 animate-pulse text-emerald-700" />
                        ) : (
                          <span>{ayah.numberInSurah}</span>
                        )}
                      </button>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold ${
                              isCurrent ? 'text-amber-200' : 'text-emerald-800'
                            }`}
                          >
                            Verset {ayah.numberInSurah}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-white/20 text-white">
                              Actif
                            </span>
                          )}
                        </div>
                        <p
                          className={`font-amiri text-right text-base font-bold leading-normal mt-1 truncate ${
                            isCurrent ? 'text-white' : 'text-stone-900'
                          }`}
                        >
                          {ayah.arabicText}
                        </p>
                        {ayah.frenchText && (
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isCurrent ? 'text-emerald-100' : 'text-stone-500'
                            }`}
                          >
                            {ayah.frenchText}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom HUD Option: Auto-turn page toggle */}
            <div className="pt-2 border-t-2 border-emerald-100 flex items-center justify-between text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={autoTurnPage}
                  onChange={(e) => setAutoTurnPage(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-[#047857]"
                />
                <span>Tourner la page automatiquement</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassagesPanel(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                Masquer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM QUICK ACTIONS & NAVIGATION FOOTER */}
      <div className="bg-white px-4 py-3 border-t-2 border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Saved bookmark shortcut */}
        <div className="flex items-center gap-2">
          {savedBookmark ? (
            <button
              type="button"
              onClick={() => handleGoToPage(savedBookmark)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 font-bold transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span>Aller au marque-page (Page {savedBookmark})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveBookmark}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center gap-1.5 font-bold transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-stone-500" />
              <span>Marquer cette page</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleGoToPage(1)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-950 font-bold transition-colors"
            title="Revenir au début (Al-Fatiha)"
          >
            Début (p. 1)
          </button>
          <button
            type="button"
            onClick={() => handleGoToPage(604)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-950 font-bold transition-colors"
            title="Aller à la dernière page (An-Nas)"
          >
            Fin (p. 604)
          </button>
        </div>

        {/* Quick jump to Surah start page */}
        <div className="flex items-center gap-2">
          <span className="text-stone-600 font-bold hidden sm:inline">Aller à la Sourate :</span>
          <select
            value={currentSurahNumber}
            onChange={(e) => {
              const surahNum = Number(e.target.value);
              const startPage = SURAH_START_PAGES[surahNum] || 1;
              handleGoToPage(startPage);
            }}
            className="bg-white text-emerald-950 border-2 border-emerald-300 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#047857] max-w-[220px]"
          >
            {ALL_SURAHS.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.namePhonetic} ({s.nameArabic}) - p.{SURAH_START_PAGES[s.number]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MODAL 1: CHOIX DES RÉCITATEURS DU CORAN AVEC PORTRAITS PHOTOS */}
      {isReciterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-emerald-600 text-stone-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
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
                    Sélectionnez la voix qui accompagnera votre lecture et vos prières ({QURAN_RECITERS.length} grands récitateurs)
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

            {/* Reciter list with real photo portraits */}
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
                      {/* Reciter Photo Portrait */}
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

            {/* Modal Footer */}
            <div className="p-4 bg-emerald-50 border-t-2 border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-bold">
              <span>Flux audio haute fidélité synchronisé avec les passages</span>
              <button
                type="button"
                onClick={() => setIsReciterModalOpen(false)}
                className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-xl shadow-xs"
              >
                Valider le choix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INDEX COMPLET DES SOURATES ET JUZ */}
      {isIndexModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-emerald-600 text-stone-900 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg text-white">
                  Index du Saint Coran (114 Sourates & 30 Juz)
                </h3>
                <p className="text-xs text-emerald-100">
                  Accédez instantanément à n'importe quelle Sourate ou Juz du Mushaf
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsIndexModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content: 30 Juz quick grid & 114 Surahs list */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1 bg-[#fbfdfb]">
              {/* Section 1: Les 30 Juz */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#064e3b] mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  Les 30 Juz (Ajzaa) du Saint Coran
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {JUZ_DATA.map((j) => (
                    <button
                      key={j.juz}
                      type="button"
                      onClick={() => {
                        handleGoToPage(j.startPage);
                        setIsIndexModalOpen(false);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                        currentJuz.juz === j.juz
                          ? 'bg-emerald-100 border-[#047857] text-[#064e3b] font-bold shadow-xs'
                          : 'bg-white hover:bg-emerald-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800">
                        <span>Juz {j.juz}</span>
                        <span>p. {j.startPage}</span>
                      </div>
                      <div className="font-amiri font-bold text-xs truncate mt-0.5 text-[#064e3b]">
                        {j.nameArabic}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Les 114 Sourates */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#064e3b] mb-2.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  Les 114 Sourates par page
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_SURAHS.map((s) => {
                    const startPage = SURAH_START_PAGES[s.number] || 1;
                    const isCurrent = currentSurah.number === s.number;
                    return (
                      <button
                        key={s.number}
                        type="button"
                        onClick={() => {
                          handleGoToPage(startPage);
                          setIsIndexModalOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-emerald-100 border-[#047857] text-[#064e3b] font-bold shadow-xs'
                            : 'bg-white hover:bg-emerald-50 border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-emerald-800 font-bold">
                              {s.number}.
                            </span>
                            <span className="text-xs font-bold text-stone-900 truncate">
                              {s.namePhonetic}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-500 block truncate">
                            {s.nameFrench}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-amiri text-xs font-bold block text-emerald-900">
                            {s.nameArabic}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            p. {startPage}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
