export type PackageType = 'HAJJ' | 'OUMRA';

export interface RoomPricing {
  quadruple: number;
  triple: number;
  double: number;
}

export interface HotelInfo {
  name: string;
  stars: number;
  distanceMeters: number;
  walkMinutes: number;
}

export interface Package {
  id: string;
  title: string;
  type: PackageType;
  subtitle: string;
  season: string;
  durationDays: number;
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  returnDate: string;
  priceFCFA: number; // Base price for standard room (quadruple)
  discountPriceFCFA?: number;
  minDepositFCFA: number;
  roomPricing: RoomPricing;
  hotelMakkah: HotelInfo;
  hotelMedina: HotelInfo;
  airline: string;
  flightType: 'Vol Direct' | 'Vol avec 1 Escale';
  spotsTotal: number;
  spotsRemaining: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'FULL';
  inclusions: string[];
  exclusions: string[];
  imageUrl: string;
  badges: string[];
  whatsappGroupName?: string;
  whatsappGroupLink?: string;
  whatsappGroupDescription?: string;
  whatsappAdminPhone?: string;
  whatsappQrCodeUrl?: string; // URL ou image dataURL du QR code WhatsApp du package
}

export type DocumentType = 'passport' | 'photo' | 'medical';

export interface PilgrimDocument {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
}

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY';

export interface Transaction {
  id: string;
  dossierId: string;
  date: string;
  amountFCFA: number;
  method: PaymentMethod;
  paymentType?: 'DEPOSIT' | 'FULL' | 'BALANCE';
  reference: string;
  phone: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  receiptNumber: string;
  operatorNotes?: string;
}

export type WorkflowStatus =
  | 'DOCUMENTS_PENDING'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_APPROVED'
  | 'FLIGHT_TICKET_ISSUED'
  | 'READY_FOR_DEPARTURE'
  | 'COMPLETED';

export type RoomChoice = 'quadruple' | 'triple' | 'double';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  bloodGroup: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  mahramName?: string;
  mahramRelation?: string;
  medicalConditions?: string;
}

export interface PilgrimDossier {
  id: string;
  trackingCode: string; // e.g. "EVA-HJ26-9284"
  createdAt: string;
  updatedAt: string;
  packageId: string;
  packageSnapshot: {
    title: string;
    type: PackageType;
    priceFCFA: number;
    roomType: RoomChoice;
    departureDate: string;
    returnDate: string;
    season: string;
    whatsappGroupName?: string;
    whatsappGroupLink?: string;
    whatsappQrCodeUrl?: string;
  };
  personalInfo: PersonalInfo;
  documents: {
    passport?: PilgrimDocument;
    photo?: PilgrimDocument;
    medical?: PilgrimDocument;
  };
  payment: {
    totalAmountFCFA: number;
    amountPaidFCFA: number;
    remainingBalanceFCFA: number;
    paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
    transactions: Transaction[];
  };
  workflowStatus: WorkflowStatus;
  flightDetails?: {
    airline: string;
    pnr: string;
    flightNumber: string;
    departureDate: string;
    departureTime?: string;
    departureCity?: string;
    destinationCity?: string;
    returnFlightNumber?: string;
    returnDate?: string;
    returnTime?: string;
    seatNumber?: string;
    terminal?: string;
    baggageAllowance?: string;
    ticketUrl?: string;
    ticketPdfUrl?: string;
    ticketPdfName?: string;
    ticketPdfSize?: string;
    uploadedAt?: string;
    status?: 'ISSUED' | 'PENDING';
  };
  visaDetails?: {
    visaNumber?: string;
    visaType?: 'TOURIST' | 'UMRAH' | 'HAJJ';
    issueDate?: string;
    expiryDate?: string;
    entryBorder?: string;
    borderNumber?: string;
    durationOfStay?: string;
    visaPdfUrl?: string;
    visaPdfName?: string;
    visaPdfSize?: string;
    uploadedAt?: string;
    status?: 'ISSUED' | 'PENDING' | 'REJECTED';
  };
  trainDetails?: {
    hasTrainTicket: boolean;
    trainNumber?: string;
    trainOperator?: string;
    route?: string;
    departureDate?: string;
    departureTime?: string;
    carNumber?: string;
    seatNumber?: string;
    classType?: 'ECONOMY' | 'BUSINESS';
    ticketUrl?: string;
    ticketPdfUrl?: string;
    ticketPdfName?: string;
    ticketPdfSize?: string;
    uploadedAt?: string;
    status?: 'ISSUED' | 'NOT_APPLICABLE' | 'PENDING';
  };
  whatsappStatus?: 'JOINED' | 'INVITATION_SENT' | 'PENDING';
  whatsappJoinedAt?: string;
  whatsappInvitedAt?: string;
  badgeSettings?: Partial<BadgeSettings>;
  adminNotes?: string;
}

export interface NotificationLog {
  id: string;
  dossierId?: string;
  trackingCode?: string;
  type: 'SMS' | 'EMAIL';
  recipientPhone?: string;
  recipientEmail?: string;
  sender: string;
  subject?: string;
  message: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  trigger: 'REGISTRATION' | 'PAYMENT' | 'STATUS_CHANGE' | 'WHATSAPP_INVITE' | 'MANUAL';
}

export interface BadgeSettings {
  badgeTitle: string; // e.g. "OUMRAH GAMOU 2026 VIP"
  hotelMedine: string; // e.g. "THE BILTMORE"
  hotelMakkah: string; // e.g. "ROTANA"
  phoneSenegal: string; // e.g. "+221 77 168 93 93 - 77 639 07 18"
  phoneSaudi: string; // e.g. "0543625106"
  forceOverride?: boolean;
}

export interface AgencyConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  licenseNumber: string;
  waveMerchantNumber: string;
  orangeMoneyMerchantNumber: string;
  currency: string;
  smsSenderName: string;
  logoUrl?: string;
  waveLogoUrl?: string;
  orangeMoneyLogoUrl?: string;
  waveQrUrl?: string;
  wavePdfUrl?: string;
  badgeSettings?: BadgeSettings;
}

export type UserRole = 'PILGRIM' | 'ADMIN';

export interface UserAccount {
  id: string;
  role: UserRole;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  linkedTrackingCode?: string;
  createdAt: string;
}
