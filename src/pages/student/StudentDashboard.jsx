import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Sparkles,
  Target, Zap, CheckCircle2, Star, ArrowRight, Briefcase, Award,
  Video, Calendar, Clock, User, ExternalLink, Radio
} from 'lucide-react';
import OffersCarousel from '../../components/common/OffersCarousel';

/* ── Domain colour & metadata with dynamic fallback ── */
const DOMAIN_META = {
  java:   { label:'Java',   icon:'☕', color:'from-blue-600 to-blue-700',       bg:'bg-white', border:'border-blue-200',   text:'text-blue-700',   ring:'#2563EB' },
  python: { label:'Python', icon:'🐍', color:'from-indigo-500 to-purple-600', bg:'bg-white', border:'border-purple-200', text:'text-purple-700', ring:'#9333EA' },
  cpp:    { label:'C++',    icon:'⚡', color:'from-purple-500 to-indigo-500', bg:'bg-white', border:'border-purple-200', text:'text-purple-700', ring:'#8B5CF6' },
  react:  { label:'React',  icon:'⚛️', color:'from-blue-600 to-indigo-600',   bg:'bg-white', border:'border-blue-200',   text:'text-blue-700',   ring:'#2563EB' },
};

function getDomainMeta(domainKey) {
  const k = (domainKey || '').toLowerCase();
  if (DOMAIN_META[k]) return DOMAIN_META[k];
  return {
    label: domainKey ? domainKey.charAt(0).toUpperCase() + domainKey.slice(1) : 'Course',
    icon: '💻',
    color: 'from-violet-600 to-indigo-600',
    bg: 'bg-white',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    ring: '#6366F1'
  };
}

/* ── Thin Progress Bar ── */
function ProgressBar({ pct = 0, colorClass = 'bg-gradient-to-r from-purple-600 to-pink-500' }) {
  return (
    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
      <div
        className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

/* ── Live Class Card Component ── */
function LiveClassCard({ session }) {
  const courseTitle = session.courseId?.title || 'Assigned Course';
  const tutorName = session.tutorId?.name || 'Assigned Tutor';
  const scheduledDateStr = session.scheduledDate
    ? new Date(session.scheduledDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '—';

  const status = (session.status || 'UPCOMING').toUpperCase();

  const statusBadge = {
    LIVE: (
      <span className="bg-white inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black text-sq-gradient animate-pulse shadow-xs border border-[#9333EA]">
        <Radio className="w-3.5 h-3.5" /> LIVE NOW
      </span>
    ),
    UPCOMING: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-purple-700 border border-purple-200">
        <Clock className="w-3 h-3 text-purple-600" /> Upcoming
      </span>
    ),
    COMPLETED: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
        <CheckCircle2 className="w-3 h-3 text-slate-400" /> Completed
      </span>
    ),
    CANCELLED: (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-red-700 border border-red-200">
        Cancelled
      </span>
    )
  }[status] || (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-purple-700 border border-purple-200">
      {status}
    </span>
  );

  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 ${status === 'LIVE' ? 'border-red-400 bg-white shadow-md' : 'border-slate-200 bg-white shadow-xs hover:border-purple-300'} transition-all p-5 flex flex-col justify-between gap-4`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl ${status === 'LIVE' ? 'bg-white text-sq-gradient border border-[#9333EA]' : 'bg-white text-sq-gradient border border-[#9333EA]'} flex items-center justify-center font-bold text-lg shadow-xs shrink-0`}>
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-100">
                {courseTitle}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1 line-clamp-1">
                {session.title || 'Live Interactive Session'}
              </h3>
            </div>
          </div>
          {statusBadge}
        </div>

        {session.description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pl-0.5">
            {session.description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3 py-2 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate font-semibold">{scheduledDateStr}</span>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3 py-2 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate font-semibold">
              {session.startTime || 'TBD'} {session.endTime ? `- ${session.endTime}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3 py-2 rounded-xl sm:col-span-2">
            <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="truncate font-semibold">
              Tutor: <strong className="text-slate-800">{tutorName}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold text-slate-400 truncate">
          Direct Meeting Link
        </span>

        {session.meetingLink && status !== 'COMPLETED' && status !== 'CANCELLED' ? (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all ${ status === 'LIVE' ? 'bg-white text-sq-gradient animate-pulse border border-[#9333EA]' : 'bg-white text-sq-gradient shadow-md shadow-purple-500/20 border border-[#9333EA]' }`}
          >
            <span>Join Live Class</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-400 cursor-not-allowed border border-slate-200"
          >
            <span>{status === 'COMPLETED' ? 'Session Ended' : 'Link Unavailable'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Current Domain Card ── */
function CurrentDomainCard({ domain, course, analytics, onClick }) {
  const meta = getDomainMeta(domain);
  const pct = analytics?.syllabusProgress || 0;
  const done = analytics?.completedTasks || 0;
  const total = analytics?.totalTasks || 0;
  const pts = analytics?.totalPoints || 0;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-white shadow-xs hover:shadow-lg hover:border-blue-400 transition-all duration-200"
    >
      <div className="bg-blue-600 absolute top-0 left-0 bottom-0 w-2 rounded-l-2xl"/>

      <div className="pl-6 pr-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="bg-blue-100 border border-blue-300 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
            {meta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                Current Enrolled
              </span>
              <span className="text-[11px] font-semibold text-blue-700">
                {course?.durationText || (course?.durationWeeks ? `${course.durationWeeks} Weeks` : 'Curriculum')}
              </span>
            </div>
            <h3 className="text-xl font-black text-[#0F172A] group-hover:text-[#0F172A] transition-colors truncate">
              {course?.title || `${meta.label} Full Stack Development`}
            </h3>
            <p className="text-xs text-slate-700 mt-1 line-clamp-1">
              {course?.description || `Master ${meta.label} from fundamentals to advanced tasks and real projects.`}
            </p>

            {/* Progress bar */}
            <div className="mt-4 space-y-1 max-w-md">
              <div className="flex justify-between text-[11px] font-bold text-blue-800">
                <span>Syllabus Progress</span>
                <span className="text-blue-700">{pct}% Completed</span>
              </div>
              <ProgressBar pct={pct} colorClass="from-blue-600 to-indigo-600"/>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-3.5 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-blue-900">
                <Target className="w-3.5 h-3.5 text-blue-600"/> {done}/{total} Tasks Done
              </span>
              <span className="flex items-center gap-1 text-blue-900">
                <Zap className="w-3.5 h-3.5 text-amber-500"/> {pts} Points Earned
              </span>
              <span className="flex items-center gap-1 text-blue-900">
                <BookOpen className="w-3.5 h-3.5 text-blue-600"/> {analytics?.moduleStats?.length || 0} Modules
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const cId = course?._id || domain;
              window.location.href = `/student/adaptive-questions/${cId}`;
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Adaptive Quiz / Code</span>
          </button>
          <div className="bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-xs transition shadow-md shrink-0">
            <span>View Syllabus & Tasks</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Completed Domain Card ── */
function CompletedDomainCard({ prevCourse, onClick }) {
  const domain = prevCourse.domain;
  const meta = getDomainMeta(domain);
  const course = prevCourse.courseId;
  const completedDate = prevCourse.completedAt
    ? new Date(prevCourse.completedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '';
  const pts = prevCourse.finalPoints || 350;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
    >
      <div className="bg-blue-600 absolute top-0 left-0 bottom-0 w-2 rounded-l-2xl"/>

      <div className="flex items-center gap-4 flex-1 min-w-0 pl-1">
        <div className="bg-blue-100 border border-blue-300 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3"/> 100% Completed
            </span>
            {completedDate && (
              <span className="text-[11px] text-blue-700 font-semibold">{completedDate}</span>
            )}
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
              {pts} pts
            </span>
          </div>
          <h3 className="text-lg font-black text-[#0F172A] group-hover:text-[#0F172A] transition-colors truncate">
            {course?.title || `${meta.label} Full Stack Development`}
          </h3>
          <p className="text-xs text-slate-700 mt-0.5 truncate">
            {course?.description || 'All syllabus modules and tasks verified and archived.'}
          </p>

          <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-blue-800">
            <span className="text-blue-700 font-bold">100% Syllabus Completed</span>
            <span>·</span>
            <span>All tasks completed</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm shrink-0 self-start sm:self-center">
        <span>View Completed Syllabus</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
      </div>
    </div>
  );
}

/* ── Current Internship Card ── */
function CurrentInternshipCard({ item }) {
  const internship = item.internshipId;
  const pct = item.progress || 0;
  const statusLabel = item.status === 'in_progress' ? 'In Progress' : 'Enrolled';

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-white shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all duration-200 p-5 flex flex-col justify-between h-full">
      <div className="bg-emerald-600 absolute top-0 left-0 bottom-0 w-2 rounded-l-2xl"/>
      <div className="pl-2 space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="bg-emerald-100 border border-emerald-400 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs shrink-0 text-emerald-800">
            {internship?.icon || '💼'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active Internship
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                {statusLabel}
              </span>
              {(internship?.durationText || internship?.durationWeeks) && (
                <span className="text-[11px] font-semibold text-slate-400">
                  {internship?.durationText || `${internship.durationWeeks} Weeks`}
                </span>
              )}
              {internship?.stipend > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  ₹{internship.stipend.toLocaleString()} Stipend
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {internship?.title || 'Tech Internship'}
            </h3>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {internship?.description || 'Hands-on industrial software training & project work.'}
          </p>

          {/* Tech stack badges */}
          {internship?.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {internship.techStack.map((tech, i) => (
                <span key={i} className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-white text-slate-600 rounded-md border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="pl-2 mt-4 pt-3 border-t border-slate-100 space-y-1 w-full">
        <div className="flex justify-between text-[11px] font-bold text-slate-500">
          <span>Internship Milestone Progress</span>
          <span className="text-cyan-700 font-bold">{pct}% Completed</span>
        </div>
        <ProgressBar pct={pct} colorClass={internship?.color || 'from-cyan-500 to-teal-500'} />
      </div>
    </div>
  );
}

/* ── Completed Internship Card ── */
function CompletedInternshipCard({ item }) {
  const internship = item.internshipId;
  const completedDate = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-white shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all duration-200 p-5 flex flex-col justify-between h-full">
      <div className="bg-emerald-600 absolute top-0 left-0 bottom-0 w-2 rounded-l-2xl"/>

      <div className="pl-2 space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm shrink-0 text-emerald-800 border border-emerald-400">
            {internship?.icon || '🎓'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3"/> Completed
              </span>
              {(internship?.durationText || internship?.durationWeeks) && (
                <span className="text-[11px] font-semibold text-slate-400">
                  {internship?.durationText || `${internship.durationWeeks} Weeks`}
                </span>
              )}
              {completedDate && (
                <span className="text-[11px] text-slate-400 font-semibold">Finished {completedDate}</span>
              )}
              {item.grade && item.grade !== 'Pending' && (
                <span className="text-[10px] font-bold text-amber-700 bg-white px-2.5 py-0.5 rounded-full border border-amber-200">
                  Grade: {item.grade}
                </span>
              )}
              {item.certificate && (
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-white px-2.5 py-0.5 rounded-full border border-purple-200">
                  Verified: {item.certificate}
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {internship?.title || 'Industrial Internship'}
            </h3>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {internship?.description || 'Successfully completed practical industry tasks and deliverables.'}
          </p>

          {/* Tech stack badges */}
          {internship?.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {internship.techStack.map((tech, i) => (
                <span key={i} className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-white text-slate-600 rounded-md border border-slate-200">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pl-2 mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
        <span className="font-bold">Verified Internship Experience</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   STUDENT DASHBOARD — SIMPLE DOMAIN-BASED
   WITH INTERNSHIP TRACKING
══════════════════════════════════════════ */
export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isTempTrainingStudent =
    user?.studentCategory === 'TRAINING_TEMPORARY' || user?.studentType === 'TRAINING_TEMPORARY';

  useEffect(() => {
    if (isTempTrainingStudent) {
      navigate('/student/training', { replace: true });
    }
  }, [isTempTrainingStudent, navigate]);

  const cachedD = api.peekCache?.('/domain/my');
  const cachedA = api.peekCache?.('/domain/analytics');
  const cachedP = api.peekCache?.('/portal/homepage-data');

  const [domainData, setDomainData] = useState(cachedD?.data || null);
  const [analytics, setAnalytics]   = useState(cachedA?.data || null);
  const [specialOffers, setSpecialOffers] = useState(cachedP?.data?.specialOffers || []);
  const [loading, setLoading]       = useState(!cachedD && !cachedA);

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [dRes, aRes, portalRes] = await Promise.all([
        api.get('/domain/my').catch(() => ({ data: { success: false } })),
        api.get('/domain/analytics').catch(() => ({ data: { success: false } })),
        api.get('/portal/homepage-data').catch(() => ({ data: { success: false } }))
      ]);
      if (dRes.data?.success) setDomainData(dRes.data.data);
      if (aRes.data?.success) setAnalytics(aRes.data.data);
      if (portalRes.data?.success && portalRes.data.data?.specialOffers) {
        setSpecialOffers(portalRes.data.data.specialOffers);
      }
    } catch (err) {
      console.error('StudentDashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(!!cachedD);
  }, [fetchData]);

  if (loading && !domainData && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loading your courses...</p>
        </div>
      </div>
    );
  }

  const studentName = user?.name || 'Student';
  const studentId = domainData?.studentId || user?.studentId || '—';
  const tutorName = domainData?.tutor?.name || null;
  const totalXp = profile?.totalXp ?? domainData?.totalXp ?? 0;
  const level = domainData?.currentLevel?.title || 'Beginner';

  const currentDomain = domainData?.domain;
  const currentCourse = domainData?.course;
  const previousCourses = domainData?.previousCourses || [];

  const allInternships = domainData?.internships || [];
  const currentInternships = allInternships.filter(i => i.status === 'in_progress' || i.status === 'enrolled');
  const completedInternships = allInternships.filter(i => i.status === 'completed');

  // Navigate to single reusable course details page
  const handleOpenCurrentCourse = () => {
    if (!currentDomain) return;
    const cId = currentCourse?._id;
    navigate(`/student/course?domain=${currentDomain}${cId ? `&courseId=${cId}` : ''}`);
  };

  const handleOpenCompletedCourse = (prev) => {
    const cId = prev.courseId?._id || prev.courseId;
    navigate(`/student/course?domain=${prev.domain}&courseId=${cId}`);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">

      {/* ── TOP SECTION: Left = Student Profile Info | Right = Special Offer Slider ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* LEFT: Student Profile Info */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-purple-50 border border-purple-200 shadow-xs p-6 sm:p-7 flex flex-col justify-between gap-5 h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA] px-2.5 py-0.5 rounded-full inline-block font-mono">
                Student Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                Welcome back, <span className="text-sq-gradient">{studentName}</span> 👋
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Select your domain course below to view your personalized syllabus, module progress, and tasks.
              </p>
            </div>

            <button
              onClick={fetchData}
              className="p-2.5 bg-white hover:bg-white text-purple-900 rounded-xl text-xs border border-purple-200/80 transition shrink-0 flex items-center gap-1.5 font-bold shadow-2xs self-start cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500"/>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Profile pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-mono bg-white border border-slate-200 px-3 py-1 rounded-xl font-black text-slate-800 text-[11px] shadow-2xs">
              {studentId}
            </span>
            {domainData?.batch ? (
              <span className="flex items-center gap-1.5 bg-white border border-purple-200 px-3 py-1 rounded-xl text-purple-800 font-bold text-[11px] font-mono">
                Batch: {domainData.batch.name} {domainData.batch.code ? `(${domainData.batch.code})` : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-white border border-violet-200 px-3 py-1 rounded-xl text-violet-800 font-bold text-[11px]">
                Individual Student Track
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-white border border-purple-200 px-3 py-1 rounded-xl text-purple-700 font-bold text-[11px]">
              <Star className="w-3.5 h-3.5 text-purple-600"/>
              <span>{level}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-purple-200 px-3 py-1 rounded-xl text-purple-700 font-bold text-[11px]">
              <Zap className="w-3.5 h-3.5 text-purple-500 fill-purple-500"/>
              <span>{totalXp} XP</span>
            </span>
            {tutorName && (
              <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl">
                Assigned Tutor: <strong className="text-slate-800">{tutorName}</strong>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: Special Offer Slider */}
        <div className="w-full h-full min-h-[220px] sm:min-h-[235px] relative">
          <OffersCarousel offers={specialOffers} compact={true} />
        </div>

      </section>

      {/* ── 1. CURRENT COURSES ── */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600"/>
            Current Courses
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">
            Click to view your live syllabus & tasks
          </span>
        </div>

        {currentDomain ? (
          <CurrentDomainCard
            domain={currentDomain}
            course={currentCourse}
            analytics={analytics}
            onClick={handleOpenCurrentCourse}
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto"/>
            <p className="text-sm font-black text-slate-600">No active course enrolled</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your tutor or administrator will assign your domain course soon.
            </p>
          </div>
        )}
      </section>

      {/* ── 2. COMPLETED COURSES ── */}
      {previousCourses.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600"/>
              Completed Courses ({previousCourses.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">
              Archived curriculum & completed tasks
            </span>
          </div>

          <div className="space-y-3">
            {previousCourses.map((prev, idx) => (
              <CompletedDomainCard
                key={idx}
                prevCourse={prev}
                onClick={() => handleOpenCompletedCourse(prev)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 3. CURRENT INTERNSHIPS ── */}
      {currentInternships.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-600"/>
              Current Internships ({currentInternships.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
              Live industry training & milestone deliverables
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {currentInternships.map((item, idx) => (
              <CurrentInternshipCard key={item._id || idx} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. COMPLETED INTERNSHIPS ── */}
      {completedInternships.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600"/>
              Completed Internships ({completedInternships.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
              Verified certificates & practical accomplishments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {completedInternships.map((item, idx) => (
              <CompletedInternshipCard key={item._id || idx} item={item} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
