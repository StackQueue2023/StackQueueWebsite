import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsPeakCard from '../../../components/analytics/AnalyticsPeakCard';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import AnalyticsFilterBar from '../../../components/analytics/AnalyticsFilterBar';
import InteractiveFinancialBarChart from '../../../components/analytics/InteractiveFinancialBarChart';
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
  Sparkles,
  BarChart3,
  Users,
  Layers,
  Award,
  UserCheck
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
    totalCatalogCourses = 0,
    totalStudents = 0,
    totalEnrolled = 0,
    activeLearners = 0,
    completedLearners = 0,
    financials = { totalFees: 0, collectedAmount: 0, pendingAmount: 0 },
    peakCourse = null,
    domainWisePerformance = [],
    domainStats = [],
    courseDistribution = [],
    domainDistribution = [],
    domainComparison = [],
    enrollmentStatusDistribution = [],
    statusDistribution = [],
    paymentStatusDistribution = [],
    studentRows = []
  } = data || {};

  const effectiveDomainStats = domainWisePerformance.length > 0 ? domainWisePerformance : (domainStats || []);
  const totalAgreedFee = financials.totalFees ?? financials.totalAgreed ?? 0;
  const totalCollectedFee = financials.collectedAmount ?? financials.totalCollected ?? financials.totalPaid ?? 0;
  const totalPendingFee = financials.pendingAmount ?? financials.totalPending ?? 0;
  const learnersCount = activeLearners || totalStudents || totalEnrolled || studentRows.length;
  const catalogCoursesCount = totalCatalogCourses || totalCourses || courseDistribution.length;

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
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="bg-white absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/analytics"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-800 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Analytics Hub</span>
              </Link>
              <div className="bg-white inline-flex items-center space-x-2 text-blue-800 font-mono text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full border border-blue-200/80 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-blue-800" />
                <span>LMS Course Intelligence</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white text-emerald-700 border border-emerald-200">
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
              className="bg-white px-4 py-2.5 text-blue-700 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-500/20 border border-blue-600"
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
            title={peakCourse?.title || 'No Active Courses'}
            subtitle={`Domain: ${peakCourse?.domain || 'Technical Curriculum'} • Peak Enrolled Track`}
            primaryMetric={peakCourse?.enrolledCount ?? 0}
            primaryLabel="Active Enrolled Students"
            secondaryMetrics={[
              { label: 'Total Fees', value: `₹${(peakCourse?.totalFees ?? 0).toLocaleString()}` },
              { label: 'Collected', value: `₹${(peakCourse?.collectedAmount ?? 0).toLocaleString()}` },
              { label: 'Status', value: peakCourse?.status || 'Active Program' }
            ]}
            gradient="from-blue-600 via-blue-700 to-indigo-700"
            accentColor="text-blue-700"
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

      {/* 2.5 Domain-Wise Student Calculation & Financial Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Course Domain-Wise Calculations & Receivables
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                Live Database Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic student enrollment breakdown, active learning progression, fee commitments, verified collections, and pending balances across all course domains.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Active Courses: <strong>{(effectiveDomainStats.filter(d => d.enrolled > 0)).length}</strong></span>
            <span>•</span>
            <span>Catalog Courses: <strong>{effectiveDomainStats.length}</strong></span>
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700 font-bold font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-3 text-center">Enrolled</th>
                <th className="py-3 px-3 text-center">Active</th>
                <th className="py-3 px-3 text-center">Completed</th>
                <th className="py-3 px-3 text-center">Pending</th>
                <th className="py-3 px-4 text-right">Total Agreed Fees</th>
                <th className="py-3 px-4 text-right">Collected (Verified)</th>
                <th className="py-3 px-4 text-right">Pending Receivables</th>
                <th className="py-3 px-3 text-center">Completion %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {effectiveDomainStats.map((item, idx) => {
                const isSelected = selectedDomainFilter === item.domain || selectedDomainFilter === item.courseTitle;
                const hasStudents = item.enrolled > 0;
                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      if (hasStudents) {
                        setSelectedDomainFilter(selectedDomainFilter === item.domain ? 'All' : item.domain);
                      }
                    }}
                    className={`transition ${hasStudents ? 'cursor-pointer hover:bg-blue-50/40' : 'opacity-60 bg-slate-50/30'} ${isSelected ? 'bg-blue-50/80 ring-1 ring-blue-400 font-semibold' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${hasStudents ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <span>{item.courseTitle || item.domain}</span>
                      {item.domainCategory && item.domainCategory !== item.courseTitle && (
                        <span className="text-[10px] font-normal text-slate-400 font-mono">({item.domainCategory})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                      {item.enrolled}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-blue-700">
                      {item.active}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-emerald-700">
                      {item.completed}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-amber-700">
                      {item.pending}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{item.totalFees.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{item.collected.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700">
                      ₹{item.pendingReceivables.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.completionRate > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {item.completionRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-100/70 font-black text-slate-900 font-mono text-[11px]">
                <td className="py-3 px-4">TOTALS (All Courses)</td>
                <td className="py-3 px-3 text-center">{totalStudents}</td>
                <td className="py-3 px-3 text-center text-blue-800">{learnersCount}</td>
                <td className="py-3 px-3 text-center text-emerald-800">{completedCount}</td>
                <td className="py-3 px-3 text-center text-amber-800">{totalStudents - completedCount}</td>
                <td className="py-3 px-4 text-right">₹{totalAgreedFee.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-emerald-800">₹{totalCollectedFee.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-amber-800">₹{totalPendingFee.toLocaleString()}</td>
                <td className="py-3 px-3 text-center">{completionRateVal}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2.6 Interactive 3-Bar Financial Comparison Chart */}
      <InteractiveFinancialBarChart
        title="Course Financial Performance & Receivables"
        subtitle="Total Agreed Fees vs Verified Collections vs Pending Receivables by Course Domain"
        category="Courses"
        totalAgreed={totalAgreedFee}
        collected={totalCollectedFee}
        pending={totalPendingFee}
        items={domainComparison.length > 0 ? domainComparison : effectiveDomainStats.map(d => ({
          name: d.domain,
          domain: d.domain,
          totalAgreed: d.totalFees,
          collected: d.collected,
          pending: d.pendingReceivables,
          studentCount: d.enrolled
        }))}
      />

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

      {/* 3.5 Course-Wise Batch & Individual Student Assignment Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                LMS Course Student Assignment Breakdown
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                Batch + Individual Assignments
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audit course-wise student counts, active cohort batches, and individual student assignments. Click any course to filter records below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">Selected Filter:</span>
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-mono">
              {selectedCourseFilter === 'All' ? 'All LMS Courses' : selectedCourseFilter}
            </span>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courseDistribution.map((course) => {
            const isSelected = selectedCourseFilter === course.title;
            return (
              <div
                key={course.id || course.courseId}
                onClick={() => setSelectedCourseFilter(isSelected ? 'All' : course.title)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{course.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{course.domain || 'LMS Track'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-blue-700">{course.totalStudents || 0}</span>
                    <span className="block text-[10px] text-slate-400">Total Unique</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {/* Batch breakdown */}
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium text-[11px] flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-500" />
                      Course Batches ({course.batchCount || (course.batches?.length || 0)}):
                    </span>
                    <span className="font-mono font-bold text-purple-700">{course.batchStudentCount || 0}</span>
                  </div>
                  {course.batches && course.batches.length > 0 ? (
                    <div className="pl-3 space-y-1 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
                      {course.batches.map(b => (
                        <div key={b.id || b.batchId} className="flex items-center justify-between text-[10px] text-slate-600">
                          <span className="truncate max-w-[130px] font-medium">• {b.name || b.batchName}</span>
                          <span className="font-mono font-bold text-purple-700">{b.studentCount} students</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic pl-3">No active course batches</div>
                  )}

                  {/* Individual assignments breakdown */}
                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span className="font-medium text-[11px] flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-amber-500" />
                      Individual Assignments:
                    </span>
                    <span className="font-mono font-bold text-amber-700">{course.individualStudentCount || 0}</span>
                  </div>
                  {course.individualStudents && course.individualStudents.length > 0 ? (
                    <div className="pl-3 space-y-0.5 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100">
                      {course.individualStudents.map(s => (
                        <div key={s.id || s.studentId} className="text-[10px] text-amber-900 font-medium truncate">
                          • {s.name} ({s.studentId})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic pl-3">0 individual assignments</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-blue-200 bg-white text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Student ID</th>
                  <th className="py-3 px-4 font-bold">Student Name</th>
                  <th className="py-3 px-4 font-bold">Enrolled Course</th>
                  <th className="py-3 px-4 font-bold">Domain</th>
                  <th className="py-3 px-4 font-bold">Batch / Assignment Source</th>
                  <th className="py-3 px-4 font-bold">Progress</th>
                  <th className="py-3 px-4 font-bold text-right">Total Fee</th>
                  <th className="py-3 px-4 font-bold text-right">Paid</th>
                  <th className="py-3 px-4 font-bold text-right">Pending</th>
                  <th className="py-3 px-4 font-bold text-center">Enrollment Status</th>
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
                    <tr key={st.id || st.studentId || i} className="hover:bg-white transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {st.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{st.name || st.studentName}</div>
                        <div className="text-[10px] text-slate-400">{st.email}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-800">
                        {st.courseTitle || st.programName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-slate-700 border border-blue-200">
                          {st.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate" title={st.batchName || 'Individual Assignment'}>
                          {st.batchName || 'Individual Assignment'}
                        </div>
                        <span className={`inline-block text-[10px] px-2 py-0.2 rounded-full border ${
                          st.assignmentType === 'Batch' || (st.batchName && st.batchName !== 'Individual Assignment')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {st.assignmentType || (st.batchName && st.batchName !== 'Individual Assignment' ? 'Batch Assignment' : 'Individual Assignment')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-blue-100/70 rounded-full overflow-hidden">
                            <div
                              className="bg-sq-gradient h-full rounded-full"
                              style={{ width: `${st.progressPercentage ?? st.progress ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-600">{st.progressPercentage ?? st.progress ?? 0}%</span>
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${ st.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200' }`}>
                          {st.status === 'Completed' ? 'COMPLETED' : 'ACTIVE'}
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
