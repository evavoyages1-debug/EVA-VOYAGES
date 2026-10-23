import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Mail, X, CheckCircle2, ChevronRight, Smartphone } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { recentLiveToast, clearLiveToast, setCurrentView, setAdminActiveTab, setSelectedDossierId, dossiers } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  if (!recentLiveToast) return null;

  const isSMS = recentLiveToast.type === 'SMS';

  const handleOpenDetail = () => {
    setModalOpen(true);
  };

  return (
    <>
      {/* Floating push notification banner */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-stone-900/95 backdrop-blur-md text-stone-100 rounded-2xl p-4 shadow-2xl border border-stone-700/80">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isSMS ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/50' : 'bg-amber-900/60 text-amber-400 border border-amber-700/50'
              }`}
            >
              {isSMS ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {isSMS ? 'SMS Envoyé en Direct' : 'Email Confirmé'}
                </span>
                <span className="text-[10px] text-stone-400 tabular-nums">À l'instant</span>
              </div>

              <p className="text-xs font-medium text-stone-200 line-clamp-2 leading-relaxed">
                {isSMS ? recentLiveToast.message : recentLiveToast.subject || recentLiveToast.message}
              </p>

              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={handleOpenDetail}
                  className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
                >
                  <span>Afficher le message</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <span className="text-stone-400">
                  {recentLiveToast.recipientPhone || recentLiveToast.recipientEmail}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={clearLiveToast}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full preview modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">
                  {isSMS ? 'Simulation Réception SMS' : 'Simulation Réception E-mail'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile screen mock */}
            <div className="p-5 bg-stone-50">
              {isSMS ? (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-3 border-b border-stone-100 pb-2">
                    <span className="font-semibold text-stone-800">Émetteur: {recentLiveToast.sender}</span>
                    <span className="tabular-nums">Aujourd'hui</span>
                  </div>
                  <div className="bg-emerald-50 text-emerald-950 p-3.5 rounded-xl rounded-tl-sm text-sm leading-relaxed border border-emerald-100">
                    {recentLiveToast.message}
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-[11px] text-stone-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Remis à {recentLiveToast.recipientPhone}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                  <div className="border-b border-stone-100 pb-2 text-xs text-stone-600 space-y-1">
                    <div>
                      <span className="text-stone-400">De:</span> {recentLiveToast.sender}
                    </div>
                    <div>
                      <span className="text-stone-400">À:</span> {recentLiveToast.recipientEmail}
                    </div>
                    <div>
                      <span className="text-stone-400">Objet:</span>{' '}
                      <span className="font-semibold text-stone-900">{recentLiveToast.subject}</span>
                    </div>
                  </div>
                  <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed font-sans bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {recentLiveToast.message}
                  </div>
                  <div className="text-[11px] text-stone-400 text-right">
                    Envoyé avec succès par le serveur de messagerie EVA VOYAGES
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
