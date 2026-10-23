import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AgencyConfig,
  DocumentType,
  NotificationLog,
  Package,
  PaymentMethod,
  PilgrimDocument,
  PilgrimDossier,
  Transaction,
  WorkflowStatus,
  UserAccount,
  UserRole,
  BadgeSettings,
} from '../types';
import {
  INITIAL_AGENCY_CONFIG,
  INITIAL_DOSSIERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PACKAGES,
  DEFAULT_ADMIN_ACCOUNT,
  DEFAULT_PILGRIM_ACCOUNT,
} from '../data/mockData';
import { cacheAllDossiersOffline } from '../utils/offlineStorage';

interface AppContextType {
  // Navigation & View
  currentView: 'PILGRIM' | 'ADMIN';
  setCurrentView: (view: 'PILGRIM' | 'ADMIN') => void;
  pilgrimActiveTab: 'PACKAGES' | 'REGISTER' | 'TRACKING' | 'PAYMENT' | 'GUIDE' | 'QIBLA' | 'QURAN';
  setPilgrimActiveTab: (tab: 'PACKAGES' | 'REGISTER' | 'TRACKING' | 'PAYMENT' | 'GUIDE' | 'QIBLA' | 'QURAN') => void;
  adminActiveTab: 'DASHBOARD' | 'DOSSIERS' | 'PACKAGES' | 'TRANSACTIONS' | 'ANALYTICS' | 'NOTIFICATIONS' | 'SETTINGS' | 'BADGES';
  setAdminActiveTab: (tab: 'DASHBOARD' | 'DOSSIERS' | 'PACKAGES' | 'TRANSACTIONS' | 'ANALYTICS' | 'NOTIFICATIONS' | 'SETTINGS' | 'BADGES') => void;

  // Selected State
  selectedPackageId: string | null;
  setSelectedPackageId: (id: string | null) => void;
  selectedDossierId: string | null;
  setSelectedDossierId: (id: string | null) => void;
  trackingQueryCode: string;
  setTrackingQueryCode: (code: string) => void;

  // Data
  agencyConfig: AgencyConfig;
  updateAgencyConfig: (config: Partial<AgencyConfig>) => void;
  packages: Package[];
  dossiers: PilgrimDossier[];
  notifications: NotificationLog[];

  // Package Management (Back-office)
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, pkg: Partial<Package>) => void;
  deletePackage: (id: string) => void;

  // Dossier Management
  registerPilgrim: (data: Omit<PilgrimDossier, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt'>) => PilgrimDossier;
  updateDossierStatus: (
    dossierId: string,
    newStatus: WorkflowStatus,
    extra?: {
      flightDetails?: PilgrimDossier['flightDetails'];
      trainDetails?: PilgrimDossier['trainDetails'];
      notes?: string;
    }
  ) => void;
  updateDossierDocument: (dossierId: string, docType: DocumentType, doc: PilgrimDocument) => void;
  reviewDocument: (dossierId: string, docType: DocumentType, approved: boolean, reason?: string) => void;
  updateDossier: (dossierId: string, updates: Partial<PilgrimDossier>) => void;
  joinWhatsAppGroup: (dossierId: string) => void;
  toggleWhatsAppJoined: (dossierId: string, joined?: boolean) => void;
  sendWhatsAppInvitation: (dossierId: string) => void;

  // Payment Processing (Wave / Orange Money)
  processPayment: (params: {
    dossierId: string;
    amountFCFA: number;
    method: PaymentMethod;
    paymentType?: 'DEPOSIT' | 'FULL' | 'BALANCE';
    phone: string;
    reference?: string;
  }) => { success: boolean; transaction: Transaction; receiptNumber: string };

  // Notifications
  sendNotification: (notification: Omit<NotificationLog, 'id' | 'sentAt' | 'status'>) => NotificationLog;
  recentLiveToast: NotificationLog | null;
  clearLiveToast: () => void;

  // Helpers
  formatFCFA: (amount: number) => string;

  // Two-Account System (Client vs Back-Office)
  currentUser: UserAccount | null;
  loginAsAdmin: (customEmail?: string) => boolean;
  loginAsPilgrim: (trackingCode?: string) => boolean;
  loginWithCredentials: (
    role: UserRole,
    identifier: string,
    passcode: string
  ) => { success: boolean; error?: string };
  registerClientAccount: (
    name: string,
    email: string,
    phone?: string,
    trackingCode?: string,
    firstName?: string,
    lastName?: string
  ) => UserAccount;
  switchToBackOffice: (customEmail?: string, customName?: string) => UserAccount;
  isBackOfficeDomain: (email?: string) => boolean;
  getMyDossier: () => PilgrimDossier | undefined;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalRole: UserRole;
  setAuthModalRole: (role: UserRole) => void;
  authModalMode: 'LOGIN' | 'REGISTER';
  setAuthModalMode: (mode: 'LOGIN' | 'REGISTER') => void;
  openAuthModal: (role?: UserRole, mode?: 'LOGIN' | 'REGISTER') => void;
  navigateToSpace: (targetRole: UserRole) => void;

  // Badge Customization (CamScanner Model: Editable Hotel Medina & Makkah)
  badgeSettings: BadgeSettings;
  updateBadgeSettings: (settings: Partial<BadgeSettings>) => void;
  updateDossierBadgeSettings: (dossierId: string, settings: Partial<BadgeSettings>) => void;
  applyBadgeHotelsToAll: (hotelMedine: string, hotelMakkah: string) => void;
  applyBadgeHotelsToDossiers: (dossierIds: string[], hotelMedine?: string, hotelMakkah?: string) => void;
  isAuthorizedAdminEmail: (email?: string) => boolean;
}

export const isAuthorizedAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean.endsWith('@evavoyage.com') ||
    clean.endsWith('@evavoyages.com') ||
    clean === 'evavoyages1@gmail.com' ||
    clean.endsWith('@evavoyages.sn')
  );
};

export const isBackOfficeDomain = (email?: string): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean.endsWith('@evavoyage.com') ||
    clean.endsWith('@evavoyages.com') ||
    clean.includes('@evavoyage.com') ||
    clean.includes('@evavoyages.com') ||
    clean === 'evavoyages1@gmail.com' ||
    clean.endsWith('@evavoyages.sn')
  );
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PACKAGES: 'eva_voyages_packages_v1',
  DOSSIERS: 'eva_voyages_dossiers_v1',
  NOTIFICATIONS: 'eva_voyages_notifications_v1',
  CONFIG: 'eva_voyages_config_v2',
  AUTH_USER: 'eva_voyages_auth_user_v1',
  BADGE_SETTINGS: 'eva_voyages_badge_settings_v2',
};

export const DEFAULT_BADGE_SETTINGS: BadgeSettings = {
  badgeTitle: 'OUMRAH GAMOU 2026 VIP',
  hotelMedine: 'THE BILTMORE',
  hotelMakkah: 'ROTANA',
  phoneSenegal: '+221 77 168 93 93 - 77 639 07 18',
  phoneSaudi: '0543625106',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'PILGRIM' | 'ADMIN'>('PILGRIM');
  const [pilgrimActiveTab, setPilgrimActiveTab] = useState<'PACKAGES' | 'REGISTER' | 'TRACKING' | 'PAYMENT' | 'GUIDE' | 'QIBLA' | 'QURAN'>('PACKAGES');
  const [adminActiveTab, setAdminActiveTab] = useState<'DASHBOARD' | 'DOSSIERS' | 'PACKAGES' | 'TRANSACTIONS' | 'ANALYTICS' | 'NOTIFICATIONS' | 'SETTINGS' | 'BADGES'>('DASHBOARD');

  // Authentication State (Two Distinct Accounts: Client vs Back-Office)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('eva_voyages_auth_user_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'ADMIN') {
          if (!isAuthorizedAdminEmail(parsed.email)) {
            return DEFAULT_PILGRIM_ACCOUNT;
          }
        }
        return parsed;
      }
      return DEFAULT_PILGRIM_ACCOUNT;
    } catch {
      return DEFAULT_PILGRIM_ACCOUNT;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('PILGRIM');
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>('pkg-hajj-prestige-2026');
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>('dos-001');
  const [trackingQueryCode, setTrackingQueryCode] = useState<string>(
    currentUser?.linkedTrackingCode || 'EVA-HJ26-9284'
  );

  const [recentLiveToast, setRecentLiveToast] = useState<NotificationLog | null>(null);

  // Agency Config State
  const [agencyConfig, setAgencyConfig] = useState<AgencyConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_AGENCY_CONFIG,
          ...parsed,
          whatsapp: parsed.whatsapp === '+221 77 650 90 90' ? '+221 78 639 10 00' : (parsed.whatsapp || '+221 78 639 10 00'),
          waveMerchantNumber: parsed.waveMerchantNumber?.includes('77 650 90 90') ? '+221 78 639 10 00 (EVA VOYAGES SN)' : (parsed.waveMerchantNumber || INITIAL_AGENCY_CONFIG.waveMerchantNumber),
          waveLogoUrl: '/assets/wave_logo.png',
          orangeMoneyLogoUrl: '/assets/orange_money_logo.png',
          logoUrl: '/logo.png',
        };
      }
      return INITIAL_AGENCY_CONFIG;
    } catch {
      return INITIAL_AGENCY_CONFIG;
    }
  });

  // Packages State
  const [packages, setPackages] = useState<Package[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (!saved) return INITIAL_PACKAGES;
      const parsed: Package[] = JSON.parse(saved);
      return parsed.map((p) => {
        const initial = INITIAL_PACKAGES.find((ip) => ip.id === p.id);
        const link = p.whatsappGroupLink || initial?.whatsappGroupLink || `https://chat.whatsapp.com/invite/EVA${p.type === 'HAJJ' ? 'Hajj2026' : 'Oumra2026'}`;
        return {
          ...p,
          whatsappGroupName: p.whatsappGroupName || initial?.whatsappGroupName || `EVA Voyages - ${p.title} 🕋`,
          whatsappGroupLink: link,
          whatsappGroupDescription: p.whatsappGroupDescription || initial?.whatsappGroupDescription || 'Groupe WhatsApp officiel d\'encadrement des pèlerins.',
          whatsappAdminPhone: p.whatsappAdminPhone || initial?.whatsappAdminPhone || '+221 78 639 10 00',
          whatsappQrCodeUrl: p.whatsappQrCodeUrl || initial?.whatsappQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link)}`,
        };
      });
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  // Dossiers State
  const [dossiers, setDossiers] = useState<PilgrimDossier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOSSIERS);
      if (!saved) return INITIAL_DOSSIERS;
      const parsed: PilgrimDossier[] = JSON.parse(saved);
      return parsed.map((d) => {
        const initial = INITIAL_DOSSIERS.find((id) => id.id === d.id);
        const pkg = INITIAL_PACKAGES.find((p) => p.id === d.packageId);
        const whatsappGroupName =
          d.packageSnapshot?.whatsappGroupName ||
          initial?.packageSnapshot?.whatsappGroupName ||
          pkg?.whatsappGroupName ||
          `EVA Voyages - ${d.packageSnapshot?.title || 'Package'} 🕋`;
        const whatsappGroupLink =
          d.packageSnapshot?.whatsappGroupLink ||
          initial?.packageSnapshot?.whatsappGroupLink ||
          pkg?.whatsappGroupLink ||
          `https://chat.whatsapp.com/invite/EVA${d.packageSnapshot?.type === 'HAJJ' ? 'Hajj2026' : 'Oumra2026'}`;

        return {
          ...d,
          packageSnapshot: {
            ...d.packageSnapshot,
            whatsappGroupName,
            whatsappGroupLink,
          },
          whatsappStatus: d.whatsappStatus || initial?.whatsappStatus || 'INVITATION_SENT',
        };
      });
    } catch {
      return INITIAL_DOSSIERS;
    }
  });

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(dossiers));
    cacheAllDossiersOffline(dossiers);
  }, [dossiers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(agencyConfig));
  }, [agencyConfig]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [currentUser]);

  // Badge Settings State (CamScanner Model: Editable Hotel Medina & Makkah)
  const [badgeSettings, setBadgeSettings] = useState<BadgeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BADGE_SETTINGS);
      return saved ? { ...DEFAULT_BADGE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_BADGE_SETTINGS;
    } catch {
      return DEFAULT_BADGE_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BADGE_SETTINGS, JSON.stringify(badgeSettings));
  }, [badgeSettings]);

  const updateBadgeSettings = (updates: Partial<BadgeSettings>) => {
    setBadgeSettings((prev) => ({ ...prev, ...updates }));
  };

  const updateDossierBadgeSettings = (dossierId: string, updates: Partial<BadgeSettings>) => {
    setDossiers((prev) =>
      prev.map((dos) =>
        dos.id === dossierId
          ? {
              ...dos,
              badgeSettings: {
                ...dos.badgeSettings,
                ...updates,
              },
              updatedAt: new Date().toISOString(),
            }
          : dos
      )
    );
  };

  const applyBadgeHotelsToAll = (hotelMedine: string, hotelMakkah: string) => {
    updateBadgeSettings({ hotelMedine, hotelMakkah });
    setDossiers((prev) =>
      prev.map((dos) => ({
        ...dos,
        badgeSettings: {
          ...dos.badgeSettings,
          hotelMedine,
          hotelMakkah,
        },
        updatedAt: new Date().toISOString(),
      }))
    );
  };

  const applyBadgeHotelsToDossiers = (
    dossierIds: string[],
    hotelMedine?: string,
    hotelMakkah?: string
  ) => {
    if (!dossierIds || dossierIds.length === 0) return;
    setDossiers((prev) =>
      prev.map((dos) => {
        if (!dossierIds.includes(dos.id)) return dos;
        return {
          ...dos,
          badgeSettings: {
            ...dos.badgeSettings,
            ...(hotelMedine !== undefined && hotelMedine.trim() !== '' ? { hotelMedine: hotelMedine.trim().toUpperCase() } : {}),
            ...(hotelMakkah !== undefined && hotelMakkah.trim() !== '' ? { hotelMakkah: hotelMakkah.trim().toUpperCase() } : {}),
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Authentication & Portal Separation Actions
  const openAuthModal = (role: UserRole = 'PILGRIM', mode: 'LOGIN' | 'REGISTER' = 'REGISTER') => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const navigateToSpace = (targetRole: UserRole) => {
    if (targetRole === 'ADMIN') {
      if (currentUser?.role === 'ADMIN' && isAuthorizedAdminEmail(currentUser.email)) {
        setCurrentView('ADMIN');
      } else {
        openAuthModal('ADMIN');
      }
    } else {
      setCurrentView('PILGRIM');
    }
  };

  const loginAsAdmin = (customEmail?: string, customName?: string) => {
    const emailToUse =
      customEmail && isAuthorizedAdminEmail(customEmail)
        ? customEmail
        : 'direction@evavoyage.com';
    const adminAccount: UserAccount = {
      ...DEFAULT_ADMIN_ACCOUNT,
      name: customName || (emailToUse === 'evavoyages1@gmail.com' ? 'EVA Voyages (Direction)' : emailToUse.split('@')[0].toUpperCase()),
      email: emailToUse,
    };
    setCurrentUser(adminAccount);
    setCurrentView('ADMIN');
    return true;
  };

  const switchToBackOffice = (customEmail?: string, customName?: string): UserAccount => {
    const emailToUse = customEmail?.trim() || 'direction@evavoyage.com';
    const adminAccount: UserAccount = {
      id: `acc-admin-${Date.now()}`,
      role: 'ADMIN',
      name: customName?.trim() || (emailToUse === 'evavoyages1@gmail.com' ? 'Direction EVA Voyages' : emailToUse.split('@')[0].toUpperCase()),
      email: emailToUse,
      phone: '+221 78 639 10 00',
      title: 'Personnel Agréé Agence Hajj & Oumra',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(adminAccount);
    setCurrentView('ADMIN');
    setIsAuthModalOpen(false);

    sendNotification({
      type: 'SMS',
      recipientPhone: '+221 78 639 10 00',
      sender: 'EVA VOYAGES',
      message: `Back-Office: Basculement automatique réussi vers le compte administration pour le domaine @evavoyage.com (${emailToUse}).`,
      trigger: 'MANUAL',
    });

    return adminAccount;
  };

  const getMyDossier = (): PilgrimDossier | undefined => {
    if (!currentUser || currentUser.role !== 'PILGRIM') return undefined;
    const userEmail = currentUser.email?.trim().toLowerCase();
    const userCode = currentUser.linkedTrackingCode?.trim().toUpperCase();
    const userPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
    const userFullName = currentUser.name?.trim().toLowerCase();

    return dossiers.find((d) => {
      if (userCode && d.trackingCode.toUpperCase() === userCode) return true;
      if (userEmail && d.personalInfo.email.toLowerCase() === userEmail) return true;
      if (userPhone && userPhone.length > 6 && d.personalInfo.phone.replace(/[^0-9]/g, '').includes(userPhone)) return true;
      if (userFullName) {
        const dFullName = `${d.personalInfo.firstName} ${d.personalInfo.lastName}`.trim().toLowerCase();
        if (dFullName === userFullName) return true;
      }
      return false;
    });
  };

  const loginAsPilgrim = (trackingCode?: string) => {
    const code = trackingCode || 'EVA-HJ26-9284';
    const pilgrimAccount: UserAccount = {
      ...DEFAULT_PILGRIM_ACCOUNT,
      linkedTrackingCode: code,
    };
    setCurrentUser(pilgrimAccount);
    setTrackingQueryCode(code);
    setCurrentView('PILGRIM');
    return true;
  };

  const loginWithCredentials = (
    role: UserRole,
    identifier: string,
    passcode: string
  ): { success: boolean; error?: string } => {
    const idClean = identifier.trim().toLowerCase();

    // If identifier has backoffice domain, auto-switch to admin!
    if (isBackOfficeDomain(idClean)) {
      switchToBackOffice(idClean);
      return { success: true };
    }

    if (role === 'ADMIN') {
      const passClean = passcode.trim();

      // Strict validation: must be an authorized @evavoyages.com or @evavoyage.com address
      if (!isAuthorizedAdminEmail(idClean)) {
        return {
          success: false,
          error:
            "Accès strictement refusé : Seules les adresses e-mail officielles de l'agence (@evavoyage.com, @evavoyages.com ou evavoyages1@gmail.com) sont autorisées à accéder au Back-Office.",
        };
      }

      if (
        passClean === 'admin2026' ||
        passClean === 'eva2026' ||
        passClean === 'evavoyages' ||
        passClean.length >= 4
      ) {
        const adminAccount: UserAccount = {
          id: 'acc-admin-auth',
          role: 'ADMIN',
          name: idClean === 'evavoyages1@gmail.com' ? 'EVA Voyages (Direction)' : idClean.split('@')[0].toUpperCase(),
          email: idClean,
          phone: '+221 78 639 10 00',
          title: 'Directeur Général Hajj & Oumra',
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(adminAccount);
        setCurrentView('ADMIN');
        return { success: true };
      }
      return {
        success: false,
        error: 'Mot de passe administrateur incorrect (Démo: admin2026 ou eva2026).',
      };
    } else {
      const passClean = passcode.trim().toUpperCase();

      const matchingDossier = dossiers.find(
        (d) =>
          d.trackingCode.toUpperCase() === passClean ||
          d.personalInfo.email.toLowerCase() === idClean ||
          d.personalInfo.phone.replace(/[^0-9]/g, '') === identifier.replace(/[^0-9]/g, '')
      );

      const pilgrimAcc: UserAccount = matchingDossier
        ? {
            id: `acc-${matchingDossier.id}`,
            role: 'PILGRIM',
            name: `${matchingDossier.personalInfo.firstName} ${matchingDossier.personalInfo.lastName}`,
            firstName: matchingDossier.personalInfo.firstName,
            lastName: matchingDossier.personalInfo.lastName,
            email: matchingDossier.personalInfo.email,
            phone: matchingDossier.personalInfo.phone,
            title: `Pèlerin Inscrit (${matchingDossier.packageSnapshot.title})`,
            linkedTrackingCode: matchingDossier.trackingCode,
            createdAt: matchingDossier.createdAt,
          }
        : {
            id: `acc-${Date.now()}`,
            role: 'PILGRIM',
            name: identifier.split('@')[0] || 'Pèlerin Client',
            email: identifier.includes('@') ? identifier : 'client@evavoyages.sn',
            phone: identifier.includes('@') ? '+221 77 000 00 00' : identifier,
            title: 'Client EVA Voyages',
            linkedTrackingCode: passClean.startsWith('EVA-') ? passClean : undefined,
            createdAt: new Date().toISOString(),
          };

      setCurrentUser(pilgrimAcc);
      if (pilgrimAcc.linkedTrackingCode) {
        setTrackingQueryCode(pilgrimAcc.linkedTrackingCode);
      }
      setCurrentView('PILGRIM');
      return { success: true };
    }
  };

  const registerClientAccount = (
    name: string,
    email: string,
    phone?: string,
    trackingCode?: string,
    firstName?: string,
    lastName?: string
  ): UserAccount => {
    const emailClean = email.trim().toLowerCase();

    // Check if back-office domain entered (@evavoyage.com) -> auto switch!
    if (isBackOfficeDomain(emailClean)) {
      return switchToBackOffice(emailClean, name);
    }

    const cleanFirst = firstName?.trim() || name.split(' ')[0] || '';
    const cleanLast = lastName?.trim() || name.split(' ').slice(1).join(' ') || '';
    const cleanName = name?.trim() || `${cleanFirst} ${cleanLast}`.trim() || emailClean.split('@')[0];

    // Find any existing dossier for this user
    const existingDossier = dossiers.find(
      (d) =>
        (trackingCode && d.trackingCode.toUpperCase() === trackingCode.toUpperCase()) ||
        d.personalInfo.email.toLowerCase() === emailClean ||
        (phone && phone.length > 5 && d.personalInfo.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''))
    );

    const linkedCode = trackingCode || existingDossier?.trackingCode;

    const newAcc: UserAccount = {
      id: `acc-${Date.now()}`,
      role: 'PILGRIM',
      name: cleanName,
      firstName: cleanFirst,
      lastName: cleanLast,
      email: emailClean,
      phone: phone || existingDossier?.personalInfo.phone || '+221 77 000 00 00',
      title: linkedCode ? `Pèlerin Inscrit (${linkedCode})` : 'Pèlerin Client',
      linkedTrackingCode: linkedCode,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newAcc);
    if (linkedCode) {
      setTrackingQueryCode(linkedCode);
    }
    setCurrentView('PILGRIM');
    return newAcc;
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('PILGRIM');
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  };

  const updateAgencyConfig = (updates: Partial<AgencyConfig>) => {
    setAgencyConfig((prev) => ({ ...prev, ...updates }));
  };

  const formatFCFA = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const clearLiveToast = () => setRecentLiveToast(null);

  // Dispatch Notification (Both SMS and Email simulator)
  const sendNotification = (notificationData: Omit<NotificationLog, 'id' | 'sentAt' | 'status'>): NotificationLog => {
    const newNotif: NotificationLog = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
      status: 'DELIVERED',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setRecentLiveToast(newNotif);

    // Auto dismiss live toast after 7s
    setTimeout(() => {
      setRecentLiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 7000);

    return newNotif;
  };

  // Back-office Package Management
  const addPackage = (newPkg: Omit<Package, 'id'>) => {
    const id = `pkg-${Date.now()}`;
    const fullPkg: Package = { ...newPkg, id };
    setPackages((prev) => [fullPkg, ...prev]);
  };

  const updatePackage = (id: string, updates: Partial<Package>) => {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, ...updates } : pkg))
    );
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
  };

  // Dossier Registration
  const registerPilgrim = (
    data: Omit<PilgrimDossier, 'id' | 'trackingCode' | 'createdAt' | 'updatedAt'>
  ): PilgrimDossier => {
    const isHajj = data.packageSnapshot.type === 'HAJJ';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `EVA-${isHajj ? 'HJ26' : 'OU26'}-${randNum}`;
    const id = `dos-${Date.now()}`;
    const now = new Date().toISOString();

    // Determine WhatsApp group specific to this package
    const targetPkg = packages.find((p) => p.id === data.packageId);
    const whatsappGroupName =
      data.packageSnapshot.whatsappGroupName ||
      targetPkg?.whatsappGroupName ||
      `EVA Voyages - ${data.packageSnapshot.title} 🕋`;
    const whatsappGroupLink =
      data.packageSnapshot.whatsappGroupLink ||
      targetPkg?.whatsappGroupLink ||
      `https://chat.whatsapp.com/invite/EVA${isHajj ? 'Hajj2026' : 'Oumra2026'}`;
    const whatsappQrCodeUrl =
      data.packageSnapshot.whatsappQrCodeUrl ||
      targetPkg?.whatsappQrCodeUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(whatsappGroupLink)}`;

    const newDossier: PilgrimDossier = {
      ...data,
      id,
      trackingCode,
      createdAt: now,
      updatedAt: now,
      packageSnapshot: {
        ...data.packageSnapshot,
        whatsappGroupName,
        whatsappGroupLink,
        whatsappQrCodeUrl,
      },
      whatsappStatus: 'INVITATION_SENT',
      whatsappInvitedAt: now,
    };

    setDossiers((prev) => [newDossier, ...prev]);

    // Decrement package spots remaining if available
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === data.packageId && pkg.spotsRemaining > 0
          ? { ...pkg, spotsRemaining: pkg.spotsRemaining - 1 }
          : pkg
      )
    );

    // 1. Send SMS Notification with Package WhatsApp link
    sendNotification({
      dossierId: id,
      trackingCode,
      type: 'SMS',
      recipientPhone: data.personalInfo.phone,
      sender: agencyConfig.smsSenderName,
      message: `${agencyConfig.name}: Salam Alaykum ${data.personalInfo.firstName}. Inscription confirmée au ${data.packageSnapshot.title} (Code: ${trackingCode}). Rejoignez votre Groupe WhatsApp officiel: ${whatsappGroupLink}`,
      trigger: 'REGISTRATION',
    });

    // 2. Send Email Notification with WhatsApp group invite details
    sendNotification({
      dossierId: id,
      trackingCode,
      type: 'EMAIL',
      recipientEmail: data.personalInfo.email,
      sender: agencyConfig.email,
      subject: `Confirmation d'inscription & Accès Groupe WhatsApp [${trackingCode}] - ${agencyConfig.name}`,
      message: `Cher(e) pèlerin(e) ${data.personalInfo.firstName} ${data.personalInfo.lastName},\n\nNous accusons bonne réception de votre dossier d'inscription au ${data.packageSnapshot.title} (${data.packageSnapshot.season}).\n\nCode de dossier: ${trackingCode}\nPackage: ${data.packageSnapshot.title}\nMontant total: ${formatFCFA(data.payment.totalAmountFCFA)}\nStatut actuel: En attente de contrôle des pièces justificatives.\n\nGROUPE WHATSAPP OFFICIEL DU PACKAGE:\nNom du groupe: ${whatsappGroupName}\nLien d'adhésion direct: ${whatsappGroupLink}\nRejoignez dès maintenant vos compagnons de pèlerinage, guides spirituels et commission médicale pour les annonces et préparatifs.\n\nQu'Allah agrée votre intention spirituelle.\n\n${agencyConfig.name} - Service Inscriptions\n${agencyConfig.phone} | ${agencyConfig.whatsapp}`,
      trigger: 'REGISTRATION',
    });

    // 3. Dedicated WhatsApp invite alert log
    sendNotification({
      dossierId: id,
      trackingCode,
      type: 'SMS',
      recipientPhone: data.personalInfo.phone,
      sender: agencyConfig.smsSenderName,
      message: `WhatsApp EVA: Vous êtes invité(e) à rejoindre le groupe officiel "${whatsappGroupName}". Cliquez ici: ${whatsappGroupLink}`,
      trigger: 'WHATSAPP_INVITE',
    });

    return newDossier;
  };

  // WhatsApp Group actions
  const joinWhatsAppGroup = (dossierId: string) => {
    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId) {
          return {
            ...dos,
            whatsappStatus: 'JOINED',
            whatsappJoinedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return dos;
      })
    );
  };

  const toggleWhatsAppJoined = (dossierId: string, joined?: boolean) => {
    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId) {
          const isJoined = joined !== undefined ? joined : dos.whatsappStatus !== 'JOINED';
          return {
            ...dos,
            whatsappStatus: isJoined ? 'JOINED' : 'INVITATION_SENT',
            whatsappJoinedAt: isJoined ? new Date().toISOString() : undefined,
            updatedAt: new Date().toISOString(),
          };
        }
        return dos;
      })
    );
  };

  const sendWhatsAppInvitation = (dossierId: string) => {
    const dossier = dossiers.find((d) => d.id === dossierId);
    if (!dossier) return;
    const link = dossier.packageSnapshot.whatsappGroupLink || 'https://chat.whatsapp.com/invite/EVAVoyages';
    const groupName = dossier.packageSnapshot.whatsappGroupName || `Groupe EVA - ${dossier.packageSnapshot.title}`;

    sendNotification({
      dossierId: dossier.id,
      trackingCode: dossier.trackingCode,
      type: 'SMS',
      recipientPhone: dossier.personalInfo.phone,
      sender: agencyConfig.smsSenderName,
      message: `${agencyConfig.name}: Rappel d'invitation au Groupe WhatsApp "${groupName}". Rejoignez vos compagnons de voyage: ${link}`,
      trigger: 'WHATSAPP_INVITE',
    });
  };

  // Update Dossier Status
  const updateDossierStatus = (
    dossierId: string,
    newStatus: WorkflowStatus,
    extra?: {
      flightDetails?: PilgrimDossier['flightDetails'];
      trainDetails?: PilgrimDossier['trainDetails'];
      notes?: string;
    }
  ) => {
    let updatedDossier: PilgrimDossier | undefined;

    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId) {
          const updated: PilgrimDossier = {
            ...dos,
            workflowStatus: newStatus,
            updatedAt: new Date().toISOString(),
            flightDetails: extra?.flightDetails ? { ...dos.flightDetails, ...extra.flightDetails } : dos.flightDetails,
            trainDetails: extra?.trainDetails ? { ...dos.trainDetails, ...extra.trainDetails } : dos.trainDetails,
            adminNotes: extra?.notes !== undefined ? extra.notes : dos.adminNotes,
          };
          updatedDossier = updated;
          return updated;
        }
        return dos;
      })
    );

    if (!updatedDossier) return;

    // Status Notification Message Mapping
    const statusLabels: Record<WorkflowStatus, { sms: string; emailSubject: string; emailBody: string }> = {
      DOCUMENTS_PENDING: {
        sms: `${agencyConfig.name}: Votre dossier ${updatedDossier.trackingCode} est en attente de documents. Merci de télécharger votre passeport et photo sur l'application.`,
        emailSubject: `Rappel pièces justificatives [${updatedDossier.trackingCode}]`,
        emailBody: `Votre passeport biométrique ou photo d'identité est requis pour finaliser l'instruction de votre dossier de voyage.`,
      },
      UNDER_REVIEW: {
        sms: `${agencyConfig.name}: Vos documents pour le dossier ${updatedDossier.trackingCode} sont bien reçus et en cours d'examen par notre équipe.`,
        emailSubject: `Documents reçus et en cours d'examen [${updatedDossier.trackingCode}]`,
        emailBody: `Vos pièces d'identité sont actuellement examinées par notre service client pour validation.`,
      },
      DOCUMENTS_APPROVED: {
        sms: `${agencyConfig.name}: Excellente nouvelle! Vos pièces administratives sont validées pour votre pèlerinage.`,
        emailSubject: `Documents validés avec succès [${updatedDossier.trackingCode}]`,
        emailBody: `Votre dossier est désormais complet et validé. Vos réservations de vol et de transport sont en cours d'émission.`,
      },
      FLIGHT_TICKET_ISSUED: {
        sms: `${agencyConfig.name}: Vos billets d'avion (${updatedDossier.flightDetails?.airline || 'Compagnie confirmée'}, PNR: ${updatedDossier.flightDetails?.pnr || 'Confirmé'}) sont émis! Bons préparatifs.`,
        emailSubject: `Billets d'avion émis - Convocation départ [${updatedDossier.trackingCode}]`,
        emailBody: `Votre réservation aérienne avec la compagnie ${updatedDossier.flightDetails?.airline || 'partenaire'} est confirmée. Vos billets électroniques ainsi que le programme de vol sont disponibles.`,
      },
      READY_FOR_DEPARTURE: {
        sms: `${agencyConfig.name}: Votre dossier est 100% prêt! Retrait du kit pèlerin et convocation à l'aéroport disponibles sur votre espace.`,
        emailSubject: `Dossier complet & Prêt pour le grand départ! [${updatedDossier.trackingCode}]`,
        emailBody: `Votre voyage vers les Lieux Saints approche! Vos billets d'avion, réservations hôtelières et kits sont en ordre.`,
      },
      COMPLETED: {
        sms: `${agencyConfig.name}: Hajj Mabroor wa Sa'y Mashkoor! Qu'Allah agrée vos prières et votre pèlerinage.`,
        emailSubject: `Hajj Mabroor & Oumra Maqboola - ${agencyConfig.name}`,
        emailBody: `Toute l'équipe d'EVA VOYAGES vous remercie pour votre confiance et prie Allah d'agréer chaque invocation et chaque pas accompli sur cette terre sainte.`,
      },
    };

    const statusConfig = statusLabels[newStatus];
    if (statusConfig) {
      // Trigger SMS
      sendNotification({
        dossierId: updatedDossier.id,
        trackingCode: updatedDossier.trackingCode,
        type: 'SMS',
        recipientPhone: updatedDossier.personalInfo.phone,
        sender: agencyConfig.smsSenderName,
        message: statusConfig.sms,
        trigger: 'STATUS_CHANGE',
      });

      // Trigger Email
      sendNotification({
        dossierId: updatedDossier.id,
        trackingCode: updatedDossier.trackingCode,
        type: 'EMAIL',
        recipientEmail: updatedDossier.personalInfo.email,
        sender: agencyConfig.email,
        subject: `${statusConfig.emailSubject} - ${agencyConfig.name}`,
        message: `Salam Alaykum ${updatedDossier.personalInfo.firstName} ${updatedDossier.personalInfo.lastName},\n\n${statusConfig.emailBody}\n\nCode de dossier: ${updatedDossier.trackingCode}\nPour toute question, joignez notre service pèlerins au ${agencyConfig.phone} ou WhatsApp: ${agencyConfig.whatsapp}.\n\nL'équipe ${agencyConfig.name}`,
        trigger: 'STATUS_CHANGE',
      });
    }
  };

  // Upload or update document
  const updateDossierDocument = (dossierId: string, docType: DocumentType, doc: PilgrimDocument) => {
    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId) {
          const updatedDocs = { ...dos.documents, [docType]: doc };
          return {
            ...dos,
            documents: updatedDocs,
            workflowStatus: dos.workflowStatus === 'DOCUMENTS_PENDING' ? 'UNDER_REVIEW' : dos.workflowStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return dos;
      })
    );
  };

  // Admin Review Document
  const reviewDocument = (dossierId: string, docType: DocumentType, approved: boolean, reason?: string) => {
    let targetDossier: PilgrimDossier | undefined;

    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId) {
          const currentDoc = dos.documents[docType];
          if (!currentDoc) return dos;

          const updatedDoc: PilgrimDocument = {
            ...currentDoc,
            status: approved ? 'APPROVED' : 'REJECTED',
            rejectionReason: approved ? undefined : reason || 'Document non conforme ou illisible',
            verifiedAt: new Date().toISOString(),
          };

          const newDocs = { ...dos.documents, [docType]: updatedDoc };

          // Check if all core documents (passport and photo) are approved
          const hasPassport = newDocs.passport?.status === 'APPROVED';
          const hasPhoto = newDocs.photo?.status === 'APPROVED';
          const allDocsOk = hasPassport && hasPhoto;

          let newStatus = dos.workflowStatus;
          if (allDocsOk && (dos.workflowStatus === 'UNDER_REVIEW' || dos.workflowStatus === 'DOCUMENTS_PENDING')) {
            newStatus = 'DOCUMENTS_APPROVED';
          } else if (!approved) {
            newStatus = 'DOCUMENTS_PENDING';
          }

          targetDossier = {
            ...dos,
            documents: newDocs,
            workflowStatus: newStatus,
            updatedAt: new Date().toISOString(),
          };

          return targetDossier;
        }
        return dos;
      })
    );

    if (!targetDossier) return;

    if (!approved) {
      sendNotification({
        dossierId,
        trackingCode: targetDossier.trackingCode,
        type: 'SMS',
        recipientPhone: targetDossier.personalInfo.phone,
        sender: agencyConfig.smsSenderName,
        message: `${agencyConfig.name}: Votre document (${docType.toUpperCase()}) a été rejeté: ${reason || 'Pièce illisible'}. Veuillez le recharger dans votre espace.`,
        trigger: 'STATUS_CHANGE',
      });
    }
  };

  const updateDossier = (dossierId: string, updates: Partial<PilgrimDossier>) => {
    setDossiers((prev) =>
      prev.map((dos) => (dos.id === dossierId ? { ...dos, ...updates, updatedAt: new Date().toISOString() } : dos))
    );
  };

  // Payment Processing (Wave / Orange Money)
  const processPayment = ({
    dossierId,
    amountFCFA,
    method,
    paymentType,
    phone,
    reference,
  }: {
    dossierId: string;
    amountFCFA: number;
    method: PaymentMethod;
    paymentType?: 'DEPOSIT' | 'FULL' | 'BALANCE';
    phone: string;
    reference?: string;
  }): { success: boolean; transaction: Transaction; receiptNumber: string } => {
    const timestamp = Date.now();
    const prefix = method === 'WAVE' ? 'WAV-SN' : 'OM-SN';
    const genRef = reference || `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = `REC-EVA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction: Transaction = {
      id: `tx-${timestamp}`,
      dossierId,
      date: new Date().toISOString(),
      amountFCFA,
      method,
      paymentType: paymentType || 'DEPOSIT',
      reference: genRef,
      phone,
      status: 'COMPLETED',
      receiptNumber,
      operatorNotes: `Transaction validée avec succès via le passerelle ${method === 'WAVE' ? 'Wave Sénégal/UEMOA' : 'Orange Money API'}.`,
    };

    let targetDossier: PilgrimDossier | undefined;

    setDossiers((prev) =>
      prev.map((dos) => {
        if (dos.id === dossierId) {
          const newAmountPaid = dos.payment.amountPaidFCFA + amountFCFA;
          const remaining = Math.max(0, dos.payment.totalAmountFCFA - newAmountPaid);
          const paymentStatus: PilgrimDossier['payment']['paymentStatus'] =
            remaining === 0 ? 'PAID' : newAmountPaid > 0 ? 'PARTIAL' : 'UNPAID';

          targetDossier = {
            ...dos,
            payment: {
              ...dos.payment,
              amountPaidFCFA: newAmountPaid,
              remainingBalanceFCFA: remaining,
              paymentStatus,
              transactions: [transaction, ...dos.payment.transactions],
            },
            updatedAt: new Date().toISOString(),
          };
          return targetDossier;
        }
        return dos;
      })
    );

    const dossier = targetDossier || dossiers.find((d) => d.id === dossierId);
    const tracking = dossier ? dossier.trackingCode : 'EVA-XXXX';
    const pilgrimName = dossier ? `${dossier.personalInfo.firstName} ${dossier.personalInfo.lastName}` : 'Pèlerin';
    const remainingAfter = dossier ? Math.max(0, dossier.payment.totalAmountFCFA - (dossier.payment.amountPaidFCFA + amountFCFA)) : 0;

    // Send Automatic SMS confirmation
    sendNotification({
      dossierId,
      trackingCode: tracking,
      type: 'SMS',
      recipientPhone: phone || dossier?.personalInfo.phone,
      sender: agencyConfig.smsSenderName,
      message: `${agencyConfig.name}: Paiement ${method === 'WAVE' ? 'Wave' : 'Orange Money'} de ${formatFCFA(amountFCFA)} reçu avec succès. Réf: ${genRef}. Reçu: ${receiptNumber}. Reste à payer: ${formatFCFA(remainingAfter)}.`,
      trigger: 'PAYMENT',
    });

    // Send Automatic Email confirmation with printable receipt
    if (dossier?.personalInfo.email) {
      sendNotification({
        dossierId,
        trackingCode: tracking,
        type: 'EMAIL',
        recipientEmail: dossier.personalInfo.email,
        sender: agencyConfig.email,
        subject: `Reçu officiel de paiement [${receiptNumber}] - ${agencyConfig.name}`,
        message: `Salam Alaykum ${pilgrimName},\n\nNous confirmons la réception effective de votre règlement de ${formatFCFA(amountFCFA)} par ${method === 'WAVE' ? 'Wave Mobile' : 'Orange Money'}.\n\nNuméro de reçu: ${receiptNumber}\nRéférence opérateur: ${genRef}\nDossier: ${tracking}\nPackage: ${dossier.packageSnapshot.title}\nMontant encaissé: ${formatFCFA(amountFCFA)}\nReste à solder: ${formatFCFA(remainingAfter)}\n\nVotre reçu officiel est téléchargeable sur votre espace de suivi.\n\n${agencyConfig.name}\n${agencyConfig.phone} | ${agencyConfig.address}`,
        trigger: 'PAYMENT',
      });
    }

    return { success: true, transaction, receiptNumber };
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        pilgrimActiveTab,
        setPilgrimActiveTab,
        adminActiveTab,
        setAdminActiveTab,
        selectedPackageId,
        setSelectedPackageId,
        selectedDossierId,
        setSelectedDossierId,
        trackingQueryCode,
        setTrackingQueryCode,
        agencyConfig,
        updateAgencyConfig,
        packages,
        dossiers,
        notifications,
        addPackage,
        updatePackage,
        deletePackage,
        registerPilgrim,
        updateDossierStatus,
        updateDossierDocument,
        reviewDocument,
        updateDossier,
        joinWhatsAppGroup,
        toggleWhatsAppJoined,
        sendWhatsAppInvitation,
        processPayment,
        sendNotification,
        recentLiveToast,
        clearLiveToast,
        formatFCFA,
        currentUser,
        loginAsAdmin,
        loginAsPilgrim,
        loginWithCredentials,
        registerClientAccount,
        switchToBackOffice,
        isBackOfficeDomain,
        getMyDossier,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalRole,
        setAuthModalRole,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        navigateToSpace,
        badgeSettings,
        updateBadgeSettings,
        updateDossierBadgeSettings,
        applyBadgeHotelsToAll,
        applyBadgeHotelsToDossiers,
        isAuthorizedAdminEmail,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
