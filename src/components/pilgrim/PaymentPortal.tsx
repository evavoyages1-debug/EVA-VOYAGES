import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Transaction } from '../../types';
import {
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Maximize2,
  Download,
  MessageCircle,
} from 'lucide-react';
import { OfficialReceiptModal } from '../common/OfficialReceiptModal';
import { WaveQrModal } from './WaveQrModal';

export const PaymentPortal: React.FC = () => {
  const { dossiers, processPayment, formatFCFA, agencyConfig, setTrackingQueryCode, setPilgrimActiveTab } = useApp();

  const [selectedDossierId, setSelectedDossierId] = useState<string>(dossiers[0]?.id || '');
  const [paymentTypeOption, setPaymentTypeOption] = useState<'DEPOSIT' | 'FULL' | 'CUSTOM'>('DEPOSIT');
  const [method, setMethod] = useState<PaymentMethod>('WAVE');
  const [amount, setAmount] = useState<number>(500000);
  const [phone, setPhone] = useState<string>('+221 77 650 90 90');
  const [waveSubTab, setWaveSubTab] = useState<'QR_CODE' | 'PUSH'>('QR_CODE');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [completedDossier, setCompletedDossier] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showWaveQrModal, setShowWaveQrModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const currentDossier = dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];

  const handleSelectDossier = (id: string) => {
    setSelectedDossierId(id);
    const d = dossiers.find((item) => item.id === id);
    if (d) {
      if (paymentTypeOption === 'FULL') {
        setAmount(d.payment.remainingBalanceFCFA || 500000);
      } else if (paymentTypeOption === 'DEPOSIT') {
        setAmount(Math.min(500000, d.payment.remainingBalanceFCFA || 500000));
      }
    }
  };

  const handlePaymentTypeChange = (type: 'DEPOSIT' | 'FULL' | 'CUSTOM') => {
    setPaymentTypeOption(type);
    if (!currentDossier) return;
    if (type === 'FULL') {
      setAmount(currentDossier.payment.remainingBalanceFCFA || 500000);
    } else if (type === 'DEPOSIT') {
      setAmount(Math.min(500000, currentDossier.payment.remainingBalanceFCFA || 500000));
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDossier) return;

    setIsProcessing(true);

    setTimeout(() => {
      const result = processPayment({
        dossierId: currentDossier.id,
        amountFCFA: Number(amount),
        method,
        paymentType: paymentTypeOption === 'FULL' ? 'FULL' : 'DEPOSIT',
        phone,
      });

      setIsProcessing(false);
      setCompletedTx(result.transaction);
      setCompletedDossier(currentDossier);
    }, 2000);
  };

  const copyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Brand Header */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 px-2 bg-white rounded-xl border border-stone-200 shadow-xs flex items-center justify-center">
              <img src="/logo.png" alt="EVA Voyages" className="h-8 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#135ca5] tracking-tight">{agencyConfig.name}</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-[#f15a24] text-white font-bold uppercase">
                  Guichet Officiel
                </span>
              </div>
              <h2 className="text-lg font-black text-stone-900">
                Paiement Sécurisé : Les 2 Types de Paiement & Opérateurs
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-bold text-stone-500 self-start sm:self-auto bg-stone-100 px-2.5 py-1 rounded-full">
            Licence : {agencyConfig.licenseNumber}
          </span>
        </div>
        <p className="text-xs text-stone-600">
          Effectuez vos versements d'<strong>Acompte</strong> ou le <strong>Règlement Intégral</strong> 24h/24 en toute sécurité. Les reçus et confirmations SMS/Email certifiés sont délivrés instantanément.
        </p>
      </div>

      {completedTx ? (
        /* Transaction Success State */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-[#135ca5] flex items-center justify-center mx-auto border border-blue-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-[#f15a24]" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#135ca5] uppercase tracking-widest">
              Paiement Confirmé avec Succès
            </span>
            <h3 className="text-2xl font-black text-stone-900 mt-1">
              Versement de {formatFCFA(completedTx.amountFCFA)} reçu
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Opérateur : <strong>{completedTx.method === 'WAVE' ? 'Wave Digital Finance' : 'Orange Money'}</strong> · Réf : <span className="font-mono">{completedTx.reference}</span>
            </p>
          </div>

          {/* Receipt card */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Numéro de reçu :</span>
              <strong className="font-mono text-stone-900">{completedTx.receiptNumber}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Dossier pèlerin :</span>
              <strong className="font-mono text-[#135ca5]">{completedDossier?.trackingCode}</strong>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Bénéficiaire :</span>
              <span className="font-bold text-stone-900">{agencyConfig.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Date & Heure :</span>
              <span>{new Date(completedTx.date).toLocaleString('fr-FR')}</span>
            </div>
          </div>

          {/* Notifications confirmation summary */}
          <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 max-w-md mx-auto text-xs text-[#0c3f74] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#f15a24]" />
              <span>SMS & Email de confirmation envoyés au pèlerin</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Délivré
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#135ca5] hover:bg-[#0c3f74] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4 text-[#f15a24]" />
              <span>Télécharger le Reçu Officiel</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCompletedTx(null);
                setTrackingQueryCode(completedDossier?.trackingCode || '');
                setPilgrimActiveTab('TRACKING');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-800 text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              <span>Voir le dossier de suivi</span>
            </button>
          </div>
        </div>
      ) : (
        /* Payment Form */
        <form onSubmit={handlePay} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
          {/* Step 1: Select Dossier */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              1. Sélectionnez votre Dossier Pèlerin
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dossiers.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDossier(d.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedDossierId === d.id
                      ? 'border-[#135ca5] bg-blue-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-[#135ca5]">{d.trackingCode}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.payment.remainingBalanceFCFA === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {d.payment.remainingBalanceFCFA === 0 ? 'Soldé' : 'Reste: ' + formatFCFA(d.payment.remainingBalanceFCFA)}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-stone-900">
                    {d.personalInfo.firstName} {d.personalInfo.lastName}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">{d.packageSnapshot.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: LES DEUX TYPES DE PAIEMENT */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
              2. Les Deux Types de Paiement (Modalité de Versement)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
              {/* Type 1: Acompte */}
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('DEPOSIT')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  paymentTypeOption === 'DEPOSIT'
                    ? 'border-[#135ca5] bg-blue-50/70 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-[#135ca5] block">TYPE 1</span>
                <span className="font-bold text-xs text-stone-900 block mt-0.5">Acompte / Tranche</span>
                <span className="text-[10px] text-stone-500 block mt-1">Versement partiel souple</span>
              </button>

              {/* Type 2: Règlement Intégral / Solde */}
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('FULL')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  paymentTypeOption === 'FULL'
                    ? 'border-[#f15a24] bg-orange-50/70 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-[#f15a24] block">TYPE 2</span>
                <span className="font-bold text-xs text-stone-900 block mt-0.5">Solde Intégral 100%</span>
                <span className="text-[10px] text-stone-500 block mt-1">Solde tout le restant dû</span>
              </button>

              {/* Type 3: Libre */}
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('CUSTOM')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  paymentTypeOption === 'CUSTOM'
                    ? 'border-slate-800 bg-slate-100 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-stone-600 block">OPTION LIBRE</span>
                <span className="font-bold text-xs text-stone-900 block mt-0.5">Montant Libre</span>
                <span className="text-[10px] text-stone-500 block mt-1">Saisie personnalisée</span>
              </button>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[250000, 500000, 1000000, currentDossier?.payment.remainingBalanceFCFA || 1500000].map(
                (quickAmount, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAmount(quickAmount);
                      setPaymentTypeOption('CUSTOM');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all tabular-nums ${
                      amount === quickAmount
                        ? 'border-[#135ca5] bg-[#135ca5] text-white shadow-xs'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {formatFCFA(quickAmount)}
                  </button>
                )
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Montant exact à débiter (FCFA) :
              </label>
              <input
                type="number"
                required
                min={10000}
                value={amount}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setPaymentTypeOption('CUSTOM');
                }}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 font-mono text-base font-bold focus:ring-2 focus:ring-[#135ca5] bg-stone-50"
              />
            </div>
          </div>

          {/* Step 3: LES DEUX OPÉRATEURS MOBILE MONEY */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              3. Les Deux Opérateurs Mobile Money Agréés
            </label>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setMethod('WAVE')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative ${
                  method === 'WAVE'
                    ? 'border-[#1DC4FF] bg-gradient-to-b from-[#1DC4FF]/15 to-white text-stone-900 shadow-md ring-2 ring-[#1DC4FF]/25'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-sky-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                    alt="Wave Sénégal"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-black text-sm text-stone-900">WAVE SÉNÉGAL</span>
                    <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-1.5 py-0.2 rounded-full">
                      0% Frais
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">Scan QR Officiel & Push</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('ORANGE_MONEY')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all relative ${
                  method === 'ORANGE_MONEY'
                    ? 'border-[#f15a24] bg-gradient-to-b from-[#f15a24]/15 to-white text-stone-900 shadow-md ring-2 ring-[#f15a24]/25'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-orange-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                    alt="Orange Money"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-black text-sm text-stone-900">ORANGE MONEY</span>
                    <span className="text-[9px] bg-orange-100 text-[#d94917] font-black px-1.5 py-0.2 rounded-full">
                      Code Marchand
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">USSD #144# / Push OTP</span>
                </div>
              </button>
            </div>

            {/* Direct WhatsApp Payment Support Box with User Number */}
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border-2 border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider">
                      Assistance Paiement Mobile WhatsApp
                    </span>
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-200 font-semibold px-2 py-0.2 rounded-full border border-emerald-400/30">
                      En Ligne
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-200 mt-0.5">
                    Besoin d'aide ou transmission de reçu Wave / OM ? Contactez notre caisse au <strong className="text-white font-mono">{agencyConfig.whatsapp || '+221 78 639 10 00'}</strong>.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/221786391000?text=${encodeURIComponent(
                  `Salam Alaykum ${agencyConfig.name}, je souhaite une assistance pour effectuer un paiement via Wave ou Orange Money pour mon dossier.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-transform hover:scale-[1.02] shadow-md self-stretch sm:self-auto justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp : +221 78 639 10 00</span>
              </a>
            </div>

            {/* WAVE Interface with official QR Code and Logo */}
            {method === 'WAVE' ? (
              <div className="p-4 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/40 rounded-2xl border-2 border-[#1DC4FF]/40 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white p-0.5 border border-sky-200 shadow-xs flex items-center justify-center shrink-0">
                      <img
                        src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                        alt="Wave"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Compte Marchand Wave : {agencyConfig.waveMerchantNumber}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-cyan-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setWaveSubTab('QR_CODE')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        waveSubTab === 'QR_CODE' ? 'bg-[#135ca5] text-white' : 'text-stone-600'
                      }`}
                    >
                      Affiche QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaveSubTab('PUSH')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        waveSubTab === 'PUSH' ? 'bg-[#135ca5] text-white' : 'text-stone-600'
                      }`}
                    >
                      Push Mobile
                    </button>
                  </div>
                </div>

                {waveSubTab === 'QR_CODE' ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-cyan-200">
                    <div
                      onClick={() => setShowWaveQrModal(true)}
                      className="cursor-pointer group shrink-0 w-28 h-36 rounded-xl border-2 border-[#1DC4FF] bg-[#1DC4FF]/10 p-1 shadow-xs overflow-hidden flex items-center justify-center relative"
                    >
                      <img
                        src="/assets/wave_qr.png"
                        alt="Affiche Wave Officielle"
                        className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 text-center sm:text-left">
                      <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                        <img
                          src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                          alt="Wave"
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-[10px] font-black uppercase text-[#135ca5] bg-blue-100 px-2 py-0.5 rounded-full">
                          QR Code Officiel EVA VOYAGES
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Scannez ce code avec l'application <strong>Wave</strong> pour valider le versement de <strong>{formatFCFA(amount)}</strong>.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => setShowWaveQrModal(true)}
                          className="px-3 py-1.5 rounded-xl bg-[#135ca5] hover:bg-[#0c3f74] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-[#f15a24]" />
                          <span>Plein Écran</span>
                        </button>
                        <a
                          href="/assets/aistudio/static_wave_qr_9b2cebc3.pdf"
                          download="Affiche_Wave_EVA_VOYAGES.pdf"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 text-[11px] font-semibold flex items-center gap-1 hover:bg-stone-50"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-500" />
                          <span>PDF Wave</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Numéro de Téléphone Portable Wave (pour ordre push)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 78 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cyan-300 font-mono text-xs bg-white font-bold"
                  />
                </div>
              </div>
            ) : (
              /* ORANGE MONEY Interface with official Logo */
              <div className="p-4 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/40 rounded-2xl border-2 border-[#f15a24]/40 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-orange-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white p-0.5 border border-orange-200 shadow-xs flex items-center justify-center shrink-0">
                      <img
                        src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                        alt="Orange Money"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-bold text-stone-800">
                      Compte Marchand Orange Money : <strong>{agencyConfig.orangeMoneyMerchantNumber}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#d94917] bg-orange-100 px-2 py-0.5 rounded-lg">
                    #144#391#
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Numéro de Téléphone Mobile Orange Money
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-orange-300 font-mono text-xs bg-white font-bold"
                  />
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-orange-100 text-[11px] text-stone-600 flex items-center gap-2">
                  <img
                    src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                    alt="Orange Money"
                    className="w-4 h-4 object-contain shrink-0"
                  />
                  <span>
                    Composez <strong>#144#391#</strong> sur votre mobile ou confirmez la notification OTP envoyée par Orange.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
              isProcessing
                ? 'bg-stone-500 cursor-wait'
                : method === 'WAVE'
                ? 'bg-[#135ca5] hover:bg-[#0c3f74]'
                : 'bg-[#f15a24] hover:bg-[#d94917]'
            }`}
          >
            <Lock className="w-4 h-4 text-[#f15a24]" />
            <span>
              {isProcessing
                ? `Traitement sécurisé du versement ${method}...`
                : `Effectuer le versement de ${formatFCFA(amount)} via ${method === 'WAVE' ? 'Wave' : 'Orange Money'}`}
            </span>
          </button>
        </form>
      )}

      {/* Official receipt modal */}
      {completedDossier && (
        <OfficialReceiptModal
          dossier={completedDossier}
          transaction={completedTx || undefined}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {/* Official Wave QR Modal */}
      <WaveQrModal
        isOpen={showWaveQrModal}
        onClose={() => setShowWaveQrModal(false)}
        amountFCFA={amount}
        dossierTrackingCode={currentDossier?.trackingCode}
      />
    </div>
  );
};
