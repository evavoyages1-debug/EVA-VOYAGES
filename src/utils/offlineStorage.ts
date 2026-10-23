import { PilgrimDossier } from '../types';

const OFFLINE_DOSSIERS_KEY = 'eva_offline_dossiers_v1';
const OFFLINE_QURAN_FAVORITES_KEY = 'eva_offline_quran_favorites_v1';
const OFFLINE_LAST_SYNC_KEY = 'eva_offline_last_sync_timestamp';

/**
 * Cache pilgrim dossiers in persistent browser storage for zero-connectivity access
 */
export function cacheDossierForOffline(dossier: PilgrimDossier): void {
  try {
    const existing = getOfflineDossiers();
    const index = existing.findIndex((d) => d.id === dossier.id || d.trackingCode === dossier.trackingCode);
    if (index >= 0) {
      existing[index] = dossier;
    } else {
      existing.push(dossier);
    }
    localStorage.setItem(OFFLINE_DOSSIERS_KEY, JSON.stringify(existing));
    localStorage.setItem(OFFLINE_LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to cache dossier offline:', err);
  }
}

/**
 * Bulk cache all available dossiers into local offline storage
 */
export function cacheAllDossiersOffline(dossiers: PilgrimDossier[]): void {
  try {
    localStorage.setItem(OFFLINE_DOSSIERS_KEY, JSON.stringify(dossiers));
    localStorage.setItem(OFFLINE_LAST_SYNC_KEY, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to bulk cache dossiers:', err);
  }
}

/**
 * Retrieve cached dossiers from local offline storage
 */
export function getOfflineDossiers(): PilgrimDossier[] {
  try {
    const data = localStorage.getItem(OFFLINE_DOSSIERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Failed to read offline dossiers:', err);
    return [];
  }
}

/**
 * Find a specific dossier from offline storage by trackingCode or ID
 */
export function getOfflineDossierByCode(code: string): PilgrimDossier | null {
  const all = getOfflineDossiers();
  const normalized = code.trim().toUpperCase();
  return (
    all.find(
      (d) =>
        d.trackingCode.toUpperCase() === normalized ||
        d.id === code ||
        d.personalInfo.passportNumber.toUpperCase() === normalized
    ) || null
  );
}

/**
 * Get the last offline synchronization timestamp
 */
export function getOfflineLastSync(): string | null {
  try {
    return localStorage.getItem(OFFLINE_LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

/**
 * Check if a dossier has its travel documents (ticket and visa) ready offline
 */
export function isTravelDocsOfflineReady(dossier: PilgrimDossier): {
  hasTicket: boolean;
  hasVisa: boolean;
  isReady: boolean;
} {
  const hasTicket = !!(
    dossier.flightDetails &&
    (dossier.flightDetails.status === 'ISSUED' || !!dossier.flightDetails.flightNumber)
  );
  const hasVisa = !!(dossier.visaDetails && !!dossier.visaDetails.visaNumber);
  return {
    hasTicket,
    hasVisa,
    isReady: hasTicket || hasVisa,
  };
}
