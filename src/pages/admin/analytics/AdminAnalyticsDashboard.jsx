import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';
import AnalyticsDonutChart from '../../../components/analytics/AnalyticsDonutChart';
import AnalyticsBarChart from '../../../components/analytics/AnalyticsBarChart';
import AnalyticsKpiCard from '../../../components/analytics/AnalyticsKpiCard';
import UnifiedAnalyticsSection from '../../../components/analytics/UnifiedAnalyticsSection';
import {
  BarChart3,
  GraduationCap,
  Building2,
  RefreshCw,
  ArrowLeft,
  Users,
  CheckCircle2,
  BookOpen,
  Search,
  Filter,
  X,
  Layers,
  ShieldCheck,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Wallet,
  CreditCard
} from 'lucide-react';

export default function AdminAnalyticsDashboard() {
  const cachedAnalytics = api.peekCache?.('/admin/analytics/overview');
  const [data, setData] = useState(cachedAnalytics?.data || null);
  const [loading, setLoading] = useState(!cachedAnalytics);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Drill-down and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Active view tab for layout focusing
  const [viewTab, setViewTab] = useState('all'); // 'all' | 'courses' | 'colleges' | 'students'

  const fetchAnalytics = async (isSilent = false) => {
    try {
      setError(null);
      if (!isSilent) setLoading(true);
      const res = await api.get('/admin/analytics/overview');
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        throw new Error(res.data?.message || 'Failed to retrieve analytics data');
      }
    } catch (err) {
      console.error('Failed to load database student analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load database student analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(!!cachedAnalytics);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalytics();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCourseFilter('All');
    setSelectedDomainFilter('All');
    setSelectedTypeFilter('All');
    setSelectedCollegeFilter('All');
    setSelectedStatusFilter('All');
  };

  // Filter actual students array
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];

    return data.students.filter((student) => {
      // 1. Text Search (Name, Email, Username, or Permanent Student ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name?.toLowerCase().includes(q);
        const matchesEmail = student.email?.toLowerCase().includes(q);
        const matchesUsername = student.username?.toLowerCase().includes(q);
        const matchesId = student.permanentStudentId?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesUsername && !matchesId) return false;
      }

      // 2. Course Filter
      if (selectedCourseFilter !== 'All') {
        const hasCourse = student.courses.some(
          c => c.courseTitle?.toLowerCase() === selectedCourseFilter.toLowerCase() ||
               c.courseId?.toString() === selectedCourseFilter
        );
        if (!hasCourse) return false;
      }

      // 3. Domain Filter
      if (selectedDomainFilter !== 'All') {
        const hasDomain = student.domains.some(
          d => d.toLowerCase() === selectedDomainFilter.toLowerCase()
        );
        if (!hasDomain) return false;
      }

      // 4. Student Type Filter (LMS / COLLEGE_TRAINING / BOTH)
      if (selectedTypeFilter !== 'All') {
        if (selectedTypeFilter === 'BOTH' && student.studentType !== 'BOTH') return false;
        if (selectedTypeFilter === 'LMS' && student.studentType !== 'LMS' && student.studentType !== 'BOTH') return false;
        if (selectedTypeFilter === 'COLLEGE_TRAINING' && student.studentType !== 'COLLEGE_TRAINING' && student.studentType !== 'BOTH') return false;
      }

      // 5. College Filter
      if (selectedCollegeFilter !== 'All') {
        if (!student.college || student.college.name !== selectedCollegeFilter) return false;
      }

      // 6. Status Filter (Active / Completed)
      if (selectedStatusFilter !== 'All') {
        const hasMatchingStatus = student.courses.some(
          c => c.status?.toUpperCase() === selectedStatusFilter.toUpperCase()
        );
        if (!hasMatchingStatus) return false;
      }

      return true;
    });
  }, [
    data?.students,
    searchQuery,
    selectedCourseFilter,
    selectedDomainFilter,
    selectedTypeFilter,
    selectedCollegeFilter,
    selectedStatusFilter
  ]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCourseFilter !== 'All' ||
    selectedDomainFilter !== 'All' ||
    selectedTypeFilter !== 'All' ||
    selectedCollegeFilter !== 'All' ||
    selectedStatusFilter !== 'All'
  );

  // Loading state
  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading Database Student Analytics...</p>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Database Analytics Unavailable</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchAnalytics().finally(() => setLoading(false));
          }}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          Retry Database Connection
        </button>
      </div>
    );
  }

  const {
    isEmpty = false,
    totalUniqueStudents = 0,
    totalDomainStudents = 0,
    courseDistribution = [],
    domainDistribution = [],
    collegeDistribution = [],
    batchDistribution = [],
    enrollmentSummary = {},
    topCourses = [],
    filters = {}
  } = data || {};

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. EXECUTIVE HEADER BANNER                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/70 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                to="/admin/command-center"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>

              {/* Single Source of Truth Indicator */}
              <div className="inline-flex items-center space-x-2 text-emerald-700 font-mono text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Database • Single Source of Truth</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-purple-600 inline" />
              <span>Student Analytics Hub</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real-time student intelligence tracking unique profiles, course enrollments, domains, partner institutions, and batch cohorts directly from the application database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/analytics/fees"
              className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
              <span>Fee Collections</span>
            </Link>

            <Link
              to="/admin/lms"
              className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Manage Students</span>
            </Link>

            <Link
              to="/admin/batches"
              className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Batches & Colleges</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SPECIALIZED OPERATIONS & ANALYTICS MODULES               */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-600 font-mono flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-purple-600" />
            <span>Financial Operations & Sub-Analytics</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            Dedicated administrative ledgers and deep analytics modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Student Fee Management & Collections */}
          <Link
            to="/admin/analytics/fees"
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:via-purple-50/40 hover:to-fuchsia-50/40 border-2 border-purple-200/90 hover:border-purple-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold font-mono text-purple-700 bg-purple-50 group-hover:bg-purple-100/80 px-2.5 py-1 rounded-full border border-purple-200">
                  <span>Fee Ledger</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition">
                  Student Fee Management & Collections
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manage student fees, monthly collections, pending payments and billing reports.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open Fee Dashboard</span>
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Course & Domain Analytics Deep Dive */}
          <Link
            to="/admin/analytics/courses"
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:via-indigo-50/40 hover:to-purple-50/40 border border-slate-200/90 hover:border-indigo-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold font-mono text-indigo-700 bg-indigo-50 group-hover:bg-indigo-100/80 px-2.5 py-1 rounded-full border border-indigo-200">
                  <span>Curriculum</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-700 transition">
                  Course & Domain Analytics
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Deep analytics across courses, learning velocity, student distributions, and completion milestones.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Explore Course Intelligence</span>
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Institutional Batches & Colleges */}
          <Link
            to="/admin/batches"
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:via-pink-50/40 hover:to-rose-50/40 border border-slate-200/90 hover:border-pink-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold font-mono text-pink-700 bg-pink-50 group-hover:bg-pink-100/80 px-2.5 py-1 rounded-full border border-pink-200">
                  <span>Cohorts</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-pink-700 transition">
                  Batches & Institutional Cohorts
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Manage academic cohorts, partner colleges, institutional training schedules and telemetry.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-pink-600 group-hover:text-pink-700">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Manage Institutional Hub</span>
              </span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. EMPTY STATE WHEN NO STUDENTS EXIST IN DATABASE           */}
      {/* ────────────────────────────────────────────────────────── */}
      {isEmpty || totalUniqueStudents === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-2xl mx-auto shadow-xs my-8">
          <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">No student data available yet.</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              There are currently no student records in the STACK QUEUE database. The Analytics Hub operates exclusively with actual student records without dummy data or spreadsheet fallbacks.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/admin/lms"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Enroll Student via LMS</span>
            </Link>
            <Link
              to="/admin/batches"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <span>Add College Batch</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ────────────────────────────────────────────────────────── */}
          {/* 3. CORE KPI TILES (ACTUAL DATABASE METRICS)                */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <AnalyticsKpiCard
              title="Total Unique Students"
              value={totalUniqueStudents}
              subtitle="Permanent student IDs"
              icon={Users}
              color="purple"
              badge="Deduplicated"
            />
            <AnalyticsKpiCard
              title="Active Enrollments"
              value={enrollmentSummary.totalActiveEnrollments || 0}
              subtitle="Active course learning"
              icon={BookOpen}
              color="emerald"
              badge={`${enrollmentSummary.activePercentage || 100}% Active`}
            />
            <AnalyticsKpiCard
              title="Completed Courses"
              value={enrollmentSummary.totalCompletedEnrollments || 0}
              subtitle="Curriculum completed"
              icon={CheckCircle2}
              color="cyan"
              badge="Graduated"
            />
            <AnalyticsKpiCard
              title="LMS Students"
              value={enrollmentSummary.lmsStudentsCount || 0}
              subtitle="Core institute courses"
              icon={GraduationCap}
              color="amber"
              badge="LMS Track"
            />
            <AnalyticsKpiCard
              title="College Batch Students"
              value={enrollmentSummary.collegeStudentsCount || 0}
              subtitle="Institutional cohorts"
              icon={Building2}
              color="pink"
              badge="College Track"
            />
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* 4. UNIFIED FULL-WIDTH ANALYTICS: COURSES & DOMAINS MATRIX  */}
          {/* ────────────────────────────────────────────────────────── */}
          <UnifiedAnalyticsSection
            topCourses={topCourses}
            domainDistribution={domainDistribution}
            totalUniqueStudents={totalUniqueStudents}
            totalDomainStudents={totalDomainStudents || data?.totalDomainStudents || 0}
            enrollmentSummary={enrollmentSummary}
            selectedCourseFilter={selectedCourseFilter}
            onSelectCourse={(courseName) => setSelectedCourseFilter(courseName)}
            selectedDomainFilter={selectedDomainFilter}
            onSelectDomain={(domainName) => setSelectedDomainFilter(domainName)}
          />

          {/* ────────────────────────────────────────────────────────── */}
          {/* 5. VISUALIZATION ROW 2: COLLEGE & BATCH DISTRIBUTIONS     */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* College Distribution Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>College-wise Student Distribution</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Students enrolled across partner institutions</p>
                </div>
                <span className="text-[11px] font-bold font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {collegeDistribution.length} Colleges
                </span>
              </div>

              {collegeDistribution.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No college batch enrollments recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {collegeDistribution.map((col, idx) => {
                    const isSelected = selectedCollegeFilter === col.collegeName;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedCollegeFilter(isSelected ? 'All' : col.collegeName)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 shadow-2xs font-bold text-purple-900'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          <span className="font-semibold">{col.collegeName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900">{col.count} Students</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">({col.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Batch Distribution Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Batch-wise Student Distribution</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Students enrolled in college training cohorts</p>
                </div>
                <span className="text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {batchDistribution.length} Batches
                </span>
              </div>

              {batchDistribution.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No active batches recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {batchDistribution.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">{b.batchName}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {b.count} Students
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* 6. INTERACTIVE STUDENT ROSTER & DRILL-DOWN DIRECTORY       */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-xs">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Verified Student Roster</span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                    {filteredStudents.length} / {totalUniqueStudents} Students
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct database records. Filtering by course, domain, or college updates this table dynamically.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="self-start md:self-auto px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              {/* Search Box */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, name, email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              {/* Course Filter */}
              <div>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Courses</option>
                  {filters.courses?.map((c) => (
                    <option key={c.id || c.title} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domain Filter */}
              <div>
                <select
                  value={selectedDomainFilter}
                  onChange={(e) => setSelectedDomainFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Domains</option>
                  {filters.domains?.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Track Filter */}
              <div>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Student Tracks</option>
                  <option value="LMS">LMS Institute Only</option>
                  <option value="COLLEGE_TRAINING">College Training Only</option>
                  <option value="BOTH">Dual Track (Both)</option>
                </select>
              </div>

              {/* College Filter */}
              <div>
                <select
                  value={selectedCollegeFilter}
                  onChange={(e) => setSelectedCollegeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Colleges</option>
                  {filters.colleges?.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Table */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-black text-slate-700 z-10">
                    <tr>
                      <th className="px-4 py-3">Student ID</th>
                      <th className="px-4 py-3">Student Name & Email</th>
                      <th className="px-4 py-3">Student Track</th>
                      <th className="px-4 py-3">Enrolled Course(s)</th>
                      <th className="px-4 py-3">College & Batch</th>
                      <th className="px-4 py-3">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-slate-400 font-semibold">
                          No students match the selected filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((stu, sIdx) => {
                        const trackBadge =
                          stu.studentType === 'BOTH'
                            ? { label: 'Dual Track (Both)', bg: 'bg-purple-100 text-purple-900 border-purple-200' }
                            : stu.studentType === 'COLLEGE_TRAINING'
                            ? { label: 'College Training', bg: 'bg-pink-100 text-pink-900 border-pink-200' }
                            : { label: 'LMS Institute', bg: 'bg-blue-100 text-blue-900 border-blue-200' };

                        return (
                          <tr key={sIdx} className="hover:bg-slate-50/70 transition">
                            {/* Student ID */}
                            <td className="px-4 py-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                              {stu.permanentStudentId || 'N/A'}
                            </td>

                            {/* Name & Email */}
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{stu.name}</p>
                              <p className="font-mono text-[11px] text-slate-500 truncate max-w-xs">{stu.email}</p>
                            </td>

                            {/* Track Badge */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${trackBadge.bg}`}>
                                {trackBadge.label}
                              </span>
                            </td>

                            {/* Courses List */}
                            <td className="px-4 py-3">
                              {stu.courses && stu.courses.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-sm">
                                  {stu.courses.map((c, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                                        c.status === 'COMPLETED'
                                          ? 'bg-slate-200 text-slate-700'
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}
                                    >
                                      <span>{c.courseTitle}</span>
                                      {c.status === 'COMPLETED' && (
                                        <span className="text-[9px] uppercase font-black ml-1 text-slate-500">(Done)</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">No active course</span>
                              )}
                            </td>

                            {/* College & Batch */}
                            <td className="px-4 py-3 text-slate-700">
                              {stu.college ? (
                                <div>
                                  <p className="font-bold text-slate-900 truncate max-w-xs">{stu.college.name}</p>
                                  <p className="text-[10px] text-slate-500">{stu.batch ? `Batch: ${stu.batch.name}` : ''}</p>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Direct LMS Admission</span>
                              )}
                            </td>

                            {/* Account Status */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 w-fit ${
                                stu.isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {stu.isActive ? <Unlock className="w-2.5 h-2.5 inline mr-1" /> : <Lock className="w-2.5 h-2.5 inline mr-1" />}
                                <span>{stu.isActive ? 'Active' : 'Deactivated'}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
