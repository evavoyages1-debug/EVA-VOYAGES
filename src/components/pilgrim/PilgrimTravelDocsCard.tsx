import React, { useState, useEffect } from 'react';
import { PilgrimDossier, AgencyConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Plane,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Luggage,
  Clock,
  Sparkles,
  QrCode,
  Eye,
  RefreshCw,
  HardDriveDownload,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  generateFlightTicketPdf,
  generateVisaPdf,
  triggerDownload,
} from '../../utils/generateAdminDocPdf';
import { cacheDossierForOffline } from '../../utils/offlineStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

interface PilgrimTravelDocsCardProps {
  dossier: PilgrimDossier;
}

export const PilgrimTravelDocsCard: React.FC<PilgrimTravelDocsCardProps> = ({ dossier }) => {
  const { agencyConfig } = useApp();
  const [downloadingType, setDownloadingType] = useState<'FLIGHT' | 'VISA' | null>(null);
  const [offlineCached, setOfflineCached] = useState(false);
  const isOnline = useOnlineStatus();

  // Cache dossier for offline viewing whenever loaded or updated
  useEffect(() => {
    cacheDossierForOffline(dossier);
    setOfflineCached(true);
  }, [dossier]);

  const flight = dossier.flightDetails;
  const visa = dossier.visaDetails;

  const hasFlightTicket = Boolean(flight && (flight.status === 'ISSUED' || flight.flightNumber));
  const hasVisa = Boolean(visa && (visa.status === 'ISSUED' || visa.visaNumber));

  const handleDownloadFlightTicket = async () => {
    try {
      setDownloadingType('FLIGHT');
      if (flight?.ticketPdfUrl) {
        triggerDownload(flight.ticketPdfUrl, flight.ticketPdfName || `Billet_Avion_${dossier.personalInfo.lastName}.pdf`);
      } else {
        generateFlightTicketPdf({
          dossier,
          agencyConfig,
          autoDownload: true,
        });
      }
    } catch (err) {
      console.error('Download flight ticket error', err);
      alert('Erreur lors du téléchargement du billet d\'avion.');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadVisa = async () => {
    try {
      setDownloadingType('VISA');
      if (visa?.visaPdfUrl) {
        triggerDownload(visa.visaPdfUrl, visa.visaPdfName || `Visa_Saoudien_${dossier.personalInfo.lastName}.pdf`);
      } else {
        generateVisaPdf({
          dossier,
          agencyConfig,
          autoDownload: true,
        });
      }
    } catch (err) {
      console.error('Download visa error', err);
      alert('Erreur lors du téléchargement du visa saoudien.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#135ca5] text-white flex items-center justify-center shadow-md">
            <Plane className="w-6 h-6 text-[#f15a24]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-[#135ca5]">
                Titres de Voyage Officiels
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Compte Client Pèlerin
              </span>
            </div>
            <h3 className="text-lg font-black text-stone-900 mt-1">
              Vos Billets d'Avion & Visas Saoudiens
            </h3>
            <p className="text-xs text-stone-500">
              Documents officiels délivrés par le département billetterie et consulaire d'EVA Voyages pour votre départ.
            </p>
          </div>
        </div>

        {/* Global summary status badge */}
        <div className="flex flex-wrap items-center gap-2">
          {offlineCached && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-bold" title="Ces titres sont stockés localement sur cet appareil via Service Worker">
              <HardDriveDownload className="w-3.5 h-3.5 text-cyan-600" />
              <span>Stocké Hors-Ligne</span>
            </span>
          )}

          {hasFlightTicket && hasVisa ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-800 border border-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Titres Complets & Prêts</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-300 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>En cours de finalisation</span>
            </span>
          )}
        </div>
      </div>

      {/* Offline Assurance Ribbon */}
      <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 via-emerald-50/50 to-stone-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-[#135ca5]">Consultation & Téléchargement Hors-Ligne Actifs :</span>{' '}
            <span className="text-stone-600">
              Même sans connexion internet en vol ou à l'arrivée en Arabie Saoudite, vos billets et visas peuvent être présentés et téléchargés en PDF à tout moment.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Service Worker Actif
          </span>
        </div>
      </div>

      {/* Grid: 2 Distinct Cards (Billet d'Avion & Visa Saoudien) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: BILLET D'AVION ÉLECTRONIQUE */}
        <div className="rounded-3xl border-2 border-sky-100 bg-gradient-to-br from-sky-50/50 via-white to-sky-50/30 p-5 space-y-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#135ca5] text-white flex items-center justify-center">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#135ca5]">
                    Billet d'Avion Électronique
                  </h4>
                  <span className="text-[11px] font-bold text-stone-900">
                    {flight?.airline || 'Compagnie Officielle'}
                  </span>
                </div>
              </div>

              {hasFlightTicket ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Émis & Confirmé
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  En Émission
                </span>
              )}
            </div>

            {/* Flight Flight Details Strip */}
            <div className="bg-white p-3.5 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Vol Aller :</span>
                <span className="font-mono font-black text-stone-900">
                  {flight?.flightNumber || 'SV-492'} · {flight?.departureCity || 'Dakar AIBD'} ➔ {flight?.destinationCity || 'Djeddah JED'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Date & Heure :</span>
                <span className="font-bold text-stone-800">
                  {flight?.departureDate || dossier.packageSnapshot.departureDate} {flight?.departureTime ? `à ${flight.departureTime}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Code PNR / Dossier :</span>
                <span className="font-mono font-black text-[#135ca5] bg-blue-50 px-2 py-0.5 rounded-md">
                  {flight?.pnr || 'CONFIRMED'}
                </span>
              </div>

              {flight?.returnFlightNumber && (
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-stone-500">Vol Retour :</span>
                  <span className="font-mono font-bold text-stone-800">
                    {flight.returnFlightNumber} ({flight.returnDate || dossier.packageSnapshot.returnDate})
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1">
                <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <Luggage className="w-3.5 h-3.5" />
                  <span>2 x 23 kg en soute + 10 kg cabine + 5L Zamzam inclus</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={downloadingType === 'FLIGHT'}
              onClick={handleDownloadFlightTicket}
              className="w-full py-3 px-4 rounded-2xl bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {downloadingType === 'FLIGHT' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#f15a24]" />
              )}
              <span>Télécharger mon Billet d'Avion (PDF)</span>
            </button>
          </div>
        </div>

        {/* CARD 2: VISA ÉLECTRONIQUE SAOUDIEN */}
        <div className="rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 p-5 space-y-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                    Visa Électronique Saoudien
                  </h4>
                  <span className="text-[11px] font-bold text-stone-900">
                    Ministère du Hajj & Umrah (KSA)
                  </span>
                </div>
              </div>

              {hasVisa ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Délivré & Prêt
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  En Validation
                </span>
              )}
            </div>

            {/* Visa Details Strip */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">N° Visa Électronique :</span>
                <span className="font-mono font-black text-stone-900">
                  {visa?.visaNumber || 'KSA-EV-2026-994821'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Catégorie du Visa :</span>
                <span className="font-bold text-emerald-800">
                  {visa?.visaType || (dossier.packageSnapshot.type === 'HAJJ' ? 'HAJJ OFFICIEL' : 'OUMRA ELECTRONIQUE')}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Validité & Expiration :</span>
                <span className="font-mono font-bold text-stone-800">
                  Valide jusqu'au {visa?.expiryDate || '2026-06-25'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Poste Frontière d'Entrée :</span>
                <span className="font-bold text-stone-800">
                  {visa?.entryBorder || 'JEDDAH / MADINAH (AÉROPORTS INTERNATIONAUX)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1">
                <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Conforme Plateforme Officielle Nusuk Masar</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={downloadingType === 'VISA'}
              onClick={handleDownloadVisa}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {downloadingType === 'VISA' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-amber-300" />
              )}
              <span>Télécharger mon Visa Saoudien (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
