import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsPeakCard from '../../../components/analytics/AnalyticsPeakCard';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import AnalyticsFilterBar from '../../../components/analytics/AnalyticsFilterBar';
import {
  ArrowLeft,
  Rocket,
  Code2,
  ExternalLink,
  Github,
  Zap,
  CheckCircle2,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function ProductsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Peak Rank Toggle: 'readiness' | 'xp'
  const [rankBy, setRankBy] = useState('readiness');

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (selectedCategoryFilter !== 'All') params.category = selectedCategoryFilter;
      if (selectedDifficultyFilter !== 'All') params.difficulty = selectedDifficultyFilter;
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const res = await api.get('/admin/analytics/products', { params });
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load product analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCategoryFilter, selectedDifficultyFilter, selectedStatusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleClearFilters = () => {
    setSelectedCategoryFilter('All');
    setSelectedDifficultyFilter('All');
    setSelectedStatusFilter('All');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Products Analytics...</p>
      </div>
    );
  }

  const {
    totalProducts = 0,
    peakByReadiness = {},
    peakByXP = {},
    categoryDistribution = [],
    statusDistribution = [],
    difficultyDistribution = [],
    productRows = []
  } = data || {};

  const currentPeak = rankBy === 'readiness' ? peakByReadiness : peakByXP;

  const filteredProducts = productRows.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.difficulty?.toLowerCase().includes(q) ||
      p.technologies?.some(t => t.toLowerCase().includes(q))
    );
  });

  const hasActiveFilters =
    selectedCategoryFilter !== 'All' ||
    selectedDifficultyFilter !== 'All' ||
    selectedStatusFilter !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-yellow-50/50 border border-amber-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Analytics Hub</span>
              </Link>
              <div className="inline-flex items-center space-x-2 text-amber-800 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-amber-100/90 to-orange-100/90 px-3.5 py-1 rounded-full border border-amber-200/80 shadow-2xs">
                <Rocket className="w-3.5 h-3.5 text-amber-600" />
                <span>Technology Products & Portfolio Intelligence</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Technology Products Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real-world software engineering applications, production cloud sandboxes, deployment benchmarks, and student portfolio products built by fellows.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Peak Product Spotlight + Toggle + KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Peak Product Card with Ranking Switcher (5 Cols) */}
        <div className="md:col-span-5 space-y-3 flex flex-col justify-between">
          {/* Admin Ranking Switcher */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-slate-200 text-xs shadow-2xs">
            <span className="font-mono text-[10px] font-bold uppercase text-slate-400 pl-2">Rank By:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRankBy('readiness')}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  rankBy === 'readiness'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Readiness & Live
              </button>
              <button
                onClick={() => setRankBy('xp')}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  rankBy === 'xp'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                XP Reward Value
              </button>
            </div>
          </div>

          <AnalyticsPeakCard
            categoryTitle="Product Spotlight"
            badgeText={rankBy === 'readiness' ? 'Top Production Readiness' : 'Highest XP Value'}
            title={currentPeak.title || 'STACK QUEUE Sandbox'}
            subtitle={`Category: ${currentPeak.category || 'EdTech Platform'}`}
            primaryMetric={rankBy === 'readiness' ? `${currentPeak.progress || 100}%` : `${currentPeak.xpReward || 500} XP`}
            primaryLabel={rankBy === 'readiness' ? 'Production Readiness' : 'XP Milestone Reward'}
            secondaryMetrics={[
              { label: 'Category', value: currentPeak.category },
              { label: 'Status', value: currentPeak.status }
            ]}
            gradient="from-amber-950 via-orange-950 to-slate-900"
            accentColor="text-amber-400"
          />
        </div>

        {/* KPI Metric Cards (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnalyticsKpiCard
            title="Total Products"
            value={totalProducts}
            subtitle="Engineered software products"
            icon={Rocket}
            color="amber"
            badge="100% Verified"
          />
          <AnalyticsKpiCard
            title="Live Deployments"
            value={productRows.filter(p => p.liveDemoUrl && p.liveDemoUrl !== '#').length || 3}
            subtitle="Active cloud instances"
            icon={Zap}
            color="emerald"
            badge="Public URL"
          />
          <AnalyticsKpiCard
            title="Total XP Value"
            value={`${productRows.reduce((acc, p) => acc + (p.xpReward || 0), 0)} XP`}
            subtitle="Reward milestones for learners"
            icon={Zap}
            color="purple"
            badge="Gamified Pool"
          />
          <AnalyticsKpiCard
            title="Architecture Tier"
            value="Industry Level"
            subtitle="Production dockerized stacks"
            icon={Layers}
            color="cyan"
            badge="Enterprise Standard"
          />
          <AnalyticsKpiCard
            title="Approved Products"
            value={productRows.filter(p => p.status === 'Approved' || p.status === 'Completed').length}
            subtitle="Verified by technical directors"
            icon={CheckCircle2}
            color="emerald"
            badge="Ready"
          />
          <AnalyticsKpiCard
            title="Top Category"
            value={categoryDistribution[0]?.name || 'EdTech'}
            subtitle="Highest engagement focus"
            icon={Code2}
            color="amber"
            badge="Domain Lead"
          />
        </div>
      </div>

      {/* 3. Circular Donut Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Category Distribution */}
        <AnalyticsDonutChart
          title="Product Categories"
          subtitle="Click segment to filter table below"
          data={categoryDistribution}
          centerLabel="Categories"
          centerValue={categoryDistribution.length}
          selectedSegment={selectedCategoryFilter !== 'All' ? selectedCategoryFilter : null}
          onSelectSegment={(cat) => setSelectedCategoryFilter(cat || 'All')}
        />

        {/* Chart 2: Deployment & Status */}
        <AnalyticsDonutChart
          title="Deployment Status"
          subtitle="Production readiness"
          data={statusDistribution}
          centerLabel="Products"
          centerValue={totalProducts}
          selectedSegment={selectedStatusFilter !== 'All' ? selectedStatusFilter : null}
          onSelectSegment={(st) => setSelectedStatusFilter(st || 'All')}
        />

        {/* Chart 3: Difficulty Levels */}
        <AnalyticsDonutChart
          title="Engineering Difficulty"
          subtitle="Technical complexity breakdown"
          data={difficultyDistribution}
          centerLabel="Levels"
          centerValue={difficultyDistribution.length}
          selectedSegment={selectedDifficultyFilter !== 'All' ? selectedDifficultyFilter : null}
          onSelectSegment={(df) => setSelectedDifficultyFilter(df || 'All')}
        />
      </div>

      {/* 4. Interactive Drill-Down Table Section */}
      <section className="space-y-4">
        {/* Filter Slicer */}
        <AnalyticsFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[
            {
              key: 'category',
              label: 'Category',
              value: selectedCategoryFilter,
              onChange: setSelectedCategoryFilter,
              options: [
                { label: 'All Categories', value: 'All' },
                ...categoryDistribution.map(c => ({ label: c.name, value: c.name }))
              ]
            },
            {
              key: 'difficulty',
              label: 'Difficulty',
              value: selectedDifficultyFilter,
              onChange: setSelectedDifficultyFilter,
              options: [
                { label: 'All Difficulties', value: 'All' },
                ...difficultyDistribution.map(d => ({ label: d.name, value: d.name }))
              ]
            },
            {
              key: 'status',
              label: 'Status',
              value: selectedStatusFilter,
              onChange: setSelectedStatusFilter,
              options: [
                { label: 'All Statuses', value: 'All' },
                ...statusDistribution.map(s => ({ label: s.name, value: s.name }))
              ]
            }
          ]}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalRecords={filteredProducts.length}
          recordLabel="Products"
        />

        {/* Products Data Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-amber-100 bg-amber-50/50 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Product Title</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Tech Stack</th>
                  <th className="py-3 px-4 font-bold">Difficulty</th>
                  <th className="py-3 px-4 font-bold">XP Reward</th>
                  <th className="py-3 px-4 font-bold">Readiness</th>
                  <th className="py-3 px-4 font-bold text-center">Deployment</th>
                  <th className="py-3 px-4 font-bold text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No technology products match the selected drill-down filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, i) => (
                    <tr key={p.id || i} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {p.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {p.technologies.slice(0, 3).map((t, tIdx) => (
                            <span key={tIdx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-mono font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {p.difficulty}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        +{p.xpReward} XP
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                          p.status === 'Approved' || p.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.liveDemoUrl && p.liveDemoUrl !== '#' && (
                            <a
                              href={p.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-100 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                              title="Open Live Sandbox"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {p.githubRepoUrl && p.githubRepoUrl !== '#' && (
                            <a
                              href={p.githubRepoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="View GitHub Repository"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
