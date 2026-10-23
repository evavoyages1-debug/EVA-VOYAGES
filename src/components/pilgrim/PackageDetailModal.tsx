import React from 'react';
import { Package } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Check, ArrowRight, Building2, Plane, Calendar, ShieldCheck, HeartHandshake, Phone, MessageCircle } from 'lucide-react';

interface PackageDetailModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRegister: (pkg: Package) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSelectRegister,
}) => {
  const { formatFCFA, agencyConfig } = useApp();

  if (!isOpen || !pkg) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-stone-200">
        {/* Header image with close button */}
        <div className="relative h-60 w-full bg-stone-900">
          <img
            src={pkg.imageUrl}
            alt={pkg.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-700 text-white">
                {pkg.type === 'HAJJ' ? 'HAJJ 2026 / 1447H' : 'OUMRA 1447H'}
              </span>
              <span className="text-xs text-amber-300 font-medium">{pkg.season}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{pkg.title}</h2>
            <p className="text-xs text-stone-300 mt-1">{pkg.subtitle}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key Logistics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Durée Totale</span>
              <span className="font-bold text-stone-900">{pkg.durationDays} Jours</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Vol Régulier</span>
              <span className="font-bold text-stone-900">{pkg.airline}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Aller</span>
              <span className="font-bold text-stone-900">{pkg.departureDate}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Retour</span>
              <span className="font-bold text-stone-900">{pkg.returnDate}</span>
            </div>
          </div>

          {/* Hotels Detail */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
              Hébergements Sélectionnés aux Lieux Saints
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Makkah Al Mukarramah</span>
                  <span className="text-xs text-amber-500 font-bold">{'★'.repeat(pkg.hotelMakkah.stars)}</span>
                </div>
                <div className="font-bold text-sm text-stone-900">{pkg.hotelMakkah.name}</div>
                <p className="text-xs text-stone-600">
                  À seulement <strong>{pkg.hotelMakkah.distanceMeters} mètres</strong> du parvis du Haram ({pkg.hotelMakkah.walkMinutes} min de marche).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Madinah Al Munawwarah</span>
                  <span className="text-xs text-amber-500 font-bold">{'★'.repeat(pkg.hotelMedina.stars)}</span>
                </div>
                <div className="font-bold text-sm text-stone-900">{pkg.hotelMedina.name}</div>
                <p className="text-xs text-stone-600">
                  À <strong>{pkg.hotelMedina.distanceMeters} mètres</strong> de la Mosquée du Prophète ﷺ ({pkg.hotelMedina.walkMinutes} min).
                </p>
              </div>
            </div>
          </div>

          {/* Pricing table by room configuration */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
              Tarifs par Type d'Occupation
            </h3>
            <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-stone-100 p-2.5 font-bold text-stone-700 text-center">
                <span>Chambre Quadruple</span>
                <span>Chambre Triple</span>
                <span>Chambre Double</span>
              </div>
              <div className="grid grid-cols-3 p-3 text-center divide-x divide-stone-100 font-mono font-bold text-stone-900">
                <span>{formatFCFA(pkg.roomPricing.quadruple)}</span>
                <span>{formatFCFA(pkg.roomPricing.triple)}</span>
                <span className="text-emerald-800">{formatFCFA(pkg.roomPricing.double)}</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              * Acompte minimum exigé à la réservation: {formatFCFA(pkg.minDepositFCFA)} (Paiement direct Wave & Orange Money accepté).
            </p>
          </div>

          {/* Inclusions */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
              Services & Prestations Inclus
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {pkg.inclusions.map((inc, i) => (
                <div key={i} className="flex items-start gap-2 text-stone-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Group Highlight */}
          <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-500/30 flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-emerald-400 shrink-0 shadow-sm flex items-center justify-center">
              <img
                src={
                  pkg.whatsappQrCodeUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    pkg.whatsappGroupLink || `https://chat.whatsapp.com/invite/EVA${pkg.id}`
                  )}`
                }
                alt="QR WhatsApp"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-white">Groupe WhatsApp Dédié Inclus</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366] text-stone-950">
                  {pkg.whatsappGroupName || 'Groupe Officiel'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                Dès votre inscription, vous intégrez le groupe WhatsApp officiel de cette formule pour suivre les formations spirituelles avec les Imams, recevoir les alertes vols et échanger avec vos guides.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-stone-500 block">Tarif à partir de</span>
            <div className="text-xl font-black text-stone-950 font-sans tabular-nums">
              {formatFCFA(pkg.priceFCFA)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectRegister(pkg);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <span>Réserver mon Package</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
