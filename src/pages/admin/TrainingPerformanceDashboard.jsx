import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  CheckCircle2,
  XCircle,
  Award,
  Mail,
  FileDown,
  PlusCircle,
  RefreshCw,
  Eye,
  X,
  TrendingUp,
  Building2,
  GraduationCap,
  Calendar,
  CheckSquare,
  Square,
  Clock,
  Printer,
  ChevronRight,
  Filter,
  Check,
  Send
} from 'lucide-react';

export default function TrainingPerformanceDashboard() {
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get('batchId') || '';
  const initialCollegeId = searchParams.get('collegeId') || '';

  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // College and Batch Filter State
  const [selectedCollegeId, setSelectedCollegeId] = useState(initialCollegeId);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [drillFilter, setDrillFilter] = useState('all'); // 'all' | 'present' | 'absent' | 'completedAll' | 'pending'

  // Student Report Modal State
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [loadingStudentReport, setLoadingStudentReport] = useState(false);

  // Assign Task Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState('batch'); // 'batch' | 'selected'
  const [selectedStudentIdsForTask, setSelectedStudentIdsForTask] = useState([]);
  const [taskForm, setTaskForm] = useState({
    batchId: '',
    title: '',
    description: '',
    domain: '',
    dueDate: '',
    points: 10
  });

  // Mark Attendance Modal State
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { studentId: 'present' | 'absent' }
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Action status feedback
  const [actionMsg, setActionMsg] = useState('');
  const [sendingAction, setSendingAction] = useState('');

  // Fetch performance data
  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedBatchId) params.batchId = selectedBatchId;
      if (selectedCollegeId) params.collegeId = selectedCollegeId;

      const [perfRes, histRes] = await Promise.allSettled([
        api.get('/training-management/overall-performance', { params }),
        api.get('/training-management/notification-history', {
          params: selectedBatchId ? { batchId: selectedBatchId } : {}
        })
      ]);

      if (perfRes.status === 'fulfilled' && perfRes.value.data?.success) {
        setData(perfRes.value.data);
      }
      if (histRes.status === 'fulfilled' && histRes.value.data?.history) {
        setHistory(histRes.value.data.history);
      }
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBatchId, selectedCollegeId]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  // Dynamic filter for Batches based on Selected College
  const availableBatchesForDropdown = useMemo(() => {
    const batches = data?.availableBatches || [];
    if (!selectedCollegeId) return batches;
    return batches.filter(b => !b.collegeId || String(b.collegeId) === String(selectedCollegeId));
  }, [data?.availableBatches, selectedCollegeId]);

  // Handle Assign Task
  const handleAssignTask = async (e) => {
    e.preventDefault();
    setSendingAction('assign');
    setActionMsg('');
    try {
      const effectiveBatchId = taskForm.batchId || selectedBatchId;
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        domain: taskForm.domain,
        dueDate: taskForm.dueDate || null,
        points: Number(taskForm.points) || 10
      };

      if (assignTarget === 'batch') {
        payload.batchId = effectiveBatchId;
      } else {
        payload.studentIds = selectedStudentIdsForTask;
        if (effectiveBatchId) payload.batchId = effectiveBatchId;
      }

      const res = await api.post('/training-management/assign-tasks', payload);
      if (res.data?.success) {
        setActionMsg(res.data.message || 'Task assigned successfully.');
        setAssignModalOpen(false);
        setTaskForm({ batchId: '', title: '', description: '', domain: '', dueDate: '', points: 10 });
        setSelectedStudentIdsForTask([]);
        fetchPerformance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setSendingAction('');
    }
  };

  // Open Attendance Modal
  const openAttendanceModal = () => {
    const initialMap = {};
    (data?.students || []).forEach(s => {
      initialMap[s.studentId] = s.todayAttendance === 'absent' ? 'absent' : 'present';
    });
    setAttendanceRecords(initialMap);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
    setAttendanceModalOpen(true);
  };

  // Submit Marked Attendance
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAttendance(true);
      const recordsArray = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const res = await api.post('/training-management/attendance/mark', {
        batchId: selectedBatchId || undefined,
        date: attendanceDate,
        records: recordsArray
      });

      if (res.data?.success) {
        setActionMsg(`Attendance marked for ${recordsArray.length} students on ${attendanceDate}`);
        setAttendanceModalOpen(false);
        fetchPerformance();
      }
    } catch (err) {
      alert('Failed to mark attendance: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingAttendance(false);
    }
  };

  // Handle Send Daily Report Email
  const handleSendDailyReport = async () => {
    if (!selectedBatchId) {
      alert('Please select a specific training batch to dispatch its daily report.');
      return;
    }
    setSendingAction('daily');
    setActionMsg('');
    try {
      const res = await api.post(`/training-management/batches/${selectedBatchId}/send-daily-report`, { force: true });
      setActionMsg(res.data?.sent ? 'Daily training report dispatched to college staff.' : res.data?.reason || res.data?.error || 'Report processed.');
      fetchPerformance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send daily report');
    } finally {
      setSendingAction('');
    }
  };

  // Handle Send Weekly PDF Report Email
  const handleSendWeeklyReport = async () => {
    if (!selectedBatchId) {
      alert('Please select a specific training batch to dispatch its weekly report.');
      return;
    }
    setSendingAction('weekly');
    setActionMsg('');
    try {
      const res = await api.post(`/training-management/batches/${selectedBatchId}/send-weekly-report`, { force: true });
      setActionMsg(res.data?.sent ? 'Weekly training PDF report dispatched to college staff.' : res.data?.reason || res.data?.error || 'Processed.');
      fetchPerformance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send weekly report');
    } finally {
      setSendingAction('');
    }
  };

  // Download Weekly PDF
  const handleDownloadWeeklyPdf = async () => {
    if (!selectedBatchId) {
      alert('Please select a specific training batch first to download its weekly PDF report.');
      return;
    }
    try {
      const res = await api.get(`/training-management/batches/${selectedBatchId}/weekly-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Weekly_Training_Report_${selectedBatchId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download weekly PDF: ' + (err.response?.data?.message || err.message));
    }
  };

  // View Individual Student Performance Report
  const handleViewStudentReport = async (studentId) => {
    try {
      setLoadingStudentReport(true);
      const res = await api.get(`/training-management/students/${studentId}/report`);
      if (res.data?.success) {
        setSelectedStudentReport(res.data.student);
      }
    } catch (err) {
      alert('Failed to load student performance report');
    } finally {
      setLoadingStudentReport(false);
    }
  };

  const summary = data?.summary || {};
  const students = data?.students || [];

  // Drill filter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (drillFilter === 'present') return s.todayAttendance === 'present';
      if (drillFilter === 'absent') return s.todayAttendance === 'absent';
      if (drillFilter === 'completedAll') return s.completedAllTasks;
      if (drillFilter === 'pending') return s.tasksPending > 0;
      return true;
    });
  }, [students, drillFilter]);

  return (
    <div className="min-h-screen bg-[#F8F7FC] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Integrated Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-purple-700 bg-purple-50 font-mono text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-purple-200">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Institutional Cohort Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Training Performance Management
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Connected directly to Batches & Colleges database records. Track daily attendance, assign curriculum tasks, monitor completion velocity, and dispatch automated staff PDF reports.
          </p>
        </div>

        {/* Dropdowns & Operational Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. College Dropdown (from database) */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCollegeId}
              onChange={(e) => {
                setSelectedCollegeId(e.target.value);
                setSelectedBatchId(''); // reset batch when college changes
              }}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Partner Colleges</option>
              {(data?.availableColleges || []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Training Batch Dropdown (from database) */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Training Batches ({availableBatchesForDropdown.length})</option>
              {availableBatchesForDropdown.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.department})</option>
              ))}
            </select>
          </div>

          {/* Mark Attendance Button */}
          <button
            onClick={openAttendanceModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>

          {/* Assign Task Button */}
          <button
            onClick={() => {
              setTaskForm((prev) => ({ ...prev, batchId: selectedBatchId }));
              setAssignModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Assign Task</span>
          </button>

          {/* Send Daily Report */}
          <button
            onClick={handleSendDailyReport}
            disabled={sendingAction === 'daily'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition"
            title="Dispatch Daily Report to Staff"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>{sendingAction === 'daily' ? 'Sending...' : 'Send Daily Report'}</span>
          </button>

          {/* Send Weekly PDF */}
          <button
            onClick={handleSendWeeklyReport}
            disabled={sendingAction === 'weekly'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition"
            title="Dispatch Weekly PDF Report to HOD"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>{sendingAction === 'weekly' ? 'Sending...' : 'Send Weekly PDF'}</span>
          </button>

          {/* Download Weekly PDF */}
          <button
            onClick={handleDownloadWeeklyPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer transition"
            title="Download PDF in browser"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-600" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={fetchPerformance}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Performance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Clickable Summary KPI Cards (Drill-Down Filterable) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Students */}
        <button
          onClick={() => setDrillFilter('all')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition cursor-pointer ${
            drillFilter === 'all' ? 'border-purple-600 ring-2 ring-purple-100 bg-purple-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Students</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.totalTemporaryStudents ?? 0}</p>
        </button>

        {/* Present Today */}
        <button
          onClick={() => setDrillFilter('present')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition cursor-pointer ${
            drillFilter === 'present' ? 'border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present Today</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{summary.presentToday ?? 0}</p>
        </button>

        {/* Absent Today */}
        <button
          onClick={() => setDrillFilter('absent')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition cursor-pointer ${
            drillFilter === 'absent' ? 'border-rose-600 ring-2 ring-rose-100 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent Today</p>
          <p className="text-xl font-black text-rose-600 mt-1">{summary.absentToday ?? 0}</p>
        </button>

        {/* Attendance % */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attendance %</p>
          <p className="text-xl font-black text-purple-600 mt-1">{summary.overallAttendancePercent ?? 0}%</p>
        </div>

        {/* Tasks Assigned */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tasks Assigned</p>
          <p className="text-xl font-black text-slate-900 mt-1">{summary.totalTasksAssigned ?? 0}</p>
        </div>

        {/* Tasks Completed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Tasks Done</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{summary.totalTasksCompleted ?? 0}</p>
        </div>

        {/* Tasks Pending */}
        <button
          onClick={() => setDrillFilter('pending')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition cursor-pointer ${
            drillFilter === 'pending' ? 'border-amber-600 ring-2 ring-amber-100 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Tasks Pending</p>
          <p className="text-xl font-black text-amber-600 mt-1">{summary.totalTasksPending ?? 0}</p>
        </button>

        {/* Completed All Tasks */}
        <button
          onClick={() => setDrillFilter('completedAll')}
          className={`text-left bg-white border rounded-2xl p-4 shadow-xs transition cursor-pointer ${
            drillFilter === 'completedAll' ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Comp %</p>
          <p className="text-xl font-black text-blue-600 mt-1">{summary.overallTaskCompletionPercent ?? 0}%</p>
        </button>
      </div>

      {/* Top Performers and Completed All Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Top Performing Students
          </h2>
          {(data?.topPerformingStudents || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No student telemetry recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topPerformingStudents.slice(0, 5).map((tp, idx) => (
                <div key={tp.studentId} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800">
                    {idx + 1}. {tp.name} <span className="text-slate-400 font-normal">({tp.collegeName})</span>
                  </span>
                  <span className="font-black text-blue-600">
                    {tp.taskCompletionPercent}% Tasks • {tp.attendancePercent}% Att
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Completed All Assigned Tasks ({(data?.completedAllStudents || []).length})
          </h2>
          {(data?.completedAllStudents || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No students have completed all assigned tasks yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.completedAllStudents.map((st) => (
                <button
                  key={st.studentId}
                  onClick={() => handleViewStudentReport(st.studentId)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition"
                >
                  {st.name} ({st.tasksCompleted}/{st.tasksAssigned})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Student Performance Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h2 className="text-base font-black text-slate-900">
              Student Training Cohort ({filteredStudents.length})
            </h2>
          </div>
          {drillFilter !== 'all' && (
            <button
              onClick={() => setDrillFilter('all')}
              className="text-xs font-bold text-purple-600 hover:underline cursor-pointer"
            >
              Clear Filter ({drillFilter})
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading training performance records...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold">No students found for this selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-mono text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">College & Batch</th>
                  <th className="py-3 px-3 text-center">Department</th>
                  <th className="py-3 px-3 text-center">Today Att</th>
                  <th className="py-3 px-3 text-center">Attendance %</th>
                  <th className="py-3 px-3 text-center">Assigned</th>
                  <th className="py-3 px-3 text-center">Completed</th>
                  <th className="py-3 px-3 text-center">Pending</th>
                  <th className="py-3 px-3 text-center">Completion %</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-purple-50/20 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{s.collegeName}</div>
                      <div className="text-[10px] text-slate-400">{s.batchName}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                        {s.department || 'CSE'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.todayAttendance === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.todayAttendance === 'absent'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.todayAttendance || 'unmarked'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-purple-600">
                      {s.attendancePercent}%
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {s.tasksAssigned}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">
                      {s.tasksCompleted}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600">
                      {s.tasksPending}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-600">
                      {s.taskCompletionPercent}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleViewStudentReport(s.studentId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs cursor-pointer transition border border-purple-200"
                        title="View Individual Performance Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Notification Audit History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          HOD & Placement Officer Email Delivery Logs
        </h2>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No training reports dispatched yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Recipients</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">PDF Attached</th>
                  <th className="py-2.5 px-3">Dispatched Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.slice(0, 10).map((h) => (
                  <tr key={h._id}>
                    <td className="py-2 px-3 font-bold text-slate-800">{h.notificationType}</td>
                    <td className="py-2 px-3 text-slate-600">{(h.recipients || []).map((r) => r.email || r).join(', ') || 'N/A'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">{h.hasPdfAttachment ? 'Yes' : 'No'}</td>
                    <td className="py-2 px-3 text-slate-400">{new Date(h.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: MARK TODAY'S ATTENDANCE */}
      {/* ============================================================== */}
      {attendanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Mark Training Attendance</h3>
              </div>
              <button onClick={() => setAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800"
                />
              </div>

              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const allP = {};
                    (data?.students || []).forEach(s => allP[s.studentId] = 'present');
                    setAttendanceRecords(allP);
                  }}
                  className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-xs"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allA = {};
                    (data?.students || []).forEach(s => allA[s.studentId] = 'absent');
                    setAttendanceRecords(allA);
                  }}
                  className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-xs"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Students Attendance List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
              {(data?.students || []).map(s => {
                const currentStatus = attendanceRecords[s.studentId] || 'present';
                return (
                  <div key={s.studentId} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{s.name}</span>
                      <div className="text-[11px] text-slate-400">{s.collegeName} • {s.department}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setAttendanceRecords({ ...attendanceRecords, [s.studentId]: 'present' })}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceRecords({ ...attendanceRecords, [s.studentId]: 'absent' })}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAttendanceModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={submittingAttendance}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                {submittingAttendance ? 'Saving Attendance...' : 'Save Attendance Records'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ASSIGN TRAINING TASK */}
      {/* ============================================================== */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Assign Training Task</h3>
              </div>
              <button onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3.5 text-xs">
              {/* Target Type */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAssignTarget('batch')}
                  className={`py-2 rounded-lg transition ${
                    assignTarget === 'batch' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All Students in Batch
                </button>
                <button
                  type="button"
                  onClick={() => setAssignTarget('selected')}
                  className={`py-2 rounded-lg transition ${
                    assignTarget === 'selected' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Selected Students ({selectedStudentIdsForTask.length})
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Training Batch *</label>
                <select
                  required
                  value={taskForm.batchId || selectedBatchId}
                  onChange={(e) => setTaskForm({ ...taskForm, batchId: e.target.value })}
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800"
                >
                  <option value="">-- Select Batch --</option>
                  {(data?.availableBatches || []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.department})</option>
                  ))}
                </select>
              </div>

              {/* Student Checkboxes (if selected target) */}
              {assignTarget === 'selected' && (
                <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {(data?.students || []).map(s => {
                    const isChecked = selectedStudentIdsForTask.includes(s.studentId);
                    return (
                      <div
                        key={s.studentId}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedStudentIdsForTask(selectedStudentIdsForTask.filter(id => id !== s.studentId));
                          } else {
                            setSelectedStudentIdsForTask([...selectedStudentIdsForTask, s.studentId]);
                          }
                        }}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg"
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                        <span className="font-bold text-slate-800">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({s.department})</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Implement REST API Endpoint in Spring Boot"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Domain / Subject</label>
                  <input
                    type="text"
                    value={taskForm.domain}
                    onChange={(e) => setTaskForm({ ...taskForm, domain: e.target.value })}
                    placeholder="e.g. Java / Full Stack"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Task Description / Instructions</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Provide detailed instructions or GitHub task requirements..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAction === 'assign'}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {sendingAction === 'assign' ? 'Assigning...' : 'Confirm & Assign Tasks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: INDIVIDUAL STUDENT PERFORMANCE REPORT */}
      {/* ============================================================== */}
      {selectedStudentReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                  {selectedStudentReport.name?.[0] || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedStudentReport.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedStudentReport.email} • {selectedStudentReport.collegeName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedStudentReport(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
            </div>

            {/* Profile specifications */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Batch Code</span>
                <span className="font-bold text-slate-800">{selectedStudentReport.batchCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                <span className="font-bold text-slate-800">{selectedStudentReport.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Batch Name</span>
                <span className="font-bold text-slate-800">{selectedStudentReport.batchName}</span>
              </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance</p>
                <p className="text-xl font-black text-purple-600 mt-0.5">
                  {selectedStudentReport.attendance?.attendancePercent}%
                </p>
                <p className="text-[10px] text-slate-400">
                  {selectedStudentReport.attendance?.presentDays}/{selectedStudentReport.attendance?.totalDays} Days
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedStudentReport.tasks?.totalTasks}
                </p>
                <p className="text-[10px] text-slate-400">Total Tasks</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  {selectedStudentReport.tasks?.completedTasks}
                </p>
                <p className="text-[10px] text-emerald-600">Done</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">
                  {selectedStudentReport.tasks?.pendingTasks}
                </p>
                <p className="text-[10px] text-amber-600">Awaiting</p>
              </div>
            </div>

            {/* Assigned Tasks Detail List */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Tasks Breakdown</span>
              </h4>

              {(selectedStudentReport.tasksList || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No tasks assigned to this student yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedStudentReport.tasksList.map((t) => (
                    <div key={t._id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-400">
                          Domain: <strong>{t.domain}</strong> • Assigned: {t.assignedDate} • Due: {t.dueDate || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudentReport(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
