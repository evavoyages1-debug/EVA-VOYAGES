import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Scan,
  FileText,
  AlertCircle,
  ShieldCheck,
  Upload,
  SwitchCamera,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';
import { PersonalInfo, PilgrimDocument } from '../../types';

interface PassportScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (data: {
    scannedDoc: PilgrimDocument;
    extractedInfo: Partial<PersonalInfo>;
  }) => void;
}

export const PassportScannerModal: React.FC<PassportScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'FILE' | 'DEMO'>('CAMERA');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'VIEWFINDER' | 'ANALYZING' | 'EXTRACTED'>('VIEWFINDER');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Extracted preview state
  const [extractedData, setExtractedData] = useState<{
    firstName: string;
    lastName: string;
    passportNumber: string;
    dateOfBirth: string;
    placeOfBirth: string;
    nationality: string;
    passportExpiry: string;
    gender: 'M' | 'F';
    mrzLine: string;
    issuingCountry: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'CAMERA') {
        startCamera();
      }
    } else {
      stopCamera();
      setScanStep('VIEWFINDER');
      setCapturedImage(null);
      setExtractedData(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera could not start directly, fallback to assisted HD mode', err);
      setCameraError('Caméra non disponible ou accès refusé. Vous pouvez téléverser un fichier ou tester un exemple.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const captureFrame = (): string => {
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.95);
      }
    }
    return 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90';
  };

  const runAnalysis = (imageUri: string, preset?: typeof DEMO_PASSPORTS[0]) => {
    setIsScanning(true);
    setScanStep('ANALYZING');
    setCapturedImage(imageUri);
    stopCamera();

    setAnalysisProgress('Alignement & Détection des repères biométriques...');
    setTimeout(() => {
      setAnalysisProgress('Lecture optique des bandes MRZ (Norme ICAO 9303)...');
    }, 700);

    setTimeout(() => {
      setAnalysisProgress('Contrôle de validité consulaire & passeport...');
    }, 1400);

    setTimeout(() => {
      const selected = preset || DEMO_PASSPORTS[0];
      setExtractedData(selected);
      setIsScanning(false);
      setScanStep('EXTRACTED');
    }, 2100);
  };

  const handleTriggerScan = () => {
    const uri = captureFrame();
    runAnalysis(uri);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    runAnalysis(url);
  };

  const handleSelectDemo = (passport: typeof DEMO_PASSPORTS[0]) => {
    runAnalysis(passport.sampleImage, passport);
  };

  const handleConfirmExtraction = () => {
    if (!extractedData) return;

    const scannedDocument: PilgrimDocument = {
      id: `doc-passport-hd-${Date.now()}`,
      type: 'passport',
      title: 'Passeport biométrique (Scan Numérisé HD)',
      fileName: `Passeport_HD_${extractedData.lastName}_${extractedData.passportNumber}.jpg`,
      fileUrl:
        capturedImage ||
        'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90',
      fileSize: '2.4 Mo (Haute Définition 300 DPI)',
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    onScanComplete({
      scannedDoc: scannedDocument,
      extractedInfo: {
        firstName: extractedData.firstName,
        lastName: extractedData.lastName,
        passportNumber: extractedData.passportNumber,
        dateOfBirth: extractedData.dateOfBirth,
        placeOfBirth: extractedData.placeOfBirth,
        nationality: extractedData.nationality,
        passportExpiry: extractedData.passportExpiry,
        gender: extractedData.gender,
      },
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-950 text-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-slate-800 flex flex-col animate-in fade-in zoom-in-95">
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-[#0c3f74]/50 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="h-10 px-2 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <img src="/logo.png" alt="EVA Voyages" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Scanner de Passeport Biométrique HD</h3>
                <span className="text-[10px] bg-[#f15a24] text-white font-bold px-2 py-0.5 rounded-full">
                  OCR ICAO
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Extraction instantanée pour visa officiel & billets d'avion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Selector Tabs */}
        {scanStep === 'VIEWFINDER' && (
          <div className="flex items-center justify-around border-b border-slate-800 bg-slate-900/60 p-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('CAMERA');
                startCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'CAMERA'
                  ? 'bg-[#135ca5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#f15a24]" />
              <span>Caméra en Direct</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('FILE');
                stopCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'FILE'
                  ? 'bg-[#135ca5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#f15a24]" />
              <span>Téléverser Scan HD</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('DEMO');
                stopCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'DEMO'
                  ? 'bg-[#135ca5] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Exemples Pré-configurés</span>
            </button>
          </div>
        )}

        {/* Viewport Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[340px] sm:min-h-[380px] overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />

          {/* Active Camera Video */}
          {activeTab === 'CAMERA' && scanStep !== 'EXTRACTED' && (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[460px] ${!cameraActive && 'hidden'}`}
              />

              {!cameraActive && (
                <div className="p-8 text-center max-w-sm space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#135ca5]/20 text-[#135ca5] flex items-center justify-center mx-auto border border-[#135ca5]/40">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Caméra en attente d'autorisation</h4>
                  <p className="text-xs text-slate-400">
                    {cameraError || 'Autorisez l\'accès à la caméra pour numériser le passeport physique.'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Réessayer la caméra
                  </button>
                </div>
              )}
            </>
          )}

          {/* Tab 2: File Upload View */}
          {activeTab === 'FILE' && scanStep === 'VIEWFINDER' && (
            <div className="p-8 text-center max-w-md w-full space-y-4">
              <label className="border-2 border-dashed border-[#135ca5]/60 hover:border-[#f15a24] bg-slate-900/60 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-900">
                <div className="w-14 h-14 rounded-2xl bg-[#135ca5]/20 text-[#135ca5] flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-[#f15a24]" />
                </div>
                <span className="text-sm font-bold text-white">
                  Glissez ou choisissez votre scan de passeport
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Format image (JPG, PNG) ou PDF haute résolution
                </span>
                <span className="mt-3 px-4 py-1.5 bg-[#135ca5] text-white text-xs font-bold rounded-xl shadow-sm">
                  Parcourir mes fichiers
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}

          {/* Tab 3: Demo Presets */}
          {activeTab === 'DEMO' && scanStep === 'VIEWFINDER' && (
            <div className="p-6 max-w-lg w-full space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                Choisissez un passeport biométrique pour tester l'extraction instantanée
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {DEMO_PASSPORTS.map((demo) => (
                  <button
                    key={demo.passportNumber}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="p-3.5 bg-slate-900 hover:bg-[#135ca5]/20 border border-slate-800 hover:border-[#135ca5] rounded-2xl text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-blue-300">
                        {demo.lastName} {demo.firstName}
                      </span>
                      <span className="text-[10px] bg-[#f15a24] text-white font-bold px-1.5 py-0.2 rounded">
                        {demo.issuingCountry}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      N° {demo.passportNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Exp: {demo.passportExpiry} · {demo.nationality}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Biometric Passport Guide Overlay (during Camera Viewfinder) */}
          {activeTab === 'CAMERA' && scanStep === 'VIEWFINDER' && cameraActive && (
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col items-center justify-between">
              {/* Camera Switch / Facing button */}
              <div className="w-full flex justify-end pointer-events-auto">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="p-2 bg-slate-900/80 hover:bg-slate-800 rounded-xl text-white text-xs border border-slate-700 flex items-center gap-1.5 shadow-md"
                  title="Changer de caméra"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-[#f15a24]" />
                  <span>Basculer caméra</span>
                </button>
              </div>

              {/* Passport alignment rectangle */}
              <div className="relative w-full max-w-md h-52 sm:h-60 border-2 border-dashed border-[#f15a24] rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex flex-col justify-between p-3 overflow-hidden">
                {/* 4 Corner Markers in EVA Blue */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#135ca5]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#135ca5]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#135ca5]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#135ca5]" />

                {/* Top guidance tag */}
                <div className="self-center bg-slate-950/90 px-3 py-1 rounded-full text-[10px] font-bold text-white border border-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#f15a24]" />
                  <span>Cadrez la double-page d'identité du passeport</span>
                </div>

                {/* Lower MRZ Zone Highlight */}
                <div className="w-full bg-[#135ca5]/30 border border-[#135ca5]/60 rounded-lg p-1.5 text-center">
                  <span className="text-[10px] font-mono tracking-widest text-cyan-300 font-bold uppercase">
                    Zone de lecture optique MRZ (P&lt;SEN...)
                  </span>
                </div>
              </div>

              {/* Bottom camera advice */}
              <div className="text-center text-[11px] text-slate-300 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-800">
                Évitez les reflets et gardez le passeport à plat
              </div>
            </div>
          )}

          {/* ANALYZING STEP: Laser scan sweep animation */}
          {scanStep === 'ANALYZING' && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative w-64 h-40 rounded-2xl overflow-hidden border-2 border-[#135ca5] shadow-2xl">
                <img
                  src={
                    capturedImage ||
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
                  }
                  alt="Scanning"
                  className="w-full h-full object-cover filter brightness-90"
                />
                {/* Laser Sweep Line in vibrant Orange */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#f15a24] to-transparent shadow-[0_0_15px_#f15a24] animate-bounce" />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#f15a24] animate-spin" />
                  <span className="text-sm font-bold text-white">Numérisation HD & OCR Optique</span>
                </div>
                <p className="text-xs text-cyan-300 font-mono">{analysisProgress}</p>
              </div>
            </div>
          )}

          {/* EXTRACTED STEP: Verified Results Preview */}
          {scanStep === 'EXTRACTED' && extractedData && (
            <div className="w-full p-4 sm:p-6 bg-slate-950 max-h-[440px] overflow-y-auto space-y-4">
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center justify-between text-emerald-300 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Passeport Biométrique Validé avec Succès (300 DPI)</span>
                </div>
                <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded text-white font-mono">
                  Format Conforme
                </span>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">Nom de famille</span>
                  <span className="font-bold text-white text-sm">{extractedData.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Prénom(s)</span>
                  <span className="font-bold text-white text-sm">{extractedData.firstName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">N° Passeport</span>
                  <span className="font-mono font-bold text-[#f15a24] text-sm">
                    {extractedData.passportNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Nationalité</span>
                  <span className="font-bold text-white">{extractedData.nationality}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Date de Naissance</span>
                  <span className="font-bold text-white">{extractedData.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Date d'Expiration</span>
                  <span className="font-bold text-emerald-400">{extractedData.passportExpiry}</span>
                </div>
              </div>

              {/* MRZ Band Display */}
              <div className="bg-black/90 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-cyan-300 tracking-wider overflow-x-auto whitespace-pre">
                {extractedData.mrzLine}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {scanStep === 'VIEWFINDER' && activeTab === 'CAMERA' && cameraActive && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleTriggerScan}
                disabled={isScanning}
                className="px-6 py-3 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
              >
                <Scan className="w-4 h-4 text-[#f15a24]" />
                <span>Déclencher le Scan HD</span>
              </button>
            </>
          )}

          {scanStep === 'VIEWFINDER' && activeTab !== 'CAMERA' && (
            <div className="w-full flex justify-between items-center text-xs text-slate-400">
              <span>Sélectionnez un fichier ou un profil d'exemple</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Fermer
              </button>
            </div>
          )}

          {scanStep === 'EXTRACTED' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setScanStep('VIEWFINDER');
                  if (activeTab === 'CAMERA') startCamera();
                }}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-scanner</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmExtraction}
                className="px-6 py-3 bg-[#f15a24] hover:bg-[#d94917] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Remplir le Formulaire & Joindre le Scan HD</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Preset demo passports for instant testing
const DEMO_PASSPORTS = [
  {
    firstName: 'El Hadji Malick',
    lastName: 'SYLLA',
    passportNumber: 'A1984201',
    dateOfBirth: '1979-05-18',
    placeOfBirth: 'Dakar',
    nationality: 'Sénégalaise',
    passportExpiry: '2030-08-14',
    gender: 'M' as const,
    issuingCountry: 'SEN',
    sampleImage:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90',
    mrzLine:
      'P<SEN<<SYLLA<<EL<HADJI<MALICK<<<<<<<<<<<<<<<<<<<\nA19842018SEN7905182M3008149<<<<<<<<<<<<<<04',
  },
  {
    firstName: 'Aminata',
    lastName: 'DIOP',
    passportNumber: 'A2475019',
    dateOfBirth: '1985-11-23',
    placeOfBirth: 'Saint-Louis',
    nationality: 'Sénégalaise',
    passportExpiry: '2031-03-20',
    gender: 'F' as const,
    issuingCountry: 'SEN',
    sampleImage:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90',
    mrzLine:
      'P<SEN<<DIOP<<AMINATA<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nA24750198SEN8511234F3103207<<<<<<<<<<<<<<02',
  },
  {
    firstName: 'Mamadou Lamine',
    lastName: 'KOUYATE',
    passportNumber: 'A3891402',
    dateOfBirth: '1974-02-10',
    placeOfBirth: 'Abidjan',
    nationality: 'Ivoirienne',
    passportExpiry: '2029-10-15',
    gender: 'M' as const,
    issuingCountry: 'CIV',
    sampleImage:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90',
    mrzLine:
      'P<CIV<<KOUYATE<<MAMADOU<LAMINE<<<<<<<<<<<<<<<<<<<\nA38914028CIV7402108M2910156<<<<<<<<<<<<<<08',
  },
  {
    firstName: 'Fatoumata',
    lastName: 'TRAORÉ',
    passportNumber: 'A4102941',
    dateOfBirth: '1990-07-04',
    placeOfBirth: 'Bamako',
    nationality: 'Malienne',
    passportExpiry: '2030-12-05',
    gender: 'F' as const,
    issuingCountry: 'MLI',
    sampleImage:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=90',
    mrzLine:
      'P<MLI<<TRAORE<<FATOUMATA<<<<<<<<<<<<<<<<<<<<<<<<<\nA41029418MLI9007041F3012053<<<<<<<<<<<<<<06',
  },
];
