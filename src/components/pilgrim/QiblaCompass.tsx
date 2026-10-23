import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  LocateFixed,
  ChevronDown,
  Volume2,
  Share2,
} from 'lucide-react';

// Coordinates of the Holy Kaaba in Makkah al-Mukarramah
const MAKKAH_COORDS = {
  lat: 21.422487,
  lng: 39.826206,
};

// Preset cities with predefined Qibla bearings and distances
interface PresetCity {
  name: string;
  country: string;
  lat: number;
  lng: number;
  flag: string;
}

const PRESET_CITIES: PresetCity[] = [
  { name: 'Dakar', country: 'Sénégal', lat: 14.6928, lng: -17.4467, flag: '🇸🇳' },
  { name: 'Touba', country: 'Sénégal', lat: 14.8667, lng: -15.8833, flag: '🇸🇳' },
  { name: 'Saint-Louis', country: 'Sénégal', lat: 16.0326, lng: -16.4818, flag: '🇸🇳' },
  { name: 'Thiès', country: 'Sénégal', lat: 14.7910, lng: -16.9359, flag: '🇸🇳' },
  { name: 'Ziguinchor', country: 'Sénégal', lat: 12.5833, lng: -16.2719, flag: '🇸🇳' },
  { name: 'Abidjan', country: 'Côte d\'Ivoire', lat: 5.3600, lng: -4.0083, flag: '🇨🇮' },
  { name: 'Bamako', country: 'Mali', lat: 12.6392, lng: -8.0029, flag: '🇲🇱' },
  { name: 'Conakry', country: 'Guinée', lat: 9.6412, lng: -13.5784, flag: '🇬🇳' },
  { name: 'Nouakchott', country: 'Mauritanie', lat: 18.0735, lng: -15.9582, flag: '🇲🇷' },
  { name: 'Niamey', country: 'Niger', lat: 13.5126, lng: 2.1126, flag: '🇳🇪' },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, flag: '🇫🇷' },
  { name: 'Casablanca', country: 'Maroc', lat: 33.5731, lng: -7.5898, flag: '🇲🇦' },
  { name: 'Médine (Al Madinah)', country: 'Arabie Saoudite', lat: 24.5247, lng: 39.5692, flag: '🇸🇦' },
  { name: 'Djeddah (Jeddah)', country: 'Arabie Saoudite', lat: 21.5433, lng: 39.1728, flag: '🇸🇦' },
];

/**
 * Calculates Great-circle Qibla bearing from user coordinates to the Kaaba
 */
const calculateQiblaBearing = (lat: number, lng: number): number => {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (MAKKAH_COORDS.lat * Math.PI) / 180;
  const deltaLambda = ((MAKKAH_COORDS.lng - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.tan(phi2) -
    Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;
  return Math.round(qibla * 10) / 10;
};

/**
 * Calculates distance to Makkah in kilometers (Haversine formula)
 */
const calculateDistanceKm = (lat: number, lng: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((MAKKAH_COORDS.lat - lat) * Math.PI) / 180;
  const dLon = ((MAKKAH_COORDS.lng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((MAKKAH_COORDS.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const QiblaCompass: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<PresetCity>(PRESET_CITIES[0]); // Default Dakar
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Compass orientation
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);

  // Manual dial adjustment (for desktop or when sensor unavailable)
  const [manualDialAngle, setManualDialAngle] = useState<number>(0);

  const activeLat = userLocation ? userLocation.lat : selectedCity.lat;
  const activeLng = userLocation ? userLocation.lng : selectedCity.lng;
  const activeLocationName = userLocation ? userLocation.name : `${selectedCity.name}, ${selectedCity.country}`;

  const qiblaAngle = calculateQiblaBearing(activeLat, activeLng);
  const distanceKm = calculateDistanceKm(activeLat, activeLng);

  // Difference between current heading and Qibla
  const currentHeading = hasCompassSensor ? deviceHeading : manualDialAngle;
  const diffAngle = Math.abs((currentHeading - qiblaAngle + 360) % 360);
  const isAligned = diffAngle <= 6 || diffAngle >= 354;

  // Listen to device orientation if available on smartphones
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is available on iOS Safari
      // alpha is available on Android Chrome
      let heading: number | null = null;

      if ((e as any).webkitCompassHeading !== undefined && (e as any).webkitCompassHeading !== null) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null) {
        // On Android, alpha 0 points to north with absolute=true
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        setHasCompassSensor(true);
        setDeviceHeading(Math.round(heading));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Request iOS motion permissions
  const requestCompassPermission = async () => {
    setPermissionRequested(true);
    if (
      typeof (DeviceOrientationEvent as any) !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setHasCompassSensor(true);
        } else {
          setLocationError('Permission capteur d\'orientation refusée.');
        }
      } catch (err) {
        console.error('Permission error', err);
      }
    }
  };

  // Browser Geolocation
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par votre navigateur.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Votre Position GPS Actuelle',
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error', err);
        setLocationError('Impossible de récupérer la position GPS. Ville par défaut activée.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {/* Header Banner with Kaaba & Arabesque Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c3f74] via-[#135ca5] to-[#072545] text-white p-6 sm:p-8 shadow-xl border border-blue-900/50">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:block opacity-25 hover:opacity-40 transition-opacity">
          <img
            src="/assets/kaaba_badge_bg.jpg"
            alt="Kaaba Makkah"
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="relative z-10 max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#f15a24] text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Direction Sainte de Makkah
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Boussole Qibla Intéractive & Précise
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Orientez-vous avec précision vers la Sainte Kaaba pour vos prières quotidiennes. Calibrée pour le Sénégal, l'Afrique de l'Ouest et tous vos déplacements.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-blue-200">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <span>🕋 Angle Qibla : {qiblaAngle}°</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              <span>Distance Kaaba : {distanceKm.toLocaleString('fr-FR')} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location selector & GPS toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#135ca5] flex items-center justify-center shrink-0 border border-blue-100">
            <MapPin className="w-5 h-5 text-[#f15a24]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Emplacement Actuel
            </span>
            <span className="text-sm font-black text-stone-900 block">
              {activeLocationName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset selector */}
          <div className="relative">
            <select
              value={userLocation ? 'GPS' : selectedCity.name}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== 'GPS') {
                  const c = PRESET_CITIES.find((x) => x.name === val);
                  if (c) {
                    setSelectedCity(c);
                    setUserLocation(null);
                  }
                }
              }}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-stone-300 bg-stone-50 font-bold text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#135ca5] cursor-pointer"
            >
              {userLocation && <option value="GPS">📍 Position GPS Détectée</option>}
              {PRESET_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name} ({c.country})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* GPS Auto-detect button */}
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="px-3.5 py-2 rounded-xl bg-[#135ca5] hover:bg-[#0c3f74] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Ma Position GPS</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Main Interactive Compass Display */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        {/* Alignment Success Banner */}
        <div
          className={`px-5 py-2 rounded-full text-xs font-black flex items-center gap-2 transition-all duration-300 ${
            isAligned
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/30 scale-105 animate-pulse'
              : 'bg-stone-100 text-stone-600 border border-stone-200'
          }`}
        >
          {isAligned ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>VOUS FAITES EXACTEMENT FACE À LA KAABA ! ✨</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-[#f15a24]" />
              <span>
                Pivotez de {Math.round(diffAngle)}° pour vous aligner vers la Kaaba ({qiblaAngle}°)
              </span>
            </>
          )}
        </div>

        {/* Compass Dial Outer Ring */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 rounded-full border-4 border-amber-400/40 p-3 bg-gradient-to-b from-stone-50 via-white to-stone-100 shadow-2xl flex items-center justify-center">
          {/* Subtle Arabesque Decorative Rim */}
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#135ca5]/20 pointer-events-none" />

          {/* Compass Dial Face with Numbers & Cardinal Points */}
          <div
            className="w-full h-full rounded-full relative transition-transform duration-300 ease-out flex items-center justify-center"
            style={{
              transform: `rotate(${-currentHeading}deg)`,
            }}
          >
            {/* Cardinal Markers */}
            <span className="absolute top-2 font-black text-sm text-red-600 font-mono">N</span>
            <span className="absolute right-2 font-black text-xs text-stone-600 font-mono">E</span>
            <span className="absolute bottom-2 font-black text-xs text-stone-600 font-mono">S</span>
            <span className="absolute left-2 font-black text-xs text-stone-600 font-mono">O</span>

            {/* Intermediate Ticks (every 30 deg) */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-full h-full pointer-events-none flex justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className={`w-0.5 rounded-full ${
                    deg % 90 === 0
                      ? 'h-3.5 bg-stone-700'
                      : deg % 30 === 0
                      ? 'h-2 bg-stone-300'
                      : 'h-1 bg-stone-200'
                  }`}
                />
              </div>
            ))}

            {/* The Qibla Pointer on the Rotating Dial */}
            <div
              className="absolute w-full h-full pointer-events-none flex flex-col items-center"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              {/* Kaaba Golden Badge at Qibla Bearing */}
              <div className="absolute -top-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-slate-950 p-1 shadow-lg border-2 border-amber-400 flex items-center justify-center animate-bounce">
                  <img
                    src="/assets/kaaba_badge_bg.jpg"
                    alt="Kaaba Direction"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-300 mt-0.5 shadow-2xs">
                  Qibla {qiblaAngle}°
                </span>
              </div>

              {/* Glowing Arrow line pointing directly to Kaaba */}
              <div className="w-1 bg-gradient-to-b from-amber-500 via-amber-400 to-transparent h-28 rounded-full shadow-md mt-7" />
            </div>

            {/* Compass Center Medallion */}
            <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-amber-400/80 shadow-inner flex flex-col items-center justify-center text-white z-10">
              <span className="font-amiri text-amber-300 text-lg font-bold leading-none">
                القبلة
              </span>
              <span className="font-mono text-[10px] font-bold text-amber-200 mt-0.5">
                {qiblaAngle}°
              </span>
            </div>
          </div>

          {/* Fixed Needle Pointer representing Phone/User Facing Direction */}
          <div className="absolute -top-4 w-6 h-6 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#f15a24] filter drop-shadow-md" />
          </div>
        </div>

        {/* Sensor info & Manual control */}
        <div className="space-y-3 max-w-md">
          {hasCompassSensor ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Capteur gyroscopique actif : tournez votre smartphone en temps réel</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
                <Info className="w-3.5 h-3.5 text-stone-500" />
                <span>Réglez l'orientation manuellement si le capteur est inactif :</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={manualDialAngle}
                  onChange={(e) => setManualDialAngle(Number(e.target.value))}
                  className="w-48 accent-[#135ca5]"
                />
                <span className="text-xs font-mono font-bold text-stone-800 w-10">
                  {manualDialAngle}°
                </span>
              </div>
              {!permissionRequested && (
                <button
                  type="button"
                  onClick={requestCompassPermission}
                  className="text-xs font-bold text-[#135ca5] underline hover:text-[#0c3f74] block mx-auto cursor-pointer"
                >
                  Activer la boussole mobile automatique
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Islamic Prayers & Invocations upon facing Qibla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Niyyah & Invocations */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
              ١
            </span>
            <h3 className="font-bold text-stone-900 text-sm">
              Invocation avant l'accomplissement de la Salât
            </h3>
          </div>

          <p className="font-amiri text-lg text-right text-stone-900 leading-relaxed font-bold">
            وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالأَرْضَ حَنِيفاً وَمَا أَنَاْ مِنَ الْمُشْرِكِينَ
          </p>

          <p className="text-xs text-stone-600 italic">
            "Wajjahtu wajhiya lilladhee fatara as-samawati wal-arda haneefan wa ma ana mina al-mushrikeen."
          </p>

          <p className="text-xs text-stone-500">
            « Je tourne mon visage vers Celui qui a créé les cieux et la terre, en pur monothéiste, et je ne suis point du nombre des associateurs. » (Sourate Al-An'am)
          </p>
        </div>

        {/* Card 2: Hadith & Spiritual reminder */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#135ca5] font-bold flex items-center justify-center text-xs">
              ٢
            </span>
            <h3 className="font-bold text-stone-900 text-sm">
              L'Orientation vers la Kaaba selon la Sunnah
            </h3>
          </div>

          <p className="font-amiri text-lg text-right text-stone-900 leading-relaxed font-bold">
            مَا بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ قِبْلَةٌ
          </p>

          <p className="text-xs text-stone-600 italic">
            "Ma bayna al-mashriqi wal-maghribi qiblah." (Rapporté par At-Tirmidhi)
          </p>

          <p className="text-xs text-stone-500">
            Le Prophète ﷺ a enseigné que pour celui qui cherche la Kaaba, l'orientation sincère et l'effort d'alignement valident la prière. Qu'Allah accepte vos dévotions.
          </p>
        </div>
      </div>
    </div>
  );
};
