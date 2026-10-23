import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Wifi, CheckCircle2, FileText, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { getOfflineLastSync } from '../../utils/offlineStorage';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const lastSync = getOfflineLastSync();

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // When reconnected
  if (showReconnected) {
    return (
      <aside aria-label="Statut réseau" className="bg-emerald-600 text-white text-xs py-2 px-4 shadow-md sticky top-16 z-50 flex items-center justify-between no-print animate-in fade-in">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-200" />
            <span className="font-bold">Connexion Internet rétablie.</span>
            <span className="text-emerald-100 hidden sm:inline">
              Toutes les données et mises à jour de vol/visa sont désormais synchronisées en temps réel.
            </span>
          </div>
          <span className="text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded-full font-mono">En ligne</span>
        </div>
      </aside>
    );
  }

  // When offline
  if (!isOnline && !isDismissed) {
    return (
      <aside aria-label="Mode hors-ligne" className="bg-slate-900 border-b border-amber-500/40 text-white text-xs py-2.5 px-4 shadow-lg sticky top-16 z-50 no-print animate-in slide-in-from-top-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-300">Mode Hors-Ligne Actif (Service Worker)</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase">
                  Cache Local Opérationnel
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Vos <strong>billets d'avion</strong>, <strong>visas saoudiens</strong>, <strong>badges pèlerin</strong> et le <strong>Saint Coran</strong> restent consultables sans aucune connexion internet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {lastSync && (
              <span className="text-[10px] text-stone-400 font-mono hidden md:inline">
                Dernière synchro : {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-semibold transition-colors"
            >
              Masquer
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};
