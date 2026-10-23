import React, { useRef } from 'react';
import { PilgrimDossier, Transaction } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, X, CheckCircle2, ShieldCheck, Download, QrCode } from 'lucide-react';
import { generatePdfReceipt } from '../../utils/generatePdfReceipt';

interface OfficialReceiptModalProps {
  dossier: PilgrimDossier;
  transaction?: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  dossier,
  transaction,
  isOpen,
  onClose,
}) => {
  const { agencyConfig, formatFCFA } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generatePdfReceipt({
      dossier,
      transaction,
      agencyConfig,
      autoDownload: true,
    });
  };

  const receiptNum = transaction?.receiptNumber || `ATT-${dossier.trackingCode}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl border border-stone-200">
        {/* Controls bar */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#f97316]" />
            <span className="text-sm font-bold">Document Officiel Émis par {agencyConfig.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#f15a24] hover:bg-[#d94814] text-white rounded-xl transition-colors shadow-sm"
              title="Télécharger directement le document au format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger Reçu PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#164e96] hover:bg-[#113e79] text-white rounded-xl transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-blue-200" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div ref={printRef} className="p-6 sm:p-10 bg-white text-stone-900 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-24 p-1 bg-white border border-stone-200 rounded-xl flex items-center justify-center shrink-0">
                <img
                  src={agencyConfig.logoUrl || '/logo.png'}
                  alt={agencyConfig.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-2xl font-black tracking-tight text-[#164e96]">
                    {agencyConfig.name}
                  </span>
                  <span className="font-amiri text-lg text-[#ea580c]">رحلات الحج والعمرة</span>
                </div>
                <p className="text-xs text-stone-600 font-semibold">{agencyConfig.tagline}</p>
                <p className="text-xs text-stone-500">
                  Licence d'Exploitation N° {agencyConfig.licenseNumber} · Organisation Voyages
                </p>
                <p className="text-xs text-stone-500">
                  {agencyConfig.address} · Tél: {agencyConfig.phone} · {agencyConfig.email}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block p-2 bg-stone-50 border border-stone-200 rounded-xl text-center">
                <QrCode className="w-14 h-14 mx-auto text-[#164e96]" />
                <span className="block text-[9px] font-mono text-[#ea580c] font-bold mt-1 uppercase">
                  {dossier.trackingCode}
                </span>
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border-l-4 border-l-[#f15a24] border border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#164e96]">
                {transaction ? 'REÇU OFFICIEL DE PAIEMENT & ENCAISSEMENT' : 'ATTESTATION OFFICIELLE DE PÈLERINAGE'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                <span>Réf Document: <strong className="text-stone-900 font-mono">{receiptNum}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Date: {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#164e96] border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ea580c]" />
                Dossier Enregistré
              </span>
            </div>
          </div>

          {/* 2-Column Grid: Pilgrim Details & Package Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Pilgrim info */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 border-b border-stone-200 pb-1.5">
                Identité du Pèlerin
              </h3>
              <div className="space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Nom & Prénom:</span>
                  <strong className="text-stone-900">{dossier.personalInfo.firstName} {dossier.personalInfo.lastName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Passeport N°:</span>
                  <strong className="text-stone-900 font-mono">{dossier.personalInfo.passportNumber || 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Nationalité:</span>
                  <span>{dossier.personalInfo.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Groupe Sanguin:</span>
                  <span className="font-semibold text-emerald-800">{dossier.personalInfo.bloodGroup || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Téléphone:</span>
                  <span className="font-mono">{dossier.personalInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Email:</span>
                  <span>{dossier.personalInfo.email}</span>
                </div>
                {dossier.personalInfo.emergencyContactName && (
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span className="text-stone-500">Contact Urgence:</span>
                    <span>{dossier.personalInfo.emergencyContactName} ({dossier.personalInfo.emergencyContactPhone})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Package & Logistics */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 border-b border-stone-200 pb-1.5">
                Prestations & Logistique
              </h3>
              <div className="space-y-1.5 text-xs text-stone-700">
                <div className="flex justify-between">
                  <span className="text-stone-500">Package Choisi:</span>
                  <strong className="text-stone-900">{dossier.packageSnapshot.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Type de Séjour:</span>
                  <span className="font-semibold text-emerald-800">{dossier.packageSnapshot.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Chambre:</span>
                  <span className="capitalize">{dossier.packageSnapshot.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Période Prévisionnelle:</span>
                  <span>Du {dossier.packageSnapshot.departureDate} au {dossier.packageSnapshot.returnDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Compagnie Aérienne:</span>
                  <span className="font-semibold text-stone-900">
                    {dossier.flightDetails?.airline || 'Compagnie partenaire'}
                  </span>
                </div>
                {dossier.flightDetails?.pnr && (
                  <div className="flex justify-between pt-1 border-t border-stone-200">
                    <span className="text-stone-500">Vol / PNR:</span>
                    <span className="font-mono font-semibold">{dossier.flightDetails.airline} · {dossier.flightDetails.pnr}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-stone-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex justify-between">
              <span>Détail Financier & Modalités de Paiement</span>
              <span>Devise: {agencyConfig.currency}</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-600 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-2 font-semibold">Désignation</th>
                  <th className="px-4 py-2 font-semibold">Mode / Opérateur</th>
                  <th className="px-4 py-2 font-semibold">Référence Transaction</th>
                  <th className="px-4 py-2 font-semibold text-right">Montant (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-stone-900">
                    Forfait {dossier.packageSnapshot.title} (Option {dossier.packageSnapshot.roomType})
                  </td>
                  <td className="px-4 py-2.5 text-stone-500">Tarif officiel agence</td>
                  <td className="px-4 py-2.5 text-stone-500 font-mono">{dossier.trackingCode}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-stone-900">
                    {formatFCFA(dossier.payment.totalAmountFCFA)}
                  </td>
                </tr>

                {dossier.payment.transactions.map((tx) => (
                  <tr key={tx.id} className="bg-blue-50/40">
                    <td className="px-4 py-2 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#f15a24]" />
                        <span>Règlement {tx.method === 'WAVE' ? 'Wave Digital Finance' : 'Orange Money'}</span>
                      </div>
                      <span className="text-[10px] text-[#135ca5] font-bold block ml-5">
                        {tx.paymentType === 'FULL' ? 'Type 2 : Règlement Intégral (100%)' : 'Type 1 : Acompte de Réservation'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-stone-600">
                      {tx.method} · {tx.phone}
                    </td>
                    <td className="px-4 py-2 font-mono text-[11px] text-stone-600">
                      {tx.reference}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-[#164e96]">
                      + {formatFCFA(tx.amountFCFA)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 border-t-2 border-stone-200 text-xs font-semibold">
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-stone-700 text-right">Total des Versements Encaissés:</td>
                  <td className="px-4 py-2 text-right font-mono text-[#164e96] text-sm font-bold">
                    {formatFCFA(dossier.payment.amountPaidFCFA)}
                  </td>
                </tr>
                <tr className="border-t border-stone-200">
                  <td colSpan={3} className="px-4 py-2 text-stone-700 text-right">Solde Restant à Régler:</td>
                  <td className={`px-4 py-2 text-right font-mono text-sm ${dossier.payment.remainingBalanceFCFA === 0 ? 'text-[#164e96] font-bold' : 'text-[#ea580c] font-bold'}`}>
                    {formatFCFA(dossier.payment.remainingBalanceFCFA)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures & Stamps */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-stone-200 mt-6 text-xs">
            <div className="text-center p-3 border border-dashed border-stone-300 rounded-xl">
              <span className="block text-stone-500 font-medium mb-10">Signature du Pèlerin (Lu et approuvé)</span>
              <span className="text-[10px] text-stone-400">Date et mention manuscrite</span>
            </div>

            <div className="text-center p-3 border border-stone-300 rounded-xl bg-stone-50">
              <span className="block text-stone-700 font-bold mb-2">Cachet & Signature de l'Agence</span>
              <div className="w-24 h-24 mx-auto border-2 border-[#164e96] rounded-full flex flex-col items-center justify-center text-[#164e96] rotate-[-8deg] p-1 shadow-sm bg-white">
                <span className="text-[9px] font-black tracking-widest text-[#164e96]">{agencyConfig.name}</span>
                <span className="text-[8px] font-amiri text-[#ea580c]">حج ومبرور</span>
                <span className="text-[7px] font-mono text-stone-500">VISA & CASHIER</span>
                <span className="text-[7px] text-[#ea580c] font-bold">CERTIFIÉ</span>
              </div>
            </div>
          </div>

          {/* Legal footer */}
          <div className="mt-8 text-[10px] text-stone-400 text-center leading-normal border-t border-stone-100 pt-3">
            Ce document atteste de la réservation et de l'enregistrement administratif du pèlerin auprès de l'agence {agencyConfig.name}.
            Document administratif officiel délivré pour le dossier de voyage et de pèlerinage.
          </div>
        </div>
      </div>
    </div>
  );
};
