import React from 'react';
import { X, QrCode, Download, ExternalLink, CheckCircle2, Smartphone, ShieldCheck } from 'lucide-react';

interface WaveQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountFCFA?: number;
  dossierTrackingCode?: string;
  onConfirmPayment?: () => void;
}

export const WaveQrModal: React.FC<WaveQrModalProps> = ({
  isOpen,
  onClose,
  amountFCFA,
  dossierTrackingCode,
  onConfirmPayment,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 relative my-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#135ca5] to-[#1da1f2] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Officiel EVA VOYAGES
                </span>
                <span className="text-[10px] bg-cyan-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-full">
                  Wave 0% Frais
                </span>
              </div>
              <h3 className="text-base font-bold text-white">QR Code Officiel Wave Digital Finance</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Poster & QR Area */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-stone-500">
              Scannez ce code avec votre application <strong className="text-cyan-700">Wave Sénégal</strong> pour valider votre paiement instantanément.
            </p>
            {amountFCFA && (
              <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl mt-1">
                <span className="text-xs text-stone-600">Montant à régler : </span>
                <span className="text-base font-black text-[#135ca5]">
                  {amountFCFA.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            )}
            {dossierTrackingCode && (
              <p className="text-[11px] font-mono text-stone-500">
                Réf dossier : <strong className="text-stone-800">{dossierTrackingCode}</strong>
              </p>
            )}
          </div>

          {/* Official Wave QR image container */}
          <div className="relative mx-auto max-w-xs bg-[#1DC4FF]/10 p-3 rounded-3xl border-2 border-[#1DC4FF]/40 shadow-inner flex flex-col items-center">
            <div className="bg-white p-2 rounded-2xl shadow-md border border-stone-100 overflow-hidden w-full flex items-center justify-center">
              <img
                src="/assets/wave_qr.png"
                alt="Affiche Officielle Wave Digital Finance - EVA VOYAGES"
                className="w-full max-h-[360px] object-contain rounded-xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-[#0c3f74]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compte Marchand Certifié EVA VOYAGES</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-stone-700 space-y-2">
            <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">
              Comment payer avec ce QR code :
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-600">
              <li>Ouvrez votre application <strong>Wave</strong> sur votre smartphone.</li>
              <li>Appuyez sur le bouton bleu <strong>Scanner</strong>.</li>
              <li>Pointez l'appareil photo vers l'affiche ci-dessus pour confirmer le versement.</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            {onConfirmPayment && (
              <button
                type="button"
                onClick={() => {
                  onConfirmPayment();
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#135ca5] hover:bg-[#0c3f74] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-[#f15a24]" />
                <span>J'ai scanné et validé le paiement sur Wave</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <a
                href="/assets/aistudio/static_wave_qr_9b2cebc3.pdf"
                download="Affiche_Paiement_Wave_EVA_VOYAGES.pdf"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Télécharger l'Affiche PDF</span>
              </a>

              <a
                href="/assets/wave_qr.png"
                download="Wave_QR_EVA_VOYAGES.png"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                <span>Enregistrer l'image QR</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
