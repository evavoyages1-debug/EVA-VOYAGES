import React, { useState } from 'react';
import { PilgrimDossier, DocumentType } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileText,
  Upload,
  Download,
  Plane,
  Train,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Eye,
  Trash2,
  RefreshCw,
  FolderDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Calendar,
  Building2,
  QrCode,
} from 'lucide-react';
import {
  downloadAdminDocPdf,
  generateFlightTicketPdf,
  generateVisaPdf,
  generateTrainTicketPdf,
  downloadCompleteAdministrativePackPdf,
  triggerDownload,
} from '../../utils/generateAdminDocPdf';
import { generatePdfReceipt } from '../../utils/generatePdfReceipt';

interface PilgrimDocumentsModalProps {
  dossier: PilgrimDossier | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'TRAVEL_DOCS' | 'ADMIN_DOCS';
}

export const PilgrimDocumentsModal: React.FC<PilgrimDocumentsModalProps> = ({
  dossier,
  isOpen,
  onClose,
  initialTab = 'TRAVEL_DOCS',
}) => {
  const { updateDossier, updateDossierStatus, sendNotification, agencyConfig } = useApp();

  const [activeTab, setActiveTab] = useState<'TRAVEL_DOCS' | 'ADMIN_DOCS'>(initialTab);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [isGeneratingPack, setIsGeneratingPack] = useState<boolean>(false);
  const [downloadingDocType, setDownloadingDocType] = useState<string | null>(null);

  // Form State for Flight Details
  const [flightAirline, setFlightAirline] = useState<string>(
    dossier?.flightDetails?.airline || 'Saudia Airlines'
  );
  const [flightNumber, setFlightNumber] = useState<string>(
    dossier?.flightDetails?.flightNumber || 'SV-492'
  );
  const [flightPnr, setFlightPnr] = useState<string>(
    dossier?.flightDetails?.pnr || 'SV-78K9Q'
  );
  const [flightDepartureDate, setFlightDepartureDate] = useState<string>(
    dossier?.flightDetails?.departureDate || dossier?.packageSnapshot.departureDate || '2026-05-18'
  );
  const [flightDepartureTime, setFlightDepartureTime] = useState<string>(
    dossier?.flightDetails?.departureTime || '08:30'
  );
  const [flightDepartureCity, setFlightDepartureCity] = useState<string>(
    dossier?.flightDetails?.departureCity || 'Dakar (AIBD / DSS)'
  );
  const [flightDestinationCity, setFlightDestinationCity] = useState<string>(
    dossier?.flightDetails?.destinationCity || 'Djeddah (JED)'
  );
  const [flightReturnNumber, setFlightReturnNumber] = useState<string>(
    dossier?.flightDetails?.returnFlightNumber || 'SV-493'
  );
  const [flightReturnDate, setFlightReturnDate] = useState<string>(
    dossier?.flightDetails?.returnDate || dossier?.packageSnapshot.returnDate || '2026-06-08'
  );
  const [flightTicketPdfUrl, setFlightTicketPdfUrl] = useState<string | undefined>(
    dossier?.flightDetails?.ticketPdfUrl
  );
  const [flightTicketPdfName, setFlightTicketPdfName] = useState<string | undefined>(
    dossier?.flightDetails?.ticketPdfName
  );
  const [flightTicketPdfSize, setFlightTicketPdfSize] = useState<string | undefined>(
    dossier?.flightDetails?.ticketPdfSize
  );

  // Form State for Visa Details
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
  const [visaPdfUrl, setVisaPdfUrl] = useState<string | undefined>(
    dossier?.visaDetails?.visaPdfUrl
  );
  const [visaPdfName, setVisaPdfName] = useState<string | undefined>(
    dossier?.visaDetails?.visaPdfName
  );
  const [visaPdfSize, setVisaPdfSize] = useState<string | undefined>(
    dossier?.visaDetails?.visaPdfSize
  );

  // Form State for Haramain Train Ticket
  const [hasTrainTicket, setHasTrainTicket] = useState<boolean>(
    dossier?.trainDetails?.hasTrainTicket ?? true
  );
  const [trainNumber, setTrainNumber] = useState<string>(
    dossier?.trainDetails?.trainNumber || 'HHR-3042'
  );
  const [trainRoute, setTrainRoute] = useState<string>(
    dossier?.trainDetails?.route || 'Makkah Haramain -> Madinah Haramain'
  );
  const [trainDepartureDate, setTrainDepartureDate] = useState<string>(
    dossier?.trainDetails?.departureDate || '2026-05-24'
  );
  const [trainDepartureTime, setTrainDepartureTime] = useState<string>(
    dossier?.trainDetails?.departureTime || '14:15'
  );
  const [trainCarNumber, setTrainCarNumber] = useState<string>(
    dossier?.trainDetails?.carNumber || 'Voiture 03'
  );
  const [trainSeatNumber, setTrainSeatNumber] = useState<string>(
    dossier?.trainDetails?.seatNumber || 'Siège 14B'
  );
  const [trainClassType, setTrainClassType] = useState<'ECONOMY' | 'BUSINESS'>(
    dossier?.trainDetails?.classType || 'BUSINESS'
  );
  const [trainTicketPdfUrl, setTrainTicketPdfUrl] = useState<string | undefined>(
    dossier?.trainDetails?.ticketPdfUrl
  );
  const [trainTicketPdfName, setTrainTicketPdfName] = useState<string | undefined>(
    dossier?.trainDetails?.ticketPdfName
  );
  const [trainTicketPdfSize, setTrainTicketPdfSize] = useState<string | undefined>(
    dossier?.trainDetails?.ticketPdfSize
  );

  if (!isOpen || !dossier) return null;

  // File Upload Handlers (converts File to base64 Data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'FLIGHT' | 'VISA' | 'TRAIN'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
        : `${Math.round(file.size / 1024)} Ko`;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'FLIGHT') {
        setFlightTicketPdfUrl(result);
        setFlightTicketPdfName(file.name);
        setFlightTicketPdfSize(sizeFormatted);
      } else if (target === 'VISA') {
        setVisaPdfUrl(result);
        setVisaPdfName(file.name);
        setVisaPdfSize(sizeFormatted);
      } else if (target === 'TRAIN') {
        setTrainTicketPdfUrl(result);
        setTrainTicketPdfName(file.name);
        setTrainTicketPdfSize(sizeFormatted);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save changes to Dossier
  const handleSaveChanges = () => {
    const updatedFlightDetails = {
      airline: flightAirline,
      flightNumber,
      pnr: flightPnr,
      departureDate: flightDepartureDate,
      departureTime: flightDepartureTime,
      departureCity: flightDepartureCity,
      destinationCity: flightDestinationCity,
      returnFlightNumber: flightReturnNumber,
      returnDate: flightReturnDate,
      ticketPdfUrl: flightTicketPdfUrl,
      ticketPdfName: flightTicketPdfName || 'Billet_Avion_Electronique.pdf',
      ticketPdfSize: flightTicketPdfSize || '1.1 Mo',
      status: 'ISSUED' as const,
      uploadedAt: new Date().toISOString(),
    };

    const updatedVisaDetails = {
      visaNumber,
      visaType,
      issueDate: visaIssueDate,
      expiryDate: visaExpiryDate,
      entryBorder: visaEntryBorder,
      visaPdfUrl,
      visaPdfName: visaPdfName || 'Visa_Officiel_KSA.pdf',
      visaPdfSize: visaPdfSize || '850 Ko',
      status: 'ISSUED' as const,
      uploadedAt: new Date().toISOString(),
    };

    const updatedTrainDetails = {
      hasTrainTicket,
      trainNumber: hasTrainTicket ? trainNumber : undefined,
      trainOperator: 'Haramain High Speed Railway',
      route: hasTrainTicket ? trainRoute : undefined,
      departureDate: hasTrainTicket ? trainDepartureDate : undefined,
      departureTime: hasTrainTicket ? trainDepartureTime : undefined,
      carNumber: hasTrainTicket ? trainCarNumber : undefined,
      seatNumber: hasTrainTicket ? trainSeatNumber : undefined,
      classType: trainClassType,
      ticketPdfUrl: hasTrainTicket ? trainTicketPdfUrl : undefined,
      ticketPdfName: hasTrainTicket ? trainTicketPdfName || 'Ticket_Train_Haramain.pdf' : undefined,
      ticketPdfSize: hasTrainTicket ? trainTicketPdfSize || '620 Ko' : undefined,
      status: hasTrainTicket ? ('ISSUED' as const) : ('NOT_APPLICABLE' as const),
      uploadedAt: new Date().toISOString(),
    };

    // Update state in context
    updateDossier(dossier.id, {
      flightDetails: updatedFlightDetails,
      visaDetails: updatedVisaDetails,
      trainDetails: updatedTrainDetails,
      workflowStatus:
        dossier.workflowStatus === 'DOCUMENTS_APPROVED' || dossier.workflowStatus === 'UNDER_REVIEW'
          ? 'FLIGHT_TICKET_ISSUED'
          : dossier.workflowStatus,
    });

    setSaveSuccessToast('Titres de transport (billet, visa, train) enregistrés avec succès pour ce pèlerin !');
    setTimeout(() => setSaveSuccessToast(null), 4000);
  };

  // Download Handlers
  const handleDownloadFlightPdf = () => {
    if (flightTicketPdfUrl) {
      triggerDownload(flightTicketPdfUrl, flightTicketPdfName || `Billet_Avion_${dossier.personalInfo.lastName}.pdf`);
    } else {
      generateFlightTicketPdf({ dossier, agencyConfig, autoDownload: true });
    }
  };

  const handleDownloadVisaPdf = () => {
    if (visaPdfUrl) {
      triggerDownload(visaPdfUrl, visaPdfName || `Visa_${dossier.personalInfo.lastName}.pdf`);
    } else {
      generateVisaPdf({ dossier, agencyConfig, autoDownload: true });
    }
  };

  const handleDownloadTrainPdf = () => {
    if (trainTicketPdfUrl) {
      triggerDownload(trainTicketPdfUrl, trainTicketPdfName || `Ticket_Train_${dossier.personalInfo.lastName}.pdf`);
    } else {
      generateTrainTicketPdf({ dossier, agencyConfig, autoDownload: true });
    }
  };

  const handleDownloadAdminDoc = async (type: DocumentType) => {
    setDownloadingDocType(type);
    try {
      await downloadAdminDocPdf({ dossier, docType: type, agencyConfig, autoDownload: true });
    } finally {
      setDownloadingDocType(null);
    }
  };

  const handleDownloadFullPack = async () => {
    setIsGeneratingPack(true);
    try {
      await downloadCompleteAdministrativePackPdf({ dossier, agencyConfig, autoDownload: true });
    } finally {
      setIsGeneratingPack(false);
    }
  };

  const handleDownloadFicheInscription = () => {
    generatePdfReceipt({ dossier, agencyConfig, autoDownload: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black tracking-wider text-emerald-400 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
              {dossier.trackingCode}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {dossier.personalInfo.lastName.toUpperCase()} {dossier.personalInfo.firstName}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  {dossier.packageSnapshot.type === 'HAJJ' ? '🕋 Hajj' : '🌙 Oumra'}
                </span>
              </div>
              <span className="text-xs text-stone-400">
                Gestion des Titres de Transport (Billet, Visa, Train) & Pièces Administratives Téléchargeables
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadFullPack}
              disabled={isGeneratingPack}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f15a24] hover:bg-[#d94814] text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              title="Télécharger l'ensemble des pièces en 1 seul PDF"
            >
              <FolderDown className="w-3.5 h-3.5" />
              <span>{isGeneratingPack ? 'Génération...' : 'Pack Complet PDF'}</span>
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

        {/* Quick KPI / Status Strip */}
        <div className="bg-stone-100/90 px-5 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 font-medium">
            <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              Disponibilité Documents :
            </span>

            {/* Flight Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                flightTicketPdfName || dossier.flightDetails
                  ? 'bg-blue-100 text-[#135ca5]'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              <Plane className="w-3 h-3 text-[#f15a24]" />
              <span>Billet Vol : {flightTicketPdfName || dossier.flightDetails ? 'Prêt (PDF)' : 'À introduire'}</span>
            </span>

            {/* Visa Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                visaPdfName || dossier.visaDetails?.visaNumber
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Visa : {visaPdfName || dossier.visaDetails?.visaNumber ? 'Délivré (PDF)' : 'En attente'}</span>
            </span>

            {/* Train Pill */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                hasTrainTicket
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone-200 text-stone-500 line-through'
              }`}
            >
              <Train className="w-3 h-3 text-amber-700" />
              <span>Train Haramain : {hasTrainTicket ? (trainTicketPdfName ? 'Disponible (PDF)' : 'Prévu') : 'Non requis'}</span>
            </span>
          </div>

          <div className="text-[11px] text-stone-500">
            Tél Pèlerin : <strong className="font-mono text-stone-800">{dossier.personalInfo.phone}</strong>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-200 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('TRAVEL_DOCS')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'TRAVEL_DOCS'
                ? 'border-[#135ca5] text-[#135ca5] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plane className="w-4 h-4 text-[#f15a24]" />
            <span>1. Introduction des Titres de Transport & Visa (PDF)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ADMIN_DOCS')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ADMIN_DOCS'
                ? 'border-[#135ca5] text-[#135ca5] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <span>2. Pièces Administratives & Téléchargements PDF</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
              PDF certifiés
            </span>
          </button>
        </div>

        {/* Success toast banner */}
        {saveSuccessToast && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{saveSuccessToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: TRAVEL DOCS (BILLET AVION, VISA, TICKET TRAIN)     */}
          {/* ======================================================== */}
          {activeTab === 'TRAVEL_DOCS' && (
            <div className="space-y-6">
              {/* Introduction Instructions */}
              <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl text-xs text-[#0369a1] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#f15a24]" />
                  <span>Espace de Téléversement & Attribution pour le Pèlerin</span>
                </span>
                <p>
                  Chargez ici pour ce pèlerin son <strong>billet d'avion en PDF</strong>, son <strong>visa saoudien en PDF</strong> et son <strong>billet de train TGV Haramain (si disponible)</strong>. Les fichiers importés seront immédiatement accessibles et téléchargeables par le pèlerin dans son espace de suivi. Si vous n'avez pas de fichier externe, vous pouvez également générer instantanément les versions électroniques officielles standardisées EVA VOYAGES.
                </p>
              </div>

              {/* CARD 1: BILLET D'AVION EN PDF */}
              <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#135ca5] flex items-center justify-center">
                      <Plane className="w-4 h-4 text-[#f15a24]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Billet d'Avion International (PDF)
                      </h3>
                      <span className="text-[11px] text-stone-500">
                        Vols internationaux aller et retour avec franchise bagages
                      </span>
                    </div>
                  </div>

                  {/* Actions on Flight Ticket */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadFlightPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      title="Télécharger le billet d'avion PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#f15a24]" />
                      <span>Télécharger le Billet (PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => generateFlightTicketPdf({ dossier, agencyConfig, autoDownload: true })}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                      title="Générer un e-Billet standardisé de l'agence"
                    >
                      <span>e-Billet EVA PDF</span>
                    </button>
                  </div>
                </div>

                {/* Upload Section for Flight Ticket PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Fichier Billet d'avion (Format PDF ou Document) :
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#135ca5] bg-stone-50/70 hover:bg-white transition-all text-xs">
                        <span className="flex items-center gap-2 text-stone-600 truncate">
                          <Upload className="w-4 h-4 text-[#135ca5] shrink-0" />
                          <span className="truncate">
                            {flightTicketPdfName || 'Choisir un fichier PDF du billet d\'avion...'}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-[#135ca5] bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                          Parcourir
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, 'FLIGHT')}
                          className="hidden"
                        />
                      </label>
                      {flightTicketPdfName && (
                        <button
                          type="button"
                          onClick={() => {
                            setFlightTicketPdfUrl(undefined);
                            setFlightTicketPdfName(undefined);
                            setFlightTicketPdfSize(undefined);
                          }}
                          className="p-2.5 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                          title="Supprimer le fichier joint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {flightTicketPdfName && (
                      <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                        ✓ Fichier prêt : <strong>{flightTicketPdfName}</strong> ({flightTicketPdfSize})
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Statut Actuel</span>
                    <span className="font-bold text-stone-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{flightTicketPdfName ? 'Fichier PDF attaché' : 'Réservation active'}</span>
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      PNR: <strong className="font-mono text-stone-700">{flightPnr}</strong>
                    </span>
                  </div>
                </div>

                {/* Editable Flight Coordinates Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Compagnie :</label>
                    <input
                      type="text"
                      value={flightAirline}
                      onChange={(e) => setFlightAirline(e.target.value)}
                      placeholder="Ex: Saudia Airlines"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">N° de Vol Aller :</label>
                    <input
                      type="text"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      placeholder="Ex: SV-492"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Code PNR / Réf :</label>
                    <input
                      type="text"
                      value={flightPnr}
                      onChange={(e) => setFlightPnr(e.target.value)}
                      placeholder="Ex: SV-78K9Q"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold uppercase text-[#135ca5]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Date & Heure Vol :</label>
                    <input
                      type="text"
                      value={`${flightDepartureDate} ${flightDepartureTime}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(' ');
                        setFlightDepartureDate(parts[0] || '');
                        if (parts[1]) setFlightDepartureTime(parts[1]);
                      }}
                      placeholder="2026-05-18 08:30"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Aéroport de Départ :</label>
                    <input
                      type="text"
                      value={flightDepartureCity}
                      onChange={(e) => setFlightDepartureCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Aéroport d'Arrivée :</label>
                    <input
                      type="text"
                      value={flightDestinationCity}
                      onChange={(e) => setFlightDestinationCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Vol & Date de Retour :</label>
                    <input
                      type="text"
                      value={`${flightReturnNumber} - ${flightReturnDate}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('-');
                        setFlightReturnNumber(parts[0]?.trim() || '');
                        if (parts[1]) setFlightReturnDate(parts[1]?.trim());
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: VISA EN PDF */}
              <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">
                        Visa Pèlerinage Saoudien Nusuk / KSA (PDF)
                      </h3>
                      <span className="text-[11px] text-stone-500">
                        Visa électronique officiel délivré par le Ministère du Hajj & de la Umrah
                      </span>
                    </div>
                  </div>

                  {/* Actions on Visa */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadVisaPdf}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      title="Télécharger le visa en PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger le Visa (PDF)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => generateVisaPdf({ dossier, agencyConfig, autoDownload: true })}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                      title="Générer un duplicata officiel Nusuk KSA"
                    >
                      <span>Duplicata KSA PDF</span>
                    </button>
                  </div>
                </div>

                {/* Upload Section for Visa PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Fichier Visa (Format PDF ou Image Scannée) :
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 border-dashed border-stone-300 hover:border-emerald-600 bg-stone-50/70 hover:bg-white transition-all text-xs">
                        <span className="flex items-center gap-2 text-stone-600 truncate">
                          <Upload className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="truncate">
                            {visaPdfName || 'Choisir le fichier PDF du visa officiel...'}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                          Parcourir
                        </span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/*"
                          onChange={(e) => handleFileUpload(e, 'VISA')}
                          className="hidden"
                        />
                      </label>
                      {visaPdfName && (
                        <button
                          type="button"
                          onClick={() => {
                            setVisaPdfUrl(undefined);
                            setVisaPdfName(undefined);
                            setVisaPdfSize(undefined);
                          }}
                          className="p-2.5 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                          title="Supprimer le visa joint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {visaPdfName && (
                      <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                        ✓ Visa PDF attaché : <strong>{visaPdfName}</strong> ({visaPdfSize})
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">N° de Visa Nusuk</span>
                    <span className="font-mono font-bold text-emerald-900 block truncate">
                      {visaNumber || 'À renseigner'}
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      Valable jusqu'au {visaExpiryDate}
                    </span>
                  </div>
                </div>

                {/* Editable Visa Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Numéro du Visa :</label>
                    <input
                      type="text"
                      value={visaNumber}
                      onChange={(e) => setVisaNumber(e.target.value)}
                      placeholder="Ex: KSA-EV-2026-994821"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Type de Visa :</label>
                    <select
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                    >
                      <option value="HAJJ">Visa Hajj Officiel</option>
                      <option value="UMRAH">Visa Oumra Nusuk</option>
                      <option value="TOURIST">Visa Tourisme Religieux</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Date d'Émission :</label>
                    <input
                      type="date"
                      value={visaIssueDate}
                      onChange={(e) => setVisaIssueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Date d'Expiration :</label>
                    <input
                      type="date"
                      value={visaExpiryDate}
                      onChange={(e) => setVisaExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: TICKET DE TRAIN HARAMAIN TGV (SI DISPONIBLE) */}
              <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                      <Train className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-sm">
                          Ticket de Train TGV Haramain Express (PDF)
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
                          Si disponible
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        Ligne à grande vitesse reliant La Mecque, Djeddah et Médine
                      </span>
                    </div>
                  </div>

                  {/* Toggle switch for train availability */}
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTrainTicket}
                      onChange={(e) => setHasTrainTicket(e.target.checked)}
                      className="w-4 h-4 rounded text-[#135ca5] focus:ring-[#135ca5]"
                    />
                    <span className="text-xs font-bold text-stone-700">
                      {hasTrainTicket ? 'Train Actif & Réservé' : 'Non requis / Aucun train'}
                    </span>
                  </label>
                </div>

                {hasTrainTicket ? (
                  <>
                    {/* Train File Upload & Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Fichier Billet de Train Haramain (PDF) :
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-600 bg-stone-50/70 hover:bg-white transition-all text-xs">
                            <span className="flex items-center gap-2 text-stone-600 truncate">
                              <Upload className="w-4 h-4 text-amber-700 shrink-0" />
                              <span className="truncate">
                                {trainTicketPdfName || 'Choisir le ticket PDF du train Haramain...'}
                              </span>
                            </span>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                              Parcourir
                            </span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf,image/*"
                              onChange={(e) => handleFileUpload(e, 'TRAIN')}
                              className="hidden"
                            />
                          </label>
                          {trainTicketPdfName && (
                            <button
                              type="button"
                              onClick={() => {
                                setTrainTicketPdfUrl(undefined);
                                setTrainTicketPdfName(undefined);
                                setTrainTicketPdfSize(undefined);
                              }}
                              className="p-2.5 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                              title="Supprimer le ticket train joint"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {trainTicketPdfName && (
                          <span className="text-[11px] text-amber-800 font-medium block mt-1">
                            ✓ Ticket Train attaché : <strong>{trainTicketPdfName}</strong> ({trainTicketPdfSize})
                          </span>
                        )}
                      </div>

                      {/* Download Train Ticket CTA */}
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={handleDownloadTrainPdf}
                          className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger Ticket Train (PDF)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => generateTrainTicketPdf({ dossier, agencyConfig, autoDownload: true })}
                          className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-[11px] font-semibold"
                        >
                          Générer Billet Haramain PDF
                        </button>
                      </div>
                    </div>

                    {/* Train form fields */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Trajet TGV :</label>
                        <select
                          value={trainRoute}
                          onChange={(e) => setTrainRoute(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                        >
                          <option value="Makkah Haramain -> Madinah Haramain">Makkah → Médine</option>
                          <option value="Madinah Haramain -> Makkah Haramain">Médine → Makkah</option>
                          <option value="Jeddah Airport -> Makkah Haramain">Aéroport Djeddah → Makkah</option>
                          <option value="Madinah Haramain -> Jeddah Airport">Médine → Aéroport Djeddah</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">N° du Train :</label>
                        <input
                          type="text"
                          value={trainNumber}
                          onChange={(e) => setTrainNumber(e.target.value)}
                          placeholder="HHR-3042"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Date & Heure :</label>
                        <input
                          type="text"
                          value={`${trainDepartureDate} ${trainDepartureTime}`}
                          onChange={(e) => {
                            const p = e.target.value.split(' ');
                            setTrainDepartureDate(p[0] || '');
                            if (p[1]) setTrainDepartureTime(p[1]);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-600 mb-1">Voiture & Siège :</label>
                        <input
                          type="text"
                          value={`${trainCarNumber} / ${trainSeatNumber}`}
                          onChange={(e) => {
                            const parts = e.target.value.split('/');
                            setTrainCarNumber(parts[0]?.trim() || '');
                            if (parts[1]) setTrainSeatNumber(parts[1]?.trim());
                          }}
                          placeholder="Voiture 03 / Siège 14B"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold text-amber-900"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-500 italic text-center">
                    Option train Haramain désactivée pour ce dossier. Cochez la case ci-dessus pour ajouter un billet de train TGV.
                  </div>
                )}
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Les documents et coordonnées saisis sont automatiquement répercutés dans le dossier du pèlerin.
                </span>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-5 py-2.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Check className="w-4 h-4 text-[#f15a24]" />
                  <span>Enregistrer les Titres de Voyage</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ADMIN DOCS (PASSEPORT, PHOTO, MEDICAL, PACK)      */}
          {/* ======================================================== */}
          {activeTab === 'ADMIN_DOCS' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900">
                <div className="space-y-0.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    <span>Téléchargement des Pièces Administratives en Format PDF</span>
                  </span>
                  <p className="text-emerald-800 text-[11px]">
                    Toutes les pièces justificatives déposées par le pèlerin sont téléchargeables individuellement en format PDF certifié avec en-tête officiel EVA VOYAGES, ou regroupées dans un pack administratif complet.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadFullPack}
                  disabled={isGeneratingPack}
                  className="px-4 py-2 bg-[#f15a24] hover:bg-[#d94814] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-colors"
                >
                  <FolderDown className="w-4 h-4" />
                  <span>{isGeneratingPack ? 'Génération...' : 'Télécharger le Pack Complet (1 PDF)'}</span>
                </button>
              </div>

              {/* Grid of Administrative Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. PASSEPORT BIOMETRIQUE */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                      {dossier.documents.passport?.fileUrl ? (
                        <img
                          src={dossier.documents.passport.fileUrl}
                          alt="Passeport"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">Passeport Biométrique</h4>
                        {dossier.documents.passport?.status === 'APPROVED' ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Validé
                          </span>
                        ) : dossier.documents.passport ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            En examen
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                            Manquant
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono">
                        N°: {dossier.personalInfo.passportNumber || 'À renseigner'} (Exp: {dossier.personalInfo.passportExpiry})
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                        Fichier: {dossier.documents.passport?.fileName || 'Non déposé'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">Format PDF avec certification</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadAdminDoc('passport')}
                      disabled={downloadingDocType === 'passport'}
                      className="px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#f15a24]" />
                      <span>{downloadingDocType === 'passport' ? 'Téléchargement...' : 'Télécharger en PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. PHOTO D'IDENTITE */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                      {dossier.documents.photo?.fileUrl ? (
                        <img
                          src={dossier.documents.photo.fileUrl}
                          alt="Photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">Photo d'Identité Fond Blanc</h4>
                        {dossier.documents.photo?.status === 'APPROVED' ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Validé
                          </span>
                        ) : dossier.documents.photo ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            En examen
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                            Manquant
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Normes consulaires Ministère du Hajj & Umrah
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                        Fichier: {dossier.documents.photo?.fileName || 'Non déposé'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">Format PDF avec fiche identité</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadAdminDoc('photo')}
                      disabled={downloadingDocType === 'photo'}
                      className="px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#f15a24]" />
                      <span>{downloadingDocType === 'photo' ? 'Téléchargement...' : 'Télécharger en PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. CERTIFICAT MEDICAL */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                      {dossier.documents.medical?.fileUrl ? (
                        <img
                          src={dossier.documents.medical.fileUrl}
                          alt="Certificat médical"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">Certificat Médical d'Aptitude</h4>
                        {dossier.documents.medical?.status === 'APPROVED' ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Validé
                          </span>
                        ) : dossier.documents.medical ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            En examen
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                            Non fourni
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Groupe: <strong className="text-emerald-800">{dossier.personalInfo.bloodGroup || 'O+'}</strong> · Vaccins méningite & fièvre jaune
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                        Fichier: {dossier.documents.medical?.fileName || 'Non déposé'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">Format PDF avec visa médical</span>
                    <button
                      type="button"
                      onClick={() => handleDownloadAdminDoc('medical')}
                      disabled={downloadingDocType === 'medical'}
                      className="px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5 text-[#f15a24]" />
                      <span>{downloadingDocType === 'medical' ? 'Téléchargement...' : 'Télécharger en PDF'}</span>
                    </button>
                  </div>
                </div>

                {/* 4. FICHE D'INSCRIPTION & ATTESTATION OFFICIELLE */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col justify-between space-y-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-16 rounded-xl bg-orange-50 text-[#f15a24] shrink-0 border border-orange-200 flex items-center justify-center">
                      <FileCheck className="w-7 h-7" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">Fiche d'Inscription & Reçu Officiel</h4>
                        <span className="text-[10px] font-bold text-[#f15a24] bg-orange-100 px-2 py-0.5 rounded-full">
                          Officiel EVA
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Attestation d'inscription, versement des acomptes et reçu officiel
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Code: {dossier.trackingCode} · Package: {dossier.packageSnapshot.title}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">Format PDF officiel signé</span>
                    <button
                      type="button"
                      onClick={handleDownloadFicheInscription}
                      className="px-3 py-1.5 bg-[#f15a24] hover:bg-[#d94814] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger la Fiche (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Comprehensive Pack Callout */}
              <div className="p-5 rounded-3xl bg-linear-to-r from-stone-900 via-stone-800 to-[#135ca5] text-white space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderDown className="w-5 h-5 text-[#f15a24]" />
                      <h4 className="font-bold text-base text-white">
                        Pack Administratif Complet du Pèlerin (1 Seul Fichier PDF)
                      </h4>
                    </div>
                    <p className="text-xs text-stone-300 max-w-xl">
                      Générez en un clic le document PDF complet de 3 à 4 pages assemblant : la fiche d'inscription officielle signée, la situation comptable, la numérisation certifiée du passeport biométrique, la photo d'identité et le certificat médical.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadFullPack}
                    disabled={isGeneratingPack}
                    className="px-5 py-3 bg-[#f15a24] hover:bg-[#d94814] text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shrink-0 shadow-md transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPack ? 'Génération en cours...' : 'Télécharger le Dossier Complet PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs">
          <div className="text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Tous les documents PDF générés comportent les mentions légales et le numéro d'agrément EVA VOYAGES.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
