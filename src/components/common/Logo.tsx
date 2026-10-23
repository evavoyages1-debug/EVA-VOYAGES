import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  light?: boolean;
}

export const LOGO_URL = '/assets/aistudio/cropped-cropped-logo-fond-blanc-EvaVoyages512x512__1__9a3cb8d2.png';

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  light = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-200/60 shrink-0 flex items-center justify-center">
        <img
          src={LOGO_URL}
          alt="EVA VOYAGES Logo"
          className={`${sizeClasses[size]} object-contain`}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-base sm:text-lg leading-tight ${light ? 'text-white' : 'text-[#1254a2]'}`}>
              EVA <span className="text-[#ea5b13]">VOYAGES</span>
            </span>
          </div>
          <span className={`text-[10px] uppercase font-bold tracking-widest ${light ? 'text-orange-300' : 'text-slate-500'}`}>
            Hajj & Oumra
          </span>
        </div>
      )}
    </div>
  );
};
