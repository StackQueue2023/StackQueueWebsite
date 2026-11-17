import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import EmploymentBadge from '../../components/common/EmploymentBadge';
import CollegeTrainingSyllabusManager from '../../components/syllabus/CollegeTrainingSyllabusManager';
import CollegeFinancialManagementHub from '../../components/college/CollegeFinancialManagementHub';
import {
  GraduationCap, Building2, Users, BookOpen, Calendar, Clock, Plus,
  Search, FileText, CheckCircle2, XCircle, Download, Send, UserCheck,
  BarChart3, Layers, FileCheck, Mail, RefreshCw, AlertCircle, X, ChevronRight,
  Award, Upload, Eye, Check, Edit3, Trash2, AlertTriangle, MapPin, Phone, User,
  Lock, Unlock, Key, History, ShieldCheck, CheckSquare, Square, Copy, Save, Sparkles,
  TrendingUp
} from 'lucide-react';

export default function BatchAndCollegePage() {
  const navigate = useNavigate();
  const cachedCol = api.peekCache?.('/admin/colleges');
  const cachedBat = api.peekCache?.('/admin/batches?batchType=COLLEGE_TRAINING');
  const cachedCou = api.peekCache?.('/admin/domain-management/courses');
  const cachedTut = api.peekCache?.('/admin/tutors');

  const [colleges, setColleges] = useState(cachedCol?.data || []);
  const [batches, setBatches] = useState(cachedBat?.data || []);
  const [courses, setCourses] = useState(cachedCou?.data || []);
  const [tutors, setTutors] = useState(cachedTut?.data || []);
  const [loading, setLoading] = useState(!cachedCol && !cachedBat);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);

  // Partner Colleges Directory Modal state
  const [isPartnerCollegesModalOpen, setIsPartnerCollegesModalOpen] = useState(false);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [primaryView, setPrimaryView] = useState('financial-hub'); // 'financial-hub' | 'colleges-directory'

  // College Form state (Add & Edit)
  const [editingCollegeId, setEditingCollegeId] = useState(null);
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submittingCollege, setSubmittingCollege] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteCollegeModalOpen, setIsDeleteCollegeModalOpen] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState(null);
  const [deletingCollege, setDeletingCollege] = useState(false);

  // Toast Notification State
  const [toastNotification, setToastNotification] = useState(null);

  // Course Lifecycle & Reassignment states
  const [isAssignCourseModalOpen, setIsAssignCourseModalOpen] = useState(false);
  const [assignCourseForm, setAssignCourseForm] = useState({
    courseId: '',
    tutorId: '',
    mode: 'ONLINE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    studentUserIds: [],
    sendEmails: true
  });
  const [submittingAssignCourse, setSubmittingAssignCourse] = useState(false);
  const [assignedCredentialsResult, setAssignedCredentialsResult] = useState(null);

  const [isCompleteConfirmModalOpen, setIsCompleteConfirmModalOpen] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [submittingComplete, setSubmittingComplete] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);

  // Student Lifecycle Management States (Reset Password, Edit Student, Delete Confirmation)
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedStudentForPassword, setSelectedStudentForPassword] = useState(null);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [submittingPasswordReset, setSubmittingPasswordReset] = useState(false);
  const [generatedPasswordResult, setGeneratedPasswordResult] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState({
    studentUserId: '',
    studentId: '',
    name: '',
    department: 'CSE',
    academicYear: '1st Year',
    username: '',
    email: '',
    courseId: '',
    enrollmentStatus: 'ACTIVE',
    loginAccess: 'ACTIVE'
  });
  const [submittingStudentEdit, setSubmittingStudentEdit] = useState(false);

  // Password Management Inside Edit Modal
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [editModalAutoGenerate, setEditModalAutoGenerate] = useState(true);
  const [editModalCustomPassword, setEditModalCustomPassword] = useState('');
  const [editModalPasswordResult, setEditModalPasswordResult] = useState(null);
  const [editModalCopiedPassword, setEditModalCopiedPassword] = useState(false);
  const [submittingModalPasswordReset, setSubmittingModalPasswordReset] = useState(false);

  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(false);

  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [submittingStatusToggle, setSubmittingStatusToggle] = useState(false);

  // Batch Wizard State (4 Steps)
  const [batchStep, setBatchStep] = useState(1);

  // Step 1: Batch Info
  const [bName, setBName] = useState('');
  const [bCode, setBCode] = useState('');
  const [bAcademicYear, setBAcademicYear] = useState('1st Year');
  const [bCollegeId, setBCollegeId] = useState('');
  const [bDepartment, setBDepartment] = useState('CSE');
  const [bCourseId, setBCourseId] = useState('');
  const [bTrainerId, setBTrainerId] = useState('');
  const [bStartDate, setBStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [bEndDate, setBEndDate] = useState('');

  // Dynamic Department Management States
  const [collegeDepartments, setCollegeDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptForm, setNewDeptForm] = useState({ name: '', code: '', description: '' });
  const [addDeptTargetCollegeId, setAddDeptTargetCollegeId] = useState('');
  const [submittingDept, setSubmittingDept] = useState(false);

  const [isManageDeptModalOpen, setIsManageDeptModalOpen] = useState(false);
  const [manageDeptCollegeId, setManageDeptCollegeId] = useState('');
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [editingDeptForm, setEditingDeptForm] = useState({ name: '', code: '', description: '' });
  const [submittingEditDept, setSubmittingEditDept] = useState(false);
  const [deletingDeptId, setDeletingDeptId] = useState(null);
  const [deptSearchTerm, setDeptSearchTerm] = useState('');

  // Step 2: Schedule & Timings
  const [bSatInc, setBSatInc] = useState(false);
  const [bSunInc, setBSunInc] = useState(false);
  const [bTrainingDays, setBTrainingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [bStartTime, setBStartTime] = useState('09:00 AM');
  const [bEndTime, setBEndTime] = useState('04:30 PM');
  const [bBreakStart, setBBreakStart] = useState('01:00 PM');
  const [bBreakEnd, setBBreakEnd] = useState('02:00 PM');
  const [bDailyReportTime, setBDailyReportTime] = useState('18:00');
  const [bHolidays, setBHolidays] = useState([]);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayTitle, setNewHolidayTitle] = useState('');

  // Step 3: Contacts
  const [bGuideName, setBGuideName] = useState('');
  const [bGuideEmail, setBGuideEmail] = useState('');
  const [bPlacementEmail, setBPlacementEmail] = useState('');
  const [bHodName, setBHodName] = useState('');
  const [bHodEmail, setBHodEmail] = useState('');
  const [bTutorResumeUrl, setBTutorResumeUrl] = useState('');

  // Step 4: Student Import
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [submittingBatch, setSubmittingBatch] = useState(false);

  // Batch Details Drawer state
  const [batchDetails, setBatchDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Tutor Daily Update form state inside modal
  const [tutorTopic, setTutorTopic] = useState('');
  const [tutorActivity, setTutorActivity] = useState('');
  const [tutorNotes, setTutorNotes] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [triggeringReport, setTriggeringReport] = useState(false);

  // Edit Batch Modal State
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [editBatchForm, setEditBatchForm] = useState({
    name: '',
    code: '',
    department: 'CSE',
    academicYear: '1st Year',
    collegeId: '',
    courseId: '',
    trainerId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00 AM',
    endTime: '04:30 PM',
    breakStartTime: '01:00 PM',
    breakEndTime: '02:00 PM',
    trainingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    saturdayIncluded: false,
    sundayIncluded: false,
    collegeGuideName: '',
    collegeGuideEmail: '',
    hodName: '',
    hodEmail: '',
    placementOfficeEmail: '',
    dailyReportTime: '18:00',
    tutorResumeUrl: ''
  });
  const [submittingEditBatch, setSubmittingEditBatch] = useState(false);

  // Add Students Modal State
  const [isAddStudentsModalOpen, setIsAddStudentsModalOpen] = useState(false);
  const [addStudentsTab, setAddStudentsTab] = useState('select'); // 'select' | 'pdf'
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [loadingEligibleStudents, setLoadingEligibleStudents] = useState(false);
  const [addStudentsSearch, setAddStudentsSearch] = useState('');
  const [selectedStudentUserIdsToAdd, setSelectedStudentUserIdsToAdd] = useState([]);
  const [addStudentsPdfFile, setAddStudentsPdfFile] = useState(null);
  const [addStudentsPdfText, setAddStudentsPdfText] = useState('');
  const [pdfPreviewData, setPdfPreviewData] = useState(null);
  const [previewingPdf, setPreviewingPdf] = useState(false);
  const [submittingAppendStudents, setSubmittingAppendStudents] = useState(false);

  // Delete Batch Confirmation Modal State
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);

  useEffect(() => {
    const hasCached = api.peekCache?.('/admin/colleges') || api.peekCache?.('/admin/batches?batchType=COLLEGE_TRAINING');
    loadAllData(!!hasCached);
  }, []);

  // Lock outer page scrolling when any modal is open
  const isAnyModalActive = Boolean(
    isBatchModalOpen ||
    isEditBatchModalOpen ||
    isCollegeModalOpen ||
    isPartnerCollegesModalOpen ||
    isAddStudentsModalOpen ||
    isEditStudentModalOpen ||
    isAddDeptModalOpen ||
    isManageDeptModalOpen ||
    isAssignCourseModalOpen ||
    isHistoryModalOpen ||
    isResetPasswordModalOpen ||
    isDeleteStudentModalOpen ||
    isDeleteCollegeModalOpen ||
    isDeleteConfirmModalOpen ||
    isCompleteConfirmModalOpen ||
    statusConfirmTarget
  );

  useEffect(() => {
    if (isAnyModalActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [isAnyModalActive]);

  const loadAllData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [colRes, batchRes, courseRes, tutorRes] = await Promise.allSettled([
        api.get('/admin/colleges'),
        api.get('/admin/batches?batchType=COLLEGE_TRAINING'),
        api.get('/admin/domain-management/courses'),
        api.get('/admin/tutors')
      ]);

      if (colRes.status === 'fulfilled' && colRes.value?.data?.success) {
        const colData = colRes.value.data.data || [];
        setColleges(colData);
        if (colData.length > 0 && !bCollegeId) {
          setBCollegeId(colData[0]._id);
        }
      }
      if (batchRes.status === 'fulfilled' && batchRes.value?.data?.success) {
        setBatches(batchRes.value.data.data || []);
      }
      if (courseRes.status === 'fulfilled' && courseRes.value?.data?.success) {
        const courseData = courseRes.value.data.data || [];
        setCourses(courseData);
        if (courseData.length > 0 && !bCourseId) {
          setBCourseId(courseData[0].title);
        }
      }
      if (tutorRes.status === 'fulfilled' && tutorRes.value?.data?.success) {
        const tutorList = tutorRes.value.data.data || [];
        setTutors(tutorList);
        if (tutorList.length > 0 && !bTrainerId) {
          setBTrainerId(tutorList[0]._id || tutorList[0].userId);
        }
      }
    } catch (err) {
      console.error('Error loading page data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => setToastNotification(null), 3500);
  };

  // ─── Dynamic Department Management Handlers ─────────────────────────
  const fetchCollegeDepartments = async (colId, selectDeptCode = null) => {
    if (!colId) {
      setCollegeDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const res = await api.get(`/admin/departments?collegeId=${colId}`);
      if (res.data?.success) {
        const depts = res.data.data || [];
        setCollegeDepartments(depts);
        if (selectDeptCode) {
          setBDepartment(selectDeptCode);
        } else if (depts.length > 0) {
          // If current bDepartment is not present in this college's departments, default to first department
          const hasCurrent = depts.some(d => d.code === bDepartment || d.name === bDepartment);
          if (!hasCurrent) {
            setBDepartment(depts[0].code || depts[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    if (bCollegeId) {
      fetchCollegeDepartments(bCollegeId);
    } else {
      setCollegeDepartments([]);
    }
  }, [bCollegeId]);

  const handleDepartmentDropdownChange = (val) => {
    if (val === '__ADD_NEW_DEPT__') {
      openAddDepartmentModal(bCollegeId);
      return;
    }
    setBDepartment(val);
  };

  const openAddDepartmentModal = (targetColId = null) => {
    const effectiveColId = targetColId || bCollegeId || (editBatchModalOpen ? editBatchForm.collegeId : selectedCollegeId);
    if (!effectiveColId) {
      showToast('Please select a Partner College first before adding a department.', 'error');
      return;
    }
    setAddDeptTargetCollegeId(effectiveColId);
    setNewDeptForm({ name: '', code: '', description: '' });
    setIsAddDeptModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptForm.name.trim() || !addDeptTargetCollegeId) {
      showToast('Department Name and College are required.', 'error');
      return;
    }

    setSubmittingDept(true);
    try {
      const res = await api.post('/admin/departments', {
        collegeId: addDeptTargetCollegeId,
        name: newDeptForm.name.trim(),
        code: newDeptForm.code ? newDeptForm.code.trim().toUpperCase() : '',
        description: newDeptForm.description.trim()
      });

      if (res.data?.success) {
        const createdDept = res.data.data;
        showToast(res.data.message || `Department "${createdDept.name}" added successfully.`, 'success');
        setIsAddDeptModalOpen(false);
        setNewDeptForm({ name: '', code: '', description: '' });

        // Refresh and auto-select
        const deptCodeOrName = createdDept.code || createdDept.name;
        if (addDeptTargetCollegeId === bCollegeId) {
          await fetchCollegeDepartments(bCollegeId, deptCodeOrName);
        } else if (editBatchModalOpen && addDeptTargetCollegeId === editBatchForm.collegeId) {
          setEditBatchForm(prev => ({ ...prev, department: deptCodeOrName }));
          await fetchCollegeDepartments(addDeptTargetCollegeId);
        } else {
          await fetchCollegeDepartments(addDeptTargetCollegeId);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add department.', 'error');
    } finally {
      setSubmittingDept(false);
    }
  };

  const openManageDepartmentsModal = (colId = null) => {
    const effectiveColId = colId || bCollegeId || selectedCollegeId;
    if (!effectiveColId) {
      showToast('Please select a Partner College first.', 'error');
      return;
    }
    setManageDeptCollegeId(effectiveColId);
    setEditingDeptId(null);
    setDeptSearchTerm('');
    setIsManageDeptModalOpen(true);
    fetchCollegeDepartments(effectiveColId);
  };

  const handleStartEditDept = (dept) => {
    setEditingDeptId(dept._id);
    setEditingDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || ''
    });
  };

  const handleSaveEditDept = async (deptId) => {
    if (!editingDeptForm.name.trim()) {
      showToast('Department Name cannot be empty.', 'error');
      return;
    }

    setSubmittingEditDept(true);
    try {
      const res = await api.put(`/admin/departments/${deptId}`, {
        name: editingDeptForm.name.trim(),
        code: editingDeptForm.code ? editingDeptForm.code.trim().toUpperCase() : '',
        description: editingDeptForm.description.trim()
      });

      if (res.data?.success) {
        showToast('Department updated successfully.', 'success');
        setEditingDeptId(null);
        fetchCollegeDepartments(manageDeptCollegeId);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update department.', 'error');
    } finally {
      setSubmittingEditDept(false);
    }
  };

  const handleDeleteDept = async (deptId) => {
    const deptToDelete = collegeDepartments.find(d => d._id === deptId);
    if (!deptToDelete) return;

    if (!window.confirm(`Are you sure you want to delete department "${deptToDelete.name}" (${deptToDelete.code})?\n\nThis will remove it from the college's department catalog.`)) {
      return;
    }

    setDeletingDeptId(deptId);
    try {
      const res = await api.delete(`/admin/departments/${deptId}`);
      if (res.data?.success) {
        showToast(res.data.message || 'Department deleted successfully.', 'success');
        fetchCollegeDepartments(manageDeptCollegeId);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete department.', 'error');
    } finally {
      setDeletingDeptId(null);
    }
  };

  const resetCollegeForm = () => {
    setEditingCollegeId(null);
    setCollegeName('');
    setCollegeCode('');
    setCity('');
    setAddress('');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setIsActive(true);
  };

  const handleStartEditCollege = (college) => {
    setEditingCollegeId(college._id);
    setCollegeName(college.name || '');
    setCollegeCode(college.code || '');
    setCity(college.city || '');
    setAddress(college.address || '');
    setContactPerson(college.contactPerson || '');
    setContactEmail(college.contactEmail || '');
    setContactPhone(college.contactPhone || '');
    setIsActive(college.isActive !== undefined ? college.isActive : true);
    setIsCollegeModalOpen(true);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    setSubmittingCollege(true);
    try {
      const payload = {
        name: collegeName,
        code: collegeCode,
        city,
        address,
        contactPerson,
        contactEmail,
        contactPhone,
        isActive
      };
      let res;
      if (editingCollegeId) {
        res = await api.put(`/admin/colleges/${editingCollegeId}`, payload);
      } else {
        res = await api.post('/admin/colleges', payload);
      }

      if (res.data.success) {
        const savedCol = res.data.data;
        if (savedCol && savedCol._id) {
          setBCollegeId(savedCol._id);
        }
        setIsCollegeModalOpen(false);
        const isEdit = Boolean(editingCollegeId);
        resetCollegeForm();
        showToast(isEdit ? 'College details updated successfully.' : 'Partner college created successfully.', 'success');
        loadAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving college details.', 'error');
    } finally {
      setSubmittingCollege(false);
    }
  };

  const handleStartDeleteCollege = (college) => {
    setCollegeToDelete(college);
    setIsDeleteCollegeModalOpen(true);
  };

  const handleConfirmDeleteCollege = async () => {
    if (!collegeToDelete) return;
    setDeletingCollege(true);
    try {
      const res = await api.delete(`/admin/colleges/${collegeToDelete._id}?force=true`);
      if (res.data.success) {
        setIsDeleteCollegeModalOpen(false);
        if (selectedCollegeId === collegeToDelete._id) {
          setSelectedCollegeId(null);
          setCollegeFilter('ALL');
        }
        setCollegeToDelete(null);
        showToast('Partner college deleted successfully.', 'success');
        loadAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting partner college.', 'error');
    } finally {
      setDeletingCollege(false);
    }
  };

  const handleParseStudents = async (e) => {
    e.preventDefault();
    setParsingPdf(true);
    try {
      if (importFile) {
        const formData = new FormData();
        formData.append('file', importFile);
        const res = await api.post('/admin/batches/parse-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
          setParsedStudents(res.data.preview || []);
        }
      } else if (importText.trim()) {
        const res = await api.post('/admin/batches/parse-pdf', { rawText: importText });
        if (res.data.success) {
          setParsedStudents(res.data.preview || []);
        }
      } else {
        alert('Please upload a PDF or enter student roster text.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error parsing student file');
    } finally {
      setParsingPdf(false);
    }
  };

  const handleAddHoliday = () => {
    if (!newHolidayDate) return;
    setBHolidays([...bHolidays, { date: newHolidayDate, title: newHolidayTitle || 'Holiday' }]);
    setNewHolidayDate('');
    setNewHolidayTitle('');
  };

  const handleRemoveHoliday = (idx) => {
    setBHolidays(bHolidays.filter((_, i) => i !== idx));
  };

  const toggleDay = (day) => {
    if (bTrainingDays.includes(day)) {
      setBTrainingDays(bTrainingDays.filter(d => d !== day));
    } else {
      setBTrainingDays([...bTrainingDays, day]);
    }
  };

  const handleSatToggle = (val) => {
    setBSatInc(val);
    if (val && !bTrainingDays.includes('Saturday')) {
      setBTrainingDays([...bTrainingDays, 'Saturday']);
    } else if (!val) {
      setBTrainingDays(bTrainingDays.filter(d => d !== 'Saturday'));
    }
  };

  const handleSunToggle = (val) => {
    setBSunInc(val);
    if (val && !bTrainingDays.includes('Sunday')) {
      setBTrainingDays([...bTrainingDays, 'Sunday']);
    } else if (!val) {
      setBTrainingDays(bTrainingDays.filter(d => d !== 'Sunday'));
    }
  };

  const validateStep1 = () => {
    if (!bName.trim()) {
      alert('Please enter a Batch Name before proceeding.');
      return false;
    }
    if (!bCode.trim()) {
      alert('Please enter a Batch Code before proceeding.');
      return false;
    }
    if (!bCollegeId) {
      alert('Please select a Partner College before proceeding.');
      return false;
    }
    if (!bDepartment) {
      alert('Please select a Department before proceeding.');
      return false;
    }
    if (!bCourseId || !bCourseId.trim()) {
      alert('Please assign a Course before proceeding.');
      return false;
    }
    if (!bTrainerId || !bTrainerId.trim()) {
      alert('Please assign a Tutor / Trainer before proceeding.');
      return false;
    }
    return true;
  };

  const handleStepNavigation = (targetStep) => {
    if (targetStep <= batchStep) {
      setBatchStep(targetStep);
      return;
    }
    if (!validateStep1()) {
      return;
    }
    setBatchStep(targetStep);
  };

  const handleCreateFullBatch = async () => {
    if (!validateStep1()) {
      setBatchStep(1);
      return;
    }
    setSubmittingBatch(true);
    try {
      const validStudentsToSubmit = parsedStudents.filter(s => s.isValid);

      const payload = {
        name: bName,
        code: bCode,
        batchType: 'COLLEGE_TRAINING',
        academicYear: bAcademicYear,
        collegeId: bCollegeId,
        department: bDepartment,
        courseId: bCourseId,
        trainerId: bTrainerId,
        startDate: bStartDate,
        endDate: bEndDate,
        saturdayIncluded: bSatInc,
        sundayIncluded: bSunInc,
        trainingDays: bTrainingDays,
        startTime: bStartTime,
        endTime: bEndTime,
        breakStartTime: bBreakStart,
        breakEndTime: bBreakEnd,
        dailyReportTime: bDailyReportTime,
        holidays: bHolidays,
        collegeGuideName: bGuideName,
        collegeGuideEmail: bGuideEmail,
        placementOfficeEmail: bPlacementEmail,
        hodName: bHodName,
        hodEmail: bHodEmail,
        tutorResumeUrl: bTutorResumeUrl,
        students: validStudentsToSubmit
      };

      const res = await api.post('/admin/batches/create-full', payload);
      if (res.data.success) {
        alert(`Full Training Batch created successfully! Created ${res.data.createdStudents?.length || 0} student user accounts.`);
        setIsBatchModalOpen(false);
        resetBatchForm();
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating training batch cohort');
    } finally {
      setSubmittingBatch(false);
    }
  };

  const resetBatchForm = () => {
    setBatchStep(1);
    setBName('');
    setBCode('');
    setBAcademicYear('1st Year');
    setBDepartment('CSE');
    setBStartDate(new Date().toISOString().split('T')[0]);
    setBEndDate('');
    setBHolidays([]);
    setImportText('');
    setImportFile(null);
    setParsedStudents([]);
  };

  const openBatchDetails = async (id, initialTab = 'overview') => {
    setSelectedBatchId(id);
    setLoadingDetails(true);
    setActiveTab(initialTab);
    try {
      const res = await api.get(`/admin/batches/${id}/details`);
      if (res.data.success) {
        setBatchDetails(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching batch details:', err);
      showToast(err.response?.data?.message || err.message || 'Error fetching batch details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const refreshBatchDetails = async (id = selectedBatchId) => {
    if (!id) return;
    try {
      const res = await api.get(`/admin/batches/${id}/details`);
      if (res.data.success) {
        setBatchDetails(res.data.data);
      }
    } catch (err) {
      console.error('Error refreshing batch details:', err);
    }
  };

  const openAssignCourseModal = (studentId = null) => {
    if (!batchDetails?.batch) return;
    const allStudentIds = batchDetails.students ? batchDetails.students.map(s => s._id) : [];
    setAssignCourseForm({
      courseId: batchDetails.batch.courseId?._id || '',
      tutorId: batchDetails.batch.trainerId?._id || '',
      mode: batchDetails.batch.mode || 'ONLINE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      studentUserIds: studentId ? [studentId] : allStudentIds,
      sendEmails: true
    });
    setIsAssignCourseModalOpen(true);
  };

  const handleToggleStudentSelection = (sId) => {
    setAssignCourseForm(prev => {
      const exists = prev.studentUserIds.includes(sId);
      return {
        ...prev,
        studentUserIds: exists
          ? prev.studentUserIds.filter(id => id !== sId)
          : [...prev.studentUserIds, sId]
      };
    });
  };

  const handleSelectAllStudentsForCourse = () => {
    if (!batchDetails?.students) return;
    const allIds = batchDetails.students.map(s => s._id);
    setAssignCourseForm(prev => ({
      ...prev,
      studentUserIds: prev.studentUserIds.length === allIds.length ? [] : allIds
    }));
  };

  const handleSubmitAssignCourse = async (e) => {
    e.preventDefault();
    if (!assignCourseForm.courseId) {
      alert('Please select a course to assign.');
      return;
    }
    if (!assignCourseForm.studentUserIds || assignCourseForm.studentUserIds.length === 0) {
      alert('Please select at least one student to assign the course.');
      return;
    }

    setSubmittingAssignCourse(true);
    try {
      const payload = {
        courseId: assignCourseForm.courseId,
        collegeId: batchDetails.batch.collegeId?._id || batchDetails.batch.collegeId,
        tutorId: assignCourseForm.tutorId || batchDetails.batch.trainerId?._id,
        studentUserIds: assignCourseForm.studentUserIds,
        mode: assignCourseForm.mode,
        startDate: assignCourseForm.startDate,
        endDate: assignCourseForm.endDate || null,
        sendEmails: assignCourseForm.sendEmails
      };

      const res = await api.post(`/admin/batches/${batchDetails.batch._id}/assign-course`, payload);
      if (res.data.success) {
        setIsAssignCourseModalOpen(false);
        setAssignedCredentialsResult(res.data.assignedStudents || []);
        showToast(res.data.message || 'Course assigned successfully!');
        await refreshBatchDetails();
      }
    } catch (err) {
      console.error('Assign course error:', err);
      alert(err.response?.data?.message || 'Failed to assign course to batch students.');
    } finally {
      setSubmittingAssignCourse(false);
    }
  };

  const openStudentCompleteModal = (student, enrollment) => {
    setCompleteTarget({
      type: 'student',
      enrollmentId: enrollment.enrollmentId,
      studentId: student._id,
      studentName: student.name,
      courseName: enrollment.courseName,
      reason: 'Course officially marked COMPLETED by admin',
      remarks: ''
    });
    setIsCompleteConfirmModalOpen(true);
  };

  const openBatchCompleteModal = () => {
    if (!batchDetails?.batch) return;
    setCompleteTarget({
      type: 'batch',
      courseId: batchDetails.batch.courseId?._id,
      courseName: batchDetails.batch.courseId?.title || batchDetails.batch.name,
      reason: 'Batch officially completed course curriculum',
      remarks: ''
    });
    setIsCompleteConfirmModalOpen(true);
  };

  const handleConfirmCompleteCourse = async () => {
    if (!completeTarget) return;
    setSubmittingComplete(true);
    try {
      if (completeTarget.type === 'student') {
        const res = await api.post(`/admin/batches/${batchDetails.batch._id}/enrollments/${completeTarget.enrollmentId}/complete`, {
          completionReason: completeTarget.reason || 'Course officially completed for student',
          tutorRemarks: completeTarget.remarks || ''
        });
        if (res.data.success) {
          showToast(`Course completed for ${completeTarget.studentName}. Login access deactivated.`);
          setIsCompleteConfirmModalOpen(false);
          await refreshBatchDetails();
        }
      } else {
        const res = await api.post(`/admin/batches/${batchDetails.batch._id}/complete-course`, {
          courseId: completeTarget.courseId,
          completionReason: completeTarget.reason || 'Batch officially completed course'
        });
        if (res.data.success) {
          showToast(res.data.message || 'Batch course marked COMPLETED. All student credentials deactivated.');
          setIsCompleteConfirmModalOpen(false);
          await refreshBatchDetails();
        }
      }
    } catch (err) {
      console.error('Complete course error:', err);
      alert(err.response?.data?.message || 'Failed to mark course as completed.');
    } finally {
      setSubmittingComplete(false);
    }
  };

  const openHistoryModal = (student) => {
    setSelectedHistoryStudent(student);
    setIsHistoryModalOpen(true);
  };

  const handleSaveTutorUpdate = async (e) => {
    e.preventDefault();
    if (!batchDetails?.batch?._id || !tutorTopic) return;
    setSavingUpdate(true);
    try {
      const res = await api.post('/admin/batches/tutor-daily-update', {
        batchId: batchDetails.batch._id,
        topicCovered: tutorTopic,
        practicalActivity: tutorActivity,
        notes: tutorNotes
      });
      if (res.data.success) {
        alert('Daily teaching update logged successfully!');
        setTutorTopic('');
        setTutorActivity('');
        setTutorNotes('');
        openBatchDetails(batchDetails.batch._id);
      }
    } catch (err) {
      alert('Error saving daily teaching update');
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleTriggerManualReport = async () => {
    if (!batchDetails?.batch?._id) return;
    setTriggeringReport(true);
    try {
      const res = await api.post(`/admin/batches/${batchDetails.batch._id}/generate-report`, {});
      if (res.data.success) {
        alert('Daily Report PDF generated & automated email dispatched!');
        openBatchDetails(batchDetails.batch._id);
      }
    } catch (err) {
      alert('Error generating report: ' + (err.response?.data?.message || err.message));
    } finally {
      setTriggeringReport(false);
    }
  };

  // Handle open Edit Batch Modal
  const openEditBatchModal = () => {
    if (!batchDetails?.batch) return;
    const b = batchDetails.batch;
    const colId = b.collegeId?._id || b.collegeId || '';
    if (colId) {
      fetchCollegeDepartments(colId);
    }
    setEditBatchForm({
      name: b.name || '',
      code: b.code || '',
      department: b.department || 'CSE',
      academicYear: b.academicYear || '1st Year',
      collegeId: b.collegeId?._id || b.collegeId || '',
      courseId: b.courseId?._id || b.courseId || '',
      trainerId: b.trainerId?._id || b.trainerId || '',
      startDate: b.startDate ? b.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: b.endDate ? b.endDate.split('T')[0] : '',
      startTime: b.startTime || '09:00 AM',
      endTime: b.endTime || '04:30 PM',
      breakStartTime: b.breakStartTime || '01:00 PM',
      breakEndTime: b.breakEndTime || '02:00 PM',
      trainingDays: b.trainingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      saturdayIncluded: Boolean(b.saturdayIncluded),
      sundayIncluded: Boolean(b.sundayIncluded),
      collegeGuideName: b.collegeGuideName || '',
      collegeGuideEmail: b.collegeGuideEmail || '',
      hodName: b.hodName || '',
      hodEmail: b.hodEmail || '',
      placementOfficeEmail: b.placementOfficeEmail || '',
      dailyReportTime: b.dailyReportTime || '18:00',
      tutorResumeUrl: b.tutorResumeUrl || ''
    });
    setIsEditBatchModalOpen(true);
  };

  // Submit Edit Batch Form
  const handleSaveEditBatch = async (e) => {
    e.preventDefault();
    if (!batchDetails?.batch?._id) return;
    setSubmittingEditBatch(true);
    try {
      const res = await api.put(`/admin/batches/${batchDetails.batch._id}`, editBatchForm);
      if (res.data.success) {
        alert(res.data.message || 'Batch information updated successfully!');
        setIsEditBatchModalOpen(false);
        openBatchDetails(batchDetails.batch._id);
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update batch information.');
    } finally {
      setSubmittingEditBatch(false);
    }
  };

  // Handle open Add Students Modal
  const openAddStudentsModal = async () => {
    if (!batchDetails?.batch) return;
    setIsAddStudentsModalOpen(true);
    setAddStudentsTab('select');
    setSelectedStudentUserIdsToAdd([]);
    setAddStudentsPdfFile(null);
    setAddStudentsPdfText('');
    setPdfPreviewData(null);
    setLoadingEligibleStudents(true);
    try {
      const res = await api.get('/admin/batches/eligible-students');
      if (res.data.success) {
        setEligibleStudents(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching eligible students:', err);
    } finally {
      setLoadingEligibleStudents(false);
    }
  };

  // Handle Preview PDF Import
  const handlePreviewPdfImport = async (e) => {
    e.preventDefault();
    if (!batchDetails?.batch?._id) return;
    if (!addStudentsPdfFile && !addStudentsPdfText.trim()) {
      alert('Please upload a PDF file or enter raw text.');
      return;
    }
    setPreviewingPdf(true);
    try {
      let res;
      if (addStudentsPdfFile) {
        const formData = new FormData();
        formData.append('file', addStudentsPdfFile);
        res = await api.post(`/admin/batches/${batchDetails.batch._id}/preview-pdf`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post(`/admin/batches/${batchDetails.batch._id}/preview-pdf`, {
          rawText: addStudentsPdfText
        });
      }

      if (res.data.success) {
        setPdfPreviewData(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error parsing PDF preview.');
    } finally {
      setPreviewingPdf(false);
    }
  };

  // Handle Submit Append Students (from select or PDF preview)
  const handleConfirmAppendStudents = async () => {
    if (!batchDetails?.batch?._id) return;

    let selectedExistingUserIds = [];
    let newStudentsToCreate = [];

    if (addStudentsTab === 'select') {
      selectedExistingUserIds = selectedStudentUserIdsToAdd;
      if (selectedExistingUserIds.length === 0) {
        alert('Please select at least one student to add.');
        return;
      }
    } else if (addStudentsTab === 'pdf') {
      if (!pdfPreviewData) {
        alert('Please preview the PDF before importing.');
        return;
      }
      const previewList = pdfPreviewData.preview || [];
      previewList.forEach(item => {
        if (item.statusTag === 'EXISTS_IN_DB' && item.userId) {
          selectedExistingUserIds.push(item.userId);
        } else if (item.statusTag === 'NEW') {
          newStudentsToCreate.push({
            name: item.name,
            email: item.email,
            department: item.department,
            academicYear: item.academicYear
          });
        }
      });

      if (selectedExistingUserIds.length === 0 && newStudentsToCreate.length === 0) {
        alert('No new or eligible students to import from this PDF preview.');
        return;
      }
    }

    setSubmittingAppendStudents(true);
    try {
      const res = await api.post(`/admin/batches/${batchDetails.batch._id}/append-students`, {
        selectedExistingUserIds,
        newStudentsToCreate
      });

      if (res.data.success) {
        alert(res.data.message || 'Students added to batch successfully!');
        setIsAddStudentsModalOpen(false);
        openBatchDetails(batchDetails.batch._id);
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add students to batch.');
    } finally {
      setSubmittingAppendStudents(false);
    }
  };

  // Handle Safe Batch Deletion
  const handleConfirmDeleteBatch = async () => {
    if (!batchDetails?.batch?._id) return;
    setDeletingBatch(true);
    try {
      const res = await api.delete(`/admin/batches/${batchDetails.batch._id}`);
      if (res.data.success) {
        alert(res.data.message || 'Batch deleted successfully.');
        setIsDeleteConfirmModalOpen(false);
        setSelectedBatchId(null);
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete batch.');
    } finally {
      setDeletingBatch(false);
    }
  };

  // ─── Student Lifecycle Handlers (Password, Edit, Delete) ─────────
  const openResetPasswordModal = (student) => {
    setSelectedStudentForPassword(student);
    setCustomPasswordInput('');
    setAutoGeneratePassword(true);
    setGeneratedPasswordResult(null);
    setCopiedPassword(false);
    setIsResetPasswordModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentForPassword?._id || !batchDetails?.batch?._id) return;

    if (!autoGeneratePassword && (!customPasswordInput || customPasswordInput.length < 6)) {
      showToast('Custom password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmittingPasswordReset(true);
    try {
      const res = await api.post(
        `/admin/batches/${batchDetails.batch._id}/students/${selectedStudentForPassword._id}/reset-password`,
        {
          customPassword: autoGeneratePassword ? '' : customPasswordInput.trim()
        }
      );

      if (res.data?.success) {
        setGeneratedPasswordResult(res.data.temporaryPassword);
        showToast('Temporary password generated successfully.', 'success');
        refreshBatchDetails();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset student password.', 'error');
    } finally {
      setSubmittingPasswordReset(false);
    }
  };

  const openEditStudentModal = (student) => {
    const courseIdVal = student.activeEnrollment?.courseId?._id || student.activeEnrollment?.courseId || batchDetails?.batch?.courseId?._id || '';
    const initialAccess = student.loginAccessStatus
      ? student.loginAccessStatus === 'ACTIVE'
      : (student.isActive !== false && (!student.activeEnrollment || student.activeEnrollment.accountStatus === 'ACTIVE'));
    const accessStr = initialAccess ? 'ACTIVE' : 'DEACTIVE';

    setEditStudentForm({
      studentUserId: student._id,
      studentId: student.studentId || '',
      name: student.name || '',
      department: student.department || batchDetails?.batch?.department || 'CSE',
      academicYear: student.academicYear || batchDetails?.batch?.academicYear || '1st Year',
      username: student.activeEnrollment?.courseUsername || student.username || '',
      email: student.email || '',
      courseId: courseIdVal,
      enrollmentStatus: student.enrollmentStatus || (student.activeEnrollment ? 'ACTIVE' : 'PENDING'),
      loginAccess: accessStr,
      _originalLoginAccess: accessStr
    });

    // Reset password management sub-state inside Edit modal
    setShowPasswordSection(false);
    setEditModalAutoGenerate(true);
    setEditModalCustomPassword('');
    setEditModalPasswordResult(null);
    setEditModalCopiedPassword(false);
    setSubmittingModalPasswordReset(false);

    setIsEditStudentModalOpen(true);
  };

  const handleModalResetPasswordSubmit = async () => {
    if (!editStudentForm.studentUserId || !batchDetails?.batch?._id) return;

    if (!editModalAutoGenerate && (!editModalCustomPassword || editModalCustomPassword.length < 6)) {
      showToast('Custom password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmittingModalPasswordReset(true);
    try {
      const res = await api.post(
        `/admin/batches/${batchDetails.batch._id}/students/${editStudentForm.studentUserId}/reset-password`,
        {
          customPassword: editModalAutoGenerate ? '' : editModalCustomPassword.trim()
        }
      );

      if (res.data?.success) {
        setEditModalPasswordResult(res.data.temporaryPassword);
        showToast('Temporary password generated successfully.', 'success');
        refreshBatchDetails();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset student password.', 'error');
    } finally {
      setSubmittingModalPasswordReset(false);
    }
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    if (!editStudentForm.studentUserId || !batchDetails?.batch?._id) return;

    if (editStudentForm.loginAccess === 'DEACTIVE' && editStudentForm._originalLoginAccess === 'ACTIVE') {
      const confirmDeactive = window.confirm(
        `Are you sure you want to deactivate login access for ${editStudentForm.name} (${editStudentForm.studentId})?\n\nThis will immediately revoke all active login sessions and block access to STACK QUEUE. Student records and progress will be preserved.`
      );
      if (!confirmDeactive) return;
    }

    setSubmittingStudentEdit(true);
    try {
      const res = await api.put(
        `/admin/batches/${batchDetails.batch._id}/students/${editStudentForm.studentUserId}`,
        editStudentForm
      );

      if (res.data?.success) {
        showToast('Student details updated successfully.', 'success');
        setIsEditStudentModalOpen(false);
        refreshBatchDetails();
        loadAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update student details.', 'error');
    } finally {
      setSubmittingStudentEdit(false);
    }
  };

  const openStatusToggleModal = (student, targetStatus) => {
    const isCurrentlyActive = student.loginAccessStatus
      ? student.loginAccessStatus === 'ACTIVE'
      : (student.isActive !== false && (!student.activeEnrollment || student.activeEnrollment.accountStatus === 'ACTIVE'));
    const next = targetStatus || (isCurrentlyActive ? 'DEACTIVE' : 'ACTIVE');
    setStatusConfirmTarget({
      studentUserId: student._id,
      studentName: student.name,
      studentId: student.studentId || 'N/A',
      nextStatus: next
    });
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirmTarget?.studentUserId || !batchDetails?.batch?._id) return;

    setSubmittingStatusToggle(true);
    try {
      const res = await api.patch(
        `/admin/batches/${batchDetails.batch._id}/students/${statusConfirmTarget.studentUserId}/status`,
        { status: statusConfirmTarget.nextStatus }
      );

      if (res.data?.success) {
        showToast(res.data.message || `Student account status updated to ${statusConfirmTarget.nextStatus}.`, 'success');
        setStatusConfirmTarget(null);
        refreshBatchDetails();
        loadAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update student status.', 'error');
    } finally {
      setSubmittingStatusToggle(false);
    }
  };

  const openDeleteStudentModal = (student) => {
    setStudentToDelete({
      studentUserId: student._id,
      studentName: student.name,
      studentId: student.studentId || 'N/A'
    });
    setIsDeleteStudentModalOpen(true);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete?.studentUserId || !batchDetails?.batch?._id) return;

    setDeletingStudent(true);
    try {
      const res = await api.delete(
        `/admin/batches/${batchDetails.batch._id}/students/${studentToDelete.studentUserId}`
      );

      if (res.data?.success) {
        showToast(res.data.message || 'Student removed from batch successfully.', 'success');
        setIsDeleteStudentModalOpen(false);
        setStudentToDelete(null);
        refreshBatchDetails();
        loadAllData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove student.', 'error');
    } finally {
      setDeletingStudent(false);
    }
  };

  // Handle Single Student Removal from Batch (fallback)
  const handleRemoveStudentFromBatch = async (studentUserId, studentName) => {
    openDeleteStudentModal({ _id: studentUserId, name: studentName, studentId: 'N/A' });
  };

  // Selected College Object
  const selectedCollege = selectedCollegeId
    ? colleges.find(c => c._id === selectedCollegeId || c._id?.toString() === selectedCollegeId?.toString())
    : null;

  // Helper to get batches for a college
  const getBatchesForCollege = (collegeId) => {
    if (!collegeId) return [];
    const cidStr = collegeId._id ? collegeId._id.toString() : collegeId.toString();
    return batches.filter(b => {
      const bCid = b.collegeId?._id ? b.collegeId._id.toString() : (b.collegeId ? b.collegeId.toString() : '');
      return bCid === cidStr;
    });
  };

  const getStudentsCountForCollege = (col) => {
    const cBatches = getBatchesForCollege(col._id);
    const fromBatches = cBatches.reduce((acc, b) => acc + (b.totalStudents || 0), 0);
    return Math.max(fromBatches, col.studentsCount || 0);
  };

  const getCoursesForCollege = (col) => {
    const cBatches = getBatchesForCollege(col._id);
    const courseSet = new Set(col.assignedCourses || []);
    cBatches.forEach(b => {
      if (b.courseId?.title) courseSet.add(b.courseId.title);
      else if (b.courseId?.name) courseSet.add(b.courseId.name);
      else if (b.department) courseSet.add(b.department);
    });
    return Array.from(courseSet);
  };

  // Filtered Colleges (Level 1 view)
  const filteredColleges = colleges.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q) ||
      (c.contactPerson || '').toLowerCase().includes(q) ||
      (c.contactEmail || '').toLowerCase().includes(q)
    );
  });

  // Filtered Batches for selected college (Level 2 view)
  const collegeBatches = selectedCollegeId ? getBatchesForCollege(selectedCollegeId) : batches;
  const filteredBatches = collegeBatches.filter(b => {
    const matchesSearch = (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.courseId?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.trainerId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (b.status || 'active').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="bg-white absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="bg-white inline-flex items-center space-x-2 text-blue-800 font-mono text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full border border-blue-200/80 shadow-2xs">
              <GraduationCap className="w-4 h-4 text-blue-800" />
              <span>College Training Batches</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">College Training Batches</h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Manage university partnerships, student PDF imports, username generation, training schedules, daily topic updates, and automated daily PDF email reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admin/training-performance')}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md shadow-purple-500/20 cursor-pointer"
              title="Open Training Performance Dashboard"
            >
              <TrendingUp className="w-4 h-4 text-white" />
              <span>Training Performance</span>
            </button>
            <button
              onClick={() => {
                resetCollegeForm();
                setIsCollegeModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white hover:bg-white text-purple-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-800" />
              <span>Add College</span>
            </button>
            <button
              onClick={() => {
                resetBatchForm();
                setIsBatchModalOpen(true);
              }}
              className="bg-white px-5 py-2.5 text-blue-700 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-purple-500/25 cursor-pointer border border-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>Create Training Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => {
            setSelectedCollegeId(null);
            setCollegeFilter('ALL');
            setSearchTerm('');
          }}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-200 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view all partner colleges"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-800 transition">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Partner Colleges</span>
              <h3 className="text-2xl font-black text-slate-900">{colleges.length}</h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-800 group-hover:translate-x-1 transition-all" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Batches</span>
            <h3 className="text-2xl font-black text-slate-900">{batches.length}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-violet-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</span>
            <h3 className="text-2xl font-black text-slate-900">
              {batches.reduce((acc, b) => acc + (b.totalStudents || 0), 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-amber-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Courses</span>
            <h3 className="text-2xl font-black text-slate-900">{courses.length}</h3>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER: FINANCIAL & BATCH SYSTEM vs PARTNER COLLEGES DIRECTORY */}
      <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setPrimaryView('financial-hub');
              setSelectedCollegeId(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              primaryView === 'financial-hub'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>College Training & Financial System</span>
          </button>
          <button
            type="button"
            onClick={() => setPrimaryView('colleges-directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              primaryView === 'colleges-directory'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Partner Colleges Directory ({colleges.length})</span>
          </button>
        </div>
      </div>

      {primaryView === 'financial-hub' ? (
        <CollegeFinancialManagementHub
          onOpenCreateBatch={() => {
            resetBatchForm();
            setIsBatchModalOpen(true);
          }}
          onOpenAddCollege={() => {
            resetCollegeForm();
            setIsCollegeModalOpen(true);
          }}
          onSelectBatchDetails={(b) => {
            openBatchDetails(b._id, 'overview');
          }}
        />
      ) : (
        <>
          {/* VIEW LEVEL 1: ALL PARTNER COLLEGES */}
          {!selectedCollegeId ? (
        <div className="space-y-6">
          {/* Filter & Search Bar for Colleges */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search partner colleges by name, code, location, or contact..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Jump to College:</span>
                <select
                  value={collegeFilter}
                  onChange={e => {
                    const val = e.target.value;
                    setCollegeFilter(val);
                    if (val !== 'ALL') {
                      setSelectedCollegeId(val);
                      setSearchTerm('');
                    }
                  }}
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">All Partner Colleges ({colleges.length})</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetCollegeForm();
                  setIsCollegeModalOpen(true);
                }}
                className="px-3.5 py-2 bg-white hover:bg-white text-blue-800 border border-blue-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-blue-800" />
                <span>Add College</span>
              </button>
            </div>
          </div>

          {/* Partner Colleges Grid Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-blue-800" />
                  <span>Partner Colleges ({filteredColleges.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click on any partner college to view and manage all training batches conducted for that institution.
                </p>
              </div>
            </div>

            {filteredColleges.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Partner College Found</h3>
                <p className="text-slate-500 text-xs">
                  {searchTerm ? 'No colleges matched your search query.' : 'Add your first partner institution to start assigning training batches.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetCollegeForm();
                    setIsCollegeModalOpen(true);
                  }}
                  className="bg-white mt-2 inline-flex items-center space-x-2 px-4 py-2 text-blue-700 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer border border-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Partner College</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredColleges.map(col => {
                  const colBatches = getBatchesForCollege(col._id);
                  const colStudents = getStudentsCountForCollege(col);
                  const colCourses = getCoursesForCollege(col);

                  return (
                    <div
                      key={col._id}
                      onClick={() => {
                        setSelectedCollegeId(col._id);
                        setCollegeFilter(col._id);
                        setSearchTerm('');
                      }}
                      className="bg-white border border-slate-200 hover:border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between cursor-pointer group"
                    >
                      <div className="space-y-3">
                        {/* Top: Code, Status & Quick Action Buttons */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200 uppercase">
                              {col.code || 'COLLEGE'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ col.isActive !== false ? 'bg-white text-emerald-700 border border-emerald-200' : 'bg-white text-slate-600' }`}>
                              {col.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              title="Edit College"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditCollege(col);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-800 hover:bg-white rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Delete College"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartDeleteCollege(col);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* College Name & Location */}
                        <div>
                          <h3 className="text-base font-black text-slate-900 group-hover:text-[#0F172A] transition">
                            {col.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{col.address ? `${col.address}, ${col.city}` : (col.city || 'Location N/A')}</span>
                          </p>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-white rounded-xl p-2.5 text-xs text-slate-600 space-y-1 font-medium border border-slate-100">
                          <p className="flex items-center space-x-1.5 truncate">
                            <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="text-slate-400">Contact:</span>
                            <span className="font-semibold text-slate-800 truncate">{col.contactPerson || 'N/A'}</span>
                          </p>
                          {col.contactEmail && (
                            <p className="flex items-center space-x-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span className="text-slate-400">Email:</span>
                              <span className="font-mono text-slate-700 truncate">{col.contactEmail}</span>
                            </p>
                          )}
                          {col.contactPhone && (
                            <p className="flex items-center space-x-1.5">
                              <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                              <span className="text-slate-400">Phone:</span>
                              <span className="font-mono text-slate-700">{col.contactPhone}</span>
                            </p>
                          )}
                        </div>

                        {/* Assigned Courses Tags */}
                        {colCourses.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Courses:</span>
                            <div className="flex flex-wrap gap-1">
                              {colCourses.slice(0, 3).map((crs, cIdx) => (
                                <span key={cIdx} className="px-2 py-0.5 bg-white text-blue-800 border border-blue-200 rounded-md text-[10px] font-semibold truncate max-w-[140px]">
                                  {crs}
                                </span>
                              ))}
                              {colCourses.length > 3 && (
                                <span className="px-1.5 py-0.5 bg-white text-slate-600 rounded-md text-[10px] font-bold">
                                  +{colCourses.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Metrics & View Trainings Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1 font-bold text-slate-700">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-800" />
                            <span className="text-blue-800 font-mono">{colBatches.length}</span>
                            <span className="text-[11px] text-slate-500 font-normal">Batches</span>
                          </span>
                          <span className="flex items-center space-x-1 font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-mono">{colStudents}</span>
                            <span className="text-[11px] text-slate-500 font-normal">Students</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCollegeId(col._id);
                            setCollegeFilter(col._id);
                            setSearchTerm('');
                          }}
                          className="bg-white px-3.5 py-1.5 text-blue-700 rounded-xl font-bold flex items-center space-x-1 transition shadow-sm text-xs group-hover:shadow-md shrink-0 cursor-pointer border border-blue-600"
                        >
                          <span>View Trainings</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VIEW LEVEL 2: TRAINING BATCHES OF SELECTED COLLEGE */
        <div className="space-y-6">
          {/* Breadcrumb & College Details Header Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCollegeId(null);
                    setCollegeFilter('ALL');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-800 hover:text-purple-900 transition mb-1 cursor-pointer group"
                >
                  <span className="text-purple-500 group-hover:-translate-x-0.5 transition-transform">←</span>
                  <span>Back to All Partner Colleges</span>
                </button>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white text-purple-800 border border-blue-200 uppercase">
                    {selectedCollege?.code || 'COLLEGE'}
                  </span>
                  <h2 className="text-xl font-black text-slate-900">{selectedCollege?.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-emerald-700 border border-emerald-200">
                    {selectedCollege?.city || 'Partner Institute'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedCollege?.address ? `${selectedCollege.address}, ${selectedCollege.city}` : (selectedCollege?.city || 'Location N/A')}</span>
                  {selectedCollege?.contactPerson && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>Contact: <strong>{selectedCollege.contactPerson}</strong></span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    resetBatchForm();
                    setBCollegeId(selectedCollegeId);
                    setIsBatchModalOpen(true);
                  }}
                  className="bg-white px-4 py-2.5 text-blue-700 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md cursor-pointer border border-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Training Batch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar for this College's Batches */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search batches in ${selectedCollege?.name || 'college'}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Switch College:</span>
                <select
                  value={selectedCollegeId || 'ALL'}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'ALL') {
                      setSelectedCollegeId(null);
                      setCollegeFilter('ALL');
                    } else {
                      setSelectedCollegeId(val);
                      setCollegeFilter(val);
                    }
                    setSearchTerm('');
                  }}
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">← All Partner Colleges</option>
                  {colleges.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Batches Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-800" />
                <span>Training Batches at {selectedCollege?.name} ({filteredBatches.length})</span>
              </h3>
            </div>

            {filteredBatches.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Training Batch Available for this College</h4>
                <p className="text-slate-500 text-xs">
                  Create a training batch to assign courses, tutor, student PDF rosters, and automated daily PDF email reports.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetBatchForm();
                    setBCollegeId(selectedCollegeId);
                    setIsBatchModalOpen(true);
                  }}
                  className="bg-white mt-2 inline-flex items-center space-x-2 px-4 py-2 text-blue-700 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer border border-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create College Training Batch</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map(b => (
                  <div
                    key={b._id}
                    onClick={() => openBatchDetails(b._id)}
                    className="bg-white border border-slate-200 hover:border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200 uppercase">
                            {b.code}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base mt-1 group-hover:text-[#0F172A] transition">{b.name}</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-emerald-700 border border-emerald-200">
                          {b.status || 'Active'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 font-medium border-t border-slate-100 pt-3">
                        <p className="flex items-center space-x-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.collegeId?.name || selectedCollege?.name || 'Partner Institute'}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.courseId?.title || 'Assigned Course'}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tutor: {b.trainerId?.name || 'Assigned Tutor'}</span>
                        </p>
                        <p className="flex items-center space-x-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Year & Dept: {b.academicYear || '1st Year'} ({b.department || 'CSE'})</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Students: </span>
                        <span className="font-bold text-slate-900">{b.totalStudents || 0}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/training-performance?batchId=${b._id}&collegeId=${b.collegeId?._id || b.collegeId || selectedCollegeId || ''}`);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 text-indigo-700 rounded-lg font-bold flex items-center space-x-1 transition text-[11px] cursor-pointer border border-indigo-200"
                          title="Open Training Performance"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Performance</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBatchDetails(b._id, 'modules');
                          }}
                          className="bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 text-purple-700 rounded-lg font-bold flex items-center space-x-1 transition text-[11px] cursor-pointer border border-purple-200"
                          title="Manage Syllabus & Generated Modules"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                          <span>Syllabus & Modules</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBatchDetails(b._id);
                          }}
                          className="bg-white px-3 py-1.5 text-blue-700 rounded-lg font-bold flex items-center space-x-1 transition text-[11px] cursor-pointer border border-blue-600"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: PARTNER COLLEGES DIRECTORY LIST & DETAILS */}
      {/* ────────────────────────────────────────────────────────── */}
      {isPartnerCollegesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-7 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl space-y-4">
              <button
                type="button"
                onClick={() => setIsPartnerCollegesModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-8">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Partner Colleges Directory</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-purple-800 text-xs font-bold font-mono">
                      {colleges.length} Institutes
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">View, manage, edit and track partner institution metrics, contacts, and training cohorts.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetCollegeForm();
                    setIsCollegeModalOpen(true);
                  }}
                  className="bg-white px-4 py-2.5 text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md shrink-0 cursor-pointer border border-blue-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Partner College</span>
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={collegeSearchTerm}
                  onChange={e => setCollegeSearchTerm(e.target.value)}
                  placeholder="Search colleges by name, code, location, or contact person..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* SCROLLABLE LIST */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-4">
              {(() => {
                const filteredColleges = colleges.filter(c => {
                  if (!collegeSearchTerm.trim()) return true;
                  const q = collegeSearchTerm.toLowerCase();
                  return (
                    c.name?.toLowerCase().includes(q) ||
                    c.code?.toLowerCase().includes(q) ||
                    c.city?.toLowerCase().includes(q) ||
                    c.address?.toLowerCase().includes(q) ||
                    c.contactPerson?.toLowerCase().includes(q) ||
                    c.contactEmail?.toLowerCase().includes(q)
                  );
                });

                if (filteredColleges.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
                      <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-600">No partner colleges found.</p>
                      <p className="text-xs text-slate-400">Try matching a different search keyword or click "Add New Partner College".</p>
                    </div>
                  );
                }

                return filteredColleges.map((col) => (
                  <div key={col._id} className="bg-white border border-slate-200 hover:border-slate-200 rounded-2xl p-5 space-y-4 transition hover:bg-white hover:shadow-sm">
                    {/* Top Row: Info & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-purple-800 border border-blue-200 uppercase">
                            {col.code}
                          </span>
                          <h3 className="text-base font-black text-slate-900">{col.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ col.isActive !== false ? 'bg-white text-emerald-800' : 'bg-white text-slate-700' }`}>
                            {col.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{col.address ? `${col.address}, ${col.city}` : col.city}</span>
                        </p>
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto pt-2 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditCollege(col)}
                          className="px-3 py-1.5 bg-white hover:bg-white text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-800" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartDeleteCollege(col)}
                          className="px-3 py-1.5 bg-white hover:bg-white text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Contact Info & Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="space-y-0.5 bg-white p-3 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Person</span>
                        <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{col.contactPerson || 'N/A'}</span>
                        </span>
                      </div>

                      <div className="space-y-0.5 bg-white p-3 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Email</span>
                        <span className="font-mono font-medium text-slate-800 flex items-center space-x-1.5 truncate" title={col.contactEmail}>
                          <Mail className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate">{col.contactEmail || 'N/A'}</span>
                        </span>
                      </div>

                      <div className="space-y-0.5 bg-white p-3 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                        <span className="font-mono font-medium text-slate-800 flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span>{col.contactPhone || 'N/A'}</span>
                        </span>
                      </div>

                      <div className="space-y-0.5 bg-white p-3 rounded-xl border border-blue-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Date</span>
                        <span className="font-medium text-slate-700">
                          {col.createdAt ? new Date(col.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Metrics & Courses Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-blue-800" />
                          <span>Batches: <strong className="text-blue-800 font-mono">{col.batchesCount || 0}</strong></span>
                        </span>
                        <span className="flex items-center space-x-1.5 font-bold text-slate-700">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Students: <strong className="text-emerald-700 font-mono">{col.studentsCount || 0}</strong></span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-[11px] font-bold text-slate-500">Assigned Courses:</span>
                        {col.assignedCourses?.length > 0 ? (
                          col.assignedCourses.map((crs, cIdx) => (
                            <span key={cIdx} className="px-2 py-0.5 bg-white text-purple-800 rounded text-[10px] font-bold">
                              {crs}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">None assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex justify-end">
              <button
                type="button"
                onClick={() => setIsPartnerCollegesModalOpen(false)}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition border border-slate-200 text-xs cursor-pointer"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PARTNER COLLEGE */}
      {/* ────────────────────────────────────────────────────────── */}
      {isCollegeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <form
            onSubmit={handleSaveCollege}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-6 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl">
              <button
                type="button"
                onClick={() => {
                  setIsCollegeModalOpen(false);
                  resetCollegeForm();
                }}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-800" />
                  <span>{editingCollegeId ? 'Edit Partner College' : 'Add Partner College'}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {editingCollegeId ? 'Update institution details, contact info, and status.' : 'Enter institution details to link training batches.'}
                </p>
              </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-slate-700 font-bold">Institution Full Name *</label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={e => setCollegeName(e.target.value)}
                  placeholder="e.g. Apex Institute of Engineering & Tech"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Campus Code / ID *</label>
                  <input
                    type="text"
                    required
                    value={collegeCode}
                    onChange={e => setCollegeCode(e.target.value)}
                    placeholder="e.g. APEX-IT"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 uppercase font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">City / Location *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold">College Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. 123 University Campus Way, Tech Park"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={e => setContactPerson(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance (Placement Officer)"
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="e.g. placement@apex.edu"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. +1 555 019 2831"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold">Current Status</label>
                <select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={e => setIsActive(e.target.value === 'active')}
                  className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsCollegeModalOpen(false);
                  resetCollegeForm();
                }}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition border border-slate-200 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingCollege}
                className="bg-white px-6 py-2.5 text-blue-700 hover:bg-blue-50 rounded-xl font-bold shadow-md transition cursor-pointer border border-blue-600 text-xs disabled:opacity-50"
              >
                {submittingCollege ? (editingCollegeId ? 'Saving Changes...' : 'Adding College...') : (editingCollegeId ? 'Save Changes' : 'Add Partner College')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: DELETE PARTNER COLLEGE CONFIRMATION */}
      {/* ────────────────────────────────────────────────────────── */}
      {isDeleteCollegeModalOpen && collegeToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => {
                setIsDeleteCollegeModalOpen(false);
                setCollegeToDelete(null);
              }}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Delete Partner College?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete this partner college? This action cannot be undone.
              </p>
            </div>

            {/* Warning if linked records exist */}
            {(collegeToDelete.batchesCount > 0 || collegeToDelete.studentsCount > 0) && (
              <div className="p-3 bg-white border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-amber-950">Linked Records Notice</span>
                  <p className="text-[11px] leading-relaxed">
                    This institution currently has <strong>{collegeToDelete.batchesCount || 0} active training batch(es)</strong> and <strong>{collegeToDelete.studentsCount || 0} assigned student(s)</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteCollegeModalOpen(false);
                  setCollegeToDelete(null);
                }}
                className="px-5 py-2.5 bg-white hover:bg-white text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCollege}
                disabled={deletingCollege}
                className="bg-white px-5 py-2.5 text-blue-700 font-bold rounded-xl text-xs transition shadow-sm cursor-pointer border border-blue-600"
              >
                {deletingCollege ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION BANNER */}
      {toastNotification && (
        <div className={`fixed bottom-5 right-5 z-[200] px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-2.5 text-xs font-bold transition-all ${ toastNotification.type === 'error' ? 'bg-white text-rose-800 border-rose-200' : 'bg-white text-emerald-800 border-emerald-200' }`}>
          {toastNotification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toastNotification.message}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE TRAINING BATCH WIZARD (4 STEPS) */}
      {/* ────────────────────────────────────────────────────────── */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-7 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl space-y-4">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-8">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">Create Full Training Batch Cohort</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure schedule, college contacts, student import, and auto-generated student credentials.</p>
              </div>

              {/* Progress Steps Bar */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { step: 1, label: 'Batch Info' },
                  { step: 2, label: 'Schedule & Timings' },
                  { step: 3, label: 'College Contacts' },
                  { step: 4, label: 'Student PDF Import' }
                ].map(s => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => handleStepNavigation(s.step)}
                    className={`py-2 px-1 text-center rounded-xl font-bold text-xs transition border cursor-pointer ${ batchStep === s.step ? 'bg-white text-blue-700 border-purple-400 shadow-sm border' : batchStep > s.step ? 'bg-white text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-blue-200' }`}
                  >
                    {s.step}. {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-6">
              {/* STEP 1: BATCH INFO */}
              {batchStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Batch Name *</label>
                    <input
                      type="text"
                      required
                      value={bName}
                      onChange={e => setBName(e.target.value)}
                      placeholder="e.g. CSE 2026 Batch Alpha"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Batch Code *</label>
                    <input
                      type="text"
                      required
                      value={bCode}
                      onChange={e => setBCode(e.target.value)}
                      placeholder="e.g. CSE-2026-A"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 uppercase font-mono text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-700 font-bold">Partner College *</label>
                      <button
                        type="button"
                        onClick={() => setIsCollegeModalOpen(true)}
                        className="text-[11px] font-bold text-blue-800 hover:text-purple-800 flex items-center space-x-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add New College</span>
                      </button>
                    </div>
                    <select
                      value={bCollegeId}
                      onChange={e => setBCollegeId(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                    >
                      <option value="">-- Select Partner College --</option>
                      {colleges.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} {c.code ? `(${c.code})` : ''} {c.city ? `- ${c.city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-700 font-bold">Department *</label>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openAddDepartmentModal(bCollegeId)}
                          className="text-[11px] font-bold text-blue-800 hover:text-purple-800 flex items-center space-x-0.5 cursor-pointer"
                          title="Add custom department to this college"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add New Department</span>
                        </button>
                        {bCollegeId && (
                          <button
                            type="button"
                            onClick={() => openManageDepartmentsModal(bCollegeId)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                            title="Manage, edit, or delete departments"
                          >
                            <span>Manage</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <select
                      value={bDepartment}
                      onChange={e => handleDepartmentDropdownChange(e.target.value)}
                      disabled={!bCollegeId}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 font-medium disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      {!bCollegeId ? (
                        <option value="">-- Select Partner College First --</option>
                      ) : collegeDepartments.length === 0 ? (
                        <option value="">-- Loading Departments... --</option>
                      ) : (
                        collegeDepartments.map(d => (
                          <option key={d._id} value={d.code || d.name}>
                            {d.name} {d.code ? `(${d.code})` : ''}
                          </option>
                        ))
                      )}
                      {bCollegeId && (
                        <option value="__ADD_NEW_DEPT__" className="font-bold text-purple-700 bg-purple-50">
                          + Add New Department...
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Assign Course *</label>
                    <input
                      type="text"
                      list="courses-datalist"
                      value={bCourseId}
                      onChange={e => setBCourseId(e.target.value)}
                      placeholder="Type or select course name..."
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                    <datalist id="courses-datalist">
                      {courses.map(c => (
                        <option key={c._id} value={c.title}>{c.title} ({c.category})</option>
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Assign Tutor / Trainer *</label>
                    <select
                      value={bTrainerId}
                      onChange={e => {
                        const val = e.target.value;
                        setBTrainerId(val);
                        const selT = tutors.find(t => String(t._id) === String(val) || String(t.userId) === String(val));
                        if (selT?.resumeDocument?.fileUrl) {
                          setBTutorResumeUrl(selT.resumeDocument.fileUrl);
                        } else {
                          setBTutorResumeUrl('');
                        }
                      }}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 font-semibold"
                    >
                      <option value="">-- Select Tutor from Database --</option>
                      {tutors.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.fullName || t.name} ({t.tutorId || 'TUT'}) - {t.primaryDomain || 'Tutor'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* READ-ONLY AUTO-FILLED TUTOR DETAILS CARD */}
                {(() => {
                  const selT = tutors.find(t => String(t._id) === String(bTrainerId) || String(t.userId) === String(bTrainerId) || t.fullName === bTrainerId);
                  if (!selT) {
                    return (
                      <div className="bg-blue-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-800 font-medium">
                        Please select an active tutor above to auto-load stored tutor profile details and Resume PDF.
                      </div>
                    );
                  }
                  const resumeUrl = selT.resumeDocument?.fileUrl;
                  const resumeFileName = selT.resumeDocument?.fileName || 'Tutor_Resume.pdf';

                  return (
                    <div className="bg-white border border-slate-200/80 p-4 rounded-2xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                          Auto-Loaded Tutor Details (Read-Only)
                        </span>
                        <span className="font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          ID: {selT.tutorId || 'TUT'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-slate-800 font-medium pt-1">
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase font-bold">Tutor Name</span>
                          <span className="font-bold text-slate-900">{selT.fullName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase font-bold">Email</span>
                          <span className="font-mono text-slate-700 truncate block">{selT.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase font-bold">Phone Number</span>
                          <span className="font-mono text-slate-700">{selT.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase font-bold mb-0.5">Employment Type</span>
                          <EmploymentBadge type={selT.employmentType || 'FULL-TIME'} />
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block uppercase font-bold">Domain / Expertise</span>
                          <span className="font-bold text-indigo-700">{selT.primaryDomain || 'General'}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-500 text-[10px] block uppercase font-bold">Location / Address</span>
                          <span className="text-slate-700 truncate block">
                            {[selT.address, selT.city, selT.state, selT.pincode].filter(Boolean).join(', ') || 'India'}
                          </span>
                        </div>
                      </div>

                      {/* Resume PDF Status & View Button */}
                      <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-700">Tutor Resume PDF:</span>
                          {resumeUrl ? (
                            <span className="font-mono text-emerald-800 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{resumeFileName}</span>
                            </span>
                          ) : (
                            <span className="bg-white text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
                              Resume not available
                            </span>
                          )}
                        </div>

                        {resumeUrl && (
                          <a
                            href={resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:5000${resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white px-3.5 py-1.5 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-purple-500/20 transition border border-blue-600"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Start Date</label>
                    <input
                      type="date"
                      value={bStartDate}
                      onChange={e => setBStartDate(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">End Date</label>
                    <input
                      type="date"
                      value={bEndDate}
                      onChange={e => setBEndDate(e.target.value)}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SCHEDULE & TIMINGS */}
            {batchStep === 2 && (
              <div className="space-y-5 text-xs">
                {/* Training Days Toggles */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-bold">Configurable Training Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition ${ bTrainingDays.includes(day) ? 'bg-white text-blue-700 border-purple-400 border' : 'bg-white text-slate-600 border-blue-200' }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explicit Weekend Toggles */}
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                  <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bSatInc}
                      onChange={e => handleSatToggle(e.target.checked)}
                      className="rounded text-blue-800 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Include Saturday Training</span>
                  </label>

                  <label className="flex items-center space-x-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bSunInc}
                      onChange={e => handleSunToggle(e.target.checked)}
                      className="rounded text-blue-800 focus:ring-purple-500 w-4 h-4"
                    />
                    <span>Include Sunday Training</span>
                  </label>
                </div>

                {/* Class & Break Timings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Class Start Time</label>
                    <input
                      type="text"
                      value={bStartTime}
                      onChange={e => setBStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Class End Time</label>
                    <input
                      type="text"
                      value={bEndTime}
                      onChange={e => setBEndTime(e.target.value)}
                      placeholder="04:30 PM"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Lunch Break Start Time</label>
                    <input
                      type="text"
                      value={bBreakStart}
                      onChange={e => setBBreakStart(e.target.value)}
                      placeholder="01:00 PM"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Lunch Break End Time</label>
                    <input
                      type="text"
                      value={bBreakEnd}
                      onChange={e => setBBreakEnd(e.target.value)}
                      placeholder="02:00 PM"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                {/* Daily Report Automation Time */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Daily Automated Progress PDF & Email Time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={bDailyReportTime}
                      onChange={e => setBDailyReportTime(e.target.value)}
                      placeholder="18:00 (06:00 PM)"
                      className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono w-40"
                    />
                    <span className="text-[11px] text-amber-700">
                      System will auto-generate PDF and send email report to college contacts at this time.
                    </span>
                  </div>
                </div>

                {/* Holidays Excluded Dates */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-bold">Excluded Dates / Holidays List</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={e => setNewHolidayDate(e.target.value)}
                      className="bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Holiday Description (e.g. Festival)"
                      value={newHolidayTitle}
                      onChange={e => setNewHolidayTitle(e.target.value)}
                      className="bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddHoliday}
                      className="bg-white px-3 py-1.5 text-blue-700 rounded-xl font-bold text-xs border border-blue-600"
                    >
                      + Add Date
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {bHolidays.map((h, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white text-red-700 border border-red-200 rounded-lg font-mono text-[11px] flex items-center space-x-1.5"
                      >
                        <span>{h.date}: {h.title}</span>
                        <button onClick={() => handleRemoveHoliday(idx)} className="text-red-500 hover:text-red-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: COLLEGE CONTACTS */}
            {batchStep === 3 && (
              <div className="space-y-4 text-xs">
                <p className="text-slate-500">Enter institutional key contacts who will receive the daily automated PDF progress reports.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">College Guide Name</label>
                    <input
                      type="text"
                      value={bGuideName}
                      onChange={e => setBGuideName(e.target.value)}
                      placeholder="e.g. Prof. R. Sharma"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">College Guide Email *</label>
                    <input
                      type="email"
                      value={bGuideEmail}
                      onChange={e => setBGuideEmail(e.target.value)}
                      placeholder="e.g. r.sharma@apex.edu"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Placement Office Email *</label>
                    <input
                      type="email"
                      value={bPlacementEmail}
                      onChange={e => setBPlacementEmail(e.target.value)}
                      placeholder="e.g. placement@apex.edu"
                      className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">HOD Name & Email</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="HOD Name"
                        value={bHodName}
                        onChange={e => setBHodName(e.target.value)}
                        className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                      />
                      <input
                        type="email"
                        placeholder="HOD Email"
                        value={bHodEmail}
                        onChange={e => setBHodEmail(e.target.value)}
                        className="bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* ATTACHED TUTOR RESUME SUMMARY (READ-ONLY) */}
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1.5">
                  <label className="text-slate-800 font-bold block text-xs">Attached Tutor Resume PDF (From Tutor Management)</label>
                  {(() => {
                    const selT = tutors.find(t => String(t._id) === String(bTrainerId) || String(t.userId) === String(bTrainerId) || t.fullName === bTrainerId);
                    const resumeUrl = selT?.resumeDocument?.fileUrl || bTutorResumeUrl;
                    const fileName = selT?.resumeDocument?.fileName || 'Attached_Resume.pdf';

                    if (resumeUrl) {
                      return (
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-mono text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{fileName}</span>
                          </span>
                          <a
                            href={resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:5000${resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-800 hover:underline font-bold text-xs flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View PDF</span>
                          </a>
                        </div>
                      );
                    }
                    return (
                      <span className="text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200 font-bold text-xs inline-block">
                        Resume not available for selected tutor
                      </span>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* STEP 4: STUDENT PDF IMPORT */}
            {batchStep === 4 && (
              <div className="space-y-5 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-blue-800" />
                    <span>Upload Student List PDF / File or Paste Roster</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-semibold">Select PDF File:</label>
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={e => setImportFile(e.target.files[0])}
                        className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white file:font-bold hover:file:bg-purple-700"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-semibold">Or Paste Raw Roster Text:</label>
                      <textarea
                        rows={3}
                        value={importText}
                        onChange={e => setImportText(e.target.value)}
                        placeholder="John Doe, john@student.edu, CSE, 1st Year&#10;Alice Smith, alice@student.edu, CSE, 1st Year"
                        className="w-full bg-blue-50 border border-blue-200 rounded-xl p-2 font-mono text-[11px] text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleParseStudents}
                    disabled={parsingPdf}
                    className="bg-white px-4 py-2 text-blue-700 rounded-xl font-bold flex items-center space-x-2 transition border border-blue-600"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${parsingPdf ? 'animate-spin' : ''}`} />
                    <span>{parsingPdf ? 'Parsing File...' : 'Parse & Validate Student Roster'}</span>
                  </button>
                </div>

                {/* Preview Table */}
                {parsedStudents.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Parsed Roster Preview ({parsedStudents.filter(s => s.isValid).length} Valid / {parsedStudents.length} Total)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Usernames: <strong className="text-blue-800 font-mono">DEPT+ROMAN_YEAR+SEQ</strong> &bull; Initial Password: <strong className="text-blue-800 font-mono">6-char (e.g. IT0001, CSE001)</strong>
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto border border-blue-200 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-white text-slate-700 font-bold sticky top-0">
                          <tr>
                            <th className="p-2 border-b">Status</th>
                            <th className="p-2 border-b">Name</th>
                            <th className="p-2 border-b">Email</th>
                            <th className="p-2 border-b">Dept</th>
                            <th className="p-2 border-b">Year</th>
                            <th className="p-2 border-b">Generated Username</th>
                            <th className="p-2 border-b">Initial Password</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedStudents.map((s, idx) => {
                            const cleanDept = (s.department || bDepartment || 'CSE').trim().toUpperCase().replace(/[^A-Z]/g, '') || 'ST';
                            const padLen = Math.max(2, 6 - cleanDept.length);
                            const initialPwd = `${cleanDept}${String(idx + 1).padStart(padLen, '0')}`;
                            return (
                              <tr key={idx} className={s.isValid ? 'bg-white' : 'bg-white'}>
                                <td className="p-2">
                                  {s.isValid ? (
                                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Valid</span>
                                    </span>
                                  ) : (
                                    <span className="text-red-600 font-bold flex items-center space-x-1">
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>{s.errorReason}</span>
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 font-medium text-slate-900">{s.name}</td>
                                <td className="p-2 font-mono text-slate-600">{s.email}</td>
                                <td className="p-2">{s.department}</td>
                                <td className="p-2">{s.academicYear}</td>
                                <td className="p-2 font-mono text-blue-800 font-bold">
                                  {cleanDept}I{String(idx + 1).padStart(2, '0')}
                                </td>
                                <td className="p-2 font-mono text-blue-800 font-bold">
                                  {initialPwd}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                </div>
              )}
            </div>

            {/* FIXED FOOTER / ACTION BUTTONS */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-between">
              <div>
                {batchStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleStepNavigation(batchStep - 1)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition border border-slate-200 cursor-pointer text-xs flex items-center space-x-1"
                  >
                    <span>← Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition border border-slate-200 cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {batchStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="px-4 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                {batchStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => handleStepNavigation(batchStep + 1)}
                    className="bg-white px-6 py-2.5 text-blue-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg shadow-purple-500/20 transition cursor-pointer border border-blue-600 text-xs flex items-center space-x-1"
                  >
                    <span>
                      {batchStep === 1 && 'Next: Schedule & Timings →'}
                      {batchStep === 2 && 'Next: College Contacts →'}
                      {batchStep === 3 && 'Next: Student PDF Import →'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateFullBatch}
                    disabled={submittingBatch}
                    className="bg-white px-8 py-2.5 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold shadow-lg shadow-emerald-600/20 text-xs flex items-center space-x-2 transition border border-emerald-600 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{submittingBatch ? 'Creating Cohort & Accounts...' : 'Confirm & Create Full Batch'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* DRAWER / MODAL: 8-TAB BATCH DETAILS VIEW */}
      {/* ────────────────────────────────────────────────────────── */}
      {selectedBatchId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white max-w-5xl w-full h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative border-l border-blue-200">
            <button
              onClick={() => setSelectedBatchId(null)}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white"
            >
              <X className="w-6 h-6" />
            </button>

            {loadingDetails || !batchDetails ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Batch Header Summary with Action Buttons */}
                <div className="space-y-2 border-b border-blue-200 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-800">
                        <span>CODE: {batchDetails.batch.code}</span>
                        <span>•</span>
                        <span>DEPARTMENT: {batchDetails.batch.department}</span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900">{batchDetails.batch.name}</h2>
                      <p className="text-xs text-slate-500">
                        Campus: {batchDetails.batch.collegeId?.name} ({batchDetails.batch.collegeId?.city}) | Course: {batchDetails.batch.courseId?.title}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={openEditBatchModal}
                        className="px-3 py-2 bg-white hover:bg-white text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Edit Batch</span>
                      </button>

                      <button
                        onClick={openAddStudentsModal}
                        className="px-3 py-2 bg-white hover:bg-white text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Students</span>
                      </button>

                      <button
                        onClick={() => openAssignCourseModal()}
                        className="bg-white px-3.5 py-2 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-500/20 transition cursor-pointer border border-blue-600"
                        title="Assign new or additional course to batch students"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Assign Course</span>
                      </button>

                      <button
                        onClick={openBatchCompleteModal}
                        className="px-3 py-2 bg-white hover:bg-white text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                        title="Mark batch course as completed and deactivate credentials"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Complete Course</span>
                      </button>

                      <button
                        onClick={() => setIsDeleteConfirmModalOpen(true)}
                        className="px-3 py-2 bg-white hover:bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Batch</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8 Tabs Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-blue-200 pb-2">
                  {[
                    { id: 'overview', label: '1. Overview', icon: BarChart3 },
                    { id: 'students', label: `2. Students Roster (${batchDetails.students?.length || 0})`, icon: Users },
                    { id: 'schedule', label: '3. Training Schedule', icon: Calendar },
                    { id: 'modules', label: '4. Syllabus & Modules', icon: BookOpen },
                    { id: 'tutor', label: '5. Tutor Details', icon: UserCheck },
                    { id: 'attendance', label: '6. Attendance Log', icon: CheckCircle2 },
                    { id: 'updates', label: '7. Daily Updates', icon: FileText },
                    { id: 'reports', label: '8. Daily Reports & PDFs', icon: FileCheck }
                  ].map(t => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${ activeTab === t.id ? 'bg-white text-blue-700 shadow-sm border border-blue-600' : 'bg-white text-slate-600 hover:bg-white' }`}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 text-xs">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Academic Year</span>
                        <h4 className="text-lg font-black text-slate-900">{batchDetails.batch.academicYear}</h4>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Total Enrolled</span>
                        <h4 className="text-lg font-black text-slate-900">{batchDetails.students?.length} Students</h4>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Daily Report Time</span>
                        <h4 className="text-lg font-black text-[#0F172A]">{batchDetails.batch.dailyReportTime || '18:00'}</h4>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned Tutor</span>
                        <h4 className="text-lg font-black text-slate-900">{batchDetails.batch.trainerId?.name || 'N/A'}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-blue-800" />
                          <span>College Contacts</span>
                        </h3>
                        <p><strong>Guide:</strong> {batchDetails.batch.collegeGuideName || 'N/A'} ({batchDetails.batch.collegeGuideEmail || 'N/A'})</p>
                        <p><strong>Placement Email:</strong> {batchDetails.batch.placementOfficeEmail || 'N/A'}</p>
                        <p><strong>HOD:</strong> {batchDetails.batch.hodName || 'N/A'} ({batchDetails.batch.hodEmail || 'N/A'})</p>
                      </div>

                      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-800" />
                          <span>Training Hours & Schedule</span>
                        </h3>
                        <p><strong>Timing:</strong> {batchDetails.batch.startTime} - {batchDetails.batch.endTime}</p>
                        <p><strong>Lunch Break Time:</strong> {batchDetails.batch.breakStartTime} - {batchDetails.batch.breakEndTime}</p>
                        <p><strong>Training Days:</strong> {batchDetails.batch.trainingDays?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: STUDENTS ROSTER */}
                {activeTab === 'students' && (
                  <div className="space-y-4 text-xs">
                    {/* Header and Quick Stats */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-800" />
                          <span>College Batch Student Course Lifecycle</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Manage course reassignments, verify login access, and automatically deactivate credentials upon course completion.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => openAssignCourseModal()}
                          className="bg-white px-3.5 py-2 text-blue-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-sm hover:opacity-95 transition cursor-pointer border border-blue-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Assign New Course</span>
                        </button>
                        <button
                          onClick={openBatchCompleteModal}
                          className="px-3.5 py-2 bg-white hover:bg-white text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Batch Completed</span>
                        </button>
                      </div>
                    </div>

                    {/* Students Roster Table */}
                    <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-white text-slate-700 font-bold text-[11px] uppercase tracking-wider font-mono">
                            <tr>
                              <th className="p-3">Student ID</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">Login Username / Email</th>
                              <th className="p-3">Current Course</th>
                              <th className="p-3">Enrollment Status</th>
                              <th className="p-3">Login Access</th>
                              <th className="p-3">Past Courses</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-xs">
                            {batchDetails.students?.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="p-8 text-center text-slate-400 font-semibold">
                                  No students enrolled in this batch yet.
                                </td>
                              </tr>
                            ) : (
                              batchDetails.students?.map((s, idx) => {
                                const hasActive = !!s.activeEnrollment;
                                const isLoginActive = s.loginAccessStatus
                                  ? s.loginAccessStatus === 'ACTIVE'
                                  : (s.isActive !== false && (!s.activeEnrollment || s.activeEnrollment.accountStatus === 'ACTIVE'));
                                const completedCount = s.completedEnrollments?.length || 0;

                                return (
                                  <tr key={s._id || idx} className="hover:bg-white transition-colors">
                                    <td className="p-3 font-mono font-bold text-blue-800">
                                      {s.studentId || 'N/A'}
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-slate-900">{s.name}</div>
                                      <div className="text-[10px] text-slate-400 font-mono">{s.department} • {s.academicYear}</div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-mono font-bold text-indigo-700">
                                        {s.activeEnrollment?.courseUsername || s.username}
                                      </div>
                                      <div className="font-mono text-[11px] text-slate-500">{s.email}</div>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-bold text-slate-800 block">
                                        {s.currentCourseName || 'No Course Assigned'}
                                      </span>
                                      {s.activeEnrollment?.startDate && (
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          Started: {new Date(s.activeEnrollment.startDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {hasActive ? (
                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-emerald-700 border border-emerald-200">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          <span>ACTIVE</span>
                                        </span>
                                      ) : completedCount > 0 ? (
                                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-blue-800 border border-blue-200">
                                          <span>COMPLETED</span>
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-500">
                                          PENDING
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {isLoginActive ? (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200" title="Active login credentials">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          <span>ACTIVE</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200" title="Login access deactivated">
                                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                          <span>DEACTIVE</span>
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <button
                                        onClick={() => openHistoryModal(s)}
                                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-white text-slate-700 transition"
                                      >
                                        <History className="w-3 h-3 text-slate-500" />
                                        <span>{completedCount} Completed</span>
                                      </button>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                                        {/* 1. Complete */}
                                        {hasActive && (
                                          <button
                                            type="button"
                                            onClick={() => openStudentCompleteModal(s, s.activeEnrollment)}
                                            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] transition inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                                            title="Mark current course completed and immediately deactivate login access"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Complete</span>
                                          </button>
                                        )}

                                        {/* 2. Assign */}
                                        <button
                                          type="button"
                                          onClick={() => openAssignCourseModal(s._id)}
                                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] transition inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                                          title="Assign a new or next course to this student"
                                        >
                                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                                          <span>Assign</span>
                                        </button>

                                        {/* 3. Edit Icon */}
                                        <button
                                          type="button"
                                          onClick={() => openEditStudentModal(s)}
                                          className="w-7 h-7 bg-white hover:bg-purple-50 text-purple-600 hover:text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg transition-colors inline-flex items-center justify-center shadow-2xs cursor-pointer shrink-0"
                                          title="Edit Student"
                                          aria-label="Edit Student"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>

                                        {/* 4. Delete Icon */}
                                        <button
                                          type="button"
                                          onClick={() => openDeleteStudentModal(s)}
                                          className="w-7 h-7 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors inline-flex items-center justify-center shadow-2xs cursor-pointer shrink-0"
                                          title="Delete Student"
                                          aria-label="Delete Student"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: TRAINING SCHEDULE */}
                {activeTab === 'schedule' && (
                  <div className="space-y-4 text-xs">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="font-bold text-slate-900 text-sm">Configured Schedule Parameters</h3>
                      <p><strong>Active Days:</strong> {batchDetails.batch.trainingDays?.join(', ')}</p>
                      <p><strong>Saturday Included:</strong> {batchDetails.batch.saturdayIncluded ? 'YES' : 'NO'}</p>
                      <p><strong>Sunday Included:</strong> {batchDetails.batch.sundayIncluded ? 'YES' : 'NO'}</p>
                      <p><strong>Class Timing:</strong> {batchDetails.batch.startTime} to {batchDetails.batch.endTime}</p>
                      <p><strong>Lunch Break Timing:</strong> {batchDetails.batch.breakStartTime} to {batchDetails.batch.breakEndTime}</p>
                      <p><strong>Daily Automation Time:</strong> {batchDetails.batch.dailyReportTime || '18:00'}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800">Excluded Holiday Dates</h4>
                      {batchDetails.batch.holidays?.length === 0 ? (
                        <p className="text-slate-500">No custom holidays configured.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {batchDetails.batch.holidays?.map((h, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white text-red-700 border border-red-200 rounded-xl font-mono">
                              {h.date}: {h.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: SYLLABUS & MODULES */}
                {activeTab === 'modules' && (
                  <CollegeTrainingSyllabusManager
                    batchId={selectedBatchId}
                    batch={batchDetails?.batch}
                    college={batchDetails?.batch?.collegeId}
                    onRefreshBatch={() => fetchBatchDetails(selectedBatchId)}
                  />
                )}

                {/* TAB 5: TUTOR DETAILS */}
                {activeTab === 'tutor' && (
                  <div className="space-y-4 text-xs">
                    {(() => {
                      const trainerIdVal = batchDetails.batch.trainerId?._id || batchDetails.batch.trainerId;
                      const matchedTutor = tutors.find(t => String(t._id) === String(trainerIdVal) || String(t.userId) === String(trainerIdVal));
                      const name = matchedTutor?.fullName || batchDetails.batch.trainerId?.name || 'Assigned Tutor';
                      const email = matchedTutor?.email || batchDetails.batch.trainerId?.email || 'N/A';
                      const phone = matchedTutor?.phone || batchDetails.batch.trainerId?.phone || 'N/A';
                      const resumeUrl = matchedTutor?.resumeDocument?.fileUrl || batchDetails.batch.tutorResumeUrl;
                      const fileName = matchedTutor?.resumeDocument?.fileName || 'Tutor_Resume.pdf';

                      return (
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-2xs">
                          <div className="flex items-center space-x-4">
                            {matchedTutor?.profilePhotoUrl ? (
                              <img
                                src={matchedTutor.profilePhotoUrl.startsWith('http') ? matchedTutor.profilePhotoUrl : `http://localhost:5000${matchedTutor.profilePhotoUrl}`}
                                alt={name}
                                className="w-14 h-14 rounded-2xl object-cover border border-blue-200 shadow-2xs"
                              />
                            ) : (
                              <div className="bg-white w-14 h-14 rounded-2xl text-blue-700 flex items-center justify-center text-xl font-black border border-blue-600">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                                Assigned Batch Tutor
                              </span>
                              <h3 className="font-black text-slate-900 text-lg mt-0.5">{name}</h3>
                              <p className="text-slate-500 font-mono text-xs">{matchedTutor?.tutorId ? `ID: ${matchedTutor.tutorId}` : ''}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 font-medium pt-2 border-t border-slate-100">
                            <p><strong>Email Address:</strong> <span className="font-mono text-slate-900">{email}</span></p>
                            <p><strong>Phone Number:</strong> <span className="font-mono text-slate-900">{phone}</span></p>
                            <p><strong>Domain / Expertise:</strong> <span className="font-bold text-indigo-700">{matchedTutor?.primaryDomain || 'General'}</span></p>
                            <p className="flex items-center space-x-2">
                              <strong>Employment Type:</strong>
                              <EmploymentBadge type={matchedTutor?.employmentType || 'FULL-TIME'} />
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <strong className="text-slate-800">Stored Resume PDF:</strong>
                              {resumeUrl ? (
                                <span className="font-mono text-emerald-800 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-lg font-bold flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{fileName}</span>
                                </span>
                              ) : (
                                <span className="bg-white text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg font-bold">
                                  Resume not available
                                </span>
                              )}
                            </div>

                            {resumeUrl && (
                              <a
                                href={resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:5000${resumeUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white px-4 py-2 text-blue-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-purple-500/20 transition cursor-pointer border border-blue-600"
                              >
                                <FileText className="w-4 h-4" />
                                <span>View PDF</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* TAB 6: ATTENDANCE LOG */}
                {activeTab === 'attendance' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">Daily Student Attendance History</h3>
                    {batchDetails.attendanceLog?.length === 0 ? (
                      <p className="text-slate-500">No attendance records logged yet for this batch.</p>
                    ) : (
                      <div className="space-y-3">
                        {batchDetails.attendanceLog?.map((att, i) => (
                          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between font-bold text-slate-900">
                              <span>Date: {att.date}</span>
                              <span className="text-emerald-600">Present: {att.present} | Absent: {att.absent}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 7: DAILY TEACHING UPDATES */}
                {activeTab === 'updates' && (
                  <div className="space-y-6 text-xs">
                    {/* Add Daily Update Form */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="font-bold text-slate-900 text-sm">Log Today's Tutor Teaching Update</h3>
                      <form onSubmit={handleSaveTutorUpdate} className="space-y-3">
                        <div>
                          <label className="text-slate-700 font-semibold">Topic Covered Today *</label>
                          <input
                            type="text"
                            required
                            value={tutorTopic}
                            onChange={e => setTutorTopic(e.target.value)}
                            placeholder="e.g. OOP Inheritance & Method Overriding in Java"
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-700 font-semibold">Practical Activity / Lab Session</label>
                          <input
                            type="text"
                            value={tutorActivity}
                            onChange={e => setTutorActivity(e.target.value)}
                            placeholder="e.g. Solved 3 challenges on polymorphic class structures."
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={savingUpdate}
                          className="bg-white px-5 py-2 text-blue-700 rounded-xl font-bold shadow-md shadow-purple-500/20 transition cursor-pointer border border-blue-600"
                        >
                          {savingUpdate ? 'Saving...' : 'Save Teaching Update'}
                        </button>
                      </form>
                    </div>

                    {/* Previous Updates History */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800">Teaching History Log</h4>
                      {batchDetails.tutorUpdates?.map(u => (
                        <div key={u._id} className="bg-white border border-slate-200 p-4 rounded-2xl space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{u.topicCovered}</span>
                            <span className="text-slate-400 font-mono">{u.date}</span>
                          </div>
                          <p className="text-slate-600">{u.practicalActivity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 8: DAILY REPORTS & PDFS */}
                {activeTab === 'reports' && (
                  <div className="space-y-6 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">Automated PDF Reports & Delivery Logs</h3>
                      <button
                        onClick={handleTriggerManualReport}
                        disabled={triggeringReport}
                        className="bg-white px-4 py-2 text-emerald-700 rounded-xl font-bold flex items-center space-x-2 transition border border-emerald-600"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${triggeringReport ? 'animate-spin' : ''}`} />
                        <span>{triggeringReport ? 'Generating Report...' : 'Generate & Email Report Now'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {batchDetails.dailyReports?.map(rep => (
                        <div key={rep._id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900">Daily Training Progress Report ({rep.date})</h4>
                            <p className="text-slate-500">
                              Present: {rep.statsSnapshot?.presentCount} | Absent: {rep.statsSnapshot?.absentCount} | Tasks Done: {rep.statsSnapshot?.totalTasksCompletedToday}
                            </p>
                          </div>

                          <a
                            href={`http://localhost:5000${rep.pdfPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white px-4 py-2 text-blue-700 rounded-xl font-bold flex items-center space-x-1.5 border border-blue-600"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: EDIT COLLEGE TRAINING BATCH */}
      {/* ────────────────────────────────────────────────────────── */}
      {isEditBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <form
            onSubmit={handleSaveEditBatch}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-6 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl">
              <button
                type="button"
                onClick={() => setIsEditBatchModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                  Batch Configuration
                </span>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span>Edit College Training Batch</span>
                </h2>
                <p className="text-xs text-slate-500">Update cohort information, partner college, domain, schedule, and guide contact details.</p>
              </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Batch Name *</label>
                  <input
                    type="text"
                    required
                    value={editBatchForm.name}
                    onChange={e => setEditBatchForm({ ...editBatchForm, name: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Batch Code *</label>
                  <input
                    type="text"
                    required
                    value={editBatchForm.code}
                    onChange={e => setEditBatchForm({ ...editBatchForm, code: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-bold">Department *</label>
                    <button
                      type="button"
                      onClick={() => openAddDepartmentModal(editBatchForm.collegeId)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-0.5 cursor-pointer"
                      title="Add new department to this college"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>Add Department</span>
                    </button>
                  </div>
                  <select
                    value={editBatchForm.department}
                    onChange={e => {
                      if (e.target.value === '__ADD_NEW_DEPT__') {
                        openAddDepartmentModal(editBatchForm.collegeId);
                        return;
                      }
                      setEditBatchForm({ ...editBatchForm, department: e.target.value });
                    }}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {collegeDepartments.length > 0 ? (
                      collegeDepartments.map(d => (
                        <option key={d._id} value={d.code || d.name}>
                          {d.name} {d.code ? `(${d.code})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="CSE">CSE (Computer Science)</option>
                        <option value="IT">IT (Information Tech)</option>
                        <option value="AIDS">AIDS (AI & Data Science)</option>
                        <option value="ECE">ECE (Electronics)</option>
                        <option value="MECH">MECH (Mechanical)</option>
                      </>
                    )}
                    <option value="__ADD_NEW_DEPT__" className="font-bold text-purple-700 bg-purple-50">
                      + Add New Department...
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Academic Year *</label>
                  <select
                    value={editBatchForm.academicYear}
                    onChange={e => setEditBatchForm({ ...editBatchForm, academicYear: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Partner College *</label>
                  <select
                    value={editBatchForm.collegeId}
                    onChange={e => setEditBatchForm({ ...editBatchForm, collegeId: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {colleges.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Course / Domain *</label>
                  <select
                    value={editBatchForm.courseId}
                    onChange={e => setEditBatchForm({ ...editBatchForm, courseId: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Assigned Tutor *</label>
                  <select
                    value={editBatchForm.trainerId}
                    onChange={e => setEditBatchForm({ ...editBatchForm, trainerId: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {tutors.map(t => (
                      <option key={t._id || t.userId} value={t._id || t.userId}>{t.name || t.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Daily Report Time</label>
                  <input
                    type="text"
                    value={editBatchForm.dailyReportTime}
                    onChange={e => setEditBatchForm({ ...editBatchForm, dailyReportTime: e.target.value })}
                    placeholder="18:00"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Start Date</label>
                  <input
                    type="date"
                    value={editBatchForm.startDate}
                    onChange={e => setEditBatchForm({ ...editBatchForm, startDate: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">End Date</label>
                  <input
                    type="date"
                    value={editBatchForm.endDate}
                    onChange={e => setEditBatchForm({ ...editBatchForm, endDate: e.target.value })}
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Training Start Time</label>
                  <input
                    type="text"
                    value={editBatchForm.startTime}
                    onChange={e => setEditBatchForm({ ...editBatchForm, startTime: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Training End Time</label>
                  <input
                    type="text"
                    value={editBatchForm.endTime}
                    onChange={e => setEditBatchForm({ ...editBatchForm, endTime: e.target.value })}
                    placeholder="04:30 PM"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Lunch Break Start</label>
                  <input
                    type="text"
                    value={editBatchForm.breakStartTime}
                    onChange={e => setEditBatchForm({ ...editBatchForm, breakStartTime: e.target.value })}
                    placeholder="01:00 PM"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">Lunch Break End</label>
                  <input
                    type="text"
                    value={editBatchForm.breakEndTime}
                    onChange={e => setEditBatchForm({ ...editBatchForm, breakEndTime: e.target.value })}
                    placeholder="02:00 PM"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">College Guide Name</label>
                  <input
                    type="text"
                    value={editBatchForm.collegeGuideName}
                    onChange={e => setEditBatchForm({ ...editBatchForm, collegeGuideName: e.target.value })}
                    placeholder="Prof. Smith"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">College Guide Email</label>
                  <input
                    type="email"
                    value={editBatchForm.collegeGuideEmail}
                    onChange={e => setEditBatchForm({ ...editBatchForm, collegeGuideEmail: e.target.value })}
                    placeholder="guide@college.edu"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">HOD Name</label>
                  <input
                    type="text"
                    value={editBatchForm.hodName}
                    onChange={e => setEditBatchForm({ ...editBatchForm, hodName: e.target.value })}
                    placeholder="Dr. Johnson"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-800 font-bold">HOD Email</label>
                  <input
                    type="email"
                    value={editBatchForm.hodEmail}
                    onChange={e => setEditBatchForm({ ...editBatchForm, hodEmail: e.target.value })}
                    placeholder="hod@college.edu"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-slate-800 font-bold">Placement Officer Email</label>
                  <input
                    type="email"
                    value={editBatchForm.placementOfficeEmail}
                    onChange={e => setEditBatchForm({ ...editBatchForm, placementOfficeEmail: e.target.value })}
                    placeholder="placement@college.edu"
                    className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditBatchModalOpen(false)}
                className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition border border-slate-200 text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submittingEditBatch}
                className="bg-white px-6 py-2.5 text-amber-700 hover:bg-amber-50 rounded-xl font-bold shadow-sm transition border border-amber-600 text-xs cursor-pointer disabled:opacity-50"
              >
                {submittingEditBatch ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD STUDENTS TO BATCH */}
      {/* ────────────────────────────────────────────────────────── */}
      {isAddStudentsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-7 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl space-y-4">
              <button
                type="button"
                onClick={() => setIsAddStudentsModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-block">
                  Batch Roster Management
                </span>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-800" />
                  <span>Add Students to Batch ({batchDetails?.batch?.name})</span>
                </h2>
                <p className="text-xs text-slate-500">Append new or existing students to this batch without affecting existing enrolled students.</p>
              </div>

              {/* Sub-Tabs: Select Existing vs Upload PDF */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAddStudentsTab('select')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${ addStudentsTab === 'select' ? 'bg-white text-blue-700 shadow-sm border border-blue-600' : 'bg-white text-slate-600 hover:bg-slate-100 border border-transparent' }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>1. Select Existing Students</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAddStudentsTab('pdf')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${ addStudentsTab === 'pdf' ? 'bg-white text-blue-700 shadow-sm border border-blue-600' : 'bg-white text-slate-600 hover:bg-slate-100 border border-transparent' }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>2. Upload Student Details PDF</span>
                </button>
              </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-4">

            {/* TAB 1: SELECT EXISTING STUDENTS */}
            {addStudentsTab === 'select' && (
              <div className="space-y-4 text-xs font-medium">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by student name, email, or Student ID..."
                    value={addStudentsSearch}
                    onChange={e => setAddStudentsSearch(e.target.value)}
                    className="w-full bg-white border border-blue-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {loadingEligibleStudents ? (
                  <div className="p-8 text-center text-slate-500 font-bold">Loading eligible students...</div>
                ) : (
                  <div className="border border-blue-200 rounded-2xl max-h-64 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="p-3">Select</th>
                          <th className="p-3">Student ID</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Classification</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {eligibleStudents
                          .filter(s => {
                            if (!addStudentsSearch.trim()) return true;
                            const q = addStudentsSearch.toLowerCase();
                            return (s.name || '').toLowerCase().includes(q) ||
                                   (s.email || '').toLowerCase().includes(q) ||
                                   (s.studentId || '').toLowerCase().includes(q);
                          })
                          .map(s => {
                            const isAlreadyInBatch = (batchDetails?.batch?.studentIds || []).map(id => id.toString()).includes(s._id);
                            const isChecked = selectedStudentUserIdsToAdd.includes(s._id);

                            return (
                              <tr key={s._id} className="hover:bg-white">
                                <td className="p-3">
                                  <input
                                    type="checkbox"
                                    disabled={isAlreadyInBatch}
                                    checked={isChecked || isAlreadyInBatch}
                                    onChange={e => {
                                      if (e.target.checked) {
                                        setSelectedStudentUserIdsToAdd(prev => [...prev, s._id]);
                                      } else {
                                        setSelectedStudentUserIdsToAdd(prev => prev.filter(id => id !== s._id));
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-800 focus:ring-purple-500 rounded"
                                  />
                                </td>
                                <td className="p-3 font-mono font-bold text-blue-800">{s.studentId || 'N/A'}</td>
                                <td className="p-3 font-bold text-slate-900">{s.name}</td>
                                <td className="p-3 font-mono text-slate-600">{s.email}</td>
                                <td className="p-3 font-semibold text-blue-800">{s.studentType || 'LMS'}</td>
                                <td className="p-3">
                                  {isAlreadyInBatch ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700">Already Added</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800">Eligible</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                </div>
              )}

            {/* TAB 2: UPLOAD STUDENT DETAILS PDF */}
            {addStudentsTab === 'pdf' && (
              <div className="space-y-4 text-xs font-medium">
                <form onSubmit={handlePreviewPdfImport} className="space-y-3">
                  <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center space-y-3 bg-white">
                    <Upload className="w-8 h-8 text-blue-800 mx-auto" />
                    <div>
                      <label className="bg-white cursor-pointer px-4 py-2 text-blue-700 rounded-xl font-bold inline-block shadow-sm border border-blue-600">
                        <span>Choose Student PDF File</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={e => setAddStudentsPdfFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {addStudentsPdfFile && (
                      <p className="text-purple-800 font-bold font-mono text-[11px]">{addStudentsPdfFile.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Or Paste Raw PDF Roster Text:</label>
                    <textarea
                      rows={3}
                      value={addStudentsPdfText}
                      onChange={e => setAddStudentsPdfText(e.target.value)}
                      placeholder="Paste student roster lines with name, email, department..."
                      className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={previewingPdf}
                    className="bg-white w-full py-2.5 text-blue-700 rounded-xl font-bold shadow-sm transition border border-blue-600"
                  >
                    {previewingPdf ? 'Parsing & Previewing PDF...' : 'Preview PDF Import'}
                  </button>
                </form>

                {/* PDF PREVIEW RESULTS BOX */}
                {pdfPreviewData && (
                  <div className="space-y-4 border-t border-blue-200 pt-4">
                    <h3 className="font-black text-slate-900 text-sm">PDF Import Preview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-blue-200 text-center">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Detected</span>
                        <span className="text-lg font-black text-slate-900">{pdfPreviewData.totalFound}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
                        <span className="text-emerald-700 font-bold uppercase text-[10px] block">New Students</span>
                        <span className="text-lg font-black text-emerald-800">+{pdfPreviewData.newStudentsCount}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-blue-200 text-center">
                        <span className="text-blue-800 font-bold uppercase text-[10px] block">In System DB</span>
                        <span className="text-lg font-black text-purple-800">+{pdfPreviewData.existingDbCount}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-300 text-center">
                        <span className="text-slate-600 font-bold uppercase text-[10px] block">Already in Batch</span>
                        <span className="text-lg font-black text-slate-700">{pdfPreviewData.alreadyInBatchCount}</span>
                      </div>
                    </div>

                    <div className="border border-blue-200 rounded-2xl max-h-48 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-white text-slate-700 font-bold sticky top-0">
                          <tr>
                            <th className="p-2.5">Name</th>
                            <th className="p-2.5">Email</th>
                            <th className="p-2.5">Dept / Year</th>
                            <th className="p-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pdfPreviewData.preview?.map((item, i) => (
                            <tr key={i} className="hover:bg-white">
                              <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                              <td className="p-2.5 font-mono text-slate-600">{item.email}</td>
                              <td className="p-2.5">{item.department} ({item.academicYear})</td>
                              <td className="p-2.5">
                                {item.statusTag === 'NEW' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800">Genuinely New</span>
                                )}
                                {item.statusTag === 'EXISTS_IN_DB' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-purple-800">Exists in DB</span>
                                )}
                                {item.statusTag === 'ALREADY_IN_BATCH' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700">Already in Batch</span>
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
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-between">
              <div>
                {addStudentsTab === 'select' ? (
                  <span className="text-slate-600 font-bold text-xs">
                    {selectedStudentUserIdsToAdd.length} new student(s) selected
                  </span>
                ) : (
                  <span className="text-slate-600 font-bold text-xs">
                    {pdfPreviewData ? `${pdfPreviewData.totalFound} student(s) detected` : 'Upload or paste PDF to preview'}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentsModalOpen(false)}
                  className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl font-bold transition border border-slate-200 text-xs cursor-pointer"
                >
                  Cancel
                </button>

                {addStudentsTab === 'select' ? (
                  <button
                    type="button"
                    disabled={submittingAppendStudents || selectedStudentUserIdsToAdd.length === 0}
                    onClick={handleConfirmAppendStudents}
                    className="bg-white px-6 py-2.5 text-blue-700 hover:bg-blue-50 rounded-xl font-bold shadow-md transition cursor-pointer border border-blue-600 text-xs disabled:opacity-50"
                  >
                    {submittingAppendStudents ? 'Adding Students...' : `Add Selected Students (${selectedStudentUserIdsToAdd.length})`}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submittingAppendStudents || !pdfPreviewData}
                    onClick={handleConfirmAppendStudents}
                    className="bg-white px-6 py-2.5 text-blue-700 hover:bg-blue-50 rounded-xl font-bold shadow-md transition cursor-pointer border border-blue-600 text-xs disabled:opacity-50"
                  >
                    {submittingAppendStudents ? 'Importing Students...' : 'Confirm & Add Students'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: SAFE DELETE BATCH CONFIRMATION */}
      {/* ────────────────────────────────────────────────────────── */}
      {isDeleteConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsDeleteConfirmModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Delete College Training Batch</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-medium">
              <p><strong>Batch:</strong> {batchDetails?.batch?.name}</p>
              <p><strong>Code:</strong> {batchDetails?.batch?.code}</p>
              <p><strong>Students Enrolled:</strong> {batchDetails?.students?.length} Students</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-amber-800 text-xs font-semibold leading-relaxed">
              ⚠️ <strong>Warning:</strong> Deleting this batch will remove this batch's training records and student enrollment from this batch. <strong>Student user accounts will NOT be deleted.</strong>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 hover:bg-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingBatch}
                onClick={handleConfirmDeleteBatch}
                className="bg-white px-6 py-2.5 text-blue-700 rounded-xl font-bold text-xs shadow-sm transition border border-blue-600"
              >
                {deletingBatch ? 'Deleting Batch...' : 'Delete Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ASSIGN NEW COURSE TO BATCH STUDENTS */}
      {/* ────────────────────────────────────────────────────────── */}
      {isAssignCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <form
            onSubmit={handleSubmitAssignCourse}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-6 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl">
              <button
                type="button"
                onClick={() => setIsAssignCourseModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pr-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-800" />
                  <span>Assign New Course to Batch Students</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Assign a new course to existing students in <strong className="text-blue-800">{batchDetails?.batch?.name}</strong>. Reuses existing student profiles and generates dedicated credentials for the new course without duplicating records.
                </p>
              </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={assignCourseForm.courseId}
                    onChange={(e) => setAssignCourseForm(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((crs) => (
                      <option key={crs._id} value={crs._id}>
                        {crs.title} {crs.domain ? `(${crs.domain})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Trainer / Tutor
                  </label>
                  <select
                    value={assignCourseForm.tutorId}
                    onChange={(e) => setAssignCourseForm(prev => ({ ...prev, tutorId: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Batch Default Trainer --</option>
                    {tutors.map((tut) => (
                      <option key={tut._id || tut.userId} value={tut._id || tut.userId}>
                        {tut.name} ({tut.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Training Mode
                  </label>
                  <select
                    value={assignCourseForm.mode}
                    onChange={(e) => setAssignCourseForm(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={assignCourseForm.startDate}
                    onChange={(e) => setAssignCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="sendCredentialsEmail"
                  checked={assignCourseForm.sendEmails}
                  onChange={(e) => setAssignCourseForm(prev => ({ ...prev, sendEmails: e.target.checked }))}
                  className="rounded text-blue-800 focus:ring-purple-500 h-4 w-4"
                />
                <label htmlFor="sendCredentialsEmail" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Send new course credentials to students automatically via email
                </label>
              </div>

              {/* Student Multi-Selection Box */}
              <div className="border border-blue-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-800" />
                    <span className="text-xs font-black text-slate-800">
                      Select Students ({assignCourseForm.studentUserIds.length} / {batchDetails?.students?.length || 0} selected)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllStudentsForCourse}
                    className="text-xs font-bold text-blue-800 hover:text-purple-800 flex items-center space-x-1 cursor-pointer"
                  >
                    {assignCourseForm.studentUserIds.length === (batchDetails?.students?.length || 0) ? (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {batchDetails?.students && batchDetails.students.length > 0 ? (
                    batchDetails.students.map((student) => {
                      const isSelected = assignCourseForm.studentUserIds.includes(student._id);
                      const currentCourse = student.currentCourseName || student.activeEnrollment?.courseName || 'None';
                      const isAccessActive = student.loginAccessStatus === 'ACTIVE';

                      return (
                        <div
                          key={student._id}
                          onClick={() => handleToggleStudentSelection(student._id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${ isSelected ? 'bg-white border-blue-200 text-purple-900 font-semibold' : 'bg-white border-blue-200 hover:bg-white text-slate-700' }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-blue-800 focus:ring-purple-500 h-4 w-4 pointer-events-none"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">
                                {student.permanentStudentId || student.studentId || student.email}
                              </p>
                            </div>
                          </div>

                          <div className="text-right flex items-center space-x-2">
                            <span className="text-[11px] bg-white text-slate-700 px-2 py-0.5 rounded font-medium">
                              Current: {currentCourse}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center space-x-1 ${ isAccessActive ? 'bg-white text-emerald-800' : 'bg-white text-slate-600' }`}
                            >
                              {isAccessActive ? <Unlock className="w-2.5 h-2.5 inline mr-1" /> : <Lock className="w-2.5 h-2.5 inline mr-1" />}
                              <span>{isAccessActive ? 'Active' : 'Deactivated'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      No students found in this batch roster.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAssignCourseModalOpen(false)}
                className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAssignCourse || assignCourseForm.studentUserIds.length === 0}
                className="bg-white px-6 py-2.5 disabled:opacity-50 text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center space-x-2 border border-blue-600"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {submittingAssignCourse
                    ? 'Assigning Course...'
                    : `Assign Course to ${assignCourseForm.studentUserIds.length} Student${assignCourseForm.studentUserIds.length === 1 ? '' : 's'}`}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: ASSIGNED CREDENTIALS RESULT MODAL */}
      {/* ────────────────────────────────────────────────────────── */}
      {assignedCredentialsResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAssignedCredentialsResult(null)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-black text-slate-900">Course Credentials Generated</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                New course logins have been successfully generated for {assignedCredentialsResult.length} student(s). Existing profiles and previous courses are preserved.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-emerald-900 text-xs font-semibold flex items-start space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Login Access Status: ACTIVE</p>
                <p className="text-[11px] font-normal text-emerald-800">
                  Students can log in with these credentials right away. When their course is marked completed, login access will be automatically deactivated.
                </p>
              </div>
            </div>

            <div className="border border-blue-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-blue-200 font-black text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Student Name & ID</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Course</th>
                    <th className="px-4 py-2.5">New Username</th>
                    <th className="px-4 py-2.5">Temporary Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {assignedCredentialsResult.map((cred, idx) => (
                    <tr key={idx} className="hover:bg-white">
                      <td className="px-4 py-2.5">
                        <p className="font-bold text-slate-900">{cred.studentName}</p>
                        <p className="text-[10px] font-mono text-blue-800">{cred.permanentStudentId || cred.studentId}</p>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                        {cred.email}
                        {cred.emailSent && (
                          <span className="block text-[10px] text-emerald-600 font-bold">Email Dispatched ✓</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800 font-bold">{cred.courseName}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-purple-900 border border-blue-200">
                          {cred.courseUsername}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white text-amber-900 border border-amber-200">
                          {cred.temporaryPassword}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const text = assignedCredentialsResult
                    .map(c => `Name: ${c.studentName} | Email: ${c.email} | Course: ${c.courseName} | Username: ${c.courseUsername} | Password: ${c.temporaryPassword}`)
                    .join('\n');
                  navigator.clipboard.writeText(text);
                  showToast('Credentials copied to clipboard!');
                }}
                className="px-4 py-2 bg-white text-blue-800 hover:bg-white border border-blue-200 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All to Clipboard</span>
              </button>

              <button
                type="button"
                onClick={() => setAssignedCredentialsResult(null)}
                className="bg-white px-6 py-2 text-blue-700 hover:opacity-95 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer border border-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: CONFIRM COURSE COMPLETION & REVOKE ACCESS */}
      {/* ────────────────────────────────────────────────────────── */}
      {isCompleteConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsCompleteConfirmModalOpen(false)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-white text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {completeTarget?.type === 'batch'
                  ? 'Complete Batch Course & Deactivate Logins'
                  : 'Complete Student Course & Deactivate Login'}
              </h2>
            </div>

            <div className="bg-white border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs font-semibold leading-relaxed space-y-1.5">
              <p className="font-bold flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Immediate Login Access Deactivation</span>
              </p>
              <p className="font-normal text-rose-800">
                This course will officially be marked as <strong>COMPLETED</strong>.
                Student login credentials for this course will immediately be <strong>DEACTIVATED and REVOKED</strong>, and active sessions will be terminated.
              </p>
              <p className="font-normal text-rose-800">
                ✓ Student profiles, completed course records, marks, and attendance history will remain <strong>permanently preserved</strong>.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs font-medium">
              <p><strong>Target:</strong> {completeTarget?.type === 'batch' ? `Entire Batch (${batchDetails?.batch?.name})` : completeTarget?.studentName}</p>
              <p><strong>Course:</strong> {completeTarget?.courseName}</p>
              {completeTarget?.type === 'batch' && (
                <p><strong>Affected Students:</strong> {batchDetails?.students?.length || 0} Students</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Completion Reason / Notes
                </label>
                <input
                  type="text"
                  value={completeTarget?.reason || ''}
                  onChange={(e) => setCompleteTarget(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Training curriculum completed successfully"
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCompleteConfirmModalOpen(false)}
                className="px-4 py-2 bg-white text-slate-700 hover:bg-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingComplete}
                onClick={handleConfirmCompleteCourse}
                className="bg-white px-6 py-2.5 text-blue-700 rounded-xl font-bold text-xs shadow-sm transition flex items-center space-x-2 cursor-pointer border border-blue-600"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{submittingComplete ? 'Revoking Access...' : 'Confirm & Revoke Access'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 4: STUDENT COURSE ENROLLMENT HISTORY */}
      {/* ────────────────────────────────────────────────────────── */}
      {isHistoryModalOpen && selectedHistoryStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsHistoryModalOpen(false);
                setSelectedHistoryStudent(null);
              }}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-800" />
                <span>Student Course & Access History</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Preserved historical course completions and credentials lifecycle for <strong className="text-slate-900">{selectedHistoryStudent.name}</strong>.
              </p>
            </div>

            {/* Student Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
                <span className="font-bold text-slate-900">{selectedHistoryStudent.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Permanent ID</span>
                <span className="font-mono font-bold text-blue-800">{selectedHistoryStudent.permanentStudentId || selectedHistoryStudent.studentId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                <span className="font-mono text-slate-700 truncate block" title={selectedHistoryStudent.email}>{selectedHistoryStudent.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch</span>
                <span className="font-semibold text-slate-800">{batchDetails?.batch?.name || 'N/A'}</span>
              </div>
            </div>

            {/* Active Course Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Current Active Course</span>
              </h3>
              {selectedHistoryStudent.activeEnrollment ? (
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-emerald-950">{selectedHistoryStudent.activeEnrollment.courseName}</p>
                    <p className="text-[11px] font-medium text-emerald-800">
                      Username: <span className="font-mono font-bold text-emerald-900">{selectedHistoryStudent.activeEnrollment.courseUsername || 'Standard student account'}</span> | Mode: {selectedHistoryStudent.activeEnrollment.mode || 'ONLINE'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-white text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <Unlock className="w-2.5 h-2.5 mr-1" />
                    <span>Login Active</span>
                  </span>
                </div>
              ) : (
                <div className="p-3.5 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  No active course at this time. Student can be assigned a new course from the batch roster.
                </div>
              )}
            </div>

            {/* Completed Courses History */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-blue-800" />
                <span>Completed Courses & Deactivated Logins ({selectedHistoryStudent.completedEnrollments?.length || 0})</span>
              </h3>

              {selectedHistoryStudent.completedEnrollments && selectedHistoryStudent.completedEnrollments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedHistoryStudent.completedEnrollments.map((enr, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-slate-900">{enr.courseName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-slate-800">
                            COMPLETED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Completed: {enr.completionDate ? new Date(enr.completionDate).toLocaleDateString() : 'N/A'}
                          {enr.revocationReason ? ` • ${enr.revocationReason}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-start sm:self-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white text-rose-800 border border-rose-200 flex items-center space-x-1">
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          <span>Login Deactivated</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  No previous completed courses recorded for this student.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsHistoryModalOpen(false);
                  setSelectedHistoryStudent(null);
                }}
                className="px-6 py-2 bg-white hover:bg-white text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: RESET STUDENT TEMPORARY PASSWORD */}
      {/* ────────────────────────────────────────────────────────── */}
      {isResetPasswordModalOpen && selectedStudentForPassword && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => {
                setIsResetPasswordModalOpen(false);
                setSelectedStudentForPassword(null);
                setGeneratedPasswordResult(null);
              }}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Reset Student Password</h3>
                <p className="text-xs text-slate-500">
                  Manage temporary credentials & enforce first-login password update
                </p>
              </div>
            </div>

            {/* Student Info Card */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Student Name:</span>
                <span className="font-bold text-slate-900">{selectedStudentForPassword.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Student ID:</span>
                <span className="font-mono font-bold text-blue-700">{selectedStudentForPassword.studentId || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Username:</span>
                <span className="font-mono text-purple-700 font-bold">{selectedStudentForPassword.username}</span>
              </div>
            </div>

            {/* Generated Password Result (Show ONCE with Copy) */}
            {generatedPasswordResult ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-center">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Temporary Password Generated</span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    This temporary password is displayed <strong>once</strong>. Please copy and provide it to the student.
                  </p>
                  <div className="bg-white border-2 border-emerald-300 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
                    <span className="font-mono text-base font-black text-slate-900 tracking-wider">
                      {generatedPasswordResult}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPasswordResult);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2500);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                    >
                      {copiedPassword ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Security & Account Policy</span>
                  </p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    The student will be forced to change this temporary password immediately on next login. Passwords are securely hashed with bcrypt and never stored in plaintext.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPasswordModalOpen(false);
                      setSelectedStudentForPassword(null);
                      setGeneratedPasswordResult(null);
                    }}
                    className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Password Option</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAutoGeneratePassword(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                        autoGeneratePassword
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Auto-Generate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoGeneratePassword(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                        !autoGeneratePassword
                          ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Custom Password</span>
                    </button>
                  </div>
                </div>

                {!autoGeneratePassword && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Custom Temporary Password (min 6 characters) *
                    </label>
                    <input
                      type="text"
                      required={!autoGeneratePassword}
                      value={customPasswordInput}
                      onChange={(e) => setCustomPasswordInput(e.target.value)}
                      placeholder="e.g. StudentPass#2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-blue-500"
                    />
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Password Lifecycle Rule:</p>
                  <p className="leading-relaxed">
                    Resetting will overwrite previous credentials and set <code>mustChangePassword: true</code>. Stored plaintext passwords cannot be viewed or exported.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetPasswordModalOpen(false);
                      setSelectedStudentForPassword(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPasswordReset}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{submittingPasswordReset ? 'Resetting...' : 'Reset Temporary Password'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT STUDENT DETAILS */}
      {/* ────────────────────────────────────────────────────────── */}
      {isEditStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <form
            onSubmit={handleEditStudentSubmit}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-6 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl">
              <button
                type="button"
                onClick={() => setIsEditStudentModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 pr-8">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Edit Student Details</h3>
                  <p className="text-xs text-slate-500">
                    Update student identity, academic metadata, course enrollment, and login status
                  </p>
                </div>
              </div>
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Student ID */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.studentId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, studentId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-purple-500"
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.name}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-purple-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.department}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, department: e.target.value })}
                    placeholder="e.g. CSE"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-purple-500"
                  />
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Year *</label>
                  <select
                    value={editStudentForm.academicYear}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, academicYear: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-purple-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>

                {/* Username */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Login Username *</label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.username}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-purple-700 focus:outline-purple-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editStudentForm.email}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-purple-500"
                  />
                </div>

                {/* Current Course */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Course</label>
                  <select
                    value={editStudentForm.courseId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, courseId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-purple-500"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.category || 'Course'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enrollment Status */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enrollment Status</label>
                  <select
                    value={editStudentForm.enrollmentStatus}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, enrollmentStatus: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DROPPED">DROPPED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                {/* Login Access Status */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Login Access</label>
                  <select
                    value={editStudentForm.loginAccess}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, loginAccess: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DEACTIVE">DEACTIVE</option>
                  </select>
                  {editStudentForm.loginAccess === 'DEACTIVE' && (
                    <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2 text-[11px] text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Deactivation Notice:</strong> Selecting <strong>DEACTIVE</strong> will immediately revoke student login access, terminate active sessions, and invalidate auth tokens. Course progress and academic records remain safely preserved.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────── */}
              {/* PASSWORD MANAGEMENT SECTION (Inside Edit Modal)     */}
              {/* ─────────────────────────────────────────────────── */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                      <Key className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Student Password Management</h4>
                      <p className="text-[10px] text-slate-400">Generate or set a new temporary password for student credentials</p>
                    </div>
                  </div>

                  {!showPasswordSection && !editModalPasswordResult && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordSection(true)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reset Password</span>
                    </button>
                  )}
                </div>

                {/* Password Reset Box */}
                {(showPasswordSection || editModalPasswordResult) && (
                  <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                    {editModalPasswordResult ? (
                      <div className="space-y-3">
                        <div className="bg-white border border-emerald-300 p-3.5 rounded-xl text-xs shadow-2xs space-y-2">
                          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>New Temporary Password Generated</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Provide this temporary password to <strong>{editStudentForm.name}</strong>. Student will be forced to change this password on their next login.
                          </p>

                          <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 rounded-xl px-3 py-2.5 font-mono font-black text-sm text-slate-900">
                            <span className="tracking-wider text-emerald-950 font-bold">{editModalPasswordResult}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(editModalPasswordResult);
                                setEditModalCopiedPassword(true);
                                showToast('Temporary password copied to clipboard!', 'success');
                                setTimeout(() => setEditModalCopiedPassword(false), 2500);
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                            >
                              {editModalCopiedPassword ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditModalPasswordResult(null);
                              setShowPasswordSection(true);
                            }}
                            className="text-[11px] text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer"
                          >
                            Generate another password
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 mb-1.5 block">Password Option</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditModalAutoGenerate(true)}
                              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                                editModalAutoGenerate
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Auto-Generate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditModalAutoGenerate(false)}
                              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                                !editModalAutoGenerate
                                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Key className="w-3.5 h-3.5 text-amber-600" />
                              <span>Custom Password</span>
                            </button>
                          </div>
                        </div>

                        {!editModalAutoGenerate && (
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">
                              Enter Custom Temporary Password (min 6 characters) *
                            </label>
                            <input
                              type="text"
                              value={editModalCustomPassword}
                              onChange={(e) => setEditModalCustomPassword(e.target.value)}
                              placeholder="e.g. StudentPass#2026"
                              className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-amber-500"
                            />
                          </div>
                        )}

                        <div className="bg-amber-100/40 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                          <span className="font-bold">Security Rule:</span> Passwords are saved with bcrypt hashing. Plaintext passwords cannot be retrieved from the database. A temporary password requires the student to set a new password on their next login.
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowPasswordSection(false)}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submittingModalPasswordReset}
                            onClick={handleModalResetPasswordSubmit}
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{submittingModalPasswordReset ? 'Saving...' : 'Confirm Reset Password'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditStudentModalOpen(false)}
                className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingStudentEdit}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{submittingStudentEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: DELETE STUDENT CONFIRMATION */}
      {/* ────────────────────────────────────────────────────────── */}
      {isDeleteStudentModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => {
                setIsDeleteStudentModalOpen(false);
                setStudentToDelete(null);
              }}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Delete Student from Batch</h3>
                <p className="text-xs text-slate-500">
                  Confirm student removal and credential revocation
                </p>
              </div>
            </div>

            {/* Target Student Details Box */}
            <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-2xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Student Name:</span>
                <span className="font-black text-slate-900">{studentToDelete.studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Student ID:</span>
                <span className="font-mono font-bold text-rose-700">{studentToDelete.studentId}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{studentToDelete.studentName}</strong> from this batch?
              This will unassign the student and deactivate active batch credentials. Past completed courses and payment history will be safely preserved.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteStudentModalOpen(false);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStudent}
                disabled={deletingStudent}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deletingStudent ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 4: ACTIVATE / DEACTIVATE LOGIN ACCESS CONFIRMATION */}
      {/* ────────────────────────────────────────────────────────── */}
      {statusConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setStatusConfirmTarget(null)}
              className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                statusConfirmTarget.nextStatus === 'DEACTIVE'
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                {statusConfirmTarget.nextStatus === 'DEACTIVE' ? (
                  <Lock className="w-6 h-6 text-rose-600" />
                ) : (
                  <Unlock className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {statusConfirmTarget.nextStatus === 'DEACTIVE' ? 'Deactivate Login Access?' : 'Activate Login Access?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusConfirmTarget.studentName} ({statusConfirmTarget.studentId})
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl text-xs space-y-2 ${
              statusConfirmTarget.nextStatus === 'DEACTIVE'
                ? 'bg-amber-50/80 border border-amber-200 text-amber-950'
                : 'bg-emerald-50/80 border border-emerald-200 text-emerald-950'
            }`}>
              {statusConfirmTarget.nextStatus === 'DEACTIVE' ? (
                <>
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Immediate Session & Credential Revocation</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Student login credentials will be deactivated immediately. Active JWT sessions and login tokens will be revoked, preventing further access to STACK QUEUE.
                  </p>
                  <p className="text-[10px] text-amber-700 font-semibold pt-1 border-t border-amber-200/60">
                    Student details, syllabus progress, test submissions, and payments will NOT be deleted.
                  </p>
                </>
              ) : (
                <>
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Restore STACK QUEUE Login Access</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Student login access will be activated immediately. The student will be able to log in to STACK QUEUE and resume their training dashboard and coursework.
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusConfirmTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingStatusToggle}
                onClick={handleConfirmStatusToggle}
                className={`px-5 py-2 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                  statusConfirmTarget.nextStatus === 'DEACTIVE'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submittingStatusToggle ? (
                  <span>Updating...</span>
                ) : (
                  <span>Confirm {statusConfirmTarget.nextStatus === 'DEACTIVE' ? 'Deactivation' : 'Activation'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD CUSTOM DEPARTMENT */}
      {/* ────────────────────────────────────────────────────────── */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <form
            onSubmit={handleSaveDepartment}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl space-y-3">
              <button
                type="button"
                onClick={() => setIsAddDeptModalOpen(false)}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 pr-8">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Add New Department</h3>
                  <p className="text-xs text-slate-500">
                    Custom academic department for partner college
                  </p>
                </div>
              </div>

              {/* Target College Indicator */}
              {(() => {
                const targetCol = colleges.find(c => c._id === addDeptTargetCollegeId);
                return targetCol ? (
                  <div className="px-3 py-2 bg-purple-50/60 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Target College:</span>
                    <span className="font-bold text-purple-900">{targetCol.name} ({targetCol.code})</span>
                  </div>
                ) : null;
              })()}
            </div>

            {/* SCROLLABLE FORM CONTENT */}
            <div className="sq-modal-body flex-1 px-6 py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDeptForm.name}
                  onChange={e => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  placeholder="e.g. Cyber Security, Civil Engineering, Biomedical"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Department Code <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newDeptForm.code}
                  onChange={e => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                  placeholder="e.g. CYBER, CIVIL, BME (Auto-generated if empty)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 uppercase font-mono font-bold text-purple-700 focus:outline-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={newDeptForm.description}
                  onChange={e => setNewDeptForm({ ...newDeptForm, description: e.target.value })}
                  placeholder="Brief curriculum description or domain notes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-purple-500 resize-none text-xs"
                />
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddDeptModalOpen(false)}
                className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingDept}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{submittingDept ? 'Saving...' : 'Save Department'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL: MANAGE DEPARTMENTS (CRUD) */}
      {/* ────────────────────────────────────────────────────────── */}
      {isManageDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* FIXED HEADER */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4 md:px-8 md:pt-6 md:pb-4 border-b border-slate-100 relative bg-white rounded-t-3xl space-y-4">
              <button
                type="button"
                onClick={() => {
                  setIsManageDeptModalOpen(false);
                  setEditingDeptId(null);
                }}
                className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between pr-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Department Management</h3>
                    <p className="text-xs text-slate-500">
                      {(() => {
                        const col = colleges.find(c => c._id === manageDeptCollegeId);
                        return col ? `${col.name} (${col.code})` : 'College Departments';
                      })()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAddDepartmentModal(manageDeptCollegeId)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Department</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={deptSearchTerm}
                  onChange={e => setDeptSearchTerm(e.target.value)}
                  placeholder="Search departments by name or code..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-purple-500"
                />
              </div>
            </div>

            {/* SCROLLABLE DEPARTMENT LIST */}
            <div className="sq-modal-body flex-1 px-6 py-5 md:px-8 md:py-6 space-y-2">
              {loadingDepartments ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                  Loading departments...
                </div>
              ) : collegeDepartments.filter(d => 
                  !deptSearchTerm.trim() ||
                  d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) ||
                  d.code.toLowerCase().includes(deptSearchTerm.toLowerCase())
                ).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold bg-slate-50 rounded-2xl border border-slate-100">
                  No departments found matching "{deptSearchTerm}".
                </div>
              ) : (
                collegeDepartments.filter(d => 
                  !deptSearchTerm.trim() ||
                  d.name.toLowerCase().includes(deptSearchTerm.toLowerCase()) ||
                  d.code.toLowerCase().includes(deptSearchTerm.toLowerCase())
                ).map(dept => {
                  const isEditing = editingDeptId === dept._id;
                  return (
                    <div
                      key={dept._id}
                      className="p-3 bg-white border border-slate-200/90 hover:border-purple-200 rounded-2xl transition space-y-2 shadow-2xs"
                    >
                      {isEditing ? (
                        <div className="space-y-2 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Department Name *</label>
                              <input
                                type="text"
                                value={editingDeptForm.name}
                                onChange={e => setEditingDeptForm({ ...editingDeptForm, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-purple-500 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Department Code</label>
                              <input
                                type="text"
                                value={editingDeptForm.code}
                                onChange={e => setEditingDeptForm({ ...editingDeptForm, code: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 uppercase font-mono font-bold text-purple-700 focus:outline-purple-500 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-end space-x-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingDeptId(null)}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={submittingEditDept}
                              onClick={() => handleSaveEditDept(dept._id)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                            >
                              <Save className="w-3 h-3" />
                              <span>{submittingEditDept ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                                {dept.code || 'N/A'}
                              </span>
                              <span className="font-bold text-slate-900 text-xs">{dept.name}</span>
                            </div>
                            {dept.description && (
                              <p className="text-[10px] text-slate-500 pl-0.5">{dept.description}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditDept(dept)}
                              className="p-1.5 bg-white hover:bg-purple-50 text-purple-600 border border-slate-200 hover:border-purple-300 rounded-lg transition cursor-pointer"
                              title="Edit Department"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={deletingDeptId === dept._id}
                              onClick={() => handleDeleteDept(dept._id)}
                              className="p-1.5 bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 hover:border-rose-300 rounded-lg transition cursor-pointer"
                              title="Delete Department"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* FIXED FOOTER */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-3xl flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsManageDeptModalOpen(false);
                  setEditingDeptId(null);
                }}
                className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-xs transition border border-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
