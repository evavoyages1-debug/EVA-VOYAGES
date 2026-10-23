import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, PackageType, RoomPricing } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Building2,
  Plane,
  Calendar,
  DollarSign,
  Users,
  Eye,
  MessageCircle,
  ExternalLink,
  QrCode,
  Upload,
  Copy,
  Smartphone,
  Download,
  Sparkles,
  RefreshCw,
  Link,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

export const PackageManager: React.FC = () => {
  const { packages, updatePackage, addPackage, deletePackage, formatFCFA } = useApp();

  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Dedicated Quick WhatsApp & QR Code Modal
  const [whatsappModalPkg, setWhatsappModalPkg] = useState<Package | null>(null);
  const [quickQrPreview, setQuickQrPreview] = useState<Package | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state for full editing or creating
  const [formPkg, setFormPkg] = useState<Partial<Package>>({
    title: '',
    type: 'HAJJ',
    subtitle: '',
    season: 'Saison 1447H / 2026',
    durationDays: 21,
    departureCity: 'Dakar (DSS)',
    destinationCity: 'Jeddah / Madinah',
    departureDate: '2026-05-18',
    returnDate: '2026-06-08',
    priceFCFA: 4850000,
    minDepositFCFA: 1500000,
    roomPricing: {
      quadruple: 4850000,
      triple: 5200000,
      double: 5750000,
    },
    hotelMakkah: {
      name: 'Hôtel 5★ Face Haram',
      stars: 5,
      distanceMeters: 80,
      walkMinutes: 2,
    },
    hotelMedina: {
      name: 'Hôtel 5★ Médine',
      stars: 5,
      distanceMeters: 100,
      walkMinutes: 2,
    },
    airline: 'Saudia Airlines',
    flightType: 'Vol Direct',
    spotsTotal: 80,
    spotsRemaining: 30,
    status: 'ACTIVE',
    inclusions: [
      'Vol direct A/R',
      'Visa officiel garanti',
      'Pension complète',
      'Encadrement religieux bilingue',
    ],
    exclusions: ['Dépenses privées'],
    imageUrl: '/src/assets/images/hero_mecca_kaaba_1792417053237.jpg',
    badges: ['Confort', 'Face Haram'],
    whatsappGroupName: 'EVA Voyages - Hajj Prestige 2026 VIP 🕋',
    whatsappGroupLink: 'https://chat.whatsapp.com/invite/EVAHajjPrestige2026',
    whatsappGroupDescription: 'Groupe officiel d\'encadrement des pèlerins.',
    whatsappAdminPhone: '+221 78 639 10 00',
    whatsappQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fchat.whatsapp.com%2Finvite%2FEVAHajjPrestige2026',
  });

  const handleStartEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setFormPkg({ ...pkg });
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setEditingPkg(null);
    setIsCreating(true);
    const defaultInvite = 'https://chat.whatsapp.com/invite/EVANewPackage2026';
    setFormPkg({
      title: 'Nouveau Package Hajj / Oumra',
      type: 'HAJJ',
      subtitle: 'Formule tout compris avec assistance complète',
      season: 'Saison 1447H / 2026',
      durationDays: 18,
      departureCity: 'Dakar (DSS)',
      destinationCity: 'Jeddah / Médine',
      departureDate: '2026-05-20',
      returnDate: '2026-06-07',
      priceFCFA: 4200000,
      minDepositFCFA: 1200000,
      roomPricing: {
        quadruple: 4200000,
        triple: 4600000,
        double: 5100000,
      },
      hotelMakkah: {
        name: 'Makkah Towers Hotel',
        stars: 5,
        distanceMeters: 120,
        walkMinutes: 3,
      },
      hotelMedina: {
        name: 'Al Haram Hotel Madinah',
        stars: 4,
        distanceMeters: 150,
        walkMinutes: 3,
      },
      airline: 'Saudia Airlines',
      flightType: 'Vol Direct',
      spotsTotal: 60,
      spotsRemaining: 60,
      status: 'ACTIVE',
      inclusions: ['Vol A/R', 'Visa Officiel', 'Hébergement', 'Ziyarat'],
      exclusions: ['Dépenses privées'],
      imageUrl: '/src/assets/images/makkah_hotel_luxury_1792417053544.jpg',
      badges: ['Nouveau'],
      whatsappGroupName: 'EVA Voyages - Nouveau Package 2026 🕋',
      whatsappGroupLink: defaultInvite,
      whatsappGroupDescription: 'Groupe officiel d\'encadrement des pèlerins pour cette formule.',
      whatsappAdminPhone: '+221 78 639 10 00',
      whatsappQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(defaultInvite)}`,
    });
  };

  // QR code file upload handler
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isQuickModal: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isQuickModal && whatsappModalPkg) {
        setWhatsappModalPkg({ ...whatsappModalPkg, whatsappQrCodeUrl: dataUrl });
      } else {
        setFormPkg((prev) => ({ ...prev, whatsappQrCodeUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate QR code from invitation link
  const handleGenerateQrFromLink = (link?: string, isQuickModal: boolean = false) => {
    const targetLink = link || (isQuickModal ? whatsappModalPkg?.whatsappGroupLink : formPkg.whatsappGroupLink);
    if (!targetLink || !targetLink.trim()) {
      alert("Veuillez d'abord renseigner le lien d'invitation WhatsApp.");
      return;
    }
    const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(targetLink.trim())}`;
    if (isQuickModal && whatsappModalPkg) {
      setWhatsappModalPkg({ ...whatsappModalPkg, whatsappQrCodeUrl: generatedUrl });
    } else {
      setFormPkg((prev) => ({ ...prev, whatsappQrCodeUrl: generatedUrl }));
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSaveFullPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPkg) {
      updatePackage(editingPkg.id, formPkg);
      setEditingPkg(null);
      setSuccessToast(`Package "${formPkg.title}" et groupe WhatsApp mis à jour avec succès!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } else if (isCreating) {
      addPackage(formPkg as Omit<Package, 'id'>);
      setIsCreating(false);
      setSuccessToast(`Nouveau package "${formPkg.title}" créé avec son QR Code WhatsApp!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleSaveQuickWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappModalPkg) return;

    updatePackage(whatsappModalPkg.id, {
      whatsappGroupName: whatsappModalPkg.whatsappGroupName,
      whatsappGroupLink: whatsappModalPkg.whatsappGroupLink,
      whatsappQrCodeUrl: whatsappModalPkg.whatsappQrCodeUrl,
      whatsappGroupDescription: whatsappModalPkg.whatsappGroupDescription,
      whatsappAdminPhone: whatsappModalPkg.whatsappAdminPhone,
    });

    setSuccessToast(`Code QR et lien WhatsApp enregistrés pour le package "${whatsappModalPkg.title}"!`);
    setTimeout(() => setSuccessToast(null), 4000);
    setWhatsappModalPkg(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le package "${title}" ?`)) {
      deletePackage(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl border border-emerald-400 shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCheck className="w-5 h-5 text-[#25D366] shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Gestion des Packages & Liens / QR Codes WhatsApp</h2>
          <p className="text-xs text-stone-500">
            Configurez les formules, les tarifs, et insérez pour chaque package son <strong>Code QR WhatsApp</strong> et son <strong>Lien d'invitation officiel</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Nouveau Package</span>
        </button>
      </div>

      {/* Packages Table & Cards */}
      <div className="grid grid-cols-1 gap-4">
        {packages.map((pkg) => {
          const effectiveQr =
            pkg.whatsappQrCodeUrl ||
            `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
              pkg.whatsappGroupLink || `https://chat.whatsapp.com/invite/EVA${pkg.id}`
            )}`;

          return (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col gap-4"
            >
              {/* Main Package Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Left info & photo */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-stone-200"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-900 text-amber-300">
                        {pkg.type}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">{pkg.season}</span>
                      <span className="text-xs text-emerald-800 font-semibold">· {pkg.durationDays} Jours</span>
                      <span className="text-[10px] bg-blue-50 text-[#135ca5] px-2 py-0.5 rounded-full font-bold">
                        {pkg.airline} ({pkg.flightType})
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-stone-900 truncate">{pkg.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-1">{pkg.subtitle}</p>

                    {/* Hotel unboxed info */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-1">
                      <span>Makkah: <strong>{pkg.hotelMakkah.name} ({pkg.hotelMakkah.distanceMeters}m)</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Madinah: <strong>{pkg.hotelMedina.name}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Price breakdown and quotas */}
                <div className="flex flex-wrap md:flex-col items-start md:items-end justify-between gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-stone-400 uppercase font-bold tracking-wider block">
                      Tarif Base (Quadruple)
                    </span>
                    <div className="text-xl font-black text-stone-900 font-sans tabular-nums">
                      {formatFCFA(pkg.priceFCFA)}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Triple: {formatFCFA(pkg.roomPricing.triple)} · Double: {formatFCFA(pkg.roomPricing.double)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-stone-100 text-stone-700 rounded-lg font-medium tabular-nums">
                      {pkg.spotsRemaining} / {pkg.spotsTotal} places rest.
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(pkg)}
                      className="p-2 text-stone-600 hover:text-emerald-800 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Modifier tous les paramètres & tarifs"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(pkg.id, pkg.title)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Supprimer ce package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* DEDICATED WHATSAPP QR CODE & INVITATION LINK DISPLAY BAR */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-stone-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* QR Code Thumbnail Preview (Clickable to enlarge) */}
                  <div
                    onClick={() => setQuickQrPreview(pkg)}
                    className="relative w-14 h-14 bg-white rounded-xl border-2 border-[#25D366] p-1 shadow-xs shrink-0 cursor-pointer group hover:scale-105 transition-transform"
                    title="Cliquer pour afficher et tester le QR Code en grand"
                  >
                    <img
                      src={effectiveQr}
                      alt={`QR WhatsApp ${pkg.title}`}
                      className="w-full h-full object-contain rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#25D366]/20 text-emerald-950 border border-emerald-400/40 text-[10px] font-black uppercase">
                        <MessageCircle className="w-3 h-3 text-[#25D366] fill-current" />
                        <span>Groupe WhatsApp Dédié</span>
                      </span>
                      <span className="font-bold text-xs text-stone-900 truncate">
                        {pkg.whatsappGroupName || `Groupe WhatsApp - ${pkg.title}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-600 font-mono">
                      <span className="text-stone-400">Lien:</span>
                      <a
                        href={pkg.whatsappGroupLink || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#135ca5] underline hover:text-[#0c3f74] truncate max-w-[220px] sm:max-w-xs"
                      >
                        {pkg.whatsappGroupLink || 'Aucun lien configuré'}
                      </a>

                      {pkg.whatsappGroupLink && (
                        <button
                          type="button"
                          onClick={() => handleCopyLink(pkg.whatsappGroupLink!)}
                          className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-sans text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedLink === pkg.whatsappGroupLink ? (
                            <>
                              <Check className="w-3 h-3 text-[#25D366]" />
                              <span className="text-[#25D366] font-bold">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-stone-500" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons for this package's WhatsApp & QR */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuickQrPreview(pkg)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                    <span>Aperçu QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWhatsappModalPkg({ ...pkg })}
                    className="px-3.5 py-2 bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Insérer Code QR & Lien</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: DEDICATED QUICK WHATSAPP & QR CODE INSERTER / CONFIGURATOR */}
      {whatsappModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                  <img src="/assets/whatsapp_logo.png" alt="WhatsApp" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Insérer le Code QR & Lien WhatsApp
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-medium">
                    Package : <strong>{whatsappModalPkg.title}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWhatsappModalPkg(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickWhatsApp} className="p-6 space-y-5 text-xs">
              {/* Field 1: WhatsApp Invitation Link */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lien d'invitation officiel au Groupe WhatsApp *</span>
                  </label>
                  {whatsappModalPkg.whatsappGroupLink && (
                    <a
                      href={whatsappModalPkg.whatsappGroupLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Tester l'accès</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={whatsappModalPkg.whatsappGroupLink || ''}
                  onChange={(e) => {
                    const newLink = e.target.value;
                    setWhatsappModalPkg({
                      ...whatsappModalPkg,
                      whatsappGroupLink: newLink,
                    });
                  }}
                  placeholder="https://chat.whatsapp.com/invite/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] font-mono text-xs bg-stone-50/50 font-medium"
                />
                <p className="text-[11px] text-stone-500">
                  Lien généré dans WhatsApp : Groupe &gt; Infos du groupe &gt; Inviter via un lien.
                </p>
              </div>

              {/* Field 2: WhatsApp Group Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nom du Groupe WhatsApp</span>
                </label>
                <input
                  type="text"
                  required
                  value={whatsappModalPkg.whatsappGroupName || ''}
                  onChange={(e) =>
                    setWhatsappModalPkg({
                      ...whatsappModalPkg,
                      whatsappGroupName: e.target.value,
                    })
                  }
                  placeholder={`EVA Voyages - ${whatsappModalPkg.title} 🕋`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-xs bg-stone-50/50"
                />
              </div>

              {/* Field 3: WhatsApp QR Code (Upload, Generate or Direct URL) */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#128C7E]" />
                    <span className="font-bold text-emerald-950">Code QR WhatsApp du Package</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Scannable Smartphone
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Left QR Image Preview Box */}
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="relative w-36 h-36 bg-white rounded-2xl p-2 border-2 border-[#25D366] shadow-md flex items-center justify-center">
                      <img
                        src={
                          whatsappModalPkg.whatsappQrCodeUrl ||
                          `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                            whatsappModalPkg.whatsappGroupLink || `https://chat.whatsapp.com/invite/EVA${whatsappModalPkg.id}`
                          )}`
                        }
                        alt="QR Code WhatsApp"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-7 h-7 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center border border-[#25D366]/40">
                          <img src="/assets/whatsapp_logo.png" alt="WA" className="w-5 h-5 object-contain" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 font-semibold">Aperçu en temps réel</span>
                  </div>

                  {/* Right Actions: File Upload & Auto-Generator */}
                  <div className="sm:col-span-7 space-y-2.5">
                    {/* Method A: File Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        1. Importer l'image du QR Code (Fichier) :
                      </label>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-emerald-400 hover:border-emerald-600 rounded-xl cursor-pointer text-emerald-800 hover:bg-emerald-50 transition-colors">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-xs">Téléverser image QR (PNG, JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQrFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Method B: Auto Generator Button */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        2. Ou Générer automatiquement :
                      </label>
                      <button
                        type="button"
                        onClick={() => handleGenerateQrFromLink(undefined, true)}
                        className="w-full px-3 py-2 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Générer QR depuis le lien</span>
                      </button>
                    </div>

                    {/* Method C: Manual URL */}
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-600 mb-0.5">
                        URL directe de l'image (optionnel) :
                      </label>
                      <input
                        type="text"
                        value={whatsappModalPkg.whatsappQrCodeUrl || ''}
                        onChange={(e) =>
                          setWhatsappModalPkg({
                            ...whatsappModalPkg,
                            whatsappQrCodeUrl: e.target.value,
                          })
                        }
                        placeholder="https://.../qrcode.png"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-mono text-[11px] bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 4: Description / Rôle du groupe */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-800">
                  Consignes / Message d'accueil du Groupe
                </label>
                <textarea
                  rows={2}
                  value={whatsappModalPkg.whatsappGroupDescription || ''}
                  onChange={(e) =>
                    setWhatsappModalPkg({
                      ...whatsappModalPkg,
                      whatsappGroupDescription: e.target.value,
                    })
                  }
                  placeholder="Ex: Groupe officiel pour les informations de vols, séminaires rituels avec les Imams et assistance médicale."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-xs bg-stone-50/50"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setWhatsappModalPkg(null)}
                  className="px-4 py-2 text-stone-700 border border-stone-300 rounded-xl font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer le Code QR & Lien</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL PACKAGE EDIT / CREATE MODAL */}
      {(editingPkg || isCreating) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {isCreating ? 'Créer un Nouveau Package' : `Modifier Package: ${editingPkg?.title}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingPkg(null);
                  setIsCreating(false);
                }}
                className="p-1 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullPackage} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Titre du Package</label>
                  <input
                    type="text"
                    required
                    value={formPkg.title}
                    onChange={(e) => setFormPkg({ ...formPkg, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Type de Séjour</label>
                  <select
                    value={formPkg.type}
                    onChange={(e) => setFormPkg({ ...formPkg, type: e.target.value as PackageType })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="HAJJ">HAJJ</option>
                    <option value="OUMRA">OUMRA</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Sous-titre / Description courte</label>
                  <input
                    type="text"
                    value={formPkg.subtitle}
                    onChange={(e) => setFormPkg({ ...formPkg, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>

              {/* Tarifs ajustables */}
              <div className="pt-3 border-t border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                  Grille Tarifaire Ajustable (FCFA)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Base Quadruple (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={formPkg.priceFCFA}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormPkg({
                          ...formPkg,
                          priceFCFA: val,
                          roomPricing: {
                            quadruple: val,
                            triple: formPkg.roomPricing?.triple || val + 350000,
                            double: formPkg.roomPricing?.double || val + 900000,
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Chambre Triple (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={formPkg.roomPricing?.triple}
                      onChange={(e) =>
                        setFormPkg({
                          ...formPkg,
                          roomPricing: {
                            quadruple: formPkg.priceFCFA || 0,
                            triple: Number(e.target.value),
                            double: formPkg.roomPricing?.double || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Chambre Double (FCFA)</label>
                    <input
                      type="number"
                      required
                      value={formPkg.roomPricing?.double}
                      onChange={(e) =>
                        setFormPkg({
                          ...formPkg,
                          roomPricing: {
                            quadruple: formPkg.priceFCFA || 0,
                            triple: formPkg.roomPricing?.triple || 0,
                            double: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Acompte Minimum (FCFA)</label>
                    <input
                      type="number"
                      value={formPkg.minDepositFCFA}
                      onChange={(e) => setFormPkg({ ...formPkg, minDepositFCFA: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Places Disponibles / Quota</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Restantes"
                        value={formPkg.spotsRemaining}
                        onChange={(e) => setFormPkg({ ...formPkg, spotsRemaining: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300"
                      />
                      <input
                        type="number"
                        placeholder="Total"
                        value={formPkg.spotsTotal}
                        onChange={(e) => setFormPkg({ ...formPkg, spotsTotal: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Définition de la Compagnie Aérienne & Transport Vol */}
              <div className="pt-3 border-t border-stone-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#135ca5]" />
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                    Compagnie Aérienne Officielle & Transport Aérien
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nom de la Compagnie Aérienne *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPkg.airline || ''}
                      onChange={(e) => setFormPkg({ ...formPkg, airline: e.target.value })}
                      placeholder="Ex: Saudia Airlines, Air Sénégal..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-semibold"
                    />

                    {/* Quick Airline Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Saudia Airlines', 'Air Sénégal', 'Ethiopian Airlines', 'Flynas', 'Turkish Airlines', 'Emirates'].map((air) => (
                        <button
                          key={air}
                          type="button"
                          onClick={() => setFormPkg({ ...formPkg, airline: air })}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            formPkg.airline === air
                              ? 'bg-[#135ca5] text-white shadow-xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {air}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Type de Vol</label>
                      <select
                        value={formPkg.flightType || 'Vol Direct'}
                        onChange={(e) => setFormPkg({ ...formPkg, flightType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                      >
                        <option value="Vol Direct">Vol Direct (Sans escale)</option>
                        <option value="Vol avec 1 Escale">Vol avec 1 Escale</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-stone-700 text-[11px] mb-1">Ville de Départ</label>
                        <input
                          type="text"
                          value={formPkg.departureCity || 'Dakar (DSS)'}
                          onChange={(e) => setFormPkg({ ...formPkg, departureCity: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 text-[11px] mb-1">Aéroport d'Arrivée</label>
                        <input
                          type="text"
                          value={formPkg.destinationCity || 'Jeddah / Madinah'}
                          onChange={(e) => setFormPkg({ ...formPkg, destinationCity: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEDICATED WHATSAPP GROUP & QR CODE CONFIGURATION FOR THIS PACKAGE */}
              <div className="pt-3 border-t border-stone-200 space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-current" />
                    <h4 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
                      Groupe WhatsApp Officiel & Code QR Dédié
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366] text-slate-950">
                    Spécifique à ce Package
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nom du Groupe WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      value={formPkg.whatsappGroupName || ''}
                      onChange={(e) => setFormPkg({ ...formPkg, whatsappGroupName: e.target.value })}
                      placeholder="Ex: EVA Voyages - Hajj Prestige 2026 🕋"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Lien d'invitation au Groupe WhatsApp *
                    </label>
                    <input
                      type="url"
                      required
                      value={formPkg.whatsappGroupLink || ''}
                      onChange={(e) => setFormPkg({ ...formPkg, whatsappGroupLink: e.target.value })}
                      placeholder="https://chat.whatsapp.com/invite/..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs bg-white"
                    />
                  </div>

                  {/* QR Code Inserter for Package */}
                  <div className="sm:col-span-2 pt-2 border-t border-emerald-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4 flex flex-col items-center">
                        <div className="relative w-28 h-28 bg-white rounded-2xl p-1.5 border-2 border-[#25D366] shadow-sm flex items-center justify-center">
                          <img
                            src={
                              formPkg.whatsappQrCodeUrl ||
                              `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                                formPkg.whatsappGroupLink || 'https://chat.whatsapp.com/invite/EVAPackage'
                              )}`
                            }
                            alt="QR WhatsApp"
                            className="w-full h-full object-contain rounded-xl"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-6 h-6 rounded-full bg-white p-0.5 shadow-sm flex items-center justify-center border border-[#25D366]/40">
                              <img src="/assets/whatsapp_logo.png" alt="WA" className="w-4 h-4 object-contain" />
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-500 mt-1 font-semibold">Aperçu du Code QR</span>
                      </div>

                      <div className="sm:col-span-8 space-y-2">
                        <label className="block font-semibold text-stone-700">
                          Insérer ou Générer le Code QR WhatsApp :
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <label className="px-3 py-1.5 bg-white border border-dashed border-emerald-400 hover:border-emerald-600 rounded-xl cursor-pointer text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center gap-1.5 font-bold text-xs">
                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Importer image QR</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleQrFileUpload(e, false)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleGenerateQrFromLink(undefined, false)}
                            className="px-3 py-1.5 bg-[#135ca5] hover:bg-[#0c3f74] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Générer depuis le lien</span>
                          </button>
                        </div>

                        <input
                          type="text"
                          value={formPkg.whatsappQrCodeUrl || ''}
                          onChange={(e) => setFormPkg({ ...formPkg, whatsappQrCodeUrl: e.target.value })}
                          placeholder="Ou collez l'URL d'une image de QR code..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 font-mono text-[11px] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 mb-1">
                      Description / Rôle du Groupe WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formPkg.whatsappGroupDescription || ''}
                      onChange={(e) => setFormPkg({ ...formPkg, whatsappGroupDescription: e.target.value })}
                      placeholder="Ex: Groupe officiel pour les annonces des vols, les conseils des Imams et l'assistance médicale."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPkg(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 text-stone-700 border border-stone-300 rounded-xl font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl hover:bg-emerald-700 cursor-pointer"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK FULLSCREEN QR CODE ZOOM & PRINT/DOWNLOAD */}
      {quickQrPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-emerald-400 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <img src="/assets/whatsapp_logo.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
                <span className="font-bold text-xs text-stone-900">QR Code WhatsApp Officiel</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickQrPreview(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-sm text-[#135ca5]">{quickQrPreview.title}</h4>
              <p className="text-[11px] text-stone-500 font-medium">{quickQrPreview.whatsappGroupName}</p>
            </div>

            {/* Giant High-Def QR Code Display */}
            <div className="relative w-56 h-56 mx-auto bg-white rounded-2xl p-3 border-4 border-[#25D366] shadow-xl flex items-center justify-center">
              <img
                src={
                  quickQrPreview.whatsappQrCodeUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                    quickQrPreview.whatsappGroupLink || `https://chat.whatsapp.com/invite/EVA${quickQrPreview.id}`
                  )}`
                }
                alt="QR Code WhatsApp"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-white p-1 shadow-md flex items-center justify-center border-2 border-[#25D366]">
                  <img src="/assets/whatsapp_logo.png" alt="WA" className="w-6 h-6 object-contain" />
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[11px] font-mono text-stone-700 truncate">
              {quickQrPreview.whatsappGroupLink}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <a
                href={
                  quickQrPreview.whatsappQrCodeUrl ||
                  `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                    quickQrPreview.whatsappGroupLink || ''
                  )}`
                }
                download={`QR_WhatsApp_${quickQrPreview.title.replace(/\s+/g, '_')}.png`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </a>

              {quickQrPreview.whatsappGroupLink && (
                <button
                  type="button"
                  onClick={() => handleCopyLink(quickQrPreview.whatsappGroupLink!)}
                  className="px-4 py-2 bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedLink === quickQrPreview.whatsappGroupLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier Lien</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
