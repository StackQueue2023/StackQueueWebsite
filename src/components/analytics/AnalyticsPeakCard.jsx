import React from 'react';
import { Award, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Peak Performance Spotlight Card
 */
export default function AnalyticsPeakCard({
  categoryTitle = 'Course',
  badgeText = 'Peak Performer',
  title = '',
  subtitle = '',
  primaryMetric = '',
  primaryLabel = 'Enrolled',
  secondaryMetrics = [], // [{ label, value }]
  route = null,
  gradient = 'from-purple-900 via-indigo-900 to-slate-900',
  accentColor = 'text-amber-400'
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} text-white p-6 shadow-lg border border-white/10 flex flex-col justify-between space-y-5 transition-all hover:shadow-xl group`}>
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 w-44 h-44 bg-gradient-to-br from-amber-400/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Tag */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
            <Award className={`w-4 h-4 ${accentColor}`} />
          </span>
          <span className="text-[10px] font-black font-mono tracking-widest uppercase text-amber-300">
            {badgeText}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
          {categoryTitle}
        </span>
      </div>

      {/* Main Performer Content */}
      <div className="space-y-1 relative z-10">
        <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug line-clamp-2">
          {title || 'Top Program'}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-300 font-medium line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Primary & Secondary Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 relative z-10">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
          <span className="text-[10px] font-mono uppercase text-slate-300 font-bold tracking-wider block">
            {primaryLabel}
          </span>
          <span className="text-xl md:text-2xl font-black font-mono text-white">
            {primaryMetric || '0'}
          </span>
        </div>

        {secondaryMetrics.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm">
            <span className="text-[10px] font-mono uppercase text-slate-300 font-bold tracking-wider block truncate">
              {secondaryMetrics[0].label}
            </span>
            <span className="text-xl md:text-2xl font-black font-mono text-amber-300 truncate block">
              {secondaryMetrics[0].value}
            </span>
          </div>
        )}
      </div>

      {/* Action Route Link */}
      {route && (
        <div className="pt-2 relative z-10">
          <Link
            to={route}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-200 hover:text-white transition group-hover:translate-x-1 duration-200"
          >
            <span>Open {categoryTitle} Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
