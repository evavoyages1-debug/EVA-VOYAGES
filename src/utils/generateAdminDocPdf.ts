import { jsPDF } from 'jspdf';
import { PilgrimDossier, AgencyConfig, DocumentType } from '../types';
import { loadImageDataUrl } from './generatePilgrimBadgePdf';

/**
 * Triggers a direct file download for a base64 Data URL or Blob
 */
export const triggerDownload = (dataUrl: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates and downloads an individual administrative document as an official PDF
 * (Passeport Biométrique, Photo d'identité, Certificat Médical)
 */
export const downloadAdminDocPdf = async ({
  dossier,
  docType,
  agencyConfig,
  autoDownload = true,
}: {
  dossier: PilgrimDossier;
  docType: DocumentType;
  agencyConfig: AgencyConfig;
  autoDownload?: boolean;
}): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const navy = [19, 92, 165]; // #135ca5
  const darkNavy = [11, 45, 82]; // #0b2d52
  const orange = [241, 90, 36]; // #f15a24
  const emerald = [4, 120, 87]; // #047857
  const borderGray = [226, 232, 240];
  const lightBg = [248, 250, 252];

  // Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Agency branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(agencyConfig.name || 'EVA VOYAGES SÉNÉGAL', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text(
    `AGENCE AGRÉÉE HAJJ & OUMRA - LICENCE: ${agencyConfig.licenseNumber || 'AG-TO-HAJJ-SN-2026-084'}`,
    margin,
    18
  );
  doc.text(
    `${agencyConfig.address} | Tél: ${agencyConfig.phone} | Email: ${agencyConfig.email}`,
    margin,
    23
  );

  // Top Right Badge
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.roundedRect(pageWidth - margin - 45, 7, 45, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PIÈCE ADMINISTRATIVE', pageWidth - margin - 22.5, 13, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('COPIE OFFICIELLE PDF', pageWidth - margin - 22.5, 18, { align: 'center' });

  // Document Title
  const titles: Record<DocumentType, { fr: string; sub: string }> = {
    passport: {
      fr: 'PASSEPORT BIOMÉTRIQUE CERTIFIÉ',
      sub: 'Pièce d\'identité principale pour voyage international & émission de visa',
    },
    photo: {
      fr: 'PHOTO D\'IDENTITÉ RÉGLEMENTAIRE (FOND BLANC)',
      sub: 'Conforme aux normes consulaires du Ministère du Hajj & de la Umrah KSA',
    },
    medical: {
      fr: 'CERTIFICAT D\'APTITUDE MÉDICALE AU PÈLERINAGE',
      sub: 'Attestation de vaccination et d\'aptitude physique aux rituels',
    },
  };

  const docInfo = titles[docType];
  const targetDoc = dossier.documents[docType];

  let currentY = 38;

  // Title Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(docInfo.fr, margin + 5, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(docInfo.sub, margin + 5, currentY + 13);

  // Status indicator
  const isApproved = targetDoc?.status === 'APPROVED';
  doc.setFillColor(isApproved ? emerald[0] : 217, isApproved ? emerald[1] : 119, isApproved ? emerald[2] : 6);
  doc.roundedRect(pageWidth - margin - 35, currentY + 4, 30, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(isApproved ? 'CONFORME / VALIDÉ' : 'EN EXAMEN', pageWidth - margin - 20, currentY + 10, { align: 'center' });

  currentY += 23;

  // Pilgrim Identity Summary Grid
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('INFORMATIONS DU PÈLERIN & IDENTIFIANT DOSSIER', margin + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const col1 = margin + 5;
  const col2 = margin + 65;
  const col3 = margin + 125;

  doc.text(`Nom & Prénoms :`, col1, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.lastName.toUpperCase()} ${dossier.personalInfo.firstName}`, col1 + 28, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`N° Passeport :`, col1, currentY + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.passportNumber || 'En attente', col1 + 28, currentY + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Téléphone :`, col1, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.phone, col1 + 28, currentY + 25);

  // Col 2
  doc.setFont('helvetica', 'normal');
  doc.text(`Code Dossier :`, col2, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.trackingCode, col2 + 25, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Programme :`, col2, currentY + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.packageSnapshot.title.slice(0, 24), col2 + 25, currentY + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nationalité :`, col2, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.nationality || 'Sénégalaise', col2 + 25, currentY + 25);

  // Col 3
  doc.setFont('helvetica', 'normal');
  doc.text(`Fichier Source :`, col3, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(targetDoc?.fileName?.slice(0, 18) || 'Numérisation directe', col3 + 25, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date Dépôt :`, col3, currentY + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(targetDoc?.uploadedAt ? new Date(targetDoc.uploadedAt).toLocaleDateString('fr-FR') : 'Non daté', col3 + 25, currentY + 19);

  currentY += 37;

  // Render Image Box
  const imageBoxHeight = 155;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, imageBoxHeight, 2, 2, 'FD');

  let imageLoaded = false;
  if (targetDoc?.fileUrl) {
    try {
      const imgData = await loadImageDataUrl(targetDoc.fileUrl);
      if (imgData) {
        // Center the image inside the box preserving proportion
        const maxImgW = contentWidth - 10;
        const maxImgH = imageBoxHeight - 12;
        doc.addImage(imgData, 'JPEG', margin + 5, currentY + 6, maxImgW, maxImgH, undefined, 'FAST');
        imageLoaded = true;
      }
    } catch {
      imageLoaded = false;
    }
  }

  if (!imageLoaded) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(
      targetDoc?.fileUrl
        ? '[ Document archivé sous format électronique certifié ]'
        : '[ Aucun document chargé pour cette section ]',
      pageWidth / 2,
      currentY + imageBoxHeight / 2,
      { align: 'center' }
    );
  }

  currentY += imageBoxHeight + 5;

  // Security Certification Footer Stamp
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('CERTIFICAT D\'ARCHIVAGE NUMÉRIQUE & CONFORMITÉ LÉGALE', margin + 5, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Document extrait électroniquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} par le système EVA VOYAGES.`,
    margin + 5,
    currentY + 11
  );
  doc.text(
    `Ce duplicata fait foi de la conservation du document original déposé pour le dossier ${dossier.trackingCode}.`,
    margin + 5,
    currentY + 16
  );
  doc.text(
    `Licence Tourisme Religieux: ${agencyConfig.licenseNumber} · Contact vérification: ${agencyConfig.phone}`,
    margin + 5,
    currentY + 21
  );

  // Stamp Box Right
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(emerald[0], emerald[1], emerald[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 50, currentY + 3, 46, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text('CERTIFIÉ CONFORME', pageWidth - margin - 27, currentY + 9, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('SERVICE VISAS & CONTRÔLE', pageWidth - margin - 27, currentY + 14, { align: 'center' });
  doc.text(agencyConfig.name, pageWidth - margin - 27, currentY + 19, { align: 'center' });

  const safeFileName = `${docType.toUpperCase()}_${dossier.personalInfo.lastName}_${dossier.trackingCode}.pdf`.replace(/\s+/g, '_');

  if (autoDownload) {
    doc.save(safeFileName);
  }

  return doc;
};

/**
 * Generates an official Billet d'Avion Électronique (Flight E-Ticket) PDF
 */
export const generateFlightTicketPdf = ({
  dossier,
  agencyConfig,
  autoDownload = true,
}: {
  dossier: PilgrimDossier;
  agencyConfig: AgencyConfig;
  autoDownload?: boolean;
}): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const navy = [19, 92, 165];
  const darkNavy = [11, 45, 82];
  const orange = [241, 90, 36];
  const borderGray = [226, 232, 240];
  const lightBg = [248, 250, 252];

  // Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 30, pageWidth, 2.5, 'F');

  // Agency branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(agencyConfig.name || 'EVA VOYAGES SÉNÉGAL', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`BILLET ÉLECTRONIQUE DE VOYAGE AÉRIEN (E-TICKET / ITINERARY RECEIPT)`, margin, 19);
  doc.text(`Assistance Pèlerins 24h/24 : ${agencyConfig.phone} | ${agencyConfig.email}`, margin, 24);

  // Right PNR Stamp
  const pnr = dossier.flightDetails?.pnr || 'SV-78K9Q';
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.roundedRect(pageWidth - margin - 48, 7, 48, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('RÉSERVATION / PNR', pageWidth - margin - 24, 13, { align: 'center' });
  doc.setFontSize(11);
  doc.text(pnr, pageWidth - margin - 24, 19, { align: 'center' });

  let y = 40;

  // Passenger Identity Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('PASSAGER / PÈLERIN CONVOQUÉ', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text(`Nom : `, margin + 5, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.lastName.toUpperCase()} ${dossier.personalInfo.firstName}`, margin + 20, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Passeport : `, margin + 5, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.passportNumber || 'N/A', margin + 24, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nationalité : `, margin + 70, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.nationality || 'Sénégalaise', margin + 92, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Code Dossier : `, margin + 70, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.trackingCode, margin + 92, y + 20);

  doc.setFont('helvetica', 'normal');
  doc.text(`Contact : `, margin + 130, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.phone, margin + 145, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Formule : `, margin + 130, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.packageSnapshot.type, margin + 145, y + 20);

  y += 32;

  // Flight Details Ticket Table
  const airline = dossier.flightDetails?.airline || 'Saudia Airlines';
  const flightNum = dossier.flightDetails?.flightNumber || 'SV-492';
  const depDate = dossier.flightDetails?.departureDate || '2026-05-18';
  const depTime = dossier.flightDetails?.departureTime || '08:30';
  const depCity = dossier.flightDetails?.departureCity || 'Dakar Blaise Diagne (DSS/AIBD)';
  const destCity = dossier.flightDetails?.destinationCity || 'Djeddah King Abdulaziz (JED)';
  const retFlight = dossier.flightDetails?.returnFlightNumber || 'SV-493';
  const retDate = dossier.flightDetails?.returnDate || '2026-06-08';

  // Section Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('DÉTAILS DES VOLS INTERNATIONAUX CONFIRMÉS', margin, y + 5);

  y += 9;

  // Flight 1: Aller
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(navy[0], navy[1], navy[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  // Flight 1 Header Pill
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`VOL ALLER : ${airline} · Vol ${flightNum} · Statut: CONFIRMÉ (OK)`, margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  // Departure Block
  doc.text('DÉPART', margin + 8, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(depCity, margin + 8, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${depDate} à ${depTime}`, margin + 8, y + 27);
  doc.text('Terminal Pèlerins / AIBD', margin + 8, y + 32);

  // Arrow / Flight badge in middle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('---------> DIRECT --------->', margin + 65, y + 22);

  // Arrival Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('ARRIVÉE', margin + 125, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(destCity, margin + 125, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Terminal Hajj & Umrah', margin + 125, y + 27);
  doc.text('Accueil & Prise en charge EVA', margin + 125, y + 32);

  y += 44;

  // Flight 2: Retour
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`VOL RETOUR : ${airline} · Vol ${retFlight} · Date: ${retDate}`, margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Départ: ${destCity} (JED) vers ${depCity}`, margin + 8, y + 17);
  doc.text(`Date de retour estimée: ${retDate} · Enregistrement 4h avant le vol`, margin + 8, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('Franchise Bagages: 2 x 23 kg en soute + 1 Bagage cabine 8 kg + Bidon Zamzam 5L offert', margin + 8, y + 29);

  y += 40;

  // Baggage & Check-in Rules Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('CONSIGNES D\'ENREGISTREMENT & D\'EMBARQUEMENT', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Convocation à l\'aéroport : Présence impérative 4 heures avant le décollage au hangar pèlerins.', margin + 5, y + 14);
  doc.text('2. Pièces exigées au comptoir : Passeport original avec visa valide + Billet d\'avion + Carnet de vaccination.', margin + 5, y + 20);
  doc.text('3. Port du badge officiel EVA VOYAGES autour du cou obligatoire dès le hall de départ.', margin + 5, y + 26);
  doc.text('4. L\'eau bénite de Zamzam (5 Litres certifiés) est remise gratuitement à l\'arrivée au retour.', margin + 5, y + 32);

  y += 44;

  // Bottom Footer Bar with Barcode simulation
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('EVA VOYAGES - DÉPARTEMENT BILLETTERIE & TRANSPORTS AÉRIENS', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`Billet émis pour: ${dossier.personalInfo.lastName} ${dossier.personalInfo.firstName} | Réf Dossier: ${dossier.trackingCode}`, margin + 6, y + 13);
  doc.text(`En cas de retard ou de modification de vol : Contact d'urgence pèlerin ${agencyConfig.phone} (24h/7j)`, margin + 6, y + 18);

  const fileName = `BILLET_AVION_${dossier.personalInfo.lastName}_${dossier.trackingCode}.pdf`.replace(/\s+/g, '_');
  if (autoDownload) {
    doc.save(fileName);
  }

  return doc;
};

/**
 * Generates an official Visa Pèlerinage PDF (Hajj / Umrah Visa Certificate)
 */
export const generateVisaPdf = ({
  dossier,
  agencyConfig,
  autoDownload = true,
}: {
  dossier: PilgrimDossier;
  agencyConfig: AgencyConfig;
  autoDownload?: boolean;
}): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const navy = [19, 92, 165];
  const emerald = [4, 120, 87];
  const darkNavy = [11, 45, 82];
  const orange = [241, 90, 36];
  const borderGray = [226, 232, 240];
  const lightBg = [248, 250, 252];

  // Header Banner Green / Gold
  doc.setFillColor(emerald[0], emerald[1], emerald[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 30, pageWidth, 2.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('KINGDOM OF SAUDI ARABIA - MINISTRY OF HAJJ & UMRAH', margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(209, 250, 229);
  doc.text('ROYAUME D\'ARABIE SAOUDITE - VISA OFFICIEL ÉLECTRONIQUE (E-VISA)', margin, 19);
  doc.text(`Agence mandataire accréditée: ${agencyConfig.name} (Licence: ${agencyConfig.licenseNumber})`, margin, 24);

  // Visa Status Stamp
  const visaNum = dossier.visaDetails?.visaNumber || 'KSA-EV-2026-994821';
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.roundedRect(pageWidth - margin - 52, 6, 52, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(209, 250, 229);
  doc.text('NUMÉRO DE VISA / VISA NO', pageWidth - margin - 26, 12, { align: 'center' });
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text(visaNum, pageWidth - margin - 26, 18, { align: 'center' });

  let y = 40;

  // Pilgrim Details Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text('INFORMATIONS DU TITULAIRE DU VISA (PILGRIM PARTICULARS)', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text('Nom Complet :', margin + 5, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.lastName.toUpperCase()} ${dossier.personalInfo.firstName}`, margin + 28, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.text('N° Passeport :', margin + 5, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.passportNumber || 'N/A', margin + 28, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text('Nationalité :', margin + 5, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.nationality || 'Sénégalaise', margin + 28, y + 27);

  // Col 2
  doc.setFont('helvetica', 'normal');
  doc.text('Date de Naissance :', margin + 80, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.dateOfBirth || 'N/A', margin + 110, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.text('Genre / Sexe :', margin + 80, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.gender === 'M' ? 'Masculin / M' : 'Féminin / F', margin + 110, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text('Code Dossier :', margin + 80, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.trackingCode, margin + 110, y + 27);

  y += 40;

  // Visa Properties Table
  const visaType = dossier.visaDetails?.visaType || (dossier.packageSnapshot.type === 'HAJJ' ? 'HAJJ' : 'UMRAH');
  const issueDate = dossier.visaDetails?.issueDate || '2026-03-12';
  const expiryDate = dossier.visaDetails?.expiryDate || '2026-06-25';
  const border = dossier.visaDetails?.entryBorder || 'JEDDAH / MADINAH / RIYADH';

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(emerald[0], emerald[1], emerald[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'FD');

  doc.setFillColor(emerald[0], emerald[1], emerald[2]);
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SPÉCIFICATIONS DU VISA & CONDITIONS DE SÉJOUR', margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const row1 = y + 16;
  doc.text('Type de Visa :', margin + 8, row1);
  doc.setFont('helvetica', 'bold');
  doc.text(`VISA OFFICIEL ${visaType}`, margin + 35, row1);

  doc.setFont('helvetica', 'normal');
  doc.text('Nombre d\'entrées :', margin + 95, row1);
  doc.setFont('helvetica', 'bold');
  doc.text('Entrée Unique (Single Entry)', margin + 130, row1);

  const row2 = y + 25;
  doc.text('Date de Délivrance :', margin + 8, row2);
  doc.setFont('helvetica', 'bold');
  doc.text(issueDate, margin + 42, row2);

  doc.setFont('helvetica', 'normal');
  doc.text('Date Limite d\'Entrée :', margin + 95, row2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(expiryDate, margin + 130, row2);

  const row3 = y + 34;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.text('Aéroports d\'accès :', margin + 8, row3);
  doc.setFont('helvetica', 'bold');
  doc.text(border, margin + 42, row3);

  const row4 = y + 42;
  doc.setFont('helvetica', 'normal');
  doc.text('Statut Administratif :', margin + 8, row4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text('VALIDÉ & ACTIF SUR LA PLATEFORME NUSUK / MOFA', margin + 45, row4);

  y += 55;

  // Security & Law Notice Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('MENTIONS LÉGALES & CONSEILS AUX PÈLERINS', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('• Ce visa est strictement délivré pour l\'accomplissement des rites religieux aux Lieux Saints.', margin + 5, y + 13);
  doc.text('• Tout dépassement de la durée de séjour autorisée constitue une infraction à la législation saoudienne.', margin + 5, y + 18);
  doc.text('• Le pèlerin doit conserver une copie imprimée de ce document dans son passeport en tout temps.', margin + 5, y + 23);
  doc.text(`• En cas de perte, rapprochez-vous immédiatement du bureau EVA VOYAGES à Makkah ou Madinah.`, margin + 5, y + 28);
  doc.text(`• Contact assistance diplomatique et guide : ${agencyConfig.phone} | WhatsApp: ${agencyConfig.whatsapp}`, margin + 5, y + 33);

  y += 44;

  // Bottom Validation Seal
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('AGENCE OFFICIELLE DE VOYAGES RECONNUE - CONTRÔLE NUSUK KSA', margin + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(219, 234, 254);
  doc.text(`Pèlerin: ${dossier.personalInfo.lastName} ${dossier.personalInfo.firstName} · Passeport: ${dossier.personalInfo.passportNumber}`, margin + 6, y + 12);
  doc.text(`Dossier Réf: ${dossier.trackingCode} · Document sécurisé avec signature électronique de l'agence`, margin + 6, y + 17);

  const fileName = `VISA_${dossier.personalInfo.lastName}_${dossier.trackingCode}.pdf`.replace(/\s+/g, '_');
  if (autoDownload) {
    doc.save(fileName);
  }

  return doc;
};

/**
 * Generates an official Haramain Train Ticket PDF (si disponible)
 */
export const generateTrainTicketPdf = ({
  dossier,
  agencyConfig,
  autoDownload = true,
}: {
  dossier: PilgrimDossier;
  agencyConfig: AgencyConfig;
  autoDownload?: boolean;
}): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const navy = [19, 92, 165];
  const darkNavy = [11, 45, 82];
  const orange = [241, 90, 36];
  const borderGray = [226, 232, 240];
  const lightBg = [248, 250, 252];

  // Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('HARAMAIN HIGH SPEED RAILWAY (HHR) قطار الحرمين', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text('BILLET DE TRAIN GRANDE VITESSE ÉLECTRONIQUE (TGV HARAMAIN)', margin, 18);
  doc.text(`Transfert inter-villes organisé par ${agencyConfig.name}`, margin, 23);

  // Train Number Top Pill
  const trainNum = dossier.trainDetails?.trainNumber || 'HHR-3042';
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.roundedRect(pageWidth - margin - 45, 7, 45, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('N° TRAIN TGV', pageWidth - margin - 22.5, 12, { align: 'center' });
  doc.setFontSize(10.5);
  doc.text(trainNum, pageWidth - margin - 22.5, 18, { align: 'center' });

  let y = 38;

  // Passenger Card
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('PASSAGER DU TRAIN HARAMAIN', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Nom: ${dossier.personalInfo.lastName.toUpperCase()} ${dossier.personalInfo.firstName}`, margin + 5, y + 14);
  doc.text(`Passeport: ${dossier.personalInfo.passportNumber || 'N/A'}`, margin + 5, y + 19);

  doc.text(`Dossier EVA: ${dossier.trackingCode}`, margin + 75, y + 14);
  doc.text(`Contact: ${dossier.personalInfo.phone}`, margin + 75, y + 19);

  doc.text(`Classe: ${dossier.trainDetails?.classType || 'BUSINESS'}`, margin + 130, y + 14);
  doc.text(`Statut: CONFIRMÉ`, margin + 130, y + 19);

  y += 30;

  // Train Itinerary Big Card
  const route = dossier.trainDetails?.route || 'Makkah Haramain -> Madinah Haramain';
  const depDate = dossier.trainDetails?.departureDate || '2026-05-24';
  const depTime = dossier.trainDetails?.departureTime || '14:15';
  const car = dossier.trainDetails?.carNumber || 'Voiture 03';
  const seat = dossier.trainDetails?.seatNumber || 'Siège 14B';

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(navy[0], navy[1], navy[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 50, 2, 2, 'FD');

  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`TRAJET TGV : ${route.toUpperCase()}`, margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GARE DE DÉPART', margin + 8, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(route.split('->')[0]?.trim() || 'Makkah Station', margin + 8, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Date: ${depDate} à ${depTime}`, margin + 8, y + 29);

  // Train graphical symbol
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('===[ 300 km/h ]===>', margin + 65, y + 24);

  // Arrival
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GARE D\'ARRIVÉE', margin + 125, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(route.split('->')[1]?.trim() || 'Madinah Station', margin + 125, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Durée estimée: 2h20 min', margin + 125, y + 29);

  // Seat placement pill row
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin + 4, y + 34, contentWidth - 8, 12, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${car}   ·   ${seat}   ·   CLASSE ${dossier.trainDetails?.classType || 'AFFAIRES'}`, margin + 10, y + 42);

  y += 56;

  // Station Information Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('CONSIGNES D\'EMBARQUEMENT TGV HARAMAIN', margin + 5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Se présenter en gare 45 minutes avant le départ pour le contrôle de sécurité et des bagages.', margin + 5, y + 12);
  doc.text('2. Accès aux quais fermé 10 minutes avant le départ du train.', margin + 5, y + 17);
  doc.text('3. Franchise bagages autorisée : 1 grande valise (max 25 kg) + 1 bagage à main en cabine.', margin + 5, y + 22);
  doc.text(`4. L'encadreur de groupe EVA VOYAGES vous accueillera à la descente du train sur le quai d'arrivée.`, margin + 5, y + 27);

  y += 40;

  // Bottom Notice
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(margin, y, contentWidth, 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('EVA VOYAGES - LOGISTIQUE DES TRANSPORTS TERRESTRES EN ARABIE SAOUDITE', margin + 5, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(219, 234, 254);
  doc.text(`Assistance TGV / HHR : ${agencyConfig.phone} · Réf Dossier : ${dossier.trackingCode}`, margin + 5, y + 14);

  const fileName = `TICKET_TRAIN_HARAMAIN_${dossier.personalInfo.lastName}_${dossier.trackingCode}.pdf`.replace(/\s+/g, '_');
  if (autoDownload) {
    doc.save(fileName);
  }

  return doc;
};

/**
 * Downloads a complete administrative pack combining all pilgrim documents into 1 comprehensive multi-page PDF
 */
export const downloadCompleteAdministrativePackPdf = async ({
  dossier,
  agencyConfig,
  autoDownload = true,
}: {
  dossier: PilgrimDossier;
  agencyConfig: AgencyConfig;
  autoDownload?: boolean;
}): Promise<jsPDF> => {
  // Page 1: Fiche d'inscription & Attestation administrative
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const navy = [19, 92, 165];
  const darkNavy = [11, 45, 82];
  const orange = [241, 90, 36];
  const emerald = [4, 120, 87];
  const borderGray = [226, 232, 240];
  const lightBg = [248, 250, 252];

  // PAGE 1: DOSSIER ADMINISTRATIF RÉCAPITULATIF
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(agencyConfig.name || 'EVA VOYAGES SÉNÉGAL', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text('PACK ADMINISTRATIF COMPLET DU PÈLERIN (FICHE & PIÈCES JUSTIFICATIVES)', margin, 18);
  doc.text(`Licence: ${agencyConfig.licenseNumber} | ${agencyConfig.phone} | ${agencyConfig.email}`, margin, 23);

  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.roundedRect(pageWidth - margin - 45, 7, 45, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DOSSIER COMPLET', pageWidth - margin - 22.5, 12, { align: 'center' });
  doc.setFontSize(9.5);
  doc.text(dossier.trackingCode, pageWidth - margin - 22.5, 18, { align: 'center' });

  let y = 38;

  // Personal Info Block
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 54, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('1. ÉTAT CIVIL & COORDONNÉES DU PÈLERIN', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Nom & Prénoms :`, margin + 5, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.lastName.toUpperCase()} ${dossier.personalInfo.firstName}`, margin + 35, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text(`Passeport :`, margin + 5, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.passportNumber || 'N/A'} (Exp: ${dossier.personalInfo.passportExpiry || 'N/A'})`, margin + 35, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date & Lieu de Naiss. :`, margin + 5, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.dateOfBirth} à ${dossier.personalInfo.placeOfBirth}`, margin + 35, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nationalité :`, margin + 5, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.nationality, margin + 35, y + 37);

  doc.setFont('helvetica', 'normal');
  doc.text(`Téléphone :`, margin + 5, y + 44);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.phone, margin + 35, y + 44);

  // Col 2
  doc.setFont('helvetica', 'normal');
  doc.text(`Email :`, margin + 100, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.email || 'N/A', margin + 125, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text(`Groupe Sanguin :`, margin + 100, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.personalInfo.bloodGroup || 'Non précisé', margin + 125, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text(`Contact d'Urgence :`, margin + 100, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.emergencyContactName || 'N/A'} (${dossier.personalInfo.emergencyContactPhone})`, margin + 125, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Adresse :`, margin + 100, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.personalInfo.address}, ${dossier.personalInfo.city}`, margin + 125, y + 37);

  y += 60;

  // Package & Financials Block
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('2. FORFAIT SOUSCRIT & SITUATION DES RÈGLEMENTS', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  doc.text(`Package :`, margin + 5, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.packageSnapshot.title} (${dossier.packageSnapshot.season})`, margin + 35, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.text(`Hébergement :`, margin + 5, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(`Chambre ${dossier.packageSnapshot.roomType.toUpperCase()}`, margin + 35, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.text(`Montant Total :`, margin + 5, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`${dossier.payment.totalAmountFCFA.toLocaleString('fr-FR')} FCFA`, margin + 35, y + 30);

  doc.setFont('helvetica', 'normal');
  doc.text(`Montant Encaissé :`, margin + 100, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text(`${dossier.payment.amountPaidFCFA.toLocaleString('fr-FR')} FCFA`, margin + 135, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Solde Restant :`, margin + 100, y + 23);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(dossier.payment.remainingBalanceFCFA === 0 ? emerald[0] : 217, dossier.payment.remainingBalanceFCFA === 0 ? emerald[1] : 119, dossier.payment.remainingBalanceFCFA === 0 ? emerald[2] : 6);
  doc.text(`${dossier.payment.remainingBalanceFCFA.toLocaleString('fr-FR')} FCFA`, margin + 135, y + 23);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Statut Paiement :`, margin + 100, y + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(dossier.payment.paymentStatus === 'PAID' ? 'SOLDÉ INTÉGRALEMENT' : 'ACOMPTE VERSÉ', margin + 135, y + 30);

  y += 48;

  // Checklist of Included Documents
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 68, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('3. INVENTAIRE DES PIÈCES DU DOSSIER TRANSMIS', margin + 5, y + 7);

  const docList = [
    {
      title: 'Passeport biométrique',
      status: dossier.documents.passport ? 'VALIDÉ / NUMÉRISÉ (Page 2)' : 'MANQUANT',
      ok: !!dossier.documents.passport,
    },
    {
      title: 'Photo d\'identité réglementaire',
      status: dossier.documents.photo ? 'CONFORME (Page 3)' : 'MANQUANT',
      ok: !!dossier.documents.photo,
    },
    {
      title: 'Certificat médical d\'aptitude',
      status: dossier.documents.medical ? 'CERTIFIÉ (Page 3)' : 'EN ATTENTE DÉPÔT',
      ok: !!dossier.documents.medical,
    },
    {
      title: 'Billet d\'avion international',
      status: dossier.flightDetails?.ticketPdfName || (dossier.flightDetails ? 'RÉSERVATION CONFIRMÉE' : 'EN COURS D\'ÉMISSION'),
      ok: !!dossier.flightDetails,
    },
    {
      title: 'Visa officiel KSA (Nusuk)',
      status: dossier.visaDetails?.visaNumber ? `ÉMIS N° ${dossier.visaDetails.visaNumber}` : 'EN COURS D\'INSTRUCTION CONSULAIRE',
      ok: !!dossier.visaDetails?.visaNumber,
    },
    {
      title: 'Ticket de Train Haramain TGV',
      status: dossier.trainDetails?.hasTrainTicket ? `CONFIRMÉ (${dossier.trainDetails.trainNumber || 'TGV HHR'})` : 'NON APPLICABLE OU OPTIONNEL',
      ok: !!dossier.trainDetails?.hasTrainTicket,
    },
  ];

  docList.forEach((item, idx) => {
    const itemY = y + 16 + idx * 8.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(item.ok ? emerald[0] : 148, item.ok ? emerald[1] : 163, item.ok ? emerald[2] : 184);
    doc.text(item.ok ? '✓' : '○', margin + 6, itemY);

    doc.setTextColor(51, 65, 85);
    doc.text(item.title, margin + 14, itemY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(item.ok ? darkNavy[0] : 148, item.ok ? darkNavy[1] : 163, item.ok ? darkNavy[2] : 184);
    doc.text(item.status, margin + 85, itemY);
  });

  // Stamp at bottom page 1
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Extrait officiel certifié par EVA VOYAGES le ${new Date().toLocaleDateString('fr-FR')} - Continuer en page 2 pour les pièces jointes`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // PAGE 2: PASSEPORT BIOMÉTRIQUE
  if (dossier.documents.passport?.fileUrl) {
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.rect(0, 20, pageWidth, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('PIÈCE JOINTE 1 : PASSEPORT BIOMÉTRIQUE NUMÉRISÉ', margin, 12);
    doc.setFontSize(8.5);
    doc.text(`Pèlerin: ${dossier.personalInfo.lastName} ${dossier.personalInfo.firstName} · Réf: ${dossier.trackingCode}`, pageWidth - margin, 12, { align: 'right' });

    try {
      const passImg = await loadImageDataUrl(dossier.documents.passport.fileUrl);
      if (passImg) {
        doc.addImage(passImg, 'JPEG', margin, 26, contentWidth, 230, undefined, 'FAST');
      }
    } catch {
      doc.text('[ Image du passeport non convertible ]', margin, 50);
    }
  }

  // PAGE 3: PHOTO & CERTIFICAT MÉDICAL
  if (dossier.documents.photo?.fileUrl || dossier.documents.medical?.fileUrl) {
    doc.addPage();
    doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.rect(0, 20, pageWidth, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('PIÈCES JOINTES 2 & 3 : PHOTO D\'IDENTITÉ & CERTIFICAT MÉDICAL', margin, 12);
    doc.setFontSize(8.5);
    doc.text(`Réf: ${dossier.trackingCode}`, pageWidth - margin, 12, { align: 'right' });

    // Photo Box
    let p3Y = 26;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text('Photo d\'Identité Fond Blanc :', margin, p3Y);

    if (dossier.documents.photo?.fileUrl) {
      try {
        const photoImg = await loadImageDataUrl(dossier.documents.photo.fileUrl);
        if (photoImg) {
          doc.addImage(photoImg, 'JPEG', margin, p3Y + 4, 60, 75, undefined, 'FAST');
        }
      } catch {
        doc.text('[ Photo non convertible ]', margin, p3Y + 20);
      }
    }

    // Medical Box
    const medY = p3Y + 85;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text('Certificat Médical / Aptitude :', margin, medY);

    if (dossier.documents.medical?.fileUrl) {
      try {
        const medImg = await loadImageDataUrl(dossier.documents.medical.fileUrl);
        if (medImg) {
          doc.addImage(medImg, 'JPEG', margin, medY + 4, contentWidth, 140, undefined, 'FAST');
        }
      } catch {
        doc.text('[ Certificat médical non convertible ]', margin, medY + 20);
      }
    }
  }

  const fileName = `DOSSIER_COMPLET_${dossier.personalInfo.lastName}_${dossier.trackingCode}.pdf`.replace(/\s+/g, '_');
  if (autoDownload) {
    doc.save(fileName);
  }

  return doc;
};
