import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import EmploymentBadge from '../../components/common/EmploymentBadge';
import {
  Users, UserCheck, GraduationCap, Building2, BookOpen, Plus, Search,
  FileText, CheckCircle2, AlertCircle, X, ChevronRight, Upload, Eye, EyeOff,
  RefreshCw, Award, Clock, ShieldCheck, Mail, Phone, MapPin, Globe,
  Briefcase, Trash2, Edit3, Calendar, Check, AlertTriangle, ExternalLink,
  ShieldAlert, Activity, Filter, BarChart3, CheckSquare, Zap, Lock, Camera,
  CalendarCheck2, Download, XCircle
} from 'lucide-react';

const isValidIndianMobile = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') return false;
  const digits = rawPhone.replace(/\D/g, '');
  let ten = digits;
  if (digits.startsWith('91') && digits.length === 12) ten = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) ten = digits.slice(1);
  
  if (ten.length !== 10) return false;
  if (!/^[6-9]\d{9}$/.test(ten)) return false;
  if (/^(\d)\1{9}$/.test(ten)) return false;
  const DUMMY = ['1234567890', '0123456789', '9876543210', '0987654321', '2345678901'];
  if (DUMMY.includes(ten)) return false;
  return true;
};

export default function TutorManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');

  const cachedTutors = api.peekCache?.('/admin/tutors');
  const cachedCourses = api.peekCache?.('/admin/domain-management/courses');

  const [tutors, setTutors] = useState(cachedTutors?.data || []);
  const [courses, setCourses] = useState(cachedCourses?.data || []);
  const [loading, setLoading] = useState(!cachedTutors);

  // View Mode: 'roster' (Default Directory), 'quality_dashboard' (Data Quality Dashboard), or 'attendance' (Tutor Attendance Studio)
  const [viewMode, setViewMode] = useState(
    urlTab === 'attendance' ? 'attendance' : urlTab === 'quality_dashboard' ? 'quality_dashboard' : 'roster'
  );
  const [qualityReport, setQualityReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['roster', 'quality_dashboard', 'attendance'].includes(tabParam)) {
      setViewMode(tabParam);
    }
  }, [searchParams]);

  const handleSwitchViewMode = (mode) => {
    setViewMode(mode);
    setSearchParams(mode === 'roster' ? {} : { tab: mode });
  };

  // Tutor Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    date: new Date().toISOString().split('T')[0],
    totalTutors: 0,
    presentCount: 0,
    absentCount: 0,
    leaveCount: 0,
    notMarkedCount: 0,
    attendancePercentage: 0
  });
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('ALL');
  const [attendanceEmploymentFilter, setAttendanceEmploymentFilter] = useState('ALL');

  // Edit / Override Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingAttendanceTutor, setEditingAttendanceTutor] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    status: 'Present',
    checkIn: '09:30 AM',
    checkOut: '05:30 PM'
  });
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Drawer Attendance History State
  const [tutorAttendanceHistory, setTutorAttendanceHistory] = useState(null);
  const [loadingTutorHistory, setLoadingTutorHistory] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');

  // Modal & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [tutorDetails, setTutorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [drawerTab, setDrawerTab] = useState('overview');

  // Profile Drawer Animation & Edit States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [drawerAnimatedIn, setDrawerAnimatedIn] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Safe Delete States
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [deleteWarningInfo, setDeleteWarningInfo] = useState(null);
  const [deletingTutor, setDeletingTutor] = useState(false);

  // Onboarding Wizard Active Section & Step Lock Control
  const [activeSection, setActiveSection] = useState(1);
  const [maxUnlockedSection, setMaxUnlockedSection] = useState(1);

  // Validation Results & Verification States
  const [validationResult, setValidationResult] = useState(null);
  const [validatingPayload, setValidatingPayload] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  // Email OTP Real Verification States
  const [emailOtpModalOpen, setEmailOtpModalOpen] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(0); // 60 seconds

  // 5-Minute OTP Expiry Countdown Timer
  useEffect(() => {
    let timer;
    if (emailOtpModalOpen && emailOtpCountdown > 0) {
      timer = setInterval(() => {
        setEmailOtpCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailOtpModalOpen, emailOtpCountdown]);

  // 60-Second Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Resume Parsing States
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileMeta, setResumeFileMeta] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [fieldStatus, setFieldStatus] = useState({});

  // Profile Photo States
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form State (Complete 17-Section Structured Form)
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [dob, setDob] = useState('');
  const [qualification, setQualification] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Employment & Summary
  const [employmentType, setEmploymentType] = useState('FULL-TIME');
  const [professionalBio, setProfessionalBio] = useState('');
  const [totalExperience, setTotalExperience] = useState('3 Years');

  // Education Array
  const [educationList, setEducationList] = useState([
    { degree: 'B.E / B.Tech', specialization: 'Computer Science', institution: 'Engineering College', university: 'State University', startYear: 2018, endYear: 2022, grade: 'First Class' }
  ]);

  // Work Experience Array
  const [experienceList, setExperienceList] = useState([
    { company: 'Tech Solutions', jobTitle: 'Software Trainer', employmentType: 'Full-Time', startDate: '2022-01', endDate: 'Present', currentlyWorking: true, location: 'Bangalore', responsibilities: 'Delivered technical lectures and codebase labs.', skillsUsed: ['Java', 'Spring Boot', 'SQL'] }
  ]);

  // Skills List
  const [skillsList, setSkillsList] = useState([
    { name: 'Java', category: 'Programming Languages', proficiency: 'Advanced' },
    { name: 'Spring Boot', category: 'Frameworks', proficiency: 'Intermediate' },
    { name: 'React', category: 'Frameworks', proficiency: 'Intermediate' },
    { name: 'SQL / MySQL', category: 'Databases', proficiency: 'Advanced' },
    { name: 'Git & GitHub', category: 'Tools', proficiency: 'Advanced' }
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming Languages');

  // Teaching Domains
  const [selectedDomains, setSelectedDomains] = useState([]);

  // Specializations & Certifications & Languages
  const [primarySpec, setPrimarySpec] = useState('Java Full Stack');
  const [secondarySpec, setSecondarySpec] = useState('Data Structures & Algorithms');
  const [certificationsList, setCertificationsList] = useState([]);
  const [languagesList, setLanguagesList] = useState([
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Tamil', proficiency: 'Native' }
  ]);

  // Working Availability (Mon-Sun with flexible time controls)
  const [availabilityList, setAvailabilityList] = useState([
    { dayOfWeek: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
    { dayOfWeek: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
    { dayOfWeek: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
    { dayOfWeek: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
    { dayOfWeek: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
    { dayOfWeek: 'Saturday', startTime: '10:00 AM', endTime: '02:00 PM', isAvailable: false },
    { dayOfWeek: 'Sunday', startTime: '10:00 AM', endTime: '02:00 PM', isAvailable: false }
  ]);

  const [submittingTutor, setSubmittingTutor] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(null);

  useEffect(() => {
    loadData(!!cachedTutors);
  }, []);

  useEffect(() => {
    if (viewMode === 'quality_dashboard') {
      loadQualityReport();
    } else if (viewMode === 'attendance') {
      loadTutorAttendance(attendanceDate);
    }
  }, [viewMode, attendanceDate, attendanceStatusFilter, attendanceEmploymentFilter]);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [tutorRes, courseRes] = await Promise.all([
        api.get('/admin/tutors'),
        api.get('/admin/domain-management/courses').catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (tutorRes.data?.success) {
        setTutors(tutorRes.data.data || []);
      }
      if (courseRes.data?.success) {
        setCourses(courseRes.data.data || []);
      }
    } catch (err) {
      console.error('Error loading tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQualityReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.get('/admin/tutors/data-quality-report');
      if (res.data.success) {
        setQualityReport(res.data.report);
      }
    } catch (err) {
      console.error('Error loading quality report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  // Tutor Attendance Loading
  const loadTutorAttendance = async (targetDate = attendanceDate) => {
    setLoadingAttendance(true);
    try {
      const res = await api.get('/admin/tutors/attendance', {
        params: {
          date: targetDate,
          status: attendanceStatusFilter !== 'ALL' ? attendanceStatusFilter : undefined,
          employmentType: attendanceEmploymentFilter !== 'ALL' ? attendanceEmploymentFilter : undefined,
          search: attendanceSearch || undefined
        }
      });
      if (res.data.success) {
        setAttendanceRecords(res.data.data.records || []);
        setAttendanceSummary(res.data.data.summary || {
          date: targetDate,
          totalTutors: 0,
          presentCount: 0,
          absentCount: 0,
          leaveCount: 0,
          notMarkedCount: 0,
          attendancePercentage: 0
        });
      }
    } catch (err) {
      console.error('Failed to load tutor attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Quick Status Change (Present / Absent / Leave)
  const handleQuickMarkAttendance = async (tutor, newStatus) => {
    try {
      const defaultCheckIn = newStatus === 'Absent' ? '' : '09:30 AM';
      const defaultCheckOut = newStatus === 'Absent' ? '' : '05:30 PM';

      const res = await api.post('/admin/tutors/attendance/mark', {
        tutorId: tutor._id,
        date: attendanceDate,
        status: newStatus,
        checkIn: tutor.attendance?.checkIn || defaultCheckIn,
        checkOut: tutor.attendance?.checkOut || defaultCheckOut
      });

      if (res.data.success) {
        setAttendanceRecords(prev =>
          prev.map(r =>
            r._id === tutor._id
              ? {
                  ...r,
                  attendance: {
                    ...r.attendance,
                    status: newStatus,
                    checkIn: newStatus === 'Absent' ? '' : (r.attendance.checkIn || defaultCheckIn),
                    checkOut: newStatus === 'Absent' ? '' : (r.attendance.checkOut || defaultCheckOut)
                  }
                }
              : r
          )
        );
        loadTutorAttendance(attendanceDate);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating tutor attendance.');
    }
  };

  // Open Edit Attendance Modal
  const handleOpenEditAttendance = (tutor) => {
    setEditingAttendanceTutor(tutor);
    setAttendanceForm({
      status: tutor.attendance?.status && tutor.attendance?.status !== 'Not Marked' ? tutor.attendance.status : 'Present',
      checkIn: tutor.attendance?.checkIn || '09:30 AM',
      checkOut: tutor.attendance?.checkOut || '05:30 PM'
    });
    setIsAttendanceModalOpen(true);
  };

  // Save Attendance from Modal
  const handleSaveAttendanceForm = async (e) => {
    e.preventDefault();
    if (!editingAttendanceTutor) return;
    setSavingAttendance(true);
    try {
      const res = await api.post('/admin/tutors/attendance/mark', {
        tutorId: editingAttendanceTutor._id,
        date: attendanceDate,
        status: attendanceForm.status,
        checkIn: attendanceForm.status === 'Absent' ? '' : attendanceForm.checkIn,
        checkOut: attendanceForm.status === 'Absent' ? '' : attendanceForm.checkOut
      });
      if (res.data.success) {
        setIsAttendanceModalOpen(false);
        setEditingAttendanceTutor(null);
        loadTutorAttendance(attendanceDate);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save tutor attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  // Mark All Unmarked Tutors Present
  const handleMarkAllUnmarkedPresent = async () => {
    if (!window.confirm(`Mark all unmarked tutors as Present for ${attendanceDate}?`)) return;
    try {
      const res = await api.post('/admin/tutors/attendance/mark-all-present', {
        date: attendanceDate,
        onlyUnmarked: true,
        checkIn: '09:30 AM',
        checkOut: '05:30 PM'
      });
      if (res.data.success) {
        alert(res.data.message || 'All unmarked tutors marked Present.');
        loadTutorAttendance(attendanceDate);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking all present.');
    }
  };

  // Export CSV
  const handleExportAttendanceCsv = () => {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      alert('No attendance records to export for this date.');
      return;
    }
    const headers = ['Tutor Name', 'Tutor ID', 'Email', 'Phone', 'Employment Type', 'Date', 'Status', 'Check-In', 'Check-Out'];
    const rows = attendanceRecords.map(r => [
      `"${r.name || ''}"`,
      `"${r.tutorId || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.employmentType || ''}"`,
      `"${attendanceDate}"`,
      `"${r.attendance?.status || 'Not Marked'}"`,
      `"${r.attendance?.checkIn || ''}"`,
      `"${r.attendance?.checkOut || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tutor-attendance-${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load Tutor History for Drawer
  const loadTutorHistory = async (tutorUserId) => {
    if (!tutorUserId) return;
    setLoadingTutorHistory(true);
    try {
      const res = await api.get(`/admin/tutors/${tutorUserId}/attendance-history`);
      if (res.data.success) {
        setTutorAttendanceHistory(res.data.data);
      }
    } catch (err) {
      console.error('Error loading tutor attendance history:', err);
    } finally {
      setLoadingTutorHistory(false);
    }
  };

  // Step Lock Navigation Logic
  const canNavigateToSection = (targetSec) => {
    if (targetSec === 1) return true;

    if (!resumeFile && !resumeFileMeta) {
      alert('Please upload a Resume PDF to complete Step 1 before proceeding.');
      return false;
    }

    if (targetSec > 3 && !fullName.trim()) {
      alert('Please fill Full Name in Step 3 (Personal Info) before proceeding.');
      return false;
    }

    if (targetSec > 4 && !email.trim()) {
      alert('Please fill Email Address in Step 4 (Contact Info) before proceeding.');
      return false;
    }

    if (targetSec > 5 && (!username.trim() || !password)) {
      alert('Please fill Username and Initial Password in Step 5 (Account Info) before proceeding.');
      return false;
    }

    if (targetSec > 6 && !employmentType) {
      alert('Please select Employment Type in Step 6 before proceeding.');
      return false;
    }

    if (targetSec > maxUnlockedSection + 1 && targetSec > 2) {
      alert(`Please complete Step ${activeSection} before jumping forward to Step ${targetSec}.`);
      return false;
    }

    return true;
  };

  const handleNextSection = (currentSec) => {
    const nextSec = currentSec + 1;
    if (canNavigateToSection(nextSec)) {
      setMaxUnlockedSection(prev => Math.max(prev, nextSec));
      setActiveSection(nextSec);
    }
  };

  // Quick Shift Presets
  const handleApplyPresetShift = (type) => {
    if (type === 'FULL-TIME') {
      setAvailabilityList([
        { dayOfWeek: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
        { dayOfWeek: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
        { dayOfWeek: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
        { dayOfWeek: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
        { dayOfWeek: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
        { dayOfWeek: 'Saturday', startTime: '10:00 AM', endTime: '02:00 PM', isAvailable: false },
        { dayOfWeek: 'Sunday', startTime: '10:00 AM', endTime: '02:00 PM', isAvailable: false }
      ]);
    } else if (type === 'PART-TIME-EVENING') {
      setAvailabilityList([
        { dayOfWeek: 'Monday', startTime: '05:00 PM', endTime: '09:00 PM', isAvailable: true },
        { dayOfWeek: 'Tuesday', startTime: '05:00 PM', endTime: '09:00 PM', isAvailable: true },
        { dayOfWeek: 'Wednesday', startTime: '05:00 PM', endTime: '09:00 PM', isAvailable: true },
        { dayOfWeek: 'Thursday', startTime: '05:00 PM', endTime: '09:00 PM', isAvailable: true },
        { dayOfWeek: 'Friday', startTime: '05:00 PM', endTime: '09:00 PM', isAvailable: true },
        { dayOfWeek: 'Saturday', startTime: '02:00 PM', endTime: '06:00 PM', isAvailable: false },
        { dayOfWeek: 'Sunday', startTime: '02:00 PM', endTime: '06:00 PM', isAvailable: false }
      ]);
    } else if (type === 'WEEKEND-ONLY') {
      setAvailabilityList([
        { dayOfWeek: 'Monday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: false },
        { dayOfWeek: 'Tuesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: false },
        { dayOfWeek: 'Wednesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: false },
        { dayOfWeek: 'Thursday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: false },
        { dayOfWeek: 'Friday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: false },
        { dayOfWeek: 'Saturday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
        { dayOfWeek: 'Sunday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true }
      ]);
    } else if (type === 'FULL-WEEK') {
      setAvailabilityList(availabilityList.map(a => ({ ...a, isAvailable: true })));
    }
  };

  const handleAddCustomAvailabilitySlot = () => {
    setAvailabilityList([
      ...availabilityList,
      { dayOfWeek: 'Custom Shift', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true }
    ]);
  };

  const handleRemoveAvailabilitySlot = (idx) => {
    setAvailabilityList(availabilityList.filter((_, i) => i !== idx));
  };

  // Resume PDF Parser Handler
  const handleParseResume = async (e) => {
    const file = e?.target?.files?.[0] || resumeFile;
    if (!file) {
      alert('Please select a Resume PDF file first.');
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Only PDF resume files are accepted.');
      return;
    }

    setParsingResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/admin/tutors/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setResumeFileMeta(res.data.file);
        setFieldStatus(res.data.fieldStatus || {});
        setMaxUnlockedSection(prev => Math.max(prev, 2));
        const ext = res.data.extractedData;

        if (ext.fullName) setFullName(ext.fullName);
        if (ext.firstName) setFirstName(ext.firstName);
        if (ext.lastName) setLastName(ext.lastName);
        if (ext.email) {
          setEmail(ext.email);
          if (!username) setUsername(ext.email.split('@')[0]);
        }
        if (ext.phone) setPhone(ext.phone);
        if (ext.alternatePhone) setAlternatePhone(ext.alternatePhone);
        if (ext.socialLinks) {
          setLinkedin(ext.socialLinks.linkedin || '');
          setGithub(ext.socialLinks.github || '');
          setPortfolio(ext.socialLinks.portfolio || '');
        }
        if (ext.professionalBio) setProfessionalBio(ext.professionalBio);
        if (ext.totalExperience) setTotalExperience(ext.totalExperience);
        if (ext.education?.length > 0) setEducationList(ext.education);
        if (ext.experience?.length > 0) setExperienceList(ext.experience);
        if (ext.skills?.length > 0) setSkillsList(ext.skills);
        if (ext.certifications?.length > 0) setCertificationsList(ext.certifications);
        if (ext.languages?.length > 0) setLanguagesList(ext.languages);

        alert('Resume Parsed & Magic Bytes Checked! Please review the extracted profile details.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error parsing resume PDF.');
    } finally {
      setParsingResume(false);
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await api.post('/admin/tutors/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setPhotoUrl(res.data.photoUrl);
        setMaxUnlockedSection(prev => Math.max(prev, 3));
      }
    } catch (err) {
      alert('Photo upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Add Skill Handler
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkillsList([...skillsList, { name: newSkillName.trim(), category: newSkillCategory, proficiency: 'Advanced' }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx) => {
    setSkillsList(skillsList.filter((_, i) => i !== idx));
  };

  // Domain Selection Handler
  const handleToggleDomain = (course) => {
    const exists = selectedDomains.find(d => d.domainName === course.title);
    if (exists) {
      setSelectedDomains(selectedDomains.filter(d => d.domainName !== course.title));
    } else {
      setSelectedDomains([...selectedDomains, {
        domainId: course._id,
        domainName: course.title,
        teachingLevel: 'Primary',
        experienceYears: 3,
        priority: selectedDomains.length === 0 ? 'Primary' : 'Secondary'
      }]);
    }
  };

  // Real Email OTP Handlers
  const handleSendEmailOtp = async (targetEmail = email) => {
    const cleanEmail = (targetEmail || '').trim();
    if (!cleanEmail) {
      alert('Please enter a valid Email Address first.');
      return;
    }
    if (resendCooldown > 0) {
      alert(`Please wait ${resendCooldown} seconds before requesting a new OTP.`);
      return;
    }

    setSendingEmailOtp(true);
    setEmailOtpError('');
    try {
      const res = await api.post('/admin/tutors/send-email-otp', {
        email: cleanEmail,
        isEdit: Boolean(isEditingProfile)
      });

      if (res.data.success) {
        setEmailOtpModalOpen(true);
        setEmailOtpInput('');
        setEmailOtpError('');
        setEmailOtpCountdown(300); // 5-minute expiry
        setResendCooldown(60); // 60-second cooldown
        alert(`OTP sent successfully to ${cleanEmail}. Please check your Gmail inbox.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to send OTP. Please try again.';
      alert(`❌ ${msg}`);
      setEmailOtpError(msg);
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput || emailOtpInput.length !== 6) {
      setEmailOtpError('Please enter the 6-digit OTP code received in your email.');
      return;
    }

    setVerifyingEmailOtp(true);
    setEmailOtpError('');
    try {
      const res = await api.post('/admin/tutors/verify-email-otp', {
        email: email.trim(),
        otp: emailOtpInput.trim(),
        tutorId: tutorDetails?._id
      });

      if (res.data.success) {
        setEmailOtpVerified(true);
        setEmailOtpModalOpen(false);
        setEmailOtpError('');
        if (isEditingProfile && editFormData) {
          setEditFormData(prev => ({ ...prev, emailStatus: 'VERIFIED' }));
        }
        alert('Email verified successfully.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setEmailOtpError(msg);
    } finally {
      setVerifyingEmailOtp(false);
    }
  };



  // Pre-Submission Validation Check
  const handleValidatePayload = async () => {
    setValidatingPayload(true);
    try {
      const payload = getPayloadData();
      const res = await api.post('/admin/tutors/validate-payload', payload);
      if (res.data.success) {
        setValidationResult(res.data.validation);
        if (res.data.validation.duplicateInfo?.isPossibleDuplicate) {
          setDuplicateWarning(res.data.validation.duplicateInfo);
          setDuplicateModalOpen(true);
        } else if (res.data.validation.isValid) {
          alert('✅ All Data Validation Checks Passed! Ready to Save Tutor Profile.');
        } else {
          alert(`⚠️ Validation Errors Found: \n${res.data.validation.errors.join('\n')}`);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Validation request failed.');
    } finally {
      setValidatingPayload(false);
    }
  };

  const getPayloadData = () => ({
    fullName: fullName.trim(),
    firstName: firstName.trim() || fullName.split(' ')[0],
    lastName: lastName.trim() || fullName.split(' ').slice(1).join(' '),
    email: email.trim(),
    emailVerified: emailOtpVerified,
    username: username.trim() || email.split('@')[0],
    password,
    phone,
    alternatePhone,
    dob,
    qualification,
    expectedSalary: expectedSalary ? Number(expectedSalary) : 0,
    address,
    city,
    state,
    country,
    pincode,
    socialLinks: { linkedin, github, portfolio },
    employmentType,
    professionalBio,
    totalExperience,
    education: educationList,
    experience: experienceList,
    skills: skillsList,
    certifications: certificationsList,
    languages: languagesList,
    teachingDomains: selectedDomains,
    teachingSpecializations: {
      primary: primarySpec,
      secondary: secondarySpec,
      preferredTopics: skillsList.slice(0, 5).map(s => s.name)
    },
    availability: availabilityList,
    resumeDocument: resumeFileMeta || {},
    profilePhotoUrl: photoUrl
  });

  // Create Tutor Submission Handler
  const handleSaveTutor = async (e, forceBypassDuplicates = false) => {
    if (e) e.preventDefault();

    setSubmittingTutor(true);
    try {
      const payload = getPayloadData();
      const res = await api.post('/admin/tutors/create', payload);

      if (res.data.success) {
        setCreatedSuccess(res.data.data);
        setIsAddModalOpen(false);
        setDuplicateModalOpen(false);
        loadData();
      }
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes && errRes.errors && errRes.errors.length > 0) {
        alert(`❌ Validation Failed:\n- ${errRes.errors.join('\n- ')}`);
      } else if (errRes && errRes.message) {
        alert(`❌ ${errRes.message}`);
      } else {
        alert(`❌ ${err.message || 'Error creating tutor profile. Please check that email, username, and mobile number are unique.'}`);
      }
    } finally {
      setSubmittingTutor(false);
    }
  };

  // Open Full Profile View Drawer
  const openTutorDetails = async (tutorId) => {
    setSelectedTutorId(tutorId);
    setIsDrawerOpen(true);
    setIsDrawerClosing(false);
    setIsEditingProfile(false);
    setLoadingDetails(true);
    setDrawerTab('overview');
    try {
      const res = await api.get(`/admin/tutors/${tutorId}`);
      if (res.data.success) {
        setTutorDetails(res.data.data);
        const uId = res.data.data?.userId?._id || res.data.data?.userId || tutorId;
        loadTutorHistory(uId);
      }
    } catch (err) {
      alert('Error loading tutor profile details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Upload/update profile photo directly from Drawer
  const handleUploadProfilePhotoForTutor = async (e, tutorProfileId) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      if (e.target) e.target.value = '';
      return;
    }

    const targetId = tutorProfileId || tutorDetails?._id || tutorDetails?.tutorId || selectedTutorId;
    if (!targetId) {
      if (e.target) e.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const uploadRes = await api.post('/admin/tutors/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data?.success && uploadRes.data?.photoUrl) {
        const photoUrl = uploadRes.data.photoUrl;

        // Save profilePhotoUrl to DB
        const updateRes = await api.put(`/admin/tutors/${targetId}`, {
          profilePhotoUrl: photoUrl
        });

        if (updateRes.data?.success) {
          setTutorDetails(prev => (prev ? { ...prev, profilePhotoUrl: photoUrl } : prev));
          setTutors(prev => prev.map(t => (t._id === targetId || t.tutorId === targetId || t.userId?._id === targetId ? { ...t, profilePhotoUrl: photoUrl } : t)));
          if (typeof loadData === 'function') {
            loadData();
          }
        }
      }
    } catch (err) {
      console.error('Error updating tutor photo:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const closeDrawerWithAnimation = () => {
    if (isDrawerClosing) return;
    setIsDrawerClosing(true);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setIsDrawerClosing(false);
      setDrawerAnimatedIn(false);
      setSelectedTutorId(null);
      setTutorDetails(null);
      setIsEditingProfile(false);
    }, 300);
  };

  useEffect(() => {
    if (isDrawerOpen && !isDrawerClosing) {
      const animationFrame = requestAnimationFrame(() => setDrawerAnimatedIn(true));
      return () => cancelAnimationFrame(animationFrame);
    } else {
      setDrawerAnimatedIn(false);
    }
  }, [isDrawerOpen, isDrawerClosing]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteConfirmModalOpen) {
          setDeleteConfirmModalOpen(false);
        } else if (isDrawerOpen) {
          closeDrawerWithAnimation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, deleteConfirmModalOpen, isDrawerClosing]);

  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);
  const [uploadingEditResume, setUploadingEditResume] = useState(false);

  const startEditingProfile = () => {
    if (!tutorDetails) return;
    const primaryDom = tutorDetails.teachingDomains?.find(d => d.priority === 'Primary') || tutorDetails.teachingDomains?.[0];
    setEditFormData({
      fullName: tutorDetails.fullName || tutorDetails.userId?.name || '',
      email: tutorDetails.userId?.email || tutorDetails.email || '',
      phone: tutorDetails.phone || '',
      password: '',
      qualification: tutorDetails.qualification || '',
      totalExperience: tutorDetails.totalExperience || '3 Years',
      employmentType: tutorDetails.employmentType || 'FULL-TIME',
      primaryDomain: primaryDom ? primaryDom.domainName : (tutorDetails.primaryDomain || 'Java Full Stack'),
      city: tutorDetails.city || '',
      state: tutorDetails.state || 'Tamil Nadu',
      pincode: tutorDetails.pincode || '',
      address: tutorDetails.address || '',
      expectedSalary: (() => {
        const rawSal = Number(tutorDetails.expectedAnnualSalary || tutorDetails.expectedSalary || 0);
        return (rawSal > 0 && rawSal <= 250000) ? rawSal * 12 : (rawSal || '');
      })(),
      professionalBio: tutorDetails.professionalBio || '',
      profilePhotoUrl: tutorDetails.profilePhotoUrl || '',
      resumeDocument: tutorDetails.resumeDocument || {}
    });
    setShowEditPassword(false);
    setIsEditingProfile(true);
  };

  const handleEditPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPG, PNG, WEBP) are accepted for profile photo.');
      if (e.target) e.target.value = '';
      return;
    }
    setUploadingEditPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.post('/admin/tutors/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        setEditFormData(prev => ({ ...prev, profilePhotoUrl: res.data.photoUrl }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploadingEditPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleEditResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF resume files (.pdf) are accepted! External links, URLs, images, or doc files are rejected.');
      e.target.value = '';
      return;
    }
    setUploadingEditResume(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/admin/tutors/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setEditFormData(prev => ({ ...prev, resumeDocument: res.data.file }));
        alert('New Resume PDF uploaded and magic bytes verified!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload Resume PDF.');
    } finally {
      setUploadingEditResume(false);
    }
  };

  const handleSaveEditedProfile = async (e) => {
    if (e) e.preventDefault();
    if (!editFormData.fullName?.trim()) {
      alert('Full Name is required.');
      return;
    }
    if (!editFormData.email?.trim()) {
      alert('Email Address is required.');
      return;
    }
    if (!editFormData.phone?.trim()) {
      alert('Phone Number is required.');
      return;
    }
    if (!isValidIndianMobile(editFormData.phone)) {
      alert('Please enter a valid 10-digit Indian Mobile Number starting with 6,7,8,9 (Dummy & repetitive numbers like 9999999999 are rejected).');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await api.put(`/admin/tutors/${tutorDetails._id}`, editFormData);
      if (res.data.success) {
        setTutorDetails(res.data.data);
        setTutors(prev => prev.map(t => {
          if (t._id === tutorDetails._id || t.tutorId === tutorDetails.tutorId) {
            return {
              ...t,
              fullName: editFormData.fullName,
              email: editFormData.email,
              phone: editFormData.phone,
              employmentType: editFormData.employmentType,
              totalExperience: editFormData.totalExperience
            };
          }
          return t;
        }));
        setIsEditingProfile(false);
        alert('Tutor profile updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update tutor profile.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleInitiateDeleteTutor = () => {
    if (!tutorDetails) return;
    const batchesCount = tutorDetails.assignedBatches?.length || 0;
    const studentsCount = tutorDetails.assignedStudents?.length || 0;
    setDeleteWarningInfo({
      batchesCount,
      studentsCount,
      hasDependencies: batchesCount > 0 || studentsCount > 0
    });
    setDeleteConfirmModalOpen(true);
  };

  const handleConfirmDeleteTutor = async () => {
    if (!tutorDetails) return;
    setDeletingTutor(true);
    try {
      const res = await api.delete(`/admin/tutors/${tutorDetails._id}?force=true`);
      if (res.data.success) {
        setDeleteConfirmModalOpen(false);
        closeDrawerWithAnimation();
        setTutors(prev => prev.filter(t => t._id !== tutorDetails._id && t.tutorId !== tutorDetails.tutorId));
        alert('Tutor profile deleted successfully.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete tutor.');
    } finally {
      setDeletingTutor(false);
    }
  };

  const resetAddForm = () => {
    setActiveSection(1);
    setMaxUnlockedSection(1);
    setValidationResult(null);
    setDuplicateWarning(null);
    setEmailOtpVerified(false);
    setResumeFile(null);
    setResumeFileMeta(null);
    setFieldStatus({});
    setPhotoUrl('');
    setFullName('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setUsername('');
    setPassword('Tutor@123');
    setShowPassword(false);
    setPhone('');
    setAlternatePhone('');
    setDob('');
    setQualification('');
    setExpectedSalary('');
    setAddress('');
    setCity('');
    setState('Tamil Nadu');
    setPincode('');
    setLinkedin('');
    setGithub('');
    setPortfolio('');
    setEmploymentType('FULL-TIME');
    setProfessionalBio('');
    setTotalExperience('3 Years');
    setSelectedDomains([]);
  };

  // Filtered Tutors List
  const filteredTutors = tutors.filter(t => {
    const matchesEmp = employmentFilter === 'ALL' || t.employmentType === employmentFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesDomain = domainFilter === 'ALL' || (t.primaryDomain && t.primaryDomain.toLowerCase().includes(domainFilter.toLowerCase()));
    const s = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (t.fullName || '').toLowerCase().includes(s) ||
      (t.tutorId || '').toLowerCase().includes(s) ||
      (t.username || '').toLowerCase().includes(s) ||
      (t.email || '').toLowerCase().includes(s) ||
      (t.phone || '').toLowerCase().includes(s);

    return matchesEmp && matchesStatus && matchesDomain && matchesSearch;
  });

  if (loading && tutors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 md:p-8 text-slate-900 relative overflow-hidden shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Tutor & Trainer Onboarding Directory</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Tutor Management Studio</h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Resume PDF parsing, verified structured profiles, full-time/part-time employment governance, domain assignments, and batch class scheduling.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs text-xs font-bold">
              <button
                onClick={() => handleSwitchViewMode('roster')}
                className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'roster' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Roster Directory
              </button>
              <button
                onClick={() => handleSwitchViewMode('quality_dashboard')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${viewMode === 'quality_dashboard' ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Data Quality Dashboard</span>
              </button>
              <button
                onClick={() => handleSwitchViewMode('attendance')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${viewMode === 'attendance' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>Tutor Attendance</span>
              </button>
            </div>

            <button
              onClick={() => {
                resetAddForm();
                setIsAddModalOpen(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-purple-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tutor (Resume Onboarding)</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ROSTER DIRECTORY */}
      {viewMode === 'roster' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tutors</span>
                <h3 className="text-2xl font-black text-slate-900">{tutors.length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full-Time</span>
                <h3 className="text-2xl font-black text-slate-900">{tutors.filter(t => t.employmentType === 'FULL-TIME').length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Part-Time</span>
                <h3 className="text-2xl font-black text-slate-900">{tutors.filter(t => t.employmentType === 'PART-TIME').length}</h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teaching Domains</span>
                <h3 className="text-2xl font-black text-slate-900">{courses.length}</h3>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tutor ID, name, email, phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Employment:</span>
                <select
                  value={employmentFilter}
                  onChange={e => setEmploymentFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">All Types</option>
                  <option value="FULL-TIME">FULL-TIME</option>
                  <option value="PART-TIME">PART-TIME</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tutor Roster Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Verified Tutor Directory ({filteredTutors.length})
              </h2>
            </div>

            {filteredTutors.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm">No tutor accounts found matching criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map(t => (
                  <div
                    key={t._id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          {t.profilePhotoUrl ? (
                            <img
                              src={t.profilePhotoUrl}
                              alt={t.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-purple-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                              {t.fullName ? t.fullName.charAt(0) : 'T'}
                            </div>
                          )}

                          <div>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                              {t.tutorId}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-0.5">{t.fullName}</h3>
                            <p className="text-[11px] text-slate-500 font-mono">@{t.username}</p>
                          </div>
                        </div>

                        <EmploymentBadge type={t.employmentType} />
                      </div>

                      <div className="text-xs text-slate-600 space-y-1.5 font-medium border-t border-slate-100 pt-3">
                        <p className="flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.email}</span>
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            t.emailStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                            t.emailStatus === 'DOMAIN_VALID' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t.emailStatus || 'FORMAT_VALID'}
                          </span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.phone}</span>
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            t.phoneStatus === 'OTP_VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {t.phoneStatus || 'FORMAT_VALID'}
                          </span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Domain: <strong>{t.primaryDomain}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => openTutorDetails(t._id)}
                        className="text-xs text-purple-700 font-bold hover:text-purple-900 flex items-center space-x-1"
                      >
                        <span>View Verified Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW MODE 2: DATA QUALITY DASHBOARD */}
      {viewMode === 'quality_dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Data Quality & Authenticity Audit Dashboard</h2>
              <p className="text-xs text-slate-500">Real-time health score, validation status breakdown, and audit log across tutor records.</p>
            </div>
            <button
              onClick={loadQualityReport}
              disabled={loadingReport}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReport ? 'animate-spin' : ''}`} />
              <span>Run Quality Audit</span>
            </button>
          </div>

          {loadingReport || !qualityReport ? (
            <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-bold">Analyzing tutor records and validating MX/DNS records...</p>
            </div>
          ) : (
            <>
              {/* Quality KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Data Health Index</span>
                  <div className="flex items-baseline space-x-1">
                    <h3 className="text-4xl font-black">{qualityReport.healthScore}%</h3>
                    <span className="text-xs font-bold">Quality Score</span>
                  </div>
                  <p className="text-[10px] opacity-80 font-mono mt-2">Authoritative Validation Standard</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tutors</span>
                  <h3 className="text-2xl font-black text-slate-900">{qualityReport.totalTutors}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Recorded Accounts</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Fully Validated</span>
                  <h3 className="text-2xl font-black text-emerald-700">{qualityReport.fullyValidatedCount}</h3>
                  <span className="text-[10px] text-emerald-600 font-mono">Passed All Checks</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending OTP</span>
                  <h3 className="text-2xl font-black text-amber-700">{qualityReport.pendingVerificationCount}</h3>
                  <span className="text-[10px] text-amber-600 font-mono">Format Validated</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Duplicates & Issues</span>
                  <h3 className="text-2xl font-black text-rose-700">{qualityReport.duplicateRecordsCount + qualityReport.qualityIssues.length}</h3>
                  <span className="text-[10px] text-rose-600 font-mono">Requires Action</span>
                </div>
              </div>

              {/* Verification Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>Email Verification Status Distribution</span>
                  </h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span>OTP Verified Inbox</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{qualityReport.emailBreakdown.verified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-fuchsia-500"></span>
                        <span>Domain & MX Record Verified</span>
                      </span>
                      <span className="font-mono font-bold text-fuchsia-700">{qualityReport.emailBreakdown.domainValid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-purple-400"></span>
                        <span>Syntax Format Valid</span>
                      </span>
                      <span className="font-mono font-bold text-purple-700">{qualityReport.emailBreakdown.formatValid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span>Disposable / Invalid Email</span>
                      </span>
                      <span className="font-mono font-bold text-rose-700">{qualityReport.emailBreakdown.disposable + qualityReport.emailBreakdown.invalid}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-pink-600" />
                    <span>Phone Verification Status Distribution</span>
                  </h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span>Indian +91 Mobile OTP Verified</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700">{qualityReport.phoneBreakdown.otpVerified}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-fuchsia-500"></span>
                        <span>Syntax Format Valid (+91 10-Digit)</span>
                      </span>
                      <span className="font-mono font-bold text-fuchsia-700">{qualityReport.phoneBreakdown.formatValid}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        <span>Invalid / Repetitive Number</span>
                      </span>
                      <span className="font-mono font-bold text-rose-700">{qualityReport.phoneBreakdown.invalid}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Issues Audit List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Actionable Quality Issues Audit ({qualityReport.qualityIssues.length})</span>
                </h3>

                {qualityReport.qualityIssues.length === 0 ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center">
                    🎉 Excellent! All tutor records pass mandatory quality checks with 0 warnings.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {qualityReport.qualityIssues.map((iss, idx) => (
                      <div key={idx} className="bg-rose-50/60 border border-rose-200/80 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                            {iss.tutorId}
                          </span>
                          <span className="font-bold text-slate-900">{iss.name}</span>
                          <span className="text-rose-700 font-semibold">• {iss.issue}</span>
                        </div>
                        <button
                          onClick={() => {
                            const found = tutors.find(t => t.tutorId === iss.tutorId);
                            if (found) openTutorDetails(found._id);
                          }}
                          className="px-3 py-1 bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold rounded-lg transition"
                        >
                          Review & Fix
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* VIEW MODE 3: TUTOR ATTENDANCE STUDIO */}
      {viewMode === 'attendance' && (
        <div className="space-y-6">
          {/* Top Control Bar: Date Navigation & Actions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setAttendanceDate(new Date().toISOString().split('T')[0])}
                  className={`px-3 py-1 rounded-lg transition ${
                    attendanceDate === new Date().toISOString().split('T')[0]
                      ? 'bg-white text-purple-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setAttendanceDate(yesterday.toISOString().split('T')[0]);
                  }}
                  className={`px-3 py-1 rounded-lg transition ${
                    attendanceDate === new Date(Date.now() - 86400000).toISOString().split('T')[0]
                      ? 'bg-white text-purple-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => loadTutorAttendance(attendanceDate)}
                disabled={loadingAttendance}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                title="Refresh attendance data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAttendance ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleMarkAllUnmarkedPresent}
                className="px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Mark Unmarked Present</span>
              </button>

              <button
                onClick={handleExportAttendanceCsv}
                className="px-4 py-2 bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-purple-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tutors</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 mt-2">{attendanceSummary.totalTutors}</h4>
              <span className="text-[10px] text-slate-500 font-medium mt-1">Active in Studio</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-2xl font-black text-emerald-600 mt-2">{attendanceSummary.presentCount}</h4>
              <span className="text-[10px] text-emerald-700 font-bold mt-1">Clocked In</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Absent</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <h4 className="text-2xl font-black text-rose-600 mt-2">{attendanceSummary.absentCount}</h4>
              <span className="text-[10px] text-rose-600 font-medium mt-1">No Show</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">On Leave</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="text-2xl font-black text-amber-600 mt-2">{attendanceSummary.leaveCount}</h4>
              <span className="text-[10px] text-amber-700 font-medium mt-1">Approved Leave</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Not Marked</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-2xl font-black text-slate-600 mt-2">{attendanceSummary.notMarkedCount}</h4>
              <span className="text-[10px] text-slate-500 font-medium mt-1">Pending Status</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-600">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rate</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <h4 className="text-2xl font-black text-indigo-600 mt-2">{attendanceSummary.attendancePercentage}%</h4>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, attendanceSummary.attendancePercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tutor by name, email, TUT ID..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <select
                value={attendanceStatusFilter}
                onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Present">Present Only</option>
                <option value="Absent">Absent Only</option>
                <option value="Leave">On Leave Only</option>
                <option value="Not Marked">Not Marked Only</option>
              </select>

              <select
                value={attendanceEmploymentFilter}
                onChange={(e) => setAttendanceEmploymentFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="ALL">All Employment</option>
                <option value="FULL-TIME">Full-Time Only</option>
                <option value="PART-TIME">Part-Time Only</option>
              </select>
            </div>
          </div>

          {/* Attendance Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <CalendarCheck2 className="w-4 h-4 text-purple-600" />
                <h3 className="font-black text-sm text-slate-900">
                  Tutor Attendance Roster — {new Date(attendanceDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {attendanceRecords.length} {attendanceRecords.length === 1 ? 'Tutor' : 'Tutors'} Displayed
              </span>
            </div>

            {loadingAttendance ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-bold text-slate-500">Loading attendance roster for {attendanceDate}...</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <CalendarCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-slate-700">No tutors match the selected criteria</h4>
                <p className="text-xs text-slate-400 mt-1">Try clearing search filters or changing the date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-6">Tutor &amp; Profile</th>
                      <th className="py-3 px-4">Employment</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Check-In Time</th>
                      <th className="py-3 px-4 text-center">Check-Out Time</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-6 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {attendanceRecords.map((tutor) => {
                      const status = tutor.attendance?.status || 'Not Marked';
                      const checkIn = tutor.attendance?.checkIn || '—';
                      const checkOut = tutor.attendance?.checkOut || '—';

                      return (
                        <tr key={tutor._id} className="hover:bg-slate-50/70 transition">
                          {/* Tutor Profile */}
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              {tutor.avatar ? (
                                <img
                                  src={tutor.avatar.startsWith('http') ? tutor.avatar : `http://localhost:5000${tutor.avatar}`}
                                  alt={tutor.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-purple-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                  {tutor.name ? tutor.name.charAt(0) : 'T'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-bold text-slate-900">{tutor.name}</h4>
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                                    {tutor.tutorId}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">@{tutor.username}</span>
                              </div>
                            </div>
                          </td>

                          {/* Employment */}
                          <td className="py-4 px-4">
                            <EmploymentBadge type={tutor.employmentType} />
                          </td>

                          {/* Contact */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <p className="text-slate-800 font-medium truncate max-w-[160px]">{tutor.email}</p>
                              <p className="text-slate-400 font-mono text-[11px]">{tutor.phone || 'N/A'}</p>
                            </div>
                          </td>

                          {/* Check-In */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center space-x-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              <span>{checkIn}</span>
                            </span>
                          </td>

                          {/* Check-Out */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center space-x-1 font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                              <Clock className="w-3 h-3 text-purple-500" />
                              <span>{checkOut}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            {status === 'Present' && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-[11px] rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Present</span>
                              </span>
                            )}
                            {status === 'Absent' && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-rose-100 text-rose-800 font-black text-[11px] rounded-full border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Absent</span>
                              </span>
                            )}
                            {status === 'Leave' && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 font-black text-[11px] rounded-full border border-amber-200">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Leave</span>
                              </span>
                            )}
                            {status === 'Not Marked' && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-100 text-slate-600 font-bold text-[11px] rounded-full border border-slate-200">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Not Marked</span>
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Quick Mark Buttons */}
                              <button
                                onClick={() => handleQuickMarkAttendance(tutor, 'Present')}
                                title="Mark Present"
                                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                  status === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => handleQuickMarkAttendance(tutor, 'Absent')}
                                title="Mark Absent"
                                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                  status === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => handleQuickMarkAttendance(tutor, 'Leave')}
                                title="Mark Leave"
                                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                  status === 'Leave'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                }`}
                              >
                                L
                              </button>

                              {/* Edit Times Modal Trigger */}
                              <button
                                onClick={() => handleOpenEditAttendance(tutor)}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] transition flex items-center space-x-1 ml-1 cursor-pointer"
                                title="Edit check-in / check-out times"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              {/* View Profile Drawer Trigger */}
                              <button
                                onClick={() => openTutorDetails(tutor._id)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                                title="View tutor full profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT / OVERRIDE ATTENDANCE MODAL */}
      {isAttendanceModalOpen && editingAttendanceTutor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Record / Edit Tutor Attendance</h3>
                  <p className="text-[11px] text-slate-500">{editingAttendanceTutor.name} ({editingAttendanceTutor.tutorId})</p>
                </div>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendanceForm} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Attendance Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Attendance Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Present', 'Absent', 'Leave'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAttendanceForm({ ...attendanceForm, status: st })}
                      className={`py-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                        attendanceForm.status === st
                          ? st === 'Present'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : st === 'Absent'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {attendanceForm.status !== 'Absent' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Check-In Time</label>
                    <input
                      type="text"
                      placeholder="09:30 AM"
                      value={attendanceForm.checkIn}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Check-Out Time</label>
                    <input
                      type="text"
                      placeholder="05:30 PM"
                      value={attendanceForm.checkOut}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAttendance}
                  className="px-5 py-2 bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] hover:opacity-95 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingAttendance ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TUTOR MODAL WITH COMPLETE VALIDATION WIZARD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add Tutor — Resume PDF Onboarding System</h2>
                <p className="text-xs text-slate-500">Upload candidate Resume PDF to auto-extract profile details, then review and edit before saving to database.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Accordion / Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs scrollbar-none">
              {[
                { sec: 1, label: '1. Resume PDF' },
                { sec: 2, label: '2. Photo' },
                { sec: 3, label: '3. Personal' },
                { sec: 4, label: '4. Contact & Verification' },
                { sec: 5, label: '5. Account' },
                { sec: 6, label: '6. Employment Type *' },
                { sec: 7, label: '7. Bio' },
                { sec: 8, label: '8. Education' },
                { sec: 9, label: '9. Experience' },
                { sec: 10, label: '10. Skills' },
                { sec: 11, label: '11. Teaching Domains' },
                { sec: 12, label: '12. Availability' }
              ].map(s => {
                const isStep1Done = Boolean(resumeFile || resumeFileMeta);
                const isUnlocked = s.sec === 1 || (isStep1Done && s.sec <= maxUnlockedSection + 1);

                return (
                  <button
                    key={s.sec}
                    type="button"
                    onClick={() => {
                      if (canNavigateToSection(s.sec)) {
                        setActiveSection(s.sec);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap border ${
                      activeSection === s.sec
                        ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white border-transparent shadow-md font-bold'
                        : isUnlocked
                          ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveTutor} className="space-y-6">

              {/* SECTION 1: RESUME UPLOAD & PARSING */}
              {activeSection === 1 && (
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-pink-600" />
                      <span>Upload Tutor Resume PDF</span>
                    </h3>
                    <p className="text-xs text-slate-500">System validates file size (&lt; 5MB), checks PDF magic bytes `%PDF`, and parses resume details.</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={e => {
                        setResumeFile(e.target.files[0]);
                        handleParseResume(e);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-pink-500 file:to-violet-600 hover:file:from-pink-600 hover:file:to-violet-700 file:text-white file:font-bold file:cursor-pointer shadow-xs"
                    />

                    {parsingResume && (
                      <div className="flex items-center space-x-2 text-pink-600 font-bold text-xs animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                        <span>Validating Magic Bytes & Parsing PDF...</span>
                      </div>
                    )}
                  </div>

                  {resumeFileMeta && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Resume Uploaded: <strong>{resumeFileMeta.fileName}</strong> ({(resumeFileMeta.fileSize / 1024).toFixed(1)} KB)</span>
                      </div>

                      <a
                        href={
                          resumeFile
                            ? URL.createObjectURL(resumeFile)
                            : (resumeFileMeta?.fileUrl?.startsWith('http')
                                ? resumeFileMeta.fileUrl
                                : `http://localhost:5000${resumeFileMeta?.fileUrl || ''}`)
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-600 hover:text-pink-800 underline font-bold flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </a>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleNextSection(1)}
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Next: Profile Photo →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 2: PROFILE PHOTO */}
              {activeSection === 2 && (
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">Tutor Profile Photo</h3>
                  <div className="flex items-center space-x-4">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                        No Photo
                      </div>
                    )}

                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-800 file:text-white file:font-bold"
                      />
                      {uploadingPhoto && <span className="text-purple-600 font-bold block">Uploading photo & validating magic bytes...</span>}
                      <p className="text-[11px] text-slate-500">Accepted formats: JPG, JPEG, PNG, WEBP (&lt; 5MB)</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(1)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(2)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Personal Info →</button>
                  </div>
                </div>
              )}

              {/* SECTION 3: PERSONAL INFO */}
              {activeSection === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Arun Prakash"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                      />
                      <p className="text-[10px] text-slate-400">Letters, spaces, dots & hyphens allowed. Fake strings (test/abc) rejected.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                      />
                      <p className="text-[10px] text-slate-400">Tutor Age must be between 20 and 75 years old.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Highest Qualification *</label>
                      <select
                        value={qualification}
                        onChange={e => setQualification(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                      >
                        <option value="">Select Qualification</option>
                        <option value="B.E / B.Tech">B.E / B.Tech</option>
                        <option value="M.E / M.Tech">M.E / M.Tech</option>
                        <option value="B.Sc / M.Sc">B.Sc / M.Sc</option>
                        <option value="MCA / BCA">MCA / BCA</option>
                        <option value="Ph.D / Doctorate">Ph.D / Doctorate</option>
                        <option value="Other Industry Certification">Other Certification</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(2)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(3)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Contact & Verification →</button>
                  </div>
                </div>
              )}

              {/* SECTION 4: CONTACT & VERIFICATION */}
              {activeSection === 4 && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email Verification Box */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-800 font-bold">Email Address *</label>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emailOtpVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {emailOtpVerified ? '✓ EMAIL VERIFIED' : 'FORMAT & MX CHECK'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            setEmailOtpVerified(false); // Reset verification status whenever email is edited
                          }}
                          placeholder="arun@stackqueue.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendEmailOtp(email)}
                          disabled={sendingEmailOtp || !email.trim()}
                          className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl text-[11px] whitespace-nowrap shadow-xs cursor-pointer disabled:opacity-50 transition"
                        >
                          {sendingEmailOtp ? 'Sending OTP...' : emailOtpVerified ? 'Re-verify Email' : 'Verify OTP'}
                        </button>
                      </div>
                    </div>

                    {/* Phone Validation Box */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-800 font-bold">Indian Mobile Number (+91) *</label>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isValidIndianMobile(phone) 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : (phone.trim().length > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-purple-100 text-purple-800 border border-purple-300')
                        }`}>
                          {isValidIndianMobile(phone) 
                            ? '✓ FORMAT VALID (+91)' 
                            : (phone.trim().length > 0 ? '⚠️ DUMMY / INVALID NUMBER' : 'FORMAT CHECK (+91)')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">Normalized to +91. Must start with 6,7,8,9 (exact 10 digits). Dummy/repetitive numbers like 9999999999 are rejected.</p>
                    </div>
                  </div>

                  {/* Address & PIN Code Region Verification */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-purple-900">Address &amp; Indian PIN Code Validation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 md:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="City (e.g. Chennai)"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="State (e.g. Tamil Nadu)"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-700 font-bold block mb-1">6-Digit PIN Code *</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="600001"
                          value={pincode}
                          onChange={e => setPincode(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Validated against Indian postal region map (e.g. 60xxxx = Tamil Nadu).</p>
                      </div>

                      <div>
                        <label className="text-slate-700 font-bold block mb-1">LinkedIn Profile URL</label>
                        <input
                          type="text"
                          placeholder="https://linkedin.com/in/..."
                          value={linkedin}
                          onChange={e => setLinkedin(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(3)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(4)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Account Info →</button>
                  </div>
                </div>
              )}

              {/* SECTION 5: ACCOUNT INFO */}
              {activeSection === 5 && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Username *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="arun.tutor"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Initial Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-slate-900 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                          title={showPassword ? 'Hide Password' : 'Show Password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 text-pink-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 font-bold">Expected Annual Salary</label>
                      <input
                        type="number"
                        value={expectedSalary}
                        onChange={e => setExpectedSalary(e.target.value)}
                        placeholder="₹3,00,000 / year"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enter the tutor's expected annual salary.</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(4)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(5)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Employment Type →</button>
                  </div>
                </div>
              )}

              {/* SECTION 6: EMPLOYMENT TYPE (REQUIRED) */}
              {activeSection === 6 && (
                <div className="space-y-4 bg-purple-50/70 border border-purple-200 p-6 rounded-2xl text-xs">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider text-purple-900">Employment Type *</h3>
                    <p className="text-slate-600 text-xs">Specify whether this tutor is employed Full-Time or Part-Time.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className={`p-4 rounded-2xl border cursor-pointer transition flex items-center space-x-3 ${
                      employmentType === 'FULL-TIME'
                        ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white border-transparent shadow-md font-bold'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="empType"
                        value="FULL-TIME"
                        checked={employmentType === 'FULL-TIME'}
                        onChange={() => setEmploymentType('FULL-TIME')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <span className="text-sm font-black block">FULL-TIME</span>
                        <span className="text-[11px] opacity-80 font-normal">Standard full working hours &amp; batch scheduling.</span>
                      </div>
                    </label>

                    <label className={`p-4 rounded-2xl border cursor-pointer transition flex items-center space-x-3 ${
                      employmentType === 'PART-TIME'
                        ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white border-transparent shadow-md font-bold'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="empType"
                        value="PART-TIME"
                        checked={employmentType === 'PART-TIME'}
                        onChange={() => setEmploymentType('PART-TIME')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <div>
                        <span className="text-sm font-black block">PART-TIME</span>
                        <span className="text-[11px] opacity-80 font-normal">Configured availability hours apply during class scheduling.</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(5)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(6)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Bio →</button>
                  </div>
                </div>
              )}

              {/* SECTION 7: BIO */}
              {activeSection === 7 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Professional Bio / Career Summary</label>
                    <textarea
                      rows={4}
                      value={professionalBio}
                      onChange={e => setProfessionalBio(e.target.value)}
                      placeholder="Senior Technical Tutor with 5+ years of experience in Java Full Stack and DSA..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700 font-bold">Total Experience</label>
                    <input
                      type="text"
                      value={totalExperience}
                      onChange={e => setTotalExperience(e.target.value)}
                      placeholder="e.g. 3 Years"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(6)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(7)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Education →</button>
                  </div>
                </div>
              )}

              {/* SECTION 8: EDUCATION */}
              {activeSection === 8 && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">Education Records</h3>
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Degree (e.g. B.E. / B.Tech)"
                          value={edu.degree}
                          onChange={e => {
                            const updated = [...educationList];
                            updated[idx].degree = e.target.value;
                            setEducationList(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2"
                        />
                        <input
                          type="text"
                          placeholder="Specialization (e.g. CSE)"
                          value={edu.specialization}
                          onChange={e => {
                            const updated = [...educationList];
                            updated[idx].specialization = e.target.value;
                            setEducationList(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(7)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(8)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Experience →</button>
                  </div>
                </div>
              )}

              {/* SECTION 9: EXPERIENCE */}
              {activeSection === 9 && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">Work Experience Timeline</h3>
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={exp.company}
                          onChange={e => {
                            const updated = [...experienceList];
                            updated[idx].company = e.target.value;
                            setExperienceList(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2"
                        />
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={exp.jobTitle}
                          onChange={e => {
                            const updated = [...experienceList];
                            updated[idx].jobTitle = e.target.value;
                            setExperienceList(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(8)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(9)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Skills →</button>
                  </div>
                </div>
              )}

              {/* SECTION 10: SKILLS */}
              {activeSection === 10 && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">Technical Skills</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add technical skill..."
                      value={newSkillName}
                      onChange={e => setNewSkillName(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1"
                    />
                    <select
                      value={newSkillCategory}
                      onChange={e => setNewSkillCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    >
                      <option value="Programming Languages">Programming Languages</option>
                      <option value="Frameworks">Frameworks</option>
                      <option value="Databases">Databases</option>
                      <option value="Tools">Tools</option>
                      <option value="Cloud">Cloud</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
                    >
                      + Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {skillsList.map((sk, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold flex items-center space-x-1.5">
                        <span>{sk.name} ({sk.category})</span>
                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-purple-400 hover:text-purple-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(9)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(10)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Teaching Domains →</button>
                  </div>
                </div>
              )}

              {/* SECTION 11: TEACHING DOMAINS */}
              {activeSection === 11 && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">Assign Teaching Domains</h3>
                    <p className="text-slate-500">Select active domain tracks from Domain Management that this tutor is qualified to teach.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {courses.map(c => {
                      const isSelected = selectedDomains.some(d => d.domainName === c.title);
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => handleToggleDomain(c)}
                          className={`p-3 rounded-xl font-bold border transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white border-transparent shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{c.title}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button type="button" onClick={() => setActiveSection(10)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>
                    <button type="button" onClick={() => handleNextSection(11)} className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">Next: Availability →</button>
                  </div>
                </div>
              )}

              {/* SECTION 12: AVAILABILITY & FINAL SAVE WITH VALIDATION ENGINE */}
              {activeSection === 12 && (
                <div className="space-y-6 text-xs">
                  <div className="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 p-4 rounded-2xl border border-purple-200/80 space-y-1">
                    <div className="flex items-center space-x-2 text-purple-800 font-bold">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <h3 className="font-black text-slate-900 text-sm">Tutor Working Availability &amp; Custom Shift Manager</h3>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Configure custom working hours, toggle active days/off-days, pick quick shift presets, or add extra custom time slots.
                    </p>
                  </div>

                  {/* Quick Shift Presets */}
                  <div className="space-y-2">
                    <label className="text-slate-700 font-bold block uppercase tracking-wider text-[11px]">Quick Shift Presets</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyPresetShift('FULL-TIME')}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-xl border border-purple-200 text-center transition"
                      >
                        ⚡ Full-Time (Mon-Fri 9-5)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetShift('PART-TIME-EVENING')}
                        className="px-3 py-2 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 font-bold rounded-xl border border-fuchsia-200 text-center transition"
                      >
                        🌙 Evening Shift (5pm-9pm)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetShift('WEEKEND-ONLY')}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 text-center transition"
                      >
                        ☕ Weekend Only (Sat-Sun)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPresetShift('FULL-WEEK')}
                        className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold rounded-xl border border-pink-200 text-center transition"
                      >
                        📅 Active All 7 Days
                      </button>
                    </div>
                  </div>

                  {/* Availability List Table */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Day / Shift Title</span>
                      <span>Active Status</span>
                      <span>Timing Window</span>
                      <span>Action</span>
                    </div>

                    {availabilityList.map((av, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                        <div className="w-full md:w-36">
                          <input
                            type="text"
                            value={av.dayOfWeek}
                            onChange={e => {
                              const updated = [...availabilityList];
                              updated[idx].dayOfWeek = e.target.value;
                              setAvailabilityList(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:bg-white focus:border-purple-500"
                            placeholder="e.g. Monday"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={av.isAvailable !== false}
                              onChange={e => {
                                const updated = [...availabilityList];
                                updated[idx].isAvailable = e.target.checked;
                                setAvailabilityList(updated);
                              }}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                            />
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              av.isAvailable !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {av.isAvailable !== false ? 'ACTIVE' : 'OFF DAY'}
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <select
                            value={av.startTime}
                            onChange={e => {
                              const updated = [...availabilityList];
                              updated[idx].startTime = e.target.value;
                              setAvailabilityList(updated);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-slate-800 text-xs font-semibold"
                          >
                            {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span className="text-slate-400 font-bold">to</span>
                          <select
                            value={av.endTime}
                            onChange={e => {
                              const updated = [...availabilityList];
                              updated[idx].endTime = e.target.value;
                              setAvailabilityList(updated);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 font-mono text-slate-800 text-xs font-semibold"
                          >
                            {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAvailabilitySlot(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddCustomAvailabilitySlot}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Extra Time Slot / Custom Shift</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation & Authoritative Validation / Final Save */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <button type="button" onClick={() => setActiveSection(11)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">← Back</button>

                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={handleValidatePayload}
                        disabled={validatingPayload}
                        className="px-5 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>{validatingPayload ? 'Running Validation...' : 'Run Data Audit Check'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={submittingTutor}
                        className="px-8 py-3 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white rounded-xl font-bold shadow-lg text-sm flex items-center space-x-2 transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{submittingTutor ? 'Validating & Saving...' : 'SAVE TUTOR PROFILE'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* REAL EMAIL OTP VERIFICATION MODAL */}
      {emailOtpModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center border border-slate-100 relative z-[101]">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Verify Your Email Address</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit verification OTP sent to <strong className="text-purple-700">{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                maxLength={6}
                value={emailOtpInput}
                onChange={e => {
                  setEmailOtpInput(e.target.value.replace(/\D/g, ''));
                  setEmailOtpError('');
                }}
                placeholder="_ _ _ _ _ _"
                className="w-full text-center font-mono font-black text-3xl tracking-widest bg-slate-50 border border-slate-200 rounded-2xl py-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-inner"
              />

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                <span>OTP expires in <strong className="text-pink-600 font-mono">{formatTimer(emailOtpCountdown)}</strong></span>
                {resendCooldown > 0 ? (
                  <span className="text-slate-400 font-mono">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendEmailOtp(email)}
                    disabled={sendingEmailOtp}
                    className="text-purple-600 hover:text-purple-800 font-bold underline cursor-pointer"
                  >
                    {sendingEmailOtp ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>

            {emailOtpError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-xs font-semibold text-center">
                ⚠️ {emailOtpError}
              </div>
            )}

            <div className="flex justify-between space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEmailOtpModalOpen(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyEmailOtp}
                disabled={verifyingEmailOtp || emailOtpInput.length !== 6 || emailOtpCountdown === 0}
                className="w-1/2 py-2.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{verifyingEmailOtp ? 'Verifying...' : 'Verify Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* DUPLICATE TUTOR WARNING MODAL */}
      {duplicateModalOpen && duplicateWarning && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-slate-900 text-lg">Possible Duplicate Record Detected</h3>
              <p className="text-xs text-slate-500">The system found existing tutor accounts matching entered email or mobile number.</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-mono space-y-1.5 text-rose-900">
              {duplicateWarning.warnings?.map((w, idx) => (
                <p key={idx}>⚠️ {w}</p>
              ))}
            </div>

            <div className="flex justify-between space-x-2 pt-2">
              <button
                onClick={() => setDuplicateModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Edit Form Details
              </button>
              <button
                onClick={(e) => handleSaveTutor(e, true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Proceed &amp; Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {createdSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Tutor Created &amp; Validated!</h3>
              <p className="text-xs text-slate-500">Structured tutor profile &amp; verified user credentials saved to database.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 font-mono text-left border border-slate-200">
              <p>Tutor ID: <strong className="text-purple-700">{createdSuccess.tutorId}</strong></p>
              <p>Name: <strong>{createdSuccess.name}</strong></p>
              <p>Email: <strong>{createdSuccess.email}</strong></p>
              <p>Username: <strong>{createdSuccess.username}</strong></p>
              <p className="flex items-center space-x-1.5 font-sans text-slate-700 font-medium">
                <span>Employment Type:</span>
                <EmploymentBadge type={createdSuccess.employmentType} />
              </p>
            </div>

            <button
              onClick={() => setCreatedSuccess(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
            >
              Done &amp; Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE TUTOR CONFIRMATION MODAL */}
      {deleteConfirmModalOpen && tutorDetails && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 outline-none border-none ring-0">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100 relative z-[101]">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-slate-900 text-lg">Confirm Delete Tutor</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently delete tutor profile for <strong>{tutorDetails.fullName}</strong> ({tutorDetails.tutorId})?
              </p>
            </div>

            {deleteWarningInfo?.hasDependencies && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-1.5 text-amber-900">
                <div className="flex items-center space-x-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Active Assignments Warning</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  This tutor is currently assigned to <strong>{deleteWarningInfo.batchesCount} batch(es)</strong> and <strong>{deleteWarningInfo.studentsCount} student(s)</strong>. Deleting this account will remove their assigned tutor record.
                </p>
              </div>
            )}

            <div className="flex justify-between space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModalOpen(false)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTutor}
                disabled={deletingTutor}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deletingTutor ? 'Deleting Profile...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: ANIMATED FULL TUTOR PROFILE VIEW & EDIT PANEL */}
      {(isDrawerOpen || selectedTutorId) && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ease-out flex justify-end outline-none focus:outline-none ring-0 border-none ${
            drawerAnimatedIn && !isDrawerClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            onClick={closeDrawerWithAnimation}
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ease-out outline-none border-none ring-0 ${
              drawerAnimatedIn && !isDrawerClosing ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Right Drawer Panel with slide-in & fade-in / slide-out & fade-out */}
          <div
            className={`relative z-10 bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto transform transition-all duration-300 ease-out outline-none border-none ring-0 ${
              drawerAnimatedIn && !isDrawerClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
          >
            {loadingDetails || !tutorDetails ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                <p className="text-xs font-bold text-slate-500">Loading profile details...</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {/* Header Area */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative group">
                        {tutorDetails.profilePhotoUrl ? (
                          <img
                            src={tutorDetails.profilePhotoUrl}
                            alt={tutorDetails.fullName}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-300 shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                            {tutorDetails.fullName ? tutorDetails.fullName.charAt(0) : 'T'}
                          </div>
                        )}

                        <label
                          title="Change / Upload Profile Photo"
                          className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md cursor-pointer transition flex items-center justify-center border-2 border-white"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadProfilePhotoForTutor(e, tutorDetails._id)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <span className="text-xs font-mono font-bold text-purple-700">{tutorDetails.tutorId}</span>
                        <h3 className="text-lg font-black text-slate-900">{tutorDetails.fullName}</h3>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-xs text-slate-500 font-medium">Employment:</span>
                          <EmploymentBadge type={tutorDetails.employmentType} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isEditingProfile ? (
                        <button
                          onClick={startEditingProfile}
                          className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer border border-purple-200/80"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                          <span>Edit Profile</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}

                      <button
                        onClick={handleInitiateDeleteTutor}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition cursor-pointer border border-rose-200"
                        title="Delete Tutor Record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>

                      <button
                        onClick={closeDrawerWithAnimation}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Tab Navigation */}
                  {!isEditingProfile && (
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <button
                        onClick={() => setDrawerTab('overview')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                          drawerTab === 'overview'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        Profile Overview
                      </button>
                      <button
                        onClick={() => {
                          setDrawerTab('attendance');
                          const uId = tutorDetails?.userId?._id || tutorDetails?.userId;
                          if (uId) loadTutorHistory(uId);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer ${
                          drawerTab === 'attendance'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <CalendarCheck2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Attendance History</span>
                      </button>
                    </div>
                  )}

                  {/* BODY: EDIT MODE VS READ-ONLY OVERVIEW MODE */}
                  {isEditingProfile ? (
                    <form onSubmit={handleSaveEditedProfile} className="space-y-4 text-xs">
                      <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-4">
                        <h4 className="font-black text-purple-900 uppercase text-[11px] tracking-wider flex items-center space-x-1.5">
                          <Edit3 className="w-4 h-4 text-purple-600" />
                          <span>Edit Tutor Information</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                            <input
                              type="text"
                              value={editFormData.fullName || ''}
                              onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                            <input
                              type="email"
                              value={editFormData.email || ''}
                              onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Phone Number (+91) *</label>
                            <input
                              type="text"
                              maxLength={10}
                              value={editFormData.phone || ''}
                              onChange={e => setEditFormData({ ...editFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              placeholder="9876543210"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Employment Type *</label>
                            <select
                              value={editFormData.employmentType || 'FULL-TIME'}
                              onChange={e => setEditFormData({ ...editFormData, employmentType: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                              <option value="FULL-TIME">FULL-TIME</option>
                              <option value="PART-TIME">PART-TIME</option>
                              <option value="CONTRACT">CONTRACT</option>
                              <option value="VISITING">VISITING</option>
                            </select>
                          </div>

                          <div className="col-span-1 md:col-span-2 bg-purple-50/70 p-3 rounded-2xl border border-purple-200/80 space-y-1">
                            <label className="block text-slate-800 font-bold text-xs">Reset Tutor Password (Optional)</label>
                            <div className="relative">
                              <input
                                type={showEditPassword ? 'text' : 'password'}
                                placeholder="Leave blank to keep existing password"
                                value={editFormData.password || ''}
                                onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 pr-10 focus:ring-2 focus:ring-purple-500 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => setShowEditPassword(!showEditPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Type a new password (min 6 characters) to reset this tutor's account login credentials.
                            </p>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Primary Teaching Domain / Expertise *</label>
                            <input
                              type="text"
                              value={editFormData.primaryDomain || ''}
                              onChange={e => setEditFormData({ ...editFormData, primaryDomain: e.target.value })}
                              placeholder="e.g. Java Full Stack, Python, Web Development"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 bg-purple-50/40 p-4 rounded-2xl border border-purple-200/60">
                            {/* Profile Photo Upload */}
                            <div className="space-y-1.5">
                              <label className="block text-slate-800 font-bold text-xs">Profile Photo Upload</label>
                              <div className="flex items-center space-x-3">
                                {editFormData.profilePhotoUrl && (
                                  <img
                                    src={editFormData.profilePhotoUrl.startsWith('http') ? editFormData.profilePhotoUrl : `http://localhost:5000${editFormData.profilePhotoUrl}`}
                                    alt="Tutor Preview"
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                                  />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditPhotoUpload}
                                  disabled={uploadingEditPhoto}
                                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white file:font-bold file:text-xs cursor-pointer"
                                />
                              </div>
                              {uploadingEditPhoto && <p className="text-[10px] text-purple-600 font-bold">Uploading photo...</p>}
                            </div>

                            {/* Resume PDF Upload */}
                            <div className="space-y-1.5">
                              <label className="block text-slate-800 font-bold text-xs">
                                Resume PDF Upload <span className="text-purple-700 font-normal">(PDF Files Only — No URLs)</span>
                              </label>
                              <div className="flex flex-col space-y-1">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handleEditResumeUpload}
                                  disabled={uploadingEditResume}
                                  className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:bg-purple-600 file:text-white file:font-bold file:text-xs cursor-pointer"
                                />
                                {editFormData.resumeDocument?.fileName && (
                                  <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-700 pt-0.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span className="truncate">{editFormData.resumeDocument.fileName}</span>
                                    {editFormData.resumeDocument.fileUrl && (
                                      <a
                                        href={editFormData.resumeDocument.fileUrl.startsWith('http') ? editFormData.resumeDocument.fileUrl : `http://localhost:5000${editFormData.resumeDocument.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 underline text-[10px] ml-1 shrink-0"
                                      >
                                        View PDF
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                              {uploadingEditResume && <p className="text-[10px] text-purple-600 font-bold">Uploading PDF resume...</p>}
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Total Experience</label>
                            <input
                              type="text"
                              value={editFormData.totalExperience || ''}
                              onChange={e => setEditFormData({ ...editFormData, totalExperience: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">City</label>
                            <input
                              type="text"
                              value={editFormData.city || ''}
                              onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">State</label>
                            <input
                              type="text"
                              value={editFormData.state || ''}
                              onChange={e => setEditFormData({ ...editFormData, state: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Pincode (6-digit)</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={editFormData.pincode || ''}
                              onChange={e => setEditFormData({ ...editFormData, pincode: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold mb-1">Expected Annual Salary (₹)</label>
                            <input
                              type="number"
                              value={editFormData.expectedSalary || ''}
                              onChange={e => setEditFormData({ ...editFormData, expectedSalary: e.target.value })}
                              placeholder="₹3,00,000 / year"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enter the tutor's expected annual salary.</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Address</label>
                          <input
                            type="text"
                            value={editFormData.address || ''}
                            onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Professional Bio</label>
                          <textarea
                            rows={3}
                            value={editFormData.professionalBio || ''}
                            onChange={e => setEditFormData({ ...editFormData, professionalBio: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingEdit}
                          className="px-6 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{savingEdit ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                        </button>
                      </div>
                    </form>
                  ) : drawerTab === 'attendance' ? (
                    /* ATTENDANCE HISTORY VIEW IN DRAWER */
                    <div className="space-y-4 text-xs">
                      {loadingTutorHistory ? (
                        <div className="py-12 flex flex-col items-center justify-center">
                          <div className="w-7 h-7 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-xs text-slate-500 font-bold">Loading attendance records...</p>
                        </div>
                      ) : (
                        <>
                          {/* Summary Stats */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Total Days</span>
                              <h5 className="text-lg font-black text-purple-700">{tutorAttendanceHistory?.summary?.totalDays || 0}</h5>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Present</span>
                              <h5 className="text-lg font-black text-emerald-700">{tutorAttendanceHistory?.summary?.presentDays || 0}</h5>
                            </div>
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Absent</span>
                              <h5 className="text-lg font-black text-rose-700">{tutorAttendanceHistory?.summary?.absentDays || 0}</h5>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Attendance %</span>
                              <h5 className="text-lg font-black text-indigo-700">{tutorAttendanceHistory?.summary?.attendancePercentage || 0}%</h5>
                            </div>
                          </div>

                          {/* Records Table */}
                          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-slate-700 text-xs flex items-center space-x-1.5">
                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                <span>Attendance History Log</span>
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {tutorAttendanceHistory?.records?.length || 0} Records
                              </span>
                            </div>

                            {(!tutorAttendanceHistory?.records || tutorAttendanceHistory.records.length === 0) ? (
                              <div className="py-8 text-center text-slate-400">
                                <p className="font-bold">No historical attendance logged for this tutor yet.</p>
                              </div>
                            ) : (
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50/50">
                                    <th className="py-2 px-3">Date</th>
                                    <th className="py-2 px-3">Check-In</th>
                                    <th className="py-2 px-3">Check-Out</th>
                                    <th className="py-2 px-3 text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {tutorAttendanceHistory.records.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.date}</td>
                                      <td className="py-2.5 px-3 font-mono text-emerald-700">{r.checkIn || '—'}</td>
                                      <td className="py-2.5 px-3 font-mono text-purple-700">{r.checkOut || '—'}</td>
                                      <td className="py-2.5 px-3 text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          r.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                          r.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                                          'bg-amber-100 text-amber-800'
                                        }`}>
                                          {r.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* READ ONLY OVERVIEW CARDS */
                    <div className="space-y-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
                        <h4 className="font-bold uppercase text-[11px] tracking-wider text-purple-800">Verification &amp; Contact Details</h4>
                        <p>Email: <strong className="text-slate-900">{tutorDetails.userId?.email || tutorDetails.email}</strong> <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800">{tutorDetails.emailStatus || 'FORMAT_VALID'}</span></p>
                        <p>Phone: <strong className="text-slate-900">{tutorDetails.phone || 'N/A'}</strong> <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-bold bg-purple-100 text-purple-800">{tutorDetails.phoneStatus || 'FORMAT_VALID'}</span></p>
                        <p>Location: <strong className="text-slate-900">{tutorDetails.city || 'India'}, {tutorDetails.state}</strong> (PIN: {tutorDetails.pincode || 'N/A'})</p>
                        <p>Qualification: <strong className="text-slate-900">{tutorDetails.qualification || 'B.E. / B.Tech'}</strong></p>
                        <p>Experience: <strong className="text-slate-900">{tutorDetails.totalExperience || '3 Years'}</strong></p>
                        {(() => {
                          const rawSal = Number(tutorDetails.expectedAnnualSalary || tutorDetails.expectedSalary || 0);
                          const annSal = (rawSal > 0 && rawSal <= 250000) ? rawSal * 12 : rawSal;
                          return annSal > 0 ? (
                            <p>Expected Salary: <strong className="text-emerald-700">₹{Number(annSal).toLocaleString()} / year</strong></p>
                          ) : null;
                        })()}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
                        <h4 className="font-bold uppercase text-[11px] tracking-wider text-purple-800">Assigned Teaching Domains</h4>
                        {tutorDetails.teachingDomains?.length > 0 ? tutorDetails.teachingDomains.map((d, i) => (
                          <span key={i} className="inline-block px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold mr-2 text-[11px]">
                            {d.domainName} ({d.priority || 'Primary'})
                          </span>
                        )) : (
                          <p className="text-slate-500 italic">No specific domains assigned yet.</p>
                        )}
                      </div>

                      {tutorDetails.professionalBio && (
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
                          <h4 className="font-bold uppercase text-[11px] tracking-wider text-purple-800">Professional Summary / Bio</h4>
                          <p className="text-slate-700 leading-relaxed font-medium">{tutorDetails.professionalBio}</p>
                        </div>
                      )}

                      {tutorDetails.resumeDocument?.fileUrl && (
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
                          <h4 className="font-bold uppercase text-[11px] tracking-wider text-purple-800">Uploaded Resume PDF (Magic Byte Verified)</h4>
                          <a
                            href={tutorDetails.resumeDocument.fileUrl.startsWith('http') ? tutorDetails.resumeDocument.fileUrl : `http://localhost:5000${tutorDetails.resumeDocument.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-violet-600 text-white rounded-xl font-bold text-xs shadow-xs hover:opacity-95 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Saved Resume PDF</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button onClick={closeDrawerWithAnimation} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer">
                    Close Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
