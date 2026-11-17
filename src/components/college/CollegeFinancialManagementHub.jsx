import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  Building2,
  GraduationCap,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  FileText,
  Send,
  Download,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  UserCheck,
  TrendingUp,
  Receipt,
  Mail,
  Sliders,
  Settings,
  ExternalLink,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function CollegeFinancialManagementHub({
  onOpenCreateBatch,
  onOpenAddCollege,
  onSelectBatchDetails
}) {
  const navigate = useNavigate();

  // Navigation State
  // Tabs: 'all', 'upcoming', 'active', 'completed', 'pending', 'financial-report'
  const [activeTab, setActiveTab] = useState('all');
  // Sub-tabs for Payment Pending: 'college-pending' or 'trainer-pending'
  const [pendingSubTab, setPendingSubTab] = useState('college-pending');

  // Batches and Counts Data
  const [batches, setBatches] = useState([]);
  const [counts, setCounts] = useState({
    allCount: 0,
    upcomingCount: 0,
    activeCount: 0,
    completedCount: 0,
    collegePendingCount: 0,
    trainerPendingCount: 0,
    totalPendingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');

  // Master options
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);

  // Selected Batch for Financial Report Tab & Modals
  const [selectedReportBatchId, setSelectedReportBatchId] = useState(null);
  const [reportBatchData, setReportBatchData] = useState(null);
  const [reportBatchLoading, setReportBatchLoading] = useState(false);

  // Modals state
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTrainersModalOpen, setIsTrainersModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEmailConfigModalOpen, setIsEmailConfigModalOpen] = useState(false);
  const [activeModalBatch, setActiveModalBatch] = useState(null);

  // Config Modal Form
  const [pricingModel, setPricingModel] = useState('PER_STUDENT');
  const [ratePerStudent, setRatePerStudent] = useState(2000);
  const [ratePerDay, setRatePerDay] = useState(5000);
  const [actualTrainingDays, setActualTrainingDays] = useState(10);
  const [dueDate, setDueDate] = useState('');

  // Payment Modal Form
  const [paymentTab, setPaymentTab] = useState('college'); // 'college' or 'trainer'
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentInvoice, setPaymentInvoice] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentBankRef, setPaymentBankRef] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [selectedTrainerForPayout, setSelectedTrainerForPayout] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Expense Modal Form
  const [expenseCategory, setExpenseCategory] = useState('Travel');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState({
    primaryEmail: 'stackqueue2023@gmail.com',
    ccEmails: [],
    autoEmailReports: true
  });
  const [newCcEmail, setNewCcEmail] = useState('');

  // Toast / feedback message
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Format currency
  const formatINR = (val) => {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  };

  // Format date
  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Fetch batches & counts
  const fetchBatches = async () => {
    try {
      setRefreshing(true);
      let statusQuery = activeTab;
      if (activeTab === 'pending') {
        statusQuery = pendingSubTab; // 'college-pending' or 'trainer-pending'
      }

      const res = await api.get('/college-financial/batches', {
        params: {
          status: statusQuery,
          collegeId: selectedCollegeFilter,
          department: selectedDeptFilter,
          courseId: selectedCourseFilter,
          search: searchTerm
        }
      });

      if (res.data?.success) {
        setBatches(res.data.batches || []);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error('[fetchBatches] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Master Data (Colleges, Courses, Tutors, Email Config)
  const fetchMasterData = async () => {
    try {
      const [collegesRes, coursesRes, tutorsRes, configRes] = await Promise.allSettled([
        api.get('/admin/batches/colleges'),
        api.get('/domain/all'),
        api.get('/admin/tutors'),
        api.get('/college-financial/email-config')
      ]);

      if (collegesRes.status === 'fulfilled' && collegesRes.value.data?.colleges) {
        setColleges(collegesRes.value.data.colleges);
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value.data?.courses) {
        setCourses(coursesRes.value.data.courses);
      }
      if (tutorsRes.status === 'fulfilled' && tutorsRes.value.data?.tutors) {
        setTutors(tutorsRes.value.data.tutors);
      }
      if (configRes.status === 'fulfilled' && configRes.value.data?.config) {
        setEmailConfig(configRes.value.data.config);
      }
    } catch (err) {
      console.error('[fetchMasterData] Error:', err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [activeTab, pendingSubTab, selectedCollegeFilter, selectedDeptFilter, selectedCourseFilter]);

  // Fetch Report Data for Selected Batch
  const fetchReportBatchDetails = async (batchId) => {
    if (!batchId) return;
    try {
      setReportBatchLoading(true);
      const res = await api.get(`/college-financial/batches/${batchId}`);
      if (res.data?.success) {
        setReportBatchData(res.data);
      }
    } catch (err) {
      console.error('[fetchReportBatchDetails] Error:', err);
    } finally {
      setReportBatchLoading(false);
    }
  };

  // When switching to financial report tab, auto select first batch if none selected
  useEffect(() => {
    if (activeTab === 'financial-report') {
      if (!selectedReportBatchId && batches.length > 0) {
        setSelectedReportBatchId(batches[0]._id);
        fetchReportBatchDetails(batches[0]._id);
      } else if (selectedReportBatchId) {
        fetchReportBatchDetails(selectedReportBatchId);
      }
    }
  }, [activeTab, batches]);

  // Open Pricing Config Modal
  const openConfigModal = (b) => {
    setActiveModalBatch(b);
    setPricingModel(b.pricingModel || 'PER_STUDENT');
    setRatePerStudent(b.ratePerStudent || 2000);
    setRatePerDay(b.ratePerDay || 5000);
    setActualTrainingDays(b.actualTrainingDays || 10);
    setDueDate(b.collegePaymentDueDate ? new Date(b.collegePaymentDueDate).toISOString().split('T')[0] : '');
    setIsConfigModalOpen(true);
  };

  // Save Pricing Config
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!activeModalBatch) return;
    try {
      const res = await api.post(`/college-financial/batches/${activeModalBatch._id}/config`, {
        pricingModel,
        ratePerStudent,
        ratePerDay,
        actualTrainingDays,
        collegePaymentDueDate: dueDate || undefined
      });
      if (res.data?.success) {
        showToast('Pricing & financial configuration updated successfully');
        setIsConfigModalOpen(false);
        fetchBatches();
        if (selectedReportBatchId === activeModalBatch._id) {
          fetchReportBatchDetails(activeModalBatch._id);
        }
      }
    } catch (err) {
      alert('Error updating configuration: ' + (err.response?.data?.message || err.message));
    }
  };

  // Open Manage Payments Modal
  const openPaymentModal = (b, defaultTab = 'college') => {
    setActiveModalBatch(b);
    setPaymentTab(defaultTab);
    setPaymentAmount('');
    setPaymentInvoice(`INV-${b.code || 'BATCH'}-${Date.now().toString().slice(-4)}`);
    setPaymentRef('');
    setPaymentBankRef('');
    setPaymentRemarks('');
    if (b.assignedTrainers?.length > 0) {
      setSelectedTrainerForPayout(b.assignedTrainers[0].trainerId?._id || b.assignedTrainers[0].trainerId || '');
    }
    setIsPaymentModalOpen(true);
  };

  // Record College or Trainer Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!activeModalBatch || !paymentAmount || Number(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      setSubmittingPayment(true);
      if (paymentTab === 'college') {
        const res = await api.post(`/college-financial/batches/${activeModalBatch._id}/college-payment`, {
          amount: Number(paymentAmount),
          invoiceNumber: paymentInvoice,
          paymentMode,
          transactionReference: paymentRef,
          bankUpiReference: paymentBankRef,
          remarks: paymentRemarks
        });
        if (res.data?.success) {
          showToast(`College payment of ${formatINR(paymentAmount)} verified! Financial report generated and emailed.`);
          setIsPaymentModalOpen(false);
          fetchBatches();
          if (selectedReportBatchId === activeModalBatch._id) {
            fetchReportBatchDetails(activeModalBatch._id);
          }
        }
      } else {
        // Trainer payment
        const trObj = activeModalBatch.assignedTrainers?.find(
          t => (t.trainerId?._id || t.trainerId || '').toString() === selectedTrainerForPayout.toString()
        );
        const res = await api.post(`/college-financial/batches/${activeModalBatch._id}/trainer-payment`, {
          trainerId: selectedTrainerForPayout,
          trainerName: trObj?.name || 'Trainer',
          amount: Number(paymentAmount),
          paymentMode,
          transactionReference: paymentRef,
          bankUpiReference: paymentBankRef,
          remarks: paymentRemarks
        });
        if (res.data?.success) {
          showToast(`Trainer disbursement of ${formatINR(paymentAmount)} released! Report version updated and emailed.`);
          setIsPaymentModalOpen(false);
          fetchBatches();
          if (selectedReportBatchId === activeModalBatch._id) {
            fetchReportBatchDetails(activeModalBatch._id);
          }
        }
      }
    } catch (err) {
      alert('Error recording payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Submit Expense
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!activeModalBatch || !expenseAmount || Number(expenseAmount) <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    try {
      setSubmittingExpense(true);
      const res = await api.post(`/college-financial/batches/${activeModalBatch._id}/expenses`, {
        category: expenseCategory,
        amount: Number(expenseAmount),
        description: expenseDesc
      });
      if (res.data?.success) {
        showToast('Expense recorded successfully');
        setIsExpenseModalOpen(false);
        setExpenseAmount('');
        setExpenseDesc('');
        fetchBatches();
        if (selectedReportBatchId === activeModalBatch._id) {
          fetchReportBatchDetails(activeModalBatch._id);
        }
      }
    } catch (err) {
      alert('Error recording expense: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingExpense(false);
    }
  };

  // Manual Report Generation
  const handleGenerateManualReport = async () => {
    if (!selectedReportBatchId) return;
    try {
      const res = await api.post(`/college-financial/batches/${selectedReportBatchId}/generate-report`);
      if (res.data?.success) {
        showToast(`Financial report version ${res.data.report?.version} generated & dispatched to ${emailConfig.primaryEmail}`);
        fetchReportBatchDetails(selectedReportBatchId);
      }
    } catch (err) {
      alert('Error generating report: ' + (err.response?.data?.message || err.message));
    }
  };

  // Resend Report Email
  const handleResendReport = async (reportId) => {
    try {
      const res = await api.post(`/college-financial/reports/${reportId}/resend`);
      if (res.data?.success) {
        showToast(`Report copy resent successfully to ${emailConfig.primaryEmail}`);
        fetchReportBatchDetails(selectedReportBatchId);
      }
    } catch (err) {
      alert('Error resending report email: ' + (err.response?.data?.message || err.message));
    }
  };

  // Save Email Config
  const handleSaveEmailConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/college-financial/email-config', emailConfig);
      if (res.data?.success) {
        showToast('Financial email notification preferences saved');
        setIsEmailConfigModalOpen(false);
      }
    } catch (err) {
      alert('Error saving email config: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filtered batches memo for frontend search input
  const displayBatches = useMemo(() => {
    if (!searchTerm.trim()) return batches;
    const q = searchTerm.toLowerCase().trim();
    return batches.filter(b => {
      return (
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.collegeId?.name?.toLowerCase().includes(q) ||
        b.department?.toLowerCase().includes(q) ||
        b.courseId?.title?.toLowerCase().includes(q)
      );
    });
  }, [batches, searchTerm]);

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-bold flex items-center space-x-3 transition-all transform animate-bounce ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER & TITLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-blue-700 bg-blue-50 font-mono text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>STACK QUEUE Financial Operations</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              College Training & Financial System
            </h1>
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Database-driven management of institutional batches, per-student & per-day pricing, separate incoming college and outgoing trainer payment ledgers, automated PDF reports, and delivery logs.
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
              onClick={() => setIsEmailConfigModalOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-xs cursor-pointer"
              title="Configure Report Emails"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>Email Settings</span>
            </button>
            <button
              onClick={onOpenAddCollege}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Add College</span>
            </button>
            <button
              onClick={onOpenCreateBatch}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-white rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Training Batch</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. MAIN HORIZONTAL NAVIGATION STRUCTURE */}
      {/* Required Tabs: 1. All Training Batches, 2. Upcoming Trainings, 3. Active Trainings, 4. Completed Trainings, 5. Payment Pending, 6. Financial Report */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {/* Tab 1: All Training Batches */}
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>1. All Training Batches</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.allCount}
            </span>
          </button>

          {/* Tab 2: Upcoming Trainings */}
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Upcoming Trainings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'upcoming' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {counts.upcomingCount}
            </span>
          </button>

          {/* Tab 3: Active Trainings */}
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Active Trainings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'active' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {counts.activeCount}
            </span>
          </button>

          {/* Tab 4: Completed Trainings */}
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>4. Completed Trainings</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'completed' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
            }`}>
              {counts.completedCount}
            </span>
          </button>

          {/* Tab 5: Payment Pending (with subcategories) */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>5. Payment Pending</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'pending' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {counts.totalPendingCount}
            </span>
          </button>

          {/* Tab 6: Financial Report (Dedicated Separate Option) */}
          <button
            onClick={() => setActiveTab('financial-report')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'financial-report'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>6. Financial Report</span>
          </button>
        </div>

        {/* PAYMENT PENDING SUB-TABS (When Tab 5 is selected) */}
        {activeTab === 'pending' && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center space-x-3 px-2 bg-rose-50/60 rounded-xl p-2.5">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Pending Category:</span>
            </span>
            <button
              onClick={() => setPendingSubTab('college-pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                pendingSubTab === 'college-pending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>A. College Pending</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pendingSubTab === 'college-pending' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {counts.collegePendingCount}
              </span>
            </button>

            <button
              onClick={() => setPendingSubTab('trainer-pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                pendingSubTab === 'trainer-pending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span>B. Trainer Pending</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                pendingSubTab === 'trainer-pending' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {counts.trainerPendingCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* VIEW 1 TO 5: ALL / UPCOMING / ACTIVE / COMPLETED / PENDING */}
      {/* ============================================================== */}
      {activeTab !== 'financial-report' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batch code, college, course, department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCollegeFilter}
                onChange={e => setSelectedCollegeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Colleges ({colleges.length})</option>
                {colleges.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="AIDS">AIDS</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>

              <button
                onClick={fetchBatches}
                disabled={refreshing}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* BATCHES TABLE (All 17 Required Fields from Prompt Section 2) */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">College & Location</th>
                    <th className="py-3 px-3">Dept</th>
                    <th className="py-3 px-3">Batch & Code</th>
                    <th className="py-3 px-3">Course / Domain</th>
                    <th className="py-3 px-3 text-center">Students</th>
                    <th className="py-3 px-3">Schedule</th>
                    <th className="py-3 px-3 text-center">Days</th>
                    <th className="py-3 px-3">Assigned Trainers</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">College Pay</th>
                    <th className="py-3 px-3 text-center">Trainer Pay</th>
                    <th className="py-3 px-3 text-right">Expected Rev</th>
                    <th className="py-3 px-3 text-right">Received</th>
                    <th className="py-3 px-3 text-right text-rose-600">College Pending</th>
                    <th className="py-3 px-3 text-right text-emerald-600">Trainer Released</th>
                    <th className="py-3 px-3 text-right text-rose-600">Trainer Pending</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="17" className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading training batch ledger records...</span>
                      </td>
                    </tr>
                  ) : displayBatches.length === 0 ? (
                    <tr>
                      <td colSpan="17" className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span className="font-semibold">No training batches found in this view.</span>
                      </td>
                    </tr>
                  ) : (
                    displayBatches.map(b => {
                      const collegeName = b.collegeId?.name || 'N/A';
                      const collegeCity = b.collegeId?.city || 'Location N/A';
                      const courseTitle = b.courseId?.title || 'Training Domain';
                      const studentCount = b.studentIds?.length || b.totalStudents || 0;
                      const trainerNames = (b.assignedTrainers || []).map(t => t.name).filter(Boolean).join(', ') || 'None assigned';

                      return (
                        <tr key={b._id} className="hover:bg-blue-50/30 transition group">
                          {/* 1. College & Location */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                              {collegeName}
                            </div>
                            <div className="text-[11px] text-slate-400">{collegeCity}</div>
                          </td>

                          {/* 2. Dept */}
                          <td className="py-3 px-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                              {b.department || 'CSE'}
                            </span>
                          </td>

                          {/* 3. Batch Name & Code */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{b.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{b.code}</div>
                          </td>

                          {/* 4. Course / Domain */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700">{courseTitle}</span>
                          </td>

                          {/* 5. Total Students */}
                          <td className="py-3 px-3 text-center">
                            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
                              {studentCount}
                            </span>
                          </td>

                          {/* 6. Training Dates */}
                          <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                            <div>{formatDate(b.startDate)}</div>
                            <div className="text-[10px] text-slate-400">to {formatDate(b.endDate)}</div>
                          </td>

                          {/* 7. Actual Training Days */}
                          <td className="py-3 px-3 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                              {b.actualTrainingDays || 10}d
                            </span>
                          </td>

                          {/* 8. Assigned Trainers */}
                          <td className="py-3 px-3 text-slate-600 max-w-[130px] truncate" title={trainerNames}>
                            {trainerNames}
                          </td>

                          {/* 9. Training Status */}
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'upcoming'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {b.status || 'active'}
                            </span>
                          </td>

                          {/* 10. College Payment Status */}
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.collegePaymentStatus === 'Fully Received'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.collegePaymentStatus === 'Partially Received'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {b.collegePaymentStatus || 'Not Received'}
                            </span>
                          </td>

                          {/* 11. Trainer Payment Status */}
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.trainerPaymentStatus === 'Fully Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.trainerPaymentStatus === 'Partially Released'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {b.trainerPaymentStatus || 'Not Released'}
                            </span>
                          </td>

                          {/* 12. Expected College Revenue */}
                          <td className="py-3 px-3 text-right font-bold text-slate-800">
                            {formatINR(b.expectedCollegeRevenue)}
                          </td>

                          {/* 13. Amount Received */}
                          <td className="py-3 px-3 text-right font-bold text-emerald-600">
                            {formatINR(b.totalCollegeReceived)}
                          </td>

                          {/* 14. College Pending Amount */}
                          <td className="py-3 px-3 text-right font-bold text-rose-600">
                            {formatINR(b.collegePendingAmount)}
                          </td>

                          {/* 15. Trainer Payment Released */}
                          <td className="py-3 px-3 text-right font-bold text-blue-600">
                            {formatINR(b.totalTrainerReleased)}
                          </td>

                          {/* 16. Trainer Payment Pending */}
                          <td className="py-3 px-3 text-right font-bold text-rose-600">
                            {formatINR(b.trainerPaymentPending)}
                          </td>

                          {/* 17. Actions Menu (Section 2 Requirements) */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* View Details */}
                              <button
                                onClick={() => onSelectBatchDetails && onSelectBatchDetails(b)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                                title="View Details"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Pricing & Financial Config */}
                              <button
                                onClick={() => openConfigModal(b)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                                title="Edit Financial & Pricing Model"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              {/* Manage Trainers */}
                              <button
                                onClick={() => {
                                  setActiveModalBatch(b);
                                  setIsTrainersModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition"
                                title="Manage Trainers & Rates"
                              >
                                <Users className="w-3.5 h-3.5" />
                              </button>

                              {/* Manage Payments (Incoming & Outgoing) */}
                              <button
                                onClick={() => openPaymentModal(b)}
                                className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition"
                                title="Manage Payments & Releases"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>

                              {/* View Financial Report */}
                              <button
                                onClick={() => {
                                  setSelectedReportBatchId(b._id);
                                  setActiveTab('financial-report');
                                }}
                                className="p-1.5 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg transition"
                                title="View Financial Report"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* Open Training Performance for this Batch */}
                              <button
                                onClick={() => navigate(`/admin/training-performance?batchId=${b._id}&collegeId=${b.collegeId?._id || b.collegeId || ''}`)}
                                className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition"
                                title="Open Training Performance"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
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

      {/* ============================================================== */}
      {/* VIEW 6: INDEPENDENT FINANCIAL REPORT TAB */}
      {/* ============================================================== */}
      {activeTab === 'financial-report' && (
        <div className="space-y-6">
          {/* Top Control Bar for Financial Report */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Select Training Batch:</span>
              <select
                value={selectedReportBatchId || ''}
                onChange={e => {
                  setSelectedReportBatchId(e.target.value);
                  fetchReportBatchDetails(e.target.value);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 w-full md:w-80"
              >
                {batches.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code}) - {b.collegeId?.name || 'College'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  if (reportBatchData?.batch) {
                    setActiveModalBatch(reportBatchData.batch);
                    setIsExpenseModalOpen(true);
                  }
                }}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>

              <button
                onClick={handleGenerateManualReport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Generate & Dispatch PDF</span>
              </button>

              <button
                onClick={() => {
                  if (reportBatchData?.reports?.length > 0) {
                    window.open(reportBatchData.reports[0].pdfUrl, '_blank');
                  } else {
                    alert('No PDF generated yet. Click Generate & Dispatch PDF first.');
                  }
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {reportBatchLoading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading complete batch financial statement...</span>
            </div>
          ) : !reportBatchData?.batch ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold">Please select a valid college training batch to view its financial report.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* FINAL FINANCIAL SUMMARY (Section 13) */}
              {/* IMPORTANT: No 'Trainer Payment Approved' field! */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. Expected Revenue */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expected Revenue</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {formatINR(reportBatchData.batch.expectedCollegeRevenue)}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {reportBatchData.batch.pricingModel === 'PER_DAY' ? 'Option B: Per Day Rate' : 'Option A: Per Head Rate'}
                  </div>
                </div>

                {/* 2. Amount Received */}
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-xs bg-emerald-50/20">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Verified Received</span>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">
                    {formatINR(reportBatchData.batch.totalCollegeReceived)}
                  </h3>
                  <div className="text-[10px] text-emerald-600 mt-1 font-semibold">
                    Status: {reportBatchData.batch.collegePaymentStatus || 'Not Received'}
                  </div>
                </div>

                {/* 3. College Pending */}
                <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-xs bg-rose-50/20">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">College Pending</span>
                  <h3 className="text-xl font-black text-rose-600 mt-1">
                    {formatINR(reportBatchData.batch.collegePendingAmount)}
                  </h3>
                  <div className="text-[10px] text-rose-500 mt-1 font-semibold">
                    Outstanding Receivable
                  </div>
                </div>

                {/* 4. Total Trainer Payment */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Trainer Pay</span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">
                    {formatINR(reportBatchData.batch.totalTrainerPayment)}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Released: {formatINR(reportBatchData.batch.totalTrainerReleased)}
                  </div>
                </div>

                {/* 5. Trainer Pending */}
                <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-xs bg-rose-50/20">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Trainer Pending</span>
                  <h3 className="text-xl font-black text-rose-600 mt-1">
                    {formatINR(reportBatchData.batch.trainerPaymentPending)}
                  </h3>
                  <div className="text-[10px] text-rose-500 mt-1 font-semibold">
                    Independent Obligation
                  </div>
                </div>

                {/* 6. Total Other Expenses */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">
                    {formatINR(reportBatchData.batch.totalExpenses)}
                  </h3>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Travel, Food, Stay, Materials
                  </div>
                </div>

                {/* 7. Estimated Training Profit */}
                <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-xs bg-blue-50/20 col-span-2 lg:col-span-2">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Estimated Profit</span>
                  <h3 className="text-xl font-black text-blue-700 mt-1">
                    {formatINR(reportBatchData.batch.estimatedProfit)}
                  </h3>
                  <div className="text-[10px] text-blue-600 mt-1">
                    Formula: Expected Revenue - Trainer Pay - Expenses
                  </div>
                </div>

                {/* 8. Actual Cash Balance */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm text-white col-span-2 lg:col-span-2">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Actual Cash Balance</span>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">
                    {formatINR(reportBatchData.batch.actualCashBalance)}
                  </h3>
                  <div className="text-[10px] text-slate-300 mt-1">
                    Verified Received - Trainer Released - Expenses Paid
                  </div>
                </div>
              </div>

              {/* SECTION A: BATCH & TRAINING SPECIFICATIONS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100 text-slate-800 font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>1. Batch & Training Specifications</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Partner College</span>
                    <span className="font-bold text-slate-900 text-sm">{reportBatchData.batch.collegeId?.name}</span>
                    <div className="text-[11px] text-slate-500">{reportBatchData.batch.collegeId?.city}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Batch Name & Code</span>
                    <span className="font-bold text-slate-900 text-sm">{reportBatchData.batch.name}</span>
                    <div className="text-[11px] font-mono text-slate-500">{reportBatchData.batch.code}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Training Domain & Dept</span>
                    <span className="font-bold text-slate-900 text-sm">{reportBatchData.batch.courseId?.title || 'Domain'}</span>
                    <div className="text-[11px] text-slate-500">{reportBatchData.batch.department}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Duration & Schedule</span>
                    <span className="font-bold text-slate-900 text-sm">{reportBatchData.batch.actualTrainingDays || 10} Days</span>
                    <div className="text-[11px] text-slate-500">
                      {formatDate(reportBatchData.batch.startDate)} - {formatDate(reportBatchData.batch.endDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: COLLEGE REVENUE & INCOMING PAYMENTS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>2. Incoming College Revenue & Verified Receipts</span>
                  </div>
                  <button
                    onClick={() => openPaymentModal(reportBatchData.batch, 'college')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record College Payment</span>
                  </button>
                </div>

                {/* Sub-table: Incoming College Transactions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Invoice Number</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3">Transaction Reference</th>
                        <th className="py-2.5 px-3">Remarks</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportBatchData.collegePayments || []).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-slate-400 italic">
                            No incoming payments recorded from {reportBatchData.batch.collegeId?.name} yet.
                          </td>
                        </tr>
                      ) : (
                        reportBatchData.collegePayments.map(cp => (
                          <tr key={cp._id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3">{formatDate(cp.paymentDate)}</td>
                            <td className="py-2.5 px-3 font-mono font-bold">{cp.invoiceNumber}</td>
                            <td className="py-2.5 px-3">{cp.paymentMode}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{cp.transactionReference || cp.bankUpiReference || '-'}</td>
                            <td className="py-2.5 px-3 text-slate-500">{cp.remarks || '-'}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatINR(cp.amount)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {cp.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION C: TRAINER REMUNERATION & RELEASES */}
              {/* IMPORTANT: No 'Trainer Payment Approved' field! */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>3. Trainer Obligations & Released Disbursements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActiveModalBatch(reportBatchData.batch);
                        setIsTrainersModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Configure Trainers</span>
                    </button>
                    <button
                      onClick={() => openPaymentModal(reportBatchData.batch, 'trainer')}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Trainer Payout</span>
                    </button>
                  </div>
                </div>

                {/* Sub-table: Assigned Trainers obligations */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Trainer Name</th>
                        <th className="py-2.5 px-3">Model</th>
                        <th className="py-2.5 px-3 text-center">Days</th>
                        <th className="py-2.5 px-3 text-right">Agreed Rate</th>
                        <th className="py-2.5 px-3 text-right">Total Obligation</th>
                        <th className="py-2.5 px-3 text-right text-emerald-600">Released</th>
                        <th className="py-2.5 px-3 text-right text-rose-600">Pending</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportBatchData.batch.assignedTrainers || []).length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-6 text-center text-slate-400 italic">
                            No trainers assigned to this batch. Click Configure Trainers to add.
                          </td>
                        </tr>
                      ) : (
                        reportBatchData.batch.assignedTrainers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-800">{t.name || 'Trainer'}</td>
                            <td className="py-2.5 px-3">{t.paymentModel === 'FIXED' ? 'Fixed Fee' : 'Per Day Rate'}</td>
                            <td className="py-2.5 px-3 text-center font-semibold">{t.assignedDays || 10}d</td>
                            <td className="py-2.5 px-3 text-right font-medium">{formatINR(t.rate)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(t.totalPayment)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatINR(t.amountReleased)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatINR(t.pendingAmount)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.paymentStatus === 'Fully Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.paymentStatus === 'Partially Released'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {t.paymentStatus || 'Not Released'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION D: REPORT VERSIONS & EMAIL AUDIT LOGS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>4. Generated Financial Report Versions & Email Logs</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Recipient: <strong>{emailConfig.primaryEmail}</strong>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Report ID</th>
                        <th className="py-2.5 px-3">Version</th>
                        <th className="py-2.5 px-3">Trigger Event</th>
                        <th className="py-2.5 px-3">Generated Date</th>
                        <th className="py-2.5 px-3">Email Sent To</th>
                        <th className="py-2.5 px-3 text-center">Email Status</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(reportBatchData.reports || []).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-6 text-center text-slate-400 italic">
                            No report versions generated yet. Trigger a payment or click "Generate & Dispatch PDF".
                          </td>
                        </tr>
                      ) : (
                        reportBatchData.reports.map(rep => (
                          <tr key={rep._id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-700">{rep.reportId}</td>
                            <td className="py-2.5 px-3 font-bold text-blue-700">{rep.version}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                {rep.triggerEvent}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{new Date(rep.createdAt).toLocaleString('en-GB')}</td>
                            <td className="py-2.5 px-3 text-slate-600">{rep.emailSentTo || emailConfig.primaryEmail}</td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.emailDeliveryStatus === 'Sent'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rep.emailDeliveryStatus === 'Failed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {rep.emailDeliveryStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <a
                                  href={rep.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                                  title="Download PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleResendReport(rep.reportId)}
                                  className="p-1 hover:bg-blue-100 text-blue-600 rounded transition cursor-pointer"
                                  title="Resend Email"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: PRICING & FINANCIAL CONFIGURATION */}
      {/* ============================================================== */}
      {isConfigModalOpen && activeModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Batch Financial Configuration</h3>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Batch Name & Code
                </label>
                <div className="font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {activeModalBatch.name} ({activeModalBatch.code})
                </div>
              </div>

              {/* Pricing Model Option A vs Option B */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">College Pricing Basis</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPricingModel('PER_STUDENT')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      pricingModel === 'PER_STUDENT'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900">Option A: Per Student</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Actual Student Count × Rate</div>
                  </div>

                  <div
                    onClick={() => setPricingModel('PER_DAY')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      pricingModel === 'PER_DAY'
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900">Option B: Per Training Day</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Scheduled Training Days × Rate</div>
                  </div>
                </div>
              </div>

              {/* Pricing Rates */}
              {pricingModel === 'PER_STUDENT' ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Per Student Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={ratePerStudent}
                    onChange={e => setRatePerStudent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500"
                    required
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                    Expected Revenue = {activeModalBatch.studentIds?.length || activeModalBatch.totalStudents || 0} students × {formatINR(ratePerStudent)} = {formatINR((activeModalBatch.studentIds?.length || activeModalBatch.totalStudents || 0) * (Number(ratePerStudent) || 0))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Actual Scheduled Training Days</label>
                    <input
                      type="number"
                      min="1"
                      value={actualTrainingDays}
                      onChange={e => setActualTrainingDays(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Per Training Day Rate (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={ratePerDay}
                      onChange={e => setRatePerDay(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    Expected Revenue = {actualTrainingDays} days × {formatINR(ratePerDay)} = {formatINR(Number(actualTrainingDays) * (Number(ratePerDay) || 0))}
                  </div>
                </div>
              )}

              {/* Payment Due Date */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">College Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: MANAGE PAYMENTS (INCOMING & OUTGOING) */}
      {/* ============================================================== */}
      {isPaymentModalOpen && activeModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Payment Transaction</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Sub-tab selection: College Incoming vs Trainer Outgoing */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentTab('college')}
                className={`py-2 rounded-lg transition ${
                  paymentTab === 'college' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Incoming College Payment
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab('trainer')}
                className={`py-2 rounded-lg transition ${
                  paymentTab === 'trainer' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Outgoing Trainer Release
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3.5 text-xs">
              {paymentTab === 'college' ? (
                <>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Invoice Number</label>
                    <input
                      type="text"
                      value={paymentInvoice}
                      onChange={e => setPaymentInvoice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Outstanding College Pending</label>
                    <div className="font-bold text-rose-600 text-sm bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                      {formatINR(activeModalBatch.collegePendingAmount)}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Select Assigned Trainer</label>
                  <select
                    value={selectedTrainerForPayout}
                    onChange={e => setSelectedTrainerForPayout(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                    required
                  >
                    {(activeModalBatch.assignedTrainers || []).map(t => (
                      <option key={t.trainerId?._id || t.trainerId} value={t.trainerId?._id || t.trainerId}>
                        {t.name} (Pending: {formatINR(t.pendingAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount to Record (₹) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50000"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="NEFT/RTGS">NEFT/RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    placeholder="UTR / Cheque No"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Notes or verification details"
                  value={paymentRemarks}
                  onChange={e => setPaymentRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 flex items-start space-x-2">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Trigger:</strong> Recording this verified payment will automatically generate an updated PDF report and email it to <strong>{emailConfig.primaryEmail}</strong>.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  {submittingPayment ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify & Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: MANAGE TRAINERS & INDEPENDENT RATES */}
      {/* ============================================================== */}
      {isTrainersModalOpen && activeModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Trainer Assignments & Independent Rates</h3>
              </div>
              <button onClick={() => setIsTrainersModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-xs text-slate-500">
              Assign trainers from the Tutor Management database with their independent rate model (Fixed or Per Day).
            </div>

            {/* List of currently assigned trainers */}
            <div className="space-y-3">
              {(activeModalBatch.assignedTrainers || []).map((tr, index) => (
                <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{tr.name}</span>
                    <div className="text-[11px] text-slate-500">
                      Model: <strong>{tr.paymentModel}</strong> • Rate: <strong>{formatINR(tr.rate)}</strong> • Days: <strong>{tr.assignedDays || 10}d</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">Total: {formatINR(tr.totalPayment)}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">Released: {formatINR(tr.amountReleased)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Trainer */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs mb-2">Assign Trainer from Directory</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <select
                  id="add-trainer-select"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
                >
                  {tutors.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                  ))}
                </select>

                <select
                  id="add-trainer-model"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-800"
                >
                  <option value="PER_DAY">Per Day Rate</option>
                  <option value="FIXED">Fixed Training Fee</option>
                </select>

                <input
                  id="add-trainer-rate"
                  type="number"
                  placeholder="Rate (₹)"
                  defaultValue="2000"
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800"
                />

                <button
                  type="button"
                  onClick={async () => {
                    const selectEl = document.getElementById('add-trainer-select');
                    const modelEl = document.getElementById('add-trainer-model');
                    const rateEl = document.getElementById('add-trainer-rate');
                    const tId = selectEl?.value;
                    const tut = tutors.find(t => t._id === tId);
                    if (!tut) return;

                    const newTrainers = [
                      ...(activeModalBatch.assignedTrainers || []),
                      {
                        trainerId: tut._id,
                        name: tut.name,
                        email: tut.email,
                        phone: tut.phone || '',
                        domain: tut.domain || '',
                        paymentModel: modelEl?.value || 'PER_DAY',
                        rate: Number(rateEl?.value) || 2000,
                        assignedDays: activeModalBatch.actualTrainingDays || 10
                      }
                    ];

                    try {
                      const res = await api.post(`/college-financial/batches/${activeModalBatch._id}/trainers`, {
                        trainers: newTrainers
                      });
                      if (res.data?.success) {
                        showToast(`Trainer ${tut.name} assigned successfully`);
                        setActiveModalBatch(res.data.batch);
                        fetchBatches();
                      }
                    } catch (err) {
                      alert('Error assigning trainer: ' + err.message);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl py-2 cursor-pointer"
                >
                  + Add Trainer
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsTrainersModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ADD AUXILIARY TRAINING EXPENSE */}
      {/* ============================================================== */}
      {isExpenseModalOpen && activeModalBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Training Expense</h3>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800"
                >
                  <option value="Travel">Travel</option>
                  <option value="Accommodation">Accommodation (Stay)</option>
                  <option value="Food">Food / Catering</option>
                  <option value="Training Materials">Training Materials / Kits</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 3500"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Description / Bill Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Trainer train tickets & local cab"
                  value={expenseDesc}
                  onChange={e => setExpenseDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: EMAIL REPORT CONFIGURATION */}
      {/* ============================================================== */}
      {isEmailConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Financial Report Email Settings</h3>
              </div>
              <button onClick={() => setIsEmailConfigModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEmailConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Recipient Email *</label>
                <input
                  type="email"
                  value={emailConfig.primaryEmail}
                  onChange={e => setEmailConfig({ ...emailConfig, primaryEmail: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  required
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Automated PDF reports will be delivered here immediately upon verified transactions.
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Additional CC Emails</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    placeholder="accountant@example.com"
                    value={newCcEmail}
                    onChange={e => setNewCcEmail(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCcEmail.trim() && !emailConfig.ccEmails.includes(newCcEmail.trim())) {
                        setEmailConfig({
                          ...emailConfig,
                          ccEmails: [...emailConfig.ccEmails, newCcEmail.trim()]
                        });
                        setNewCcEmail('');
                      }
                    }}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
                  >
                    + Add CC
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(emailConfig.ccEmails || []).map((em, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                      <span>{em}</span>
                      <button
                        type="button"
                        onClick={() => setEmailConfig({
                          ...emailConfig,
                          ccEmails: emailConfig.ccEmails.filter((_, i) => i !== idx)
                        })}
                        className="text-slate-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="auto-email-toggle"
                  checked={emailConfig.autoEmailReports}
                  onChange={e => setEmailConfig({ ...emailConfig, autoEmailReports: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="auto-email-toggle" className="text-slate-700 font-bold cursor-pointer">
                  Enable Automatic Email Dispatch on Verified Payments
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmailConfigModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
