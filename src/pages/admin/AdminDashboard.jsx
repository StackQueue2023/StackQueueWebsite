import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Shield,
  Users,
  GraduationCap,
  Gamepad2,
  PlusCircle,
  BookOpen,
  Code2,
  Radio,
  Award,
  ChevronRight,
  Layers,
  FolderGit2
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const attemptsByGame = stats?.attemptsByGame || [];
  const batches = stats?.batches || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none absolute -right-20 -top-20"></div>
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Institute Command Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Administration & Analytics</h1>
          <p className="text-xs text-slate-500">
            Enterprise management of students, trainers, partner colleges, batches, curriculum tracks, and real-time game activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            to="/admin/inquiries"
            className="px-4 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white font-bold rounded-xl text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>Admissions Inquiries</span>
          </Link>
          <Link
            to="/admin/challenges"
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs border border-purple-200/80 shadow-xs flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Challenges CMS</span>
          </Link>
          <Link
            to="/admin/batches"
            className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs border border-purple-200/80 shadow-xs transition"
          >
            <span>Batches</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 space-y-1 shadow-xs hover:border-purple-200 transition">
          <span className="text-slate-500 text-xs font-semibold">Total Students</span>
          <p className="text-2xl font-black text-slate-900 font-mono">{stats?.totalStudents || 3}</p>
          <span className="text-[11px] text-purple-600 font-medium">Active platform learners</span>
        </div>

        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 space-y-1 shadow-xs hover:border-purple-200 transition">
          <span className="text-slate-500 text-xs font-semibold">Active Batches</span>
          <p className="text-2xl font-black text-amber-600 font-mono">{stats?.totalBatches || 2}</p>
          <span className="text-[11px] text-slate-500 font-medium">Across {stats?.totalColleges || 2} Partner Colleges</span>
        </div>

        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 space-y-1 shadow-xs hover:border-purple-200 transition">
          <span className="text-slate-500 text-xs font-semibold">Total Challenges</span>
          <p className="text-2xl font-black text-purple-600 font-mono">{stats?.totalChallenges || 15}</p>
          <span className="text-[11px] text-purple-600 font-medium">Across 11 Game Tracks</span>
        </div>

        <div className="bg-white border border-purple-100/90 rounded-2xl p-4 space-y-1 shadow-xs hover:border-purple-200 transition">
          <span className="text-slate-500 text-xs font-semibold">Platform Pass Rate</span>
          <p className="text-2xl font-black text-emerald-600 font-mono">{stats?.overallAccuracy || 88}%</p>
          <span className="text-[11px] text-emerald-600 font-medium">{stats?.totalAttempts || 40} Total Attempts</span>
        </div>
      </div>

      {/* ── ADMIN MANAGEMENT MODULES HUB ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E02B91]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">
              Admin Management Modules
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Full institute management controls
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              to: '/projects',
              title: 'Projects & Tasks',
              desc: 'Manage requirements, tutor code reviews, GitHub sync & approvals',
              icon: FolderGit2,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              border: 'border-purple-200',
              badge: 'Workflow'
            },
            {
              to: '/admin/domain-management',
              title: 'Domain Management',
              desc: 'Manage Courses, Internships & Capstone Projects catalog',
              icon: Layers,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              border: 'border-purple-200',
              badge: 'Catalog'
            },
            {
              to: '/admin/lms',
              title: 'LMS Portal',
              desc: 'Curriculum tracks, subjects & teaching plans',
              icon: GraduationCap,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
              border: 'border-purple-200',
              badge: 'Workflow'
            },
            {
              to: '/admin/users',
              title: 'User Management',
              desc: 'Students, tutors, trainers, credentials & roles',
              icon: Users,
              color: 'text-pink-600',
              bg: 'bg-pink-50',
              border: 'border-pink-200',
              badge: 'Access'
            },
            {
              to: '/admin/batches',
              title: 'Courses & Batches',
              desc: 'Partner colleges, academic cohorts & semesters',
              icon: Shield,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-200',
              badge: 'Institutes'
            },
            {
              to: '/admin/interview-questions',
              title: 'Interview Questions',
              desc: '100+ technical questions, hints & test cases',
              icon: Code2,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
              border: 'border-indigo-200',
              badge: '100 Qs'
            },
            {
              to: '/admin/challenges',
              title: 'Challenges CMS',
              desc: '1.1k gamified sandbox coding challenges',
              icon: PlusCircle,
              color: 'text-cyan-600',
              bg: 'bg-cyan-50',
              border: 'border-cyan-200',
              badge: 'Games'
            },
            {
              to: '/admin/live-monitor',
              title: 'Live Class Monitor',
              desc: 'Active training sessions, attendance & logs',
              icon: Radio,
              color: 'text-rose-600',
              bg: 'bg-rose-50',
              border: 'border-rose-200',
              badge: 'Live'
            },
            {
              to: '/admin/badges',
              title: 'Settings & XP Rules',
              desc: 'Gamification rules, badges & XP leveling',
              icon: Award,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              badge: 'Rules'
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="bg-white border border-slate-200/90 hover:border-[#E02B91]/60 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2.5 rounded-xl ${item.bg} ${item.border} border ${item.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.bg} ${item.color} border ${item.border}`}>
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#E02B91] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#E02B91] transition-colors">
                  <span>Open Portal</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2-Column Section: Most Played Games & Batch Cohorts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Played Games (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-purple-100/90 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-purple-600 font-bold text-xs uppercase tracking-wider font-mono">
            <Gamepad2 className="w-4 h-4" />
            <span>Most Active Game Arenas</span>
          </div>

          <div className="space-y-2.5">
            {attemptsByGame.length === 0 ? (
              <div className="space-y-2">
                {['css-arena', 'java-quest', 'python-island', 'dsa-battle', 'sql-detective'].map((g, i) => (
                  <div key={i} className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 uppercase font-mono">{g}</span>
                    <span className="text-purple-600 font-mono font-semibold">{25 - i * 4} Attempts</span>
                  </div>
                ))}
              </div>
            ) : (
              attemptsByGame.map((g) => (
                <div key={g._id} className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase font-mono">{g._id}</span>
                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-slate-500">{g.count} Attempts</span>
                    <span className="text-emerald-600 font-bold">{Math.round((g.passed / g.count) * 100)}% Pass</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Batches Overview (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-purple-100/90 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs uppercase tracking-wider font-mono">
            <GraduationCap className="w-4 h-4" />
            <span>Institute Cohorts & Batches</span>
          </div>

          <div className="space-y-2.5">
            {batches.map((b) => (
              <div key={b._id} className="p-3 bg-purple-50/40 border border-purple-100 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{b.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                    {b.status}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>College: {b.collegeId?.name}</span>
                  <span className="font-mono text-purple-600 font-semibold">Avg Score: {b.averageScore || 85}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
