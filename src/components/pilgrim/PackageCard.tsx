import React, { useState } from 'react';
import { Package } from '../../types';
import { useApp } from '../../context/AppContext';
import { MapPin, Plane, Users, Check, ArrowRight, Star, Building2, Calendar, MessageCircle } from 'lucide-react';

interface PackageCardProps {
  pkg: Package;
  onOpenDetails: (pkg: Package) => void;
  onSelectForRegister: (pkg: Package) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onOpenDetails,
  onSelectForRegister,
}) => {
  const { formatFCFA } = useApp();
  const [roomType, setRoomType] = useState<'quadruple' | 'triple' | 'double'>('quadruple');

  const currentPrice = pkg.roomPricing[roomType] || pkg.priceFCFA;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Top Image Banner */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-stone-900">
        <img
          src={pkg.imageUrl}
          alt={pkg.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // CSS fallback if image asset fails
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent" />

        {/* Top Badges (Interactive clean badges) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#164e96] text-white backdrop-blur-md shadow-sm">
            {pkg.type === 'HAJJ' ? 'HAJJ 2026' : 'OUMRA'}
          </span>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#f15a24] text-white backdrop-blur-md shadow-sm">
            {pkg.season}
          </span>
        </div>

        {/* Bottom Hero Info */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl font-bold tracking-tight text-white line-clamp-1">{pkg.title}</h3>
          <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">{pkg.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Unboxed Metadata (Zero-pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 border-b border-stone-100 pb-3">
          <span className="font-semibold text-stone-800">{pkg.durationDays} Jours</span>
          <span aria-hidden="true">·</span>
          <span>Départ: {pkg.departureCity}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#164e96]">{pkg.flightType} ({pkg.airline})</span>
        </div>

        {/* Hotels Proximity Section */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-stone-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Makkah</span>
            <div className="flex items-center gap-1 font-semibold text-stone-800 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#f15a24] shrink-0" />
              <span className="truncate">{pkg.hotelMakkah.name}</span>
            </div>
            <span className="text-[11px] text-[#164e96] font-semibold">
              À {pkg.hotelMakkah.distanceMeters}m ({pkg.hotelMakkah.walkMinutes} min à pied)
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">Madinah</span>
            <div className="flex items-center gap-1 font-semibold text-stone-800 truncate">
              <Building2 className="w-3.5 h-3.5 text-[#f15a24] shrink-0" />
              <span className="truncate">{pkg.hotelMedina.name}</span>
            </div>
            <span className="text-[11px] text-[#164e96] font-semibold">
              À {pkg.hotelMedina.distanceMeters}m ({pkg.hotelMedina.walkMinutes} min à pied)
            </span>
          </div>
        </div>

        {/* Room selection switcher */}
        <div>
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
            <span className="font-medium">Formule Hébergement :</span>
            <span className="text-[11px] text-stone-400">Tarif par pèlerin</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setRoomType('quadruple')}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                roomType === 'quadruple'
                  ? 'bg-white text-[#164e96] shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Quadruple
            </button>
            <button
              type="button"
              onClick={() => setRoomType('triple')}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                roomType === 'triple'
                  ? 'bg-white text-[#164e96] shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Triple
            </button>
            <button
              type="button"
              onClick={() => setRoomType('double')}
              className={`py-1.5 px-2 rounded-lg transition-all ${
                roomType === 'double'
                  ? 'bg-white text-[#f15a24] shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Double (VIP)
            </button>
          </div>
        </div>

        {/* Key Inclusions preview (3 items) + WhatsApp group badge */}
        <div className="space-y-1.5">
          {pkg.inclusions.slice(0, 2).map((inc, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-stone-600">
              <Check className="w-3.5 h-3.5 text-[#164e96] shrink-0 mt-0.5" />
              <span className="line-clamp-1">{inc}</span>
            </div>
          ))}
          <div className="flex items-start gap-2 text-xs text-emerald-800 font-semibold">
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0 mt-0.5 fill-current" />
            <span className="line-clamp-1">Groupe WhatsApp officiel dédié inclus</span>
          </div>
        </div>

        {/* Price & Availability & Actions */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[11px] text-stone-500 block font-medium">Tarif Tout Compris</span>
              <div className="text-xl sm:text-2xl font-black text-slate-950 font-sans tabular-nums">
                {formatFCFA(currentPrice)}
              </div>
              <span className="text-[10px] text-stone-400">
                Acompte min: {formatFCFA(pkg.minDepositFCFA)}
              </span>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs text-stone-600">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-semibold text-stone-900 tabular-nums">{pkg.spotsRemaining}</span>
                <span className="text-stone-400">places rest.</span>
              </div>
              <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-[#164e96] h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round(((pkg.spotsTotal - pkg.spotsRemaining) / pkg.spotsTotal) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onOpenDetails(pkg)}
              className="py-2.5 px-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
            >
              Programme complet
            </button>
            <button
              type="button"
              onClick={() => onSelectForRegister(pkg)}
              className="py-2.5 px-3 rounded-xl bg-[#164e96] hover:bg-[#113e79] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>S'inscrire</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#f97316]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
