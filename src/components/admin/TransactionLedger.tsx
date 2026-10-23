import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, PaymentMethod } from '../../types';
import { CreditCard, Download, Search, CheckCircle2, QrCode, Smartphone, Printer } from 'lucide-react';
import { OfficialReceiptModal } from '../common/OfficialReceiptModal';
import { generatePdfReceipt } from '../../utils/generatePdfReceipt';

export const TransactionLedger: React.FC = () => {
  const { dossiers, formatFCFA, agencyConfig } = useApp();

  const [methodFilter, setMethodFilter] = useState<'ALL' | 'WAVE' | 'ORANGE_MONEY'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'FULL'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<{ tx: Transaction; dossier: any } | null>(null);

  const handleDownloadPdf = (tx: Transaction, dossier: any) => {
    generatePdfReceipt({
      dossier,
      transaction: tx,
      agencyConfig,
      autoDownload: true,
    });
  };

  // Flatten transactions with their dossier context
  const allTransactions = dossiers.flatMap((d) =>
    d.payment.transactions.map((tx) => ({
      tx,
      dossier: d,
    }))
  );

  const filtered = allTransactions.filter(({ tx, dossier }) => {
    const q = search.toLowerCase();
    const matchesSearch =
      tx.reference.toLowerCase().includes(q) ||
      tx.receiptNumber.toLowerCase().includes(q) ||
      tx.phone.includes(q) ||
      dossier.trackingCode.toLowerCase().includes(q) ||
      dossier.personalInfo.lastName.toLowerCase().includes(q);

    const matchesMethod = methodFilter === 'ALL' || tx.method === methodFilter;
    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'FULL' && tx.paymentType === 'FULL') ||
      (typeFilter === 'DEPOSIT' && tx.paymentType !== 'FULL');

    return matchesSearch && matchesMethod && matchesType;
  });

  const totalSum = filtered.reduce((acc, curr) => acc + curr.tx.amountFCFA, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Journal Central des Règlements Wave & Orange Money</h2>
          <p className="text-xs text-stone-500">
            Traçabilité intégrale des encaissements, références d'opérateurs mobiles et reçus de caisse horodatés.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-stone-900 text-white rounded-2xl flex items-center gap-3 text-xs">
            <span className="text-stone-400">Total Encaissé Filtré :</span>
            <span className="font-mono font-bold text-amber-300 text-sm tabular-nums">
              {formatFCFA(totalSum)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par Référence transaction, N° Reçu, Pèlerin ou Téléphone..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Operator Filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMethodFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                methodFilter === 'ALL' ? 'bg-[#135ca5] text-white shadow-sm font-bold' : 'text-stone-600'
              }`}
            >
              Tous ({allTransactions.length})
            </button>
            <button
              type="button"
              onClick={() => setMethodFilter('WAVE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                methodFilter === 'WAVE' ? 'bg-[#1DC4FF] text-slate-900 shadow-sm font-bold' : 'text-stone-600'
              }`}
            >
              Wave ({allTransactions.filter((t) => t.tx.method === 'WAVE').length})
            </button>
            <button
              type="button"
              onClick={() => setMethodFilter('ORANGE_MONEY')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                methodFilter === 'ORANGE_MONEY' ? 'bg-[#f15a24] text-white shadow-sm font-bold' : 'text-stone-600'
              }`}
            >
              Orange Money ({allTransactions.filter((t) => t.tx.method === 'ORANGE_MONEY').length})
            </button>
          </div>

          {/* Payment Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] ${
                typeFilter === 'ALL' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'text-stone-600'
              }`}
            >
              Tous types
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('DEPOSIT')}
              className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] ${
                typeFilter === 'DEPOSIT' ? 'bg-blue-100 text-[#135ca5] shadow-sm font-bold' : 'text-stone-600'
              }`}
            >
              Type 1: Acompte
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('FULL')}
              className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] ${
                typeFilter === 'FULL' ? 'bg-orange-100 text-[#f15a24] shadow-sm font-bold' : 'text-stone-600'
              }`}
            >
              Type 2: Intégral 100%
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Date & Heure</th>
                <th className="px-5 py-3">Opérateur</th>
                <th className="px-5 py-3">Type Règlement</th>
                <th className="px-5 py-3">N° Reçu</th>
                <th className="px-5 py-3">Référence Opérateur</th>
                <th className="px-5 py-3">Pèlerin & Dossier</th>
                <th className="px-5 py-3">Téléphone Débité</th>
                <th className="px-5 py-3 text-right">Montant Encaissé</th>
                <th className="px-5 py-3 text-center">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(({ tx, dossier }) => (
                <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-5 py-3 text-stone-600 whitespace-nowrap">
                    {new Date(tx.date).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-black text-[11px] ${
                        tx.method === 'WAVE'
                          ? 'bg-[#1DC4FF]/10 text-[#0aa6dd] border border-[#1DC4FF]/30'
                          : 'bg-[#FF7900]/10 text-[#ea6200] border border-[#FF7900]/30'
                      }`}
                    >
                      {tx.method === 'WAVE' ? 'WAVE SÉNÉGAL' : 'ORANGE MONEY'}
                    </span>
                  </td>

                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        tx.paymentType === 'FULL'
                          ? 'bg-orange-100 text-[#f15a24] border border-[#f15a24]/30'
                          : 'bg-blue-100 text-[#135ca5] border border-[#135ca5]/30'
                      }`}
                    >
                      {tx.paymentType === 'FULL' ? 'Type 2 : Intégral' : 'Type 1 : Acompte'}
                    </span>
                  </td>

                  <td className="px-5 py-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {tx.receiptNumber}
                  </td>

                  <td className="px-5 py-3 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                    {tx.reference}
                  </td>

                  <td className="px-5 py-3">
                    <div className="font-bold text-stone-900">
                      {dossier.personalInfo.firstName} {dossier.personalInfo.lastName}
                    </div>
                    <div className="font-mono text-[10px] text-emerald-800">
                      {dossier.trackingCode}
                    </div>
                  </td>

                  <td className="px-5 py-3 font-mono text-stone-600 whitespace-nowrap">
                    {tx.phone}
                  </td>

                  <td className="px-5 py-3 text-right font-mono font-bold text-emerald-800 text-sm whitespace-nowrap tabular-nums">
                    +{formatFCFA(tx.amountFCFA)}
                  </td>

                  <td className="px-5 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(tx, dossier)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-[#f15a24] text-[#ea580c] hover:text-white transition-all font-semibold border border-orange-200"
                        title="Télécharger directement le reçu PDF officiel"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[11px]">PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTx({ tx, dossier })}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#135ca5] hover:text-white text-stone-600 transition-colors"
                        title="Aperçu & Impression de l'Attestation Officielle"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-400">
            Aucun enregistrement financier trouvé.
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedTx && (
        <OfficialReceiptModal
          dossier={selectedTx.dossier}
          transaction={selectedTx.tx}
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};
