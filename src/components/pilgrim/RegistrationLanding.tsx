import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Mail,
  Calendar,
  Compass,
  Search,
  Check,
  Phone,
  CreditCard,
  FileCheck,
} from 'lucide-react';

interface RegistrationLandingProps {
  onStartRegistration: (pkgId?: string) => void;
}

export const RegistrationLanding: React.FC<RegistrationLandingProps> = ({ onStartRegistration }) => {
  const {
    packages,
    currentUser,
    registerClientAccount,
    switchToBackOffice,
    isBackOfficeDomain,
    formatFCFA,
    setPilgrimActiveTab,
    setTrackingQueryCode,
    getMyDossier,
  } = useApp();

  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+221 77 ');
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(packages[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [accountCreatedSuccess, setAccountCreatedSuccess] = useState<boolean>(false);

  const myDossier = getMyDossier();

  // Live input change with silent auto-switch for back-office
  const handleEmailChange = (val: string) => {
    setEmail(val);
    const clean = val.trim().toLowerCase();
    if (isBackOfficeDomain(clean)) {
      setTimeout(() => {
        switchToBackOffice(clean, `${prenom} ${nom}`.trim());
      }, 500);
    }
  };

  const handleAccountAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!nom.trim() || !prenom.trim() || !cleanEmail) {
      alert('Veuillez renseigner votre Nom, Prénom et Adresse électronique.');
      return;
    }

    // Silent back-office switch if domain matches
    if (isBackOfficeDomain(cleanEmail)) {
      switchToBackOffice(cleanEmail, `${prenom} ${nom}`.trim());
      return;
    }

    setIsSubmitting(true);
    registerClientAccount(
      `${prenom} ${nom}`.trim(),
      cleanEmail,
      phone.trim() || '+221 77 000 00 00',
      undefined,
      prenom.trim(),
      nom.trim()
    );

    setAccountCreatedSuccess(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onStartRegistration(selectedFormulaId);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto pb-14 space-y-8 animate-fadeIn">
      {/* 1. TOP HERO HEADER WITH THE TWO OFFICIAL PHOTOS */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Top Logo Bar */}
        <div className="p-4 sm:p-6 bg-white border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* PHOTO 1: EVA VOYAGES OFFICIAL LOGO */}
            <div className="p-2 bg-stone-50 rounded-2xl border border-stone-200 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src="/assets/eva_voyages_logo.png"
                alt="EVA Voyages"
                className="h-14 sm:h-16 w-auto object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
            <div>
              <span className="text-xs font-bold text-[#f15a24] uppercase tracking-wider block">
                Portail Officiel d'Inscription
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#135ca5] tracking-tight">
                EVA Voyages · Hajj 1447H / 2026 & Oumra
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Agence Agréée Ministère des Affaires Étrangères & Ministère du Hajj Saoudien
              </p>
            </div>
          </div>

          {/* Quick dossier shortcut if already registered */}
          {myDossier ? (
            <button
              type="button"
              onClick={() => {
                setTrackingQueryCode(myDossier.trackingCode);
                setPilgrimActiveTab('TRACKING');
              }}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              <span>Voir mon dossier ({myDossier.trackingCode})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPilgrimActiveTab('TRACKING')}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-stone-500" />
              <span>Déjà inscrit ? Suivre mon dossier</span>
            </button>
          )}
        </div>

        {/* PHOTO 2: HOLY KAABA HERO SHOWCASE */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
          <img
            src="/assets/kaaba_hero_home.jpg"
            alt="Sainte Kaaba à La Mecque"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/src/assets/images/hero_mecca_kaaba_1792417053237.jpg';
            }}
          />
          {/* Subtle gradient overlay to make text crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

          {/* Floating Sacred Calligraphy & Welcome Badge */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 text-white">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-amber-300">
                <span>Campagne Officielle 1447H / 2026</span>
              </div>
              <p className="font-amiri text-2xl sm:text-4xl text-amber-300 font-bold tracking-wide drop-shadow-md">
                لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight drop-shadow-sm">
                Votre voyage sacré commence ici avec l'accompagnement d'excellence d'EVA Voyages
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onStartRegistration(selectedFormulaId)}
              className="px-6 py-3.5 bg-gradient-to-r from-[#f15a24] to-[#ff7a45] hover:brightness-110 text-white rounded-2xl text-sm font-bold shadow-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Accéder au formulaire</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN SECTION: COMPTE PÈLERIN & ÉTAPES D'INSCRIPTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Compte Pèlerin Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#135ca5] to-[#f15a24] text-white flex items-center justify-center shrink-0 shadow-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                1ère Étape : Création de votre Compte Pèlerin
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Renseignez votre Nom, Prénom et Adresse électronique pour ouvrir votre espace client.
              </p>
            </div>
          </div>

          {accountCreatedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Compte client enregistré avec succès !</p>
                <p className="text-stone-600 mt-0.5">Redirection vers le formulaire d'inscription...</p>
              </div>
            </div>
          )}

          {currentUser?.role === 'PILGRIM' ? (
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#135ca5] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Vous êtes connecté(e)</span>
                </span>
                <span className="text-[11px] font-mono text-stone-500">{currentUser.email}</span>
              </div>
              <p className="text-xs text-stone-700">
                Pèlerin : <strong>{currentUser.name}</strong>. Vous pouvez poursuivre directement votre inscription ou sélectionner votre formule ci-dessous.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onStartRegistration(selectedFormulaId)}
                  className="px-5 py-2.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continuer vers le formulaire d'inscription</span>
                  <ArrowRight className="w-4 h-4 text-[#f15a24]" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAccountAndStart} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Prénom du pèlerin *
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Ibrahima"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: Ndiaye"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Adresse électronique (E-mail) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="ibrahima.ndiaye@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Numéro de téléphone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Package selector preview */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Formule souhaitée pour votre pèlerinage *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {packages.map((pkg) => {
                    const isSelected = selectedFormulaId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedFormulaId(pkg.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#135ca5] bg-blue-50/80 shadow-xs ring-1 ring-[#135ca5]'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            pkg.type === 'HAJJ' ? 'bg-[#135ca5] text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {pkg.type}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#f15a24]">
                            {formatFCFA(pkg.priceFCFA)}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-stone-900 truncate">{pkg.title}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{pkg.season}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Créer mon Compte & Démarrer l'Inscription</span>
                  <ArrowRight className="w-4 h-4 text-[#f15a24]" />
                </button>

                <button
                  type="button"
                  onClick={() => onStartRegistration(selectedFormulaId)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 py-2 text-center underline cursor-pointer"
                >
                  Accéder directement sans créer de compte
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column (5 cols): Guarantees & Step Guide */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#f15a24]" />
              <span>Votre Parcours d'Inscription en 4 Étapes</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#135ca5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="text-xs font-bold text-stone-900">Choix de la Formule & Chambre</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Chambre Quadruple, Triple ou Double selon votre préférence de confort.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#135ca5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="text-xs font-bold text-stone-900">Identité & Scanner de Passeport HD</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Numérisation optique MRZ conforme OACI avec extraction automatique.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#135ca5] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="text-xs font-bold text-stone-900">Dépôt des Pièces Justificatives</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Passeport biométrique, photo fond blanc et certificat médical.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#f15a24] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <p className="text-xs font-bold text-stone-900">Règlement Wave ou Orange Money</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Acompte ou paiement intégral avec reçu officiel et QR code immédiat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Agency Guarantees Badge */}
          <div className="bg-gradient-to-br from-slate-900 to-[#135ca5] text-white rounded-3xl p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                Garanties EVA Voyages
              </h4>
            </div>
            <ul className="text-xs space-y-2 text-stone-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Agrément officiel Hajj 1447H & Oumra</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Intégration automatique dans le groupe WhatsApp dédié</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Suivi confidentiel et personnalisé de votre dossier</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Émission instantanée du reçu d'encaissement</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
