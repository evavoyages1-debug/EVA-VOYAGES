import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, PackageType } from '../../types';
import { PackageCard } from './PackageCard';
import { PackageDetailModal } from './PackageDetailModal';
import { RegistrationWizard } from './RegistrationWizard';
import { DossierTracking } from './DossierTracking';
import { PaymentPortal } from './PaymentPortal';
import { PilgrimGuide } from './PilgrimGuide';
import { QiblaCompass } from './QiblaCompass';
import { HolyQuranReader } from './HolyQuranReader';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { FloatingCurrencyButton } from './FloatingCurrencyButton';
import { CurrencyConverterModal } from './CurrencyConverterModal';
import {
  Compass,
  FileEdit,
  Search,
  CreditCard,
  BookOpen,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Navigation,
  Coins,
  Lock,
  Mail,
  Check,
  Plus,
} from 'lucide-react';

export const PilgrimAppLayout: React.FC = () => {
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const {
    pilgrimActiveTab,
    setPilgrimActiveTab,
    packages,
    selectedPackageId,
    setSelectedPackageId,
    agencyConfig,
    currentUser,
    openAuthModal,
    setTrackingQueryCode,
    setCurrentView,
    registerClientAccount,
    switchToBackOffice,
    isBackOfficeDomain,
    getMyDossier,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HAJJ' | 'OUMRA'>('ALL');
  const [detailModalPkg, setDetailModalPkg] = useState<Package | null>(null);

  // Interface account creation state (Nom, Prénom, Adresse électronique)
  const [showCreateAccountForm, setShowCreateAccountForm] = useState<boolean>(!currentUser);
  const [quickFirst, setQuickFirst] = useState<string>('');
  const [quickLast, setQuickLast] = useState<string>('');
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [quickAutoSwitching, setQuickAutoSwitching] = useState<boolean>(false);

  const handleQuickEmailChange = (val: string) => {
    setQuickEmail(val);
    const clean = val.trim().toLowerCase();
    if (isBackOfficeDomain(clean)) {
      setQuickAutoSwitching(true);
      setTimeout(() => {
        switchToBackOffice(clean, `${quickFirst} ${quickLast}`.trim());
      }, 700);
    }
  };

  const handleQuickAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = quickEmail.trim().toLowerCase();
    if (!quickFirst.trim() || !quickLast.trim() || !cleanEmail) {
      alert('Veuillez renseigner Nom, Prénom et Adresse électronique.');
      return;
    }

    if (isBackOfficeDomain(cleanEmail)) {
      setQuickAutoSwitching(true);
      setTimeout(() => {
        switchToBackOffice(cleanEmail, `${quickFirst} ${quickLast}`.trim());
      }, 600);
      return;
    }

    registerClientAccount(
      `${quickFirst} ${quickLast}`.trim(),
      cleanEmail,
      '+221 77 000 00 00',
      undefined,
      quickFirst.trim(),
      quickLast.trim()
    );
    setQuickFirst('');
    setQuickLast('');
    setQuickEmail('');
  };

  const myDossier = getMyDossier();

  const filteredPackages = packages.filter((pkg) => {
    if (activeFilter === 'HAJJ') return pkg.type === 'HAJJ';
    if (activeFilter === 'OUMRA') return pkg.type === 'OUMRA';
    return true;
  });

  const handleOpenDetails = (pkg: Package) => {
    setDetailModalPkg(pkg);
  };

  const handleSelectForRegister = (pkg: Package) => {
    setSelectedPackageId(pkg.id);
    setPilgrimActiveTab('REGISTER');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col pb-20 md:pb-10">
      {/* Account Profile Status Bar (Client vs Admin preview) */}
      <div className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs py-2 px-4 sm:px-8 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {currentUser?.role === 'PILGRIM' ? (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-stone-300">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-[11px]">
                <User className="w-3.5 h-3.5 text-[#f15a24]" />
                <span>Espace Client Pèlerin</span>
              </span>
              <span>
                Connecté : <strong className="text-white font-semibold">{currentUser.name}</strong>
              </span>
              {currentUser.linkedTrackingCode && (
                <>
                  <span className="hidden sm:inline text-stone-600">·</span>
                  <span className="text-stone-300">
                    Dossier : <strong className="font-mono text-[#f97316]">{currentUser.linkedTrackingCode}</strong>
                  </span>
                </>
              )}
            </div>
          ) : currentUser?.role === 'ADMIN' ? (
            <div className="flex items-center gap-2 text-stone-300">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mode Prévisualisation Back-Office</span>
              </span>
              <span className="hidden sm:inline text-stone-400">
                Vous visitez l'Espace Client en tant qu'administrateur ({currentUser.name})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-stone-400">
              <span className="text-stone-300">Bienvenue sur le portail des pèlerins EVA Voyages.</span>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            {currentUser?.role === 'PILGRIM' ? (
              <>
                {currentUser.linkedTrackingCode && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.linkedTrackingCode) {
                        setTrackingQueryCode(currentUser.linkedTrackingCode);
                      }
                      setPilgrimActiveTab('TRACKING');
                    }}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-semibold transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Search className="w-3 h-3 text-[#f15a24]" />
                    <span>Mon Dossier</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openAuthModal('PILGRIM')}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg font-semibold transition-colors text-[11px]"
                >
                  Changer de compte
                </button>
              </>
            ) : currentUser?.role === 'ADMIN' ? (
              <button
                type="button"
                onClick={() => setCurrentView('ADMIN')}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors flex items-center gap-1 text-[11px]"
              >
                <ShieldCheck className="w-3 h-3 text-white" />
                <span>Retourner au Back-Office</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('PILGRIM')}
                className="px-2.5 py-1 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-lg font-bold transition-colors text-[11px]"
              >
                Connexion Espace Client
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-header Hero Banner (shown on Packages tab) */}
      {pilgrimActiveTab === 'PACKAGES' && (
        <section className="relative bg-slate-950 text-white overflow-hidden py-10 sm:py-14 border-b border-slate-800">
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src="/src/assets/images/hero_mecca_kaaba_1792417053237.jpg"
              alt="Hajj Pilgrims"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-[#0a192f]/90 to-[#164e96]/20 z-0" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-amiri text-2xl sm:text-3xl text-[#f97316] font-bold">
                  لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#164e96] text-white font-bold tracking-wider uppercase">
                  Saison 1447H / 2026
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Accomplissez votre Hajj & Oumra en toute sérénité
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Inscrivez-vous en ligne, déposez vos documents administratifs en temps réel, réglez facilement par <strong className="text-cyan-300 font-bold">Wave</strong> ou <strong className="text-[#f97316] font-bold">Orange Money</strong> et suivez chaque étape de validation jusqu'au départ.
              </p>

              {/* Zero-pill metadata markers */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-stone-400">
                <span className="text-[#f97316] font-bold">Hôtels 4★ & 5★ Proches Haram</span>
                <span aria-hidden="true">·</span>
                <span>Accompagnement Visa Direct</span>
                <span aria-hidden="true">·</span>
                <span>Encadrement Religieux Certifié</span>
              </div>
            </div>

            {/* Official Agency Brand Card in Hero */}
            <div className="hidden lg:flex p-4 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 flex-col items-center text-center max-w-xs shrink-0 shadow-xl">
              <div className="p-2.5 bg-white rounded-2xl shadow-md mb-2">
                <img
                  src={agencyConfig.logoUrl || '/logo.png'}
                  alt={agencyConfig.name}
                  className="h-16 w-auto object-contain"
                />
              </div>
              <span className="text-sm font-black text-white">{agencyConfig.name}</span>
              <span className="text-[11px] text-[#f97316] font-semibold">Agence Spécialisée Hajj & Oumra</span>
              <span className="text-[10px] text-stone-300 mt-1">Dakar · Abidjan · Bamako</span>
            </div>
          </div>
        </section>
      )}

      {/* Desktop Navigation Tab Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-30 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 scrollbar-none">
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPilgrimActiveTab('PACKAGES')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  pilgrimActiveTab === 'PACKAGES'
                    ? 'bg-[#135ca5] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Compass className="w-4 h-4 text-[#f15a24]" />
                <span>Formules Hajj & Oumra</span>
              </button>

              <button
                type="button"
                onClick={() => setPilgrimActiveTab('TRACKING')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  pilgrimActiveTab === 'TRACKING'
                    ? 'bg-[#135ca5] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Search className="w-4 h-4 text-[#f15a24]" />
                <span>Suivi Dossier & Billets / Visas</span>
                {currentUser?.linkedTrackingCode && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPilgrimActiveTab('QIBLA')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  pilgrimActiveTab === 'QIBLA'
                    ? 'bg-[#135ca5] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Navigation className="w-4 h-4 text-emerald-500" />
                <span>Direction Qibla</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Boussole
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPilgrimActiveTab('QURAN')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  pilgrimActiveTab === 'QURAN'
                    ? 'bg-[#047857] text-white shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${pilgrimActiveTab === 'QURAN' ? 'text-amber-300' : 'text-emerald-600'}`} />
                <span>Saint Coran</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold uppercase font-amiri ${
                  pilgrimActiveTab === 'QURAN' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#064e3b]'
                }`}>
                  القرآن الكريم (1-604)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPilgrimActiveTab('GUIDE')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  pilgrimActiveTab === 'GUIDE'
                    ? 'bg-[#135ca5] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Guide des Rituels</span>
              </button>

              <button
                type="button"
                onClick={() => setPilgrimActiveTab('PAYMENT')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  pilgrimActiveTab === 'PAYMENT'
                    ? 'bg-[#135ca5] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-cyan-600" />
                <span>Paiement Wave & OM</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCurrencyModalOpen(true)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                title="Convertir Riyal Saoudien (SAR) en Franc CFA (XOF)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>SAR ⇄ FCFA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => setPilgrimActiveTab('REGISTER')}
                className="px-3.5 py-1.5 bg-[#f15a24] hover:bg-[#d94917] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Nouvelle Inscription</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
        {/* In-app install banner with offline capability notice */}
        <PWAInstallButton variant="banner" className="mb-6" />

        {/* SECTION CRÉATION DE COMPTE PÈLERIN & BASCULE AUTOMATIQUE BACK-OFFICE */}
        <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 mb-6 overflow-hidden">
          {quickAutoSwitching && (
            <div className="mb-4 p-3.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
              <div>
                <p className="font-bold text-xs">Connexion sécurisée en cours...</p>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  Validation de votre profil d'accès...
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#135ca5] to-[#f15a24] text-white flex items-center justify-center shrink-0 shadow-md">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900">
                    Espace Pèlerin · Création de Compte
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#135ca5] uppercase">
                    Accès Privé
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  {currentUser?.role === 'PILGRIM'
                    ? `Connecté en tant que ${currentUser.name} (${currentUser.email}) · Seul votre dossier personnel est affiché sur l'espace client.`
                    : "Créez votre compte en saisissant votre Nom, Prénom et Adresse électronique."}
                </p>
              </div>
            </div>

            {currentUser?.role === 'PILGRIM' ? (
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {myDossier && (
                  <button
                    type="button"
                    onClick={() => {
                      setTrackingQueryCode(myDossier.trackingCode);
                      setPilgrimActiveTab('TRACKING');
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Voir mon dossier ({myDossier.trackingCode})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreateAccountForm(!showCreateAccountForm)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showCreateAccountForm ? 'Masquer formulaire' : 'Créer un autre compte'}</span>
                </button>
              </div>
            ) : (
              <span className="text-xs text-stone-400 font-medium">Inscription instantanée</span>
            )}
          </div>

          {/* Form fields: Prénom, Nom, Adresse électronique */}
          {(showCreateAccountForm || !currentUser) && (
            <div className="space-y-4">
              <form onSubmit={handleQuickAccountSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Prénom du pèlerin *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickFirst}
                      onChange={(e) => setQuickFirst(e.target.value)}
                      placeholder="Ex: Ibrahima"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nom de famille *
                    </label>
                    <input
                      type="text"
                      required
                      value={quickLast}
                      onChange={(e) => setQuickLast(e.target.value)}
                      placeholder="Ex: Ndiaye"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700">
                        Adresse électronique *
                      </label>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={quickEmail}
                        onChange={(e) => handleQuickEmailChange(e.target.value)}
                        placeholder="ibrahima.ndiaye@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Création de compte sécurisée & instantanée</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                    >
                      <span>Créer mon Compte</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#f15a24]" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* Tab 1: Packages List */}
        {pilgrimActiveTab === 'PACKAGES' && (
          <div className="space-y-6">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Nos Packages Hajj & Oumra 1447H</h2>
                <p className="text-xs text-stone-500">
                  Tarifs tout compris ajustés en temps réel par l'agence avec acompte de réservation.
                </p>
              </div>

              {/* Interactive segmented controls */}
              <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'ALL'
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tous les Séjours ({packages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('HAJJ')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'HAJJ'
                      ? 'bg-[#164e96] text-white shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Hajj 2026 ({packages.filter((p) => p.type === 'HAJJ').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('OUMRA')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeFilter === 'OUMRA'
                      ? 'bg-[#164e96] text-white shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Oumra ({packages.filter((p) => p.type === 'OUMRA').length})
                </button>
              </div>
            </div>

            {/* Grid of Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onOpenDetails={handleOpenDetails}
                  onSelectForRegister={handleSelectForRegister}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Registration Wizard */}
        {pilgrimActiveTab === 'REGISTER' && <RegistrationWizard />}

        {/* Tab 3: Dossier Tracking */}
        {pilgrimActiveTab === 'TRACKING' && <DossierTracking />}

        {/* Tab 4: Direct Payment */}
        {pilgrimActiveTab === 'PAYMENT' && <PaymentPortal />}

        {/* Tab 5: Pilgrim Guide */}
        {pilgrimActiveTab === 'GUIDE' && <PilgrimGuide />}

        {/* Tab 6: Qibla Compass */}
        {pilgrimActiveTab === 'QIBLA' && <QiblaCompass />}

        {/* Tab 7: Holy Quran Reader in Arabic and French */}
        {pilgrimActiveTab === 'QURAN' && <HolyQuranReader />}

        {/* Global Footer with Official WhatsApp and Wave/Orange Money Logos */}
        <footer className="mt-16 pt-8 pb-4 border-t border-stone-200/80 bg-white rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 px-2 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center">
                <img src="/logo.png" alt="EVA Voyages" className="h-9 object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-stone-900">{agencyConfig.name}</span>
                  <span className="text-[10px] bg-[#f15a24] text-white font-bold px-2 py-0.2 rounded-full uppercase">
                    Agréé Hajj 1447H
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{agencyConfig.tagline}</p>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">Licence : {agencyConfig.licenseNumber}</p>
              </div>
            </div>

            {/* Direct WhatsApp Callout with Official Logo */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <a
                href={`https://wa.me/221786391000?text=${encodeURIComponent(
                  `Salam Alaykum ${agencyConfig.name}, je souhaite obtenir des informations sur vos formules Hajj & Oumra 2026.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02]"
              >
                <img
                  src="/assets/whatsapp_logo.png"
                  alt="WhatsApp"
                  className="w-5 h-5 object-contain shrink-0"
                />
                <span>WhatsApp : +221 78 639 10 00</span>
              </a>

              <a
                href={`tel:${agencyConfig.phone}`}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-stone-500" />
                <span>{agencyConfig.phone}</span>
              </a>
            </div>
          </div>

          {/* Payment Partners & Security Badges */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-stone-600">Paiements Sécurisés :</span>

              {/* Wave Logo Badge */}
              <div
                onClick={() => setPilgrimActiveTab('PAYMENT')}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 hover:border-cyan-400 transition-all shadow-2xs group"
                title="Payer par Wave Sénégal"
              >
                <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-sky-200 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                    alt="Wave Sénégal"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="font-black text-[11px] text-sky-950 block leading-tight">Wave Sénégal</span>
                  <span className="text-[9px] text-sky-700 block leading-none font-semibold">0% Frais · QR Officiel</span>
                </div>
              </div>

              {/* Orange Money Logo Badge */}
              <div
                onClick={() => setPilgrimActiveTab('PAYMENT')}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 hover:border-orange-400 transition-all shadow-2xs group"
                title="Payer par Orange Money"
              >
                <div className="w-6 h-6 rounded-md bg-white p-0.5 border border-orange-200 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                    alt="Orange Money"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left">
                  <span className="font-black text-[11px] text-orange-950 block leading-tight">Orange Money</span>
                  <span className="text-[9px] text-orange-700 block leading-none font-semibold">#144# · Code Marchand</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Attestation & Reçu PDF officiel délivré instantanément après validation</span>
            </div>
          </div>
        </footer>
      </main>

      {/* Package Detail Modal */}
      <PackageDetailModal
        pkg={detailModalPkg}
        isOpen={!!detailModalPkg}
        onClose={() => setDetailModalPkg(null)}
        onSelectRegister={handleSelectForRegister}
      />

      {/* Mobile Sticky Bottom Tab Bar with 6 key items */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-stone-200 dark:border-slate-800 shadow-lg no-print">
        <div className="max-w-lg mx-auto grid grid-cols-6 items-center h-16 px-1">
          {/* Tab 1: Packages */}
          <button
            type="button"
            onClick={() => setPilgrimActiveTab('PACKAGES')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              pilgrimActiveTab === 'PACKAGES'
                ? 'text-[#164e96] font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight mt-1">Offres</span>
            {pilgrimActiveTab === 'PACKAGES' && (
              <span className="w-1 h-1 rounded-full bg-[#f15a24] absolute bottom-1" />
            )}
          </button>

          {/* Tab 2: Suivi Dossier & Billets/Visas */}
          <button
            type="button"
            onClick={() => setPilgrimActiveTab('TRACKING')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              pilgrimActiveTab === 'TRACKING'
                ? 'text-[#164e96] font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight mt-1">Dossier</span>
            {pilgrimActiveTab === 'TRACKING' && (
              <span className="w-1 h-1 rounded-full bg-[#f15a24] absolute bottom-1" />
            )}
          </button>

          {/* Tab 3: Qibla */}
          <button
            type="button"
            onClick={() => setPilgrimActiveTab('QIBLA')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              pilgrimActiveTab === 'QIBLA'
                ? 'text-emerald-600 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Navigation className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight mt-1">Qibla</span>
            {pilgrimActiveTab === 'QIBLA' && (
              <span className="w-1 h-1 rounded-full bg-emerald-500 absolute bottom-1" />
            )}
          </button>

          {/* Tab 4: Saint Coran */}
          <button
            type="button"
            onClick={() => setPilgrimActiveTab('QURAN')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              pilgrimActiveTab === 'QURAN'
                ? 'text-[#047857] font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight mt-1">Coran</span>
            {pilgrimActiveTab === 'QURAN' && (
              <span className="w-1 h-1 rounded-full bg-[#047857] absolute bottom-1" />
            )}
          </button>

          {/* Tab 5: Guide Rituels */}
          <button
            type="button"
            onClick={() => setPilgrimActiveTab('GUIDE')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              pilgrimActiveTab === 'GUIDE'
                ? 'text-[#164e96] font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight mt-1">Rituels</span>
            {pilgrimActiveTab === 'GUIDE' && (
              <span className="w-1 h-1 rounded-full bg-[#f15a24] absolute bottom-1" />
            )}
          </button>

          {/* Tab 6: Paiement */}
          <button
            type="button"
            onClick={() => setPilgrimActiveTab('PAYMENT')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              pilgrimActiveTab === 'PAYMENT'
                ? 'text-cyan-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CreditCard className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-tight mt-1">Payer</span>
            {pilgrimActiveTab === 'PAYMENT' && (
              <span className="w-1 h-1 rounded-full bg-[#f15a24] absolute bottom-1" />
            )}
          </button>
        </div>
      </nav>

      {/* Floating Currency Converter Quick Button */}
      <FloatingCurrencyButton />

      {/* Currency Converter Modal (from top bar or shortcuts) */}
      <CurrencyConverterModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
      />
    </div>
  );
};
