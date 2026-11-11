import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import {
  CalendarCheck2, Users, FileText, CheckCircle2, XCircle, Clock,
  Check, X, AlertCircle, Sparkles, UserCheck, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function TutorAttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || 'student_attendance'); // 'student_attendance' | 'leave_requests' | 'tutor_attendance'

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['student_attendance', 'leave_requests', 'tutor_attendance'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // Student Attendance State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentData, setStudentData] = useState([]);
  const [summary, setSummary] = useState({ totalStudents: 0, presentCount: 0, absentCount: 0, leaveCount: 0 });
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Student Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [approvalError, setApprovalError] = useState(null);
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Tutor Self Attendance State
  const [tutorAttendanceHistory, setTutorAttendanceHistory] = useState([]);
  const [tutorCheckIn, setTutorCheckIn] = useState('09:30 AM');
  const [tutorCheckOut, setTutorCheckOut] = useState('05:30 PM');
  const [tutorStatus, setTutorStatus] = useState('Present');
  const [loadingTutorSelf, setLoadingTutorSelf] = useState(false);
  const [savingTutorSelf, setSavingTutorSelf] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'student_attendance') {
      loadStudentAttendance();
    } else if (activeTab === 'leave_requests') {
      loadLeaveRequests();
    } else if (activeTab === 'tutor_attendance') {
      loadTutorSelfAttendance();
    }
  }, [activeTab, selectedDate]);

  // 1. Fetch Student Attendance for date
  const loadStudentAttendance = async () => {
    setLoadingStudents(true);
    try {
      const res = await api.get(`/attendance/tutor-students?date=${selectedDate}`);
      if (res.data.success) {
        setStudentData(res.data.data.students || []);
        setSummary(res.data.data.summary || { totalStudents: 0, presentCount: 0, absentCount: 0, leaveCount: 0 });
      }
    } catch (err) {
      console.error('Failed to load student attendance:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Mark all present in local state
  const handleMarkAllPresent = () => {
    const updated = studentData.map(st => ({ ...st, status: 'Present' }));
    setStudentData(updated);
    recalculateSummary(updated);
  };

  const handleStudentStatusChange = (studentId, newStatus) => {
    const updated = studentData.map(st => st._id === studentId ? { ...st, status: newStatus } : st);
    setStudentData(updated);
    recalculateSummary(updated);
  };

  const recalculateSummary = (updatedList) => {
    const totalStudents = updatedList.length;
    const presentCount = updatedList.filter(s => s.status === 'Present').length;
    const absentCount = updatedList.filter(s => s.status === 'Absent').length;
    const leaveCount = updatedList.filter(s => s.status === 'Leave').length;
    setSummary({ totalStudents, presentCount, absentCount, leaveCount });
  };

  // Save student attendance to backend
  const handleSaveStudentAttendance = async () => {
    setSavingAttendance(true);
    setSaveSuccessMsg(null);
    try {
      const payload = {
        date: selectedDate,
        records: studentData.map(st => ({
          studentId: st._id,
          status: st.status
        }))
      };
      const res = await api.post('/attendance/student-mark', payload);
      if (res.data.success) {
        setSaveSuccessMsg(`✓ Attendance for ${selectedDate} saved successfully!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  // 2. Fetch Leave Requests
  const loadLeaveRequests = async () => {
    setLoadingLeaves(true);
    try {
      const res = await api.get('/attendance/leave-requests');
      if (res.data.success) {
        setLeaveRequests(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // Open Approval Reason Modal
  const handleOpenApproveModal = (leave) => {
    setSelectedLeaveForApproval(leave);
    setApprovalReason('Approved based on student request');
    setApprovalError(null);
  };

  // Confirm Approval (Strict Reason Validation!)
  const handleConfirmApproval = async () => {
    if (!approvalReason || !approvalReason.trim()) {
      setApprovalError('Approval reason is MANDATORY. Please enter or select a valid reason.');
      return;
    }
    setSubmittingApproval(true);
    setApprovalError(null);
    try {
      const res = await api.post(`/attendance/leave-requests/${selectedLeaveForApproval._id}/approve`, {
        approvalReason: approvalReason.trim()
      });
      if (res.data.success) {
        alert('✓ Leave request approved successfully!');
        setSelectedLeaveForApproval(null);
        setApprovalReason('');
        loadLeaveRequests();
      }
    } catch (err) {
      setApprovalError(err.response?.data?.message || 'Error approving leave.');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to reject this leave request?')) return;
    try {
      const res = await api.post(`/attendance/leave-requests/${leaveId}/reject`, {
        rejectionReason: 'Request rejected by tutor.'
      });
      if (res.data.success) {
        alert('Leave request rejected.');
        loadLeaveRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting leave.');
    }
  };

  // 3. Fetch Tutor Self Attendance
  const loadTutorSelfAttendance = async () => {
    setLoadingTutorSelf(true);
    try {
      const res = await api.get('/attendance/tutor-self');
      if (res.data.success) {
        setTutorAttendanceHistory(res.data.data.records || []);
        const today = res.data.data.todayRecord;
        if (today) {
          setTutorCheckIn(today.checkIn || '09:30 AM');
          setTutorCheckOut(today.checkOut || '05:30 PM');
          setTutorStatus(today.status || 'Present');
        }
      }
    } catch (err) {
      console.error('Failed to load tutor self attendance:', err);
    } finally {
      setLoadingTutorSelf(false);
    }
  };

  const handleSaveTutorSelf = async () => {
    setSavingTutorSelf(true);
    try {
      const res = await api.post('/attendance/tutor-self', {
        date: new Date().toISOString().split('T')[0],
        checkIn: tutorCheckIn,
        checkOut: tutorCheckOut,
        status: tutorStatus
      });
      if (res.data.success) {
        alert('✓ Tutor attendance recorded successfully!');
        loadTutorSelfAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording tutor attendance.');
    } finally {
      setSavingTutorSelf(false);
    }
  };

  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'Pending').length;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto px-4">
      {/* Pink-to-Violet White Gradient Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-purple-50 border border-pink-200/80 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
            <CalendarCheck2 className="w-4 h-4 text-pink-600" />
            <span className="bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent font-extrabold">
              Attendance &amp; Leave Control Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
            Attendance &amp; Leave Management
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
            Manage date-wise student attendance, review and approve student leave requests with mandatory justification, and maintain tutor self-attendance logs.
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('student_attendance')}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'student_attendance'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('leave_requests')}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer relative ${
            activeTab === 'leave_requests'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Student Leave Requests</span>
          {pendingLeavesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-600 text-white animate-pulse">
              {pendingLeavesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tutor_attendance')}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'tutor_attendance'
              ? 'border-pink-600 text-pink-600 bg-pink-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Tutor Attendance</span>
        </button>
      </div>

      {/* TAB 1: STUDENT ATTENDANCE */}
      {activeTab === 'student_attendance' && (
        <div className="space-y-6">
          {/* Controls Bar: Date Picker + Mark All Present Button */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attendance Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-500 font-mono shadow-xs"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleMarkAllPresent}
                className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>[ Present All ]</span>
              </button>

              <button
                onClick={handleSaveStudentAttendance}
                disabled={savingAttendance}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {savingAttendance ? 'Saving...' : 'Save Student Attendance'}
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* KPI Summary Cards (ONLY Displayed Here on Attendance Page!) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 p-4 rounded-2xl space-y-1 shadow-sm">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Students</span>
              <p className="text-2xl font-black text-slate-900 font-mono">{summary.totalStudents}</p>
              <span className="text-[11px] text-slate-500 font-medium">Assigned cohort</span>
            </div>

            <div className="bg-white border border-emerald-200/80 p-4 rounded-2xl space-y-1 shadow-sm bg-emerald-50/20">
              <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider block">Present Count</span>
              <p className="text-2xl font-black text-emerald-600 font-mono">{summary.presentCount}</p>
              <span className="text-[11px] text-emerald-700 font-medium">Attending today</span>
            </div>

            <div className="bg-white border border-rose-200/80 p-4 rounded-2xl space-y-1 shadow-sm bg-rose-50/20">
              <span className="text-rose-700 text-[10px] font-bold uppercase tracking-wider block">Absent Count</span>
              <p className="text-2xl font-black text-rose-600 font-mono">{summary.absentCount}</p>
              <span className="text-[11px] text-rose-700 font-medium">Unexcused missing</span>
            </div>

            <div className="bg-white border border-purple-200/80 p-4 rounded-2xl space-y-1 shadow-sm bg-purple-50/20">
              <span className="text-purple-700 text-[10px] font-bold uppercase tracking-wider block">On Leave</span>
              <p className="text-2xl font-black text-purple-700 font-mono">{summary.leaveCount}</p>
              <span className="text-[11px] text-purple-700 font-medium">Approved leave</span>
            </div>
          </div>

          {/* Student Table */}
          {loadingStudents ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Student ID / Email</th>
                      <th className="p-4">Dept &amp; Year</th>
                      <th className="p-4">Batch</th>
                      <th className="p-4 text-center">Attendance Date</th>
                      <th className="p-4 text-center">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {studentData.map(st => (
                      <tr key={st._id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4 font-black text-slate-900">{st.name}</td>
                        <td className="p-4 text-slate-600 font-mono">
                          <span className="block font-bold text-slate-800">{st.studentId}</span>
                          <span className="text-[11px] text-slate-400">{st.email}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span>{st.department}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">{st.year}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-100 text-purple-800 border border-purple-200">
                            {st.batch}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-700">{st.attendanceDate}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(st._id, 'Present')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                st.status === 'Present'
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(st._id, 'Absent')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                st.status === 'Absent'
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStudentStatusChange(st._id, 'Leave')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                st.status === 'Leave'
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDENT LEAVE REQUESTS */}
      {activeTab === 'leave_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-pink-600" />
              <span>Student Leave Approval Requests ({leaveRequests.length})</span>
            </h2>
          </div>

          {loadingLeaves ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-sm">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Leave Requests Found</h3>
              <p className="text-xs text-slate-500">Student leave submissions will appear here for tutor approval.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Leave Date</th>
                      <th className="p-4">Leave Type</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Approval Justification</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {leaveRequests.map(l => (
                      <tr key={l._id} className="hover:bg-slate-50/60 transition">
                        <td className="p-4 font-black text-slate-900">
                          {l.studentId?.name || 'Student'}
                          <span className="block text-[11px] font-normal text-slate-400 font-mono">{l.studentId?.email}</span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">{l.leaveDate}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {l.leaveType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 max-w-xs">{l.reason}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                            l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            l.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {l.approvalReason ? (
                            <span className="bg-slate-50 p-2 rounded-xl block border border-slate-200 text-[11px]">
                              "{l.approvalReason}"
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {l.status === 'Pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenApproveModal(l)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center space-x-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Leave</span>
                              </button>
                              <button
                                onClick={() => handleRejectLeave(l._id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center space-x-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono text-slate-400 font-bold">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TUTOR SELF ATTENDANCE */}
      {activeTab === 'tutor_attendance' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-pink-600" />
              <span>Daily Tutor Self Check-In &amp; Log</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Check-in Time</label>
                <input
                  type="text"
                  value={tutorCheckIn}
                  onChange={(e) => setTutorCheckIn(e.target.value)}
                  placeholder="09:30 AM"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Check-out Time</label>
                <input
                  type="text"
                  value={tutorCheckOut}
                  onChange={(e) => setTutorCheckOut(e.target.value)}
                  placeholder="05:30 PM"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Status</label>
                <select
                  value={tutorStatus}
                  onChange={(e) => setTutorStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 bg-white"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveTutorSelf}
                disabled={savingTutorSelf}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {savingTutorSelf ? 'Recording...' : 'Record My Attendance →'}
              </button>
            </div>
          </div>

          {/* Log History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tutor Attendance History</h4>
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Check-in</th>
                    <th className="p-4">Check-out</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-mono">
                  {tutorAttendanceHistory.map(rec => (
                    <tr key={rec._id} className="hover:bg-slate-50/60">
                      <td className="p-4 font-bold text-slate-900">{rec.date}</td>
                      <td className="p-4 text-emerald-700 font-bold">{rec.checkIn || '—'}</td>
                      <td className="p-4 text-purple-700 font-bold">{rec.checkOut || '—'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MANDATORY APPROVAL REASON MODAL
         ═════════════════════════════════════════════════════════════════════ */}
      {selectedLeaveForApproval && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Reason for Granting Leave</h3>
              </div>
              <button
                onClick={() => setSelectedLeaveForApproval(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <p className="text-slate-700">
                <strong>Student:</strong> {selectedLeaveForApproval.studentId?.name}
              </p>
              <p className="text-slate-700">
                <strong>Leave Date:</strong> <span className="font-mono font-bold text-purple-700">{selectedLeaveForApproval.leaveDate}</span> ({selectedLeaveForApproval.leaveType})
              </p>
              <p className="text-slate-600">
                <strong>Student Reason:</strong> "{selectedLeaveForApproval.reason}"
              </p>
            </div>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase block">Quick Reason Suggestions:</label>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {[
                  'Medical reason verified',
                  'Personal emergency',
                  'College permission',
                  'Family emergency',
                  'Approved based on student request'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setApprovalReason(preset)}
                    className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-medium transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase block">
                Tutor Approval Justification *
              </label>
              <textarea
                rows={3}
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder="Enter mandatory reason for approving this leave..."
                className="w-full p-3 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-pink-500 font-medium"
              />
            </div>

            {approvalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{approvalError}</span>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLeaveForApproval(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={submittingApproval}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {submittingApproval ? 'Approving...' : 'Confirm & Approve Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
