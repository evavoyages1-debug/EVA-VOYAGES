import { jsPDF } from 'jspdf';
import { PilgrimDossier, Transaction, AgencyConfig } from '../types';

interface GeneratePdfReceiptOptions {
  dossier: PilgrimDossier;
  transaction?: Transaction;
  agencyConfig: AgencyConfig;
  autoDownload?: boolean;
}

export const generatePdfReceipt = ({
  dossier,
  transaction,
  agencyConfig,
  autoDownload = true,
}: GeneratePdfReceiptOptions): jsPDF => {
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
  const darkStone = [28, 25, 23]; // #1c1917
  const lightBg = [248, 250, 252]; // #f8fafc
  const borderGray = [226, 232, 240]; // #e2e8f0

  // Header Banner
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Orange accent bar
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(agencyConfig.name || 'EVA VOYAGES SÉNÉGAL', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(219, 234, 254);
  doc.text('AGENCE OFFICIELLE AGRÉÉE HAJJ & OUMRA - LICENCE D\'EXPLOITATION N° ' + (agencyConfig.licenseNumber || '2024-SN-DKR-089'), margin, 18);
  doc.text(`${agencyConfig.address || 'Dakar Plateau, Sénégal'} | Tél: ${agencyConfig.phone || '+221 77 650 90 90'} | Email: ${agencyConfig.email || 'contact@evavoyages.sn'}`, margin, 23);

  // Right-aligned status pill in header
  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.roundedRect(pageWidth - margin - 42, 7, 42, 13, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DOCUMENT OFFICIEL', pageWidth - margin - 21, 13, { align: 'center' });
  doc.setFontSize(7);
  doc.text('REÇU DE CAISSE', pageWidth - margin - 21, 17.5, { align: 'center' });

  // Receipt Identification Strip
  let y = 37;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  const receiptNumber = transaction?.receiptNumber || `ATT-${dossier.trackingCode}`;
  const paymentDate = transaction ? new Date(transaction.date) : new Date();
  const dateFormatted = paymentDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(transaction ? 'REÇU DE CONFIRMATION DE RÈGLEMENT' : 'ATTESTATION ADMINISTRATIVE DE SOUSCRIPTION', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  doc.text(`N° Reçu : `, margin + 4, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  doc.text(receiptNumber, margin + 19, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Date & Heure : `, margin + 70, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  doc.text(dateFormatted, margin + 92, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`Code Dossier : `, pageWidth - margin - 45, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text(dossier.trackingCode, pageWidth - margin - 22, y + 14);

  // SECTION 1: Pilgrim Identity & Logistics (2 columns)
  y = 62;
  const colW = (contentWidth - 6) / 2;

  // Box 1: Pilgrim Identity
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, colW, 42, 2, 2, 'FD');

  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.roundedRect(margin, y, colW, 6.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('1. IDENTITÉ DU PÈLERIN', margin + 4, y + 4.5);

  const fullName = `${dossier.personalInfo.firstName} ${dossier.personalInfo.lastName}`.toUpperCase();
  let rowY = y + 12;
  doc.setFontSize(8);

  const printField = (label: string, value: string, currentY: number, leftOffset = margin + 4) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, leftOffset, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(value || 'N/A', leftOffset + 32, currentY);
  };

  printField('Nom & Prénom :', fullName, rowY);
  rowY += 6;
  printField('Passeport N° :', dossier.personalInfo.passportNumber || 'En attente', rowY);
  rowY += 6;
  printField('Téléphone :', dossier.personalInfo.phone || 'N/A', rowY);
  rowY += 6;
  printField('Email :', dossier.personalInfo.email || 'N/A', rowY);
  rowY += 6;
  printField('Ville / Pays :', `${dossier.personalInfo.city || 'Dakar'}, ${dossier.personalInfo.country || 'Sénégal'}`, rowY);

  // Box 2: Prestation & Logistique
  const col2X = margin + colW + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(col2X, y, colW, 42, 2, 2, 'FD');

  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.roundedRect(col2X, y, colW, 6.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('2. FORFAIT & PRESTATIONS', col2X + 4, y + 4.5);

  let row2Y = y + 12;
  printField('Package :', dossier.packageSnapshot.title.slice(0, 24), row2Y, col2X + 4);
  row2Y += 6;
  printField('Type Séjour :', dossier.packageSnapshot.type === 'HAJJ' ? 'HAJJ 1447H / 2026' : 'OUMRA 1447H', row2Y, col2X + 4);
  row2Y += 6;
  printField('Hébergement :', `Chambre ${dossier.packageSnapshot.roomType || 'Standard'}`, row2Y, col2X + 4);
  row2Y += 6;
  printField('Dates Prévues :', `Du ${dossier.packageSnapshot.departureDate || 'Mai'} au ${dossier.packageSnapshot.returnDate || 'Juin'}`, row2Y, col2X + 4);
  row2Y += 6;
  printField('Compagnie Vol :', dossier.flightDetails?.airline || 'Compagnie Aérienne Agréée', row2Y, col2X + 4);

  // SECTION 2: Transaction Details (if available)
  y = 110;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  doc.setFillColor(orange[0], orange[1], orange[2]);
  doc.roundedRect(margin, y, contentWidth, 6.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('3. DÉTAILS DE LA TRANSACTION CONFIRMÉE PAR L\'AGENCE', margin + 4, y + 4.5);

  const txAmount = transaction ? transaction.amountFCFA : dossier.payment.amountPaidFCFA;
  const txMethod = transaction ? (transaction.method === 'WAVE' ? 'WAVE DIGITAL FINANCE (SÉNÉGAL)' : 'ORANGE MONEY SÉNÉGAL') : 'MOBILE MONEY';
  const txRef = transaction?.reference || 'WAV-SN-CONFIRMED';
  const txPhone = transaction?.phone || dossier.personalInfo.phone;
  const txType = transaction?.paymentType === 'FULL' ? 'RÈGLEMENT INTÉGRAL 100%' : 'ACOMPTE DE RÉSERVATION';

  // Format currency helper
  const fmt = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  let ty = y + 13;
  // Left side transaction info
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Opérateur Mobile :', margin + 6, ty);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text(txMethod, margin + 40, ty);

  ty += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Référence Opérateur :', margin + 6, ty);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  doc.text(txRef, margin + 40, ty);

  ty += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Numéro Émetteur :', margin + 6, ty);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  doc.text(txPhone, margin + 40, ty);

  ty += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Nature du Règlement :', margin + 6, ty);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text(txType, margin + 40, ty);

  // Big Amount Box on the right
  const amountBoxX = pageWidth - margin - 60;
  doc.setFillColor(240, 253, 244); // light emerald
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(amountBoxX, y + 10, 54, 23, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text('MONTANT ENCAISSÉ', amountBoxX + 27, y + 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text(fmt(txAmount), amountBoxX + 27, y + 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text('Statut : CONFIRMÉ / VALIDÉ', amountBoxX + 27, y + 28, { align: 'center' });

  // SECTION 3: Financial Summary Table
  y = 153;
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DÉSIGNATION / COMPTE FINANCIER DU DOSSIER', margin + 4, y + 4.8);
  doc.text('MONTANT', pageWidth - margin - 4, y + 4.8, { align: 'right' });

  // Table rows
  y += 7;
  const drawTableRow = (label: string, sub: string, value: string, isTotal = false, isRemaining = false) => {
    const rowHeight = 11;
    if (isTotal) {
      doc.setFillColor(241, 245, 249);
    } else if (isRemaining) {
      doc.setFillColor(254, 242, 242);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, rowHeight, 'FD');

    doc.setFont('helvetica', isTotal || isRemaining ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(label, margin + 4, y + 5);

    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(sub, margin + 4, y + 9);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    if (isRemaining) {
      doc.setTextColor(orange[0], orange[1], orange[2]);
    } else if (isTotal) {
      doc.setTextColor(navy[0], navy[1], navy[2]);
    } else {
      doc.setTextColor(emerald[0], emerald[1], emerald[2]);
    }
    doc.text(value, pageWidth - margin - 4, y + 7, { align: 'right' });

    y += rowHeight;
  };

  drawTableRow(
    `Forfait Total ${dossier.packageSnapshot.title}`,
    `Option hébergement chambre ${dossier.packageSnapshot.roomType || 'quadruple'} - Tarif garanti`,
    fmt(dossier.payment.totalAmountFCFA)
  );

  drawTableRow(
    'Total des Règlements Encaissés à ce jour',
    `Versements validés par mobile money (Wave & Orange Money)`,
    fmt(dossier.payment.amountPaidFCFA),
    true
  );

  const solde = Math.max(0, dossier.payment.remainingBalanceFCFA);
  drawTableRow(
    'Solde Restant Dû',
    solde === 0 ? 'Dossier intégralement soldé (100% payé)' : 'Règlement du reliquat exigé avant départ',
    fmt(solde),
    false,
    solde > 0
  );

  // SECTION 4: Signatures & Certification Stamp
  y += 8;
  const stampColW = (contentWidth - 8) / 2;

  // Box Pilgrim Signature
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, stampColW, 36, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('LE PÈLERIN SOUSCRIPTEUR', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Signature précédée de la mention manuscrite "Lu et approuvé"', margin + 4, y + 11);

  // Box Agency Stamp & Signature
  const stampX = margin + stampColW + 8;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(stampX, y, stampColW, 36, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('VISA CAISSIER & CACHET OFFICIEL EVA VOYAGES', stampX + 4, y + 6);

  // Vectorized Official Circular Stamp
  const circleCenterX = stampX + stampColW - 22;
  const circleCenterY = y + 20;
  doc.setDrawColor(navy[0], navy[1], navy[2]);
  doc.setLineWidth(0.6);
  doc.circle(circleCenterX, circleCenterY, 13);
  doc.setDrawColor(orange[0], orange[1], orange[2]);
  doc.setLineWidth(0.3);
  doc.circle(circleCenterX, circleCenterY, 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('EVA VOYAGES SÉNÉGAL', circleCenterX, circleCenterY - 4.5, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(orange[0], orange[1], orange[2]);
  doc.text('CERTIFIÉ CONFORME', circleCenterX, circleCenterY, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setTextColor(emerald[0], emerald[1], emerald[2]);
  doc.text('CAISSE & COMPTABILITÉ', circleCenterX, circleCenterY + 4, { align: 'center' });
  doc.setFontSize(4);
  doc.setTextColor(75, 85, 99);
  doc.text('DAKAR - SÉNÉGAL', circleCenterX, circleCenterY + 7, { align: 'center' });

  // Legal disclaimer footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const legalText = `Ce reçu certifie l'encaissement de la somme indiquée pour l'organisation du pèlerinage aux Lieux Saints de l'Islam par l'agence ${agencyConfig.name || 'EVA VOYAGES'}. Ce document est délivré pour valoir ce que de droit auprès des compagnies de transport aérien et des autorités aéroportuaires. Émis le ${dateFormatted}.`;
  doc.text(legalText, margin, pageHeight - 12, { maxWidth: contentWidth, align: 'justify' });

  if (autoDownload) {
    const sanitizedName = `${dossier.personalInfo.lastName}_${dossier.personalInfo.firstName}`.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Recu_Paiement_${receiptNumber}_${sanitizedName}.pdf`;
    doc.save(filename);
  }

  return doc;
};
