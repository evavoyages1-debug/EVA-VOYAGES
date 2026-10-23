import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, BookOpen, ShieldAlert, CheckCircle2, Phone, MessageCircle, MapPin, Heart } from 'lucide-react';
import { CurrencyConverterWidget } from './CurrencyConverterWidget';

export const PilgrimGuide: React.FC = () => {
  const { agencyConfig } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Hero */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="text-amber-400 font-amiri text-2xl block">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
          <h2 className="text-2xl font-bold tracking-tight">Guide & Rituels du Pèlerin</h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            Pour vivre un pèlerinage serein, retrouvez les étapes des rituels, le trousseau médical requis et l'assistance continue de l'équipe {agencyConfig.name}.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rites du Hajj */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>Chronologie des Rituels du Hajj</span>
          </div>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <strong className="text-stone-900 block mb-0.5">8 Dhul-Hijjah (Jour de Tarwiyah)</strong>
              <span>Mise en état d'Ihram, départ pour Mina et accomplissement des 5 prières.</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <strong className="text-emerald-950 block mb-0.5">9 Dhul-Hijjah (Station sacrée d'Arafat)</strong>
              <span>Le pilier majeur du Hajj : douas et invocations jusqu'au coucher du soleil, puis nuitée à Muzdalifah.</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <strong className="text-stone-900 block mb-0.5">10 Dhul-Hijjah (Jour de l'Aïd al-Adha)</strong>
              <span>Lapidation de Jamarat Al-Aqaba, sacrifice, rasage/coupe et Tawaf Al-Ifadah au Haram.</span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
              <strong className="text-stone-900 block mb-0.5">11, 12 et 13 Dhul-Hijjah (Jours de Tashriq)</strong>
              <span>Séjour à Mina, lapidation des trois stèles et Tawaf d'adieu (Wadaa).</span>
            </div>
          </div>
        </div>

        {/* Préparation & Conseils Pratiques */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <Heart className="w-5 h-5 text-emerald-700" />
            <span>Préparation & Conseils Pratiques de Voyage</span>
          </div>

          <div className="space-y-3 text-xs text-stone-600">
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Trousse Médicale Personnelle</strong>
                <span>Prévoyez vos ordonnances régulières en double et une réserve de médicaments pour l'ensemble du séjour.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Chaussures & Confort de Marche</strong>
                <span>Prévoyez des sandales souples et confortables adaptées aux longues marches du Tawaf et du Sa'y.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Hydratation & Protection Solaire</strong>
                <span>Hydratez-vous abondamment (eau Zamzam disponible partout) et munissez-vous d'un petit parapluie contre le soleil.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Converter Widget Section */}
      <CurrencyConverterWidget />

      {/* Direct Assistance CTA */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block mb-1">
            Permanence Médicale & Religieuse
          </span>
          <h3 className="text-lg font-bold">Besoin d'une assistance en direct ?</h3>
          <p className="text-xs text-emerald-100 mt-0.5">
            Nos Imams et délégués sont à votre écoute à Dakar, Jeddah, Makkah et Médine.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:${agencyConfig.phone}`}
            className="px-4 py-2.5 bg-white text-emerald-900 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-stone-100"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{agencyConfig.phone}</span>
          </a>
          <a
            href={`https://wa.me/${agencyConfig.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp : {agencyConfig.whatsapp || '+221 78 639 10 00'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
