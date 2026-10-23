import { jsPDF } from 'jspdf';
import { PilgrimDossier, AgencyConfig, BadgeSettings } from '../types';

/**
 * Loads an image from a URL and converts it to a base64 Data URL.
 * Returns null if the image fails to load or violates CORS.
 */
export const loadImageDataUrl = async (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          resolve(dataUrl);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
};

/**
 * Draws a clean vector phone icon inside the orange footer square
 */
const drawPhoneHandsetIcon = (doc: jsPDF, x: number, y: number, size: number) => {
  // Orange square background
  doc.setFillColor(228, 106, 61); // #e46a3d
  doc.roundedRect(x, y, size, size, 1.2, 1.2, 'F');

  // White telephone handset
  doc.setDrawColor(255, 255, 255);
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.5);

  const cx = x + size / 2;
  const cy = y + size / 2;

  // Earpiece and mouthpiece circles
  doc.circle(cx - 1.3, cy - 0.7, 0.65, 'F');
  doc.circle(cx + 1.3, cy + 0.7, 0.65, 'F');

  // Handle bar
  doc.line(cx - 1.2, cy - 0.5, cx + 1.2, cy + 0.5);

  // Cradle arc / handset curve
  doc.setLineWidth(0.7);
  doc.line(cx - 1.5, cy - 0.2, cx - 0.5, cy - 1.1);
  doc.line(cx + 0.5, cy + 1.1, cx + 1.5, cy + 0.2);
};

/**
 * Formats title string with spaced letters (e.g. "O U M R A H   G A M O U   2 0 2 6   V I P")
 */
export const formatSpacedTitle = (title: string): string => {
  const clean = title.trim().toUpperCase();
  if (clean.includes('   ')) return clean; // already spaced
  return clean
    .split(' ')
    .map((word) => word.split('').join(' '))
    .join('   ');
};

/**
 * Draw the official landscape badge conforming to the user's CamScanner model scan:
 * - Dimensions: 95mm x 62mm (landscape format)
 * - White background (#FFFFFF)
 * - Centered EVA Voyages logo at top
 * - Terracotta / orange banner: "O U M R A H   G A M O U   2 0 2 6   V I P" (or custom title)
 * - Left column:
 *     Prénom: {firstName}
 *     Nom: {lastName}
 *     Médine: {hotelMedine}
 *     Maakkah: {hotelMakkah}
 * - Right column:
 *     Pilgrim Photo in portrait frame with rounded corners
 * - Dark footer bar:
 *     Orange phone square icon + Phone Senegal + SAUDI emergency number
 */
export const drawBadgeOnDoc = async (
  doc: jsPDF,
  dossier: PilgrimDossier,
  agencyConfig: AgencyConfig,
  x: number,
  y: number,
  w: number = 95,
  h: number = 62,
  logoDataUrl?: string | null,
  photoDataUrl?: string | null,
  customBadgeSettings?: Partial<BadgeSettings>
) => {
  // Resolve settings with precedence: dossier specific settings > custom override / fallback > agency settings
  const settings: BadgeSettings = {
    badgeTitle:
      dossier.badgeSettings?.badgeTitle ||
      customBadgeSettings?.badgeTitle ||
      agencyConfig.badgeSettings?.badgeTitle ||
      'OUMRAH GAMOU 2026 VIP',
    hotelMedine:
      dossier.badgeSettings?.hotelMedine ||
      customBadgeSettings?.hotelMedine ||
      agencyConfig.badgeSettings?.hotelMedine ||
      'THE BILTMORE',
    hotelMakkah:
      dossier.badgeSettings?.hotelMakkah ||
      customBadgeSettings?.hotelMakkah ||
      agencyConfig.badgeSettings?.hotelMakkah ||
      'ROTANA',
    phoneSenegal:
      customBadgeSettings?.phoneSenegal ||
      dossier.badgeSettings?.phoneSenegal ||
      agencyConfig.badgeSettings?.phoneSenegal ||
      '+221 77 168 93 93 - 77 639 07 18',
    phoneSaudi:
      customBadgeSettings?.phoneSaudi ||
      dossier.badgeSettings?.phoneSaudi ||
      agencyConfig.badgeSettings?.phoneSaudi ||
      '0543625106',
  };

  // Color Palette from CamScanner Scan
  const white = [255, 255, 255];
  const borderLight = [226, 232, 240]; // #e2e8f0
  const orangeBanner = [228, 106, 61]; // #e46a3d
  const darkFooter = [51, 56, 68]; // #333844 charcoal
  const textDark = [17, 24, 39]; // #111827 dark charcoal
  const labelColor = [55, 65, 81]; // #374151 medium dark

  // 1. Badge Base (White card with subtle rounded edge)
  doc.setFillColor(white[0], white[1], white[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  // 2. Centered Official EVA Voyages Logo at Top
  const logoW = 20;
  const logoH = 9;
  const logoX = x + (w - logoW) / 2;
  const logoY = y + 1.8;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
    } catch {
      // Fallback text if logo fails to render
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(19, 92, 165); // #135ca5
      doc.text(agencyConfig.name || 'EVA VOYAGES', x + w / 2, logoY + 6.5, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(19, 92, 165);
    doc.text(agencyConfig.name || 'EVA VOYAGES', x + w / 2, logoY + 6.5, { align: 'center' });
  }

  // 3. Orange / Terracotta Banner Box
  const bannerY = y + 11.2;
  const bannerW = w - 7;
  const bannerH = 7.6;
  const bannerX = x + 3.5;

  doc.setFillColor(orangeBanner[0], orangeBanner[1], orangeBanner[2]);
  doc.roundedRect(bannerX, bannerY, bannerW, bannerH, 1.4, 1.4, 'F');

  // Banner Text: Spaced All-Caps (e.g. "O U M R A H   G A M O U   2 0 2 6   V I P")
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.setTextColor(255, 255, 255);
  const formattedTitle = formatSpacedTitle(settings.badgeTitle);
  doc.text(formattedTitle, x + w / 2, bannerY + 5.3, { align: 'center' });

  // 4. Middle Section (Left Info + Right Photo)
  // Left Column: Prénom, Nom, Médine, Maakkah
  const labelX = x + 5.5;
  const valueX = x + 24.5;
  const startRowY = y + 23.5;
  const rowGap = 6.4;

  // Row 1: Prénom
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
  doc.text('Prénom:', labelX, startRowY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const firstNameClean = (dossier.personalInfo.firstName || '').toUpperCase();
  doc.text(firstNameClean, valueX, startRowY);

  // Row 2: Nom
  const row2Y = startRowY + rowGap;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
  doc.text('Nom:', labelX, row2Y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const lastNameClean = (dossier.personalInfo.lastName || '').toUpperCase();
  doc.text(lastNameClean, valueX, row2Y);

  // Row 3: Médine (Editable Hotel Name)
  const row3Y = row2Y + rowGap;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
  doc.text('Médine:', labelX, row3Y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const medineHotelClean = (settings.hotelMedine || 'THE BILTMORE').toUpperCase();
  doc.text(medineHotelClean, valueX, row3Y);

  // Row 4: Maakkah (Editable Hotel Name - note spelling Maakkah matching CamScanner scan)
  const row4Y = row3Y + rowGap;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(labelColor[0], labelColor[1], labelColor[2]);
  doc.text('Maakkah:', labelX, row4Y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.2);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const makkahHotelClean = (settings.hotelMakkah || 'ROTANA').toUpperCase();
  doc.text(makkahHotelClean, valueX, row4Y);

  // Right Column: Pilgrim Photo Frame
  const photoW = 23;
  const photoH = 26.5;
  const photoX = x + w - photoW - 5.5;
  const photoY = y + 20.5;

  doc.setFillColor(248, 250, 252); // slate 50
  doc.setDrawColor(203, 213, 225); // slate 300
  doc.setLineWidth(0.4);
  doc.roundedRect(photoX, photoY, photoW, photoH, 2, 2, 'FD');

  let photoDrawn = false;
  if (photoDataUrl) {
    try {
      doc.addImage(photoDataUrl, 'JPEG', photoX + 0.6, photoY + 0.6, photoW - 1.2, photoH - 1.2, undefined, 'FAST');
      photoDrawn = true;
    } catch {
      photoDrawn = false;
    }
  }

  if (!photoDrawn) {
    // Placeholder avatar with initials
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    const initials = `${(dossier.personalInfo.firstName || 'A').charAt(0)}${(dossier.personalInfo.lastName || 'N').charAt(0)}`.toUpperCase();
    doc.text(initials, photoX + photoW / 2, photoY + photoH / 2 + 4, { align: 'center' });
  }

  // 5. Dark Footer Bar with Phone Icon and Contacts
  const footerH = 9.8;
  const footerY = y + h - footerH - 2.5;
  const footerX = x + 3.5;
  const footerW = w - 7;

  doc.setFillColor(darkFooter[0], darkFooter[1], darkFooter[2]);
  doc.roundedRect(footerX, footerY, footerW, footerH, 1.4, 1.4, 'F');

  // Orange Phone Handset Box on the Left
  const phoneIconSize = 6.8;
  const phoneIconX = footerX + 2;
  const phoneIconY = footerY + (footerH - phoneIconSize) / 2;
  drawPhoneHandsetIcon(doc, phoneIconX, phoneIconY, phoneIconSize);

  // Contact Numbers on the Right
  const contactsCenterX = footerX + phoneIconSize + (footerW - phoneIconSize) / 2 + 1;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(255, 255, 255);

  // Line 1: Senegal Phone Numbers (e.g. "+221 77 168 93 93 - 77 639 07 18")
  doc.text(settings.phoneSenegal, contactsCenterX, footerY + 3.8, { align: 'center' });

  // Line 2: Saudi Emergency Phone Number (e.g. "SAUDI : 0543625106")
  const saudiLine = settings.phoneSaudi.toUpperCase().startsWith('SAUDI')
    ? settings.phoneSaudi.toUpperCase()
    : `SAUDI : ${settings.phoneSaudi}`;
  doc.text(saudiLine, contactsCenterX, footerY + 7.8, { align: 'center' });
};

/**
 * Generate a single high-resolution PDF badge matching the CamScanner model
 */
export const generateSingleBadgePdf = async (
  dossier: PilgrimDossier,
  agencyConfig: AgencyConfig,
  autoDownload: boolean = true,
  customSettings?: Partial<BadgeSettings>
): Promise<jsPDF> => {
  // Landscape badge: 95mm x 62mm
  const badgeWidth = 95;
  const badgeHeight = 62;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [badgeWidth, badgeHeight],
  });

  // Preload logo and pilgrim photo
  const [logoDataUrl, photoDataUrl] = await Promise.all([
    loadImageDataUrl(agencyConfig.logoUrl || '/logo.png'),
    dossier.documents.photo?.fileUrl ? loadImageDataUrl(dossier.documents.photo.fileUrl) : Promise.resolve(null),
  ]);

  await drawBadgeOnDoc(
    doc,
    dossier,
    agencyConfig,
    0,
    0,
    badgeWidth,
    badgeHeight,
    logoDataUrl,
    photoDataUrl,
    customSettings
  );

  if (autoDownload) {
    const safeLastName = (dossier.personalInfo.lastName || 'Pelerin').replace(/[^a-zA-Z0-9]/g, '_');
    const safeFirstName = (dossier.personalInfo.firstName || '').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Badge_EVA_Voyages_${safeFirstName}_${safeLastName}_${dossier.trackingCode}.pdf`);
  }

  return doc;
};

/**
 * Generate a printable A4 sheet of badges (8 badges per A4 page in 2x4 grid)
 * with crop marks / cutting lines for fast laminating & dispatch.
 */
export const generateBatchBadgesPdf = async (
  dossiers: PilgrimDossier[],
  agencyConfig: AgencyConfig,
  customTitle: string = 'Planche_Badges_EVA_VOYAGES',
  autoDownload: boolean = true,
  customSettings?: Partial<BadgeSettings>
): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Badge Dimensions
  const badgeWidth = 92;
  const badgeHeight = 60;

  // 2 columns x 4 rows layout = 8 badges per A4 page
  const marginX = 10;
  const gapX = 6;
  const marginY = 14;
  const gapY = 8;

  // Preload logo once
  const logoDataUrl = await loadImageDataUrl(agencyConfig.logoUrl || '/logo.png');

  // Loop through dossiers 8 per page
  for (let i = 0; i < dossiers.length; i++) {
    const slotIndex = i % 8; // 0 to 7

    if (i > 0 && slotIndex === 0) {
      doc.addPage();
    }

    const col = slotIndex % 2;
    const row = Math.floor(slotIndex / 2);

    const bx = marginX + col * (badgeWidth + gapX);
    const by = marginY + row * (badgeHeight + gapY);

    // Preload photo for this dossier
    const photoUrl = dossiers[i].documents.photo?.fileUrl;
    const photoDataUrl = photoUrl ? await loadImageDataUrl(photoUrl) : null;

    // Draw badge
    await drawBadgeOnDoc(
      doc,
      dossiers[i],
      agencyConfig,
      bx,
      by,
      badgeWidth,
      badgeHeight,
      logoDataUrl,
      photoDataUrl,
      customSettings
    );

    // Draw light cutting guides around badge
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.15);
    // Corner tick crop marks
    doc.line(bx - 2, by, bx, by);
    doc.line(bx, by - 2, bx, by);
    doc.line(bx + badgeWidth, by, bx + badgeWidth + 2, by);
    doc.line(bx + badgeWidth, by - 2, bx + badgeWidth, by);
    doc.line(bx - 2, by + badgeHeight, bx, by + badgeHeight);
    doc.line(bx, by + badgeHeight, bx, by + badgeHeight + 2);
    doc.line(bx + badgeWidth, by + badgeHeight, bx + badgeWidth + 2, by + badgeHeight);
    doc.line(bx + badgeWidth, by + badgeHeight, bx + badgeWidth + 2, by + badgeHeight + 2);
  }

  if (autoDownload) {
    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`${customTitle}_${dateStr}.pdf`);
  }

  return doc;
};
