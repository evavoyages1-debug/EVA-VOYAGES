import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PilgrimDossier, WorkflowStatus } from '../../types';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  CreditCard,
  Plus,
  MessageCircle,
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Building2,
  User,
  ShieldCheck,
  Check,
  Plane,
  FolderDown,
} from 'lucide-react';
import { DossierDetailModal } from './DossierDetailModal';
import { PilgrimDocumentsModal } from './PilgrimDocumentsModal';
import { generatePdfReceipt } from '../../utils/generatePdfReceipt';

export const DossierCRM: React.FC = () => {
  const {
    dossiers,
    packages,
    formatFCFA,
    selectedDossierId,
    setSelectedDossierId,
    setPilgrimActiveTab,
    setCurrentView,
    agencyConfig,
  } = useApp();

  // Search & Filters State
  const [search, setSearch] = useState<string>('');
  const [packageFilter, setPackageFilter] = useState<string>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID'>('ALL');
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState<string>('ALL');
  const [packageTypeFilter, setPackageTypeFilter] = useState<'ALL' | 'HAJJ' | 'OUMRA'>('ALL');
  const [whatsappStatusFilter, setWhatsappStatusFilter] = useState<'ALL' | 'JOINED' | 'INVITATION_SENT' | 'PENDING'>('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Sorting and Pagination State for high volumes
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'NAME_ASC' | 'NAME_DESC' | 'PAID_DESC' | 'BALANCE_DESC'>('DATE_DESC');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [inspectDossier, setInspectDossier] = useState<PilgrimDossier | null>(() => {
    return selectedDossierId ? dossiers.find((d) => d.id === selectedDossierId) || null : null;
  });
  const [documentsModalDossier, setDocumentsModalDossier] = useState<PilgrimDossier | null>(null);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (packageFilter !== 'ALL') count++;
    if (paymentStatusFilter !== 'ALL') count++;
    if (workflowStatusFilter !== 'ALL') count++;
    if (packageTypeFilter !== 'ALL') count++;
    if (whatsappStatusFilter !== 'ALL') count++;
    return count;
  }, [search, packageFilter, paymentStatusFilter, workflowStatusFilter, packageTypeFilter, whatsappStatusFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setPackageFilter('ALL');
    setPaymentStatusFilter('ALL');
    setWorkflowStatusFilter('ALL');
    setPackageTypeFilter('ALL');
    setWhatsappStatusFilter('ALL');
    setCurrentPage(1);
  };

  // Filter and Sort
  const filteredDossiers = useMemo(() => {
    const q = search.trim().toLowerCase();

    const list = dossiers.filter((d) => {
      // 1. Search by Name (first name, last name), Code, Phone, Passport
      const fullName = `${d.personalInfo.firstName} ${d.personalInfo.lastName}`.toLowerCase();
      const reverseFullName = `${d.personalInfo.lastName} ${d.personalInfo.firstName}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        reverseFullName.includes(q) ||
        d.trackingCode.toLowerCase().includes(q) ||
        d.personalInfo.phone.includes(q) ||
        d.personalInfo.passportNumber.toLowerCase().includes(q) ||
        (d.personalInfo.email && d.personalInfo.email.toLowerCase().includes(q));

      // 2. Filter by Package
      const matchesPackage = packageFilter === 'ALL' || d.packageId === packageFilter;

      // 3. Filter by Payment Status
      let matchesPayment = true;
      if (paymentStatusFilter === 'PAID') {
        matchesPayment = d.payment.remainingBalanceFCFA === 0 || d.payment.paymentStatus === 'PAID';
      } else if (paymentStatusFilter === 'PARTIAL') {
        matchesPayment =
          d.payment.amountPaidFCFA > 0 &&
          d.payment.remainingBalanceFCFA > 0 &&
          d.payment.paymentStatus !== 'PAID';
      } else if (paymentStatusFilter === 'UNPAID') {
        matchesPayment = d.payment.amountPaidFCFA === 0 || d.payment.paymentStatus === 'UNPAID';
      }

      // 4. Filter by Workflow Status
      const matchesWorkflow = workflowStatusFilter === 'ALL' || d.workflowStatus === workflowStatusFilter;

      // 5. Filter by Package Type (Hajj vs Oumra)
      const matchesPackageType =
        packageTypeFilter === 'ALL' || d.packageSnapshot.type === packageTypeFilter;

      // 6. Filter by WhatsApp Status
      const matchesWhatsapp =
        whatsappStatusFilter === 'ALL' ||
        (whatsappStatusFilter === 'JOINED' && d.whatsappStatus === 'JOINED') ||
        (whatsappStatusFilter === 'INVITATION_SENT' && d.whatsappStatus === 'INVITATION_SENT') ||
        (whatsappStatusFilter === 'PENDING' && (!d.whatsappStatus || d.whatsappStatus === 'PENDING'));

      return matchesSearch && matchesPackage && matchesPayment && matchesWorkflow && matchesPackageType && matchesWhatsapp;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'DATE_ASC') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'NAME_ASC') {
        const nameA = `${a.personalInfo.lastName} ${a.personalInfo.firstName}`.toLowerCase();
        const nameB = `${b.personalInfo.lastName} ${b.personalInfo.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'NAME_DESC') {
        const nameA = `${a.personalInfo.lastName} ${a.personalInfo.firstName}`.toLowerCase();
        const nameB = `${b.personalInfo.lastName} ${b.personalInfo.firstName}`.toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortBy === 'PAID_DESC') {
        return b.payment.amountPaidFCFA - a.payment.amountPaidFCFA;
      }
      if (sortBy === 'BALANCE_DESC') {
        return b.payment.remainingBalanceFCFA - a.payment.remainingBalanceFCFA;
      }
      return 0;
    });
  }, [
    dossiers,
    search,
    packageFilter,
    paymentStatusFilter,
    workflowStatusFilter,
    packageTypeFilter,
    whatsappStatusFilter,
    sortBy,
  ]);

  // Aggregate Stats on Filtered Data
  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalTarget = 0;
    let countPaid = 0;
    let countPartial = 0;
    let countUnpaid = 0;

    filteredDossiers.forEach((d) => {
      totalPaid += d.payment.amountPaidFCFA;
      totalTarget += d.payment.totalAmountFCFA;
      if (d.payment.remainingBalanceFCFA === 0 || d.payment.paymentStatus === 'PAID') {
        countPaid++;
      } else if (d.payment.amountPaidFCFA > 0) {
        countPartial++;
      } else {
        countUnpaid++;
      }
    });

    const totalRemaining = Math.max(0, totalTarget - totalPaid);
    const globalPercent = totalTarget > 0 ? Math.round((totalPaid / totalTarget) * 100) : 0;

    return { totalPaid, totalTarget, totalRemaining, globalPercent, countPaid, countPartial, countUnpaid };
  }, [filteredDossiers]);

  // Pagination calculation
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(filteredDossiers.length / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDossiers = useMemo(() => {
    if (pageSize === -1) return filteredDossiers;
    const start = (effectiveCurrentPage - 1) * pageSize;
    return filteredDossiers.slice(start, start + pageSize);
  }, [filteredDossiers, effectiveCurrentPage, pageSize]);

  const handleExportCSV = () => {
    const headers =
      'Code Dossier,Nom,Prenom,Telephone,Email,Passeport,Package,Type,Statut Dossier,Statut Paiement,Paye (FCFA),Total (FCFA),Reste (FCFA)\n';
    const rows = filteredDossiers
      .map((d) => {
        const payStatus =
          d.payment.remainingBalanceFCFA === 0
            ? 'SOLDE'
            : d.payment.amountPaidFCFA > 0
            ? 'ACOMPTE_PARTIEL'
            : 'NON_PAYE';
        return `"${d.trackingCode}","${d.personalInfo.lastName}","${d.personalInfo.firstName}","${d.personalInfo.phone}","${
          d.personalInfo.email || ''
        }","${d.personalInfo.passportNumber}","${d.packageSnapshot.title}","${d.packageSnapshot.type}","${
          d.workflowStatus
        }","${payStatus}",${d.payment.amountPaidFCFA},${d.payment.totalAmountFCFA},${d.payment.remainingBalanceFCFA}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EVA_VOYAGES_Pelerins_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadge = (status: WorkflowStatus) => {
    const map: Record<WorkflowStatus, { label: string; class: string }> = {
      DOCUMENTS_PENDING: { label: 'Doc. Manquants', class: 'bg-red-50 text-red-700 border-red-200' },
      UNDER_REVIEW: { label: 'En Examen', class: 'bg-amber-50 text-amber-800 border-amber-200' },
      DOCUMENTS_APPROVED: { label: 'Docs Validés', class: 'bg-blue-50 text-blue-800 border-blue-200' },
      FLIGHT_TICKET_ISSUED: { label: 'Billet & Vol Confirmés', class: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      READY_FOR_DEPARTURE: { label: 'Prêt Embarquement', class: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
      COMPLETED: { label: 'Accompli', class: 'bg-stone-100 text-stone-800 border-stone-200' },
    };

    const s = map[status] || { label: status, class: 'bg-stone-50 text-stone-700' };
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${s.class} whitespace-nowrap`}>
        {s.label}
      </span>
    );
  };

  const paymentBadge = (dossier: PilgrimDossier) => {
    const isPaid = dossier.payment.remainingBalanceFCFA === 0 || dossier.payment.paymentStatus === 'PAID';
    const isPartial = dossier.payment.amountPaidFCFA > 0 && !isPaid;

    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
          <span>Soldé (100%)</span>
        </span>
      );
    }
    if (isPartial) {
      const pct = Math.round((dossier.payment.amountPaidFCFA / dossier.payment.totalAmountFCFA) * 100);
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-700" />
          <span>Acompte ({pct}%)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        <span>Non payé</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">CRM Centralisé des Pèlerins</h2>
            <span className="text-xs bg-slate-900 text-white font-mono px-2 py-0.5 rounded-full font-bold">
              {filteredDossiers.length} {filteredDossiers.length > 1 ? 'dossiers' : 'dossier'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Recherche avancée multicritères, gestion des cohortes volumineuses, contrôle des visas Nusuk et encaissements Wave / OM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Exporter les pèlerins filtrés en fichier CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#f15a24]" />
            <span>Exporter CSV ({filteredDossiers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentView('PILGRIM');
              setPilgrimActiveTab('REGISTER');
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Inscrire un Pèlerin</span>
          </button>
        </div>
      </div>

      {/* SEARCH & ADVANCED FILTERS PANEL */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        {/* Row 1: Main Search Bar + Quick Operator & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Nom / Mot-clé search */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par Nom, Prénom, Code Dossier, Passeport ou Téléphone..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs bg-stone-50/50 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre 1: Package */}
          <div className="md:col-span-3">
            <select
              value={packageFilter}
              onChange={(e) => {
                setPackageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 rounded-2xl border border-stone-300 bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ALL">Tous les Packages ({packages.length})</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.type === 'HAJJ' ? '🕋 [Hajj]' : '🌙 [Oumra]'} {pkg.title}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre 2: Statut de Paiement */}
          <div className="md:col-span-2">
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all focus:ring-2 focus:ring-emerald-700 ${
                paymentStatusFilter === 'PAID'
                  ? 'border-emerald-400 bg-emerald-50/70 text-emerald-900'
                  : paymentStatusFilter === 'PARTIAL'
                  ? 'border-amber-400 bg-amber-50/70 text-amber-900'
                  : paymentStatusFilter === 'UNPAID'
                  ? 'border-rose-400 bg-rose-50/70 text-rose-900'
                  : 'border-stone-300 bg-white text-stone-700'
              }`}
            >
              <option value="ALL">Paiement : Tous</option>
              <option value="PAID">✅ Soldés (100% payé)</option>
              <option value="PARTIAL">⏳ Acomptes versés</option>
              <option value="UNPAID">❌ Non payés (0 FCFA)</option>
            </select>
          </div>

          {/* Button to toggle Advanced Filters */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtres Avancés</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#f15a24] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Quick Filter Badges (Statut Paiement & Type Voyage) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          {/* Quick Segmented Payment Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
              Règlement :
            </span>
            <button
              type="button"
              onClick={() => {
                setPaymentStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                paymentStatusFilter === 'ALL'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tous ({dossiers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentStatusFilter('PAID');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                paymentStatusFilter === 'PAID'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Soldés 100%</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentStatusFilter('PARTIAL');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                paymentStatusFilter === 'PARTIAL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Acomptes en cours</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentStatusFilter('UNPAID');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                paymentStatusFilter === 'UNPAID'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Non payés</span>
            </button>
          </div>

          {/* Quick Package Type Segment */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
              Type :
            </span>
            <button
              type="button"
              onClick={() => {
                setPackageTypeFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                packageTypeFilter === 'ALL'
                  ? 'bg-[#135ca5] text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => {
                setPackageTypeFilter('HAJJ');
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                packageTypeFilter === 'HAJJ'
                  ? 'bg-[#135ca5] text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              🕋 Hajj 1447H
            </button>
            <button
              type="button"
              onClick={() => {
                setPackageTypeFilter('OUMRA');
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                packageTypeFilter === 'OUMRA'
                  ? 'bg-[#135ca5] text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              🌙 Oumra
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#135ca5]" />
                <span>Paramètres de Filtrage & Tri Avancés</span>
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-stone-500 hover:text-red-700 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser tous les filtres</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Statut Workflow / Dossier */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Statut Administratif & Vol
                </label>
                <select
                  value={workflowStatusFilter}
                  onChange={(e) => {
                    setWorkflowStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                >
                  <option value="ALL">Tous les statuts de dossier</option>
                  <option value="DOCUMENTS_PENDING">Documents Manquants</option>
                  <option value="UNDER_REVIEW">En Examen Administratif</option>
                  <option value="DOCUMENTS_APPROVED">Documents Validés</option>
                  <option value="FLIGHT_TICKET_ISSUED">Billet d'Avion & Vol Confirmés</option>
                  <option value="READY_FOR_DEPARTURE">Prêt à l'Embarquement</option>
                  <option value="COMPLETED">Pèlerinage Accompli</option>
                </select>
              </div>

              {/* Statut Groupe WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Intégration WhatsApp
                </label>
                <select
                  value={whatsappStatusFilter}
                  onChange={(e) => {
                    setWhatsappStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                >
                  <option value="ALL">Tous les états WhatsApp</option>
                  <option value="JOINED">Discussion rejointe (Actif)</option>
                  <option value="INVITATION_SENT">Invitation SMS envoyée</option>
                  <option value="PENDING">À inviter / Non intégré</option>
                </select>
              </div>

              {/* Tri des résultats */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Trier la cohorte par</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                >
                  <option value="DATE_DESC">Date d'inscription (Plus récent d'abord)</option>
                  <option value="DATE_ASC">Date d'inscription (Plus ancien d'abord)</option>
                  <option value="NAME_ASC">Nom du pèlerin (A à Z)</option>
                  <option value="NAME_DESC">Nom du pèlerin (Z à A)</option>
                  <option value="PAID_DESC">Montant encaissé (Décroissant)</option>
                  <option value="BALANCE_DESC">Solde restant dû (Décroissant)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Active Filters Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-stone-400">Filtres actifs :</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-stone-800 font-medium">
                <span>Recherche: "{search}"</span>
                <X className="w-3 h-3 cursor-pointer text-stone-500 hover:text-stone-900" onClick={() => setSearch('')} />
              </span>
            )}

            {packageFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-[#135ca5] font-medium border border-blue-200">
                <span>Package: {packages.find((p) => p.id === packageFilter)?.title || packageFilter}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPackageFilter('ALL')} />
              </span>
            )}

            {paymentStatusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-medium border border-amber-200">
                <span>
                  Paiement :{' '}
                  {paymentStatusFilter === 'PAID'
                    ? 'Soldé 100%'
                    : paymentStatusFilter === 'PARTIAL'
                    ? 'Acompte versé'
                    : 'Non payé'}
                </span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPaymentStatusFilter('ALL')} />
              </span>
            )}

            {workflowStatusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 font-medium border border-purple-200">
                <span>Statut : {workflowStatusFilter}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setWorkflowStatusFilter('ALL')} />
              </span>
            )}

            {packageTypeFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-900 font-medium border border-indigo-200">
                <span>Type : {packageTypeFilter}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPackageTypeFilter('ALL')} />
              </span>
            )}

            {whatsappStatusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 font-medium border border-emerald-200">
                <span>WhatsApp : {whatsappStatusFilter}</span>
                <X className="w-3 h-3 cursor-pointer" onClick={() => setWhatsappStatusFilter('ALL')} />
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-red-600 hover:text-red-800 ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Tout effacer</span>
            </button>
          </div>
        )}
      </div>

      {/* SYNTHESIS ANALYTICS KPI BAR (Optimized for Large Cohorts) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Pèlerins Filtrés
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-stone-900 font-mono">{filteredDossiers.length}</span>
            <span className="text-[11px] text-stone-400 font-mono">/ {dossiers.length} total</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Soldés (100%)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-emerald-900 font-mono">{stats.countPaid}</span>
            <span className="text-[11px] text-emerald-700">pèlerins</span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
            Acomptes Versés
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-amber-900 font-mono">{stats.countPartial}</span>
            <span className="text-[11px] text-amber-700">partiels</span>
          </div>
        </div>

        <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
            Non Payés
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-black text-rose-900 font-mono">{stats.countUnpaid}</span>
            <span className="text-[11px] text-rose-700">en attente</span>
          </div>
        </div>

        <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0369a1] block">
            Encaissé Sélection
          </span>
          <div className="text-sm font-black text-[#0369a1] font-mono truncate mt-0.5">
            {formatFCFA(stats.totalPaid)}
          </div>
        </div>
      </div>

      {/* Central Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Code Dossier</th>
                <th className="px-5 py-3">Pèlerin (Nom & Prénom)</th>
                <th className="px-5 py-3">Package & Formule</th>
                <th className="px-5 py-3">Groupe WhatsApp</th>
                <th className="px-5 py-3">Passeport</th>
                <th className="px-5 py-3">Statut Dossier</th>
                <th className="px-5 py-3 text-right">Règlement & Statut</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {paginatedDossiers.map((dossier) => (
                <tr
                  key={dossier.id}
                  className="hover:bg-stone-50/80 transition-colors cursor-pointer group"
                  onClick={() => setInspectDossier(dossier)}
                >
                  {/* Code */}
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-950 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 group-hover:bg-emerald-100/60 transition-colors">
                      {dossier.trackingCode}
                    </span>
                  </td>

                  {/* Pilgrim Name & Contact */}
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{dossier.personalInfo.lastName.toUpperCase()} {dossier.personalInfo.firstName}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                      {dossier.personalInfo.phone}
                    </div>
                  </td>

                  {/* Package */}
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-stone-800 truncate max-w-xs flex items-center gap-1">
                      <span className="text-[11px]">
                        {dossier.packageSnapshot.type === 'HAJJ' ? '🕋' : '🌙'}
                      </span>
                      <span className="truncate">{dossier.packageSnapshot.title}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 capitalize mt-0.5">
                      Chambre {dossier.packageSnapshot.roomType} · {dossier.packageSnapshot.season}
                    </div>
                  </td>

                  {/* WhatsApp Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {dossier.whatsappStatus === 'JOINED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                        <span>Rejoint</span>
                      </span>
                    ) : dossier.whatsappStatus === 'INVITATION_SENT' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-[#135ca5] border border-blue-200 text-[11px] font-bold">
                        <MessageCircle className="w-3.5 h-3.5 text-[#135ca5]" />
                        <span>Invité</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                        <span>À intégrer</span>
                      </span>
                    )}
                    <span className="text-[10px] text-stone-400 block truncate max-w-[130px] mt-0.5">
                      {dossier.packageSnapshot.whatsappGroupName || dossier.packageSnapshot.title}
                    </span>
                  </td>

                  {/* Passport */}
                  <td className="px-5 py-3.5 font-mono text-stone-700 whitespace-nowrap">
                    {dossier.personalInfo.passportNumber ? (
                      <span className="font-semibold">{dossier.personalInfo.passportNumber}</span>
                    ) : (
                      <span className="text-red-500 font-sans text-[11px]">À saisir</span>
                    )}
                  </td>

                  {/* Workflow Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {statusBadge(dossier.workflowStatus)}
                  </td>

                  {/* Payment Breakdown & Status Badge */}
                  <td className="px-5 py-3.5 text-right font-mono whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      {paymentBadge(dossier)}
                    </div>
                    <div className="font-black text-stone-900 tabular-nums">
                      {formatFCFA(dossier.payment.amountPaidFCFA)}
                    </div>
                    <div className="text-[10px] text-stone-400 tabular-nums">
                      / {formatFCFA(dossier.payment.totalAmountFCFA)}
                    </div>
                    {/* Progress Bar */}
                    <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1 ml-auto">
                      <div
                        className={`h-full rounded-full transition-all ${
                          dossier.payment.remainingBalanceFCFA === 0
                            ? 'bg-emerald-500'
                            : dossier.payment.amountPaidFCFA > 0
                            ? 'bg-[#135ca5]'
                            : 'bg-stone-300'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            dossier.payment.totalAmountFCFA > 0
                              ? Math.round(
                                  (dossier.payment.amountPaidFCFA / dossier.payment.totalAmountFCFA) * 100
                                )
                              : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* WhatsApp Share Link */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cleanPhone = dossier.personalInfo.phone.replace(/[^0-9]/g, '');
                          const groupLink =
                            dossier.packageSnapshot.whatsappGroupLink ||
                            'https://chat.whatsapp.com/invite/EVAHajj2026';
                          const msg = `Salam Alaykum ${dossier.personalInfo.firstName}, voici votre lien d'invitation au Groupe WhatsApp officiel ${
                            dossier.packageSnapshot.whatsappGroupName || dossier.packageSnapshot.title
                          } : ${groupLink}`;
                          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#25D366] hover:text-emerald-800 transition-colors"
                        title="Envoyer lien WhatsApp officiel"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Download Official PDF Receipt */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePdfReceipt({
                            dossier,
                            agencyConfig,
                            autoDownload: true,
                          });
                        }}
                        className="p-1.5 rounded-lg bg-orange-50 hover:bg-[#f15a24] text-[#ea580c] hover:text-white transition-colors border border-orange-200"
                        title="Générer & Télécharger le reçu officiel en PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Inspect Dossier Modal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectDossier(dossier);
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-stone-600 transition-colors"
                        title="Ouvrir le dossier complet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredDossiers.length === 0 && (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-stone-700 text-sm">Aucun pèlerin ne correspond à vos filtres</p>
              <p className="text-xs text-stone-400">
                Essayez d'ajuster les filtres par nom, package ou statut de paiement.
              </p>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Réinitialiser tous les filtres
              </button>
            )}
          </div>
        )}

        {/* PAGINATION TOOLBAR FOR LARGE COHORTS */}
        {filteredDossiers.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span>Afficher</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-stone-300 bg-white font-medium"
              >
                <option value={10}>10 pèlerins / page</option>
                <option value={25}>25 pèlerins / page</option>
                <option value={50}>50 pèlerins / page</option>
                <option value={-1}>Tous les pèlerins</option>
              </select>
              <span className="text-stone-400">
                (Affichage de {paginatedDossiers.length} sur {filteredDossiers.length} pèlerins)
              </span>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={effectiveCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 px-2 font-mono font-semibold">
                  <span>Page {effectiveCurrentPage} sur {totalPages}</span>
                </div>

                <button
                  type="button"
                  disabled={effectiveCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inspector Modal */}
      <DossierDetailModal
        dossier={inspectDossier}
        isOpen={!!inspectDossier}
        onClose={() => setInspectDossier(null)}
      />
    </div>
  );
};
