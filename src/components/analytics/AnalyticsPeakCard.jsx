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
  gradient = '',
  accentColor = ''
}) {
  const lowerCat = String(categoryTitle || '').toLowerCase();
  const isCourse = lowerCat.includes('course') || lowerCat.includes('training') || lowerCat.includes('batch');
  const isInternship = lowerCat.includes('internship');
  const isProject = lowerCat.includes('project') || lowerCat.includes('product');

  const cardTheme = isCourse
    ? { bg: 'bg-blue-50', box: 'bg-blue-100/70', border: 'border-blue-300', heading: 'text-blue-800', icon: 'text-blue-700', pill: 'bg-blue-100 border-blue-300 text-blue-800', value: 'text-blue-800', link: 'text-blue-700' }
    : isInternship
      ? { bg: 'bg-emerald-50', box: 'bg-emerald-100/70', border: 'border-emerald-300', heading: 'text-emerald-800', icon: 'text-emerald-700', pill: 'bg-emerald-100 border-emerald-300 text-emerald-800', value: 'text-emerald-800', link: 'text-emerald-700' }
      : isProject
        ? { bg: 'bg-yellow-50', box: 'bg-yellow-100/80', border: 'border-amber-300', heading: 'text-amber-900', icon: 'text-amber-800', pill: 'bg-yellow-100 border-amber-300 text-amber-900', value: 'text-amber-900', link: 'text-amber-800' }
        : { bg: 'bg-gradient-to-br from-pink-50 via-white to-purple-50', box: 'bg-purple-100/60', border: 'border-purple-300', heading: 'text-sq-gradient', icon: 'text-[#9333EA]', pill: 'bg-purple-100 border-purple-300 text-[#7E22CE]', value: 'text-sq-gradient', link: 'text-sq-gradient' };

  return (
    <div className={`${cardTheme.bg} relative overflow-hidden rounded-3xl p-6 shadow-sm border ${cardTheme.border} flex flex-col justify-between space-y-5 transition-all hover:shadow-md group`}>
      {/* Top Header Tag */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-xl border ${cardTheme.pill}`}>
            <Award className={`w-4 h-4 ${cardTheme.icon}`} />
          </span>
          <span className={`text-[10px] font-black font-mono tracking-widest uppercase ${cardTheme.icon}`}>
            {badgeText}
          </span>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${cardTheme.pill}`}>
          {categoryTitle}
        </span>
      </div>

      {/* Main Performer Content */}
      <div className="space-y-1 relative z-10">
        <h3 className={`text-lg md:text-xl font-black ${cardTheme.heading} tracking-tight leading-snug line-clamp-2`}>
          {title || 'Top Program'}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-700 font-medium line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Primary & Secondary Metrics */}
      <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${cardTheme.border} relative z-10`}>
        <div className={`${cardTheme.box} rounded-2xl p-3 border ${cardTheme.border}`}>
          <span className={`text-[10px] font-mono uppercase ${cardTheme.icon} font-bold tracking-wider block`}>
            {primaryLabel}
          </span>
          <span className={`text-xl md:text-2xl font-black font-mono ${cardTheme.value}`}>
            {primaryMetric || '0'}
          </span>
        </div>

        {secondaryMetrics.length > 0 && (
          <div className={`${cardTheme.box} rounded-2xl p-3 border ${cardTheme.border}`}>
            <span className={`text-[10px] font-mono uppercase ${cardTheme.icon} font-bold tracking-wider block truncate`}>
              {secondaryMetrics[0].label}
            </span>
            <span className={`text-xl md:text-2xl font-black font-mono ${cardTheme.value} truncate block`}>
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
            className={`inline-flex items-center space-x-1.5 text-xs font-bold ${cardTheme.link} transition group-hover:translate-x-1 duration-200`}
          >
            <span>Open {categoryTitle} Dashboard</span>
            <ChevronRight className={`w-3.5 h-3.5 ${cardTheme.icon}`} />
          </Link>
        </div>
      )}
    </div>
  );
}
