/**
 * Public Exchange Rate Utility for SAR (Saudi Riyal) to XOF (Franc CFA)
 * Supports live API updates, fallback endpoints, and persistent local storage
 * for zero-connectivity offline operation during pilgrimage.
 */

const STORAGE_KEY_RATE = 'eva_cached_sar_xof_rate';
const STORAGE_KEY_TIMESTAMP = 'eva_cached_sar_xof_time';
const DEFAULT_FALLBACK_RATE = 155.75; // 1 SAR ~ 155.75 FCFA

export interface ExchangeRateResult {
  rate: number;
  lastUpdated: string;
  isLive: boolean;
  source: 'API' | 'CACHE' | 'FALLBACK';
}

/**
 * Fetch latest SAR to XOF exchange rate from public API
 */
export async function fetchSarToXofRate(): Promise<ExchangeRateResult> {
  // 1. Try primary public open API (No API key needed)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://open.er-api.com/v6/latest/SAR', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates.XOF === 'number') {
        const rate = data.rates.XOF;
        const lastUpdated = data.time_last_update_utc || new Date().toISOString();

        // Save to cache
        try {
          localStorage.setItem(STORAGE_KEY_RATE, String(rate));
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, lastUpdated);
        } catch {
          // ignore storage error
        }

        return {
          rate,
          lastUpdated,
          isLive: true,
          source: 'API',
        };
      }
    }
  } catch (err) {
    console.warn('Primary exchange API unreachable, trying fallback...', err);
  }

  // 2. Try secondary fallback public API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch('https://api.exchangerate-api.com/v4/latest/SAR', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates.XOF === 'number') {
        const rate = data.rates.XOF;
        const lastUpdated = data.date || new Date().toISOString();

        try {
          localStorage.setItem(STORAGE_KEY_RATE, String(rate));
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, lastUpdated);
        } catch {
          // ignore
        }

        return {
          rate,
          lastUpdated,
          isLive: true,
          source: 'API',
        };
      }
    }
  } catch (err) {
    console.warn('Secondary exchange API unreachable', err);
  }

  // 3. Fallback to cached rate if available
  try {
    const cachedRate = localStorage.getItem(STORAGE_KEY_RATE);
    const cachedTime = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    if (cachedRate) {
      const parsedRate = parseFloat(cachedRate);
      if (!isNaN(parsedRate) && parsedRate > 50 && parsedRate < 300) {
        return {
          rate: parsedRate,
          lastUpdated: cachedTime || 'Données sauvegardées en local',
          isLive: false,
          source: 'CACHE',
        };
      }
    }
  } catch {
    // ignore
  }

  // 4. Default guaranteed fallback
  return {
    rate: DEFAULT_FALLBACK_RATE,
    lastUpdated: 'Taux indicatif standard',
    isLive: false,
    source: 'FALLBACK',
  };
}

/**
 * Format currency amounts nicely
 */
export function formatCurrencyCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' FCFA';
}

export function formatCurrencySAR(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' SAR';
}

/**
 * Common pilgrim expense presets in Saudi Arabia
 */
export interface PilgrimExpensePreset {
  id: string;
  name: string;
  icon: string;
  category: 'REPAS' | 'TRANSPORT' | 'TELECOM' | 'RELIGIEUX' | 'SOUVENIR';
  sarAmount: number;
  description: string;
}

export const PILGRIM_EXPENSE_PRESETS: PilgrimExpensePreset[] = [
  {
    id: 'meal_standard',
    name: 'Repas chaud (Kabsa / Shawarma)',
    icon: '🍛',
    category: 'REPAS',
    sarAmount: 20,
    description: 'Plat de riz parfumé et poulet rôti ou sandwich copieux proche hôtel',
  },
  {
    id: 'tea_coffee',
    name: 'Thé chaï / Café & Naan chaud',
    icon: '☕',
    category: 'REPAS',
    sarAmount: 5,
    description: 'Boisson chaude traditionnelle et pain naan frais du matin',
  },
  {
    id: 'taxi_short',
    name: 'Course Taxi local Haram',
    icon: '🚕',
    category: 'TRANSPORT',
    sarAmount: 30,
    description: 'Trajet urbain moyen entre Aziziyah / Shisha et l\'enceinte sacrée',
  },
  {
    id: 'sim_card',
    name: 'Puce SIM 5G Saoudienne (STC / Mobily)',
    icon: '📱',
    category: 'TELECOM',
    sarAmount: 70,
    description: 'Forfait pèlerin data 10 Go + appels locaux et internationaux',
  },
  {
    id: 'zamzam_bottle',
    name: 'Bouteille Zamzam 5L emballage aéroport',
    icon: '💧',
    category: 'RELIGIEUX',
    sarAmount: 12.5,
    description: 'Tarif officiel Projet Roi Abdullah à l\'aéroport de Jeddah/Médine',
  },
  {
    id: 'ihram_cloth',
    name: 'Tenue d\'Ihram 2 pièces coton pur',
    icon: '👔',
    category: 'RELIGIEUX',
    sarAmount: 50,
    description: 'Deux pièces de tissu blanc sans couture pour homme avec ceinture',
  },
  {
    id: 'hady_sacrifice',
    name: 'Sacrifice du Hajj (Hady / Mouton officiel)',
    icon: '🐑',
    category: 'RELIGIEUX',
    sarAmount: 850,
    description: 'Coupon officiel Adahi pour le sacrifice rituel du jour de l\'Aïd',
  },
  {
    id: 'dates_ajwa',
    name: 'Dattes Ajwa de Médine (1 kg de luxe)',
    icon: '🌴',
    category: 'SOUVENIR',
    sarAmount: 80,
    description: 'Dattes nobles bénies de Médine recommandées par la Sunnah',
  },
];
