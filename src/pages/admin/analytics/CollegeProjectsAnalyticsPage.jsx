import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsPeakCard from '../../../components/analytics/AnalyticsPeakCard';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import AnalyticsFilterBar from '../../../components/analytics/AnalyticsFilterBar';
import {
  ArrowLeft,
  FolderGit2,
  Code2,
  CheckCircle2,
  Clock,
  RefreshCw,
  GitPullRequest,
  Users,
  Award
} from 'lucide-react';

export default function CollegeProjectsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('All');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (selectedProjectFilter !== 'All') params.projectId = selectedProjectFilter;
      if (selectedDomainFilter !== 'All') params.domain = selectedDomainFilter;
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const res = await api.get('/admin/analytics/college-projects', { params });
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load college projects analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedProjectFilter, selectedDomainFilter, selectedStatusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleClearFilters = () => {
    setSelectedProjectFilter('All');
    setSelectedDomainFilter('All');
    setSelectedStatusFilter('All');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading College Projects Analytics...</p>
      </div>
    );
  }

  const {
    totalProjects = 0,
    totalAssignments = 0,
    financials = { totalAgreed: 0, totalPaid: 0, totalPending: 0 },
    peakProject = {},
    projectDistribution = [],
    domainDistribution = [],
    statusDistribution = [],
    completionDistribution = [],
    tableRows = []
  } = data || {};

  const projectDonutData = projectDistribution.map((p, i) => ({
    name: p.title,
    count: p.assignedCount,
    color: ['#06B6D4', '#3B82F6', '#8B2BE2', '#10B981'][i % 4]
  }));

  const filteredRows = tableRows.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.studentName?.toLowerCase().includes(q) ||
      r.domain?.toLowerCase().includes(q) ||
      r.tutorName?.toLowerCase().includes(q)
    );
  });

  const hasActiveFilters =
    selectedProjectFilter !== 'All' ||
    selectedDomainFilter !== 'All' ||
    selectedStatusFilter !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-cyan-50/70 via-blue-50/40 to-indigo-50/50 border border-cyan-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-800 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-cyan-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Analytics Hub</span>
              </Link>
              <div className="inline-flex items-center space-x-2 text-cyan-800 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-cyan-100/90 to-blue-100/90 px-3.5 py-1 rounded-full border border-cyan-200/80 shadow-2xs">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-600" />
                <span>Capstone Project & Code Review Intelligence</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              College Projects Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Tracking student capstone assignments, technical domain distribution, tutor line-by-line review benchmarks, and final executive approvals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Peak Project Spotlight + KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Peak Project Performer (5 Cols) */}
        <div className="md:col-span-5">
          <AnalyticsPeakCard
            categoryTitle="Capstone Spotlight"
            badgeText="Rank #1 Peak Project"
            title={peakProject.title || 'Multi-Tenant Cloud Logistics Engine'}
            subtitle={`Domain: ${peakProject.domain || 'Cloud Architecture'}`}
            primaryMetric={peakProject.participationCount || 4}
            primaryLabel="Assigned Students"
            secondaryMetrics={[
              { label: 'Completed', value: `${peakProject.completedCount || 3} Passed` },
              { label: 'Pass Rate', value: `${peakProject.completionRate || 75}%` }
            ]}
            gradient="from-cyan-950 via-blue-950 to-slate-900"
            accentColor="text-cyan-400"
          />
        </div>

        {/* KPI Cards (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnalyticsKpiCard
            title="Total Capstones"
            value={totalProjects}
            subtitle="Curated project briefs"
            icon={FolderGit2}
            color="cyan"
            badge="Enterprise Specs"
          />
          <AnalyticsKpiCard
            title="Active Assignments"
            value={totalAssignments}
            subtitle="Assigned student repos"
            icon={GitPullRequest}
            color="cyan"
            badge="In Lifecycle"
          />
          <AnalyticsKpiCard
            title="Executive Approval"
            value="75%"
            subtitle="Verified code reviews"
            icon={CheckCircle2}
            color="emerald"
            badge="Replicated to GitHub"
          />
          <AnalyticsKpiCard
            title="Project Fee Volume"
            value={`₹${financials.totalAgreed.toLocaleString()}`}
            subtitle="Capstone support fee"
            icon={Award}
            color="purple"
            badge="Tracked Tranches"
          />
          <AnalyticsKpiCard
            title="Collected Amount"
            value={`₹${financials.totalPaid.toLocaleString()}`}
            subtitle="Realized project payments"
            icon={CheckCircle2}
            color="emerald"
            badge="Paid"
          />
          <AnalyticsKpiCard
            title="Lead Reviewer"
            value="BALAJI S"
            subtitle="Senior Tech Lead"
            icon={Users}
            color="amber"
            badge="Active Tutor"
          />
        </div>
      </div>

      {/* 3. Circular Donut Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Project-wise Participation */}
        <AnalyticsDonutChart
          title="Project Participation"
          subtitle="Click segment to filter table below"
          data={projectDonutData}
          centerLabel="Students"
          centerValue={totalAssignments}
          selectedSegment={selectedProjectFilter !== 'All' ? selectedProjectFilter : null}
          onSelectSegment={(pTitle) => setSelectedProjectFilter(pTitle || 'All')}
        />

        {/* Chart 2: Domain Distribution */}
        <AnalyticsDonutChart
          title="Domain Distribution"
          subtitle="Tech stack specializations"
          data={domainDistribution}
          centerLabel="Domains"
          centerValue={domainDistribution.length}
          selectedSegment={selectedDomainFilter !== 'All' ? selectedDomainFilter : null}
          onSelectSegment={(dom) => setSelectedDomainFilter(dom || 'All')}
        />

        {/* Chart 3: Submission & Review Status */}
        <AnalyticsDonutChart
          title="Review Status"
          subtitle="Review lifecycle progression"
          data={statusDistribution}
          centerLabel="Status"
          centerValue={totalAssignments}
          selectedSegment={selectedStatusFilter !== 'All' ? selectedStatusFilter : null}
          onSelectSegment={(st) => setSelectedStatusFilter(st || 'All')}
        />

        {/* Chart 4: Completion Distribution */}
        <AnalyticsDonutChart
          title="Completion Rate"
          subtitle="Final verification benchmarks"
          data={completionDistribution}
          centerLabel="Milestones"
          centerValue={totalAssignments}
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
              key: 'project',
              label: 'Project',
              value: selectedProjectFilter,
              onChange: setSelectedProjectFilter,
              options: [
                { label: 'All Projects', value: 'All' },
                ...projectDistribution.map(p => ({ label: p.title, value: p.title }))
              ]
            },
            {
              key: 'domain',
              label: 'Domain',
              value: selectedDomainFilter,
              onChange: setSelectedDomainFilter,
              options: [
                { label: 'All Domains', value: 'All' },
                ...domainDistribution.map(d => ({ label: d.name, value: d.name }))
              ]
            },
            {
              key: 'status',
              label: 'Status',
              value: selectedStatusFilter,
              onChange: setSelectedStatusFilter,
              options: [
                { label: 'All Statuses', value: 'All' },
                { label: 'Approved', value: 'Approved' },
                { label: 'Under Review', value: 'Under Review' },
                { label: 'In Progress', value: 'In Progress' }
              ]
            }
          ]}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalRecords={filteredRows.length}
          recordLabel="Submissions"
        />

        {/* Submissions Data Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cyan-100 bg-cyan-50/50 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Capstone Project</th>
                  <th className="py-3 px-4 font-bold">Domain</th>
                  <th className="py-3 px-4 font-bold">Assigned Student</th>
                  <th className="py-3 px-4 font-bold">Tutor / Reviewer</th>
                  <th className="py-3 px-4 font-bold">Progress</th>
                  <th className="py-3 px-4 font-bold">Review Remarks</th>
                  <th className="py-3 px-4 font-bold">Updated</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No project submissions match the selected drill-down filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {r.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          {r.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{r.studentName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{r.studentId}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {r.tutorName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-600 rounded-full"
                              style={{ width: `${r.completion}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{r.completion}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 text-[11px] font-medium leading-relaxed">
                          {r.remarks}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {r.lastUpdated}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                          r.submissionStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.submissionStatus === 'Under Review'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.submissionStatus}
                        </span>
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
