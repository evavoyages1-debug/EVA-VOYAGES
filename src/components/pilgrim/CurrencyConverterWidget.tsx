import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  Coins,
  CheckCircle2,
  Clock,
  Info,
  Sparkles,
  Wifi,
  WifiOff,
  Calculator,
} from 'lucide-react';
import {
  fetchSarToXofRate,
  formatCurrencyCFA,
  formatCurrencySAR,
  PILGRIM_EXPENSE_PRESETS,
  ExchangeRateResult,
  PilgrimExpensePreset,
} from '../../utils/currencyApi';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface CurrencyConverterWidgetProps {
  className?: string;
  isCompact?: boolean;
}

export const CurrencyConverterWidget: React.FC<CurrencyConverterWidgetProps> = ({
  className = '',
  isCompact = false,
}) => {
  const isOnline = useOnlineStatus();
  const [direction, setDirection] = useState<'SAR_TO_XOF' | 'XOF_TO_SAR'>('SAR_TO_XOF');
  const [sarInput, setSarInput] = useState<string>('50');
  const [xofInput, setXofInput] = useState<string>('');
  const [rateInfo, setRateInfo] = useState<ExchangeRateResult>({
    rate: 155.75,
    lastUpdated: 'Chargement...',
    isLive: false,
    source: 'FALLBACK',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Fetch exchange rate on mount
  const loadRate = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSarToXofRate();
      setRateInfo(data);
    } catch (err) {
      console.warn('Failed to fetch rate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRate();
  }, []);

  // Update converted value whenever inputs or rate change
  const currentRate = rateInfo.rate;

  const calculatedXof = (() => {
    const num = parseFloat(sarInput);
    if (isNaN(num) || num <= 0) return 0;
    return num * currentRate;
  })();

  const calculatedSar = (() => {
    const num = parseFloat(xofInput);
    if (isNaN(num) || num <= 0) return 0;
    return num / currentRate;
  })();

  const handleSelectPreset = (preset: PilgrimExpensePreset) => {
    setSelectedPresetId(preset.id);
    setDirection('SAR_TO_XOF');
    setSarInput(String(preset.sarAmount));
  };

  const handleToggleDirection = () => {
    if (direction === 'SAR_TO_XOF') {
      setDirection('XOF_TO_SAR');
      setXofInput(String(Math.round(calculatedXof || 50000)));
    } else {
      setDirection('SAR_TO_XOF');
      setSarInput(String(Math.round(calculatedSar || 50)));
    }
  };

  const quickSarAdd = (amount: number) => {
    setSelectedPresetId(null);
    setDirection('SAR_TO_XOF');
    const current = parseFloat(sarInput) || 0;
    setSarInput(String(current + amount));
  };

  return (
    <div className={`bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="bg-gradient-to-r from-[#0c3f74] to-[#135ca5] text-white p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Devises & Budget
                </span>
                <span className="text-[10px] font-bold text-amber-300 font-amiri">
                  ريال سعودي ⇄ فرنك سيفا
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Convertisseur Riyal Saoudien (SAR) ⇄ FCFA
              </h3>
            </div>
          </div>

          {/* Rate & Refresh button */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={loadRate}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Rafraîchir le taux de change en direct"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[11px] font-semibold hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </div>

        {/* Live Rate Badge */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                rateInfo.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-white font-mono font-bold text-sm">
              1 SAR = {currentRate.toFixed(2)} FCFA
            </span>
            <span className="text-blue-200 text-[11px]">
              (1 000 FCFA ≈ {(1000 / currentRate).toFixed(2)} SAR)
            </span>
          </div>

          <div className="text-[10px] text-blue-200 flex items-center gap-1">
            {rateInfo.isLive ? (
              <span className="inline-flex items-center gap-1 text-emerald-200 font-semibold">
                <Wifi className="w-3 h-3" /> Taux Direct Marché
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-200 font-semibold">
                <WifiOff className="w-3 h-3" /> Mode Hors-Ligne (Sauvegardé)
              </span>
            )}
            <span className="hidden md:inline">· {rateInfo.lastUpdated.substring(0, 22)}</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Converter Input Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
              {direction === 'SAR_TO_XOF' ? 'Montant à estimer en Riyals (SAR)' : 'Montant à estimer en FCFA'}
            </label>
            <button
              type="button"
              onClick={handleToggleDirection}
              className="text-xs font-bold text-[#135ca5] hover:text-[#0c3f74] flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#f15a24]" />
              <span>Inverser le sens</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            {/* Input Currency Box */}
            <div className="sm:col-span-5 bg-stone-50 p-4 rounded-2xl border border-stone-200 focus-within:border-[#135ca5] focus-within:bg-white transition-all">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>{direction === 'SAR_TO_XOF' ? 'Riyals Saoudiens (SAR)' : 'Francs CFA (XOF)'}</span>
                <span className="font-bold">{direction === 'SAR_TO_XOF' ? '🇸🇦 SAR (ر.س)' : '🇸🇳 FCFA'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={direction === 'SAR_TO_XOF' ? sarInput : xofInput}
                  onChange={(e) => {
                    setSelectedPresetId(null);
                    if (direction === 'SAR_TO_XOF') {
                      setSarInput(e.target.value);
                    } else {
                      setXofInput(e.target.value);
                    }
                  }}
                  placeholder="0"
                  className="w-full text-2xl font-black text-stone-900 bg-transparent border-none p-0 focus:outline-none"
                />
                <span className="text-sm font-bold text-stone-400">
                  {direction === 'SAR_TO_XOF' ? 'SAR' : 'FCFA'}
                </span>
              </div>
            </div>

            {/* Direction Indicator */}
            <div className="sm:col-span-1 flex items-center justify-center">
              <button
                type="button"
                onClick={handleToggleDirection}
                className="w-10 h-10 rounded-full bg-[#135ca5] hover:bg-[#0c3f74] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Permuter les devises"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Result Currency Box */}
            <div className="sm:col-span-5 bg-gradient-to-br from-emerald-50/60 to-blue-50/40 p-4 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>{direction === 'SAR_TO_XOF' ? 'Équivalent en Francs CFA' : 'Équivalent en Riyals'}</span>
                <span className="font-bold text-emerald-800">
                  {direction === 'SAR_TO_XOF' ? '🇸🇳 FCFA' : '🇸🇦 SAR (ر.س)'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-black text-emerald-900 truncate">
                  {direction === 'SAR_TO_XOF'
                    ? formatCurrencyCFA(calculatedXof)
                    : formatCurrencySAR(calculatedSar)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold shrink-0">
                  Calculé
                </span>
              </div>
            </div>
          </div>

          {/* Quick Increments Buttons (when converting SAR) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-stone-500 mr-1">Raccourcis Riyal :</span>
            {[5, 10, 20, 50, 100, 200, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setDirection('SAR_TO_XOF');
                  setSarInput(String(amt));
                  setSelectedPresetId(null);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sarInput === String(amt) && direction === 'SAR_TO_XOF'
                    ? 'bg-[#135ca5] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {amt} SAR
              </button>
            ))}
            <button
              type="button"
              onClick={() => quickSarAdd(10)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
            >
              +10 SAR
            </button>
            <button
              type="button"
              onClick={() => quickSarAdd(50)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
            >
              +50 SAR
            </button>
          </div>
        </div>

        {/* Section: Dépenses types du Pèlerin en Arabie Saoudite */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f15a24]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Dépenses Types du Pèlerin à La Mecque & Médine
              </h4>
            </div>
            <span className="text-[11px] text-stone-400">Cliquez pour convertir</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PILGRIM_EXPENSE_PRESETS.map((preset) => {
              const cfaValue = preset.sarAmount * currentRate;
              const isSelected = selectedPresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#135ca5] bg-blue-50/70 shadow-xs ring-2 ring-[#135ca5]/20'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xl shrink-0">{preset.icon}</span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 shrink-0">
                      {preset.sarAmount} SAR
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-bold text-stone-900 leading-tight line-clamp-1">
                      {preset.name}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 mt-1">
                      ≈ {formatCurrencyCFA(cfaValue)}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Tableau mémo des billets saoudiens (Cheat Sheet) */}
        {!isCompact && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#135ca5]" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                Guide Mémo des Coupures de Billets Saoudiens
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {[1, 5, 10, 20, 50, 100, 200, 500].map((note) => {
                const cfa = note * currentRate;
                return (
                  <div
                    key={note}
                    onClick={() => {
                      setDirection('SAR_TO_XOF');
                      setSarInput(String(note));
                      setSelectedPresetId(null);
                    }}
                    className="cursor-pointer p-2.5 rounded-2xl bg-stone-50 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 text-center transition-all group"
                  >
                    <span className="text-xs font-black text-[#135ca5] block group-hover:scale-105 transition-transform">
                      {note} SAR
                    </span>
                    <span className="text-[11px] font-bold text-stone-700 block mt-0.5">
                      {formatCurrencyCFA(cfa)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Advisory footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              Les bureaux de change à Makkah et Médine appliquent de légères commissions (1 à 2%). Les cartes bancaires sénégalaises (Visa / Mastercard) sont acceptées dans tous les centres commerciaux et supermarchés saoudiens.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
