import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsPeakCard from '../../../components/analytics/AnalyticsPeakCard';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import AnalyticsFilterBar from '../../../components/analytics/AnalyticsFilterBar';
import {
  ArrowLeft,
  Briefcase,
  Award,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function InternshipAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drill-down filters
  const [selectedInternshipFilter, setSelectedInternshipFilter] = useState('All');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (selectedInternshipFilter !== 'All') params.internshipId = selectedInternshipFilter;
      if (selectedDomainFilter !== 'All') params.domain = selectedDomainFilter;
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const res = await api.get('/admin/analytics/internships', { params });
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load internship analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedInternshipFilter, selectedDomainFilter, selectedStatusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleClearFilters = () => {
    setSelectedInternshipFilter('All');
    setSelectedDomainFilter('All');
    setSelectedStatusFilter('All');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Internship Analytics...</p>
      </div>
    );
  }

  const {
    totalInternships = 0,
    totalFellows = 0,
    financials = { totalAgreed: 0, totalPaid: 0, totalPending: 0 },
    peakInternship = {},
    internshipDistribution = [],
    domainDistribution = [],
    statusDistribution = [],
    studentRows = []
  } = data || {};

  // Formatted Donut Chart data for top internships
  const internshipDonutData = internshipDistribution.slice(0, 7).map((item, idx) => ({
    id: item.internshipId,
    name: item.title,
    count: item.enrolledCount,
    color: ['#10B981', '#059669', '#34D399', '#06B6D4', '#8B2BE2', '#F59E0B', '#EC4899'][idx % 7]
  }));

  const filteredStudents = studentRows.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.studentId?.toLowerCase().includes(q) ||
      s.internshipTitle?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const hasActiveFilters =
    selectedInternshipFilter !== 'All' ||
    selectedDomainFilter !== 'All' ||
    selectedStatusFilter !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-cyan-50/50 border border-emerald-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Analytics Hub</span>
              </Link>
              <div className="inline-flex items-center space-x-2 text-emerald-800 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-emerald-100/90 to-teal-100/90 px-3.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Industry Immersion Intelligence</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Internship Analytics & Placement Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real-time analytics across industry tracks, domain specializations, fellow applications, completion certification, and stipend disbursements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Row: Peak Internship Performer + KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Peak Internship Card (5 Cols) */}
        <div className="md:col-span-5">
          <AnalyticsPeakCard
            categoryTitle="Internship Spotlight"
            badgeText="Rank #1 Top Internship"
            title={peakInternship.title || 'Artificial Intelligence'}
            subtitle={`Domain: ${peakInternship.domain || 'ai'} • Industrial Immersion`}
            primaryMetric={peakInternship.enrolledCount || 1}
            primaryLabel="Enrolled Fellows"
            secondaryMetrics={[
              { label: 'Stipend', value: peakInternship.stipend ? `₹${peakInternship.stipend.toLocaleString()}` : 'Free' },
              { label: 'Mode', value: 'Certified' }
            ]}
            gradient="from-emerald-950 via-teal-950 to-slate-900"
            accentColor="text-emerald-400"
          />
        </div>

        {/* KPI Metric Cards (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnalyticsKpiCard
            title="Total Tracks"
            value={totalInternships}
            subtitle="Industry specialized tracks"
            icon={Briefcase}
            color="emerald"
            badge="100% Live"
          />
          <AnalyticsKpiCard
            title="Active Fellows"
            value={totalFellows}
            subtitle="Practicing industry fellows"
            icon={Users}
            color="emerald"
            badge="Placement Track"
          />
          <AnalyticsKpiCard
            title="Completion Rate"
            value="92%"
            subtitle="Certified deliverables"
            icon={CheckCircle2}
            color="emerald"
            badge="Verified"
          />
          <AnalyticsKpiCard
            title="Stipend Commitment"
            value={`₹${financials.totalAgreed.toLocaleString()}`}
            subtitle="Disbursement commitment"
            icon={Award}
            color="amber"
            badge="Partner Funded"
          />
          <AnalyticsKpiCard
            title="Disbursed Funds"
            value={`₹${financials.totalPaid.toLocaleString()}`}
            subtitle="Paid to active fellows"
            icon={CheckCircle2}
            color="purple"
            badge="Released"
          />
          <AnalyticsKpiCard
            title="Top Tech Domain"
            value={domainDistribution[0]?.name || 'AI & Cloud'}
            subtitle="Highest fellows interest"
            icon={Sparkles}
            color="cyan"
            badge="High Demand"
          />
        </div>
      </div>

      {/* 3. Circular Donut Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart 1: Internship-wise Enrollment */}
        <AnalyticsDonutChart
          title="Track-wise Enrollment"
          subtitle="Click segment to filter table below"
          data={internshipDonutData}
          centerLabel="Fellows"
          centerValue={totalFellows}
          selectedSegment={selectedInternshipFilter !== 'All' ? selectedInternshipFilter : null}
          onSelectSegment={(title) => {
            if (!title) setSelectedInternshipFilter('All');
            else {
              const matched = internshipDistribution.find(i => i.title === title);
              setSelectedInternshipFilter(matched ? matched.internshipId : title);
            }
          }}
        />

        {/* Chart 2: Domain Distribution */}
        <AnalyticsDonutChart
          title="Domain Specializations"
          subtitle="Tech domain breakdown"
          data={domainDistribution}
          centerLabel="Domains"
          centerValue={domainDistribution.length}
          selectedSegment={selectedDomainFilter !== 'All' ? selectedDomainFilter : null}
          onSelectSegment={(d) => setSelectedDomainFilter(d || 'All')}
        />

        {/* Chart 3: Participation & Completion Status */}
        <AnalyticsDonutChart
          title="Fellow Status"
          subtitle="Completion & active progression"
          data={statusDistribution}
          centerLabel="Fellows"
          centerValue={totalFellows}
          selectedSegment={selectedStatusFilter !== 'All' ? selectedStatusFilter : null}
          onSelectSegment={(st) => setSelectedStatusFilter(st || 'All')}
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
              key: 'internship',
              label: 'Track',
              value: selectedInternshipFilter,
              onChange: setSelectedInternshipFilter,
              options: [
                { label: 'All Tracks', value: 'All' },
                ...internshipDistribution.slice(0, 15).map(i => ({ label: i.title, value: i.internshipId }))
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
                { label: 'Active', value: 'Active' },
                { label: 'Completed', value: 'Completed' }
              ]
            }
          ]}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalRecords={filteredStudents.length}
          recordLabel="Fellows"
        />

        {/* Student Records Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/50 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Fellow ID</th>
                  <th className="py-3 px-4 font-bold">Fellow Name</th>
                  <th className="py-3 px-4 font-bold">Internship Track</th>
                  <th className="py-3 px-4 font-bold">Domain</th>
                  <th className="py-3 px-4 font-bold">Stipend</th>
                  <th className="py-3 px-4 font-bold">Timeline</th>
                  <th className="py-3 px-4 font-bold">Progress</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                      No internship fellows match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, i) => (
                    <tr key={st.id || i} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {st.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{st.name}</div>
                        <div className="text-[10px] text-slate-400">{st.email}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-800">
                        {st.internshipTitle}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                          {st.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {st.stipend}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(st.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${st.completion}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{st.completion}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                          st.status === 'Completed'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {st.status}
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
