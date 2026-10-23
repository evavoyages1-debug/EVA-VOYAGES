import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed in standalone mode
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Application installée sur cet appareil (Prête hors-ligne)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 5000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (!isInstallable && !isIOS) {
    // Browser doesn't support beforeinstallprompt or not iOS
    return null;
  }

  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#f15a24] to-[#d94917] hover:brightness-110 text-white font-bold text-xs shadow-xs transition-all ${className}`}
          title="Installer l'application pour un accès hors-connexion complet"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Installer l'App</span>
          <span className="sm:hidden">App</span>
          <span className="text-[10px] bg-black/20 px-1.5 py-0.2 rounded-md font-extrabold uppercase">
            Hors-Ligne
          </span>
        </button>

        {/* iOS Safari Installation Guide Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative text-stone-900">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#135ca5] flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-base font-black text-center text-stone-900 mb-1">
                Installer EVA Voyages sur iPhone / iPad
              </h3>
              <p className="text-xs text-stone-600 text-center mb-5">
                Consultez vos billets d'avion, visas saoudiens et le Saint Coran même sans réseau internet à La Mecque et Médine.
              </p>

              <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#135ca5] text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    Appuyez sur le bouton <strong>Partager</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 ml-1" /> dans la barre Safari au bas de votre écran.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#135ca5] text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="inline w-3.5 h-3.5 text-stone-700 ml-1" />.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#135ca5] text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    Touchez <strong>Ajouter</strong> en haut à droite. L'icône EVA Voyages apparaîtra parmi vos applications.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="mt-5 w-full py-2.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Card / Banner variant
  return (
    <>
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-[#135ca5] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-blue-800 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Smartphone className="w-5 h-5 text-[#f15a24]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              Installer l'application EVA Voyages
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                Accès Hors-Ligne
              </span>
            </h4>
            <p className="text-xs text-blue-100">
              Retrouvez vos billets d'avion, votre visa, vos reçus et le Saint Coran complet même sans connexion internet en Arabie Saoudite.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstallClick}
          className="px-4 py-2 bg-[#f15a24] hover:bg-[#d94917] text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-105 shrink-0 flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>{isIOS ? "Guide d'installation iPhone" : 'Installer Maintenant'}</span>
        </button>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative text-stone-900">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-[#135ca5] flex items-center justify-center mb-4 mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-center text-stone-900 mb-1">
              Installer EVA Voyages sur iPhone / iPad
            </h3>
            <p className="text-xs text-stone-600 text-center mb-5">
              Consultez vos billets d'avion, visas saoudiens et le Saint Coran même sans réseau internet.
            </p>

            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#135ca5] text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  Appuyez sur le bouton <strong>Partager</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600 ml-1" /> dans la barre Safari au bas de votre écran.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#135ca5] text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  Faites défiler vers le bas et sélectionnez <strong>Sur l'écran d'accueil</strong> <PlusSquare className="inline w-3.5 h-3.5 text-stone-700 ml-1" />.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#135ca5] text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  Touchez <strong>Ajouter</strong> en haut à droite.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
