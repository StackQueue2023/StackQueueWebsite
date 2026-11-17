import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  BookOpen,
  Briefcase,
  FolderGit2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import FeeManagementDashboard from '../../../components/payments/FeeManagementDashboard';
import CategoryPaymentDashboard from '../../../components/payments/CategoryPaymentDashboard';
import AdminInternshipPaymentAnalyticsPage from './AdminInternshipPaymentAnalyticsPage';

export default function StudentFeeManagementAnalyticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  const [activeOption, setActiveOption] = useState(() => {
    if (urlTab === 'internship' || urlTab === 'internships') return 'internship';
    if (urlTab === 'project' || urlTab === 'projects') return 'project';
    if (urlTab === 'financial_ops' || urlTab === 'financial') return 'financial_ops';
    return 'course';
  });

  useEffect(() => {
    if (urlTab === 'internship' || urlTab === 'internships') {
      setActiveOption('internship');
    } else if (urlTab === 'project' || urlTab === 'projects') {
      setActiveOption('project');
    } else if (urlTab === 'financial_ops' || urlTab === 'financial') {
      setActiveOption('financial_ops');
    } else if (urlTab === 'course' || urlTab === 'courses') {
      setActiveOption('course');
    }
  }, [urlTab]);

  const handleSelectOption = (opt) => {
    setActiveOption(opt);
    setSearchParams({ tab: opt });
  };

  const navOptions = [
    {
      id: 'course',
      label: 'Course Payment',
      desc: 'Regular LMS course fee collections & schedules',
      icon: BookOpen,
      badge: 'Course'
    },
    {
      id: 'internship',
      label: 'Internship Payment',
      desc: '15-day technical internship payments & batch bar analytics',
      icon: Briefcase,
      badge: '15-Day'
    },
    {
      id: 'project',
      label: 'Project Payment',
      desc: 'Final year & capstone project fee realizations',
      icon: FolderGit2,
      badge: 'Project'
    },
    {
      id: 'financial_ops',
      label: 'Financial Operations & Sub-Analytics',
      desc: 'Overdue dues, urgency priority rankings, and verified transaction reports',
      icon: DollarSign,
      badge: 'Ledger'
    }
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/analytics"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Analytics Hub</span>
        </Link>

        <div className="flex items-center space-x-2 text-slate-400 text-xs">
          <Link to="/admin/analytics" className="hover:text-purple-700 transition font-medium">Analytics Hub</Link>
          <span>/</span>
          <span className="text-purple-700 font-bold">Payment Analytics</span>
        </div>
      </div>

      {/* Main Payment Analytics Title Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#9333EA] to-purple-600 text-white flex items-center justify-center shadow-md">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Payment Analytics
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Centralized financial intelligence, real-time fee tracking & collection operations (Bar Diagrams Only)
              </p>
            </div>
          </div>
        </div>

        {/* 4 Main Payment Analytics Option Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {navOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = activeOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-50/70 border-purple-600 shadow-xs ring-1 ring-purple-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase ${
                    isSelected ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <div>
                  <h3 className={`text-sm font-black ${isSelected ? 'text-purple-950' : 'text-slate-800'}`}>
                    {opt.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Option Content Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 md:p-6 shadow-xs">
        {/* OPTION 1: Course Payment */}
        {activeOption === 'course' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Course Payment Analytics</span>
              </h2>
              <p className="text-xs text-slate-500">
                Regular academic student course fee management, monthly installments & collection logs
              </p>
            </div>
            <FeeManagementDashboard showHeader={false} />
          </div>
        )}

        {/* OPTION 2: Internship Payment */}
        {activeOption === 'internship' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span>Internship Payment Analytics</span>
              </h2>
              <p className="text-xs text-slate-500">
                15-day technical internship student fees, batch distributions, and realization rates (Bar Charts Only)
              </p>
            </div>
            <AdminInternshipPaymentAnalyticsPage embedded={true} initialTab="overview" />
          </div>
        )}

        {/* OPTION 3: Project Payment */}
        {activeOption === 'project' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-pink-600" />
                <span>Project Payment Analytics</span>
              </h2>
              <p className="text-xs text-slate-500">
                Final year capstone engineering project fees, milestone deposits & student dues
              </p>
            </div>
            <CategoryPaymentDashboard category="Project" />
          </div>
        )}

        {/* OPTION 4: Financial Operations & Sub-Analytics */}
        {activeOption === 'financial_ops' && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                <span>Financial Operations & Sub-Analytics</span>
              </h2>
              <p className="text-xs text-slate-500">
                Comprehensive revenue realization, installment tracking, outstanding dues analysis & verified transaction ledgers
              </p>
            </div>
            <AdminInternshipPaymentAnalyticsPage embedded={true} initialTab="financial_ops" />
          </div>
        )}
      </div>
    </div>
  );
}
