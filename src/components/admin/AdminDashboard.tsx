import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CreditCard,
  FileCheck,
  Plane,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  IdCard,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { dossiers, packages, notifications, formatFCFA, setAdminActiveTab, setSelectedDossierId } = useApp();

  const totalPilgrims = dossiers.length;
  const totalEncaissedFCFA = dossiers.reduce((acc, d) => acc + d.payment.amountPaidFCFA, 0);
  const totalExpectedFCFA = dossiers.reduce((acc, d) => acc + d.payment.totalAmountFCFA, 0);
  const pendingReviewCount = dossiers.filter((d) => d.workflowStatus === 'UNDER_REVIEW').length;
  const missingDocsCount = dossiers.filter((d) => d.workflowStatus === 'DOCUMENTS_PENDING').length;
  const flightsConfirmedCount = dossiers.filter(
    (d) =>
      d.workflowStatus === 'FLIGHT_TICKET_ISSUED' ||
      d.workflowStatus === 'READY_FOR_DEPARTURE' ||
      d.workflowStatus === 'COMPLETED'
  ).length;

  const totalSpots = packages.reduce((acc, p) => acc + p.spotsTotal, 0);
  const remainingSpots = packages.reduce((acc, p) => acc + p.spotsRemaining, 0);
  const occupancyRate = totalSpots > 0 ? Math.round(((totalSpots - remainingSpots) / totalSpots) * 100) : 0;

  // Wave vs OM ratio & Payment Types breakdown
  const allTxs = dossiers.flatMap((d) => d.payment.transactions);
  const waveTotal = allTxs.filter((t) => t.method === 'WAVE').reduce((a, b) => a + b.amountFCFA, 0);
  const omTotal = allTxs.filter((t) => t.method === 'ORANGE_MONEY').reduce((a, b) => a + b.amountFCFA, 0);
  const depositTxsTotal = allTxs.filter((t) => t.paymentType !== 'FULL').reduce((a, b) => a + b.amountFCFA, 0);
  const fullTxsTotal = allTxs.filter((t) => t.paymentType === 'FULL').reduce((a, b) => a + b.amountFCFA, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Tableau de Bord de Gestion Centralisée</h2>
          <p className="text-xs text-stone-500">
            Supervision en direct des inscriptions, des documents administratifs et des encaissements Wave / Orange Money.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminActiveTab('BADGES')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#f15a24] hover:bg-[#d94917] text-white rounded-xl transition-colors shadow-sm"
          >
            <IdCard className="w-3.5 h-3.5 text-white" />
            <span>Badges Pèlerins</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminActiveTab('ANALYTICS')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl transition-colors shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <span>Graphiques Wave & OM</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminActiveTab('PACKAGES')}
            className="px-3.5 py-2 text-xs font-bold bg-[#135ca5] text-white rounded-xl hover:bg-[#0c3f74] transition-colors shadow-sm"
          >
            Ajuster Tarifs Packages
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Encaissements */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Recettes Encaissées</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-sans tabular-nums">
            {formatFCFA(totalEncaissedFCFA)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>Reste à percevoir:</span>
            <span className="font-semibold text-stone-800 tabular-nums">
              {formatFCFA(totalExpectedFCFA - totalEncaissedFCFA)}
            </span>
          </div>
        </div>

        {/* Total Dossiers */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Pèlerins Enregistrés</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-sans tabular-nums">
            {totalPilgrims} Dossiers
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>Remplissage global:</span>
            <span className="font-semibold text-emerald-700 tabular-nums">{occupancyRate}%</span>
          </div>
        </div>

        {/* Billets & Vols Confirmés */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Billets & Vols Confirmés</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Plane className="w-4 h-4 text-[#135ca5]" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-sans tabular-nums">
            {flightsConfirmedCount} / {totalPilgrims}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>Taux de confirmation:</span>
            <span className="font-semibold text-stone-800">
              {totalPilgrims > 0 ? Math.round((flightsConfirmedCount / totalPilgrims) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Documents à vérifier */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Documents en Attente</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-900 font-sans tabular-nums">
            {pendingReviewCount + missingDocsCount}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>{pendingReviewCount} à examiner</span>
            <span className="text-red-600 font-semibold">{missingDocsCount} manquants</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Mobile Money Breakdown & Urgent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mobile Money Breakdown (1 column) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Répartition des Paiements Mobiles
          </h3>

          <div className="space-y-3">
            {/* Wave */}
            <div className="p-4 rounded-2xl bg-[#1DC4FF]/10 border border-[#1DC4FF]/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1DC4FF]" />
                  Wave Sénégal
                </span>
                <span className="font-mono tabular-nums">{formatFCFA(waveTotal)}</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1DC4FF] h-full"
                  style={{
                    width: `${totalEncaissedFCFA > 0 ? (waveTotal / totalEncaissedFCFA) * 100 : 50}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-500">Paiement sans frais et push instantané</span>
            </div>

            {/* Orange Money */}
            <div className="p-4 rounded-2xl bg-[#FF7900]/10 border border-[#FF7900]/30 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF7900]" />
                  Orange Money
                </span>
                <span className="font-mono tabular-nums">{formatFCFA(omTotal)}</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF7900] h-full"
                  style={{
                    width: `${totalEncaissedFCFA > 0 ? (omTotal / totalEncaissedFCFA) * 100 : 50}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-500">Paiements USSD & validation OTP</span>
            </div>

            {/* Types de règlement (Acomptes vs Soldes Intégraux) */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Les 2 Types de Règlements
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-[#135ca5] font-bold block">Type 1 : Acomptes</span>
                  <span className="font-mono font-black text-xs text-stone-900 block mt-0.5">
                    {formatFCFA(depositTxsTotal)}
                  </span>
                </div>
                <div className="p-2.5 bg-orange-50/70 rounded-xl border border-orange-200">
                  <span className="text-[10px] text-[#f15a24] font-bold block">Type 2 : Intégraux</span>
                  <span className="font-mono font-black text-xs text-stone-900 block mt-0.5">
                    {formatFCFA(fullTxsTotal)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAdminActiveTab('ANALYTICS')}
              className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#0ea5e9]" />
              <span>Ouvrir Graphiques Mensuels Détaillés</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Dossiers requiring attention (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Derniers Dossiers Pèlerins Reçus
            </h3>
            <button
              type="button"
              onClick={() => setAdminActiveTab('DOSSIERS')}
              className="text-xs font-bold text-[#135ca5] hover:text-[#0c3f74] flex items-center gap-1"
            >
              <span>Voir les {totalPilgrims} dossiers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {dossiers.slice(0, 4).map((dossier) => (
              <div
                key={dossier.id}
                onClick={() => {
                  setSelectedDossierId(dossier.id);
                  setAdminActiveTab('DOSSIERS');
                }}
                className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-900">{dossier.trackingCode}</span>
                    <span className="font-bold text-sm text-stone-900">
                      {dossier.personalInfo.firstName} {dossier.personalInfo.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span>{dossier.packageSnapshot.title}</span>
                    <span aria-hidden="true">·</span>
                    <span>Tél: {dossier.personalInfo.phone}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-900 block tabular-nums">
                    {formatFCFA(dossier.payment.amountPaidFCFA)} / {formatFCFA(dossier.payment.totalAmountFCFA)}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700">
                    {dossier.workflowStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
