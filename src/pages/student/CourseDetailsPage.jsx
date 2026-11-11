import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import QuestionWorkspaceModal from '../../components/student/QuestionWorkspaceModal';
import {
  ArrowLeft, BookOpen, CheckCircle2, Lock,
  Zap, Target, Award, RotateCcw,
  ChevronDown, ChevronRight
} from 'lucide-react';

/* ── Domain colour & metadata with dynamic fallback ── */
const DOMAIN_META = {
  java:   { label:'Java',   icon:'☕', color:'from-orange-500 to-red-500',    bg:'bg-orange-50',   border:'border-orange-200', text:'text-orange-700',  ring:'#F97316', ringBg:'#FFF7ED' },
  python: { label:'Python', icon:'🐍', color:'from-blue-500 to-cyan-500',     bg:'bg-blue-50',     border:'border-blue-200',   text:'text-blue-700',    ring:'#3B82F6', ringBg:'#EFF6FF' },
  cpp:    { label:'C++',    icon:'⚡', color:'from-purple-500 to-indigo-500', bg:'bg-purple-50',   border:'border-purple-200', text:'text-purple-700',  ring:'#8B5CF6', ringBg:'#F5F3FF' },
  react:  { label:'React',  icon:'⚛️', color:'from-cyan-500 to-teal-500',     bg:'bg-cyan-50',     border:'border-cyan-200',   text:'text-cyan-700',    ring:'#06B6D4', ringBg:'#ECFEFF' },
};

function getDomainMeta(domainKey) {
  const k = (domainKey || '').toLowerCase();
  if (DOMAIN_META[k]) return DOMAIN_META[k];
  return {
    label: domainKey ? domainKey.charAt(0).toUpperCase() + domainKey.slice(1) : 'Course',
    icon: '💻',
    color: 'from-violet-600 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    ring: '#6366F1',
    ringBg: '#EEF2FF'
  };
}

/* ── Animated Circular Progress Ring ── */
function CircleRing({ pct = 0, label, sub, size = 135, stroke = 12, color = '#8B2BE2' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((Math.min(pct, 100)) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="#E5E7EB" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 1s ease' }}/>
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
            fontSize={size * 0.2} fontWeight="900" fill={color}>
            {pct}%
          </text>
          {sub && (
            <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle"
              fontSize={size * 0.095} fontWeight="600" fill="#94A3B8">
              {sub}
            </text>
          )}
        </svg>
      </div>
      <p className="text-xs font-black uppercase tracking-wider text-slate-600 text-center">{label}</p>
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const map = {
    locked:      { label:'🔒 Locked',      cls:'bg-slate-100 text-slate-500 border-slate-200' },
    available:   { label:'🔓 Available',   cls:'bg-purple-50 text-purple-700 border-purple-200' },
    in_progress: { label:'🔄 In Progress', cls:'bg-amber-50 text-amber-700 border-amber-200' },
    completed:   { label:'✅ Completed',   cls:'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };
  const s = map[status] || map.locked;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}



/* ── Module Accordion Row ── */
function ModuleRow({ mod, domain, onTaskClick, isCompletedCourse, locationQuery }) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const meta = getDomainMeta(domain);

  const isModuleLocked = isCompletedCourse ? false : (mod.status === 'not_started' || mod.isLocked);
  const completedCount = isCompletedCourse ? tasks.length : tasks.filter(t => t.status === 'completed').length;
  const pct = isCompletedCourse ? 100 : (tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : (mod.progress || 0));

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const [tRes, qRes] = await Promise.all([
        api.get(`/domain/modules/${mod._id}/tasks${locationQuery || ''}`).catch(() => ({ data: { success: false } })),
        api.get(`/domain/modules/${mod._id}/questions`).catch(() => ({ data: { success: false } }))
      ]);

      let combined = tRes.data?.success ? (tRes.data.data || []) : [];
      if (qRes.data?.success && Array.isArray(qRes.data.questions) && qRes.data.questions.length > 0) {
        const modQuestionsAsTasks = qRes.data.questions.map(q => ({
          _id: q._id,
          moduleId: mod._id,
          courseId: mod.courseId,
          domain: q.domain,
          title: q.title,
          description: q.problemStatement,
          instructions: q.problemStatement,
          starterCode: q.starterCode?.javascript || q.starterCode?.python || q.starterCode?.java || '',
          taskType: q.questionType || 'coding',
          difficulty: q.difficulty,
          points: q.xp || 20,
          status: q.isSolved ? 'completed' : 'available',
          isEnabled: !isModuleLocked,
          testCases: q.visibleTestCases || [],
          isModuleQuestion: true
        }));
        combined = [...combined, ...modQuestionsAsTasks];
      }
      setTasks(combined);
      return combined;
    } catch (e) { console.error(e); return []; }
    finally { setLoading(false); }
  };

  const toggle = async () => {
    if (!open && tasks.length === 0) {
      await fetchTasks();
    }
    setOpen(o => !o);
  };

  const reload = async () => {
    return await fetchTasks();
  };

  return (
    <div className={`border rounded-2xl overflow-hidden bg-white shadow-xs transition ${
      isModuleLocked ? 'border-slate-200 opacity-90' : 'border-slate-300'
    }`}>
      {/* Module header button */}
      <button onClick={toggle}
        className="w-full flex items-center gap-4 p-5 hover:bg-slate-50/70 transition text-left group cursor-pointer">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shadow shrink-0 ${
          isCompletedCourse || mod.status === 'completed'
            ? 'bg-emerald-600 text-white'
            : mod.status === 'processing'
            ? `bg-gradient-to-br ${meta.color} text-white`
            : 'bg-slate-200 text-slate-500 border border-slate-300'
        }`}>
          {isModuleLocked ? <Lock className="w-5 h-5 text-slate-500" /> : mod.order}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`font-black text-sm ${isModuleLocked ? 'text-slate-700' : 'text-slate-900'}`}>
              Module {mod.order}: {mod.title}
            </p>
            {isCompletedCourse ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                ✅ Completed
              </span>
            ) : mod.status === 'processing' ? (
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1">
                🔓 Unlocked · Processing
              </span>
            ) : mod.status === 'completed' ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                ✅ Completed by Tutor
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold flex items-center gap-1">
                🔒 Locked
              </span>
            )}
          </div>

          {tasks.length > 0 ? (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full bg-gradient-to-r ${meta.color} rounded-full`} style={{ width: `${pct}%` }}/>
              </div>
              <span className={`text-[11px] font-black ${meta.text}`}>{pct}%</span>
              <span className="text-[11px] text-slate-400">· {completedCount}/{tasks.length} tasks completed</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full bg-gradient-to-r ${meta.color} rounded-full`} style={{ width: isCompletedCourse ? '100%' : `${pct}%` }}/>
              </div>
              <span className={`text-[11px] font-black ${meta.text}`}>{isCompletedCourse ? '100%' : `${pct}%`}</span>
              <span className="text-[11px] text-slate-400">
                · {loading ? 'Loading...' : (isCompletedCourse ? '100% Completed · Click to view tasks' : isModuleLocked ? 'Module locked by tutor · Click to view syllabus' : 'Unlocked · Click to view tasks')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loading
            ? <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/>
            : open ? <ChevronDown className="w-4 h-4 text-slate-400"/> : <ChevronRight className="w-4 h-4 text-slate-400"/>
          }
        </div>
      </button>

      {/* Task list */}
      {open && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {isModuleLocked && (
            <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-2.5 flex items-center gap-2 text-xs font-semibold text-amber-800">
              <Lock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>This module is currently locked by your tutor. You cannot attempt these questions until your tutor sets the module to <strong>Processing</strong>.</span>
            </div>
          )}

          {tasks.length === 0 && !loading && (
            <div className="p-5 text-center text-xs text-slate-400 font-semibold">No tasks found in this module.</div>
          )}
          {tasks.map((task, idx) => {
            const clickable = isCompletedCourse || (!isModuleLocked && task.status !== 'locked');
            return (
              <button key={task._id}
                onClick={() => clickable && onTaskClick(task, mod, reload, tasks)}
                disabled={!clickable}
                className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition
                  ${clickable ? 'hover:bg-purple-50/40 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-black shrink-0
                  ${task.status === 'completed' || isCompletedCourse ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : task.status === 'in_progress' ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : task.status === 'available'   ? 'border-purple-400 bg-purple-50 text-purple-700'
                  : 'border-slate-300 bg-slate-50 text-slate-400'}`}>
                  {task.status === 'completed' || isCompletedCourse ? <CheckCircle2 className="w-3.5 h-3.5"/>
                    : (task.status === 'locked' || isModuleLocked) ? <Lock className="w-3 h-3"/>
                    : <span>{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isModuleLocked || task.status === 'locked' ? 'text-slate-500' : 'text-slate-800'}`}>
                    Task {task.order}: {task.title}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize">{task.taskType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={isCompletedCourse ? 'completed' : isModuleLocked ? 'locked' : task.status}/>
                  <span className="text-[10px] font-black text-amber-600 w-10 text-right">{task.points}pts</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   COMMON COURSE DETAILS PAGE
   Generic Route: /student/course?domain=...
══════════════════════════════════════════ */
export default function CourseDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [domainData, setDomainData] = useState(null);
  const [analytics, setAnalytics]   = useState(null);
  const [modules, setModules]        = useState([]);
  const [loading, setLoading]        = useState(true);

  const [selectedTask, setSelectedTask]             = useState(null);
  const [selectedModule, setSelectedModule]         = useState(null);
  const [currentModuleTasks, setCurrentModuleTasks] = useState([]);
  const [reloadFn, setReloadFn]                     = useState(null);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const query = location.search || '';
      const [dRes, aRes, mRes] = await Promise.all([
        api.get(`/domain/my${query}`).catch(() => ({ data: { success: false } })),
        api.get(`/domain/analytics${query}`).catch(() => ({ data: { success: false } })),
        api.get(`/domain/modules${query}`).catch(() => ({ data: { success: false } }))
      ]);
      if (dRes.data?.success) setDomainData(dRes.data.data);
      if (aRes.data?.success) setAnalytics(aRes.data.data);
      if (mRes.data?.success) setModules(mRes.data.data);
    } catch (e) {
      console.error('CourseDetailsPage error:', e);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Loading course details...</p>
        </div>
      </div>
    );
  }

  const isCompletedCourse = Boolean(domainData?.isCompletedCourse);
  const course = domainData?.course;
  const courseTitle = course?.title || domainData?.domainLabel || 'Course';
  const domain = (domainData?.domain || course?.slug || 'general').toLowerCase();
  const meta   = getDomainMeta(domain);
  const tutor  = domainData?.tutor;

  const totalTasks       = analytics?.totalTasks || 0;
  const completedTasks   = isCompletedCourse ? totalTasks : (analytics?.completedTasks || 0);
  const totalPoints      = isCompletedCourse ? Math.max(analytics?.totalPoints || 0, totalTasks * 10, 350) : (analytics?.totalPoints || 0);
  const syllabusProgress = isCompletedCourse ? 100 : (analytics?.syllabusProgress || 0);
  const overallProgress  = isCompletedCourse ? 100 : (analytics?.overallProgress || 0);

  const taskPct = isCompletedCourse ? 100 : (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
  const maxPossiblePoints = totalTasks * 10;
  const pointsPct = isCompletedCourse ? 100 : (maxPossiblePoints > 0 ? Math.min(Math.round((totalPoints / maxPossiblePoints) * 100), 100) : 0);

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">

      {/* ── TOP NAV BAR: Back button + Title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student')}
          title="Back to Dashboard"
          className="p-2.5 hover:bg-slate-100 rounded-xl transition text-slate-600 border border-slate-200 cursor-pointer shadow-2xs flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5"/>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-2xl">{meta.icon}</span>
            <h1 className="text-2xl font-black text-slate-900">{courseTitle}</h1>
            <span className={`px-3 py-0.5 rounded-full bg-gradient-to-r ${meta.color} text-white text-[10px] font-black`}>
              {course?.category || `${courseTitle} Domain`}
            </span>
            {isCompletedCourse ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3"/> 100% Completed
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-200">
                Active Learning
              </span>
            )}
            {domainData?.batch ? (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold font-mono">
                Batch: {domainData.batch.name}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-bold">
                Individual Student Track
              </span>
            )}
            {tutor && (
              <span className="text-xs text-slate-400 font-semibold">
                Tutor: <strong className="text-slate-700">{tutor.name}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── COMPLETED COURSE BANNER (if archive) ── */}
      {isCompletedCourse && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Completed Course Archive
                </span>
                {domainData?.completedInfo?.completedAt && (
                  <span className="text-xs text-slate-500 font-semibold">
                    Finished on {new Date(domainData.completedInfo.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                Viewing full syllabus and verified tasks for <span className="text-emerald-800 font-black">{course?.title || meta.label}</span> ({totalPoints} pts earned · 100% completed).
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs hover:shadow transition shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════
          STUDENT PROGRESS OVERVIEW
      ════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 pt-5 pb-2.5 flex items-center justify-between border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isCompletedCourse ? 'Course Completion Metrics' : 'Learning Overview'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-semibold">
              Live database calculated progress for your account
            </p>
          </div>
          <div className={`text-xs font-bold px-3 py-1 rounded-full ${meta.text}`}
            style={{ background: meta.ringBg }}>
            {(course?.title || domain).toUpperCase()} Domain
          </div>
        </div>

        {/* 4 Circular progress rings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6">
          <CircleRing
            pct={overallProgress}
            label="Overall Learning"
            sub="COMBINED"
            color="#8B2BE2"
            size={135} stroke={12}
          />
          <CircleRing
            pct={syllabusProgress}
            label="Syllabus"
            sub={`${completedTasks}/${totalTasks}`}
            color={meta.ring}
            size={135} stroke={12}
          />
          <CircleRing
            pct={taskPct}
            label="Tasks"
            sub={`${completedTasks}/${totalTasks}`}
            color="#F97316"
            size={135} stroke={12}
          />
          <CircleRing
            pct={pointsPct}
            label="Points"
            sub={`${totalPoints} pts`}
            color="#10B981"
            size={135} stroke={12}
          />
        </div>

        {/* Stats metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border-t border-slate-100">
          {[
            { label:'Syllabus Progress', value:`${syllabusProgress}%`, icon:BookOpen, color:'text-purple-600' },
            { label:'Tasks Done', value:`${completedTasks}/${totalTasks}`, icon:Target, color:'text-orange-600' },
            { label:'Points Earned', value:totalPoints, icon:Zap, color:'text-amber-600' },
            { label:'Modules', value:modules.length, icon:Award, color:'text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-slate-50">
              <Icon className={`w-4 h-4 ${color} shrink-0`}/>
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
                <p className={`text-base font-black ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          SYLLABUS — MODULES & TASKS
      ════════════════════════════════════════ */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Syllabus — {modules.length} Modules
          </h2>
          <span className="text-[11px] text-slate-400 font-semibold">
            Click module to expand tasks & instructions
          </span>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2"/>
            <p className="text-sm font-bold text-slate-600">No modules found for this domain.</p>
            <p className="text-xs text-slate-400 mt-1">The tutor will add modules and tasks soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map(mod => (
              <ModuleRow
                key={mod._id}
                mod={mod}
                domain={domain}
                locationQuery={location.search}
                isCompletedCourse={isCompletedCourse}
                onTaskClick={(task, m, reload, taskList) => {
                  setSelectedTask(task);
                  setSelectedModule(m);
                  setReloadFn(() => reload);
                  setCurrentModuleTasks(taskList || []);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── PRACTICAL CODING QUESTION WORKSPACE MODAL ── */}
      {(() => {
        if (!selectedTask || !selectedModule) return null;

        const currentTaskIndex = currentModuleTasks.findIndex(
          t => (t._id || t.id)?.toString() === (selectedTask?._id || selectedTask?.id)?.toString()
        );
        const hasNextTask = currentTaskIndex >= 0 && currentTaskIndex < currentModuleTasks.length - 1;
        const hasPrevTask = currentTaskIndex > 0;

        const handleNextTask = () => {
          if (hasNextTask) {
            const nextT = currentModuleTasks[currentTaskIndex + 1];
            setSelectedTask(nextT);
          }
        };

        const handlePrevTask = () => {
          if (hasPrevTask) {
            const prevT = currentModuleTasks[currentTaskIndex - 1];
            setSelectedTask(prevT);
          }
        };

        return (
          <QuestionWorkspaceModal
            task={selectedTask}
            moduleTitle={`Module ${selectedModule.order}: ${selectedModule.title}`}
            domain={domain}
            isCompletedCourse={isCompletedCourse}
            onClose={() => {
              setSelectedTask(null);
              setSelectedModule(null);
              setCurrentModuleTasks([]);
            }}
            onSuccess={async () => {
              fetchCourseData();
              if (reloadFn) {
                const freshTasks = await reloadFn();
                if (Array.isArray(freshTasks) && freshTasks.length > 0) {
                  setCurrentModuleTasks(freshTasks);
                }
              }
            }}
            onNextTask={handleNextTask}
            hasNextTask={hasNextTask}
            onPrevTask={handlePrevTask}
            hasPrevTask={hasPrevTask}
            currentIndex={currentTaskIndex}
            totalTasks={currentModuleTasks.length || 1}
          />
        );
      })()}

    </div>
  );
}
