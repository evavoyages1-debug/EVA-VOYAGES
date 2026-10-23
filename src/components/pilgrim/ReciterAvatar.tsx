import React, { useState } from 'react';
import { Reciter } from '../../data/quranMetadata';
import { Volume2 } from 'lucide-react';

interface ReciterAvatarProps {
  reciter: Reciter;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
  className?: string;
  showBadge?: boolean;
}

export const ReciterAvatar: React.FC<ReciterAvatarProps> = ({
  reciter,
  size = 'md',
  isPlaying = false,
  className = '',
  showBadge = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  }[size];

  const getInitials = (name: string) => {
    const clean = name.replace('Cheikh ', '').replace('El-', '').replace('Al-', '');
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div
        className={`relative ${sizeClasses} rounded-2xl overflow-hidden shadow-sm transition-transform duration-200 ${
          isPlaying
            ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white'
            : 'border-2 border-emerald-800/20'
        }`}
      >
        {!hasError ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-emerald-900/10 animate-pulse flex items-center justify-center text-emerald-800 font-bold">
                {getInitials(reciter.nameFrench)}
              </div>
            )}
            <img
              src={reciter.imageUrl}
              alt={reciter.nameFrench}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-full object-cover object-top transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-emerald-950 text-white flex flex-col items-center justify-center font-bold font-amiri">
            <span>{getInitials(reciter.nameFrench)}</span>
          </div>
        )}

        {/* Emerald overlay border with gold sheen */}
        <div className="absolute inset-0 rounded-2xl border border-amber-400/20 pointer-events-none" />
      </div>

      {/* Playing equalizer animation indicator */}
      {isPlaying && (
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white border-2 border-white flex items-center justify-center shadow-md animate-pulse"
          title="Récitation en cours"
        >
          <Volume2 className="w-2.5 h-2.5" />
        </span>
      )}

      {/* Reciter quick badge tag */}
      {showBadge && reciter.badge && (
        <span className="absolute -top-1.5 -left-1 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-700 text-white border border-emerald-600 shadow-2xs">
          {reciter.badge}
        </span>
      )}
    </div>
  );
};
