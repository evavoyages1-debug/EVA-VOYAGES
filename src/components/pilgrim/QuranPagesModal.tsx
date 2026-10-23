import React from 'react';
import { MushafPageReader } from './MushafPageReader';

interface QuranPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

export const QuranPagesModal: React.FC<QuranPagesModalProps> = ({
  isOpen,
  onClose,
  initialPage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-auto">
        <MushafPageReader
          initialPage={initialPage}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
