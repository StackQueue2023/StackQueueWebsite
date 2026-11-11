import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  Users,
  Calendar,
  CalendarCheck2,
  Plus,
  Video,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Check,
  UserCheck,
  Trash2,
  Pencil,
  GraduationCap,
  Layers,
  Search,
  Filter,
  CreditCard
} from 'lucide-react';
import FeeManagementDashboard from '../../components/payments/FeeManagementDashboard';
import RecordPaymentModal from '../../components/payments/RecordPaymentModal';
import StudentFeeHistoryModal from '../../components/payments/StudentFeeHistoryModal';

export default function AdminLmsManagementPage() {
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'batches', 'classes', 'attendance'
  const [feedback, setFeedback] = useState(null);

  // Data lists with instant cache peeking
  const cachedStudents = api.peekCache?.('/lms/admin/students');
  const cachedAttendance = api.peekCache?.('/lms/admin/attendance-report');
  const cachedBatches = api.peekCache?.('/admin/batches?batchType=LMS');
  const cachedCourses = api.peekCache?.('/lms/courses');

  const [students, setStudents] = useState(cachedStudents?.data || []);
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState(cachedCourses?.data || []);
  const [batches, setBatches] = useState(() => {
    const raw = cachedBatches?.data || [];
    return raw.filter(b => !b.collegeId && b.batchType !== 'COLLEGE_TRAINING');
  });
  const [attendanceData, setAttendanceData] = useState(cachedAttendance?.data || { sessions: [], leaveRequests: [] });

  // Modal State for Attendance History, Editing & Student Deletion
  const [modalStudent, setModalStudent] = useState(null);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [editTargetStudent, setEditTargetStudent] = useState(null);
  const [updatingStudent, setUpdatingStudent] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Modal State for Batch Editing & Batch Deletion
  const [editTargetBatch, setEditTargetBatch] = useState(null);
  const [updatingBatch, setUpdatingBatch] = useState(false);
  const [deleteTargetBatch, setDeleteTargetBatch] = useState(null);
  const [deletingBatchId, setDeletingBatchId] = useState(null);
  const [editBatchStudentSearch, setEditBatchStudentSearch] = useState('');
  const [editBatchForm, setEditBatchForm] = useState({
    name: '',
    code: '',
    courseId: '',
    tutorId: '',
    mode: 'ONLINE',
    startDate: '',
    endDate: '',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    description: '',
    studentIds: []
  });
  const [editStudentForm, setEditStudentForm] = useState({
    studentId: '',
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    courseId: '',
    tutorId: '',
    learningMode: 'ONLINE'
  });

  // Student Creation Form State
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    username: '',
    name: '',
    email: '',
    password: '',
    courseId: '',
    tutorId: '',
    learningMode: 'ONLINE',
    batchId: '',
    phone: '',
    totalCourseFee: 24000,
    courseDurationText: '12 Weeks',
    totalHours: 120,
    monthlyFee: 2000,
    downPayment: 0,
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionId: '',
    isExistingStudent: false
  });
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Fee Collection Modal States in LMS
  const [recordFeeModalOpen, setRecordFeeModalOpen] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [historyFeeModalOpen, setHistoryFeeModalOpen] = useState(false);
  const [selectedStudentForFeeHistory, setSelectedStudentForFeeHistory] = useState(null);

  // Existing Student Directory Filter States
  const [directoryFilter, setDirectoryFilter] = useState({
    courseId: '',
    searchQuery: '',
    selectedStudentId: ''
  });
  const [filterOptions, setFilterOptions] = useState({ courses: [] });
  const [filteredDirectoryStudents, setFilteredDirectoryStudents] = useState([]);
  const [loadingDirectoryStudents, setLoadingDirectoryStudents] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [enrolledCourseWarning, setEnrolledCourseWarning] = useState(null);
  const [idCourseMismatchWarning, setIdCourseMismatchWarning] = useState(null);
  const [autoGenInfo, setAutoGenInfo] = useState(null);
  const [isAutoMappedFromId, setIsAutoMappedFromId] = useState(false);
  const [foundStudentDetails, setFoundStudentDetails] = useState(null);

  // Equal-height alignment: Left Box (Provisioning) and Right Box (Ledger)
  const leftBoxRef = useRef(null);
  const [leftBoxHeight, setLeftBoxHeight] = useState(null);

  useEffect(() => {
    if (activeTab !== 'students') return;

    const syncHeight = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024 && leftBoxRef.current) {
        const measured = leftBoxRef.current.offsetHeight;
        if (measured > 0) {
          setLeftBoxHeight(measured);
        }
      } else {
        setLeftBoxHeight(null);
      }
    };

    // Initial measurement
    syncHeight();

    // ResizeObserver tracks dynamic form changes (mode toggle, error messages, inputs)
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && leftBoxRef.current) {
      ro = new ResizeObserver(() => {
        syncHeight();
      });
      ro.observe(leftBoxRef.current);
    }

    window.addEventListener('resize', syncHeight);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', syncHeight);
    };
  }, [activeTab, studentForm.isExistingStudent, feedback, lookupError, enrolledCourseWarning]);

  // Batch Creation Form State
  const [batchForm, setBatchForm] = useState({
    name: '',
    code: '',
    courseId: '',
    tutorId: '',
    mode: 'ONLINE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    description: '',
    studentIds: []
  });
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [batchStudentSearch, setBatchStudentSearch] = useState('');

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Class Scheduling Form State
  const [classForm, setClassForm] = useState({
    batchId: '',
    courseId: '',
    title: '',
    tutorId: '',
    startDate: todayDateStr,
    endDate: todayDateStr,
    scheduledDate: todayDateStr,
    selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    sessionType: 'ONLINE',
    meetingLink: '',
    classroom: ''
  });
  const [selectedStudentUserIds, setSelectedStudentUserIds] = useState([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);

  const loadAllData = async () => {
    try {
      // Parallelize all independent API requests
      const [stuRes, attRes, batchRes, usersRes, courseRes] = await Promise.allSettled([
        api.get('/lms/admin/students'),
        api.get('/lms/admin/attendance-report'),
        api.get('/admin/batches?batchType=LMS'),
        api.get('/admin/users?role=trainer'),
        api.get('/lms/courses')
      ]);

      if (stuRes.status === 'fulfilled' && stuRes.value?.data?.success) {
        setStudents(stuRes.value.data.data || []);
      }

      if (attRes.status === 'fulfilled' && attRes.value?.data?.success) {
        setAttendanceData(attRes.value.data.data || { sessions: [], leaveRequests: [] });
      }

      if (batchRes.status === 'fulfilled' && batchRes.value?.data?.success) {
        const rawBatches = batchRes.value.data.data || [];
        const instituteCourseBatches = rawBatches.filter(
          b => !b.collegeId && b.batchType !== 'COLLEGE_TRAINING'
        );
        setBatches(instituteCourseBatches);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.data?.success) {
        const allUsers = usersRes.value.data.data.users || usersRes.value.data.data || [];
        const tutorList = allUsers.filter(u => u.role === 'tutor' || u.role === 'trainer');
        setTutors(tutorList);
      }

      if (courseRes.status === 'fulfilled' && courseRes.value?.data?.success && Array.isArray(courseRes.value.data.data) && courseRes.value.data.data.length > 0) {
        setCourses(courseRes.value.data.data);
      } else {
        api.get('/admin/domain-management/courses').then(fb => {
          if (fb.data?.success) setCourses(fb.data.data || []);
        }).catch(() => {});
      }

      loadDirectoryFilterOptions();
    } catch (err) {
      console.error('Error loading admin LMS data:', err);
    }
  };

  // Load Directory Filter Options (Courses)
  const loadDirectoryFilterOptions = async () => {
    try {
      const res = await api.get('/lms/admin/students/filter-options');
      if (res.data.success && res.data.data) {
        setFilterOptions({
          courses: res.data.data.courses || []
        });
      }
    } catch (err) {
      console.error('Failed to load student directory filter options:', err);
    }
  };

  // Handle Directory Course Filter Change - immediately loads matching students
  const handleDirectoryCourseChange = (courseId) => {
    setDirectoryFilter({
      courseId,
      searchQuery: '',
      selectedStudentId: ''
    });
    setLookupError(null);
    setEnrolledCourseWarning(null);
    setFoundStudentDetails(null);
    setStudentForm(prev => ({
      ...prev,
      studentId: '',
      username: '',
      name: '',
      email: ''
    }));

    if (courseId) {
      fetchDirectoryStudents(courseId, '');
    } else {
      setFilteredDirectoryStudents([]);
    }
  };

  // Fetch Filtered Directory Students by Course
  const fetchDirectoryStudents = async (courseId, search = '') => {
    if (!courseId) {
      setFilteredDirectoryStudents([]);
      return;
    }
    setLoadingDirectoryStudents(true);
    try {
      const res = await api.get('/lms/admin/students/directory-search', {
        params: { courseId, search }
      });
      if (res.data.success) {
        setFilteredDirectoryStudents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error searching directory students:', err);
    } finally {
      setLoadingDirectoryStudents(false);
    }
  };

  // Select Student from Directory or Enrolled List
  const handleSelectDirectoryStudent = (student) => {
    if (!student) return;
    const sId = student.studentId || student.userId?.studentId || '';
    const uName = student.username || student.userId?.username || '';
    const sName = student.name || student.userId?.name || '';
    const sEmail = student.email || student.userId?.email || '';

    setDirectoryFilter(prev => ({ ...prev, selectedStudentId: student._id || sId }));
    setStudentForm(prev => ({
      ...prev,
      studentId: sId,
      username: uName,
      name: sName,
      email: sEmail,
      isExistingStudent: true,
      password: 'NOT_REQUIRED'
    }));
    if (sId) {
      handleLookupStudentById(sId, studentForm.courseId);
    }
  };

  // Lookup Student by ID
  const handleLookupStudentById = async (studentIdToLookup, currentAssignCourseId = '') => {
    const norm = (studentIdToLookup || '').trim();
    if (!norm || norm.length < 2) {
      setLookupError(null);
      setEnrolledCourseWarning(null);
      setFoundStudentDetails(null);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await api.get(`/lms/admin/students/lookup-by-id/${encodeURIComponent(norm)}`);
      if (res.data.success) {
        const data = res.data.data;
        setFoundStudentDetails(data);
        setLookupError(null);

        setStudentForm(prev => ({
          ...prev,
          studentId: data.studentId || norm,
          username: data.username || prev.username,
          name: data.name || prev.name,
          email: data.email || prev.email,
          isExistingStudent: true,
          password: 'NOT_REQUIRED'
        }));

        const targetCourseId = currentAssignCourseId || studentForm.courseId;
        if (targetCourseId && data.enrolledCourseIds && data.enrolledCourseIds.includes(targetCourseId.toString())) {
          setEnrolledCourseWarning(`⚠️ Student ${data.name} (${data.studentId}) is ALREADY enrolled in this course!`);
        } else {
          setEnrolledCourseWarning(null);
        }
      }
    } catch (err) {
      setFoundStudentDetails(null);
      setLookupError(err.response?.data?.message || `Student ID "${norm}" not found in database.`);
      setEnrolledCourseWarning(null);
      setStudentForm(prev => ({
        ...prev,
        username: '',
        name: '',
        email: ''
      }));
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle Course Selection -> Auto-generate Student ID & populate Course Details
  const handleCourseSelected = async (cId) => {
    if (!cId) {
      setStudentForm(prev => ({ ...prev, courseId: '' }));
      setAutoGenInfo(null);
      setIdCourseMismatchWarning(null);
      setIsAutoMappedFromId(false);
      return;
    }

    const selCourse = courses.find(c => c._id === cId);
    const cDurationText = selCourse?.durationText || (selCourse?.durationValue ? `${selCourse.durationValue} ${selCourse.durationUnit || 'Weeks'}` : (selCourse?.durationWeeks ? `${selCourse.durationWeeks} Weeks` : '12 Weeks'));
    const cTotalHours = selCourse?.totalHours || 120;
    const cTotalFee = selCourse?.totalCourseFee !== undefined ? Number(selCourse.totalCourseFee) : 24000;
    const cMonthly = selCourse?.monthlyInstallment !== undefined ? Number(selCourse.monthlyInstallment) : 2000;

    let nextIdToUse = '';
    try {
      const res = await api.get(`/lms/admin/courses/${cId}/next-student-id`);
      if (res.data?.success && res.data.data?.nextStudentId) {
        nextIdToUse = res.data.data.nextStudentId;
        setAutoGenInfo(nextIdToUse);
      }
    } catch (e) {
      console.warn('Could not auto-generate next student ID:', e);
    }

    setStudentForm(prev => {
      const shouldUseGenId = !prev.isExistingStudent && (!prev.studentId || prev.studentId.startsWith('SQ-') || prev.studentId.startsWith('STU') || prev.studentId === autoGenInfo);
      return {
        ...prev,
        courseId: cId,
        studentId: shouldUseGenId && nextIdToUse ? nextIdToUse : (nextIdToUse || prev.studentId),
        courseDurationText: cDurationText,
        totalHours: cTotalHours,
        totalCourseFee: cTotalFee,
        monthlyFee: cMonthly,
        downPayment: 0
      };
    });

    setIdCourseMismatchWarning(null);

    if (studentForm.isExistingStudent && foundStudentDetails) {
      if (cId && foundStudentDetails.enrolledCourseIds && foundStudentDetails.enrolledCourseIds.includes(cId.toString())) {
        setEnrolledCourseWarning(`⚠️ Student ${foundStudentDetails.name} (${foundStudentDetails.studentId}) is ALREADY enrolled in this course!`);
      } else {
        setEnrolledCourseWarning(null);
      }
    }
  };

  // Handle Student ID Input -> Auto-identify matching Course from Prefix
  const handleStudentIdInput = (val) => {
    const cleanVal = val.toUpperCase();
    setStudentForm(prev => ({ ...prev, studentId: cleanVal }));

    if (!cleanVal || cleanVal.trim().length < 2) {
      setIdCourseMismatchWarning(null);
      setAutoGenInfo(null);
      setIsAutoMappedFromId(false);
      if (studentForm.isExistingStudent) {
        setLookupError(null);
        setEnrolledCourseWarning(null);
        setFoundStudentDetails(null);
        setStudentForm(prev => ({ ...prev, username: '', name: '', email: '' }));
      }
      return;
    }

    // Identify corresponding course using the Student ID prefix
    const matchedCourse = courses.find(c => {
      const sp = (c.studentIdPrefix || '').trim().toUpperCase().replace(/[-_]+$/, '');
      const cp = (c.coursePrefix || '').trim().toUpperCase().replace(/[-_]+$/, '');
      return (sp && cleanVal.startsWith(`${sp}-`)) ||
             (cp && cleanVal.startsWith(`${cp}-`)) ||
             ((sp === 'SQ-JAVA' || cp === 'SQ-JAVA') && cleanVal.startsWith('SQ-JA-'));
    });

    if (matchedCourse) {
      setIsAutoMappedFromId(true);
      setIdCourseMismatchWarning(null);
      if (studentForm.courseId !== matchedCourse._id) {
        const cDurationText = matchedCourse?.durationText || (matchedCourse?.durationValue ? `${matchedCourse.durationValue} ${matchedCourse.durationUnit || 'Weeks'}` : '12 Weeks');
        setStudentForm(prev => ({
          ...prev,
          courseId: matchedCourse._id,
          courseDurationText: cDurationText,
          totalHours: matchedCourse.totalHours || 120,
          totalCourseFee: matchedCourse.totalCourseFee !== undefined ? Number(matchedCourse.totalCourseFee) : 24000,
          monthlyFee: matchedCourse.monthlyInstallment !== undefined ? Number(matchedCourse.monthlyInstallment) : 2000
        }));
      }
    } else if (studentForm.courseId) {
      setIsAutoMappedFromId(false);
      const currentCourse = courses.find(c => c._id === studentForm.courseId);
      if (currentCourse) {
        const expected = (currentCourse.studentIdPrefix || currentCourse.coursePrefix || 'SQ-COURSE').replace(/[-_]+$/, '');
        if (!cleanVal.startsWith(`${expected}-`)) {
          setIdCourseMismatchWarning(`Student ID "${cleanVal}" prefix does not match course "${currentCourse.title}". Expected prefix: "${expected}-"`);
        } else {
          setIdCourseMismatchWarning(null);
        }
      }
    } else {
      setIsAutoMappedFromId(false);
      setIdCourseMismatchWarning('Student ID prefix does not match any configured course prefix (e.g. SQ-JAVA, SQ-PYTHON, SQ-SEL, SQ-FEMN).');
    }

    if (studentForm.isExistingStudent && cleanVal.trim().length >= 2) {
      handleLookupStudentById(cleanVal, studentForm.courseId);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Student Creation / Extra Course Assignment
  const handleCreateStudent = async (e) => {
    e.preventDefault();

    if (idCourseMismatchWarning) {
      setFeedback({ type: 'error', message: idCourseMismatchWarning });
      return;
    }

    if (studentForm.isExistingStudent) {
      if (lookupError) {
        setFeedback({ type: 'error', message: lookupError });
        return;
      }
      if (enrolledCourseWarning) {
        setFeedback({ type: 'error', message: enrolledCourseWarning });
        return;
      }
      if (!studentForm.studentId || !studentForm.name || !studentForm.email) {
        setFeedback({ type: 'error', message: 'Please enter or select a valid existing student.' });
        return;
      }
    } else {
      if (!studentForm.password || studentForm.password.trim().length < 6) {
        setFeedback({ type: 'error', message: 'Initial password must be at least 6 characters long.' });
        return;
      }
    }

    setSubmittingStudent(true);
    setFeedback(null);
    try {
      const res = await api.post('/lms/admin/students', studentForm);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Student ${studentForm.name} updated successfully!`
        });
        setStudentForm({
          studentId: '',
          username: '',
          name: '',
          email: '',
          password: '',
          courseId: '',
          tutorId: '',
          learningMode: 'ONLINE',
          batchId: '',
          phone: '',
          totalCourseFee: 24000,
          courseDurationText: '12 Weeks',
          totalHours: 120,
          monthlyFee: 2000,
          downPayment: 0,
          paymentMode: 'Cash',
          paymentDate: new Date().toISOString().split('T')[0],
          transactionId: '',
          isExistingStudent: false
        });
        setDirectoryFilter({ courseId: '', searchQuery: '', selectedStudentId: '' });
        setLookupError(null);
        setEnrolledCourseWarning(null);
        setFoundStudentDetails(null);
        setIdCourseMismatchWarning(null);
        setAutoGenInfo(null);
        setIsAutoMappedFromId(false);
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error processing student enrollment.',
        isExistingUser: err.response?.data?.isExistingUser || false,
        existingUser: err.response?.data?.existingUser || null
      });
    } finally {
      setSubmittingStudent(false);
    }
  };

  // Toggle student selection for class assignment
  const toggleStudentSelection = (userId) => {
    if (selectedStudentUserIds.includes(userId)) {
      setSelectedStudentUserIds(selectedStudentUserIds.filter(id => id !== userId));
    } else {
      setSelectedStudentUserIds([...selectedStudentUserIds, userId]);
    }
  };

  // Selected batch object for scheduler
  const selectedClassBatch = batches.find(b => b._id === classForm.batchId);
  const selectedBatchStudentUserIds = (selectedClassBatch?.studentIds || []).map(s => (typeof s === 'object' ? s._id : s)?.toString());

  // Date range formatted strings for selected batch
  const selectedBatchStartStr = selectedClassBatch?.startDate ? new Date(selectedClassBatch.startDate).toISOString().split('T')[0] : '';
  const selectedBatchEndStr = selectedClassBatch?.endDate ? new Date(selectedClassBatch.endDate).toISOString().split('T')[0] : '';

  const isDateOutOfBatchRange = Boolean(
    classForm.batchId &&
    selectedBatchStartStr &&
    selectedBatchEndStr &&
    ((classForm.startDate && classForm.startDate < selectedBatchStartStr) ||
     (classForm.endDate && classForm.endDate > selectedBatchEndStr))
  );

  const isDateRangeInvalid = Boolean(
    classForm.startDate &&
    classForm.endDate &&
    classForm.startDate > classForm.endDate
  );

  const isStartDateInPast = Boolean(
    classForm.startDate &&
    classForm.startDate < todayDateStr
  );

  const handleStartDateChange = (val) => {
    setClassForm(prev => {
      const next = { ...prev, startDate: val, scheduledDate: val };
      if (!prev.endDate || prev.endDate < val) {
        next.endDate = val;
      }
      return next;
    });
  };

  // Change course in class form and reset selected students
  const handleCourseChange = (courseId) => {
    setClassForm((prev) => ({ ...prev, courseId }));
    if (!classForm.batchId) {
      setSelectedStudentUserIds([]);
    }
  };

  // Compute eligible online students (strictly ONLINE students belonging to selected batch or course)
  const eligibleOnlineStudents = students.filter((s) => {
    if (s.learningMode !== 'ONLINE') return false;
    if (classForm.batchId) {
      const sBatchId = (s.batchId?._id || s.batchId)?.toString();
      const sUserId = (s.userId?._id || s._id)?.toString();
      const belongsToBatch = (sBatchId && sBatchId === classForm.batchId.toString()) || selectedBatchStudentUserIds.includes(sUserId);
      if (!belongsToBatch) return false;
    } else if (classForm.courseId) {
      const sCourseId = (s.enrolledCourseId?._id || s.enrolledCourseId)?.toString();
      if (sCourseId !== classForm.courseId.toString()) return false;
    }
    return true;
  });

  // Search filter for eligible online students
  const filteredStudentsToDisplay = eligibleOnlineStudents.filter((s) => {
    if (!studentSearchQuery.trim()) return true;
    const q = studentSearchQuery.toLowerCase();
    const nameMatch = s.userId?.name?.toLowerCase().includes(q);
    const usernameMatch = s.userId?.username?.toLowerCase().includes(q);
    const studentIdMatch = (s.studentId || s.userId?.studentId || '').toLowerCase().includes(q);
    return nameMatch || usernameMatch || studentIdMatch;
  });

  const handleSelectAllEligible = () => {
    const filteredUserIds = filteredStudentsToDisplay.map((s) => s.userId?._id).filter(Boolean);
    const allSelected = filteredUserIds.length > 0 && filteredUserIds.every((id) => selectedStudentUserIds.includes(id));
    if (allSelected) {
      setSelectedStudentUserIds((prev) => prev.filter((id) => !filteredUserIds.includes(id)));
    } else {
      setSelectedStudentUserIds((prev) => Array.from(new Set([...prev, ...filteredUserIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedStudentUserIds([]);
  };

  // Handle Class Scheduling
  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!classForm.startDate) {
      setFeedback({ type: 'error', message: 'Starting Date is required.' });
      return;
    }

    if (!classForm.endDate) {
      setFeedback({ type: 'error', message: 'Ending Date is required.' });
      return;
    }

    if (isDateRangeInvalid) {
      setFeedback({
        type: 'error',
        message: 'Starting Date must be earlier than or equal to Ending Date.'
      });
      return;
    }

    if (isStartDateInPast) {
      setFeedback({
        type: 'error',
        message: 'Cannot schedule classes in the past. Starting Date must be today or a future date.'
      });
      return;
    }

    if (isDateOutOfBatchRange) {
      setFeedback({
        type: 'error',
        message: `Class Date Range (${classForm.startDate} to ${classForm.endDate}) must be within batch date range (${selectedBatchStartStr} to ${selectedBatchEndStr}).`
      });
      return;
    }

    if (!selectedStudentUserIds || selectedStudentUserIds.length === 0) {
      setFeedback({
        type: 'error',
        message: 'At least one eligible ONLINE student must be selected.'
      });
      return;
    }

    setSubmittingClass(true);
    setFeedback(null);
    try {
      const payload = {
        ...classForm,
        scheduledDate: classForm.startDate,
        studentIds: selectedStudentUserIds
      };
      const res = await api.post('/lms/admin/schedule-class', payload);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Class scheduled successfully! Assigned to ${selectedStudentUserIds.length} eligible online students.`
        });
        setClassForm({
          batchId: '',
          courseId: '',
          title: '',
          tutorId: '',
          startDate: todayDateStr,
          endDate: todayDateStr,
          scheduledDate: todayDateStr,
          selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          sessionType: 'ONLINE',
          meetingLink: '',
          classroom: ''
        });
        setSelectedStudentUserIds([]);
        setStudentSearchQuery('');
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error scheduling class.'
      });
    } finally {
      setSubmittingClass(false);
    }
  };

  // Handle LMS Batch Creation
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!batchForm.name.trim()) {
      setFeedback({ type: 'error', message: 'Batch Name is required.' });
      return;
    }
    if (!batchForm.code.trim()) {
      setFeedback({ type: 'error', message: 'Batch Code is required.' });
      return;
    }
    setSubmittingBatch(true);
    setFeedback(null);
    try {
      const payload = {
        ...batchForm,
        name: batchForm.name.trim(),
        code: batchForm.code.trim().toUpperCase(),
        batchType: 'LMS'
      };
      const res = await api.post('/admin/batches/create-full', payload);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `LMS Batch "${batchForm.name}" created successfully!`
        });
        setBatchForm({
          name: '',
          code: '',
          courseId: '',
          tutorId: '',
          mode: 'ONLINE',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          description: '',
          studentIds: []
        });
        setBatchStudentSearch('');
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create LMS batch.'
      });
    } finally {
      setSubmittingBatch(false);
    }
  };

  // Handle Removing Student from Batch
  const handleRemoveStudentFromBatch = async (batchId, studentUserId) => {
    try {
      const res = await api.delete(`/admin/batches/${batchId}/students/${studentUserId}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: 'Student unassigned from batch.'
        });
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove student from batch.'
      });
    }
  };

  // Handle Leave Review
  const handleReviewLeave = async (requestId, status) => {
    try {
      const res = await api.put(`/lms/admin/leave-requests/${requestId}/review`, {
        status,
        remarks: `Reviewed and ${status.toLowerCase()} by administration.`
      });
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: `Leave request ${status.toLowerCase()} successfully.`
        });
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error reviewing leave request');
    }
  };

  // Handle Scheduled Session Deletion
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this scheduled class?')) return;
    try {
      const res = await api.delete(`/lms/admin/sessions/${sessionId}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Scheduled class deleted successfully.'
        });
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete scheduled class.'
      });
    }
  };

  // Handle Student Deletion
  const confirmAndDeleteStudent = async () => {
    if (!deleteTargetStudent) return;
    const targetId = deleteTargetStudent._id || deleteTargetStudent.userId?._id;
    setDeletingStudentId(targetId);
    try {
      const res = await api.delete(`/lms/admin/students/${targetId}`);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Student account deleted successfully.'
        });
        setDeleteTargetStudent(null);
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete student account.'
      });
    } finally {
      setDeletingStudentId(null);
    }
  };

  // Open Edit Student Modal
  const openEditStudentModal = (st) => {
    const u = st.userId || {};
    setEditTargetStudent(st);
    setEditStudentForm({
      studentId: st.studentId || u.studentId || '',
      username: u.username || '',
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      courseId: st.enrolledCourseId?._id || st.enrolledCourseId || '',
      tutorId: st.assignedTutorId?._id || st.assignedTutorId || '',
      learningMode: st.learningMode || 'ONLINE'
    });
    setShowEditPassword(false);
  };

  // Handle Update Student Submit
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editTargetStudent) return;
    const targetId = editTargetStudent._id || editTargetStudent.userId?._id;
    setUpdatingStudent(true);
    try {
      const res = await api.put(`/lms/admin/students/${targetId}`, editStudentForm);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Student details updated successfully!'
        });
        setEditTargetStudent(null);
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error updating student details.'
      });
    } finally {
      setUpdatingStudent(false);
    }
  };

  // Open Edit Batch Modal
  const openEditBatchModal = (b) => {
    setEditTargetBatch(b);
    setEditBatchStudentSearch('');
    const sIds = (b.studentIds || []).map(s => (typeof s === 'object' ? s._id : s)?.toString()).filter(Boolean);
    const startStr = b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '';
    const endStr = b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '';

    setEditBatchForm({
      name: b.name || '',
      code: b.code || '',
      courseId: b.courseId?._id || b.courseId || '',
      tutorId: b.trainerId?._id || b.trainerId || '',
      mode: b.mode || 'ONLINE',
      startDate: startStr,
      endDate: endStr,
      startTime: b.startTime || '10:00 AM',
      endTime: b.endTime || '11:00 AM',
      description: b.description || '',
      studentIds: sIds
    });
  };

  // Handle Update Batch Submit
  const handleUpdateBatch = async (e) => {
    e.preventDefault();
    if (!editTargetBatch) return;
    setUpdatingBatch(true);
    setFeedback(null);
    try {
      const res = await api.put(`/admin/batches/${editTargetBatch._id}`, editBatchForm);
      if (res.data.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || `Batch '${editBatchForm.name}' updated successfully!`
        });
        setEditTargetBatch(null);
        loadAllData();
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update batch.'
      });
    } finally {
      setUpdatingBatch(false);
    }
  };

  // Handle Delete Batch Confirmation
  const confirmAndDeleteBatch = async () => {
    if (!deleteTargetBatch) return;
    const targetBatchId = deleteTargetBatch._id;
    const targetBatchName = deleteTargetBatch.name;
    setDeletingBatchId(targetBatchId);
    try {
      const res = await api.delete(`/admin/batches/${targetBatchId}`);
      if (res.data.success) {
        setBatches(prev => prev.filter(b => b._id !== targetBatchId));
        setFeedback({
          type: 'success',
          message: res.data.message || `Batch '${targetBatchName}' deleted successfully.`
        });
        setDeleteTargetBatch(null);
        loadAllData();
      } else {
        setFeedback({
          type: 'error',
          message: res.data.message || 'Failed to delete batch.'
        });
      }
    } catch (err) {
      console.error('deleteBatch error:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to delete batch.'
      });
    } finally {
      setDeletingBatchId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Page Header Banner matching Tutor Studio */}
      <div className="shrink-0 rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-4 md:p-6 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Institute LMS Operations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Learning Management Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Student provisioning & ID assignment, class scheduling (online/offline), and real-time attendance control.
            </p>
          </div>

          {/* Segmented Tab Navigation */}
          <div className="flex flex-wrap items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'students'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Students ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'batches'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Batches ({batches.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'classes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Classes</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'attendance'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Attendance & Absences</span>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'fees'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fee Management</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold border shadow-sm ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {feedback.isExistingUser && feedback.existingUser && (
            <button
              type="button"
              onClick={() => {
                setStudentForm({
                  ...studentForm,
                  isExistingStudent: true,
                  studentId: feedback.existingUser.studentId || '',
                  username: feedback.existingUser.username || '',
                  name: feedback.existingUser.name || '',
                  email: feedback.existingUser.email || '',
                  password: 'NOT_REQUIRED'
                });
                setFeedback(null);
              }}
              className="mt-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300 transition inline-block"
            >
              ➔ Switch to Existing Student Mode & Assign Extra Course to {feedback.existingUser.name} ({feedback.existingUser.studentId})
            </button>
          )}
        </div>
      )}

      {/* TAB 1: STUDENT PROVISIONING & DIRECTORY */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Create Student Form (5 Cols) */}
          <div 
            ref={leftBoxRef}
            className="lg:col-span-5 bg-white border border-purple-100/90 shadow-xs rounded-3xl p-5 space-y-4 flex flex-col overflow-visible"
          >
            <div className="border-b border-purple-100 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
                  Student Account Provisioning
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  studentForm.isExistingStudent
                    ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {studentForm.isExistingStudent ? 'Existing Student Mode' : 'New Student Mode'}
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                {studentForm.isExistingStudent ? 'Assign Extra Course to Existing Student' : 'Provision New Student Account'}
              </h2>
              <p className="text-xs text-slate-500">
                {studentForm.isExistingStudent
                  ? 'Select an existing student to assign an additional course/domain or tutor assignment.'
                  : 'Create unique username & ID credentials, assign domain course, tutor, and learning mode.'}
              </p>

              {/* Mode Selector Segmented Toggle */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl mt-2 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setStudentForm({
                      studentId: '',
                      username: '',
                      name: '',
                      email: '',
                      password: '',
                      courseId: '',
                      tutorId: '',
                      learningMode: 'ONLINE',
                      batchId: '',
                      phone: '',
                      monthlyFee: 2000,
                      isExistingStudent: false
                    });
                    setDirectoryFilter({ courseId: '', searchQuery: '', selectedStudentId: '' });
                    setLookupError(null);
                    setEnrolledCourseWarning(null);
                    setFoundStudentDetails(null);
                  }}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition ${
                    !studentForm.isExistingStudent
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ➕ New Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentForm({
                      studentId: '',
                      username: '',
                      name: '',
                      email: '',
                      password: 'NOT_REQUIRED',
                      courseId: '',
                      tutorId: '',
                      learningMode: 'ONLINE',
                      batchId: '',
                      phone: '',
                      monthlyFee: 2000,
                      isExistingStudent: true
                    });
                    setDirectoryFilter({ courseId: '', searchQuery: '', selectedStudentId: '' });
                    setLookupError(null);
                    setEnrolledCourseWarning(null);
                    setFoundStudentDetails(null);
                    loadDirectoryFilterOptions();
                  }}
                  className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition ${
                    studentForm.isExistingStudent
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎓 Existing Student (Extra Course)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              {/* If Existing Student Mode: Multi-Step Cascading Directory Search & Quick Selector */}
              {studentForm.isExistingStudent && (
                <div className="space-y-3 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-200/80">
                  <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                    <span className="text-xs font-black text-purple-900 flex items-center space-x-1.5">
                      <Filter className="w-3.5 h-3.5 text-purple-600" />
                      <span>Select Existing Enrolled Student</span>
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                      Directory Filter
                    </span>
                  </div>

                  {/* Quick Select from Currently Enrolled LMS Students */}
                  {students.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Quick Select Enrolled Student ({students.length} Available)
                      </label>
                      <select
                        value={directoryFilter.selectedStudentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = students.find(s => s._id === val || s.studentId === val || s.userId?._id === val || s.userId?.studentId === val);
                          if (found) {
                            handleSelectDirectoryStudent(found);
                          }
                        }}
                        className="w-full text-xs font-semibold bg-white border border-purple-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="">-- Choose From Enrolled LMS Students --</option>
                        {students.map((st) => (
                          <option key={st._id} value={st._id}>
                            {st.userId?.name || st.name} ({st.studentId || st.userId?.studentId}) — @{st.userId?.username || st.username} | {st.enrolledCourseId?.title || 'Course'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {students.length > 0 && (
                    <div className="flex items-center space-x-2 my-1">
                      <div className="flex-1 border-t border-purple-200/60"></div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Or Filter by Course</span>
                      <div className="flex-1 border-t border-purple-200/60"></div>
                    </div>
                  )}

                  {/* Filter 1: Course / Domain */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Filter 1: Select Course / Domain <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={directoryFilter.courseId}
                      onChange={(e) => handleDirectoryCourseChange(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="">-- Choose Course / Domain --</option>
                      {(filterOptions?.courses || courses || []).map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title} ({c.code || c.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Complete Matching Student List immediately below Course dropdown */}
                  {directoryFilter.courseId && (
                    <div className="space-y-2 pt-1 border-t border-purple-200/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Select Matching Student ({filteredDirectoryStudents.length} Found) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {filteredDirectoryStudents.length} Available
                        </span>
                      </div>

                      {/* Search Box */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search by Name, Student ID, or Username..."
                          value={directoryFilter.searchQuery}
                          onChange={(e) => {
                            const q = e.target.value;
                            setDirectoryFilter(prev => ({ ...prev, searchQuery: q }));
                            fetchDirectoryStudents(directoryFilter.courseId, q);
                          }}
                          className="w-full text-xs pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>

                      {loadingDirectoryStudents ? (
                        <div className="p-3 text-center text-xs text-slate-500 font-semibold bg-white rounded-xl border border-slate-200">
                          <span className="inline-block animate-spin mr-2">⏳</span> Loading enrolled students...
                        </div>
                      ) : filteredDirectoryStudents.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500 font-semibold bg-white rounded-xl border border-slate-200">
                          No enrolled students found for this course.
                        </div>
                      ) : (
                        <select
                          value={directoryFilter.selectedStudentId}
                          onChange={(e) => {
                            const stId = e.target.value;
                            const stu = filteredDirectoryStudents.find(s => s._id === stId || s.studentId === stId || s.userId?._id === stId || s.userId === stId);
                            if (stu) {
                              handleSelectDirectoryStudent(stu);
                            }
                          }}
                          className="w-full text-xs font-semibold bg-white border border-purple-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="">-- Select Student ({filteredDirectoryStudents.length} Found) --</option>
                          {filteredDirectoryStudents.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name} ({s.studentId}) — @{s.username} {s.email ? `| ${s.email}` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Student ID (Editable in both modes) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>Student ID</span>
                      <span className="text-red-500">*</span>
                      {autoGenInfo && studentForm.studentId === autoGenInfo && (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono">
                          Auto-Generated
                        </span>
                      )}
                    </label>
                    {studentForm.isExistingStudent ? (
                      <span className="text-[10px] text-purple-600 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        Existing Student Mode
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Auto-maps Course Prefix
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. SQ-JAVA-0001"
                      value={studentForm.studentId}
                      onChange={(e) => handleStudentIdInput(e.target.value)}
                      onBlur={() => {
                        if (studentForm.isExistingStudent && studentForm.studentId.trim()) {
                          handleLookupStudentById(studentForm.studentId, studentForm.courseId);
                        }
                      }}
                      className={`w-full text-xs font-mono font-bold bg-white border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none uppercase ${
                        idCourseMismatchWarning ? 'border-rose-400 bg-rose-50/20' : (lookupError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300')
                      }`}
                    />
                    {lookupLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-600 font-bold animate-pulse">
                        🔍
                      </span>
                    )}
                  </div>
                  {idCourseMismatchWarning && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{idCourseMismatchWarning}</span>
                    </p>
                  )}
                  {lookupError && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{lookupError}</span>
                    </p>
                  )}
                  {enrolledCourseWarning && (
                    <p className="text-[11px] font-bold text-amber-600 mt-1 flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{enrolledCourseWarning}</span>
                    </p>
                  )}
                </div>

                {/* Username (Read-only in Existing Student mode) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. kumar01"
                    value={studentForm.username}
                    onChange={(e) => {
                      if (!studentForm.isExistingStudent) {
                        setStudentForm({ ...studentForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') });
                      }
                    }}
                    readOnly={studentForm.isExistingStudent}
                    className={`w-full text-xs font-mono font-bold border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none lowercase ${
                      studentForm.isExistingStudent
                        ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none font-bold'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Full Name (Read-only in Existing Student mode) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kumar"
                    value={studentForm.name}
                    onChange={(e) => {
                      if (!studentForm.isExistingStudent) {
                        setStudentForm({ ...studentForm, name: e.target.value });
                      }
                    }}
                    readOnly={studentForm.isExistingStudent}
                    className={`w-full text-xs font-semibold border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                      studentForm.isExistingStudent
                        ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none font-bold'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                {/* Email Address (Read-only in Existing Student mode) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kumar@stackqueue.com"
                    value={studentForm.email}
                    onChange={(e) => {
                      if (!studentForm.isExistingStudent) {
                        setStudentForm({ ...studentForm, email: e.target.value });
                      }
                    }}
                    readOnly={studentForm.isExistingStudent}
                    className={`w-full text-xs font-semibold border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                      studentForm.isExistingStudent
                        ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none font-bold'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {!studentForm.isExistingStudent && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showStudentPassword ? 'text' : 'password'}
                        required={!studentForm.isExistingStudent}
                        minLength={6}
                        placeholder="Student@123"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl pl-3 pr-10 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                        title={showStudentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showStudentPassword ? <EyeOff className="w-4 h-4 text-pink-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      Learning Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={studentForm.learningMode}
                      onChange={(e) => setStudentForm({ ...studentForm, learningMode: e.target.value })}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="ONLINE">ONLINE Mode</option>
                      <option value="OFFLINE">OFFLINE Mode</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Batch Assignment Selector */}
              <div className="space-y-1 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 block">
                    Assign Student to Batch (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('batches')}
                    className="text-[10px] font-extrabold text-purple-600 hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create New Batch</span>
                  </button>
                </div>
                <select
                  value={studentForm.batchId || ''}
                  onChange={(e) => {
                    const bId = e.target.value;
                    if (!bId) {
                      setStudentForm(prev => ({ ...prev, batchId: '' }));
                      return;
                    }
                    const b = batches.find(item => item._id === bId);
                    if (b) {
                      setStudentForm(prev => ({
                        ...prev,
                        batchId: bId,
                        courseId: b.courseId?._id || b.courseId || prev.courseId,
                        tutorId: b.trainerId?._id || b.trainerId || prev.tutorId,
                        learningMode: b.mode || prev.learningMode
                      }));
                    }
                  }}
                  className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- No Batch (Single Student Mode) --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      🎓 {b.name} ({b.mode || 'ONLINE'}) — {b.totalStudents || b.studentIds?.length || 0} Students
                    </option>
                  ))}
                </select>
                {studentForm.batchId && (
                  <p className="text-[10px] font-bold text-amber-800">
                    ⚡ Course, Tutor & Learning Mode auto-populated from selected Batch.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Assign Course / Domain <span className="text-red-500">*</span>
                    </label>
                    {isAutoMappedFromId && (
                      <span className="text-[10px] text-purple-700 font-extrabold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        Auto-Mapped by ID
                      </span>
                    )}
                  </div>
                  <select
                    required
                    value={studentForm.courseId}
                    onChange={(e) => handleCourseSelected(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Course / Domain</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} {c.coursePrefix ? `(${c.coursePrefix})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Assign Tutor
                  </label>
                  <select
                    value={studentForm.tutorId}
                    onChange={(e) => setStudentForm({ ...studentForm, tutorId: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Tutor</option>
                    {tutors.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fee & Down Payment Management (Requirement B & C) */}
              <div className="space-y-3 bg-gradient-to-r from-purple-50/80 via-white to-pink-50/60 p-4 rounded-2xl border border-purple-200/90 shadow-2xs">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <span className="text-xs font-black text-slate-900 flex items-center space-x-1.5 font-mono uppercase tracking-wider">
                    <span>Course Fee & Down Payment</span>
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200">
                    Database-Driven
                  </span>
                </div>

                {/* Course Details (Single Source of Truth from DB) */}
                <div className="bg-purple-100/40 border border-purple-200/90 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Course Duration (DB Record)</span>
                    <strong className="text-xs font-black text-purple-900 font-mono">
                      {studentForm.courseDurationText || '12 Weeks'} ({studentForm.totalHours || 120} Hours)
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Single Source of Truth</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Preserved Course Duration
                    </span>
                  </div>
                </div>

                {/* Course Fee and Monthly Installment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Total Course Fee (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={studentForm.totalCourseFee !== undefined ? studentForm.totalCourseFee : 24000}
                      onChange={(e) => setStudentForm({ ...studentForm, totalCourseFee: Math.max(0, Number(e.target.value)) })}
                      className="w-full text-xs font-bold font-mono text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Monthly Installment Amount (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={studentForm.monthlyFee !== undefined ? studentForm.monthlyFee : 2000}
                      onChange={(e) => setStudentForm({ ...studentForm, monthlyFee: Math.max(1, Number(e.target.value)) })}
                      className="w-full text-xs font-bold font-mono text-purple-700 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                {/* Mandatory Down Payment Collected */}
                <div className="pt-2 border-t border-purple-100/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-900 flex items-center justify-between">
                        <span>Down Payment Collected (₹) <span className="text-red-500">*</span></span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-700 font-mono">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={studentForm.downPayment !== undefined ? studentForm.downPayment : 0}
                          onChange={(e) => setStudentForm({ ...studentForm, downPayment: Math.max(0, Number(e.target.value)) })}
                          className="w-full text-xs font-black text-emerald-700 bg-emerald-50/50 border border-emerald-300 rounded-xl pl-6 pr-3 py-2 font-mono focus:ring-2 focus:ring-emerald-500"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">
                        Payment Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={studentForm.paymentMode || 'Cash'}
                        onChange={(e) => setStudentForm({ ...studentForm, paymentMode: e.target.value })}
                        className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Date & Optional Transaction ID (Shown if downPayment > 0) */}
                  {(Number(studentForm.downPayment) > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Payment Date</label>
                        <input
                          type="date"
                          value={studentForm.paymentDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setStudentForm({ ...studentForm, paymentDate: e.target.value })}
                          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Transaction ID (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. UPI-123456789"
                          value={studentForm.transactionId || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, transactionId: e.target.value })}
                          className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Real-time Remaining Principal Preview */}
                  {(() => {
                    const totalFee = Number(studentForm.totalCourseFee) || 0;
                    const downPayment = Number(studentForm.downPayment) || 0;
                    const remaining = Math.max(0, totalFee - downPayment);
                    const monthly = Number(studentForm.monthlyFee) || 2000;
                    const numInst = remaining > 0 ? Math.ceil(remaining / (monthly > 0 ? monthly : 2000)) : 0;

                    return (
                      <div className="mt-2 p-2.5 bg-purple-50/90 rounded-xl border border-purple-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-500 text-[11px] block">Remaining Principal:</span>
                          <span className="font-mono font-black text-purple-900 text-sm">
                            ₹{remaining.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1.5">
                            ({numInst} remaining installment{numInst === 1 ? '' : 's'})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            downPayment > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {downPayment > 0 ? `₹${downPayment.toLocaleString()} Down Payment Verified` : '₹0 Collected — Full Principal Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingStudent}
                className="w-full py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {submittingStudent
                    ? (studentForm.isExistingStudent ? 'Assigning Course...' : 'Creating Account...')
                    : (studentForm.isExistingStudent ? 'ASSIGN EXTRA COURSE TO STUDENT' : 'PROVISION STUDENT ACCOUNT')}
                </span>
              </button>
            </form>
          </div>

          {/* Enrolled Students Directory (7 Cols) */}
          <div 
            style={leftBoxHeight ? { height: `${leftBoxHeight}px`, maxHeight: `${leftBoxHeight}px` } : {}}
            className="lg:col-span-7 bg-white border border-purple-100/90 shadow-xs rounded-3xl p-5 flex flex-col h-full min-h-0 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-purple-100 pb-3 shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Enrolled Students Ledger
                </h2>
                <p className="text-[11px] text-slate-500">
                  Click on any student's <strong className="text-purple-600 font-bold">Attendance % badge</strong> to view their detailed class history log.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0">
                {students.length} Total Enrolled
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto overscroll-contain mt-2 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-purple-50/95 backdrop-blur-xs text-slate-700 font-bold border-b border-purple-200 shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 bg-purple-50/95">Student Info</th>
                    <th className="py-2.5 px-3 bg-purple-50/95">Mode</th>
                    <th className="py-2.5 px-3 bg-purple-50/95">Course / Tutor</th>
                    <th className="py-2.5 px-3 bg-purple-50/95">Monthly Fee</th>
                    <th className="py-2.5 px-3 bg-purple-50/95">Attendance %</th>
                    <th className="py-2.5 px-3 bg-purple-50/95">XP</th>
                    <th className="py-2.5 px-3 text-right bg-purple-50/95">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {students.map((st) => {
                    const u = st.userId || {};
                    const attRate = st.attendancePercentage ?? 100;

                    return (
                      <tr key={st._id} className="hover:bg-purple-50/30 transition">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-mono font-bold text-purple-700 text-xs bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                              {st.studentId || u.studentId || '—'}
                            </span>
                            <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-purple-700/80">@{u.username || 'username'}</span> • {u.email}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            st.learningMode === 'OFFLINE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {st.learningMode || 'ONLINE'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800 block">
                            {st.enrolledCourseId?.title || 'Java Full Stack'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Tutor: {st.assignedTutorId?.name || 'Arun'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-mono font-black text-slate-900 block text-xs">
                            ₹{(st.monthlyFee || 2000).toLocaleString('en-IN')}/mo
                          </span>
                          <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold border ${
                            st.feePaymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {st.feePaymentStatus || 'Pending'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => setModalStudent(st)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center space-x-1 border shadow-xs hover:scale-105 ${
                              attRate >= 85
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : attRate >= 70
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                            title="Click to view detailed attendance history modal"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{attRate}%</span>
                          </button>
                        </td>

                        <td className="py-2.5 px-3 font-mono font-bold text-amber-600">
                          {st.totalXp} XP
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedStudentForFee({
                                  ...st,
                                  name: u.name,
                                  studentId: st.studentId || u.studentId,
                                  userId: u._id,
                                  courseTitle: st.enrolledCourseId?.title,
                                  monthlyFee: st.monthlyFee || 2000
                                });
                                setRecordFeeModalOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-lg shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                              title="Collect & Record Student Fee"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Fee</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStudentForFeeHistory(u._id || st.studentId || u.studentId);
                                setHistoryFeeModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                              title="View Complete Fee History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditStudentModal(st)}
                              className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Edit Student Details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetStudent(st)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Student Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-9 h-9 text-purple-300 stroke-[1.5]" />
                          <p className="font-bold text-xs text-slate-600">No students enrolled yet</p>
                          <p className="text-[11px] text-slate-400">Use the Student Account Provisioning form on the left to enroll new or existing students.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT BATCH MANAGEMENT */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Batch & Merge Students Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-purple-100/90 shadow-xs rounded-3xl p-6 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
                Batch Management Studio
              </span>
              <h2 className="text-base font-black text-slate-900">
                Create Batch & Assign Students
              </h2>
              <p className="text-xs text-slate-500">
                Merge multiple existing enrolled students into a batch. Student IDs remain unique without duplicating records.
              </p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Batch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java Fullstack Oct-2026"
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Batch Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JAVA-B1"
                    value={batchForm.code}
                    onChange={(e) => setBatchForm({ ...batchForm, code: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono uppercase bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Course / Domain
                  </label>
                  <select
                    value={batchForm.courseId}
                    onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Course / Domain</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Assign Tutor
                  </label>
                  <select
                    value={batchForm.tutorId}
                    onChange={(e) => setBatchForm({ ...batchForm, tutorId: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Tutor</option>
                    {tutors.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Mode</label>
                  <select
                    value={batchForm.mode}
                    onChange={(e) => setBatchForm({ ...batchForm, mode: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-2 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Start Date</label>
                  <input
                    type="date"
                    value={batchForm.startDate}
                    onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">End Date</label>
                  <input
                    type="date"
                    value={batchForm.endDate}
                    onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Class Start Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={batchForm.startTime}
                    onChange={(e) => setBatchForm({ ...batchForm, startTime: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Class End Time</label>
                  <input
                    type="text"
                    placeholder="11:00 AM"
                    value={batchForm.endTime}
                    onChange={(e) => setBatchForm({ ...batchForm, endTime: e.target.value })}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-Select Students Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Select Students to Merge into Batch
                  </label>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Selected: {batchForm.studentIds.length} Students
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Search students..."
                  value={batchStudentSearch}
                  onChange={(e) => setBatchStudentSearch(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />

                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
                  {students.filter(st => {
                    const u = st.userId || {};
                    const q = batchStudentSearch.toLowerCase();
                    return !q || (u.name || '').toLowerCase().includes(q) || (st.studentId || '').toLowerCase().includes(q);
                  }).map(st => {
                    const uId = st.userId?._id || st._id;
                    const isChecked = batchForm.studentIds.includes(uId);
                    return (
                      <label key={st._id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100/70 transition cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setBatchForm(prev => ({
                                ...prev,
                                studentIds: isChecked
                                  ? prev.studentIds.filter(id => id !== uId)
                                  : [...prev.studentIds, uId]
                              }));
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{st.userId?.name}</span>
                            <span className="text-[10px] font-mono text-purple-600">{st.studentId || st.userId?.studentId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{st.userId?.email}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingBatch}
                className="w-full py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{submittingBatch ? 'Creating Batch...' : 'CREATE BATCH & MERGE STUDENTS'}</span>
              </button>
            </form>
          </div>

          {/* Batches Ledger (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-purple-100/90 shadow-xs rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                Active Student Batches
              </h2>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                {batches.length} Total Batches
              </span>
            </div>

            {batches.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-purple-200/80 rounded-2xl bg-purple-50/20">
                <GraduationCap className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">No course batches available. Create a batch to get started.</p>
                <p className="text-xs text-slate-400 mt-1">Use the form on the left to merge students into a new institute course batch.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                {batches.map((b) => (
                  <div key={b._id} className="p-4 bg-white border border-purple-100 hover:border-purple-300 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-slate-900">{b.name}</span>
                          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">{b.code}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{b.courseId?.title || 'General Course'} • Tutor: {b.trainerId?.name || 'Unassigned'}</p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase ${
                          b.mode === 'OFFLINE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {b.mode || 'ONLINE'}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditBatchModal(b)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Edit Batch Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetBatch(b)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-200">
                      <span>Date Range: <strong>{b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'} → {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'Ongoing'}</strong></span>
                      <span>Class Time: <strong>{b.startTime} – {b.endTime}</strong></span>
                      <span>Students: <strong className="text-purple-600">{b.totalStudents || b.studentIds?.length || 0} Enrolled</strong></span>
                    </div>

                    {/* Batch Roster Preview */}
                    {b.studentIds && b.studentIds.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-700 block">Assigned Students Roster:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {b.studentIds.map(st => {
                            const stObj = typeof st === 'object' ? st : null;
                            const stName = stObj?.name || 'Student';
                            const stId = stObj?.studentId || '';
                            const stUserId = stObj?._id || st;

                            return (
                              <span key={stUserId} className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-white border border-slate-300 text-slate-800 px-2 py-1 rounded-lg">
                                <span>{stName} ({stId})</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudentFromBatch(b._id, stUserId)}
                                  className="text-slate-400 hover:text-red-600 ml-1"
                                  title="Unassign from batch"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditBatchModal(b)}
                          className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                        >
                          <Pencil className="w-3.5 h-3.5 text-purple-600" />
                          <span>Edit Batch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetBatch(b)}
                          className="px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center space-x-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Delete Batch</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const bStudentUserIds = (b.studentIds || []).map(s => typeof s === 'object' ? s._id : s);
                          const cId = b.courseId?._id || b.courseId || classForm.courseId;
                          setClassForm(prev => ({
                            ...prev,
                            batchId: b._id,
                            courseId: cId,
                            tutorId: b.trainerId?._id || b.trainerId || prev.tutorId,
                            sessionType: b.mode || prev.sessionType,
                            startTime: b.startTime || prev.startTime,
                            endTime: b.endTime || prev.endTime
                          }));
                          if (cId) handleCourseChange(cId);
                          setSelectedStudentUserIds(bStudentUserIds);
                          setActiveTab('classes');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition flex items-center space-x-1"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Classes for {b.name} →</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLASS SCHEDULING (Online & Offline Workflow) */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Class Scheduling Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-purple-100/90 shadow-xs rounded-3xl p-6 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
                Admin Class Scheduler
              </span>
              <h2 className="text-base font-black text-slate-900">
                Schedule New Class (Online / Offline)
              </h2>
              <p className="text-xs text-slate-500">
                Select target batch or individual students, configure tutor & schedule, and provide meeting link or location.
              </p>
            </div>

            <form onSubmit={handleScheduleClass} className="space-y-3">
              {/* Target Batch Selector */}
              <div className="space-y-1.5 bg-purple-50/70 p-3 rounded-xl border border-purple-200">
                <label className="text-xs font-bold text-purple-900 block">
                  Select Target Batch (Optional)
                </label>
                <select
                  value={classForm.batchId || ''}
                  onChange={(e) => {
                    const bId = e.target.value;
                    if (!bId) {
                      setClassForm(prev => ({
                        ...prev,
                        batchId: '',
                        courseId: '',
                        tutorId: ''
                      }));
                      setSelectedStudentUserIds([]);
                      return;
                    }
                    const b = batches.find(item => item._id === bId);
                    if (b) {
                      const cId = b.courseId?._id || b.courseId || classForm.courseId;
                      const tId = b.trainerId?._id || b.trainerId || classForm.tutorId;

                      // Extract online students of this batch
                      const bStudentUserIds = (b.studentIds || []).map(s => (typeof s === 'object' ? s._id : s)?.toString());
                      const batchOnlineStudentUserIds = students
                        .filter(s => {
                          if (s.learningMode !== 'ONLINE') return false;
                          const sBatchId = (s.batchId?._id || s.batchId)?.toString();
                          const sUserId = (s.userId?._id || s._id)?.toString();
                          return (sBatchId && sBatchId === bId.toString()) || bStudentUserIds.includes(sUserId);
                        })
                        .map(s => s.userId?._id || s._id);

                      const bStartStr = b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '';
                      const bEndStr = b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '';
                      const initialStart = (bStartStr && bStartStr >= todayDateStr) ? bStartStr : todayDateStr;
                      const initialEnd = (bEndStr && bEndStr >= initialStart) ? bEndStr : initialStart;

                      setClassForm(prev => ({
                        ...prev,
                        batchId: bId,
                        courseId: cId || prev.courseId,
                        tutorId: tId || prev.tutorId,
                        sessionType: b.mode || prev.sessionType,
                        startDate: initialStart,
                        endDate: initialEnd,
                        scheduledDate: initialStart,
                        startTime: b.startTime || prev.startTime,
                        endTime: b.endTime || prev.endTime
                      }));
                      setSelectedStudentUserIds(batchOnlineStudentUserIds);
                    }
                  }}
                  className="w-full text-xs font-semibold bg-white border border-purple-300 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="">-- No Batch (Custom Course & Student Selection) --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      🎓 {b.name} ({b.mode || 'ONLINE'}) — {b.totalStudents || b.studentIds?.length || 0} Students
                    </option>
                  ))}
                </select>

                {classForm.batchId && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold text-purple-800">
                      ⚡ Course, Tutor & Batch Students auto-selected from {selectedClassBatch?.name || 'Selected Batch'}.
                    </p>
                    {selectedBatchStartStr && selectedBatchEndStr && (
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-purple-900 bg-purple-100/70 px-2.5 py-1 rounded-lg border border-purple-200">
                        <span>📅 Batch Duration:</span>
                        <span className="font-mono">{selectedBatchStartStr} → {selectedBatchEndStr}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Class Title / Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Java – Collections / HashMap"
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Select Course / Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={classForm.courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Course / Domain</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Assign Tutor <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={classForm.tutorId}
                    onChange={(e) => setClassForm({ ...classForm, tutorId: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Tutor</option>
                    {tutors.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Starting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayDateStr}
                    value={classForm.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className={`w-full text-xs bg-white border rounded-xl px-2 py-2 font-semibold text-slate-800 focus:ring-2 focus:outline-none ${
                      isStartDateInPast || isDateOutOfBatchRange ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Ending Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={classForm.startDate || todayDateStr}
                    value={classForm.endDate}
                    onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
                    className={`w-full text-xs bg-white border rounded-xl px-2 py-2 font-semibold text-slate-800 focus:ring-2 focus:outline-none ${
                      isDateRangeInvalid || isDateOutOfBatchRange ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-purple-500'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="11:00 AM"
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-Day Schedule Days Selector */}
              {classForm.startDate && classForm.endDate && classForm.startDate !== classForm.endDate && (
                <div className="p-2.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-900">
                      🗓️ Days to Schedule in Range:
                    </span>
                    <div className="flex items-center space-x-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setClassForm(prev => ({ ...prev, selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }))}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold border border-purple-200 rounded hover:bg-purple-100 transition"
                      >
                        Mon–Fri
                      </button>
                      <button
                        type="button"
                        onClick={() => setClassForm(prev => ({ ...prev, selectedDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }))}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold border border-purple-200 rounded hover:bg-purple-100 transition"
                      >
                        All Days
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const isDaySelected = (classForm.selectedDays || []).includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setClassForm(prev => {
                              const current = prev.selectedDays || [];
                              const updated = isDaySelected
                                ? current.filter(d => d !== day)
                                : [...current, day];
                              return { ...prev, selectedDays: updated };
                            });
                          }}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                            isDaySelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-purple-50'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isDateRangeInvalid && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                  ⚠️ Ending Date cannot be earlier than Starting Date.
                </p>
              )}

              {isStartDateInPast && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                  ⚠️ Starting Date cannot be in the past.
                </p>
              )}

              {isDateOutOfBatchRange && (
                <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                  ⚠️ Class Date Range ({classForm.startDate} to {classForm.endDate}) must be within batch duration ({selectedBatchStartStr} to {selectedBatchEndStr}).
                </p>
              )}

              {/* Online Class Mandatory Meeting Link */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setClassForm(prev => ({ ...prev, meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(2,5)}-${Math.random().toString(36).substring(2,6)}-${Math.random().toString(36).substring(2,5)}` }))}
                    className="text-[10px] text-purple-600 font-bold hover:underline"
                  >
                    Generate Link
                  </button>
                </div>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/xyz-abc-123"
                  value={classForm.meetingLink}
                  onChange={(e) => setClassForm({ ...classForm, meetingLink: e.target.value })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Student Eligibility & Assignment Section */}
              <div className="space-y-2 pt-2 border-t border-purple-50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Assign Specific Students
                  </label>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                      Eligible Online Students: {eligibleOnlineStudents.length}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      Selected: {selectedStudentUserIds.length}
                    </span>
                  </div>
                </div>

                {/* Search & Bulk Action Bar */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    disabled={(!classForm.batchId && !classForm.courseId) || eligibleOnlineStudents.length === 0}
                    className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-slate-100 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleSelectAllEligible}
                    disabled={(!classForm.batchId && !classForm.courseId) || filteredStudentsToDisplay.length === 0}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    disabled={selectedStudentUserIds.length === 0}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition disabled:opacity-50"
                  >
                    Clear Selection
                  </button>
                </div>

                {/* Filtered Eligible Students List */}
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1 text-xs">
                  {(!classForm.batchId && !classForm.courseId) ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Please select a batch or course to view eligible online students.
                    </p>
                  ) : eligibleOnlineStudents.length === 0 ? (
                    <p className="text-xs text-amber-600 font-semibold py-4 text-center">
                      No online students available in this {classForm.batchId ? 'batch' : 'course'}.
                    </p>
                  ) : filteredStudentsToDisplay.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      No online students match your search.
                    </p>
                  ) : (
                    filteredStudentsToDisplay.map((st) => {
                      const uId = st.userId?._id;
                      if (!uId) return null;
                      const isSelected = selectedStudentUserIds.includes(uId);
                      return (
                        <label
                          key={st._id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                            isSelected
                              ? 'bg-purple-50 border-purple-300 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleStudentSelection(uId)}
                              className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{st.userId?.name}</span>
                              <span className="text-[10px] font-mono text-purple-600">@{st.userId?.username || 'user'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-mono block">{st.studentId}</span>
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">ONLINE</span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingClass}
                className="w-full py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{submittingClass ? 'Scheduling Class...' : 'SCHEDULE CLASS & NOTIFY'}</span>
              </button>
            </form>
          </div>

          {/* Scheduled Classes Ledger (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-purple-100/90 shadow-xs rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                Scheduled Classes Ledger
              </h2>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                {attendanceData.sessions?.length || 0} Total Sessions
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {(!attendanceData.sessions || attendanceData.sessions.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed border-purple-200/80 rounded-2xl bg-purple-50/20">
                  <Calendar className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">No scheduled classes yet</p>
                  <p className="text-xs text-slate-400 mt-1">Use the form on the left to schedule new online classes.</p>
                </div>
              ) : (
                attendanceData.sessions.map((sess) => {
                  const isOnline = sess.sessionType === 'ONLINE';
                  const assignedCount = sess.studentIds?.length || sess.attendance?.length || 0;
                  const tutorName = sess.tutorId?.name || 'Unassigned';

                  return (
                    <div key={sess._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-900">{sess.title}</span>
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            {sess.batchId?.name ? `🎓 Batch: ${sess.batchId.name}` : (assignedCount === 1 ? '👤 Single Student' : `👥 Class (${assignedCount})`)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            isOnline
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {sess.sessionType}
                          </span>
                          <button
                            onClick={() => handleDeleteSession(sess._id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Scheduled Class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                        <span>Date: <strong className="text-slate-700">{sess.scheduledDate}</strong></span>
                        {sess.startDate && sess.endDate && sess.startDate !== sess.endDate && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            Range: {sess.startDate} → {sess.endDate}
                          </span>
                        )}
                        <span>Time: <strong className="text-slate-700">{sess.startTime} – {sess.endTime}</strong></span>
                        <span>Tutor: <strong className="text-slate-700">{tutorName}</strong></span>
                        <span>Assigned: <strong className="text-purple-600">{assignedCount} {assignedCount === 1 ? 'Student' : 'Students'}</strong></span>
                      </div>

                      {isOnline ? (
                        <div className="text-[11px] font-mono text-purple-600 truncate bg-white px-2 py-1 rounded border border-slate-200">
                          🔗 {sess.meetingLink ? (
                            <a href={sess.meetingLink} target="_blank" rel="noreferrer" className="hover:underline">{sess.meetingLink}</a>
                          ) : 'No link configured'}
                        </div>
                      ) : (
                        <div className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded border border-slate-200">
                          📍 {sess.classroom || 'Institute Classroom'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE & LEAVE MANAGEMENT */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Pre-Class Leave Requests System Card */}
          <div className="bg-white border border-purple-100/90 shadow-xs rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
                  Student Approvals
                </span>
                <h2 className="text-base font-black text-slate-900">
                  Student Leave &amp; Pre-Class Absence Requests
                </h2>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                {attendanceData.leaveRequests?.length || 0} Total Requests
              </span>
            </div>

            {(!attendanceData.leaveRequests || attendanceData.leaveRequests.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No pending or submitted leave requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-purple-50/50 text-slate-700 font-bold border-b border-purple-100">
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Leave / Class Date</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {attendanceData.leaveRequests.map((lr) => (
                      <tr key={lr._id} className="hover:bg-purple-50/30 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{lr.studentId?.name || 'Student'}</span>
                          <span className="text-[10px] font-mono text-purple-600">{lr.studentId?.studentId || lr.studentId?.email}</span>
                          {lr.tutorName && (
                            <span className="text-[10px] text-purple-700 font-bold block">Tutor: {lr.tutorName}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <span className="font-bold block">{lr.sessionId?.scheduledDate}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{lr.sessionId?.startTime}</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          <span>{lr.reason}</span>
                          {lr.leaveType && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono ml-1.5 font-bold">
                              {lr.leaveType}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                          {lr.description || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            lr.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lr.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {lr.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5">
                          {lr.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleReviewLeave(lr._id, 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReviewLeave(lr._id, 'REJECTED')}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px] transition shadow-sm"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Absence Explanations Ledger */}
          <div className="bg-white border border-purple-100/90 shadow-xs rounded-3xl p-6 space-y-4">
            <div className="border-b border-purple-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
                Attendance Log
              </span>
              <h2 className="text-base font-black text-slate-900">
                Student Absence & Leave Reasons Log
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-purple-50/50 text-slate-700 font-bold border-b border-purple-100">
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Class Date</th>
                    <th className="py-2.5 px-3">Session Title</th>
                    <th className="py-2.5 px-3">Absence / Leave Reason</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {(attendanceData.sessions || []).flatMap(s =>
                    (s.attendance || [])
                      .filter(a => a.status === 'ABSENT' || a.status === 'LEAVE')
                      .map((att, idx) => (
                        <tr key={`${s._id}-${idx}`} className="hover:bg-purple-50/30 transition">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">{att.studentId?.name || 'Student'}</span>
                            <span className="text-[10px] font-mono text-purple-600">{att.studentId?.studentId || 'STU1001'}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{s.scheduledDate}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{s.title}</td>
                          <td className="py-2.5 px-3">
                            {att.absenceReason ? (
                              <span className="font-bold text-slate-800 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                                {att.absenceReason} {att.absenceDescription && `— "${att.absenceDescription}"`}
                              </span>
                            ) : (
                              <span className="text-amber-600 italic font-semibold">Reason pending submission</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {att.absenceSubmittedAt ? new Date(att.absenceSubmittedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT FEE MANAGEMENT */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <FeeManagementDashboard showHeader={false} />
        </div>
      )}

      {/* ATTENDANCE HISTORY MODAL */}
      {modalStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-white">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full border border-purple-200">
                    {modalStudent.studentId || modalStudent.userId?.studentId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    modalStudent.learningMode === 'OFFLINE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {modalStudent.learningMode || 'ONLINE'} Mode
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {modalStudent.userId?.name}'s Attendance Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Username: <strong className="font-mono text-slate-700">@{modalStudent.userId?.username || 'username'}</strong> • Email: {modalStudent.userId?.email}
                </p>
              </div>
              <button
                onClick={() => setModalStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-purple-100/60 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="p-5 border-b border-purple-100 grid grid-cols-4 gap-3 bg-white">
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Classes</span>
                <span className="text-lg font-black text-slate-900">{modalStudent.attendanceStats?.totalClasses || 0}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block">Present</span>
                <span className="text-lg font-black text-emerald-700">{modalStudent.attendanceStats?.present || 0}</span>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-center">
                <span className="text-[10px] font-bold uppercase text-red-600 block">Absent</span>
                <span className="text-lg font-black text-red-700">{modalStudent.attendanceStats?.absent || 0}</span>
              </div>
              <div className="bg-pink-50 p-3 rounded-xl border border-pink-200 text-center">
                <span className="text-[10px] font-bold uppercase text-pink-700 block">Attendance Rate</span>
                <span className="text-lg font-black text-pink-700">{modalStudent.attendancePercentage}%</span>
              </div>
            </div>

            {/* Attendance History Table */}
            <div className="p-5 overflow-y-auto flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Detailed Class-by-Class Attendance History
              </h4>
              {(!modalStudent.attendanceHistory || modalStudent.attendanceHistory.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No scheduled class records found for this student.</p>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2 px-2.5">Date & Time</th>
                      <th className="py-2 px-2.5">Class Topic</th>
                      <th className="py-2 px-2.5">Mode</th>
                      <th className="py-2 px-2.5">Status</th>
                      <th className="py-2 px-2.5">Notes / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalStudent.attendanceHistory.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 font-medium text-slate-700">
                          <span className="block font-bold">{h.scheduledDate}</span>
                          <span className="text-[10px] text-slate-400">{h.startTime} - {h.endTime}</span>
                        </td>
                        <td className="py-2 px-2.5 font-semibold text-slate-900">{h.title}</td>
                        <td className="py-2 px-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            h.sessionType === 'OFFLINE' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {h.sessionType}
                          </span>
                        </td>
                        <td className="py-2 px-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            h.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                            h.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                            h.status === 'LEAVE' ? 'bg-purple-100 text-purple-800' :
                            h.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-500">
                          {h.absenceReason ? `${h.absenceReason} ${h.absenceDescription ? `(${h.absenceDescription})` : ''}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setModalStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deleteTargetStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Student Account?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                {deleteTargetStudent.userId?.name || 'Student'} ({deleteTargetStudent.studentId || deleteTargetStudent.userId?.studentId || 'ID'})
              </div>
              <div className="text-slate-600 font-mono">
                Username: @{deleteTargetStudent.userId?.username || '—'}
              </div>
              <div className="text-slate-600">
                Email: {deleteTargetStudent.userId?.email || '—'}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this student? Their login credentials, LMS enrollment, attendance log, and progress metrics will be removed.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetStudent(null)}
                disabled={!!deletingStudentId}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndDeleteStudent}
                disabled={!!deletingStudentId}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                {deletingStudentId ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Student Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Details Modal */}
      {editTargetStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-purple-600">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">Edit Student Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditTargetStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.studentId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, studentId: e.target.value.toUpperCase() })}
                    className="w-full font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Username *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.username}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 lowercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.name}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editStudentForm.email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Mobile Phone</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={editStudentForm.phone}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-800 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Learning Mode</label>
                  <select
                    value={editStudentForm.learningMode}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, learningMode: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ONLINE">ONLINE Mode</option>
                    <option value="OFFLINE">OFFLINE Mode</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Enrolled Course / Domain</label>
                  <select
                    value={editStudentForm.courseId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, courseId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Assigned Tutor</label>
                  <select
                    value={editStudentForm.tutorId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, tutorId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Tutor</option>
                    {tutors.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block">Reset Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep existing password"
                    value={editStudentForm.password}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 pr-10 focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTargetStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStudent}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] rounded-xl shadow-lg shadow-purple-500/25 transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{updatingStudent ? 'Saving Changes...' : 'SAVE STUDENT CHANGES'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Batch Confirmation Modal */}
      {deleteTargetBatch && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 w-screen h-[100dvh] z-[99999] bg-black/60 backdrop-blur-[5px] flex items-center justify-center p-4"
          style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100dvh',
            backgroundColor: 'rgba(0, 0, 0, 0.60)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 99999
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingBatchId) {
              setDeleteTargetBatch(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Batch Confirmation</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">
                Are you sure you want to delete batch <span className="text-red-600 font-black">"{deleteTargetBatch.name}"</span> ({deleteTargetBatch.code})?
              </p>
              <p className="text-[11px] text-slate-500">
                Enrolled students will be safely unlinked from this batch. Student accounts and learning records will <strong>not</strong> be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetBatch(null)}
                disabled={!!deletingBatchId}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndDeleteBatch}
                disabled={!!deletingBatchId}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
              >
                {deletingBatchId ? (
                  <span>Deleting Batch...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Batch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Batch Details Modal */}
      {editTargetBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-purple-600">
                <Pencil className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900">Edit Batch Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditTargetBatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Batch Name *</label>
                  <input
                    type="text"
                    required
                    value={editBatchForm.name}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, name: e.target.value })}
                    className="w-full font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Batch Code *</label>
                  <input
                    type="text"
                    required
                    value={editBatchForm.code}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, code: e.target.value.toUpperCase() })}
                    className="w-full font-mono font-bold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Course / Domain</label>
                  <select
                    value={editBatchForm.courseId}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, courseId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Course / Domain</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Assign Tutor</label>
                  <select
                    value={editBatchForm.tutorId}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, tutorId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Tutor</option>
                    {tutors.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Mode</label>
                  <select
                    value={editBatchForm.mode}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, mode: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Start Date</label>
                  <input
                    type="date"
                    value={editBatchForm.startDate}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, startDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">End Date</label>
                  <input
                    type="date"
                    value={editBatchForm.endDate}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, endDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Class Start Time</label>
                  <input
                    type="text"
                    value={editBatchForm.startTime}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, startTime: e.target.value })}
                    className="w-full font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Class End Time</label>
                  <input
                    type="text"
                    value={editBatchForm.endTime}
                    onChange={(e) => setEditBatchForm({ ...editBatchForm, endTime: e.target.value })}
                    className="w-full font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Multi-Select Students in Edit Batch */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Assigned Students ({editBatchForm.studentIds.length})
                  </label>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Selected: {editBatchForm.studentIds.length} Students
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Search students to assign..."
                  value={editBatchStudentSearch}
                  onChange={(e) => setEditBatchStudentSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-purple-500"
                />

                <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
                  {students.filter(st => {
                    const u = st.userId || {};
                    const q = editBatchStudentSearch.toLowerCase();
                    return !q || (u.name || '').toLowerCase().includes(q) || (st.studentId || '').toLowerCase().includes(q);
                  }).map(st => {
                    const uId = (st.userId?._id || st._id)?.toString();
                    const isChecked = editBatchForm.studentIds.includes(uId);
                    return (
                      <label key={st._id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-100/70 transition cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setEditBatchForm(prev => ({
                                ...prev,
                                studentIds: isChecked
                                  ? prev.studentIds.filter(id => id !== uId)
                                  : [...prev.studentIds, uId]
                              }));
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{st.userId?.name}</span>
                            <span className="text-[10px] font-mono text-purple-600">{st.studentId || st.userId?.studentId}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{st.userId?.email}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditTargetBatch(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingBatch}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{updatingBatch ? 'Saving Changes...' : 'SAVE BATCH CHANGES'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD FEE MODAL */}
      <RecordPaymentModal
        isOpen={recordFeeModalOpen}
        onClose={() => {
          setRecordFeeModalOpen(false);
          setSelectedStudentForFee(null);
        }}
        studentData={selectedStudentForFee}
        onPaymentRecorded={() => {
          api.get('/lms/admin/students').then(res => {
            if (res.data?.success) setStudents(res.data.data || []);
          }).catch(console.error);
        }}
      />

      {/* STUDENT FEE HISTORY MODAL */}
      <StudentFeeHistoryModal
        isOpen={historyFeeModalOpen}
        onClose={() => {
          setHistoryFeeModalOpen(false);
          setSelectedStudentForFeeHistory(null);
        }}
        studentId={selectedStudentForFeeHistory}
      />
    </div>
  );
}
