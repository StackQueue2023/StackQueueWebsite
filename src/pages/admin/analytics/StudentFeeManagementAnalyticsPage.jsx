import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, CreditCard, ShieldCheck } from 'lucide-react';
import FeeManagementDashboard from '../../../components/payments/FeeManagementDashboard';

export default function StudentFeeManagementAnalyticsPage() {
  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/admin/analytics"
          className="inline-flex items-center space-x-2 text-xs font-bold text-blue-800 bg-white hover:bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-2xs transition group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Analytics Hub</span>
        </Link>

        <div className="flex items-center space-x-2 text-slate-400 text-xs">
          <Link to="/admin/analytics" className="hover:text-blue-800 transition font-medium">Analytics Hub</Link>
          <span>/</span>
          <span className="text-blue-800 font-bold">Fee Management & Collections</span>
        </div>
      </div>

      {/* Embedded Complete Fee Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <FeeManagementDashboard showHeader={true} />
      </div>
    </div>
  );
}
