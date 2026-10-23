import React, { useState } from 'react';
import { PilgrimDossier, WorkflowStatus, DocumentType } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Plane,
  CreditCard,
  MessageSquare,
  Mail,
  Printer,
  ChevronRight,
  ExternalLink,
  Check,
  Send,
  Eye,
  Download,
  PlusCircle,
  Sparkles,
  IdCard,
} from 'lucide-react';
import { OfficialReceiptModal } from '../common/OfficialReceiptModal';
import { WhatsAppGroupCard } from '../common/WhatsAppGroupCard';
import { generatePdfReceipt } from '../../utils/generatePdfReceipt';
import { generateSingleBadgePdf } from '../../utils/generatePilgrimBadgePdf';
import { generateFlightTicketPdf, generateVisaPdf } from '../../utils/generateAdminDocPdf';

interface DossierDetailModalProps {
  dossier: PilgrimDossier | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DossierDetailModal: React.FC<DossierDetailModalProps> = ({
  dossier,
  isOpen,
  onClose,
}) => {
  const {
    formatFCFA,
    reviewDocument,
    updateDossierStatus,
    updateDossier,
    sendNotification,
    agencyConfig,
    processPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRAVEL_DOCS' | 'DOCUMENTS' | 'PAYMENTS' | 'NOTIFY'>('OVERVIEW');
  const [showOfficialModal, setShowOfficialModal] = useState<boolean>(false);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<any>(null);

  // Status progression inputs
  const [newStatus, setNewStatus] = useState<WorkflowStatus>(dossier?.workflowStatus || 'DOCUMENTS_PENDING');
  
  // Airline & Flight Details (Defined & Editable by Back-Office)
  const [airlineName, setAirlineName] = useState<string>(
    dossier?.flightDetails?.airline || 'Air Sénégal'
  );
  const [flightNumber, setFlightNumber] = useState<string>(
    dossier?.flightDetails?.flightNumber || 'HC-401'
  );
  const [pnrNumber, setPnrNumber] = useState<string>(
    dossier?.flightDetails?.pnr || 'HC-924XX'
  );
  const [departureDate, setDepartureDate] = useState<string>(
    dossier?.flightDetails?.departureDate || dossier?.packageSnapshot.departureDate || ''
  );
  const [departureTime, setDepartureTime] = useState<string>(
    dossier?.flightDetails?.departureTime || '08:30'
  );
  const [departureCity, setDepartureCity] = useState<string>(
    dossier?.flightDetails?.departureCity || 'Dakar (AIBD / DSS)'
  );
  const [destinationCity, setDestinationCity] = useState<string>(
    dossier?.flightDetails?.destinationCity || 'Djeddah (JED)'
  );
  const [returnFlightNumber, setReturnFlightNumber] = useState<string>(
    dossier?.flightDetails?.returnFlightNumber || 'HC-402'
  );
  const [returnDate, setReturnDate] = useState<string>(
    dossier?.flightDetails?.returnDate || dossier?.packageSnapshot.returnDate || ''
  );
  const [seatNumber, setSeatNumber] = useState<string>(
    dossier?.flightDetails?.seatNumber || '18A'
  );
  const [terminal, setTerminal] = useState<string>(
    dossier?.flightDetails?.terminal || 'Terminal 1'
  );
  const [flightStatus, setFlightStatus] = useState<'ISSUED' | 'PENDING'>(
    dossier?.flightDetails?.status || 'ISSUED'
  );

  // Saudi Visa Details (Back-Office Insertion for Client Space)
  const [visaNumber, setVisaNumber] = useState<string>(
    dossier?.visaDetails?.visaNumber || 'KSA-EV-2026-994821'
  );
  const [visaType, setVisaType] = useState<'TOURIST' | 'UMRAH' | 'HAJJ'>(
    dossier?.visaDetails?.visaType || (dossier?.packageSnapshot.type === 'HAJJ' ? 'HAJJ' : 'UMRAH')
  );
  const [visaIssueDate, setVisaIssueDate] = useState<string>(
    dossier?.visaDetails?.issueDate || '2026-03-12'
  );
  const [visaExpiryDate, setVisaExpiryDate] = useState<string>(
    dossier?.visaDetails?.expiryDate || '2026-06-25'
  );
  const [visaEntryBorder, setVisaEntryBorder] = useState<string>(
    dossier?.visaDetails?.entryBorder || 'JEDDAH / MADINAH'
  );
  const [visaBorderNumber, setVisaBorderNumber] = useState<string>(
    dossier?.visaDetails?.borderNumber || '394821094'
  );
  const [visaStatus, setVisaStatus] = useState<'ISSUED' | 'PENDING' | 'REJECTED'>(
    dossier?.visaDetails?.status || 'ISSUED'
  );

  const [flightSaveSuccess, setFlightSaveSuccess] = useState<boolean>(false);
  const [travelDocsSuccessToast, setTravelDocsSuccessToast] = useState<string | null>(null);

  // Custom SMS / Email dispatch
  const [manualMsg, setManualMsg] = useState<string>('');
  const [manualType, setManualType] = useState<'SMS' | 'EMAIL'>('SMS');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Admin Payment Confirmation Form State
  const [showAddPayment, setShowAddPayment] = useState<boolean>(false);
  const [payMethod, setPayMethod] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [payAmount, setPayAmount] = useState<string>('');
  const [payPhone, setPayPhone] = useState<string>(dossier?.personalInfo.phone || '');
  const [payRef, setPayRef] = useState<string>('');
  const [payType, setPayType] = useState<'DEPOSIT' | 'FULL' | 'BALANCE'>('DEPOSIT');
  const [autoDownloadPdfReceipt, setAutoDownloadPdfReceipt] = useState<boolean>(true);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<{
    receiptNumber: string;
    amount: number;
    method: string;
    tx: any;
  } | null>(null);

  if (!isOpen || !dossier) return null;

  const handleDownloadAttestationPdf = () => {
    generatePdfReceipt({
      dossier,
      agencyConfig,
      autoDownload: true,
    });
  };

  const handleDownloadBadgePdf = () => {
    generateSingleBadgePdf(dossier, agencyConfig, true);
  };

  const handleDownloadSingleTxPdf = (tx: any) => {
    generatePdfReceipt({
      dossier,
      transaction: tx,
      agencyConfig,
      autoDownload: true,
    });
  };

  const handleConfirmAdminPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(payAmount.replace(/\D/g, ''), 10);
    if (!amountNum || amountNum <= 0) {
      alert('Veuillez saisir un montant valide supérieur à 0 FCFA');
      return;
    }

    const res = processPayment({
      dossierId: dossier.id,
      amountFCFA: amountNum,
      method: payMethod,
      paymentType: payType,
      phone: payPhone || dossier.personalInfo.phone,
      reference: payRef.trim() || undefined,
    });

    if (res.success && res.transaction) {
      // Automatic PDF Generation and Download
      if (autoDownloadPdfReceipt) {
        generatePdfReceipt({
          dossier,
          transaction: res.transaction,
          agencyConfig,
          autoDownload: true,
        });
      }

      setPaymentSuccessToast({
        receiptNumber: res.receiptNumber,
        amount: amountNum,
        method: payMethod === 'WAVE' ? 'Wave Sénégal' : 'Orange Money',
        tx: res.transaction,
      });

      // Reset form
      setPayAmount('');
      setPayRef('');
      setShowAddPayment(false);
    }
  };

  const handleSaveFlightDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateDossier(dossier.id, {
      flightDetails: {
        airline: airlineName.trim() || 'Compagnie Aérienne Officielle',
        flightNumber: flightNumber.trim() || 'HC-401',
        pnr: pnrNumber.trim() || 'CONFIRMED',
        departureDate: departureDate.trim() || dossier.packageSnapshot.departureDate,
        departureTime: departureTime.trim() || '08:30',
        departureCity: departureCity.trim() || 'Dakar (AIBD / DSS)',
        destinationCity: destinationCity.trim() || 'Djeddah (JED)',
        returnFlightNumber: returnFlightNumber.trim() || 'HC-402',
        returnDate: returnDate.trim() || dossier.packageSnapshot.returnDate,
        seatNumber: seatNumber.trim() || '18A',
        terminal: terminal.trim() || 'Terminal 1',
        ticketPdfName: `Billet_Avion_${dossier.personalInfo.lastName}.pdf`,
        ticketPdfSize: '1.2 Mo',
        status: flightStatus,
        uploadedAt: new Date().toISOString(),
      },
    });
    setFlightSaveSuccess(true);
    setTimeout(() => setFlightSaveSuccess(false), 4000);
  };

  const handleSaveBothTravelDocs = () => {
    updateDossier(dossier.id, {
      workflowStatus: 'FLIGHT_TICKET_ISSUED',
      flightDetails: {
        airline: airlineName.trim() || 'Air Sénégal',
        flightNumber: flightNumber.trim() || 'HC-401',
        pnr: pnrNumber.trim() || 'CONFIRMED',
        departureDate: departureDate.trim() || dossier.packageSnapshot.departureDate,
        departureTime: departureTime.trim() || '08:30',
        departureCity: departureCity.trim() || 'Dakar (AIBD / DSS)',
        destinationCity: destinationCity.trim() || 'Djeddah (JED)',
        returnFlightNumber: returnFlightNumber.trim() || 'HC-402',
        returnDate: returnDate.trim() || dossier.packageSnapshot.returnDate,
        seatNumber: seatNumber.trim() || '18A',
        terminal: terminal.trim() || 'Terminal 1',
        baggageAllowance: '2 x 23 kg en soute + 10 kg cabine + 5L Zamzam',
        ticketPdfName: `Billet_Avion_${dossier.personalInfo.lastName}.pdf`,
        ticketPdfSize: '1.2 Mo',
        status: flightStatus,
        uploadedAt: new Date().toISOString(),
      },
      visaDetails: {
        visaNumber: visaNumber.trim() || 'KSA-EV-2026-994821',
        visaType: visaType,
        issueDate: visaIssueDate.trim() || '2026-03-12',
        expiryDate: visaExpiryDate.trim() || '2026-06-25',
        entryBorder: visaEntryBorder.trim() || 'JEDDAH / MADINAH',
        borderNumber: visaBorderNumber.trim() || '394821094',
        visaPdfName: `Visa_Saoudien_${dossier.personalInfo.lastName}.pdf`,
        visaPdfSize: '890 Ko',
        status: visaStatus,
        uploadedAt: new Date().toISOString(),
      },
    });

    sendNotification({
      dossierId: dossier.id,
      trackingCode: dossier.trackingCode,
      type: 'SMS',
      recipientPhone: dossier.personalInfo.phone,
      recipientEmail: dossier.personalInfo.email,
      sender: agencyConfig.smsSenderName,
      subject: `Billets & Visas disponibles - Dossier ${dossier.trackingCode}`,
      message: `Salam Alaykum ${dossier.personalInfo.firstName}, votre billet d'avion (${airlineName}) et votre visa saoudien sont prêts et consultables sur votre compte client EVA Voyages ! Code dossier: ${dossier.trackingCode}`,
      trigger: 'STATUS_CHANGE',
    });

    setTravelDocsSuccessToast('Billets d\'avion et visas enregistrés avec succès ! Le pèlerin peut maintenant les télécharger directement depuis son compte client.');
    setTimeout(() => setTravelDocsSuccessToast(null), 5000);
  };

  const handleUpdateWorkflow = () => {
    updateDossierStatus(dossier.id, newStatus, {
      flightDetails: {
        airline: airlineName.trim() || 'Air Sénégal',
        flightNumber: flightNumber.trim() || 'HC-401',
        pnr: pnrNumber.trim() || 'CONFIRMED',
        departureDate: departureDate.trim() || dossier.packageSnapshot.departureDate,
        departureCity: departureCity.trim() || 'Dakar (AIBD)',
        destinationCity: destinationCity.trim() || 'Djeddah (JED)',
      },
    });
    alert('Statut du dossier mis à jour! Les notifications automatiques SMS et Email ont été expédiées.');
  };

  const handleSendManualNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMsg.trim()) return;

    sendNotification({
      dossierId: dossier.id,
      trackingCode: dossier.trackingCode,
      type: manualType,
      recipientPhone: dossier.personalInfo.phone,
      recipientEmail: dossier.personalInfo.email,
      sender: manualType === 'SMS' ? agencyConfig.smsSenderName : agencyConfig.email,
      subject: `Message de votre agence ${agencyConfig.name} - Dossier ${dossier.trackingCode}`,
      message: manualMsg,
      trigger: 'MANUAL',
    });

    setManualMsg('');
    alert(`Notification ${manualType} délivrée avec succès au pèlerin!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-stone-200">
        {/* Header bar */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black tracking-wider text-emerald-400 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
              {dossier.trackingCode}
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {dossier.personalInfo.firstName} {dossier.personalInfo.lastName}
              </h2>
              <span className="text-xs text-stone-400">
                {dossier.packageSnapshot.title} · Chambre {dossier.packageSnapshot.roomType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadBadgePdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              title="Télécharger le badge officiel du pèlerin au format PDF"
            >
              <IdCard className="w-3.5 h-3.5 text-[#f15a24]" />
              <span>Badge Pèlerin PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadAttestationPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f15a24] hover:bg-[#d94814] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              title="Télécharger l'attestation complète au format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Attestation PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setShowOfficialModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-200 bg-stone-50 text-xs font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 px-2 border-b-2 transition-all ${
              activeTab === 'OVERVIEW'
                ? 'border-emerald-800 text-emerald-900 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Vue Générale & Statut
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRAVEL_DOCS')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'TRAVEL_DOCS'
                ? 'border-[#135ca5] text-[#135ca5] font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5 text-[#f15a24]" />
            <span>Billets & Visas Client</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-[#135ca5] rounded-full text-[10px] font-bold">
              {dossier.flightDetails?.flightNumber && dossier.visaDetails?.visaNumber ? 'Disponibles' : 'À introduire'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'DOCUMENTS'
                ? 'border-emerald-800 text-emerald-900 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <span>Pièces Administratives</span>
            <span className="px-1.5 py-0.2 bg-stone-200 text-stone-800 rounded-full text-[10px]">
              {Object.keys(dossier.documents).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAYMENTS')}
            className={`pb-2.5 px-2 border-b-2 transition-all ${
              activeTab === 'PAYMENTS'
                ? 'border-emerald-800 text-emerald-900 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            Paiements Wave / OM ({formatFCFA(dossier.payment.amountPaidFCFA)})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('NOTIFY')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'NOTIFY'
                ? 'border-emerald-800 text-emerald-900 font-bold'
                : 'border-transparent hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Envoyer SMS / Email</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-xs">
          {/* TAB 1: OVERVIEW & STATUS ADVANCEMENT */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Workflow Status Controller */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    Pilotage de l'Avancement du Dossier
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Actuel: {dossier.workflowStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Passer à l'étape suivante:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as WorkflowStatus)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="DOCUMENTS_PENDING">Documents Manquants</option>
                      <option value="UNDER_REVIEW">Documents Soumis (En examen)</option>
                      <option value="DOCUMENTS_APPROVED">Documents Validés</option>
                      <option value="FLIGHT_TICKET_ISSUED">Billet d'Avion & Vol Confirmés</option>
                      <option value="READY_FOR_DEPARTURE">Prêt pour l'embarquement</option>
                      <option value="COMPLETED">Pèlerinage Accompli</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Compagnie Aérienne Associée:</label>
                    <input
                      type="text"
                      value={airlineName}
                      onChange={(e) => setAirlineName(e.target.value)}
                      placeholder="Ex: Air Sénégal, Saudia..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleUpdateWorkflow}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer & Notifier Automatiquement le Pèlerin (SMS + Email)</span>
                  </button>
                </div>
              </div>

              {/* DÉFINITION DE LA COMPAGNIE AÉRIENNE & GESTION DU VOL (Back-Office) */}
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#135ca5] text-white flex items-center justify-center">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sky-950 text-xs uppercase tracking-wider block">
                        Gestion de la Compagnie Aérienne & Vol du Dossier
                      </span>
                      <span className="text-[11px] text-sky-800">
                        Définissez la compagnie aérienne, le numéro de vol et la réservation PNR de ce pèlerin.
                      </span>
                    </div>
                  </div>
                  {flightSaveSuccess && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Enregistré avec succès !
                    </span>
                  )}
                </div>

                {/* Preset Fast Airline Selector */}
                <div>
                  <label className="block font-semibold text-stone-600 text-[11px] mb-1.5">
                    Sélection rapide de la Compagnie Aérienne :
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Air Sénégal',
                      'Saudia Airlines',
                      'Turkish Airlines',
                      'Ethiopian Airlines',
                      'Flynas',
                      'Emirates',
                      'Qatar Airways',
                    ].map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setAirlineName(comp)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          airlineName === comp
                            ? 'bg-[#135ca5] text-white shadow-xs'
                            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nom de la Compagnie :
                    </label>
                    <input
                      type="text"
                      value={airlineName}
                      onChange={(e) => setAirlineName(e.target.value)}
                      placeholder="Ex: Air Sénégal"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Numéro de Vol :
                    </label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="Ex: HC-401 / SV-492"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Code PNR / Dossier Aérien :
                    </label>
                    <input
                      type="text"
                      value={pnrNumber}
                      onChange={(e) => setPnrNumber(e.target.value)}
                      placeholder="Ex: HC-924XX / 6K2T9A"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold text-[#135ca5]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Aéroport & Ville de Départ :
                    </label>
                    <input
                      type="text"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="Dakar (AIBD)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Aéroport / Ville d'Arrivée :
                    </label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="Djeddah (JED) ou Médine (MED)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date & Heure du Vol :
                    </label>
                    <input
                      type="text"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      placeholder="Ex: 2026-05-18 à 22:30"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500">
                    Ces coordonnées de vol seront immédiatement consultables par le pèlerin dans son suivi de dossier.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveFlightDetails}
                    className="px-4 py-2 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plane className="w-3.5 h-3.5 text-[#f15a24]" />
                    <span>Enregistrer la Compagnie & les Coordonnées de Vol</span>
                  </button>
                </div>
              </div>

              {/* Identity & Emergency contacts grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
                  <span className="font-bold text-stone-700 uppercase tracking-wider block border-b border-stone-100 pb-1">
                    Données d'Identité & Contact
                  </span>
                  <div className="space-y-1 text-stone-600">
                    <div>Passeport: <strong className="text-stone-900 font-mono">{dossier.personalInfo.passportNumber || 'N/A'}</strong> (Exp: {dossier.personalInfo.passportExpiry})</div>
                    <div>Nationalité: <strong>{dossier.personalInfo.nationality}</strong></div>
                    <div>Date de naissance: {dossier.personalInfo.dateOfBirth} à {dossier.personalInfo.placeOfBirth}</div>
                    <div>Téléphone: <strong className="font-mono">{dossier.personalInfo.phone}</strong></div>
                    <div>Email: {dossier.personalInfo.email}</div>
                    <div>Adresse: {dossier.personalInfo.address}, {dossier.personalInfo.city}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-2">
                  <span className="font-bold text-stone-700 uppercase tracking-wider block border-b border-stone-100 pb-1">
                    Sécurité Médicale & Contact d'Urgence
                  </span>
                  <div className="space-y-1 text-stone-600">
                    <div>Groupe Sanguin: <strong className="text-emerald-800">{dossier.personalInfo.bloodGroup || 'Non spécifié'}</strong></div>
                    <div>Contact Urgence: <strong>{dossier.personalInfo.emergencyContactName || 'N/A'}</strong></div>
                    <div>Lien / Tél: {dossier.personalInfo.emergencyContactRelation} ({dossier.personalInfo.emergencyContactPhone})</div>
                    {dossier.personalInfo.mahramName && (
                      <div className="text-amber-800 font-medium">Mahram / Encadrement: {dossier.personalInfo.mahramName}</div>
                    )}
                    {dossier.personalInfo.medicalConditions && (
                      <div className="pt-1 text-stone-500 italic">"{dossier.personalInfo.medicalConditions}"</div>
                    )}
                  </div>
                </div>
              </div>

              {/* DEDICATED OFFICIAL WHATSAPP GROUP ACCORDING TO PACKAGE */}
              <div className="pt-2">
                <WhatsAppGroupCard
                  dossier={dossier}
                  variant="ADMIN"
                />
              </div>
            </div>
          )}

          {/* TAB: BILLETS D'AVION ET VISAS POUR LE COMPTE CLIENT */}
          {activeTab === 'TRAVEL_DOCS' && (
            <div className="space-y-6">
              {/* Toast Feedback */}
              {travelDocsSuccessToast && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{travelDocsSuccessToast}</span>
                </div>
              )}

              {/* Informative Header */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#f15a24] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sky-950 text-xs uppercase tracking-wider">
                    Insertion des Titres de Transport & Visas pour le Compte Client du Pèlerin
                  </h4>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    Saisissez ou modifiez les détails de vol et le visa saoudien ci-dessous. Dès l'enregistrement, ces titres apparaîtront instantanément dans l'espace client du pèlerin (dans l'onglet <strong>Suivi</strong>) avec la possibilité de les télécharger en PDF officiel, et un SMS / e-mail de notification sera automatiquement expédié.
                  </p>
                </div>
              </div>

              {/* SECTION 1: BILLET D'AVION ÉLECTRONIQUE */}
              <div className="p-5 bg-white border-2 border-sky-200 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#135ca5] text-white flex items-center justify-center">
                      <Plane className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#135ca5]">
                        1. Paramétrage & Insertion du Billet d'Avion
                      </h4>
                      <span className="text-[10px] text-stone-500">
                        Vols Internationaux Aller / Retour & Enregistrement
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        generateFlightTicketPdf({
                          dossier: {
                            ...dossier,
                            flightDetails: {
                              airline: airlineName,
                              flightNumber,
                              pnr: pnrNumber,
                              departureDate,
                              departureTime,
                              departureCity,
                              destinationCity,
                              returnFlightNumber,
                              returnDate,
                              seatNumber,
                              terminal,
                              baggageAllowance: '2 x 23 kg + 10 kg cabine + 5L Zamzam',
                              ticketPdfName: `Billet_${dossier.personalInfo.lastName}.pdf`,
                              status: flightStatus,
                            },
                          },
                          agencyConfig,
                          autoDownload: true,
                        })
                      }
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#135ca5] border border-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Prévisualiser Billet PDF</span>
                    </button>
                  </div>
                </div>

                {/* Preset Quick Airline Selector */}
                <div>
                  <label className="block font-semibold text-stone-600 text-[11px] mb-1.5">
                    Sélection rapide de la Compagnie Aérienne :
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Air Sénégal',
                      'Saudia Airlines',
                      'Turkish Airlines',
                      'Ethiopian Airlines',
                      'Flynas',
                      'Emirates',
                      'Qatar Airways',
                    ].map((comp) => (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => setAirlineName(comp)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          airlineName === comp
                            ? 'bg-[#135ca5] text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nom de la Compagnie :
                    </label>
                    <input
                      type="text"
                      value={airlineName}
                      onChange={(e) => setAirlineName(e.target.value)}
                      placeholder="Air Sénégal"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Numéro de Vol Aller :
                    </label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="HC-401"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Code PNR / Dossier Passager :
                    </label>
                    <input
                      type="text"
                      value={pnrNumber}
                      onChange={(e) => setPnrNumber(e.target.value)}
                      placeholder="HC-924XX"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-[#135ca5]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Aéroport Départ :
                    </label>
                    <input
                      type="text"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="Dakar (AIBD / DSS)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Aéroport Arrivée :
                    </label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="Djeddah (JED) ou Médine (MED)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date & Heure Vol Aller :
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-2/3 px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                      />
                      <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-1/3 px-2 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Numéro Vol Retour :
                    </label>
                    <input
                      type="text"
                      value={returnFlightNumber}
                      onChange={(e) => setReturnFlightNumber(e.target.value)}
                      placeholder="HC-402"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date Vol Retour :
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Siège & Terminal Assignés :
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        placeholder="Siège (ex: 18A)"
                        className="w-1/2 px-2.5 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                      />
                      <input
                        type="text"
                        value={terminal}
                        onChange={(e) => setTerminal(e.target.value)}
                        placeholder="Terminal"
                        className="w-1/2 px-2.5 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: VISA ÉLECTRONIQUE SAOUDIEN */}
              <div className="p-5 bg-white border-2 border-emerald-200 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                        2. Paramétrage & Insertion du Visa Saoudien
                      </h4>
                      <span className="text-[10px] text-stone-500">
                        Autorisation consulaire Ministère du Hajj & Umrah (KSA)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        generateVisaPdf({
                          dossier: {
                            ...dossier,
                            visaDetails: {
                              visaNumber,
                              visaType,
                              issueDate: visaIssueDate,
                              expiryDate: visaExpiryDate,
                              entryBorder: visaEntryBorder,
                              borderNumber: visaBorderNumber,
                              visaPdfName: `Visa_${dossier.personalInfo.lastName}.pdf`,
                              status: visaStatus,
                            },
                          },
                          agencyConfig,
                          autoDownload: true,
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Prévisualiser Visa PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Numéro de Visa Saoudien :
                    </label>
                    <input
                      type="text"
                      value={visaNumber}
                      onChange={(e) => setVisaNumber(e.target.value)}
                      placeholder="KSA-EV-2026-994821"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold text-emerald-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Catégorie du Visa :
                    </label>
                    <select
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    >
                      <option value="HAJJ">HAJJ (Pèlerinage Majeur)</option>
                      <option value="UMRAH">OUMRA (Pèlerinage Mineur)</option>
                      <option value="TOURIST">Tourisme / Visite Religieuse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Numéro de Frontière (رقم الحدود) :
                    </label>
                    <input
                      type="text"
                      value={visaBorderNumber}
                      onChange={(e) => setVisaBorderNumber(e.target.value)}
                      placeholder="394821094"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date de Délivrance :
                    </label>
                    <input
                      type="date"
                      value={visaIssueDate}
                      onChange={(e) => setVisaIssueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Date d'Expiration :
                    </label>
                    <input
                      type="date"
                      value={visaExpiryDate}
                      onChange={(e) => setVisaExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Poste Frontière d'Entrée :
                    </label>
                    <input
                      type="text"
                      value={visaEntryBorder}
                      onChange={(e) => setVisaEntryBorder(e.target.value)}
                      placeholder="JEDDAH / MADINAH"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: SAVE AND DISPATCH TO PILGRIM CTA */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 to-[#0c3f74] rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-0.5">
                  <span className="font-black text-sm block">
                    Validation & Transmission Instantanée
                  </span>
                  <span className="text-xs text-blue-200 block">
                    En validant, le pèlerin recevra immédiatement son billet et son visa sur son compte client, et une notification SMS lui sera transmise.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveBothTravelDocs}
                  className="px-6 py-3.5 bg-[#f15a24] hover:bg-[#d94917] text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Transmettre sur le Compte Client du Pèlerin</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENT REVIEWS */}
          {activeTab === 'DOCUMENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">
                  Inspectez les pièces administratives et validez-les pour l'attribution de la place et l'émission du billet d'avion.
                </span>
              </div>

              {(['passport', 'photo', 'medical'] as DocumentType[]).map((docType) => {
                const doc = dossier.documents[docType];
                const title =
                  docType === 'passport'
                    ? 'Passeport Biométrique'
                    : docType === 'photo'
                    ? 'Photo d\'Identité Fond Blanc'
                    : 'Certificat Médical d\'Aptitude';

                return (
                  <div
                    key={docType}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-300">
                        {doc?.fileUrl ? (
                          <img src={doc.fileUrl} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{title}</span>
                          {doc?.status === 'APPROVED' ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Validé
                            </span>
                          ) : doc?.status === 'REJECTED' ? (
                            <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                              Rejeté
                            </span>
                          ) : doc ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                              En Examen
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-2 py-0.5 rounded-full">
                              Manquant
                            </span>
                          )}
                        </div>

                        {doc ? (
                          <p className="text-stone-500 mt-0.5">
                            Fichier: {doc.fileName} ({doc.fileSize}) · Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                          </p>
                        ) : (
                          <p className="text-red-600 mt-0.5">Ce document n'a pas encore été chargé par le pèlerin.</p>
                        )}

                        {doc?.rejectionReason && (
                          <span className="text-red-700 font-medium block mt-1">
                            Motif du rejet: {doc.rejectionReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {doc && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => reviewDocument(dossier.id, docType, true)}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Valider</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Motif du rejet (transmis par SMS au pèlerin) :', 'Image floue ou coupée');
                            if (reason) reviewDocument(dossier.id, docType, false, reason);
                          }}
                          className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-semibold"
                        >
                          Rejeter
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: PAYMENTS LEDGER & CONFIRMATION */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-5">
              {/* Success Notification Banner when payment is confirmed */}
              {paymentSuccessToast && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-950 text-sm">
                        Paiement de {formatFCFA(paymentSuccessToast.amount)} confirmé avec succès !
                      </p>
                      <p className="text-emerald-800">
                        Opérateur: <strong>{paymentSuccessToast.method}</strong> · Reçu officiel N°{' '}
                        <strong className="font-mono">{paymentSuccessToast.receiptNumber}</strong>
                        {autoDownloadPdfReceipt && ' (Reçu PDF téléchargé automatiquement sur votre ordinateur)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleTxPdf(paymentSuccessToast.tx)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Re-télécharger PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentSuccessToast(null)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 3 Summary Financial Cards */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-stone-100 rounded-2xl text-center">
                <div>
                  <span className="text-stone-500 block text-[11px]">Forfait Total</span>
                  <span className="text-base font-black text-stone-900 font-mono tabular-nums">
                    {formatFCFA(dossier.payment.totalAmountFCFA)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Encaissé (Wave/OM)</span>
                  <span className="text-base font-black text-emerald-800 font-mono tabular-nums">
                    {formatFCFA(dossier.payment.amountPaidFCFA)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[11px]">Solde Dû</span>
                  <span
                    className={`text-base font-black font-mono tabular-nums ${
                      dossier.payment.remainingBalanceFCFA === 0 ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {formatFCFA(dossier.payment.remainingBalanceFCFA)}
                  </span>
                </div>
              </div>

              {/* Action Bar: Add Payment & Download Global Receipt */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <div>
                  <span className="font-bold text-sky-950 block text-xs">
                    Gestion Financière & Reçus de Paiement
                  </span>
                  <span className="text-[11px] text-sky-800">
                    Enregistrez un versement direct ou confirmez une transaction pour générer automatiquement le reçu officiel PDF.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(!showAddPayment)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showAddPayment ? 'Fermer le formulaire' : 'Enregistrer un Règlement'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadAttestationPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-[#f15a24]" />
                    <span>Reçu Global PDF</span>
                  </button>
                </div>
              </div>

              {/* FORM: Enregistrer & Confirmer un Encaissement */}
              {showAddPayment && (
                <form
                  onSubmit={handleConfirmAdminPayment}
                  className="p-5 bg-white border-2 border-[#135ca5]/30 rounded-2xl space-y-4 shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#f15a24]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                        Formulaire d'Encaissement & Émission Automatique de Reçu PDF
                      </h4>
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono">Dossier: {dossier.trackingCode}</span>
                  </div>

                  {/* Operator selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      Opérateur Mobile d'Encaissement :
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setPayMethod('WAVE')}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          payMethod === 'WAVE'
                            ? 'bg-sky-50 border-[#0ea5e9] text-[#0369a1] font-bold shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                            alt="Wave"
                            className="w-5 h-5 object-contain rounded-full shadow-xs bg-white p-0.5 border border-sky-100"
                          />
                          <span>Wave Digital (Sénégal)</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold">Passerelle QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPayMethod('ORANGE_MONEY')}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          payMethod === 'ORANGE_MONEY'
                            ? 'bg-orange-50 border-[#ff7900] text-[#c2410c] font-bold shadow-sm'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                            alt="Orange Money"
                            className="w-5 h-5 object-contain rounded-sm shadow-xs bg-white p-0.5 border border-orange-200"
                          />
                          <span>Orange Money (Sénégal)</span>
                        </div>
                        <span className="text-[10px] font-mono font-semibold">Code Marchand</span>
                      </button>
                    </div>
                  </div>

                  {/* Amount and Shortcuts */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      Montant Encaissé (FCFA) :
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="10000"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="Ex: 1500000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                        FCFA
                      </span>
                    </div>

                    {/* Quick fill buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="text-stone-400">Raccourcis :</span>
                      <button
                        type="button"
                        onClick={() => setPayAmount('1000000')}
                        className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                      >
                        1 000 000 FCFA (Acompte min.)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayAmount(String(Math.round(dossier.payment.totalAmountFCFA / 2)))}
                        className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                      >
                        50% ({formatFCFA(Math.round(dossier.payment.totalAmountFCFA / 2))})
                      </button>
                      {dossier.payment.remainingBalanceFCFA > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayAmount(String(dossier.payment.remainingBalanceFCFA));
                            setPayType('FULL');
                          }}
                          className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold"
                        >
                          Solde Intégral ({formatFCFA(dossier.payment.remainingBalanceFCFA)})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone & Operator Ref */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block font-semibold text-stone-700">
                        Numéro de Téléphone Débité :
                      </label>
                      <input
                        type="tel"
                        required
                        value={payPhone}
                        onChange={(e) => setPayPhone(e.target.value)}
                        placeholder="+221 77 000 00 00"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-stone-700">
                        Référence Transaction Opérateur :
                      </label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder={payMethod === 'WAVE' ? 'WAV-SN-26...' : 'OM-SN-26...'}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Nature du Règlement :
                    </label>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="payType"
                          value="DEPOSIT"
                          checked={payType === 'DEPOSIT'}
                          onChange={() => setPayType('DEPOSIT')}
                        />
                        <span>Acompte de Réservation (Type 1)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="payType"
                          value="FULL"
                          checked={payType === 'FULL'}
                          onChange={() => setPayType('FULL')}
                        />
                        <span>Règlement Intégral 100% (Type 2)</span>
                      </label>
                    </div>
                  </div>

                  {/* Checkbox: Auto download PDF */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                      <input
                        type="checkbox"
                        checked={autoDownloadPdfReceipt}
                        onChange={(e) => setAutoDownloadPdfReceipt(e.target.checked)}
                        className="w-4 h-4 text-[#135ca5] rounded"
                      />
                      <span>Générer et télécharger automatiquement le reçu PDF officiel après validation</span>
                    </label>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Recommandé
                    </span>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setShowAddPayment(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmer le Paiement & Émettre Reçu PDF</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Transactions list */}
              <div>
                <span className="font-bold text-stone-700 uppercase tracking-wider block mb-2 text-xs">
                  Détail des Transactions Encaissées
                </span>

                {dossier.payment.transactions.length > 0 ? (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-3 py-2.5">Date</th>
                          <th className="px-3 py-2.5">Opérateur</th>
                          <th className="px-3 py-2.5">Réf & Reçu</th>
                          <th className="px-3 py-2.5 text-right">Montant</th>
                          <th className="px-3 py-2.5 text-center">Reçu PDF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {dossier.payment.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-stone-50 transition-colors">
                            <td className="px-3 py-2.5 text-stone-600 whitespace-nowrap">
                              {new Date(tx.date).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-3 py-2.5 font-semibold whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                  tx.method === 'WAVE'
                                    ? 'bg-sky-100 text-[#0284c7]'
                                    : 'bg-orange-100 text-[#ea580c]'
                                }`}
                              >
                                {tx.method === 'WAVE' ? 'Wave' : 'Orange Money'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-stone-600">
                              <span className="font-bold text-stone-900 block">{tx.receiptNumber}</span>
                              <span className="text-[10px] text-stone-400">{tx.reference}</span>
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-800 tabular-nums">
                              +{formatFCFA(tx.amountFCFA)}
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSingleTxPdf(tx)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-[#f15a24] text-[#ea580c] hover:text-white transition-all font-semibold border border-orange-200"
                                  title="Télécharger directement le reçu PDF"
                                >
                                  <Download className="w-3 h-3" />
                                  <span className="text-[11px]">PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTxForReceipt(tx);
                                    setShowOfficialModal(true);
                                  }}
                                  className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                                  title="Aperçu du reçu"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 bg-stone-50 rounded-2xl text-center text-stone-400 text-xs">
                    Aucun versement enregistré pour le moment.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MANUAL NOTIFICATIONS DISPATCH */}
          {activeTab === 'NOTIFY' && (
            <form onSubmit={handleSendManualNotification} className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-800 block uppercase tracking-wider">
                  Envoyer un SMS ou Email direct au Pèlerin
                </span>
                <p className="text-stone-500 text-[11px]">
                  Destinataire: <strong>{dossier.personalInfo.firstName} {dossier.personalInfo.lastName}</strong> (Tél: {dossier.personalInfo.phone} | Email: {dossier.personalInfo.email})
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('SMS')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      manualType === 'SMS' ? 'bg-stone-900 text-white' : 'bg-white border text-stone-700'
                    }`}
                  >
                    SMS (Émetteur: {agencyConfig.smsSenderName})
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('EMAIL')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      manualType === 'EMAIL' ? 'bg-stone-900 text-white' : 'bg-white border text-stone-700'
                    }`}
                  >
                    Email ({agencyConfig.email})
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contenu du message :</label>
                  <textarea
                    rows={4}
                    required
                    value={manualMsg}
                    onChange={(e) => setManualMsg(e.target.value)}
                    placeholder="Ex: Salam Alaykum, nous vous informons que la réunion d'orientation et de remise des kits Hajj aura lieu ce samedi à 10h au siège d'EVA VOYAGES."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer maintenant</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-between items-center">
          <span className="text-[11px] text-stone-500">
            Dernière mise à jour: {new Date(dossier.updatedAt).toLocaleString('fr-FR')}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Official Receipt / Certificate Modal */}
      <OfficialReceiptModal
        dossier={dossier}
        transaction={selectedTxForReceipt}
        isOpen={showOfficialModal}
        onClose={() => {
          setShowOfficialModal(false);
          setSelectedTxForReceipt(null);
        }}
      />
    </div>
  );
};
