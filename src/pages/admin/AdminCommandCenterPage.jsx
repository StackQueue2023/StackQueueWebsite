import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import paymentApi from '../../api/paymentApi';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Layers,
  Radio,
  UserCheck,
  Tag,
  ChevronRight,
  Plus,
  RefreshCw,
  Briefcase,
  FolderGit2,
  BarChart3
} from 'lucide-react';

export default function AdminCommandCenterPage() {
  const navigate = useNavigate();
  // 4 Categories Operational Analytics
  const cachedData = api.peekCache?.('/payments/command-center-analytics');
  const [categoryAnalytics, setCategoryAnalytics] = useState(cachedData?.data?.categories || null);
  const [loading, setLoading] = useState(!cachedData);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommandCenterData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await paymentApi.getCommandCenterAnalytics();
      if (res.data?.success) {
        setCategoryAnalytics(res.data.data.categories);
      }
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommandCenterData(!!cachedData);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchCommandCenterData(false);
  };

  if (loading && !categoryAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Institute Command Center...</p>
        <button
          type="button"
          onClick={() => fetchCommandCenterData(false)}
          className="text-xs font-bold text-purple-600 hover:text-purple-700 underline pt-2 cursor-pointer"
        >
          Click to Retry
        </button>
      </div>
    );
  }

  const categoryConfigs = [
    {
      key: 'Courses',
      name: 'Courses',
      subtitle: 'Institute LMS & Degree Programs',
      route: '/admin/analytics/courses',
      icon: GraduationCap,
      color: 'from-purple-600 to-indigo-600',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Full-stack software engineering, data science, and core computer science curricula.'
    },
    {
      key: 'College Training',
      name: 'College Training',
      subtitle: 'Partner Universities & Campus Batches',
      route: '/admin/batches',
      icon: Building2,
      color: 'from-fuchsia-600 to-pink-600',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      description: 'On-campus and remote institutional cohorts with dedicated curriculum schedules.'
    },
    {
      key: 'Internships',
      name: 'Internships',
      subtitle: 'Industry Immersion & Placement Tracks',
      route: '/admin/internships',
      icon: Briefcase,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Hands-on practical apprenticeships with real-world product deliverables.'
    },
    {
      key: 'Projects',
      name: 'Projects',
      subtitle: 'Capstone Labs & GitHub Milestones',
      route: '/admin/projects',
      icon: FolderGit2,
      color: 'from-cyan-600 to-blue-600',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      description: 'Evaluation criteria, automated code review, and student final submissions.'
    }
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 1. Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Institute Operations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-purple-600 shrink-0" />
              <span>Institute Command Center</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Centralized operational command for Courses, College Training, Internships, and Projects. Click any category to open its dedicated management page.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3.5 py-2.5 bg-white hover:bg-purple-50/80 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
              title="Refresh records"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/analytics"
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-purple-500/20"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics Hub</span>
            </Link>
            <Link
              to="/admin/analytics/courses"
              className="px-4 py-2.5 bg-white hover:bg-purple-50/80 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>Courses</span>
            </Link>
            <Link
              to="/admin/batches"
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100/80 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>Batches & Colleges</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Four Clickable Operational Categories -> Navigates to Separate Pages */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-purple-100">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Institute Academic Categories</span>
            </h2>
            <p className="text-xs text-slate-500">
              Select a category to open its dedicated management page.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryConfigs.map((cat) => {
            const Icon = cat.icon;
            const stats = categoryAnalytics?.[cat.key] || {
              totalPrograms: 3,
              activePrograms: 3,
              totalEnrolled: 3,
              completedPrograms: 0,
              mostPopularProgram: 'Standard Track'
            };

            return (
              <Link
                key={cat.key}
                to={cat.route}
                className="group bg-white rounded-2xl p-5 border border-purple-100 hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${cat.badgeColor}`}>
                      {stats.totalEnrolled} Enrolled
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-purple-700 transition">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Operational Metrics */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-purple-50">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Programs:</span>
                      <strong className="font-mono text-slate-800">{stats.totalPrograms}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Programs:</span>
                      <strong className="font-mono text-emerald-600 font-bold">{stats.activePrograms}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Popular:</span>
                      <strong className="text-purple-700 font-semibold truncate max-w-[120px]" title={stats.mostPopularProgram}>
                        {stats.mostPopularProgram}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-50 flex items-center justify-between text-xs font-bold text-purple-600 group-hover:text-purple-700">
                  <span>Open {cat.name} Page</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Operational Command Hub (Essential Shortcuts) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
            Operational Management Modules
          </h2>
          <span className="text-[11px] text-slate-400">
            Direct access to specialized admin control centers
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              to: '/admin/analytics',
              title: 'Analytics Hub',
              sub: 'Executive Analytics',
              icon: BarChart3,
              color: 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:border-indigo-300'
            },
            {
              to: '/admin/lms',
              title: 'LMS Management',
              sub: 'Student & Admission',
              icon: GraduationCap,
              color: 'text-purple-600 bg-purple-50 border-purple-100 hover:border-purple-300'
            },
            {
              to: '/admin/batches',
              title: 'Batches & Colleges',
              sub: 'College Cohorts',
              icon: Building2,
              color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100 hover:border-fuchsia-300'
            },
            {
              to: '/admin/domain-management',
              title: 'Domain Management',
              sub: 'Curriculum & Courses',
              icon: Layers,
              color: 'text-violet-600 bg-violet-50 border-violet-100 hover:border-violet-300'
            },
            {
              to: '/admin/tutors',
              title: 'Tutor Directory',
              sub: 'Faculty Management',
              icon: UserCheck,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:border-emerald-300'
            },
            {
              to: '/admin/offers',
              title: 'Offers & Discounts',
              sub: 'Promo Campaigns',
              icon: Tag,
              color: 'text-pink-600 bg-pink-50 border-pink-100 hover:border-pink-300'
            },
            {
              to: '/admin/live-monitor',
              title: 'Live Monitor',
              sub: 'Classes & Telemetry',
              icon: Radio,
              color: 'text-rose-600 bg-rose-50 border-rose-100 hover:border-rose-300'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="bg-white border border-purple-100/90 hover:border-purple-300 hover:shadow-md rounded-2xl p-4 transition flex flex-col justify-between space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${item.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {item.sub}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
