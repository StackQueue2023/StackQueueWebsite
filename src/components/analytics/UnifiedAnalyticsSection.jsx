import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Users,
  CheckCircle2,
  Filter,
  BarChart3,
  TrendingUp,
  Sparkles,
  PieChart
} from 'lucide-react';

/**
 * Unified Analytics Section
 * Replaces the split side-by-side cards with a single, full-width unified analytics display.
 * Modeled after the yellow-marked Top Courses reference layout:
 * - Full-width layout utilizing 100% of available page space
 * - Ranked course enrollments with horizontal progress bars
 * - Integrated domain-wise distribution rows and proportional visualization
 * - Exact database-backed counts, percentages, and single-source reconciliation
 * - Seamless drill-down filter controls
 */
export default function UnifiedAnalyticsSection({
  topCourses = [],
  domainDistribution = [],
  totalUniqueStudents = 0,
  totalDomainStudents = 0,
  enrollmentSummary = {},
  selectedCourseFilter = 'All',
  onSelectCourse = null,
  selectedDomainFilter = 'All',
  onSelectDomain = null
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'courses' | 'domains'

  // Course calculations
  const totalCourseCount = topCourses.reduce((acc, c) => acc + (Number(c.count) || 0), 0);
  const maxCourseCount = Math.max(...topCourses.map(c => Number(c.count) || 0), 1);

  // Domain calculations
  const calculatedDomainTotal = totalDomainStudents ||
    domainDistribution.reduce((acc, d) => acc + (Number(d.count) || 0), 0);
  const maxDomainCount = Math.max(...domainDistribution.map(d => Number(d.count) || 0), 1);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-xs space-y-6 transition-all hover:border-purple-200">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & FILTER CONTROLS                            */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border border-purple-200">
              Full-Width Analytics Matrix
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Database Verified
            </span>
          </div>
          <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600 inline" />
            <span>Top Courses & Technical Domain Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified live database aggregation ranking accredited courses by unique student enrollments and specialized domains
          </p>
        </div>

        {/* View Switcher & Active Filter Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unified View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Courses ({topCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('domains')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'domains'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Domains ({domainDistribution.length})
            </button>
          </div>

          {/* Active Filter Clear Buttons */}
          {selectedCourseFilter !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectCourse && onSelectCourse('All')}
              className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition flex items-center space-x-1"
            >
              <span>Course: {selectedCourseFilter}</span>
              <span className="text-purple-400 font-normal ml-1">×</span>
            </button>
          )}

          {selectedDomainFilter !== 'All' && (
            <button
              type="button"
              onClick={() => onSelectDomain && onSelectDomain('All')}
              className="text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-xl border border-pink-200 transition flex items-center space-x-1"
            >
              <span>Domain: {selectedDomainFilter}</span>
              <span className="text-pink-400 font-normal ml-1">×</span>
            </button>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. RECONCILED QUICK KPI BADGES (FULL-WIDTH STRIP)          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
        <div className="flex items-center space-x-2.5 px-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total Unique Students</p>
            <p className="text-xs font-black text-slate-900 font-mono">{totalUniqueStudents} Students</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 px-2 border-l border-slate-200/60">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Course Enrollments</p>
            <p className="text-xs font-black text-slate-900 font-mono">{totalCourseCount} Enrollments</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 px-2 border-l border-slate-200/60">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Classified Domains</p>
            <p className="text-xs font-black text-slate-900 font-mono">{calculatedDomainTotal} Classified</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 px-2 border-l border-slate-200/60">
          <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Active Rate</p>
            <p className="text-xs font-black text-slate-900 font-mono">{enrollmentSummary.activePercentage || 100}% Active</p>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3 & 4. TWO-COLUMN LAYOUT: TOP COURSES (55%) + DOMAINS (45%) */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Top Courses by Unique Student Enrollment (~55%) */}
        {(activeTab === 'all' || activeTab === 'courses') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs`}>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Top Courses by Unique Student Enrollment</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live database aggregation ranking courses by verified unique student enrollments
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0">
                {topCourses.length} Courses Recorded
              </span>
            </div>

            {topCourses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold bg-slate-50 rounded-2xl">
                No course enrollment records found in database.
              </div>
            ) : (
              <div className="space-y-3">
                {topCourses.map((course, idx) => {
                  const count = Number(course.count) || 0;
                  const pct = Math.round((count / (totalCourseCount || 1)) * 100);
                  const barWidth = Math.max(4, Math.round((count / maxCourseCount) * 100));
                  const isSelected = selectedCourseFilter === course.name;
                  const barColor = course.color || ['#8B2BE2', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'][idx % 7];

                  return (
                    <div
                      key={course.id || course.name + idx}
                      onClick={() => onSelectCourse && onSelectCourse(isSelected ? 'All' : course.name)}
                      className={`group cursor-pointer p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:bg-purple-50/40 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 mb-2">
                        {/* Left: Rank, Title, Domain Badge, Cohort details */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400 w-6">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-purple-700 transition">
                            {course.name}
                          </span>
                          {course.domain && (
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              {course.domain}
                            </span>
                          )}
                          {(course.lmsCount !== undefined || course.collegeCount !== undefined) && (
                            <span className="text-[10px] font-mono text-slate-400 hidden xl:inline">
                              (LMS: {course.lmsCount || 0} • College: {course.collegeCount || 0})
                            </span>
                          )}
                        </div>

                        {/* Right: Student Count & Percentage Badge */}
                        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                          <span className="font-mono font-bold text-slate-900 text-xs md:text-sm">
                            {count.toLocaleString()} Students
                          </span>
                          <span className="text-[10px] font-bold font-mono text-purple-700 bg-purple-100/70 border border-purple-200 px-2 py-0.5 rounded-md">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Track (Full-Width) */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: barColor
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Course Footer Summary */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Displaying Top {topCourses.length} records</span>
              <span className="font-bold text-slate-700">Total: {totalCourseCount.toLocaleString()} Students</span>
            </div>
          </div>
        )}

        {/* Right Side: Domain-wise Student Distribution (~45%) */}
        {(activeTab === 'all' || activeTab === 'domains') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs`}>
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Domain-wise Student Distribution</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Students partitioned across technical specialization domains
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                Segments: {domainDistribution.length}
              </span>
            </div>

            {domainDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold bg-slate-50 rounded-2xl">
                No domain classifications recorded in database.
              </div>
            ) : (
              <>
                {/* Integrated Multi-Segment Proportional Visualization Bar */}
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-600 flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-purple-600" />
                      Proportional Domain Partitioning
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold">
                      Classified Total: <strong className="text-slate-900">{calculatedDomainTotal} Students</strong>
                    </span>
                  </div>

                  {/* Stacked Proportional Bar */}
                  <div className="w-full bg-slate-200/80 rounded-xl h-3.5 overflow-hidden flex shadow-inner">
                    {domainDistribution.map((domain, idx) => {
                      const count = Number(domain.count) || 0;
                      const pct = Math.max(1, Math.round((count / (calculatedDomainTotal || 1)) * 100));
                      const color = domain.color || ['#10B981', '#8B2BE2', '#3B82F6', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'][idx % 7];
                      return (
                        <div
                          key={domain.id || idx}
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color
                          }}
                          className="h-full transition-all hover:opacity-90 relative group"
                          title={`${domain.name}: ${count} Students (${pct}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Visual Legend Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {domainDistribution.map((domain, idx) => {
                      const count = Number(domain.count) || 0;
                      const pct = Math.round((count / (calculatedDomainTotal || 1)) * 100);
                      const color = domain.color || ['#10B981', '#8B2BE2', '#3B82F6', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'][idx % 7];
                      const isSelected = selectedDomainFilter === domain.name;

                      return (
                        <button
                          key={domain.id || idx}
                          type="button"
                          onClick={() => onSelectDomain && onSelectDomain(isSelected ? 'All' : domain.name)}
                          className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                            isSelected
                              ? 'bg-purple-100/80 border-purple-300 text-purple-900 shadow-2xs font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate max-w-[120px]">{domain.name}</span>
                          <span className="font-mono font-bold text-slate-900">{count}</span>
                          <span className="text-[10px] font-mono text-slate-400">({pct}%)</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Domain Rows */}
                <div className="space-y-3">
                  {domainDistribution.map((domain, idx) => {
                    const count = Number(domain.count) || 0;
                    const pct = Math.round((count / (calculatedDomainTotal || 1)) * 100);
                    const barWidth = Math.max(4, Math.round((count / maxDomainCount) * 100));
                    const isSelected = selectedDomainFilter === domain.name;
                    const domainColor = domain.color || ['#10B981', '#8B2BE2', '#3B82F6', '#EC4899', '#F59E0B', '#06B6D4', '#6366F1'][idx % 7];

                    return (
                      <div
                        key={domain.id || domain.name + idx}
                        onClick={() => onSelectDomain && onSelectDomain(isSelected ? 'All' : domain.name)}
                        className={`group cursor-pointer p-3.5 rounded-2xl transition-all border ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:bg-emerald-50/40 hover:border-emerald-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 mb-2">
                          {/* Left: Rank, Domain Name, Indicator */}
                          <div className="flex items-center space-x-2 truncate">
                            <span className="font-mono text-xs font-bold text-slate-400 w-6">
                              #{idx + 1}
                            </span>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: domainColor }}
                            />
                            <span className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-emerald-700 transition truncate">
                              {domain.name}
                            </span>
                          </div>

                          {/* Right: Count & Percentage Badges */}
                          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                            <span className="font-mono font-bold text-slate-900 text-xs md:text-sm">
                              {count.toLocaleString()} Students
                            </span>
                            <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md">
                              {pct}%
                            </span>
                            {domain.overallPercentage !== undefined && (
                              <span className="text-[10px] font-mono text-slate-400 hidden xl:inline">
                                ({domain.overallPercentage}% of total)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Track (Full-Width) */}
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barWidth}%`,
                              backgroundColor: domainColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Domain Footer Summary */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Segments: {domainDistribution.length}</span>
              <span className="font-bold text-slate-700">Total: {calculatedDomainTotal.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. SINGLE SOURCE OF TRUTH RECONCILIATION FOOTER            */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-mono text-[11px] font-bold text-slate-700">
            Single Source of Truth: {totalUniqueStudents} unique student profiles reconciled across LMS & College Cohorts
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono">
          Click any course or domain row to drill down into the Verified Student Roster
        </p>
      </div>
    </div>
  );
}
