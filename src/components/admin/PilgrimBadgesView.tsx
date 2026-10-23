import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PilgrimDossier, BadgeSettings } from '../../types';
import {
  IdCard,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Phone,
  User,
  Check,
  X,
  LayoutGrid,
  List,
  RefreshCw,
  Building2,
  Sparkles,
  Edit3,
  RotateCcw,
  Sliders,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Hotel,
  Tag,
} from 'lucide-react';
import {
  generateSingleBadgePdf,
  generateBatchBadgesPdf,
  formatSpacedTitle,
} from '../../utils/generatePilgrimBadgePdf';

type BadgeSortOption =
  | 'NOM_ASC'
  | 'NOM_DESC'
  | 'HOTEL_MEDINE_ASC'
  | 'HOTEL_MEDINE_DESC'
  | 'HOTEL_MAKKAH_ASC'
  | 'HOTEL_MAKKAH_DESC'
  | 'DATE_DESC';

export const PilgrimBadgesView: React.FC = () => {
  const {
    dossiers,
    packages,
    agencyConfig,
    badgeSettings,
    updateBadgeSettings,
    updateDossierBadgeSettings,
    applyBadgeHotelsToAll,
    applyBadgeHotelsToDossiers,
  } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedPkgFilter, setSelectedPkgFilter] = useState<string>('ALL');
  const [photoFilter, setPhotoFilter] = useState<'ALL' | 'WITH_PHOTO' | 'WITHOUT_PHOTO'>('ALL');
  const [selectedHotelMedineFilter, setSelectedHotelMedineFilter] = useState<string>('ALL');
  const [selectedHotelMakkahFilter, setSelectedHotelMakkahFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<BadgeSortOption>('NOM_ASC');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Selected dossiers for selective batch actions
  const [selectedDossierIds, setSelectedDossierIds] = useState<string[]>([]);

  // Preview / edit modal for a single badge
  const [previewDossier, setPreviewDossier] = useState<PilgrimDossier | null>(null);
  const [modalHotelMedine, setModalHotelMedine] = useState<string>('');
  const [modalHotelMakkah, setModalHotelMakkah] = useState<string>('');
  const [modalBadgeTitle, setModalBadgeTitle] = useState<string>('');

  // Top customization panel state
  const [isPanelExpanded, setIsPanelExpanded] = useState<boolean>(true);
  const [localHotelMedine, setLocalHotelMedine] = useState<string>(badgeSettings.hotelMedine || 'THE BILTMORE');
  const [localHotelMakkah, setLocalHotelMakkah] = useState<string>(badgeSettings.hotelMakkah || 'ROTANA');
  const [localBadgeTitle, setLocalBadgeTitle] = useState<string>(badgeSettings.badgeTitle || 'OUMRAH GAMOU 2026 VIP');
  const [localPhoneSenegal, setLocalPhoneSenegal] = useState<string>(badgeSettings.phoneSenegal || '+221 77 168 93 93 - 77 639 07 18');
  const [localPhoneSaudi, setLocalPhoneSaudi] = useState<string>(badgeSettings.phoneSaudi || '0543625106');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Quick selective assignment drawer / bar state
  const [selectiveHotelMedine, setSelectiveHotelMedine] = useState<string>('THE BILTMORE');
  const [selectiveHotelMakkah, setSelectiveHotelMakkah] = useState<string>('ROTANA');

  // Loading states for PDF downloads
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [generatingDossierId, setGeneratingDossierId] = useState<string | null>(null);

  // Sync local inputs when badgeSettings change
  React.useEffect(() => {
    setLocalHotelMedine(badgeSettings.hotelMedine);
    setLocalHotelMakkah(badgeSettings.hotelMakkah);
    setLocalBadgeTitle(badgeSettings.badgeTitle);
    setLocalPhoneSenegal(badgeSettings.phoneSenegal);
    setLocalPhoneSaudi(badgeSettings.phoneSaudi);
    setSelectiveHotelMedine(badgeSettings.hotelMedine || 'THE BILTMORE');
    setSelectiveHotelMakkah(badgeSettings.hotelMakkah || 'ROTANA');
  }, [badgeSettings]);

  // Helper: resolve hotel names for a given dossier
  const getDossierHotels = (dossier: PilgrimDossier): { medine: string; makkah: string; title: string; isCustom: boolean } => {
    const pkg = packages.find((p) => p.id === dossier.packageId);
    const hasCustom = Boolean(dossier.badgeSettings?.hotelMedine || dossier.badgeSettings?.hotelMakkah);
    const medine = (
      dossier.badgeSettings?.hotelMedine ||
      pkg?.hotelMedina?.name ||
      badgeSettings.hotelMedine ||
      'THE BILTMORE'
    ).trim().toUpperCase();
    const makkah = (
      dossier.badgeSettings?.hotelMakkah ||
      pkg?.hotelMakkah?.name ||
      badgeSettings.hotelMakkah ||
      'ROTANA'
    ).trim().toUpperCase();
    const title = (
      dossier.badgeSettings?.badgeTitle ||
      dossier.packageSnapshot?.title ||
      badgeSettings.badgeTitle ||
      'OUMRAH GAMOU 2026 VIP'
    ).trim().toUpperCase();
    return { medine, makkah, title, isCustom: hasCustom };
  };

  // Compute unique Médine hotels across all dossiers with counts
  const uniqueHotelsMedine = useMemo(() => {
    const map = new Map<string, number>();
    dossiers.forEach((d) => {
      const h = getDossierHotels(d).medine;
      map.set(h, (map.get(h) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [dossiers, packages, badgeSettings]);

  // Compute unique Maakkah hotels across all dossiers with counts
  const uniqueHotelsMakkah = useMemo(() => {
    const map = new Map<string, number>();
    dossiers.forEach((d) => {
      const h = getDossierHotels(d).makkah;
      map.set(h, (map.get(h) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [dossiers, packages, badgeSettings]);

  // Filtered & Sorted dossiers list
  const filteredAndSortedDossiers = useMemo(() => {
    // 1. Filter
    const filtered = dossiers.filter((d) => {
      const hotels = getDossierHotels(d);

      // Search filter
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        d.personalInfo.lastName.toLowerCase().includes(q) ||
        d.personalInfo.firstName.toLowerCase().includes(q) ||
        d.personalInfo.phone.toLowerCase().includes(q) ||
        d.trackingCode.toLowerCase().includes(q) ||
        hotels.medine.toLowerCase().includes(q) ||
        hotels.makkah.toLowerCase().includes(q) ||
        (d.personalInfo.passportNumber && d.personalInfo.passportNumber.toLowerCase().includes(q));

      // Package filter
      const matchPkg = selectedPkgFilter === 'ALL' || d.packageId === selectedPkgFilter;

      // Photo filter
      const hasPhoto = Boolean(d.documents.photo?.fileUrl);
      const matchPhoto =
        photoFilter === 'ALL' ||
        (photoFilter === 'WITH_PHOTO' && hasPhoto) ||
        (photoFilter === 'WITHOUT_PHOTO' && !hasPhoto);

      // Hotel Médine filter
      const matchHotelMedine =
        selectedHotelMedineFilter === 'ALL' || hotels.medine === selectedHotelMedineFilter;

      // Hotel Maakkah filter
      const matchHotelMakkah =
        selectedHotelMakkahFilter === 'ALL' || hotels.makkah === selectedHotelMakkahFilter;

      return matchSearch && matchPkg && matchPhoto && matchHotelMedine && matchHotelMakkah;
    });

    // 2. Sort
    return [...filtered].sort((a, b) => {
      const hotelsA = getDossierHotels(a);
      const hotelsB = getDossierHotels(b);

      switch (sortBy) {
        case 'NOM_ASC':
          return `${a.personalInfo.lastName} ${a.personalInfo.firstName}`.localeCompare(
            `${b.personalInfo.lastName} ${b.personalInfo.firstName}`
          );
        case 'NOM_DESC':
          return `${b.personalInfo.lastName} ${b.personalInfo.firstName}`.localeCompare(
            `${a.personalInfo.lastName} ${a.personalInfo.firstName}`
          );
        case 'HOTEL_MEDINE_ASC':
          return (
            hotelsA.medine.localeCompare(hotelsB.medine) ||
            a.personalInfo.lastName.localeCompare(b.personalInfo.lastName)
          );
        case 'HOTEL_MEDINE_DESC':
          return (
            hotelsB.medine.localeCompare(hotelsA.medine) ||
            a.personalInfo.lastName.localeCompare(b.personalInfo.lastName)
          );
        case 'HOTEL_MAKKAH_ASC':
          return (
            hotelsA.makkah.localeCompare(hotelsB.makkah) ||
            a.personalInfo.lastName.localeCompare(b.personalInfo.lastName)
          );
        case 'HOTEL_MAKKAH_DESC':
          return (
            hotelsB.makkah.localeCompare(hotelsA.makkah) ||
            a.personalInfo.lastName.localeCompare(b.personalInfo.lastName)
          );
        case 'DATE_DESC':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [
    dossiers,
    packages,
    badgeSettings,
    search,
    selectedPkgFilter,
    photoFilter,
    selectedHotelMedineFilter,
    selectedHotelMakkahFilter,
    sortBy,
  ]);

  // Statistics
  const withPhotoCount = dossiers.filter((d) => Boolean(d.documents.photo?.fileUrl)).length;
  const withoutPhotoCount = dossiers.length - withPhotoCount;

  // Toggle selection
  const toggleSelectDossier = (id: string) => {
    setSelectedDossierIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedDossierIds.length === filteredAndSortedDossiers.length) {
      setSelectedDossierIds([]);
    } else {
      setSelectedDossierIds(filteredAndSortedDossiers.map((d) => d.id));
    }
  };

  // Selective action: Apply hotel(s) ONLY to selected badges without touching others
  const handleApplyToSelectedOnly = () => {
    if (selectedDossierIds.length === 0) {
      alert('Veuillez sélectionner au moins un badge à modifier.');
      return;
    }
    applyBadgeHotelsToDossiers(selectedDossierIds, selectiveHotelMedine, selectiveHotelMakkah);
    setSaveToast(
      `Hôtels appliqués avec succès à ${selectedDossierIds.length} badge(s) sélectionné(s) uniquement (les autres badges restent inchangés) !`
    );
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Global action: Apply hotels to ALL dossiers (explicitly confirmed)
  const handleApplyHotelsGlobally = () => {
    const confirm = window.confirm(
      `Attention : Vous êtes sur le point d'appliquer l'Hôtel Médine "${localHotelMedine}" et l'Hôtel Maakkah "${localHotelMakkah}" à l'ENSEMBLE des ${dossiers.length} pèlerins de l'agence.\n\nSouhaitez-vous continuer ?`
    );
    if (!confirm) return;

    applyBadgeHotelsToAll(localHotelMedine, localHotelMakkah);
    updateBadgeSettings({
      badgeTitle: localBadgeTitle,
      phoneSenegal: localPhoneSenegal,
      phoneSaudi: localPhoneSaudi,
    });
    setSaveToast(`Paramètres appliqués globalement à l'ensemble des ${dossiers.length} badges !`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Reset to the exact CamScanner scanned model defaults
  const handleResetToScanDefaults = () => {
    setLocalHotelMedine('THE BILTMORE');
    setLocalHotelMakkah('ROTANA');
    setLocalBadgeTitle('OUMRAH GAMOU 2026 VIP');
    setLocalPhoneSenegal('+221 77 168 93 93 - 77 639 07 18');
    setLocalPhoneSaudi('0543625106');
    setSelectiveHotelMedine('THE BILTMORE');
    setSelectiveHotelMakkah('ROTANA');
    applyBadgeHotelsToAll('THE BILTMORE', 'ROTANA');
    updateBadgeSettings({
      badgeTitle: 'OUMRAH GAMOU 2026 VIP',
      phoneSenegal: '+221 77 168 93 93 - 77 639 07 18',
      phoneSaudi: '0543625106',
    });
    setSaveToast('Valeurs réinitialisées sur le modèle scanné CamScanner (The Biltmore / Rotana).');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Download Single Badge PDF
  const handleDownloadSingle = async (dossier: PilgrimDossier, customOverride?: Partial<BadgeSettings>) => {
    try {
      setGeneratingDossierId(dossier.id);
      const dossierHotels = getDossierHotels(dossier);
      const settingsToUse: Partial<BadgeSettings> = {
        hotelMedine: customOverride?.hotelMedine || dossierHotels.medine,
        hotelMakkah: customOverride?.hotelMakkah || dossierHotels.makkah,
        badgeTitle: customOverride?.badgeTitle || dossierHotels.title,
        phoneSenegal: localPhoneSenegal,
        phoneSaudi: localPhoneSaudi,
        forceOverride: Boolean(customOverride),
      };
      await generateSingleBadgePdf(dossier, agencyConfig, true, settingsToUse);
    } catch (err) {
      console.error('Error generating single badge PDF', err);
      alert('Erreur lors de la génération du badge PDF.');
    } finally {
      setGeneratingDossierId(null);
    }
  };

  // Download Batch Badges PDF (Selective or Filtered without touching other badges)
  const handleDownloadBatch = async (selectedOnly: boolean = false) => {
    const targetDossiers = selectedOnly
      ? dossiers.filter((d) => selectedDossierIds.includes(d.id))
      : filteredAndSortedDossiers;

    if (targetDossiers.length === 0) {
      alert('Aucun pèlerin sélectionné pour la génération des badges.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      let title = `Planche_Badges_EVA_${targetDossiers.length}_Pelerins`;
      if (selectedOnly) {
        title = `Planche_Badges_Selection_${targetDossiers.length}_Pelerins`;
      } else if (selectedHotelMedineFilter !== 'ALL') {
        title = `Planche_Badges_Medine_${selectedHotelMedineFilter.replace(/[^a-zA-Z0-9]/g, '_')}_${targetDossiers.length}_Pelerins`;
      } else if (selectedHotelMakkahFilter !== 'ALL') {
        title = `Planche_Badges_Maakkah_${selectedHotelMakkahFilter.replace(/[^a-zA-Z0-9]/g, '_')}_${targetDossiers.length}_Pelerins`;
      }

      await generateBatchBadgesPdf(targetDossiers, agencyConfig, title, true, {
        phoneSenegal: localPhoneSenegal,
        phoneSaudi: localPhoneSaudi,
      });
    } catch (err) {
      console.error('Error generating batch badges PDF', err);
      alert('Erreur lors de la génération de la planche PDF des badges.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Open Preview & Edit modal for a specific dossier
  const handleOpenPreview = (dossier: PilgrimDossier) => {
    const current = getDossierHotels(dossier);
    setPreviewDossier(dossier);
    setModalHotelMedine(current.medine);
    setModalHotelMakkah(current.makkah);
    setModalBadgeTitle(current.title);
  };

  // Save changes from Preview modal specifically for this dossier
  const handleSaveModalDossierSettings = () => {
    if (!previewDossier) return;
    updateDossierBadgeSettings(previewDossier.id, {
      hotelMedine: modalHotelMedine.trim().toUpperCase(),
      hotelMakkah: modalHotelMakkah.trim().toUpperCase(),
      badgeTitle: modalBadgeTitle.trim().toUpperCase(),
    });
    setSaveToast(
      `Hôtels enregistrés pour ${previewDossier.personalInfo.firstName} ${previewDossier.personalInfo.lastName} uniquement !`
    );
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Reset hotel filters
  const handleResetHotelFilters = () => {
    setSelectedHotelMedineFilter('ALL');
    setSelectedHotelMakkahFilter('ALL');
  };

  const hasActiveHotelFilter = selectedHotelMedineFilter !== 'ALL' || selectedHotelMakkahFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e46a3d] text-white shadow-xs">
              <IdCard className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e46a3d]">
              Modèle Officiel EVA Voyages · Format Carte Paysage
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-1">
            Création, Tri & Impression des Badges Pèlerins
          </h2>
          <p className="text-xs text-stone-500 max-w-2xl mt-0.5">
            Modèle conforme au scan CamScanner. Trier et filtrer par <strong>Hôtel Médine</strong> ou <strong>Hôtel Maakkah</strong> en toute indépendance, sans impliquer tous les badges.
          </p>
        </div>

        {/* Global Batch Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedDossierIds.length > 0 && (
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={() => handleDownloadBatch(true)}
              className="px-4 py-2.5 bg-[#e46a3d] hover:bg-[#d05c31] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer animate-in fade-in"
            >
              {isGeneratingPdf ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              <span>Imprimer Sélection ({selectedDossierIds.length}) en PDF</span>
            </button>
          )}

          <button
            type="button"
            disabled={isGeneratingPdf || filteredAndSortedDossiers.length === 0}
            onClick={() => handleDownloadBatch(false)}
            className="px-4 py-2.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>
              {hasActiveHotelFilter
                ? `Télécharger Planche A4 (${filteredAndSortedDossiers.length} badges filtrés)`
                : `Télécharger Planche A4 (${filteredAndSortedDossiers.length} badges · 8/page)`}
            </span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION TOAST */}
      {saveToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-2xl shadow-lg flex items-center gap-2 animate-in fade-in sticky top-4 z-40">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: PANNEAU DE CONFIGURATION DES HÔTELS POUR MÉDINE ET MAAKKAH */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 border-2 border-orange-200 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#e46a3d] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-stone-900">
                  Option : Personnalisation des Hôtels pour Médine & Maakkah
                </span>
                <span className="px-2 py-0.2 rounded-full bg-orange-100 text-[#e46a3d] font-bold text-[10px] uppercase">
                  Modèle CamScanner
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Ajustez les noms d'hôtels par défaut ou appliquez-les de manière ciblée à une sélection sans toucher au reste.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToScanDefaults}
              className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Rétablir les hôtels par défaut du scan (The Biltmore / Rotana)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Modèle Scanné</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="p-1.5 rounded-xl text-stone-500 hover:bg-stone-100"
              title={isPanelExpanded ? 'Réduire' : 'Déplier'}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isPanelExpanded && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Hotel Médine input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block flex items-center gap-1">
                  <span>🏨 Hôtel Médine (Valeur de référence)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localHotelMedine}
                  onChange={(e) => setLocalHotelMedine(e.target.value.toUpperCase())}
                  placeholder="Ex: THE BILTMORE"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-[#e46a3d] focus:ring-2 focus:ring-orange-200 text-xs font-black uppercase text-stone-900 bg-stone-50/50"
                />
                <span className="text-[10px] text-stone-400">Ex : THE BILTMORE, DAR AL TAQWA...</span>
              </div>

              {/* Hotel Maakkah input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block flex items-center gap-1">
                  <span>🕋 Hôtel Maakkah (Valeur de référence)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localHotelMakkah}
                  onChange={(e) => setLocalHotelMakkah(e.target.value.toUpperCase())}
                  placeholder="Ex: ROTANA"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-[#e46a3d] focus:ring-2 focus:ring-orange-200 text-xs font-black uppercase text-stone-900 bg-stone-50/50"
                />
                <span className="text-[10px] text-stone-400">Ex : ROTANA, FAIRMONT, SWISSÔTEL...</span>
              </div>

              {/* Titre de la bannière */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                  🏷️ Bannière Orange du Badge
                </label>
                <input
                  type="text"
                  value={localBadgeTitle}
                  onChange={(e) => setLocalBadgeTitle(e.target.value.toUpperCase())}
                  placeholder="Ex: OUMRAH GAMOU 2026 VIP"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-[#e46a3d] text-xs font-black uppercase text-stone-900 bg-stone-50/50"
                />
                <span className="text-[10px] text-stone-400">Affiché sur le bandeau en haut</span>
              </div>

              {/* Numéro Urgence Saudi */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                  🇸🇦 Contact Saudi (Pied de page)
                </label>
                <input
                  type="text"
                  value={localPhoneSaudi}
                  onChange={(e) => setLocalPhoneSaudi(e.target.value)}
                  placeholder="0543625106"
                  className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-200 focus:border-[#e46a3d] text-xs font-mono font-bold text-stone-900 bg-stone-50/50"
                />
                <span className="text-[10px] text-stone-400">Urgence en Arabie Saoudite</span>
              </div>
            </div>

            {/* ACTION DISCRIMINATION: Ciblée vs Globale */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200/60">
              <div className="flex items-center gap-2 text-stone-700">
                <Sparkles className="w-4 h-4 text-[#e46a3d] shrink-0" />
                <span>
                  Référence : <strong>Médine : {localHotelMedine}</strong> · <strong>Maakkah : {localHotelMakkah}</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Selective Action: Appliquer uniquement à la sélection */}
                <button
                  type="button"
                  disabled={selectedDossierIds.length === 0}
                  onClick={() => {
                    applyBadgeHotelsToDossiers(selectedDossierIds, localHotelMedine, localHotelMakkah);
                    setSaveToast(`Hôtels appliqués à la sélection de ${selectedDossierIds.length} badge(s) uniquement !`);
                    setTimeout(() => setSaveToast(null), 3500);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    selectedDossierIds.length > 0
                      ? 'bg-[#e46a3d] hover:bg-[#d05c31] text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                  title="Applique ces 2 hôtels uniquement aux badges sélectionnés sans impacter les autres pèlerins"
                >
                  <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>
                    Appliquer à la Sélection ({selectedDossierIds.length})
                  </span>
                </button>

                {/* 2. Global Action: Appliquer à tous (bouton secondaire discret) */}
                <button
                  type="button"
                  onClick={handleApplyHotelsGlobally}
                  className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Applique ces hôtels à l'ensemble des pèlerins de l'agence"
                >
                  <Check className="w-3.5 h-3.5 text-stone-500" />
                  <span>Appliquer à TOUS ({dossiers.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: BARRE D'ACTION CIBLÉE POUR LES BADGES SÉLECTIONNÉS (SANS IMPLIQUER LES AUTRES) */}
      {/* ========================================================================= */}
      {selectedDossierIds.length > 0 && (
        <div className="bg-stone-900 text-white rounded-3xl p-4 shadow-xl border border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#e46a3d] text-white flex items-center justify-center font-black text-sm shrink-0">
              {selectedDossierIds.length}
            </div>
            <div>
              <div className="text-xs font-black uppercase text-amber-300 tracking-wider">
                Action ciblée sur {selectedDossierIds.length} badge(s) sélectionné(s)
              </div>
              <p className="text-[11px] text-stone-300">
                Les autres {dossiers.length - selectedDossierIds.length} badges de l'agence ne seront <strong>pas modifiés</strong>.
              </p>
            </div>
          </div>

          {/* Quick hotel input form for this selection */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
              <span className="text-[10px] text-stone-400 font-bold">Médine:</span>
              <input
                type="text"
                value={selectiveHotelMedine}
                onChange={(e) => setSelectiveHotelMedine(e.target.value.toUpperCase())}
                placeholder="Hôtel Médine"
                className="bg-transparent text-xs font-black uppercase text-white focus:outline-none w-28 sm:w-36"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
              <span className="text-[10px] text-stone-400 font-bold">Maakkah:</span>
              <input
                type="text"
                value={selectiveHotelMakkah}
                onChange={(e) => setSelectiveHotelMakkah(e.target.value.toUpperCase())}
                placeholder="Hôtel Maakkah"
                className="bg-transparent text-xs font-black uppercase text-white focus:outline-none w-28 sm:w-36"
              />
            </div>

            <button
              type="button"
              onClick={handleApplyToSelectedOnly}
              className="px-3 py-2 bg-[#e46a3d] hover:bg-[#d05c31] text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Valider pour ces {selectedDossierIds.length} badges</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadBatch(true)}
              disabled={isGeneratingPdf}
              className="px-3 py-2 bg-[#135ca5] hover:bg-[#0c3f74] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>PDF Sélection</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDossierIds([])}
              className="px-2 py-1.5 text-stone-400 hover:text-white text-xs underline cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: BARRE DE RECHERCHE, TRI (MEDINE & MAAKKAH) & FILTRES */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search by Name, Prenom, Phone, Hotels */}
          <div className="relative md:col-span-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par NOM, Hôtel Médine, Maakkah, Tél..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-stone-300 text-xs bg-stone-50/60 font-medium focus:outline-none focus:ring-2 focus:ring-[#e46a3d]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* LE TRI DES BADGES (NOUVEAU : Nom, Hôtel Médine, Hôtel Maakkah, Date) */}
          <div className="md:col-span-3">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#e46a3d]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as BadgeSortOption)}
                className="w-full pl-8 pr-3 py-2.5 rounded-2xl border-2 border-orange-200 bg-orange-50/40 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#e46a3d]"
                title="Trier la liste des badges"
              >
                <option value="NOM_ASC">Trier : Nom Pèlerin (A → Z)</option>
                <option value="NOM_DESC">Trier : Nom Pèlerin (Z → A)</option>
                <option value="HOTEL_MEDINE_ASC">🏨 Trier par Hôtel Médine (A → Z)</option>
                <option value="HOTEL_MEDINE_DESC">🏨 Trier par Hôtel Médine (Z → A)</option>
                <option value="HOTEL_MAKKAH_ASC">🕋 Trier par Hôtel Maakkah (A → Z)</option>
                <option value="HOTEL_MAKKAH_DESC">🕋 Trier par Hôtel Maakkah (Z → A)</option>
                <option value="DATE_DESC">Date d'inscription (Plus récent)</option>
              </select>
            </div>
          </div>

          {/* Filtre Hôtel Médine */}
          <div className="md:col-span-2">
            <select
              value={selectedHotelMedineFilter}
              onChange={(e) => setSelectedHotelMedineFilter(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-semibold ${
                selectedHotelMedineFilter !== 'ALL'
                  ? 'border-[#e46a3d] bg-orange-50 text-[#e46a3d] font-bold'
                  : 'border-stone-300 bg-white text-stone-700'
              }`}
            >
              <option value="ALL">🏨 Médine : Tous ({uniqueHotelsMedine.length} hôtels)</option>
              {uniqueHotelsMedine.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name} ({h.count})
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Hôtel Maakkah */}
          <div className="md:col-span-2">
            <select
              value={selectedHotelMakkahFilter}
              onChange={(e) => setSelectedHotelMakkahFilter(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-semibold ${
                selectedHotelMakkahFilter !== 'ALL'
                  ? 'border-[#e46a3d] bg-orange-50 text-[#e46a3d] font-bold'
                  : 'border-stone-300 bg-white text-stone-700'
              }`}
            >
              <option value="ALL">🕋 Maakkah : Tous ({uniqueHotelsMakkah.length} hôtels)</option>
              {uniqueHotelsMakkah.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name} ({h.count})
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Switcher (Grid vs Table) */}
          <div className="md:col-span-1 flex items-center justify-end">
            <div className="bg-stone-100 p-1 rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-white text-[#e46a3d] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Vue Badges Paysage (Modèle CamScanner)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-white text-[#e46a3d] shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Vue Tableau Liste"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Second row: Package filter, Photo filter & Quick Hotel Chips */}
        <div className="pt-2 border-t border-stone-100 space-y-2.5">
          {/* Quick interactive filter chips for Médine & Maakkah */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
            <span className="font-bold text-stone-600 text-[11px] shrink-0 flex items-center gap-1">
              <Hotel className="w-3.5 h-3.5 text-[#e46a3d]" />
              <span>Hôtels Médine :</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedHotelMedineFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  selectedHotelMedineFilter === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tous ({dossiers.length})
              </button>
              {uniqueHotelsMedine.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() =>
                    setSelectedHotelMedineFilter(selectedHotelMedineFilter === h.name ? 'ALL' : h.name)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedHotelMedineFilter === h.name
                      ? 'bg-[#e46a3d] text-white shadow-2xs'
                      : 'bg-orange-50 text-[#e46a3d] hover:bg-orange-100 border border-orange-200/60'
                  }`}
                >
                  <span>{h.name}</span>
                  <span className="opacity-80 font-mono">({h.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
            <span className="font-bold text-stone-600 text-[11px] shrink-0 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#135ca5]" />
              <span>Hôtels Maakkah :</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedHotelMakkahFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  selectedHotelMakkahFilter === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tous ({dossiers.length})
              </button>
              {uniqueHotelsMakkah.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() =>
                    setSelectedHotelMakkahFilter(selectedHotelMakkahFilter === h.name ? 'ALL' : h.name)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    selectedHotelMakkahFilter === h.name
                      ? 'bg-[#135ca5] text-white shadow-2xs'
                      : 'bg-blue-50 text-[#135ca5] hover:bg-blue-100 border border-blue-200/60'
                  }`}
                >
                  <span>{h.name}</span>
                  <span className="opacity-80 font-mono">({h.count})</span>
                </button>
              ))}
            </div>

            {hasActiveHotelFilter && (
              <button
                type="button"
                onClick={handleResetHotelFilters}
                className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 ml-auto"
              >
                <X className="w-3 h-3" />
                <span>Effacer filtres hôtels</span>
              </button>
            )}
          </div>
        </div>

        {/* Selection summary & A4 sheet info */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700 select-none">
              <input
                type="checkbox"
                checked={
                  filteredAndSortedDossiers.length > 0 &&
                  selectedDossierIds.length === filteredAndSortedDossiers.length
                }
                onChange={handleSelectAllFiltered}
                className="w-4 h-4 rounded text-[#e46a3d] focus:ring-[#e46a3d] border-stone-300"
              />
              <span>
                Sélectionner les {filteredAndSortedDossiers.length} badges affichés (
                {selectedDossierIds.length} cochés)
              </span>
            </label>
            {selectedDossierIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDossierIds([])}
                className="text-[11px] text-stone-500 hover:text-red-600 underline cursor-pointer"
              >
                Désélectionner tout
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500">
            <span className="font-semibold text-stone-800">
              Tri actif :{' '}
              {sortBy.includes('HOTEL_MEDINE')
                ? '🏨 Hôtel Médine'
                : sortBy.includes('HOTEL_MAKKAH')
                ? '🕋 Hôtel Maakkah'
                : sortBy.includes('NOM')
                ? 'Nom Pèlerin'
                : 'Date'}
            </span>
            <span>·</span>
            <span>Planche A4 : {Math.ceil(filteredAndSortedDossiers.length / 8)} feuille(s)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: AFFICHAGE DES BADGES (GRILLE CAMSCANNER OU TABLEAU) */}
      {/* ========================================================================= */}
      {filteredAndSortedDossiers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
          <IdCard className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-900 text-base">Aucun badge ne correspond à ce tri ou filtre</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Aucun pèlerin ne correspond à la combinaison actuelle d'hôtels Médine / Maakkah ou aux mots-clés recherchés.
          </p>
          {hasActiveHotelFilter && (
            <button
              type="button"
              onClick={handleResetHotelFilters}
              className="px-4 py-2 bg-[#e46a3d] text-white rounded-xl text-xs font-bold hover:bg-[#d05c31] cursor-pointer"
            >
              Réinitialiser les filtres d'hôtels
            </button>
          )}
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW: Visual Badges Exactly like CamScanner scan */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedDossiers.map((dossier) => {
            const hasPhoto = Boolean(dossier.documents.photo?.fileUrl);
            const isSelected = selectedDossierIds.includes(dossier.id);
            const isGeneratingThis = generatingDossierId === dossier.id;
            const hotels = getDossierHotels(dossier);

            return (
              <div
                key={dossier.id}
                className={`bg-white rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden relative shadow-md hover:shadow-xl ${
                  isSelected
                    ? 'border-[#e46a3d] ring-4 ring-orange-200'
                    : 'border-stone-200 hover:border-[#e46a3d]'
                }`}
              >
                {/* Checkbox select on top left */}
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectDossier(dossier.id)}
                    className="w-4 h-4 rounded text-[#e46a3d] focus:ring-[#e46a3d] border-stone-300 cursor-pointer shadow-xs bg-white"
                  />
                  {hotels.isCustom && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-900 font-black text-[9px] uppercase shadow-xs">
                      Hôtel Personnalisé
                    </span>
                  )}
                </div>

                {/* ========================================================================= */}
                {/* THE BADGE REPRODUCTION CONFORMING TO CAMSCANNER SCAN */}
                {/* ========================================================================= */}
                <div className="p-3 bg-white text-stone-900 space-y-2 select-none">
                  {/* Top Logo centered */}
                  <div className="flex items-center justify-center pt-1 pb-0.5">
                    <img
                      src="/logo.png"
                      alt="EVA Voyages"
                      className="h-7 w-auto object-contain"
                    />
                  </div>

                  {/* Terracotta / Orange Banner */}
                  <div className="bg-[#e46a3d] text-white rounded-md py-1 px-2 text-center shadow-2xs">
                    <span className="font-black text-xs sm:text-[13px] tracking-widest block uppercase font-sans">
                      {formatSpacedTitle(hotels.title)}
                    </span>
                  </div>

                  {/* Body: Left Info (Prenom, Nom, Medine, Maakkah) & Right Photo */}
                  <div className="pt-1 grid grid-cols-12 gap-2 items-center min-h-[105px]">
                    {/* Left text column */}
                    <div className="col-span-8 space-y-1.5 text-xs text-left">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 w-16 text-[11.5px] shrink-0">Prénom:</span>
                        <span className="font-black text-stone-950 text-[13px] uppercase truncate">
                          {dossier.personalInfo.firstName}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 w-16 text-[11.5px] shrink-0">Nom:</span>
                        <span className="font-black text-stone-950 text-[13px] uppercase truncate">
                          {dossier.personalInfo.lastName}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 w-16 text-[11.5px] shrink-0">Médine:</span>
                        <span className="font-black text-stone-950 text-[12px] uppercase truncate text-orange-950">
                          {hotels.medine}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 w-16 text-[11.5px] shrink-0">Maakkah:</span>
                        <span className="font-black text-stone-950 text-[12px] uppercase truncate text-orange-950">
                          {hotels.makkah}
                        </span>
                      </div>
                    </div>

                    {/* Right photo column */}
                    <div className="col-span-4 flex items-center justify-end">
                      <div className="w-20 h-24 rounded-xl border border-stone-300 bg-stone-100 overflow-hidden shadow-2xs flex items-center justify-center relative">
                        {hasPhoto ? (
                          <img
                            src={dossier.documents.photo!.fileUrl}
                            alt={`${dossier.personalInfo.firstName} ${dossier.personalInfo.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-1 text-stone-400">
                            <User className="w-7 h-7 mx-auto text-stone-300" />
                            <span className="text-[9px] font-bold block text-stone-500 mt-1">Photo</span>
                          </div>
                        )}
                        {hasPhoto && (
                          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dark Charcoal Footer Bar */}
                  <div className="bg-[#333844] text-white rounded-md p-1.5 flex items-center justify-between gap-2 shadow-2xs">
                    {/* Orange Square with Phone Handset */}
                    <div className="w-6 h-6 rounded-sm bg-[#e46a3d] flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-white fill-white" />
                    </div>

                    {/* Contacts on right */}
                    <div className="text-right flex-1 overflow-hidden leading-tight">
                      <span className="font-bold text-[10.5px] block truncate text-stone-100 font-mono">
                        {localPhoneSenegal}
                      </span>
                      <span className="font-black text-[10.5px] block truncate text-amber-300 font-mono">
                        SAUDI : {localPhoneSaudi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* ACTION BAR UNDER THE BADGE */}
                {/* ========================================================================= */}
                <div className="p-2.5 bg-stone-50 border-t border-stone-200 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(dossier)}
                    className="py-1.5 px-2 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Modifier l'hôtel pour ce pèlerin uniquement sans impliquer les autres"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#e46a3d]" />
                    <span>Hôtels de ce badge</span>
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingThis}
                    onClick={() => handleDownloadSingle(dossier)}
                    className="py-1.5 px-2 rounded-xl bg-[#e46a3d] hover:bg-[#d05c31] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    {isGeneratingThis ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Badge PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredAndSortedDossiers.length > 0 &&
                        selectedDossierIds.length === filteredAndSortedDossiers.length
                      }
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 rounded text-[#e46a3d] focus:ring-[#e46a3d] border-stone-300"
                    />
                  </th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">NOM & Prénoms</th>
                  <th className="px-4 py-3">Hôtel Médine</th>
                  <th className="px-4 py-3">Hôtel Maakkah</th>
                  <th className="px-4 py-3">Téléphone</th>
                  <th className="px-4 py-3 text-right">Actions Badge</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredAndSortedDossiers.map((dossier) => {
                  const hasPhoto = Boolean(dossier.documents.photo?.fileUrl);
                  const isSelected = selectedDossierIds.includes(dossier.id);
                  const isGeneratingThis = generatingDossierId === dossier.id;
                  const hotels = getDossierHotels(dossier);

                  return (
                    <tr
                      key={dossier.id}
                      className={`hover:bg-orange-50/30 transition-colors ${
                        isSelected ? 'bg-orange-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectDossier(dossier.id)}
                          className="w-4 h-4 rounded text-[#e46a3d] focus:ring-[#e46a3d] border-stone-300 cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="w-9 h-11 rounded-lg border border-stone-200 bg-stone-100 overflow-hidden flex items-center justify-center shrink-0">
                          {hasPhoto ? (
                            <img
                              src={dossier.documents.photo!.fileUrl}
                              alt={dossier.personalInfo.lastName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-stone-900 block text-sm uppercase">
                            {dossier.personalInfo.firstName} {dossier.personalInfo.lastName}
                          </span>
                          {hotels.isCustom && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-stone-900 font-bold text-[9px]">
                              Perso
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">
                          Code: {dossier.trackingCode}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-stone-900 border border-orange-200/60 font-black text-xs block truncate max-w-[170px]">
                          {hotels.medine}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-stone-900 border border-blue-200/60 font-black text-xs block truncate max-w-[170px]">
                          {hotels.makkah}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-stone-700">
                        {dossier.personalInfo.phone}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(dossier)}
                            className="p-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 flex items-center gap-1 font-semibold cursor-pointer"
                            title="Modifier les hôtels de ce pèlerin uniquement sans impliquer les autres"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#e46a3d]" />
                            <span className="hidden sm:inline">Hôtels</span>
                          </button>

                          <button
                            type="button"
                            disabled={isGeneratingThis}
                            onClick={() => handleDownloadSingle(dossier)}
                            className="px-3 py-1.5 bg-[#e46a3d] hover:bg-[#d05c31] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            {isGeneratingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED PREVIEW & INDIVIDUAL HOTEL CUSTOMIZER MODAL */}
      {/* ========================================================================= */}
      {previewDossier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[#e46a3d]" />
                <div>
                  <h3 className="font-black text-stone-900 text-base">
                    Aperçu & Modification de Badge : {previewDossier.personalInfo.firstName}{' '}
                    {previewDossier.personalInfo.lastName}
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    Cette modification n'implique que ce pèlerin. Les autres badges restent inchangés.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDossier(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* LIVE PREVIEW OF THE CAMSCANNER BADGE MODEL */}
            <div className="w-full max-w-[420px] mx-auto bg-white rounded-2xl border-2 border-stone-300 p-3 shadow-xl space-y-2 text-stone-900 font-sans">
              {/* Centered Logo */}
              <div className="flex items-center justify-center pt-1 pb-0.5">
                <img src="/logo.png" alt="EVA Voyages" className="h-8 w-auto object-contain" />
              </div>

              {/* Terracotta / Orange Banner */}
              <div className="bg-[#e46a3d] text-white rounded-md py-1.5 px-3 text-center shadow-2xs">
                <span className="font-black text-sm tracking-widest block uppercase font-sans">
                  {formatSpacedTitle(modalBadgeTitle || localBadgeTitle)}
                </span>
              </div>

              {/* Middle: Left info + Right photo */}
              <div className="pt-1 grid grid-cols-12 gap-2 items-center min-h-[115px]">
                <div className="col-span-8 space-y-1.5 text-xs text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 w-16 text-[12px] shrink-0">Prénom:</span>
                    <span className="font-black text-stone-950 text-sm uppercase truncate">
                      {previewDossier.personalInfo.firstName}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 w-16 text-[12px] shrink-0">Nom:</span>
                    <span className="font-black text-stone-950 text-sm uppercase truncate">
                      {previewDossier.personalInfo.lastName}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 w-16 text-[12px] shrink-0">Médine:</span>
                    <span className="font-black text-stone-950 text-xs uppercase truncate text-orange-950">
                      {modalHotelMedine || localHotelMedine}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 w-16 text-[12px] shrink-0">Maakkah:</span>
                    <span className="font-black text-stone-950 text-xs uppercase truncate text-orange-950">
                      {modalHotelMakkah || localHotelMakkah}
                    </span>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-end">
                  <div className="w-22 h-26 rounded-xl border border-stone-300 bg-stone-100 overflow-hidden shadow-2xs flex items-center justify-center">
                    {previewDossier.documents.photo?.fileUrl ? (
                      <img
                        src={previewDossier.documents.photo.fileUrl}
                        alt={previewDossier.personalInfo.lastName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1 text-stone-400">
                        <User className="w-8 h-8 mx-auto text-stone-300" />
                        <span className="text-[10px] font-bold block text-stone-500 mt-1">Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dark Footer */}
              <div className="bg-[#333844] text-white rounded-md p-1.5 flex items-center justify-between gap-2 shadow-2xs">
                <div className="w-6 h-6 rounded-sm bg-[#e46a3d] flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <div className="text-right flex-1 overflow-hidden leading-tight">
                  <span className="font-bold text-[11px] block truncate text-stone-100 font-mono">
                    {localPhoneSenegal}
                  </span>
                  <span className="font-black text-[11px] block truncate text-amber-300 font-mono">
                    SAUDI : {localPhoneSaudi}
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE HOTEL EDITORS FOR THIS DOSSIER */}
            <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-[#e46a3d] tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Modifier les Hôtels pour ce Badge Uniquement :</span>
                </h4>
                <span className="text-[10px] font-bold text-stone-500">
                  Code: {previewDossier.trackingCode}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block">
                    🏨 Hôtel Médine :
                  </label>
                  <input
                    type="text"
                    value={modalHotelMedine}
                    onChange={(e) => setModalHotelMedine(e.target.value.toUpperCase())}
                    placeholder="THE BILTMORE"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-black uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#e46a3d]"
                  />
                  {/* Quick Suggestions for Médine */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['THE BILTMORE', 'DAR AL TAQWA', 'OBEROI', 'PULLMAN ZAMZAM'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setModalHotelMedine(sug)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white hover:bg-orange-100 border border-stone-200 text-stone-600 font-bold"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700 block">
                    🕋 Hôtel Maakkah :
                  </label>
                  <input
                    type="text"
                    value={modalHotelMakkah}
                    onChange={(e) => setModalHotelMakkah(e.target.value.toUpperCase())}
                    placeholder="ROTANA"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-black uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#e46a3d]"
                  />
                  {/* Quick Suggestions for Maakkah */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {['ROTANA', 'FAIRMONT CLOCK ROYAL', 'SWISSÔTEL', 'ANJUM'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setModalHotelMakkah(sug)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-white hover:bg-orange-100 border border-stone-200 text-stone-600 font-bold"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveModalDossierSettings}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Enregistrer pour ce pèlerin uniquement</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDossier(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDownloadSingle(previewDossier, {
                      hotelMedine: modalHotelMedine,
                      hotelMakkah: modalHotelMakkah,
                      badgeTitle: modalBadgeTitle,
                    })
                  }
                  className="px-5 py-2 rounded-xl bg-[#e46a3d] hover:bg-[#d05c31] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger ce Badge en PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
