import React from 'react';
import { X } from 'lucide-react';
import { CurrencyConverterWidget } from './CurrencyConverterWidget';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl my-auto animate-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors shadow-xs"
          title="Fermer le convertisseur"
        >
          <X className="w-5 h-5" />
        </button>

        <CurrencyConverterWidget className="shadow-2xl" />
      </div>
    </div>
  );
};
