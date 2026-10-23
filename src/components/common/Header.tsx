import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Lock,
  ArrowRightLeft,
  Sparkles,
  BookOpen,
  Maximize2,
  Search,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { QuranPagesModal } from '../pilgrim/QuranPagesModal';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setPilgrimActiveTab,
    agencyConfig,
    dossiers,
    currentUser,
    openAuthModal,
    navigateToSpace,
    logout,
    isAuthorizedAdminEmail,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuranModalOpen, setIsQuranModalOpen] = useState(false);

  const pendingDossiersCount = dossiers.filter(
    (d) => d.workflowStatus === 'DOCUMENTS_PENDING' || d.workflowStatus === 'UNDER_REVIEW'
  ).length;

  const isAdmin = currentUser?.role === 'ADMIN' && isAuthorizedAdminEmail(currentUser?.email);

  // Keyboard shortcut listener for authorized agency personnel (Alt+A or Ctrl+Shift+A)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') ||
        (e.altKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        openAuthModal('ADMIN');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAuthModal]);

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-stone-100 border-b border-slate-800 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Zone 1: Brand Wordmark + Official Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('PILGRIM')}
              className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            >
              <div className="h-10 px-1.5 bg-white rounded-xl flex items-center justify-center shadow-xs border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={agencyConfig.logoUrl || '/logo.png'}
                  alt={agencyConfig.name}
                  className="h-8 w-auto max-w-[120px] object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 block">
                  {agencyConfig.name}
                </span>
                <span className="text-[10px] text-[#f97316] font-bold tracking-wider uppercase block -mt-1">
                  Hajj & Oumra 1447H
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation mode switcher (RESERVÉ ET VISIBLE UNIQUEMENT AUX ADMINISTRATEURS CONNECTÉS) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAdmin && (
              <div className="bg-slate-900/90 p-1 rounded-2xl flex items-center border border-slate-800 text-xs font-medium animate-in fade-in">
                {/* Espace Client button */}
                <button
                  type="button"
                  onClick={() => setCurrentView('PILGRIM')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    currentView === 'PILGRIM'
                      ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                      : 'text-stone-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title="Accéder au portail public et espace pèlerin"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#f15a24]" />
                  <span className="hidden xs:inline">Espace</span>
                  <span>Client</span>
                </button>

                {/* Back-Office button */}
                <button
                  type="button"
                  onClick={() => setCurrentView('ADMIN')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative cursor-pointer ${
                    currentView === 'ADMIN'
                      ? 'bg-emerald-700 text-white shadow-sm font-bold'
                      : 'text-stone-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                  title="Accéder au Back-Office de gestion (Personnel Agréé)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Back-Office</span>
                  {pendingDossiersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-[#f15a24] text-white font-bold text-[10px] rounded-full">
                      {pendingDossiersCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Barre du Saint Coran (Pages du Mushaf 1-604 & Récitateurs) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('PILGRIM');
                  setPilgrimActiveTab('QURAN');
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 hover:from-amber-500/30 hover:to-amber-600/40 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all shadow-xs group cursor-pointer"
                title="Accéder au Saint Coran avec ouverture des pages et choix des récitateurs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Saint Coran</span>
                <span className="font-amiri text-xs text-amber-300 font-normal">القرآن</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md uppercase hidden md:inline">
                  Pages 1-604
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuranModalOpen(true)}
                className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold hidden sm:flex items-center justify-center transition-colors cursor-pointer"
                title="Ouvrir directement le Mushaf (Pages 1 à 604) en plein écran"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zone 3: PWA Install Button & Active Account Profile */}
          <div className="relative shrink-0 flex items-center gap-2">
            <PWAInstallButton variant="header" />

            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all ${
                    isAdmin
                      ? 'bg-slate-900 border-emerald-500/40 text-emerald-100 hover:bg-slate-800'
                      : 'bg-slate-900 border-blue-500/40 text-blue-100 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                      isAdmin ? 'bg-emerald-600 text-white' : 'bg-[#135ca5] text-white'
                    }`}
                  >
                    {isAdmin ? '👑' : <User className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[11px] font-bold text-white max-w-[130px] truncate leading-tight">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] font-semibold leading-none ${
                        isAdmin ? 'text-emerald-400' : 'text-[#f97316]'
                      }`}
                    >
                      {isAdmin ? 'Compte Back-Office' : 'Compte Client'}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    {/* User info card */}
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/70">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAdmin
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-[#135ca5]'
                          }`}
                        >
                          {isAdmin ? '👑 Personnel Back-Office' : '👤 Espace Client Pèlerin'}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-stone-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                      {currentUser.linkedTrackingCode && (
                        <p className="text-[11px] text-[#f15a24] font-mono font-bold mt-1">
                          Dossier lié : {currentUser.linkedTrackingCode}
                        </p>
                      )}
                    </div>

                    {/* Quick Space Actions */}
                    <div className="p-2 space-y-1">
                      {isAdmin ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setCurrentView(currentView === 'ADMIN' ? 'PILGRIM' : 'ADMIN');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-stone-100 flex items-center justify-between text-stone-700 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {currentView === 'ADMIN' ? (
                                <>
                                  <Smartphone className="w-4 h-4 text-[#f15a24]" />
                                  <span>Voir l'Espace Client</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Aller au Back-Office</span>
                                </>
                              )}
                            </div>
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Client options only - NO BACK-OFFICE FOR PILGRIMS */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setCurrentView('PILGRIM');
                              setPilgrimActiveTab('TRACKING');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-stone-100 flex items-center gap-2 text-stone-700 cursor-pointer"
                          >
                            <Search className="w-4 h-4 text-[#135ca5]" />
                            <span>Suivre mon Dossier & Documents</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              openAuthModal('PILGRIM');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-stone-100 flex items-center gap-2 text-stone-700 cursor-pointer"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-stone-500" />
                            <span>Changer de compte pèlerin</span>
                          </button>
                        </>
                      )}

                      <div className="pt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openAuthModal('PILGRIM', 'REGISTER')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#f15a24] to-[#d94917] hover:from-[#d94917] hover:to-[#b83b10] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-white" />
                  <span>Créer un compte</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('PILGRIM', 'LOGIN')}
                  className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-stone-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <span>Connexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'ouverture des pages du Saint Coran (Mushaf 1 à 604 & Récitateurs) */}
      <QuranPagesModal
        isOpen={isQuranModalOpen}
        onClose={() => setIsQuranModalOpen(false)}
      />
    </header>
  );
};
