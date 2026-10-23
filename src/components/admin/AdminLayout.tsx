import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { PackageManager } from './PackageManager';
import { DossierCRM } from './DossierCRM';
import { TransactionLedger } from './TransactionLedger';
import { NotificationCenter } from './NotificationCenter';
import { AgencySettingsView } from './AgencySettingsView';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PilgrimBadgesView } from './PilgrimBadgesView';
import {
  LayoutDashboard,
  Users,
  Package as PackageIcon,
  CreditCard,
  Bell,
  Settings,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  BarChart3,
  IdCard,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    adminActiveTab,
    setAdminActiveTab,
    setCurrentView,
    dossiers,
    notifications,
    agencyConfig,
    currentUser,
    loginAsAdmin,
    loginWithCredentials,
    logout,
  } = useApp();

  const [adminEmail, setAdminEmail] = React.useState('direction@evavoyage.com');
  const [adminPasscode, setAdminPasscode] = React.useState('admin2026');
  const [authError, setAuthError] = React.useState<string | null>(null);

  const pendingDossiers = dossiers.filter(
    (d) => d.workflowStatus === 'DOCUMENTS_PENDING' || d.workflowStatus === 'UNDER_REVIEW'
  ).length;

  const handleAdminGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = loginWithCredentials('ADMIN', adminEmail, adminPasscode);
    if (!res.success) {
      setAuthError(res.error || 'Identifiant ou mot de passe incorrect.');
    }
  };

  // If user is not authenticated as an Administrator, present the Back-Office Security Gate
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="min-h-[85vh] bg-stone-100 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 text-white p-6 sm:p-8 border-b border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 px-2 bg-white rounded-2xl flex items-center justify-center shadow-md shrink-0">
                  <img src="/logo.png" alt="EVA Voyages" className="h-9 w-auto object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Portail Sécurisé
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Back-Office {agencyConfig.name}
                  </h1>
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hidden sm:flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Status notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
              <div className="p-1.5 bg-amber-200/60 rounded-xl text-amber-800 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-amber-950">
                  Accès Réservé au Personnel Autorisé d'EVA Voyages
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Ce portail d'administration est strictement séparé de l'Espace Client. Il permet la gestion des quotas Hajj/Oumra, la validation consulaire des passeports, la délivrance des visas et le suivi de trésorerie Wave / Orange Money.
                </p>
                {currentUser && (
                  <div className="pt-2 flex items-center gap-2 text-stone-600">
                    <span>Compte actuellement actif :</span>
                    <strong className="text-stone-900">{currentUser.name}</strong>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-[10px]">
                      {currentUser.role === 'PILGRIM' ? 'Compte Client Pèlerin' : 'Non Administrateur'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-medium">
                {authError}
              </div>
            )}

            {/* Admin Credentials Form */}
            <form onSubmit={handleAdminGateLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  Identifiant Administrateur Agence
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="direction@evavoyage.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    Code Secret Administrateur
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono">Démo: admin2026</span>
                </div>
                <input
                  type="password"
                  required
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="admin2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors text-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Déverrouiller le Back-Office Administrateur</span>
              </button>
            </form>

            {/* Quick 1-Click Demo Login */}
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => loginAsAdmin()}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors text-xs shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Connexion Rapide Démo : Malick Faye (Direction Agence)</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('PILGRIM')}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors text-xs"
              >
                <Smartphone className="w-4 h-4 text-[#f15a24]" />
                <span>Retourner à l'Espace Client Pèlerin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // When authenticated as Admin: Render full back-office workspace
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-slate-950 text-stone-300 p-4 border-r border-slate-800 flex flex-col justify-between shrink-0 no-print">
        <div className="space-y-6">
          {/* Brand & Back Office Header with EVA Logo */}
          <div className="pt-2 px-2 flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="h-11 w-auto px-1.5 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo.png" alt="EVA Voyages" className="h-9 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f15a24]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#f15a24]">
                  Back-Office
                </span>
              </div>
              <h2 className="text-sm font-black text-white tracking-tight">{agencyConfig.name}</h2>
              <p className="text-[10px] text-stone-400">Administration Hajj & Oumra</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setAdminActiveTab('DASHBOARD')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'DASHBOARD'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#f15a24]" />
              <span>Tableau de Bord</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('DOSSIERS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'DOSSIERS'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#f15a24]" />
                <span>Dossiers Pèlerins</span>
              </div>
              {pendingDossiers > 0 && (
                <span className="px-2 py-0.5 bg-[#f15a24] text-white font-bold rounded-full text-[10px]">
                  {pendingDossiers}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('BADGES')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'BADGES'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <IdCard className="w-4 h-4 text-[#f15a24]" />
                <span>Badges Pèlerins</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-900/60 text-blue-200 border border-blue-700/50 font-bold rounded-full text-[10px]">
                {dossiers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('PACKAGES')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'PACKAGES'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <PackageIcon className="w-4 h-4 text-[#f15a24]" />
              <span>Packages & Tarifs</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('TRANSACTIONS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'TRANSACTIONS'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[#f15a24]" />
              <span>Paiements Wave & OM</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('ANALYTICS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'ANALYTICS'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#0ea5e9]" />
              <span>Analytiques Wave & OM</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('NOTIFICATIONS')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'NOTIFICATIONS'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#f15a24]" />
                <span>Alertes SMS & E-mails</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminActiveTab('SETTINGS')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                adminActiveTab === 'SETTINGS'
                  ? 'bg-[#135ca5] text-white shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-[#f15a24]" />
              <span>Paramètres Agence</span>
            </button>
          </nav>
        </div>

        {/* Admin Profile & Space Switcher in Sidebar Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          {/* Admin User Card */}
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                MF
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-400 font-semibold truncate">
                  {currentUser.title || 'Directeur des Opérations'}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 font-mono truncate">{currentUser.email}</p>
          </div>

          {/* Switch back to Pilgrim Mobile App View */}
          <button
            type="button"
            onClick={() => setCurrentView('PILGRIM')}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-800"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#f15a24]" />
            <span>Basculer vers l'Espace Client</span>
          </button>
        </div>
      </aside>

      {/* Main Back-Office Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {adminActiveTab === 'DASHBOARD' && <AdminDashboard />}
          {adminActiveTab === 'DOSSIERS' && <DossierCRM />}
          {adminActiveTab === 'BADGES' && <PilgrimBadgesView />}
          {adminActiveTab === 'PACKAGES' && <PackageManager />}
          {adminActiveTab === 'TRANSACTIONS' && <TransactionLedger />}
          {adminActiveTab === 'ANALYTICS' && <AnalyticsDashboard />}
          {adminActiveTab === 'NOTIFICATIONS' && <NotificationCenter />}
          {adminActiveTab === 'SETTINGS' && <AgencySettingsView />}
        </div>
      </main>
    </div>
  );
};
