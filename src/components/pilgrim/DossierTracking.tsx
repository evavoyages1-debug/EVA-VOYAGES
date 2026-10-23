import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PilgrimDossier, WorkflowStatus } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Plane,
  ShieldCheck,
  Building2,
  Calendar,
  Smartphone,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Check,
  RefreshCw,
  QrCode,
  Maximize2,
  Download,
  User,
  Sparkles,
  Mail,
} from 'lucide-react';
import { OfficialReceiptModal } from '../common/OfficialReceiptModal';
import { WaveQrModal } from './WaveQrModal';
import { WhatsAppGroupCard } from '../common/WhatsAppGroupCard';
import { PilgrimTravelDocsCard } from './PilgrimTravelDocsCard';

const WORKFLOW_STEPS: { key: WorkflowStatus; label: string; description: string }[] = [
  {
    key: 'DOCUMENTS_PENDING',
    label: 'Pièces Justificatives',
    description: 'En attente des scans administratifs conformes',
  },
  {
    key: 'UNDER_REVIEW',
    label: 'Contrôle Administratif',
    description: 'Vérification des pièces par l\'équipe d\'EVA VOYAGES',
  },
  {
    key: 'DOCUMENTS_APPROVED',
    label: 'Dossier Validé',
    description: 'Conformité complète des pièces justificatives',
  },
  {
    key: 'FLIGHT_TICKET_ISSUED',
    label: 'Billets d\'Avion Émis',
    description: 'Réservation confirmée avec la compagnie aérienne',
  },
  {
    key: 'READY_FOR_DEPARTURE',
    label: 'Prêt pour l\'Embarquement',
    description: 'Convocation aéroport & remise du kit pèlerin',
  },
];

import { getOfflineDossierByCode } from '../../utils/offlineStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const DossierTracking: React.FC = () => {
  const {
    dossiers,
    trackingQueryCode,
    setTrackingQueryCode,
    formatFCFA,
    setPilgrimActiveTab,
    processPayment,
    agencyConfig,
    currentUser,
    getMyDossier,
    openAuthModal,
    registerClientAccount,
    switchToBackOffice,
    isBackOfficeDomain,
  } = useApp();

  const isOnline = useOnlineStatus();

  // On the client space: ONLY show the dossier belonging to the registered pilgrim
  const myDossier = getMyDossier();
  const [selectedDossier, setSelectedDossier] = useState<PilgrimDossier | null>(() => {
    if (myDossier) return myDossier;
    if (currentUser?.linkedTrackingCode) {
      return (
        dossiers.find((d) => d.trackingCode.toUpperCase() === currentUser.linkedTrackingCode?.toUpperCase()) ||
        getOfflineDossierByCode(currentUser.linkedTrackingCode) ||
        null
      );
    }
    if (trackingQueryCode) {
      return (
        dossiers.find((d) => d.trackingCode.toUpperCase() === trackingQueryCode.toUpperCase()) ||
        null
      );
    }
    return null;
  });

  const [searchInput, setSearchInput] = useState<string>(
    selectedDossier?.trackingCode || currentUser?.linkedTrackingCode || ''
  );

  // Sync when user changes or new registration completes
  React.useEffect(() => {
    const updated = getMyDossier();
    if (updated) {
      setSelectedDossier(updated);
      setSearchInput(updated.trackingCode);
      setTrackingQueryCode(updated.trackingCode);
    } else if (currentUser?.linkedTrackingCode) {
      const match = dossiers.find((d) => d.trackingCode.toUpperCase() === currentUser.linkedTrackingCode?.toUpperCase());
      if (match) {
        setSelectedDossier(match);
        setSearchInput(match.trackingCode);
        setTrackingQueryCode(match.trackingCode);
      } else {
        setSelectedDossier(null);
      }
    } else {
      setSelectedDossier(null);
    }
  }, [currentUser, dossiers]);

  // Quick link code input for unattached client account
  const [codeToLink, setCodeToLink] = useState<string>('');
  const [linkError, setLinkError] = useState<string | null>(null);

  // Inline Account Creation inputs for visitor
  const [inlineFirst, setInlineFirst] = useState<string>('');
  const [inlineLast, setInlineLast] = useState<string>('');
  const [inlineEmail, setInlineEmail] = useState<string>('');
  const [inlineAutoSwitch, setInlineAutoSwitch] = useState<boolean>(false);

  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showPayBalanceModal, setShowPayBalanceModal] = useState<boolean>(false);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [paymentOp, setPaymentOp] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [phoneForBalance, setPhoneForBalance] = useState<string>('');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [showWaveQrModal, setShowWaveQrModal] = useState<boolean>(false);

  const handleLinkCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    const code = codeToLink.trim().toUpperCase();
    const found = dossiers.find((d) => d.trackingCode.toUpperCase() === code);
    if (found) {
      if (currentUser) {
        registerClientAccount(
          currentUser.name,
          currentUser.email,
          currentUser.phone || found.personalInfo.phone,
          found.trackingCode,
          currentUser.firstName,
          currentUser.lastName
        );
      }
      setSelectedDossier(found);
      setTrackingQueryCode(found.trackingCode);
      setCodeToLink('');
    } else {
      setLinkError(`Aucun dossier trouvé pour le code "${code}". Vérifiez le format (ex: EVA-HJ26-9284).`);
    }
  };

  const handleInlineAccountCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = inlineEmail.trim().toLowerCase();
    if (!inlineFirst.trim() || !inlineLast.trim() || !cleanEmail) {
      alert('Veuillez renseigner Nom, Prénom et Adresse électronique.');
      return;
    }

    if (isBackOfficeDomain(cleanEmail)) {
      setInlineAutoSwitch(true);
      setTimeout(() => {
        switchToBackOffice(cleanEmail, `${inlineFirst} ${inlineLast}`.trim());
      }, 600);
      return;
    }

    registerClientAccount(
      `${inlineFirst} ${inlineLast}`.trim(),
      cleanEmail,
      '+221 77 000 00 00',
      undefined,
      inlineFirst.trim(),
      inlineLast.trim()
    );
  };

  const handleInlineEmailChange = (val: string) => {
    setInlineEmail(val);
    const clean = val.trim().toLowerCase();
    if (isBackOfficeDomain(clean)) {
      setInlineAutoSwitch(true);
      setTimeout(() => {
        switchToBackOffice(clean, `${inlineFirst} ${inlineLast}`.trim());
      }, 700);
    }
  };

  const getStepIndex = (status: WorkflowStatus): number => {
    const idx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = selectedDossier ? getStepIndex(selectedDossier.workflowStatus) : 0;

  const handlePayRemaining = (dossier: PilgrimDossier) => {
    setBalanceAmount(dossier.payment.remainingBalanceFCFA);
    setPhoneForBalance(dossier.personalInfo.phone);
    setShowPayBalanceModal(true);
  };

  const executePayBalance = () => {
    if (!selectedDossier) return;
    setIsPaying(true);

    setTimeout(() => {
      processPayment({
        dossierId: selectedDossier.id,
        amountFCFA: balanceAmount,
        method: paymentOp,
        phone: phoneForBalance,
      });

      setIsPaying(false);
      setShowPayBalanceModal(false);
      alert(`Paiement de ${formatFCFA(balanceAmount)} enregistré avec succès via ${paymentOp}!`);
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header with privacy badge (Strictly shows ONLY the registered pilgrim's dossier) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#135ca5] font-bold text-[10px] uppercase tracking-wider">
                Espace Client Pèlerin
              </span>
              <span className="text-xs text-stone-400 font-mono">Accès Individuel Sécurisé</span>
            </div>
            <h2 className="text-lg font-bold text-stone-900">Suivi Sécurisé de Votre Dossier Personnel</h2>
            <p className="text-xs text-stone-500">
              {currentUser
                ? `Connecté en tant que ${currentUser.name} (${currentUser.email}). Seul votre dossier d'inscription vous est présenté.`
                : "Consultez l'avancement de votre dossier, vos billets d'avion et vos attestations de paiement."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dossier Privé & Confidentiel</span>
            </span>
          </div>
        </div>
      </div>

      {selectedDossier ? (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-base font-black tracking-wider text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {selectedDossier.trackingCode}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {selectedDossier.packageSnapshot.title} ({selectedDossier.packageSnapshot.season})
                  </span>
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  {selectedDossier.personalInfo.firstName} {selectedDossier.personalInfo.lastName}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                  <span>Passeport: <strong className="text-stone-800 font-mono">{selectedDossier.personalInfo.passportNumber || 'N/A'}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Tél: {selectedDossier.personalInfo.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span>Attestation & Reçu Officiel</span>
                </button>
              </div>
            </div>

            {/* Live Progress Timeline */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-4">
                Évolution en Temps Réel du Dossier
              </span>

              <div className="space-y-3">
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isUpcoming = idx > currentStepIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                          : isDone
                          ? 'border-stone-200 bg-stone-50/50'
                          : 'border-stone-100 bg-white opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          isDone
                            ? 'bg-emerald-700 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-100'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-950 text-sm' : 'text-stone-800'}`}>
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              Étape Actuelle
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Validé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{step.description}</p>

                        {/* Extra Context details depending on state */}
                        {isCurrent && step.key === 'FLIGHT_TICKET_ISSUED' && selectedDossier.flightDetails && (
                          <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-xs text-stone-700 space-y-1">
                            <div>Compagnie: <strong>{selectedDossier.flightDetails.airline}</strong> · PNR: <strong className="font-mono">{selectedDossier.flightDetails.pnr}</strong></div>
                            <div>Vol: {selectedDossier.flightDetails.flightNumber} ({selectedDossier.flightDetails.departureDate})</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DEDICATED WHATSAPP GROUP CARD FOR THE SPECIFIC PACKAGE */}
          <WhatsAppGroupCard
            dossier={selectedDossier}
            variant="TRACKING"
          />

          {/* TITRES DE VOYAGE : BILLETS D'AVION & VISAS SAOUDIENS POUR LE COMPTE CLIENT */}
          <PilgrimTravelDocsCard dossier={selectedDossier} />

          {/* 2-Column: Document Status & Financial Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Verification Box */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Contrôle des Documents Administratifs
                </h4>
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="space-y-3">
                {/* Passport */}
                <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-800 block">Passeport Biométrique</span>
                    <span className="text-[11px] text-stone-500">
                      {selectedDossier.documents.passport ? selectedDossier.documents.passport.fileName : 'Non téléversé'}
                    </span>
                  </div>
                  <div>
                    {selectedDossier.documents.passport?.status === 'APPROVED' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validé
                      </span>
                    ) : selectedDossier.documents.passport?.status === 'PENDING' ? (
                      <span className="text-amber-600 font-medium">En examen</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Manquant</span>
                    )}
                  </div>
                </div>

                {/* Photo */}
                <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-800 block">Photo d'Identité Fond Blanc</span>
                    <span className="text-[11px] text-stone-500">
                      {selectedDossier.documents.photo ? selectedDossier.documents.photo.fileName : 'Non téléversé'}
                    </span>
                  </div>
                  <div>
                    {selectedDossier.documents.photo?.status === 'APPROVED' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Validé
                      </span>
                    ) : selectedDossier.documents.photo?.status === 'PENDING' ? (
                      <span className="text-amber-600 font-medium">En examen</span>
                    ) : (
                      <span className="text-stone-400">À fournir</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Status & Wave/OM Action */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Situation Financière du Dossier
                  </h4>
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Coût Total Forfait:</span>
                    <strong className="text-stone-900 font-mono tabular-nums">
                      {formatFCFA(selectedDossier.payment.totalAmountFCFA)}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-stone-100">
                    <span className="text-stone-500">Versements Effectués:</span>
                    <strong className="text-emerald-700 font-mono tabular-nums">
                      {formatFCFA(selectedDossier.payment.amountPaidFCFA)}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1.5 font-bold">
                    <span className="text-stone-700">Reste à Solder:</span>
                    <span className={`font-mono tabular-nums ${selectedDossier.payment.remainingBalanceFCFA === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {formatFCFA(selectedDossier.payment.remainingBalanceFCFA)}
                    </span>
                  </div>
                </div>

                {/* Transactions summary */}
                {selectedDossier.payment.transactions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1.5">
                      Historique des paiements ({selectedDossier.payment.transactions.length})
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedDossier.payment.transactions.map((tx) => (
                        <div key={tx.id} className="p-2 bg-stone-50 rounded-lg text-[11px] flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-stone-900">{tx.method}</span> · <span className="font-mono text-stone-500">{tx.reference}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-800">+{formatFCFA(tx.amountFCFA)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay Remaining Balance CTA */}
              {selectedDossier.payment.remainingBalanceFCFA > 0 ? (
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => handlePayRemaining(selectedDossier)}
                    className="w-full py-3.5 px-4 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Smartphone className="w-4 h-4 text-[#f15a24]" />
                    <span>Payer le Solde Restant via Wave ou Orange Money</span>
                  </button>
                  <span className="text-[10px] text-stone-400 text-center block mt-1.5">
                    Notification SMS & Reçu officiel délivrés automatiquement
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Dossier intégralement soldé! Merci.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : currentUser ? (
        /* Client connected but no dossier created yet */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#135ca5] flex items-center justify-center mx-auto border border-blue-100">
            <User className="w-8 h-8 text-[#f15a24]" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#135ca5] font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Compte Client Actif : {currentUser.name}</span>
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Aucun dossier de pèlerinage pour l'instant</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Votre compte client est enregistré avec l'adresse <strong>{currentUser.email}</strong>. Inscrivez-vous dès maintenant à un de nos séjours pour suivre votre dossier en temps réel.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPilgrimActiveTab('REGISTER')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#135ca5] to-[#0c3f74] hover:from-[#0c3f74] hover:to-[#082a4d] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#f15a24]" />
              <span>S'inscrire à une formule Hajj ou Oumra</span>
            </button>
            <button
              type="button"
              onClick={() => setPilgrimActiveTab('PACKAGES')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
            >
              <span>Consulter les offres</span>
            </button>
          </div>

          {/* Form to link existing code */}
          <div className="pt-6 border-t border-stone-100 text-left space-y-2">
            <span className="text-xs font-bold text-stone-800 block">
              Vous possédez déjà un code de dossier (ex: reçu par SMS) ?
            </span>
            <form onSubmit={handleLinkCode} className="flex gap-2">
              <input
                type="text"
                value={codeToLink}
                onChange={(e) => setCodeToLink(e.target.value.toUpperCase())}
                placeholder="Ex: EVA-HJ26-9284"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-xs focus:ring-2 focus:ring-[#135ca5]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
              >
                Rattacher à mon compte
              </button>
            </form>
            {linkError && (
              <span className="text-[11px] text-red-600 block">{linkError}</span>
            )}
          </div>
        </div>
      ) : (
        /* Visitor: Propose creating account with Nom, Prénom, Adresse électronique */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#135ca5] to-[#f15a24] text-white flex items-center justify-center mx-auto shadow-md">
              <User className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-stone-900 text-lg">Créer votre Compte Pèlerin</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Renseignez votre nom, prénom et adresse électronique pour accéder à votre espace de suivi sécurisé.
            </p>
          </div>

          {/* Discreet Transition notification */}
          {inlineAutoSwitch && (
            <div className="p-3 bg-slate-900 text-white rounded-2xl text-xs flex items-center gap-2 animate-pulse font-medium">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-spin" />
              <span>Connexion sécurisée en cours... Redirection...</span>
            </div>
          )}

          <form onSubmit={handleInlineAccountCreate} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={inlineFirst}
                  onChange={(e) => setInlineFirst(e.target.value)}
                  placeholder="Ex: Ibrahima"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={inlineLast}
                  onChange={(e) => setInlineLast(e.target.value)}
                  placeholder="Ex: Ndiaye"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Adresse électronique *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={inlineEmail}
                  onChange={(e) => handleInlineEmailChange(e.target.value)}
                  placeholder="ibrahima.ndiaye@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Créer mon Compte & Consulter mon Dossier</span>
              <ArrowRight className="w-4 h-4 text-[#f15a24]" />
            </button>
          </form>
        </div>
      )}

      {/* Pay balance modal */}
      {showPayBalanceModal && selectedDossier && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 my-auto">
            <div className="border-b border-stone-100 pb-3">
              <span className="text-[10px] font-black uppercase text-[#135ca5] tracking-wider block">
                Règlement du Solde Restant
              </span>
              <h3 className="font-black text-stone-900 text-base">
                Dossier {selectedDossier.trackingCode}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Pèlerin : <strong>{selectedDossier.personalInfo.firstName} {selectedDossier.personalInfo.lastName}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Montant à verser (FCFA) :
              </label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(Number(e.target.value))}
                max={selectedDossier.payment.remainingBalanceFCFA}
                min={10000}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm font-black focus:ring-2 focus:ring-[#135ca5] bg-stone-50"
              />
              <span className="text-[10px] text-stone-400 block mt-1">
                Reste total dû : {formatFCFA(selectedDossier.payment.remainingBalanceFCFA)}
              </span>
            </div>

            {/* Operator choice */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Opérateur de paiement agréé :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentOp('WAVE')}
                  className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentOp === 'WAVE'
                      ? 'border-[#1DC4FF] bg-[#1DC4FF]/10 text-stone-900 shadow-xs ring-1 ring-[#1DC4FF]/30'
                      : 'border-stone-200 text-stone-600 bg-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-[#1DC4FF] text-white flex items-center justify-center font-black text-xs">
                    ~
                  </span>
                  <span>Wave Sénégal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOp('ORANGE_MONEY')}
                  className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    paymentOp === 'ORANGE_MONEY'
                      ? 'border-[#f15a24] bg-[#f15a24]/10 text-stone-900 shadow-xs ring-1 ring-[#f15a24]/30'
                      : 'border-stone-200 text-stone-600 bg-white'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-[#f15a24] text-white flex items-center justify-center font-black text-[10px]">
                    OM
                  </span>
                  <span>Orange Money</span>
                </button>
              </div>
            </div>

            {/* Operator details */}
            {paymentOp === 'WAVE' ? (
              <div className="p-3 bg-cyan-50/80 rounded-2xl border border-cyan-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-950 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-[#135ca5]" />
                    <span>Affiche & QR Code Wave Officiel</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowWaveQrModal(true)}
                    className="text-[10px] font-bold text-[#135ca5] underline hover:text-[#0c3f74] flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Plein écran</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-cyan-200/70">
                  <img
                    src="/assets/wave_qr.png"
                    alt="Wave QR"
                    onClick={() => setShowWaveQrModal(true)}
                    className="w-14 h-18 object-contain rounded-lg border border-cyan-200 cursor-pointer hover:scale-105 transition-transform"
                  />
                  <div className="text-[11px] text-stone-600 space-y-1">
                    <p>Scannez directement avec l'application <strong>Wave</strong> ou saisissez votre numéro :</p>
                    <a
                      href="/assets/aistudio/static_wave_qr_9b2cebc3.pdf"
                      download="Affiche_Wave_EVA_VOYAGES.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#135ca5] font-bold hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      <span>Télécharger l'Affiche PDF</span>
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Numéro de Téléphone Wave :
                  </label>
                  <input
                    type="tel"
                    value={phoneForBalance}
                    onChange={(e) => setPhoneForBalance(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3 py-2 rounded-xl border border-cyan-300 font-mono text-xs bg-white font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-orange-50/80 rounded-2xl border border-orange-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-950">
                    Compte Marchand : <strong>{agencyConfig.orangeMoneyMerchantNumber}</strong>
                  </span>
                  <span className="font-mono font-bold text-xs text-[#d94917] bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                    #144#391#
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Numéro de Téléphone Orange Money :
                  </label>
                  <input
                    type="tel"
                    value={phoneForBalance}
                    onChange={(e) => setPhoneForBalance(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3 py-2 rounded-xl border border-orange-300 font-mono text-xs bg-white font-bold"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowPayBalanceModal(false)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPaying}
                onClick={executePayBalance}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#135ca5] text-white hover:bg-[#0c3f74] shadow-md transition-all"
              >
                {isPaying ? 'Traitement...' : `Valider versement de ${formatFCFA(balanceAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wave QR Fullscreen Modal */}
      <WaveQrModal
        isOpen={showWaveQrModal}
        onClose={() => setShowWaveQrModal(false)}
        amountFCFA={balanceAmount}
        dossierTrackingCode={selectedDossier?.trackingCode}
      />

      {/* Official Receipt Modal */}
      {selectedDossier && (
        <OfficialReceiptModal
          dossier={selectedDossier}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
