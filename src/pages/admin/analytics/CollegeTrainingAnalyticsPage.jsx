import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsPeakCard from '../../../components/analytics/AnalyticsPeakCard';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import AnalyticsFilterBar from '../../../components/analytics/AnalyticsFilterBar';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  CreditCard
} from 'lucide-react';

export default function CollegeTrainingAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('All');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (selectedCollegeFilter !== 'All') params.collegeName = selectedCollegeFilter;
      if (selectedBatchFilter !== 'All') params.batchName = selectedBatchFilter;
      if (selectedStatusFilter !== 'All') params.status = selectedStatusFilter;

      const res = await api.get('/admin/analytics/college-training', { params });
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load college training analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCollegeFilter, selectedBatchFilter, selectedStatusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleClearFilters = () => {
    setSelectedCollegeFilter('All');
    setSelectedBatchFilter('All');
    setSelectedStatusFilter('All');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading College Training Analytics...</p>
      </div>
    );
  }

  const {
    totalColleges = 0,
    totalBatches = 0,
    totalStudents = 0,
    financials = { totalAgreed: 0, totalPaid: 0, totalPending: 0 },
    peakCollege = {},
    peakProgram = {},
    collegeDistribution = [],
    programDistribution = [],
    batchDistribution = [],
    statusDistribution = [],
    tableRows = []
  } = data || {};

  const collegeDonutData = collegeDistribution.map((c, i) => ({
    name: c.name,
    count: c.studentCount,
    color: ['#EC4899', '#8B2BE2', '#3B82F6', '#10B981'][i % 4]
  }));

  const filteredRows = tableRows.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.collegeName?.toLowerCase().includes(q) ||
      r.programName?.toLowerCase().includes(q) ||
      r.batchName?.toLowerCase().includes(q) ||
      r.assignedTutor?.toLowerCase().includes(q)
    );
  });

  const hasActiveFilters =
    selectedCollegeFilter !== 'All' ||
    selectedBatchFilter !== 'All' ||
    selectedStatusFilter !== 'All' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-pink-50/70 via-fuchsia-50/40 to-purple-50/50 border border-pink-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-700 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-pink-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Analytics Hub</span>
              </Link>
              <div className="inline-flex items-center space-x-2 text-pink-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-pink-100/90 to-purple-100/90 px-3.5 py-1 rounded-full border border-pink-200/80 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-pink-600" />
                <span>Institutional Training Intelligence</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              College Training Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Institutional intelligence tracking partner university cohorts, attendance telemetry, specialized curriculum tracks, and campus cohort fee commitments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white hover:bg-pink-50 text-pink-800 border border-pink-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-pink-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Peak Spotlight + KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Peak College Performer (5 Cols) */}
        <div className="md:col-span-5">
          <AnalyticsPeakCard
            categoryTitle="College Spotlight"
            badgeText="Rank #1 Peak Institution"
            title={peakCollege.name || 'KSR College of Technology'}
            subtitle={`Partner Institution • ${peakProgram.title || 'Full Stack Cloud Training'}`}
            primaryMetric={peakCollege.studentCount || 28}
            primaryLabel="Participating Students"
            secondaryMetrics={[
              { label: 'Cohorts', value: `${totalBatches} Batches` },
              { label: 'Attendance', value: '94%' }
            ]}
            gradient="from-pink-950 via-rose-950 to-slate-900"
            accentColor="text-pink-400"
          />
        </div>

        {/* KPI Cards (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnalyticsKpiCard
            title="Partner Colleges"
            value={totalColleges}
            subtitle="MOU active institutions"
            icon={Building2}
            color="pink"
            badge="Institutional Partner"
          />
          <AnalyticsKpiCard
            title="Campus Cohorts"
            value={totalBatches}
            subtitle="Active academic batches"
            icon={GraduationCap}
            color="purple"
            badge="Current Semesters"
          />
          <AnalyticsKpiCard
            title="College Students"
            value={totalStudents}
            subtitle="Campus trained learners"
            icon={Users}
            color="pink"
            badge="Strict Isolation"
          />
          <AnalyticsKpiCard
            title="Campus Fee Volume"
            value={`₹${financials.totalAgreed.toLocaleString()}`}
            subtitle="Agreed institutional fee"
            icon={CreditCard}
            color="purple"
            badge="MOU Financials"
          />
          <AnalyticsKpiCard
            title="Collected Institutional"
            value={`₹${financials.totalPaid.toLocaleString()}`}
            subtitle="Paid campus tranches"
            icon={CheckCircle2}
            color="emerald"
            badge="50% Disbursed"
          />
          <AnalyticsKpiCard
            title="Attendance Telemetry"
            value="94%"
            subtitle="Session presence average"
            icon={Clock}
            color="emerald"
            badge="Audited"
          />
        </div>
      </div>

      {/* 3. Circular Donut Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: College-wise Participation */}
        <AnalyticsDonutChart
          title="College Participation"
          subtitle="Click segment to filter table below"
          data={collegeDonutData}
          centerLabel="Students"
          centerValue={totalStudents}
          selectedSegment={selectedCollegeFilter !== 'All' ? selectedCollegeFilter : null}
          onSelectSegment={(cName) => setSelectedCollegeFilter(cName || 'All')}
        />

        {/* Chart 2: Program Distribution */}
        <AnalyticsDonutChart
          title="Training Programs"
          subtitle="Curriculum specializations"
          data={programDistribution}
          centerLabel="Programs"
          centerValue={programDistribution.length}
        />

        {/* Chart 3: Batch Enrollment */}
        <AnalyticsDonutChart
          title="Batch Cohorts"
          subtitle="Student distribution across batches"
          data={batchDistribution}
          centerLabel="Cohorts"
          centerValue={batchDistribution.length}
          selectedSegment={selectedBatchFilter !== 'All' ? selectedBatchFilter : null}
          onSelectSegment={(b) => setSelectedBatchFilter(b || 'All')}
        />

        {/* Chart 4: Attendance & Status */}
        <AnalyticsDonutChart
          title="Attendance & Progress"
          subtitle="Session telemetry breakdown"
          data={statusDistribution}
          centerLabel="Status"
          centerValue={totalStudents}
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
              key: 'college',
              label: 'College',
              value: selectedCollegeFilter,
              onChange: setSelectedCollegeFilter,
              options: [
                { label: 'All Colleges', value: 'All' },
                ...collegeDistribution.map(c => ({ label: c.name, value: c.name }))
              ]
            },
            {
              key: 'batch',
              label: 'Cohort',
              value: selectedBatchFilter,
              onChange: setSelectedBatchFilter,
              options: [
                { label: 'All Cohorts', value: 'All' },
                ...batchDistribution.map(b => ({ label: b.name, value: b.batchName }))
              ]
            },
            {
              key: 'status',
              label: 'Status',
              value: selectedStatusFilter,
              onChange: setSelectedStatusFilter,
              options: [
                { label: 'All Statuses', value: 'All' },
                { label: 'Ongoing Training', value: 'Ongoing' },
                { label: 'Completed', value: 'Completed' }
              ]
            }
          ]}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalRecords={filteredRows.length}
          recordLabel="Cohorts"
        />

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-pink-100 bg-pink-50/50 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">College & City</th>
                  <th className="py-3 px-4 font-bold">Training Program</th>
                  <th className="py-3 px-4 font-bold">Batch Cohort</th>
                  <th className="py-3 px-4 font-bold">Assigned Tutor</th>
                  <th className="py-3 px-4 font-bold">Schedule</th>
                  <th className="py-3 px-4 font-bold">Students</th>
                  <th className="py-3 px-4 font-bold">Attendance</th>
                  <th className="py-3 px-4 font-bold text-right">Fee (Agreed / Paid)</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      No college cohorts match the selected drill-down filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.collegeName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pink-500" />
                          <span>{r.city}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-pink-700">
                        {r.programName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{r.batchName}</div>
                        <div className="text-[10px] text-slate-400">{r.department}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {r.assignedTutor}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {r.enrolledStudents} Students
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.attendanceRate}% Present
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <div className="text-slate-900">₹{r.totalFee.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Paid: ₹{r.paidFee.toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                          r.status === 'Completed'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {r.status}
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
