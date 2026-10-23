import React, { useState, useEffect } from 'react';
import { Package, RoomChoice, PersonalInfo, DocumentType, PilgrimDocument, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileCheck,
  CreditCard,
  User,
  ShieldCheck,
  FileText,
  AlertCircle,
  QrCode,
  Smartphone,
  Eye,
  Trash2,
  Lock,
  ArrowRight,
  Camera,
  Scan,
  Sparkles,
  RefreshCw,
  Download,
  ExternalLink,
  Maximize2,
  MessageCircle,
} from 'lucide-react';
import { OfficialReceiptModal } from '../common/OfficialReceiptModal';
import { PassportScannerModal } from './PassportScannerModal';
import { PhotoBoothModal } from './PhotoBoothModal';
import { WaveQrModal } from './WaveQrModal';
import { WhatsAppGroupCard } from '../common/WhatsAppGroupCard';
import { RegistrationLanding } from './RegistrationLanding';

export const RegistrationWizard: React.FC = () => {
  const {
    packages,
    selectedPackageId,
    setSelectedPackageId,
    registerPilgrim,
    processPayment,
    formatFCFA,
    agencyConfig,
    setPilgrimActiveTab,
    setTrackingQueryCode,
    registerClientAccount,
    currentUser,
  } = useApp();

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    selectedPackageId || packages[0]?.id || ''
  );
  const [roomType, setRoomType] = useState<RoomChoice>('quadruple');

  // Sync selectedPackageId if provided externally
  useEffect(() => {
    if (selectedPackageId) {
      setSelectedPkgId(selectedPackageId);
    }
  }, [selectedPackageId]);

  // Sync pilgrim details if already registered/logged in
  useEffect(() => {
    if (currentUser?.role === 'PILGRIM') {
      const parts = currentUser.name.split(' ');
      setFormData((prev) => ({
        ...prev,
        firstName: currentUser.firstName || prev.firstName || parts[0] || '',
        lastName: currentUser.lastName || prev.lastName || parts.slice(1).join(' ') || '',
        email: currentUser.email || prev.email,
        phone: currentUser.phone && currentUser.phone !== '+221 77 ' ? currentUser.phone : prev.phone,
      }));
    }
  }, [currentUser]);

  // Scanner Modals
  const [isPassportScannerOpen, setIsPassportScannerOpen] = useState<boolean>(false);
  const [isPhotoBoothOpen, setIsPhotoBoothOpen] = useState<boolean>(false);
  const [scannerNotification, setScannerNotification] = useState<string | null>(null);

  // Form info
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    gender: 'M',
    dateOfBirth: '1980-01-01',
    placeOfBirth: 'Dakar',
    nationality: 'Sénégalaise',
    passportNumber: '',
    passportExpiry: '2028-12-31',
    bloodGroup: 'O+',
    address: 'Sicap Liberté 2',
    city: 'Dakar',
    country: 'Sénégal',
    phone: '+221 77 ',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '+221 77 ',
    emergencyContactRelation: 'Conjoint(e)',
    mahramName: '',
    mahramRelation: '',
    medicalConditions: '',
  });

  // Uploaded docs
  const [documents, setDocuments] = useState<{
    passport?: PilgrimDocument;
    photo?: PilgrimDocument;
    medical?: PilgrimDocument;
  }>({});

  // Payment choice
  const [paymentOption, setPaymentOption] = useState<'DEPOSIT' | 'FULL'>('DEPOSIT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [paymentPhone, setPaymentPhone] = useState<string>('');
  const [waveSubTab, setWaveSubTab] = useState<'QR_CODE' | 'PUSH'>('QR_CODE');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSimulationStep, setPaymentSimulationStep] = useState<'IDLE' | 'PROMPTING' | 'CONFIRMED'>('IDLE');
  const [showWaveQrModal, setShowWaveQrModal] = useState<boolean>(false);

  // Result
  const [createdDossier, setCreatedDossier] = useState<any>(null);
  const [showOfficialModal, setShowOfficialModal] = useState<boolean>(false);

  const handlePassportScanComplete = (data: {
    scannedDoc: PilgrimDocument;
    extractedInfo: Partial<PersonalInfo>;
  }) => {
    setDocuments((prev) => ({ ...prev, passport: data.scannedDoc }));
    setFormData((prev) => ({
      ...prev,
      ...data.extractedInfo,
    }));
    setScannerNotification(
      `Passeport N° ${data.extractedInfo.passportNumber || ''} numérisé en Haute Définition 300 DPI ! Coordonnées pré-remplies automatiquement.`
    );
    setTimeout(() => setScannerNotification(null), 6000);
  };

  const handlePhotoCaptured = (doc: PilgrimDocument) => {
    setDocuments((prev) => ({ ...prev, photo: doc }));
    setScannerNotification('Photo d\'identité HD certifiée fond blanc (Norme Officielle) enregistrée avec succès !');
    setTimeout(() => setScannerNotification(null), 6000);
  };

  const currentPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];
  const totalPrice = currentPkg ? currentPkg.roomPricing[roomType] || currentPkg.priceFCFA : 0;
  const depositAmount = currentPkg?.minDepositFCFA || 1000000;
  const toPayNow = paymentOption === 'FULL' ? totalPrice : depositAmount;

  // Handle document file upload (or test sample)
  const handleFileUpload = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fakeUrl = URL.createObjectURL(file);
    const doc: PilgrimDocument = {
      id: `doc-${type}-${Date.now()}`,
      type,
      title:
        type === 'passport'
          ? 'Passeport biométrique (Scan HD)'
          : type === 'photo'
          ? 'Photo d\'identité HD (Fond blanc)'
          : 'Certificat médical',
      fileName: file.name,
      fileUrl: fakeUrl,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} Mo`,
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    setDocuments((prev) => ({ ...prev, [type]: doc }));
  };

  // Helper to load sample test document with 1 click
  const handleLoadSampleDoc = (type: DocumentType) => {
    const samples: Record<DocumentType, { fileName: string; url: string; size: string; title: string }> = {
      passport: {
        title: 'Passeport biométrique (Scan HD)',
        fileName: 'Passeport_Officiel_Scanne.pdf',
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
        size: '2.4 Mo',
      },
      photo: {
        title: 'Photo d\'identité HD (Norme Officielle Fond Blanc)',
        fileName: 'Photo_Identite_FondBlanc.jpg',
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        size: '1.2 Mo',
      },
      medical: {
        title: 'Certificat d\'aptitude physique',
        fileName: 'Certificat_Aptitude_Medecin.pdf',
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
        size: '890 Ko',
      },
    };

    const s = samples[type];
    const doc: PilgrimDocument = {
      id: `doc-${type}-${Date.now()}`,
      type,
      title: s.title,
      fileName: s.fileName,
      fileUrl: s.url,
      fileSize: s.size,
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    setDocuments((prev) => ({ ...prev, [type]: doc }));
  };

  const removeDoc = (type: DocumentType) => {
    setDocuments((prev) => {
      const copy = { ...prev };
      delete copy[type];
      return copy;
    });
  };

  // Final submit & payment processing
  const handleSubmitAndPay = () => {
    setIsProcessingPayment(true);
    setPaymentSimulationStep('PROMPTING');

    setTimeout(() => {
      // 1. Create Dossier in Context
      const newDossier = registerPilgrim({
        packageId: currentPkg.id,
        packageSnapshot: {
          title: currentPkg.title,
          type: currentPkg.type,
          priceFCFA: totalPrice,
          roomType,
          departureDate: currentPkg.departureDate,
          returnDate: currentPkg.returnDate,
          season: currentPkg.season,
        },
        personalInfo: formData,
        documents,
        payment: {
          totalAmountFCFA: totalPrice,
          amountPaidFCFA: 0,
          remainingBalanceFCFA: totalPrice,
          paymentStatus: 'UNPAID',
          transactions: [],
        },
        workflowStatus: 'UNDER_REVIEW',
        adminNotes: 'Dossier pré-inscrit via le portail mobile.',
      });

      // 2. Process immediate payment via Wave or OM
      processPayment({
        dossierId: newDossier.id,
        amountFCFA: toPayNow,
        method: paymentMethod,
        paymentType: paymentOption,
        phone: paymentPhone || formData.phone,
      });

      // 3. Automatically link and login client account
      registerClientAccount(
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        formData.phone,
        newDossier.trackingCode,
        formData.firstName,
        formData.lastName
      );

      setCreatedDossier(newDossier);
      setIsProcessingPayment(false);
      setPaymentSimulationStep('CONFIRMED');
      setStep(5);
    }, 2200);
  };

  if (step === 0) {
    return (
      <RegistrationLanding
        onStartRegistration={(pkgId) => {
          if (pkgId) {
            setSelectedPkgId(pkgId);
            setSelectedPackageId(pkgId);
          }
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Brand Top Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-auto px-2 bg-white rounded-xl flex items-center justify-center shrink-0 border border-stone-200 shadow-xs">
            <img src="/logo.png" alt="EVA Voyages" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#135ca5] tracking-tight">{agencyConfig.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#f15a24] text-white font-bold uppercase">
                Inscription Officielle
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Campagne Hajj 1447H / 2026 · Dossier d'Inscription Pèlerin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            <span className="text-[#135ca5] font-bold">1. Package</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-[#135ca5] font-bold' : ''}>2. Coordonnées</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-[#135ca5] font-bold' : ''}>3. Documents</span>
            <span>→</span>
            <span className={step >= 4 ? 'text-[#f15a24] font-bold' : ''}>4. Paiement</span>
          </div>
        </div>
      </div>

      {/* Step Indicator Header */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#135ca5] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {step}
            </span>
            <span className="text-sm font-bold text-stone-900">
              {step === 1 && 'Choix de la Formule & Hébergement'}
              {step === 2 && 'Identité, Scanner Passeport & Coordonnées'}
              {step === 3 && 'Collecte des Documents Administratifs'}
              {step === 4 && 'Règlement Sécurisé Wave ou Orange Money'}
              {step === 5 && 'Confirmation Officielle & Reçu Émis'}
            </span>
          </div>
          <span className="text-xs text-stone-500 font-semibold">Étape {step} sur 5</span>
        </div>

        {/* Progress Bar with EVA Blue & Orange */}
        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-[#135ca5] via-[#135ca5] to-[#f15a24] transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Package & Room */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">1. Sélectionnez votre Package de Pèlerinage</h2>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-xs text-[#135ca5] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Retour à l'accueil inscription</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedPkgId === pkg.id
                      ? 'border-[#135ca5] bg-blue-50/50 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#135ca5] text-white">
                          {pkg.type}
                        </span>
                        <span className="text-xs text-[#f15a24] font-bold">{pkg.season}</span>
                      </div>
                      <h3 className="font-bold text-sm text-stone-900 mt-0.5">{pkg.title}</h3>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        Hôtels: {pkg.hotelMakkah.name} ({pkg.hotelMakkah.distanceMeters}m) · {pkg.hotelMedina.name}
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                    <span className="text-[11px] text-stone-500">À partir de</span>
                    <span className="text-base font-black text-slate-900 font-sans tabular-nums">
                      {formatFCFA(pkg.priceFCFA)}
                    </span>
                    <span className="text-[10px] text-[#135ca5] font-semibold">{pkg.spotsRemaining} places dispos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room configuration */}
          {currentPkg && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Type de Chambre Souhaité
              </h3>
              <p className="text-xs text-stone-500">
                Le tarif du package s'ajuste selon la formule d'occupation hôtelière à Makkah et Médine.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRoomType('quadruple')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    roomType === 'quadruple'
                      ? 'border-[#135ca5] bg-blue-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900">Quadruple (Standard)</span>
                    {roomType === 'quadruple' && <Check className="w-4 h-4 text-[#135ca5]" />}
                  </div>
                  <span className="text-[11px] text-stone-500 block mb-2">4 lits séparés</span>
                  <div className="text-sm font-bold text-stone-900 tabular-nums">
                    {formatFCFA(currentPkg.roomPricing.quadruple)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoomType('triple')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    roomType === 'triple'
                      ? 'border-[#135ca5] bg-blue-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900">Triple (Confort)</span>
                    {roomType === 'triple' && <Check className="w-4 h-4 text-[#135ca5]" />}
                  </div>
                  <span className="text-[11px] text-stone-500 block mb-2">3 lits confort</span>
                  <div className="text-sm font-bold text-stone-900 tabular-nums">
                    {formatFCFA(currentPkg.roomPricing.triple)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoomType('double')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    roomType === 'double'
                      ? 'border-[#f15a24] bg-orange-50/50'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#f15a24]">Double / VIP</span>
                    {roomType === 'double' && <Check className="w-4 h-4 text-[#f15a24]" />}
                  </div>
                  <span className="text-[11px] text-stone-500 block mb-2">2 lits ou grand lit</span>
                  <div className="text-sm font-bold text-[#f15a24] tabular-nums">
                    {formatFCFA(currentPkg.roomPricing.double)}
                  </div>
                </button>
              </div>

              {/* Total preview banner */}
              <div className="mt-4 p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-stone-200">
                <div>
                  <span className="text-xs text-stone-500 block">Total Package Sélectionné</span>
                  <span className="text-xs font-semibold text-stone-800">
                    {currentPkg.title} · Formule {roomType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#135ca5] font-sans tabular-nums">
                    {formatFCFA(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <span>Continuer vers mes coordonnées</span>
              <ChevronRight className="w-4 h-4 text-[#f15a24]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Personal Details + DUAL PASSPORT SCANNER & HD PHOTO PROMPT */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900">2. Identité & Coordonnées du Pèlerin</h2>
                <p className="text-xs text-stone-500">
                  Ces informations officielles sont transmises directement pour la constitution de votre dossier officiel de voyage.
                </p>
              </div>
            </div>

            {/* DUAL VIP BIOMETRIC ACTION PANEL (PASSPORT SCAN + HD PHOTO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Scanner de Passeport */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c3f74] to-slate-900 text-white border border-[#135ca5]/50 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#135ca5] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Scan className="w-5 h-5 text-[#f15a24]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-[#f15a24] text-white px-2 py-0.5 rounded-full">
                      Recommandé
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">Scanner Optique de Passeport</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Numérisez la page photo de votre passeport : le système lit la bande MRZ et remplit automatiquement vos coordonnées ci-dessous.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  {documents.passport ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passeport HD enregistré
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPassportScannerOpen(true)}
                        className="text-[11px] text-cyan-300 underline font-semibold hover:text-white"
                      >
                        Re-scanner
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPassportScannerOpen(true)}
                      className="w-full py-2 px-3 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#f15a24]" />
                      <span>Ouvrir le Scanner Caméra</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Photo d'Identité HD Fond Blanc */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#f15a24] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-white/20 text-white px-2 py-0.5 rounded-full">
                      Norme Officielle
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">Photo d'Identité Haute Qualité</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Capturez ou importez votre portrait haute résolution sur fond blanc uniforme avec cadrage biométrique guidé.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  {documents.photo ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Photo HD validée
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPhotoBoothOpen(true)}
                        className="text-[11px] text-cyan-300 underline font-semibold hover:text-white"
                      >
                        Reprendre
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPhotoBoothOpen(true)}
                      className="w-full py-2 px-3 bg-[#f15a24] hover:bg-[#d94917] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Studio Photo HD</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scanner notification toast */}
            {scannerNotification && (
              <div className="p-3 bg-blue-50 text-[#135ca5] rounded-xl border border-blue-200 text-xs flex items-center gap-2 font-medium animate-in fade-in">
                <Check className="w-4 h-4 text-[#f15a24] shrink-0" />
                <span>{scannerNotification}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Prénom(s) (selon passeport) *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ex: Ibrahima"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ex: Ndiaye"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Genre *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] bg-white"
                >
                  <option value="M">Masculin (Homme)</option>
                  <option value="F">Féminin (Femme)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Date de naissance *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Numéro de Passeport *</label>
                <input
                  type="text"
                  required
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                  placeholder="Ex: A1948201"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Date d'expiration passeport *</label>
                <input
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] bg-white"
                />
                <span className="text-[10px] text-stone-400">Doit être valide au moins 6 mois après le pèlerinage</span>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Téléphone Mobile (SMS de confirmation en direct) *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+221 77 000 00 00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Adresse E-mail (Reçu officiel & notifications) *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.email@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Groupe Sanguin (assistance médicale)</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] bg-white"
                >
                  <option value="O+">O Positif (O+)</option>
                  <option value="O-">O Négatif (O-)</option>
                  <option value="A+">A Positif (A+)</option>
                  <option value="A-">A Négatif (A-)</option>
                  <option value="B+">B Positif (B+)</option>
                  <option value="B-">B Négatif (B-)</option>
                  <option value="AB+">AB Positif (AB+)</option>
                  <option value="AB-">AB Négatif (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Ville & Pays de résidence</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: Dakar, Sénégal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                Contact d'Urgence (Proche au pays)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">Nom complet du proche</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    placeholder="Ex: Fatou Diallo"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5]"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">Numéro du proche</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    placeholder="+221 77 111 22 33"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
                  alert('Veuillez renseigner au minimum votre Prénom, Nom, Téléphone et Email.');
                  return;
                }
                setStep(3);
              }}
              className="px-6 py-3.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <span>Continuer vers les documents</span>
              <ChevronRight className="w-4 h-4 text-[#f15a24]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Documents Collection */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">3. Collecte des Documents Administratifs en Temps Réel</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Numérisez ou téléversez vos justificatifs obligatoires. Les scans de passeport et photos haute définition sont vérifiés pour la validation administrative et l'émission des billets.
                </p>
              </div>
            </div>

            {/* Document Cards */}
            <div className="space-y-4">
              {/* 1. Passport */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      documents.passport
                        ? 'bg-blue-100 text-[#135ca5] border border-blue-200'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {documents.passport ? <FileCheck className="w-6 h-6 text-[#135ca5]" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">Passeport Biométrique</span>
                      <span className="text-[10px] font-bold text-red-600 uppercase">Obligatoire</span>
                      {documents.passport && (
                        <span className="text-[10px] font-bold text-[#135ca5] bg-blue-100 px-2 py-0.5 rounded-full">
                          Numérisation HD 300 DPI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      Page d'identité avec photo nette, signature et bande optique MRZ.
                    </p>
                    {documents.passport && (
                      <span className="text-[11px] text-[#135ca5] font-medium flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5 text-[#f15a24]" /> {documents.passport.fileName} ({documents.passport.fileSize})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {documents.passport ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPassportScannerOpen(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#135ca5] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-[#f15a24]" />
                        <span>Re-scanner</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoc('passport')}
                        className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPassportScannerOpen(true)}
                        className="px-3.5 py-2 text-xs font-bold bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Scan className="w-3.5 h-3.5 text-[#f15a24]" />
                        <span>Scanner Caméra</span>
                      </button>

                      <label className="px-3 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Fichier HD</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload('passport', e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleLoadSampleDoc('passport')}
                        className="px-2.5 py-2 text-[11px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                      >
                        Démo HD
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Photo d'identité */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      documents.photo
                        ? 'bg-orange-100 text-[#f15a24] border border-orange-200'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {documents.photo ? <FileCheck className="w-6 h-6 text-[#f15a24]" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">Photo d'Identité (Fond Blanc HD)</span>
                      <span className="text-[10px] font-bold text-red-600 uppercase">Obligatoire</span>
                      {documents.photo && (
                        <span className="text-[10px] font-bold text-[#f15a24] bg-orange-100 px-2 py-0.5 rounded-full">
                          Norme Conforme Validée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      Format carré ou 4x4, visage bien dégagé, fond blanc uni et sans lunettes teintées.
                    </p>
                    {documents.photo && (
                      <span className="text-[11px] text-[#f15a24] font-medium flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5" /> {documents.photo.fileName} ({documents.photo.fileSize})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {documents.photo ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPhotoBoothOpen(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#f15a24] bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reprendre photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoc('photo')}
                        className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPhotoBoothOpen(true)}
                        className="px-3.5 py-2 text-xs font-bold bg-[#f15a24] hover:bg-[#d94917] text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Studio Caméra HD</span>
                      </button>

                      <label className="px-3 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Fichier HD</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload('photo', e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => handleLoadSampleDoc('photo')}
                        className="px-2.5 py-2 text-[11px] font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                      >
                        Exemple HD
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Helper Button to load test documents */}
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs flex items-center justify-between">
              <span className="text-[#135ca5] font-medium">
                Vous pouvez ajouter les 2 pièces justificatives tests en 1 clic (Passeport & Photo HD) :
              </span>
              <button
                type="button"
                onClick={() => {
                  handleLoadSampleDoc('passport');
                  handleLoadSampleDoc('photo');
                }}
                className="px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-lg shrink-0 transition-colors"
              >
                Charger Passeport & Photo
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
            >
              <span>Continuer vers le Paiement</span>
              <ChevronRight className="w-4 h-4 text-[#f15a24]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Direct Payment via Wave or Orange Money */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
            {/* Header */}
            <div className="border-b border-stone-100 pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#135ca5] text-white">
                  Étape 4 / 5
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#f15a24]/10 text-[#f15a24] border border-[#f15a24]/30">
                  Règlement Sécurisé Mobile Money
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-900">
                4. Les Deux Types de Paiement & Opérateurs Agréés
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Choisissez votre modalité de versement (Acompte de réservation ou Règlement Intégral) puis validez par Wave (avec QR Code officiel) ou Orange Money.
              </p>
            </div>

            {/* SECTION 1: LES DEUX TYPES DE PAIEMENT (Modalité de versement) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#135ca5] text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Choisissez votre type de paiement
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">2 formules au choix</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* TYPE 1: Acompte de Réservation */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('DEPOSIT')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    paymentOption === 'DEPOSIT'
                      ? 'border-[#135ca5] bg-blue-50/60 shadow-md ring-2 ring-[#135ca5]/20'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  {paymentOption === 'DEPOSIT' && (
                    <div className="absolute top-0 right-0 bg-[#135ca5] text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                      Sélectionné
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-[#135ca5]">
                        TYPE 1 : ACOMPTE INITIAL
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-stone-900 mb-1">
                      Acompte de Réservation
                    </h3>
                    <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
                      Bloquez immédiatement votre place sur le vol régulier et l'hôtel 5★. Versement minimum exigé pour lancer l'enrôlement consulaire.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200/80">
                    <span className="text-[10px] text-stone-500 block">Montant de l'acompte à verser :</span>
                    <span className="text-xl font-black text-[#135ca5] font-sans tabular-nums block">
                      {formatFCFA(depositAmount)}
                    </span>
                    <div className="mt-2 text-[10px] font-medium text-stone-500 bg-white/80 p-2 rounded-xl border border-stone-200/60">
                      Solde restant : <strong className="text-stone-800">{formatFCFA(totalPrice - depositAmount)}</strong> payable en tranches flexibles avant le départ.
                    </div>
                  </div>
                </button>

                {/* TYPE 2: Règlement Intégral 100% */}
                <button
                  type="button"
                  onClick={() => setPaymentOption('FULL')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    paymentOption === 'FULL'
                      ? 'border-[#f15a24] bg-orange-50/60 shadow-md ring-2 ring-[#f15a24]/20'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  {paymentOption === 'FULL' && (
                    <div className="absolute top-0 right-0 bg-[#f15a24] text-white text-[10px] font-black px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                      Sélectionné
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-100 text-[#f15a24]">
                        TYPE 2 : RÈGLEMENT INTÉGRAL (100%)
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-stone-900 mb-1">
                      Paiement Total au Comptant
                    </h3>
                    <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
                      Soldez l'intégralité du forfait en une seule fois. Votre dossier est classé prioritaire pour l'émission du visa officiel et la délivrance des billets.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-200/80">
                    <span className="text-[10px] text-stone-500 block">Montant intégral à solder :</span>
                    <span className="text-xl font-black text-[#f15a24] font-sans tabular-nums block">
                      {formatFCFA(totalPrice)}
                    </span>
                    <div className="mt-2 text-[10px] font-medium text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      ✓ Dossier 100% Soldé · Reçu libératoire officiel immédiat
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 2: LES DEUX OPÉRATEURS MOBILE MONEY */}
            <div className="pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#135ca5] text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Choisissez votre opérateur de paiement
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">Wave Sénégal ou Orange Money</span>
              </div>

              {/* Selector Tabs: Wave vs Orange Money */}
              <div className="grid grid-cols-2 gap-3.5 mb-3">
                {/* Wave Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WAVE')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center relative ${
                    paymentMethod === 'WAVE'
                      ? 'border-[#1DC4FF] bg-gradient-to-b from-[#1DC4FF]/15 to-white shadow-md ring-2 ring-[#1DC4FF]/30'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-sky-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                      alt="Wave Sénégal"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-black text-sm text-stone-900 block">WAVE SÉNÉGAL</span>
                      <span className="text-[9px] bg-cyan-100 text-cyan-800 font-black px-1.5 py-0.2 rounded-full">
                        0% Frais
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      QR Code Officiel & Push Instantané
                    </span>
                  </div>
                </button>

                {/* Orange Money Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ORANGE_MONEY')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center relative ${
                    paymentMethod === 'ORANGE_MONEY'
                      ? 'border-[#f15a24] bg-gradient-to-b from-[#f15a24]/15 to-white shadow-md ring-2 ring-[#f15a24]/30'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white p-1 border border-orange-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                      alt="Orange Money"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-black text-sm text-stone-900 block">ORANGE MONEY</span>
                      <span className="text-[9px] bg-orange-100 text-[#d94917] font-black px-1.5 py-0.2 rounded-full">
                        Code Marchand
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      Code USSD #144# ou Push OTP
                    </span>
                  </div>
                </button>
              </div>

              {/* Direct WhatsApp Payment Assistance Note */}
              <div className="mb-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold block">Assistance Trésorerie & WhatsApp : {agencyConfig.whatsapp || '+221 78 639 10 00'}</span>
                    <span className="text-[11px] text-emerald-800">
                      Un problème pour payer ou pour transmettre votre reçu Wave / Orange Money ?
                    </span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/221786391000?text=${encodeURIComponent(
                    `Salam Alaykum ${agencyConfig.name}, je suis à l'étape du versement pour le package ${currentPkg?.title || ''}. Pouvez-vous m'assister pour le paiement ?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold rounded-xl flex items-center gap-1 text-[11px] shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp +221 78 639 10 00</span>
                </a>
              </div>

              {/* OPÉRATEUR 1 : WAVE SÉNÉGAL INTERFACE AVEC QR CODE OFFICIEL */}
              {paymentMethod === 'WAVE' ? (
                <div className="p-4 sm:p-5 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/50 rounded-2xl border-2 border-[#1DC4FF]/40 space-y-4">
                  {/* Sub-modes for Wave: QR Scan vs Push Phone */}
                  <div className="flex items-center justify-between pb-3 border-b border-cyan-100 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-sky-200 shadow-xs flex items-center justify-center shrink-0">
                        <img
                          src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                          alt="Wave"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">
                          Guichet Agréé Wave Digital Finance
                        </h4>
                        <span className="text-[10px] text-stone-500">
                          Marchand certifié : <strong>{agencyConfig.waveMerchantNumber}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-cyan-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setWaveSubTab('QR_CODE')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                          waveSubTab === 'QR_CODE'
                            ? 'bg-[#135ca5] text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Affiche & QR Code</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWaveSubTab('PUSH')}
                        className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 ${
                          waveSubTab === 'PUSH'
                            ? 'bg-[#135ca5] text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Push Mobile</span>
                      </button>
                    </div>
                  </div>

                  {waveSubTab === 'QR_CODE' ? (
                    /* Display of Official Wave QR Code Poster */
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-cyan-200/80 shadow-xs">
                        {/* QR Code Poster Image from User attachment */}
                        <div
                          onClick={() => setShowWaveQrModal(true)}
                          className="relative cursor-pointer group shrink-0 w-32 h-44 rounded-xl border-2 border-[#1DC4FF] bg-[#1DC4FF]/10 p-1.5 shadow-sm overflow-hidden flex items-center justify-center"
                        >
                          <img
                            src="/assets/wave_qr.png"
                            alt="Affiche Wave Officielle"
                            className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-6 h-6" />
                          </div>
                        </div>

                        {/* QR Scan Details & Action Buttons */}
                        <div className="space-y-2.5 flex-1 text-center sm:text-left">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#135ca5] bg-blue-100 px-2 py-0.5 rounded-full">
                              QR Code Marchand Officiel
                            </span>
                            <h5 className="font-bold text-stone-900 text-sm mt-1">
                              Scannez l'Affiche Wave ci-contre
                            </h5>
                            <p className="text-[11px] text-stone-600 leading-normal mt-0.5">
                              Ouvrez votre application <strong>Wave</strong> sur smartphone, appuyez sur <strong>Scanner</strong> et pointez la caméra vers ce code pour valider les <strong>{formatFCFA(toPayNow)}</strong>.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => setShowWaveQrModal(true)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#135ca5] hover:bg-[#0c3f74] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Maximize2 className="w-3.5 h-3.5 text-[#f15a24]" />
                              <span>Agrandir le QR Code en Plein Écran</span>
                            </button>

                            <a
                              href="/assets/aistudio/static_wave_qr_9b2cebc3.pdf"
                              download="Affiche_Wave_EVA_VOYAGES.pdf"
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-stone-500" />
                              <span>Télécharger l'Affiche PDF</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Phone confirm input as fallback */}
                      <div className="p-3 bg-white/90 rounded-xl border border-cyan-200 flex flex-col sm:flex-row items-center gap-2 text-xs">
                        <span className="font-semibold text-stone-700 shrink-0">
                          Votre Numéro Wave pour notification SMS :
                        </span>
                        <input
                          type="tel"
                          value={paymentPhone || formData.phone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="w-full sm:w-48 px-3 py-1.5 rounded-lg border border-cyan-300 font-mono text-xs bg-white"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Push Phone payment mode */
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-cyan-200">
                      <div>
                        <label className="block font-bold text-stone-800 text-xs mb-1">
                          Numéro de Téléphone Mobile Wave
                        </label>
                        <p className="text-[11px] text-stone-500 mb-2">
                          Vous recevrez immédiatement une notification d'autorisation sur l'application Wave de ce numéro :
                        </p>
                        <input
                          type="tel"
                          value={paymentPhone || formData.phone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          placeholder="+221 77 000 00 00"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-cyan-300 focus:outline-none focus:ring-2 focus:ring-[#135ca5] font-mono text-sm bg-stone-50 font-bold"
                        />
                      </div>

                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3 text-xs text-[#0c3f74]">
                        <Smartphone className="w-5 h-5 text-[#135ca5] shrink-0" />
                        <span>
                          Dès que vous cliquerez sur le bouton ci-dessous, ouvrez votre téléphone Wave et saisissez votre code secret pour valider le versement de <strong>{formatFCFA(toPayNow)}</strong>.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* OPÉRATEUR 2 : ORANGE MONEY SÉNÉGAL */
                <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 rounded-2xl border-2 border-[#f15a24]/40 space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-orange-100">
                    <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-orange-200 shadow-xs flex items-center justify-center shrink-0">
                      <img
                        src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                        alt="Orange Money"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">
                        Guichet Agréé Orange Money Sénégal
                      </h4>
                      <span className="text-[10px] text-stone-500">
                        Code Marchand Certifié : <strong>{agencyConfig.orangeMoneyMerchantNumber}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Method A: USSD */}
                    <div className="p-3.5 bg-white rounded-xl border border-orange-200 space-y-2">
                      <span className="font-bold text-stone-900 text-[11px] uppercase tracking-wider block">
                        Option A : Code Court USSD Direct
                      </span>
                      <p className="text-[11px] text-stone-600">
                        Composez directement sur le clavier de votre téléphone Orange :
                      </p>
                      <div className="p-2 bg-orange-100/70 rounded-lg text-center font-mono font-black text-base text-[#d94917]">
                        #144#391#
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        Saisissez le montant et confirmez avec votre code secret Orange Money.
                      </span>
                    </div>

                    {/* Method B: Mobile Push OTP */}
                    <div className="p-3.5 bg-white rounded-xl border border-orange-200 space-y-2">
                      <span className="font-bold text-stone-900 text-[11px] uppercase tracking-wider block">
                        Option B : Notification Push Sécurisée
                      </span>
                      <label className="text-[11px] text-stone-600 block">
                        Numéro de Téléphone Orange Money :
                      </label>
                      <input
                        type="tel"
                        value={paymentPhone || formData.phone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="+221 77 000 00 00"
                        className="w-full px-3 py-1.5 rounded-lg border border-orange-300 font-mono text-xs bg-white font-bold"
                      />
                      <span className="text-[10px] text-stone-500 block">
                        Une demande d'autorisation avec code OTP sera instantanément envoyée.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Recap Card */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs text-stone-400">Total à régler maintenant :</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-stone-300">
                    {paymentOption === 'FULL' ? 'Type 2 : Règlement Intégral' : 'Type 1 : Acompte Réservation'}
                  </span>
                </div>
                <span className="text-xs text-[#1DC4FF] font-medium block mt-0.5">
                  Opérateur : {paymentMethod === 'WAVE' ? 'Wave Digital Finance (0% Frais)' : 'Orange Money Sénégal'}
                </span>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-2xl font-black text-[#f15a24] font-sans tabular-nums block">
                  {formatFCFA(toPayNow)}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  Reçu certifié et attestation délivrés automatiquement
                </span>
              </div>
            </div>
          </div>

          {/* Nav & Action */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour Documents</span>
            </button>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleSubmitAndPay}
              className={`px-8 py-3.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-lg transition-all ${
                isProcessingPayment
                  ? 'bg-stone-600 cursor-wait'
                  : paymentMethod === 'WAVE'
                  ? 'bg-[#135ca5] hover:bg-[#0c3f74]'
                  : 'bg-[#f15a24] hover:bg-[#d94917]'
              }`}
            >
              <Lock className="w-4 h-4 text-[#f15a24]" />
              <span>
                {isProcessingPayment
                  ? `Validation sécurisée ${paymentMethod}...`
                  : `Confirmer & Payer ${formatFCFA(toPayNow)} via ${paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'}`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success & Receipt */}
      {step === 5 && createdDossier && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#135ca5] flex items-center justify-center mx-auto shadow-inner border border-blue-200">
              <Check className="w-8 h-8 text-[#f15a24]" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#135ca5] uppercase tracking-widest">
                Inscription & Paiement Réussis
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">
                Qu'Allah bénisse votre intention de pèlerinage !
              </h2>
              <p className="text-xs text-stone-600 max-w-md mx-auto mt-2">
                Votre dossier a été enregistré auprès d'<strong>{agencyConfig.name}</strong> sous le numéro officiel ci-dessous. Les confirmations automatiques par SMS et par E-mail ont été délivrées en direct.
              </p>
            </div>

            {/* Tracking Code Highlight Box */}
            <div className="p-4 bg-slate-50 rounded-2xl max-w-xs mx-auto border border-stone-200">
              <span className="text-[11px] text-stone-500 uppercase font-bold tracking-wider block">
                Votre Code Unique de Dossier
              </span>
              <span className="text-2xl font-black tracking-widest text-[#135ca5] font-mono block my-1">
                {createdDossier.trackingCode}
              </span>
              <span className="text-[10px] text-stone-400">Conservez ce code pour le suivi en temps réel</span>
            </div>

            {/* Real-time SMS & Email dispatch feedback banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
                <div className="font-bold text-[#135ca5] flex items-center gap-1.5 mb-1">
                  <Smartphone className="w-4 h-4 text-[#f15a24]" />
                  <span>SMS Envoyé</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Notification et lien WhatsApp délivrés au <strong>{formData.phone}</strong>.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
                <div className="font-bold text-[#135ca5] flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4 text-[#f15a24]" />
                  <span>Email & Reçu Envoyés</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Reçu officiel délivré à <strong>{formData.email}</strong>.
                </p>
              </div>
            </div>

            {/* DEDICATED OFFICIAL WHATSAPP GROUP INTEGRATION ACCORDING TO PACKAGE */}
            <div className="pt-2 text-left">
              <WhatsAppGroupCard
                dossier={createdDossier}
                variant="POST_REGISTRATION"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowOfficialModal(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#135ca5] hover:bg-[#0c3f74] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <FileText className="w-4 h-4 text-[#f15a24]" />
                <span>Télécharger l'Attestation & Reçu Officiel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackingQueryCode(createdDossier.trackingCode);
                  setPilgrimActiveTab('TRACKING');
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-300 text-stone-800 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Accéder à l'espace de suivi en direct</span>
                <ArrowRight className="w-4 h-4 text-[#135ca5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {createdDossier && (
        <OfficialReceiptModal
          dossier={createdDossier}
          isOpen={showOfficialModal}
          onClose={() => setShowOfficialModal(false)}
        />
      )}

      {/* Passport Scanner Biometric OCR Modal */}
      <PassportScannerModal
        isOpen={isPassportScannerOpen}
        onClose={() => setIsPassportScannerOpen(false)}
        onScanComplete={handlePassportScanComplete}
      />

      {/* Studio Photo d'Identité Biométrique HD Modal */}
      <PhotoBoothModal
        isOpen={isPhotoBoothOpen}
        onClose={() => setIsPhotoBoothOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
      />

      {/* Official Wave QR Poster Modal */}
      <WaveQrModal
        isOpen={showWaveQrModal}
        onClose={() => setShowWaveQrModal(false)}
        amountFCFA={toPayNow}
        dossierTrackingCode="Pré-inscription"
        onConfirmPayment={handleSubmitAndPay}
      />
    </div>
  );
};
