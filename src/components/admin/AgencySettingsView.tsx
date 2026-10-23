import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Save, CheckCircle2, ShieldCheck, Smartphone, Mail, Phone, MapPin } from 'lucide-react';

export const AgencySettingsView: React.FC = () => {
  const { agencyConfig, updateAgencyConfig } = useApp();

  const [form, setForm] = useState(agencyConfig);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Paramètres de l'Agence & Comptes Marchands</h2>
        <p className="text-xs text-stone-500">
          Personnalisez les coordonnées officielles d'EVA VOYAGES, les numéros marchands Wave et Orange Money, ainsi que le nom d'expéditeur SMS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 text-xs">
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">Paramètres de l'agence sauvegardés avec succès !</span>
          </div>
        )}

        {/* General Agency Identity */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
            Identité de l'Agence & Agrément
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Raison Sociale de l'Agence *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Numéro d'Agrément Ministériel *</label>
              <input
                type="text"
                required
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Slogan & Sous-titre officiel</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">E-mail de Contact & Facturation *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Téléphone Siège *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Numéro WhatsApp Assistance Pèlerins</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nom Expéditeur SMS (Sender ID)</label>
              <input
                type="text"
                maxLength={11}
                value={form.smsSenderName}
                onChange={(e) => setForm({ ...form, smsSenderName: e.target.value })}
                placeholder="EVA VOYAGES"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold"
              />
              <span className="text-[10px] text-stone-400">Max 11 caractères (ex: EVA VOYAGES)</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Adresse Géographique du Siège</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Mobile Money Gateways Config */}
        <div className="pt-4 border-t border-stone-200">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
            Passerelles de Paiement Wave & Orange Money
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-cyan-200 shadow-2xs flex items-center justify-center shrink-0">
                  <img
                    src={form.waveLogoUrl || '/assets/wave_logo.png'}
                    alt="Wave"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-cyan-900 block">Compte Marchand Wave</span>
              </div>
              <label className="block font-medium text-stone-600 text-[11px]">
                Numéro ou ID Marchand Wave
              </label>
              <input
                type="text"
                value={form.waveMerchantNumber}
                onChange={(e) => setForm({ ...form, waveMerchantNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-cyan-300 bg-white font-mono"
              />
              <span className="text-[10px] text-stone-500 block">
                Permet la génération automatique des demandes de push et du QR code officiel.
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white p-0.5 border border-orange-200 shadow-2xs flex items-center justify-center shrink-0">
                  <img
                    src={form.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                    alt="Orange Money"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-orange-950 block">Compte Marchand Orange Money</span>
              </div>
              <label className="block font-medium text-stone-600 text-[11px]">
                Code Marchand Orange Money / USSD
              </label>
              <input
                type="text"
                value={form.orangeMoneyMerchantNumber}
                onChange={(e) => setForm({ ...form, orangeMoneyMerchantNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-orange-300 bg-white font-mono"
              />
              <span className="text-[10px] text-stone-500 block">
                Code marchand pour validation via syntaxe USSD (#144#) et API.
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
};
