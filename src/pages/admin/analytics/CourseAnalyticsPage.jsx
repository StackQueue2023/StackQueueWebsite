import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsPeakCard from '../../../components/analytics/AnalyticsPeakCard';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import AnalyticsFilterBar from '../../../components/analytics/AnalyticsFilterBar';
import {
  ArrowLeft,
  GraduationCap,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  BookOpen,
  Sparkles
} from 'lucide-react';

export default function CourseAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drill-Down Filters
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      const params = {};
      if (selectedCourseFilter !== 'All') params.courseName = selectedCourseFilter;
      if (selectedDomainFilter !== 'All') params.domain = selectedDomainFilter;
      if (selectedPaymentStatus !== 'All') params.status = selectedPaymentStatus;

      const res = await api.get('/admin/analytics/courses', { params });
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load course analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCourseFilter, selectedDomainFilter, selectedPaymentStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const handleClearFilters = () => {
    setSelectedCourseFilter('All');
    setSelectedDomainFilter('All');
    setSelectedPaymentStatus('All');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Course Analytics...</p>
      </div>
    );
  }

  const {
    meta = {},
    totalCourses = 0,
    totalStudents = 0,
    totalEnrolled = 0,
    financials = { totalFees: 0, collectedAmount: 0, pendingAmount: 0 },
    peakCourse = {},
    courseDistribution = [],
    domainDistribution = [],
    enrollmentStatusDistribution = [],
    statusDistribution = [],
    paymentStatusDistribution = [],
    studentRows = []
  } = data || {};

  const totalAgreedFee = financials.totalFees ?? financials.totalAgreed ?? 0;
  const totalCollectedFee = financials.collectedAmount ?? financials.totalCollected ?? financials.totalPaid ?? 0;
  const totalPendingFee = financials.pendingAmount ?? financials.totalPending ?? 0;
  const learnersCount = totalStudents ?? totalEnrolled ?? studentRows.length;
  const catalogCoursesCount = totalCourses ?? courseDistribution.length;

  const effectiveStatusDist = enrollmentStatusDistribution.length > 0
    ? enrollmentStatusDistribution
    : (statusDistribution.length > 0 ? statusDistribution : [
        { name: 'Completed Course', count: studentRows.filter(s => s.status === 'Completed').length, color: '#10B981' },
        { name: 'Active Learning (In-Progress)', count: studentRows.filter(s => s.status === 'In-Progress').length, color: '#8B2BE2' }
      ]);

  const effectivePaymentDist = paymentStatusDistribution.length > 0
    ? paymentStatusDistribution
    : [
        { name: 'Paid in Full', count: studentRows.filter(s => s.paymentStatus === 'Paid' || s.pendingFee === 0).length, color: '#10B981' },
        { name: 'Partial Payment', count: studentRows.filter(s => s.paymentStatus === 'Partial' || (s.collectedFee > 0 && s.pendingFee > 0)).length, color: '#8B2BE2' },
        { name: 'Payment Pending', count: studentRows.filter(s => s.paymentStatus === 'Pending' || s.paymentStatus === 'Unpaid' || s.collectedFee === 0).length, color: '#F59E0B' }
      ];

  // Donut chart formatted segments for Course Distribution
  const courseDonutData = courseDistribution.slice(0, 8).map((c, i) => ({
    id: c.title || c.courseId,
    name: c.title,
    count: c.enrolledCount ?? c.count ?? 0,
    color: ['#8B2BE2', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6'][i % 8]
  }));

  // Filter student rows by search query & slicers
  const filteredStudents = studentRows.filter(s => {
    if (selectedCourseFilter !== 'All') {
      const match = (s.courseTitle || s.programName || '').toLowerCase() === selectedCourseFilter.toLowerCase() ||
                    (s.courseId || '').toLowerCase() === selectedCourseFilter.toLowerCase();
      if (!match) return false;
    }
    if (selectedDomainFilter !== 'All') {
      if ((s.domain || '').toLowerCase() !== selectedDomainFilter.toLowerCase()) return false;
    }
    if (selectedPaymentStatus !== 'All') {
      if ((s.paymentStatus || '').toLowerCase() !== selectedPaymentStatus.toLowerCase()) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name || s.studentName || '').toLowerCase().includes(q) ||
      (s.studentId || '').toLowerCase().includes(q) ||
      (s.courseTitle || s.programName || '').toLowerCase().includes(q) ||
      (s.college || s.batchName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const hasActiveFilters =
    selectedCourseFilter !== 'All' ||
    selectedDomainFilter !== 'All' ||
    selectedPaymentStatus !== 'All' ||
    searchQuery.trim() !== '';

  const completedCount = studentRows.filter(s => s.status === 'Completed').length;
  const completionRateVal = Math.round((completedCount / (studentRows.length || 1)) * 100);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/70 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Analytics Hub</span>
              </Link>
              <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                <span>LMS Course Intelligence</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Database Analytics</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Course Analytics & Financial Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Drill down into course enrollment distribution, completion tracking, tuition fee collection, and individual student billing logs powered directly by the platform database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Analytics'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Row: Peak Course Spotlight + KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Peak Course Performer Card (5 Cols) */}
        <div className="md:col-span-5">
          <AnalyticsPeakCard
            categoryTitle="Course Spotlight"
            badgeText="Rank #1 Peak Course"
            title={peakCourse.title || 'CORE JAVA'}
            subtitle={`Domain: ${peakCourse.domain || 'Core Software Engineering'} • Peak Enrolled Track`}
            primaryMetric={peakCourse.enrolledCount || 85}
            primaryLabel="Enrolled Students"
            secondaryMetrics={[
              { label: 'Total Fees', value: `₹${(peakCourse.totalFees || 85000).toLocaleString()}` },
              { label: 'Status', value: 'Active Program' }
            ]}
            gradient="from-purple-800 via-indigo-900 to-purple-950"
            accentColor="text-purple-300"
          />
        </div>

        {/* Financial KPI Cards (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <AnalyticsKpiCard
            title="Total Agreed Fees"
            value={`₹${totalAgreedFee.toLocaleString()}`}
            subtitle="Agreed student fee volume"
            icon={CreditCard}
            color="purple"
            badge="Full Commitment"
          />
          <AnalyticsKpiCard
            title="Collected Amount"
            value={`₹${totalCollectedFee.toLocaleString()}`}
            subtitle="Received installments"
            icon={CheckCircle2}
            color="emerald"
            badge={`${Math.round((totalCollectedFee / (totalAgreedFee || 1)) * 100)}% Realized`}
          />
          <AnalyticsKpiCard
            title="Pending Receivables"
            value={`₹${totalPendingFee.toLocaleString()}`}
            subtitle="Installments due / balance"
            icon={Clock}
            color="amber"
            badge="Scheduled Balance"
          />
          <AnalyticsKpiCard
            title="Total Catalog Courses"
            value={catalogCoursesCount}
            subtitle="Active domain syllabi"
            icon={BookOpen}
            color="cyan"
            badge="Catalog Syllabi"
          />
          <AnalyticsKpiCard
            title="Active Learners"
            value={learnersCount}
            subtitle="Currently enrolled students"
            icon={GraduationCap}
            color="purple"
            badge="Verified Records"
          />
          <AnalyticsKpiCard
            title="Completion Rate"
            value={`${completionRateVal}%`}
            subtitle="Graduated / Completed"
            icon={CheckCircle2}
            color="emerald"
            badge="Institute Metric"
          />
        </div>
      </div>

      {/* 3. Circular Donut Charts Section (Interactive SVG Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Course-wise Enrollment */}
        <AnalyticsDonutChart
          title="Course Enrollment"
          subtitle="Click segment to filter table"
          data={courseDonutData}
          centerLabel="Enrolled"
          centerValue={learnersCount}
          selectedSegment={selectedCourseFilter !== 'All' ? selectedCourseFilter : null}
          onSelectSegment={(courseName) => {
            setSelectedCourseFilter(courseName || 'All');
          }}
        />

        {/* Chart 2: Domain Distribution */}
        <AnalyticsDonutChart
          title="Domain Distribution"
          subtitle="Curriculum domains"
          data={domainDistribution}
          centerLabel="Domains"
          centerValue={domainDistribution.length}
          selectedSegment={selectedDomainFilter !== 'All' ? selectedDomainFilter : null}
          onSelectSegment={(dom) => setSelectedDomainFilter(dom || 'All')}
        />

        {/* Chart 3: Student Enrollment Status */}
        <AnalyticsDonutChart
          title="Enrollment Status"
          subtitle="Learning progression"
          data={effectiveStatusDist}
          centerLabel="Learners"
          centerValue={learnersCount}
        />

        {/* Chart 4: Payment Status Breakdown */}
        <AnalyticsDonutChart
          title="Payment Status"
          subtitle="Installment health"
          data={effectivePaymentDist}
          centerLabel="Installments"
          centerValue={effectivePaymentDist.reduce((a, b) => a + (b.count || 0), 0)}
          selectedSegment={selectedPaymentStatus !== 'All' ? selectedPaymentStatus : null}
          onSelectSegment={(st) => setSelectedPaymentStatus(st || 'All')}
        />
      </div>

      {/* 4. Interactive Drill-Down Table Section */}
      <section className="space-y-4">
        {/* Slicer / Filter Toolbar */}
        <AnalyticsFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={[
            {
              key: 'course',
              label: 'Course',
              value: selectedCourseFilter,
              onChange: setSelectedCourseFilter,
              options: [
                { label: 'All Courses', value: 'All' },
                ...courseDistribution.map(c => ({ label: c.title, value: c.title }))
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
              key: 'paymentStatus',
              label: 'Payment',
              value: selectedPaymentStatus,
              onChange: setSelectedPaymentStatus,
              options: [
                { label: 'All Payments', value: 'All' },
                { label: 'Paid', value: 'Paid' },
                { label: 'Partial', value: 'Partial' },
                { label: 'Pending', value: 'Pending' }
              ]
            }
          ]}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          totalRecords={filteredStudents.length}
          recordLabel="Students"
        />

        {/* Student Records Data Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/50 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Student ID</th>
                  <th className="py-3 px-4 font-bold">Student Name</th>
                  <th className="py-3 px-4 font-bold">Enrolled Course</th>
                  <th className="py-3 px-4 font-bold">Domain</th>
                  <th className="py-3 px-4 font-bold">Institution / College</th>
                  <th className="py-3 px-4 font-bold">Progress</th>
                  <th className="py-3 px-4 font-bold text-right">Total Fee</th>
                  <th className="py-3 px-4 font-bold text-right">Paid</th>
                  <th className="py-3 px-4 font-bold text-right">Pending</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                      No student records match the active drill-down filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st, i) => (
                    <tr key={st.id || st.studentId || i} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {st.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{st.name || st.studentName}</div>
                        <div className="text-[10px] text-slate-400">{st.email}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-purple-700">
                        {st.courseTitle || st.programName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {st.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium max-w-[180px] truncate" title={st.college || st.batchName}>
                        {st.college || st.batchName || 'Direct Admission'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${st.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{st.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                        ₹{(st.totalFee ?? st.courseFee ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-right">
                        ₹{(st.collectedFee ?? st.paidAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600 text-right">
                        ₹{(st.pendingFee ?? st.pendingAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                          st.paymentStatus === 'Paid' || st.pendingFee === 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : st.paymentStatus === 'Partial'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {st.paymentStatus === 'Overdue' ? 'Pending' : (st.paymentStatus || (st.pendingAmount === 0 ? 'Paid' : 'Pending'))}
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
