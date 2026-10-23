import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Layers,
  PieChart as PieIcon,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface MonthlyStats {
  monthKey: string; // "2026-03"
  monthLabel: string; // "Mars 2026"
  shortLabel: string; // "Mar 26"
  waveVolume: number;
  omVolume: number;
  totalVolume: number;
  waveCount: number;
  omCount: number;
  totalCount: number;
  wavePercent: number;
  omPercent: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const { dossiers, formatFCFA, agencyConfig } = useApp();

  const [chartType, setChartType] = useState<'BAR' | 'STACKED' | 'AREA'>('BAR');
  const [metricMode, setMetricMode] = useState<'VOLUME' | 'COUNT'>('VOLUME');
  const [periodFilter, setPeriodFilter] = useState<'ALL' | '6_MONTHS' | '2026'>('ALL');

  // Colors
  const WAVE_COLOR = '#0ea5e9'; // Vibrant cyan-blue
  const OM_COLOR = '#ff7900'; // Official Orange Money vibrant orange
  const TOTAL_COLOR = '#10b981';

  // Aggregate all transactions from all dossiers
  const allTransactions = useMemo(() => {
    return dossiers.flatMap((d) =>
      d.payment.transactions.map((tx) => ({
        ...tx,
        dossierTrackingCode: d.trackingCode,
        pilgrimName: `${d.personalInfo.firstName} ${d.personalInfo.lastName}`,
        packageTitle: d.packageSnapshot.title,
        packageType: d.packageSnapshot.type,
      }))
    );
  }, [dossiers]);

  // Aggregate monthly data
  const monthlyData = useMemo(() => {
    const monthMap: Record<
      string,
      {
        waveVolume: number;
        omVolume: number;
        waveCount: number;
        omCount: number;
      }
    > = {};

    allTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      if (isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;

      if (!monthMap[key]) {
        monthMap[key] = { waveVolume: 0, omVolume: 0, waveCount: 0, omCount: 0 };
      }

      if (tx.method === 'WAVE') {
        monthMap[key].waveVolume += tx.amountFCFA;
        monthMap[key].waveCount += 1;
      } else {
        monthMap[key].omVolume += tx.amountFCFA;
        monthMap[key].omCount += 1;
      }
    });

    // Sort chronologically
    const sortedKeys = Object.keys(monthMap).sort();

    const formatted: MonthlyStats[] = sortedKeys.map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1;
      const d = new Date(year, monthIndex, 1);

      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      const shortLabel = d.toLocaleDateString('fr-FR', { month: 'short' }) + ' ' + String(year).slice(-2);

      const waveVol = monthMap[key].waveVolume;
      const omVol = monthMap[key].omVolume;
      const totalVol = waveVol + omVol;
      const waveCnt = monthMap[key].waveCount;
      const omCnt = monthMap[key].omCount;
      const totalCnt = waveCnt + omCnt;

      return {
        monthKey: key,
        monthLabel: capitalizedLabel,
        shortLabel,
        waveVolume: waveVol,
        omVolume: omVol,
        totalVolume: totalVol,
        waveCount: waveCnt,
        omCount: omCnt,
        totalCount: totalCnt,
        wavePercent: totalVol > 0 ? Math.round((waveVol / totalVol) * 100) : 0,
        omPercent: totalVol > 0 ? Math.round((omVol / totalVol) * 100) : 0,
      };
    });

    return formatted;
  }, [allTransactions]);

  // Filtered monthly data
  const filteredData = useMemo(() => {
    if (periodFilter === '6_MONTHS') {
      return monthlyData.slice(-6);
    }
    if (periodFilter === '2026') {
      return monthlyData.filter((m) => m.monthKey.startsWith('2026'));
    }
    return monthlyData;
  }, [monthlyData, periodFilter]);

  // High-level metrics
  const totalWave = useMemo(() => allTransactions.filter((t) => t.method === 'WAVE').reduce((acc, t) => acc + t.amountFCFA, 0), [allTransactions]);
  const totalOM = useMemo(() => allTransactions.filter((t) => t.method === 'ORANGE_MONEY').reduce((acc, t) => acc + t.amountFCFA, 0), [allTransactions]);
  const totalVolume = totalWave + totalOM;

  const countWave = useMemo(() => allTransactions.filter((t) => t.method === 'WAVE').length, [allTransactions]);
  const countOM = useMemo(() => allTransactions.filter((t) => t.method === 'ORANGE_MONEY').length, [allTransactions]);
  const totalCount = countWave + countOM;

  const avgWave = countWave > 0 ? Math.round(totalWave / countWave) : 0;
  const avgOM = countOM > 0 ? Math.round(totalOM / countOM) : 0;

  // Best performing month
  const bestMonth = useMemo(() => {
    if (monthlyData.length === 0) return null;
    return [...monthlyData].sort((a, b) => b.totalVolume - a.totalVolume)[0];
  }, [monthlyData]);

  // Pie chart data
  const pieData = [
    { name: 'Wave Sénégal', value: totalWave, color: WAVE_COLOR, count: countWave },
    { name: 'Orange Money', value: totalOM, color: OM_COLOR, count: countOM },
  ];

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Mois', 'Volume Wave (FCFA)', 'Volume Orange Money (FCFA)', 'Total Encaissé (FCFA)', 'Nb Tx Wave', 'Nb Tx OM', 'Total Transactions', 'Part Wave %'];
    const rows = filteredData.map((m) => [
      `"${m.monthLabel}"`,
      m.waveVolume,
      m.omVolume,
      m.totalVolume,
      m.waveCount,
      m.omCount,
      m.totalCount,
      `${m.wavePercent}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Paiements_Wave_OM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload as MonthlyStats;
      if (!dataPoint) return null;

      return (
        <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[220px]">
          <div className="font-bold text-sm text-stone-100 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>{dataPoint.monthLabel}</span>
            <span className="text-[10px] text-stone-400 font-mono font-normal">
              {dataPoint.totalCount} règlements
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
                Wave :
              </span>
              <span className="font-bold text-[#0ea5e9] tabular-nums">
                {metricMode === 'VOLUME' ? formatFCFA(dataPoint.waveVolume) : `${dataPoint.waveCount} tx`}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff7900]" />
                Orange Money :
              </span>
              <span className="font-bold text-[#ff7900] tabular-nums">
                {metricMode === 'VOLUME' ? formatFCFA(dataPoint.omVolume) : `${dataPoint.omCount} tx`}
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-stone-200">
              <span className="font-sans font-bold">Total Encaissé :</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {metricMode === 'VOLUME' ? formatFCFA(dataPoint.totalVolume) : `${dataPoint.totalCount} tx`}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
              <span>Ratio Wave / OM :</span>
              <span>{dataPoint.wavePercent}% / {dataPoint.omPercent}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-[#135ca5] text-white rounded-xl">
              <BarChart3 className="w-4 h-4 text-[#f15a24]" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              Analytiques des Paiements Wave & Orange Money
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Suivi mensuel des volumes financiers encaissés, ventilation comparative des passerelles mobiles et tendances de trésorerie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total General */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume Total Encaissé</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-sans tabular-nums">
            {formatFCFA(totalVolume)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>Transactions réussies :</span>
            <span className="font-semibold text-stone-800 font-mono">{totalCount} opérations</span>
          </div>
        </div>

        {/* Total Wave */}
        <div className="bg-white p-5 rounded-3xl border border-[#0ea5e9]/30 bg-gradient-to-br from-white to-sky-50/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#0369a1]">
              <div className="w-5 h-5 rounded-full bg-white p-0.5 border border-sky-200 shadow-2xs flex items-center justify-center shrink-0">
                <img
                  src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                  alt="Wave"
                  className="w-full h-full object-contain"
                />
              </div>
              <span>Wave Sénégal</span>
            </span>
            <span className="text-xs font-bold text-[#0284c7] bg-sky-100 px-2 py-0.5 rounded-full">
              {totalVolume > 0 ? Math.round((totalWave / totalVolume) * 100) : 0}% du volume
            </span>
          </div>
          <div className="text-2xl font-black text-[#0369a1] font-sans tabular-nums">
            {formatFCFA(totalWave)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>{countWave} paiements · Panier moyen :</span>
            <span className="font-semibold text-[#0369a1] font-mono">{formatFCFA(avgWave)}</span>
          </div>
        </div>

        {/* Total Orange Money */}
        <div className="bg-white p-5 rounded-3xl border border-[#ff7900]/30 bg-gradient-to-br from-white to-orange-50/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-600">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-[#c2410c]">
              <div className="w-5 h-5 rounded-md bg-white p-0.5 border border-orange-200 shadow-2xs flex items-center justify-center shrink-0">
                <img
                  src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                  alt="Orange Money"
                  className="w-full h-full object-contain"
                />
              </div>
              <span>Orange Money</span>
            </span>
            <span className="text-xs font-bold text-[#ea580c] bg-orange-100 px-2 py-0.5 rounded-full">
              {totalVolume > 0 ? Math.round((totalOM / totalVolume) * 100) : 0}% du volume
            </span>
          </div>
          <div className="text-2xl font-black text-[#c2410c] font-sans tabular-nums">
            {formatFCFA(totalOM)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>{countOM} paiements · Panier moyen :</span>
            <span className="font-semibold text-[#c2410c] font-mono">{formatFCFA(avgOM)}</span>
          </div>
        </div>

        {/* Best Month Peak */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Mois Record de Caisse</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-xl font-black text-stone-900 truncate">
            {bestMonth ? bestMonth.monthLabel : 'N/A'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>Record encaissé :</span>
            <span className="font-semibold text-emerald-800 font-mono">
              {bestMonth ? formatFCFA(bestMonth.totalVolume) : '0 FCFA'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Analytics Card with Recharts */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
        {/* Chart Controls Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Évolution Mensuelle des Encaissements par Opérateur</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Comparatif direct entre Wave Sénégal et Orange Money par mois calendaire
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Metric Mode: Volume vs Count */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMetricMode('VOLUME')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  metricMode === 'VOLUME' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Volume (FCFA)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('COUNT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  metricMode === 'COUNT' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Nombre Transactions
              </button>
            </div>

            {/* Chart Type: Bar, Stacked, Area */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartType('BAR')}
                className={`p-1.5 px-2.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  chartType === 'BAR' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
                title="Barres groupées"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Groupé</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('STACKED')}
                className={`p-1.5 px-2.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  chartType === 'STACKED' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
                title="Barres empilées"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Empilé</span>
              </button>
              <button
                type="button"
                onClick={() => setChartType('AREA')}
                className={`p-1.5 px-2.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                  chartType === 'AREA' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
                title="Courbe d'évolution continue"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Tendance</span>
              </button>
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPeriodFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  periodFilter === 'ALL' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                Tout ({monthlyData.length} mois)
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('2026')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  periodFilter === '2026' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                2026
              </button>
              <button
                type="button"
                onClick={() => setPeriodFilter('6_MONTHS')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  periodFilter === '6_MONTHS' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'
                }`}
              >
                6 Derniers Mois
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'AREA' ? (
              <AreaChart data={filteredData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={WAVE_COLOR} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={WAVE_COLOR} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="omGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={OM_COLOR} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={OM_COLOR} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => (metricMode === 'VOLUME' ? `${(val / 1000000).toFixed(1)}M` : `${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => (value === 'waveVolume' || value === 'waveCount' ? 'Wave Sénégal' : 'Orange Money')}
                />
                <Area
                  type="monotone"
                  dataKey={metricMode === 'VOLUME' ? 'waveVolume' : 'waveCount'}
                  stroke={WAVE_COLOR}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#waveGradient)"
                  name={metricMode === 'VOLUME' ? 'waveVolume' : 'waveCount'}
                />
                <Area
                  type="monotone"
                  dataKey={metricMode === 'VOLUME' ? 'omVolume' : 'omCount'}
                  stroke={OM_COLOR}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#omGradient)"
                  name={metricMode === 'VOLUME' ? 'omVolume' : 'omCount'}
                />
              </AreaChart>
            ) : (
              <BarChart data={filteredData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => (metricMode === 'VOLUME' ? `${(val / 1000000).toFixed(1)}M` : `${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  formatter={(value) => (value === 'waveVolume' || value === 'waveCount' ? 'Wave Sénégal' : 'Orange Money')}
                />
                <Bar
                  dataKey={metricMode === 'VOLUME' ? 'waveVolume' : 'waveCount'}
                  fill={WAVE_COLOR}
                  stackId={chartType === 'STACKED' ? 'a' : undefined}
                  radius={chartType === 'STACKED' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                  name={metricMode === 'VOLUME' ? 'waveVolume' : 'waveCount'}
                  barSize={chartType === 'STACKED' ? 28 : 20}
                />
                <Bar
                  dataKey={metricMode === 'VOLUME' ? 'omVolume' : 'omCount'}
                  fill={OM_COLOR}
                  stackId={chartType === 'STACKED' ? 'a' : undefined}
                  radius={chartType === 'STACKED' ? [6, 6, 0, 0] : [6, 6, 0, 0]}
                  name={metricMode === 'VOLUME' ? 'omVolume' : 'omCount'}
                  barSize={chartType === 'STACKED' ? 28 : 20}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend notes */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-[#0ea5e9]" />
              Wave Sénégal : 1% de frais max, encaissement direct QR et push SMS
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded-md bg-[#ff7900]" />
              Orange Money : Réseau UEMOA, validation code secret et USSD
            </span>
          </div>

          <span className="text-[11px] text-stone-400">
            Données actualisées en temps réel selon les règlements confirmés en caisse.
          </span>
        </div>
      </div>

      {/* 2-Column: Monthly Table Breakdown & Global Market Share Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Data Table (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Récapitulatif Financier Mensuel Détaillé
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              {filteredData.length} périodes analysées
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Mois</th>
                  <th className="px-4 py-3 text-right">Wave (FCFA)</th>
                  <th className="px-4 py-3 text-right">Orange Money (FCFA)</th>
                  <th className="px-4 py-3 text-right">Total Période</th>
                  <th className="px-4 py-3 text-center">Part Wave / OM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {filteredData.map((m) => (
                  <tr key={m.monthKey} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-sans font-bold text-stone-900 whitespace-nowrap">
                      {m.monthLabel}
                    </td>

                    <td className="px-4 py-3 text-right text-[#0284c7] font-semibold tabular-nums">
                      {formatFCFA(m.waveVolume)}
                      <span className="text-[10px] text-stone-400 block font-normal">
                        {m.waveCount} tx
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-[#ea580c] font-semibold tabular-nums">
                      {formatFCFA(m.omVolume)}
                      <span className="text-[10px] text-stone-400 block font-normal">
                        {m.omCount} tx
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-stone-900 tabular-nums">
                      {formatFCFA(m.totalVolume)}
                      <span className="text-[10px] text-stone-400 block font-normal font-sans">
                        {m.totalCount} règlements
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-[#0284c7] text-[10px] font-bold">
                          {m.wavePercent}%
                        </span>
                        <span className="text-stone-300">/</span>
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#ea580c] text-[10px] font-bold">
                          {m.omPercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 font-bold border-t-2 border-stone-200">
                <tr>
                  <td className="px-4 py-3 font-sans text-stone-900">Total Cumulé :</td>
                  <td className="px-4 py-3 text-right text-[#0284c7] font-mono tabular-nums">
                    {formatFCFA(filteredData.reduce((acc, m) => acc + m.waveVolume, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-[#ea580c] font-mono tabular-nums">
                    {formatFCFA(filteredData.reduce((acc, m) => acc + m.omVolume, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-800 font-mono text-sm tabular-nums">
                    {formatFCFA(filteredData.reduce((acc, m) => acc + m.totalVolume, 0))}
                  </td>
                  <td className="px-4 py-3 text-center font-sans text-[11px] text-stone-600">
                    {totalVolume > 0 ? Math.round((totalWave / totalVolume) * 100) : 0}% Wave ·{' '}
                    {totalVolume > 0 ? Math.round((totalOM / totalVolume) * 100) : 0}% OM
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Global Market Share Pie Chart (1 column) */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Part de Marché Globale des Opérateurs
            </h3>
            <p className="text-xs text-stone-500">
              Proportion des flux encaissés sur l'ensemble de la saison
            </p>

            <div className="h-[210px] w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatFCFA(Number(value)), 'Volume']}
                    contentStyle={{ borderRadius: '16px', fontSize: '12px', background: '#020617', color: '#fff', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total</span>
                <span className="text-xs font-mono font-black text-stone-900">
                  {formatFCFA(totalVolume)}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white p-0.5 border border-sky-200 shadow-2xs flex items-center justify-center shrink-0">
                    <img
                      src={agencyConfig.waveLogoUrl || '/assets/wave_logo.png'}
                      alt="Wave"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-bold text-sky-950">Wave Digital</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sky-900 block">
                    {formatFCFA(totalWave)}
                  </span>
                  <span className="text-[10px] text-sky-700 font-semibold">
                    {totalVolume > 0 ? ((totalWave / totalVolume) * 100).toFixed(1) : 0}% · {countWave} tx
                  </span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white p-0.5 border border-orange-200 shadow-2xs flex items-center justify-center shrink-0">
                    <img
                      src={agencyConfig.orangeMoneyLogoUrl || '/assets/orange_money_logo.png'}
                      alt="Orange Money"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-bold text-orange-950">Orange Money</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-orange-900 block">
                    {formatFCFA(totalOM)}
                  </span>
                  <span className="text-[10px] text-orange-700 font-semibold">
                    {totalVolume > 0 ? ((totalOM / totalVolume) * 100).toFixed(1) : 0}% · {countOM} tx
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-600 mt-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tous les encaissements sont conciliés et certifiés avec les relevés bancaires agence.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
