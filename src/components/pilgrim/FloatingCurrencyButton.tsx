import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import { CurrencyConverterModal } from './CurrencyConverterModal';

export const FloatingCurrencyButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#135ca5] to-[#0c3f74] hover:from-[#166bc0] hover:to-[#135ca5] text-white shadow-xl hover:shadow-2xl flex items-center gap-2 border border-white/20 transition-all hover:scale-105 active:scale-95 no-print cursor-pointer group"
        title="Ouvrir le convertisseur de devises Riyal Saoudien ⇄ FCFA"
      >
        <div className="w-6 h-6 rounded-lg bg-amber-400 text-stone-900 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs group-hover:rotate-12 transition-transform">
          🇸🇦
        </div>
        <div className="text-left">
          <span className="font-extrabold text-xs block leading-tight">
            SAR ⇄ FCFA
          </span>
          <span className="text-[10px] text-amber-300 font-semibold block leading-none">
            Taux Direct
          </span>
        </div>
      </button>

      <CurrencyConverterModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
