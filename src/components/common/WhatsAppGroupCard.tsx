import React, { useState } from 'react';
import { PilgrimDossier, Package } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  CheckCheck,
  Users,
  ShieldCheck,
  QrCode,
  Smartphone,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface WhatsAppGroupCardProps {
  dossier: PilgrimDossier;
  variant?: 'POST_REGISTRATION' | 'TRACKING' | 'ADMIN';
  onJoinedCallback?: () => void;
}

export const WhatsAppGroupCard: React.FC<WhatsAppGroupCardProps> = ({
  dossier,
  variant = 'POST_REGISTRATION',
  onJoinedCallback,
}) => {
  const { agencyConfig, joinWhatsAppGroup, toggleWhatsAppJoined } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [autoAddRequested, setAutoAddRequested] = useState<boolean>(false);

  const groupName =
    dossier.packageSnapshot.whatsappGroupName ||
    `EVA Voyages - ${dossier.packageSnapshot.title} 🕋`;
  const groupLink =
    dossier.packageSnapshot.whatsappGroupLink ||
    `https://chat.whatsapp.com/invite/EVA${dossier.packageSnapshot.type === 'HAJJ' ? 'Hajj2026' : 'Oumra2026'}`;

  const isJoined = dossier.whatsappStatus === 'JOINED';

  const handleJoinClick = () => {
    joinWhatsAppGroup(dossier.id);
    window.open(groupLink, '_blank', 'noopener,noreferrer');
    if (onJoinedCallback) {
      onJoinedCallback();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRequestAutoAdd = () => {
    const adminPhoneClean = agencyConfig.whatsapp.replace(/[^0-9]/g, '');
    const pilgrimName = `${dossier.personalInfo.firstName} ${dossier.personalInfo.lastName}`;
    const pilgrimPhone = dossier.personalInfo.phone;
    const trackingCode = dossier.trackingCode;
    const pkgTitle = dossier.packageSnapshot.title;

    const message = `Salam Alaykum ${agencyConfig.name}, je viens de m'inscrire au package *${pkgTitle}* avec le code dossier *${trackingCode}*.\n\n👤 Pèlerin : ${pilgrimName}\n📱 Téléphone WhatsApp : ${pilgrimPhone}\n\nMerci de bien vouloir m'intégrer directement dans le groupe WhatsApp officiel du package. Qu'Allah vous bénisse !`;

    const waUrl = `https://wa.me/${adminPhoneClean}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setAutoAddRequested(true);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-xl">
      {/* Decorative WhatsApp Glow Accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#25D366]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#128C7E]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Band */}
      <div className="relative p-5 sm:p-6 pb-4 border-b border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-white p-1 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/50 border border-emerald-400/40">
              <img
                src="/assets/whatsapp_logo.png"
                alt="WhatsApp Officiel"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#25D366] text-stone-950">
                  Groupe WhatsApp Officiel
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-emerald-400/20">
                  {dossier.packageSnapshot.title}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1 tracking-tight flex items-center gap-2">
                <span>{groupName}</span>
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isJoined ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold shadow-xs">
                <CheckCheck className="w-4 h-4 text-[#25D366]" />
                <span>Membre du Groupe</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Invitation Prête</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="relative p-5 sm:p-6 space-y-5">
        <p className="text-xs text-stone-200 leading-relaxed">
          Chaque formule de voyage dispose de son propre groupe WhatsApp dédié. En tant que pèlerin inscrit au <strong>{dossier.packageSnapshot.title}</strong>, vous êtes automatiquement éligible à cette communauté privée supervisée par nos Imams, nos guides et notre commission médicale.
        </p>

        {/* Benefits bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-emerald-100/90">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
            <span className="text-[#25D366] font-bold text-sm">🕋</span>
            <span>Rappels quotidiens des rituels et séances avec les Imams</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
            <span className="text-[#25D366] font-bold text-sm">✈️</span>
            <span>Convocations vols en direct & distribution des badges</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
            <span className="text-[#25D366] font-bold text-sm">🩺</span>
            <span>Assistance médicale et logistique 24/7 sur place</span>
          </div>
        </div>

        {/* Action Buttons Cluster */}
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleJoinClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:from-[#20bd5a] hover:to-[#17a54f] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <img src="/assets/whatsapp_logo.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
              <span>{isJoined ? 'Ouvrir la Discussion WhatsApp' : 'Rejoindre le Groupe WhatsApp'}</span>
              <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
            </button>

            {/* Secondary: Ask Agency to Auto-Add pilgrim by phone */}
            <button
              type="button"
              onClick={handleRequestAutoAdd}
              className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-emerald-400/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#25D366]" />
              <span>
                {autoAddRequested ? 'Demande transmise à l\'agence' : 'Ajout automatique par l\'équipe'}
              </span>
            </button>
          </div>

          {/* Sub actions: Copy link & QR code toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-stone-300">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-emerald-200 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#25D366]" />
                    <span className="text-[#25D366] font-bold">Lien copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copier le lien d'invitation</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-stone-200 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-stone-300" />
                <span>{showQr ? 'Masquer QR Code' : 'Scanner le QR Code'}</span>
              </button>
            </div>

            {/* Admin toggle if in ADMIN mode */}
            {variant === 'ADMIN' && (
              <button
                type="button"
                onClick={() => toggleWhatsAppJoined(dossier.id)}
                className="text-[11px] font-semibold text-cyan-300 hover:text-white underline cursor-pointer"
              >
                {isJoined ? 'Marquer comme non-rejoint' : 'Valider comme Rejoint'}
              </button>
            )}

            <div className="text-[11px] text-emerald-400/90 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Groupe privé et sécurisé</span>
            </div>
          </div>
        </div>

        {/* Collapsible Real QR Code for Desktop / Laptop users */}
        {showQr && (
          <div className="p-4 bg-white text-stone-900 rounded-2xl border border-emerald-300 shadow-lg flex flex-col sm:flex-row items-center gap-5 animate-in fade-in">
            {/* Real QR Code Image with WhatsApp Center Badge */}
            <div className="relative w-36 h-36 bg-white rounded-2xl p-1.5 border-2 border-[#25D366] flex items-center justify-center shrink-0 shadow-md">
              <img
                src={
                  dossier.packageSnapshot.whatsappQrCodeUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(groupLink)}`
                }
                alt={`QR Code WhatsApp ${groupName}`}
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-7 h-7 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center border border-[#25D366]/40">
                  <img src="/assets/whatsapp_logo.png" alt="WA" className="w-5 h-5 object-contain" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#128C7E] font-bold text-[10px] uppercase">
                  Code QR Officiel Dédié
                </span>
                <span className="text-[11px] text-stone-500 font-semibold">{dossier.packageSnapshot.title}</span>
              </div>
              <h4 className="font-bold text-xs text-stone-900 flex items-center justify-center sm:justify-start gap-1.5">
                <Smartphone className="w-4 h-4 text-[#25D366]" />
                <span>Pointez l'appareil photo de votre smartphone pour rejoindre</span>
              </h4>
              <p className="text-[11px] text-stone-600 leading-normal">
                Ouvrez l'appareil photo de votre téléphone ou <strong>WhatsApp</strong> &gt; Réglages &gt; Scanner pour intégrer automatiquement le groupe <strong>{groupName}</strong>.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <a
                  href={
                    dossier.packageSnapshot.whatsappQrCodeUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(groupLink)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  download={`QR_WhatsApp_${dossier.packageSnapshot.title.replace(/\s+/g, '_')}.png`}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <QrCode className="w-3 h-3 text-stone-600" />
                  <span>Agrandir / Télécharger QR</span>
                </a>
                <span className="text-[10px] text-stone-400 font-mono truncate max-w-[200px]">
                  {groupLink}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation note regarding SMS dispatch */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5 text-[11px] text-stone-300">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Le lien d'invitation a également été expédié par <strong>SMS au {dossier.personalInfo.phone}</strong> et par e-mail. Vous pouvez le partager à votre conjoint(e) ou mahram voyageant avec vous.
          </span>
        </div>
      </div>
    </div>
  );
};
