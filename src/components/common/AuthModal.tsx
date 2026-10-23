import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X,
  ShieldCheck,
  User,
  Lock,
  Smartphone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  LogOut,
  Building2,
  Check,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalRole,
    authModalMode,
    setAuthModalMode,
    currentUser,
    loginAsAdmin,
    loginAsPilgrim,
    loginWithCredentials,
    registerClientAccount,
    switchToBackOffice,
    isBackOfficeDomain,
    logout,
    agencyConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<UserRole>(authModalRole || 'PILGRIM');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(authModalMode || 'REGISTER');

  // Login inputs
  const [identifier, setIdentifier] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register inputs (Nom, Prénom, Adresse électronique)
  const [regFirstName, setRegFirstName] = useState<string>('');
  const [regLastName, setRegLastName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('+221 77 ');
  const [regTrackingCode, setRegTrackingCode] = useState<string>('');

  // Auto-switch indicator state
  const [isAutoSwitching, setIsAutoSwitching] = useState<boolean>(false);
  const [autoSwitchDomain, setAutoSwitchDomain] = useState<string>('');

  useEffect(() => {
    setActiveTab(authModalRole);
    if (authModalMode) {
      setAuthMode(authModalMode);
    }
    setErrorMessage(null);
    setIsAutoSwitching(false);
    if (authModalRole === 'ADMIN') {
      setIdentifier('direction@evavoyage.com');
      setPasscode('admin2026');
    } else {
      setIdentifier('amadou.diop.dakar@gmail.com');
      setPasscode('pelerin2026');
    }
  }, [authModalRole, authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setErrorMessage(null);
    setIsAutoSwitching(false);
    setIdentifier(role === 'ADMIN' ? 'direction@evavoyage.com' : 'amadou.diop.dakar@gmail.com');
    setPasscode(role === 'ADMIN' ? 'admin2026' : 'pelerin2026');
  };

  // Live detection of @evavoyage.com on Register Email field
  const handleRegisterEmailChange = (val: string) => {
    setRegEmail(val);
    setErrorMessage(null);
    const clean = val.trim().toLowerCase();

    if (isBackOfficeDomain(clean)) {
      setIsAutoSwitching(true);
      setAutoSwitchDomain(clean);
      const timer = setTimeout(() => {
        const fullName = `${regFirstName} ${regLastName}`.trim() || undefined;
        switchToBackOffice(clean, fullName);
        setIsAutoSwitching(false);
        setIsAuthModalOpen(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setIsAutoSwitching(false);
    }
  };

  // Live detection of @evavoyage.com on Login Identifier field
  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    setErrorMessage(null);
    const clean = val.trim().toLowerCase();

    if (isBackOfficeDomain(clean)) {
      setIsAutoSwitching(true);
      setAutoSwitchDomain(clean);
      const timer = setTimeout(() => {
        switchToBackOffice(clean);
        setIsAutoSwitching(false);
        setIsAuthModalOpen(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setIsAutoSwitching(false);
    }
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clean = identifier.trim().toLowerCase();
    if (isBackOfficeDomain(clean)) {
      switchToBackOffice(clean);
      setIsAuthModalOpen(false);
      return;
    }

    const result = loginWithCredentials(activeTab, identifier, passcode);
    if (!result.success) {
      setErrorMessage(result.error || 'Identifiant ou mot de passe incorrect.');
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!regLastName.trim() || !regFirstName.trim() || !cleanEmail) {
      setErrorMessage('Veuillez renseigner votre Nom, Prénom et Adresse électronique.');
      return;
    }

    // If @evavoyage.com domain entered, auto-switch to back-office!
    if (isBackOfficeDomain(cleanEmail)) {
      switchToBackOffice(cleanEmail, `${regFirstName} ${regLastName}`.trim());
      setIsAuthModalOpen(false);
      return;
    }

    registerClientAccount(
      `${regFirstName} ${regLastName}`.trim(),
      cleanEmail,
      regPhone,
      regTrackingCode || undefined,
      regFirstName.trim(),
      regLastName.trim()
    );
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full my-auto overflow-hidden shadow-2xl border border-stone-200">
        {/* Header with Agency Branding */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 px-1 bg-white rounded-xl flex items-center justify-center shadow-xs border border-white/20 shrink-0">
              <img src="/logo.png" alt="EVA Voyages" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight">Espace Pèlerins & Back-Office</h3>
              <p className="text-[11px] text-stone-400">
                Création de Compte & Accès Sécurisé · {agencyConfig.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Logged In Notice if exists */}
        {currentUser && (
          <div className="p-3.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-stone-600 truncate max-w-[260px]">
                Actuellement connecté : <strong>{currentUser.name}</strong> ({currentUser.role === 'ADMIN' ? '👑 Back-Office' : '👤 Espace Client'})
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Se déconnecter</span>
            </button>
          </div>
        )}

        {/* Portal Switcher Tabs (Visible if opened for admin or allow toggling) */}
        {authModalRole === 'ADMIN' ? (
          <div className="grid grid-cols-2 p-2 bg-stone-100/80 border-b border-stone-200 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('PILGRIM')}
              className={`py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'PILGRIM'
                  ? 'bg-[#135ca5] text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4 text-[#f15a24]" />
              <span>Espace Client</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('ADMIN')}
              className={`py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Back-Office Sécurisé</span>
            </button>
          </div>
        ) : (
          <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-[#135ca5] font-semibold">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#f15a24]" />
              <span>Portail Officiel des Pèlerins · Création de Compte & Suivi</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Campagne 1447H</span>
          </div>
        )}

        {/* Discreet Transition Indicator */}
        {isAutoSwitching && (
          <div className="p-3.5 bg-slate-900 text-white text-xs flex items-center gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-xs">Connexion sécurisée en cours...</p>
              <p className="text-[11px] text-stone-300">
                Accès en cours de validation...
              </p>
            </div>
          </div>
        )}

        {/* Portal Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: CLIENT PILGRIM SPACE */}
          {activeTab === 'PILGRIM' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    {authMode === 'REGISTER' ? 'Création de Compte Pèlerin' : 'Connexion Espace Client'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {authMode === 'REGISTER'
                      ? 'Renseignez vos coordonnées pour créer votre compte et suivre votre dossier personnel.'
                      : 'Accédez à votre dossier de voyage, documents et versements.'}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] bg-stone-100 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('REGISTER');
                      setAuthModalMode('REGISTER');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      authMode === 'REGISTER' ? 'bg-[#135ca5] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Créer Compte
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('LOGIN');
                      setAuthModalMode('LOGIN');
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      authMode === 'LOGIN' ? 'bg-[#135ca5] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Connexion
                  </button>
                </div>
              </div>

              {/* Error notice */}
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {authMode === 'REGISTER' ? (
                /* REGISTRATION FORM (NOM, PRENOM, ADRESSE ELECTRONIQUE) */
                <form onSubmit={handleRegisterClient} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Prénom du pèlerin *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Ex: Ibrahima"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Nom de famille *
                      </label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Ex: Ndiaye"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Adresse électronique (E-mail) *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => handleRegisterEmailChange(e.target.value)}
                        placeholder="ibrahima.ndiaye@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Téléphone Mobile (SMS de confirmation)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+221 77 000 00 00"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Code dossier existant (Optionnel si vous vous êtes déjà inscrit)
                    </label>
                    <input
                      type="text"
                      value={regTrackingCode}
                      onChange={(e) => setRegTrackingCode(e.target.value.toUpperCase())}
                      placeholder="Ex: EVA-HJ26-9284"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <span>Créer mon Compte Pèlerin & Continuer</span>
                    <ArrowRight className="w-4 h-4 text-[#f15a24]" />
                  </button>

                  <div className="pt-2 text-center">
                    <span className="text-[11px] text-stone-500">
                      Vous avez déjà un compte ?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('LOGIN')}
                        className="text-[#135ca5] font-bold hover:underline"
                      >
                        Se connecter
                      </button>
                    </span>
                  </div>
                </form>
              ) : (
                /* LOGIN FORM */
                <form onSubmit={handleSubmitLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Adresse E-mail ou Numéro Mobile
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => handleIdentifierChange(e.target.value)}
                        placeholder="amadou.diop.dakar@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Mot de passe ou Code Dossier (ex: EVA-HJ26-9284)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="password"
                        required
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    <span>Se Connecter à l'Espace Client</span>
                    <ArrowRight className="w-4 h-4 text-[#f15a24]" />
                  </button>

                  {/* 1-Click Demo Client Login */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        loginAsPilgrim('EVA-HJ26-9284');
                        setIsAuthModalOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-blue-50/80 hover:bg-blue-100 text-[#135ca5] border border-blue-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#f15a24]" />
                      <span>Connexion Démo Client : El Hadji Amadou Diop</span>
                    </button>
                    <span className="text-[10px] text-stone-400 block text-center">
                      Dossier Hajj Prestige rattaché · seul ce dossier sera affiché dans l'espace client.
                    </span>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: BACK-OFFICE ADMIN SPACE */}
          {activeTab === 'ADMIN' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#f15a24] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Accès Agence : Domaine @evavoyage.com Exigé</span>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Le Back-Office est strictement réservé au personnel de l'agence. Toute adresse se terminant par <strong>@evavoyage.com</strong> (ou evavoyages1@gmail.com) bascule automatiquement et donne accès à la console d'administration.
                  </p>
                </div>
              </div>

              {/* Error notice */}
              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitLogin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Adresse E-mail Professionnelle (@evavoyage.com)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => handleIdentifierChange(e.target.value)}
                      placeholder="direction@evavoyage.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    Doit être une adresse @evavoyage.com ou evavoyages1@gmail.com
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-stone-700">Code Secret Administrateur</label>
                    <span className="text-[10px] text-stone-400 font-mono">Code: admin2026</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="admin2026"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Connexion Sécurisée Back-Office</span>
                </button>

                {/* 1-Click Demo Admin Login */}
                <div className="pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      switchToBackOffice('direction@evavoyage.com');
                      setIsAuthModalOpen(false);
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Basculer vers Direction EVA Voyages (direction@evavoyage.com)</span>
                  </button>
                  <span className="text-[10px] text-stone-400 block text-center mt-1">
                    Accès complet CRM, validation des passeports, ledger Wave/OM et badges.
                  </span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
