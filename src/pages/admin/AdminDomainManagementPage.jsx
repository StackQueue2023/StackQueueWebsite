import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/client';
import {
  BookOpen, Briefcase, FolderGit2, Plus, Search,
  CheckCircle2, Clock, X, ChevronRight, ChevronDown, Layers,
  ArrowLeft, Trash2, Upload, FileText, Sparkles, AlertTriangle, AlertCircle, RefreshCw,
  FileCheck, Code2, Edit3, Tag, Check, RotateCcw, StopCircle, ExternalLink, Database, ListOrdered,
  ShieldCheck, ShieldAlert, Filter, Terminal, HelpCircle, CheckSquare, PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import InternshipStudentsAddModal from '../../components/admin/internship/InternshipStudentsAddModal';
import {
  DOMAIN_CATEGORIES,
  DOMAIN_FILTER_OPTIONS,
  DEFAULT_DOMAIN_CATEGORY,
  normalizeCategory
} from '../../constants/domains';

export default function AdminDomainManagementPage({ fixedType = null }) {
  const fileInputRef = useRef(null);
  const location = useLocation();
  const path = (location?.pathname || '').toLowerCase();
  const effectiveFixedType = fixedType || (
    path.includes('/admin/courses') ? 'course' :
    path.includes('/admin/internships') ? 'internship' :
    path.includes('/admin/projects') ? 'project' : null
  );

  const [activeTab, setActiveTab] = useState(effectiveFixedType || 'course');

  useEffect(() => {
    if (effectiveFixedType) {
      setActiveTab(effectiveFixedType);
    }
  }, [effectiveFixedType]);
  const cachedDomainData = api.peekCache?.('/admin/domain-management/all');
  const [data, setData] = useState(cachedDomainData?.data || { courses: [], internships: [], projects: [] });
  const [loading, setLoading] = useState(!cachedDomainData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All');

  // Course Categories State
  const [categories, setCategories] = useState(cachedDomainData?.data?.categories || []);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategoryDomainFilter, setSelectedCategoryDomainFilter] = useState('All');
  const [selectedCategoryStatusFilter, setSelectedCategoryStatusFilter] = useState('All');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('create'); // 'create' | 'edit'
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    domain: 'Enterprise Software',
    isActive: true
  });
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryDeleteModalOpen, setCategoryDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // Dynamic Technical Domain States (Add, Rename & Manage Domains)
  const [technicalDomains, setTechnicalDomains] = useState([]);
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [domainModalMode, setDomainModalMode] = useState('create'); // 'create' | 'edit'
  const [domainForm, setDomainForm] = useState({ name: '', description: '' });
  const [domainToEdit, setDomainToEdit] = useState(null);
  const [submittingDomain, setSubmittingDomain] = useState(false);
  const [internshipStudentModalOpen, setInternshipStudentModalOpen] = useState(false);

  // Domain Item Detail View State (Course, Internship, or Project)
  const [selectedDomainItem, setSelectedDomainItem] = useState(null); // { item, type: 'course' | 'internship' | 'project' }
  const [itemDetail, setItemDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openModules, setOpenModules] = useState({});

  const toggleModule = (id) => {
    setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const updated = {};
    (itemDetail?.modules || []).forEach(m => { updated[m._id] = true; });
    setOpenModules(updated);
  };

  const collapseAll = () => {
    setOpenModules({});
  };

  // Update Syllabus & Edit Details Modal State
  const [updateSyllabusOpen, setUpdateSyllabusOpen] = useState(false);
  const [updateModalTab, setUpdateModalTab] = useState('syllabus'); // 'syllabus' | 'info'
  const [syllabusMode, setSyllabusMode] = useState('text'); // 'text' | 'pdf'
  const [syllabusText, setSyllabusText] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [tasksPerModule, setTasksPerModule] = useState(12);
  const [updatingSyllabus, setUpdatingSyllabus] = useState(false);
  const [showSyllabusUploadForm, setShowSyllabusUploadForm] = useState(false);
  const [cancellingJob, setCancellingJob] = useState(false);

  // AI Question Bank States
  const [generationStatus, setGenerationStatus] = useState(null);
  const [overallQuestionStats, setOverallQuestionStats] = useState(null);
  const [activeQuestionsTab, setActiveQuestionsTab] = useState('modules'); // 'modules' | 'arena' | 'mock' | 'flagged'
  const [courseQuestionsData, setCourseQuestionsData] = useState({
    interviewArena: [],
    mockInterview: [],
    testingPractice: []
  });
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // Flagged Review States
  const [flaggedQuestionsList, setFlaggedQuestionsList] = useState([]);
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [flaggedFilterModule, setFlaggedFilterModule] = useState('all');
  const [flaggedFilterDifficulty, setFlaggedFilterDifficulty] = useState('all');
  const [flaggedFilterType, setFlaggedFilterType] = useState('all');
  const [flaggedFilterReason, setFlaggedFilterReason] = useState('all');
  const [flaggedSearch, setFlaggedSearch] = useState('');

  // Edit Question Modal State
  const [editingQuestionModalOpen, setEditingQuestionModalOpen] = useState(false);
  const [editingQuestionItem, setEditingQuestionItem] = useState(null); // { item, type }
  const [editQuestionForm, setEditQuestionForm] = useState({
    title: '',
    problemStatement: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    referenceSolution: '',
    explanation: '',
    difficulty: 'Easy',
    points: 10,
    expectedOutput: '',
    compiler: 'javascript',
    technology: '',
    testCases: [],
    questionType: 'coding', // 'coding' | 'mcq'
    options: [
      { optionId: 'A', text: '' },
      { optionId: 'B', text: '' },
      { optionId: 'C', text: '' },
      { optionId: 'D', text: '' }
    ],
    correctAnswer: 'A',
    topic: '',
    moduleId: ''
  });
  const [submittingQuestionEdit, setSubmittingQuestionEdit] = useState(false);
  const [editValidationResult, setEditValidationResult] = useState(null);

  // Delete Question Modal State
  const [deleteQuestionModalOpen, setDeleteQuestionModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null); // { item, type }
  const [deleteQuestionReason, setDeleteQuestionReason] = useState('');
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  // Recover Question State
  const [recoverQuestionModalOpen, setRecoverQuestionModalOpen] = useState(false);
  const [questionToRecover, setQuestionToRecover] = useState(null); // { item, type }
  const [recoveringQuestion, setRecoveringQuestion] = useState(false);
  const [recoverResult, setRecoverResult] = useState(null);

  // Admin Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [questionToOverride, setQuestionToOverride] = useState(null); // { item, type }
  const [overrideReason, setOverrideReason] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const [questionFilterStatus, setQuestionFilterStatus] = useState('all');
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');

  // Delete Confirm Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  // Add Modal State (Create new course / internship / project)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('Course');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form states for NEW items
  const INITIAL_COURSE_FORM = {
    title: '',
    coursePrefix: '',
    studentIdPrefix: '',
    startingSequence: 1,
    domain: 'Enterprise Software',
    description: '',
    durationValue: 12,
    durationUnit: 'Weeks',
    durationWeeks: 12,
    durationText: '12 Weeks',
    totalHours: 120,
    totalCourseFee: 24000,
    monthlyInstallment: 2000,
    level: 'All Levels',
    isActive: true,
    syllabusOption: 'text', // 'text' | 'pdf'
    syllabusText: '',
    syllabusFile: null,
    tasksPerModule: 12
  };

  const INITIAL_INTERNSHIP_FORM = {
    title: '',
    domain: 'Enterprise Software',
    techStack: '',
    description: '',
    durationText: '1 Month',
    durationWeeks: 4,
    stipend: 5000,
    isPaid: true,
    level: 'Intermediate',
    isActive: true,
    syllabusOption: 'text', // 'text' | 'pdf'
    syllabusText: '',
    syllabusFile: null,
    tasksPerModule: 12
  };

  const INITIAL_PROJECT_FORM = {
    title: '',
    domain: 'Enterprise Software',
    technologies: '',
    requirements: '',
    difficulty: 'Intermediate',
    xpReward: 300,
    estimatedHours: 40,
    courseId: '',
    description: '',
    status: 'Available'
  };

  const [courseForm, setCourseForm] = useState(INITIAL_COURSE_FORM);
  const [internshipForm, setInternshipForm] = useState(INITIAL_INTERNSHIP_FORM);
  const [projectForm, setProjectForm] = useState(INITIAL_PROJECT_FORM);

  const resetAddForms = () => {
    setCourseForm(INITIAL_COURSE_FORM);
    setInternshipForm(INITIAL_INTERNSHIP_FORM);
    setProjectForm(INITIAL_PROJECT_FORM);
  };

  // Form states for EDITING details
  const [editCourseForm, setEditCourseForm] = useState({
    title: '',
    domain: 'Enterprise Software',
    categoryId: '',
    category: DEFAULT_DOMAIN_CATEGORY,
    description: '',
    durationValue: 12,
    durationUnit: 'Weeks',
    durationWeeks: 12,
    durationText: '12 Weeks',
    totalHours: 120,
    totalCourseFee: 24000,
    monthlyInstallment: 2000,
    level: 'All Levels',
    isActive: true
  });

  const [editInternshipForm, setEditInternshipForm] = useState({
    title: '',
    category: DEFAULT_DOMAIN_CATEGORY,
    domain: 'fullstack',
    techStack: '',
    description: '',
    durationText: '1 Month',
    durationWeeks: 4,
    stipend: 5000,
    isPaid: true,
    level: 'Intermediate',
    isActive: true
  });

  const [editProjectForm, setEditProjectForm] = useState({
    title: '',
    category: DEFAULT_DOMAIN_CATEGORY,
    technologies: '',
    requirements: '',
    difficulty: 'Intermediate',
    xpReward: 300,
    estimatedHours: 40,
    courseId: '',
    description: '',
    status: 'Available'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch Overall Question Bank Stats for Catalog Overview
  const fetchOverallQuestionStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/syllabus/generation-status/overall');
      if (res.data?.success) {
        setOverallQuestionStats(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.error('Error fetching overall question stats:', err);
    }
    return null;
  }, []);

  // Fetch all domain data from database
  const fetchDomainData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/admin/domain-management/all');
      if (res.data?.success) {
        setData(res.data.data);
        if (res.data.data?.categories) {
          setCategories(res.data.data.categories);
        }
        if (res.data.data?.domains) {
          setTechnicalDomains(res.data.data.domains);
        }
      }
    } catch (err) {
      console.error('Error fetching domain data:', err);
      showToast('Error loading domain records from database.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/domain-management/categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch Technical Domains
  const fetchTechnicalDomains = useCallback(async () => {
    try {
      const res = await api.get('/admin/domain-management/domains');
      if (res.data?.success) {
        setTechnicalDomains(res.data.data || []);
        return res.data.data;
      }
    } catch (err) {
      console.error('Error fetching technical domains:', err);
    }
    return [];
  }, []);

  useEffect(() => {
    const cached = api.peekCache?.('/admin/domain-management/all');
    fetchDomainData(!!cached);
    fetchOverallQuestionStats();
    fetchTechnicalDomains();
  }, [fetchDomainData, fetchOverallQuestionStats, fetchTechnicalDomains]);

  useEffect(() => {
    if (!selectedDomainItem && (effectiveFixedType === 'course' || activeTab === 'course')) {
      fetchOverallQuestionStats();
    }
  }, [selectedDomainItem, effectiveFixedType, activeTab, fetchOverallQuestionStats]);

  // Technical Domain Handlers (Add, Edit/Rename, Manage)
  const handleOpenAddDomain = (defaultName = '') => {
    setDomainModalMode('create');
    setDomainToEdit(null);
    setDomainForm({
      name: typeof defaultName === 'string' ? defaultName : '',
      description: ''
    });
    setDomainModalOpen(true);
  };

  const handleOpenEditDomain = (dom) => {
    setDomainModalMode('edit');
    setDomainToEdit(dom);
    setDomainForm({
      name: dom.name || '',
      description: dom.description || ''
    });
    setDomainModalOpen(true);
  };

  const handleSubmitDomain = async (e) => {
    if (e) e.preventDefault();
    if (!domainForm.name.trim()) {
      showToast('Domain name is required.');
      return;
    }

    setSubmittingDomain(true);
    try {
      if (domainModalMode === 'edit' && domainToEdit) {
        const res = await api.put(`/admin/domain-management/domains/${domainToEdit._id}`, {
          name: domainForm.name.trim(),
          description: domainForm.description.trim()
        });
        if (res.data?.success) {
          showToast(res.data.message || 'Domain updated successfully.');
          setDomainModalOpen(false);
          const oldName = domainToEdit.name;
          const newName = domainForm.name.trim();
          if (courseForm.domain === oldName) {
            setCourseForm(prev => ({ ...prev, domain: newName }));
          }
          if (editCourseForm.domain === oldName) {
            setEditCourseForm(prev => ({ ...prev, domain: newName }));
          }
          await fetchTechnicalDomains();
          await fetchCategories();
          await fetchDomainData();
        }
      } else {
        const res = await api.post('/admin/domain-management/domains', {
          name: domainForm.name.trim(),
          description: domainForm.description.trim()
        });
        if (res.data?.success) {
          showToast(res.data.message || 'Domain created successfully.');
          setDomainModalOpen(false);
          const savedDomain = res.data.data;
          // Auto-select newly created domain in Course forms
          if (savedDomain?.name) {
            setCourseForm(prev => ({
              ...prev,
              domain: savedDomain.name,
              categoryId: '',
              category: ''
            }));
            setEditCourseForm(prev => ({
              ...prev,
              domain: savedDomain.name
            }));
            setCategoryForm(prev => ({
              ...prev,
              domain: savedDomain.name
            }));
          }
          await fetchTechnicalDomains();
          await fetchDomainData();
        }
      }
    } catch (err) {
      console.error('Domain submission error:', err);
      showToast(err.response?.data?.message || err.userMessage || 'Failed to save domain.');
    } finally {
      setSubmittingDomain(false);
    }
  };

  const handleOpenAddCategory = () => {
    setCategoryModalMode('create');
    setCategoryToEdit(null);
    setCategoryForm({
      name: '',
      description: '',
      domain: courseForm.domain || (allAvailableDomains && allAvailableDomains[0]) || 'Enterprise Software',
      isActive: true
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryModalMode('edit');
    setCategoryToEdit(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      domain: cat.domain,
      isActive: cat.isActive !== false
    });
    setCategoryModalOpen(true);
  };

  const handleOpenDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
    setCategoryDeleteModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Category Name is required.');
      return;
    }
    if (!categoryForm.domain.trim()) {
      showToast('Associated Domain is required.');
      return;
    }
    setSubmittingCategory(true);
    try {
      if (categoryModalMode === 'edit' && categoryToEdit) {
        const res = await api.put(`/admin/domain-management/categories/${categoryToEdit._id}`, categoryForm);
        if (res.data?.success) {
          showToast(res.data.message || 'Category updated successfully.');
          setCategoryModalOpen(false);
          const updatedCat = res.data.data;
          await fetchCategories();
          await fetchDomainData();
          if (updatedCat) {
            if (courseForm.categoryId === updatedCat._id) {
              setCourseForm(prev => ({
                ...prev,
                category: updatedCat.name,
                domain: updatedCat.domain
              }));
            }
            if (editCourseForm.categoryId === updatedCat._id) {
              setEditCourseForm(prev => ({
                ...prev,
                category: updatedCat.name,
                domain: updatedCat.domain
              }));
            }
          }
        }
      } else {
        const res = await api.post('/admin/domain-management/categories', categoryForm);
        if (res.data?.success) {
          showToast(res.data.message || 'Course Category created successfully.');
          setCategoryModalOpen(false);
          const savedCat = res.data.data;
          await fetchCategories();
          await fetchDomainData();
          if (savedCat) {
            setCourseForm(prev => ({
              ...prev,
              domain: savedCat.domain,
              categoryId: savedCat._id,
              category: savedCat.name
            }));
            setEditCourseForm(prev => ({
              ...prev,
              domain: savedCat.domain,
              categoryId: savedCat._id,
              category: savedCat.name
            }));
          }
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save course category.');
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      const res = await api.patch(`/admin/domain-management/categories/${cat._id}/status`);
      if (res.data?.success) {
        showToast(res.data.message || 'Status updated.');
        setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, isActive: !c.isActive } : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category status.');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    if (categoryToDelete.courseCount > 0) {
      alert(`Cannot delete category "${categoryToDelete.name}" because ${categoryToDelete.courseCount} course(s) are associated with it.`);
      return;
    }
    setDeletingCategory(true);
    try {
      const res = await api.delete(`/admin/domain-management/categories/${categoryToDelete._id}`);
      if (res.data?.success) {
        showToast(res.data.message || 'Category deleted successfully.');
        setCategoryDeleteModalOpen(false);
        setCategoryToDelete(null);
        await fetchCategories();
        await fetchDomainData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    } finally {
      setDeletingCategory(false);
    }
  };

  // Fetch single Item Details & Modules (Course, Internship, or Project)
  const fetchItemDetail = async (item, type) => {
    setLoadingDetail(true);
    try {
      const endpoint =
        type === 'internship' ? `/admin/domain-management/internships/${item._id}/details` :
        type === 'project' ? `/admin/domain-management/projects/${item._id}/details` :
        `/admin/domain-management/courses/${item._id}/details`;

      const res = await api.get(endpoint);
      if (res.data.success) {
        setItemDetail(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching item detail:', err);
      showToast(`Failed to load details for this ${type}.`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Polling interval ref for question generation
  const pollingIntervalRef = useRef(null);

  // Fetch Generation Status
  const fetchGenerationStatus = useCallback(async (courseId) => {
    try {
      const res = await api.get(`/admin/syllabus/generation-status/${courseId}`);
      if (res.data?.success) {
        setGenerationStatus(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.error('Error fetching generation status:', err);
    }
    return null;
  }, []);

  // Fetch Questions for all 4 modules
  const fetchCourseQuestions = useCallback(async (courseId) => {
    setLoadingQuestions(true);
    try {
      const res = await api.get(`/admin/syllabus/course-questions/${courseId}`);
      if (res.data?.success) {
        setCourseQuestionsData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching course questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  // Poll generation status while job is actively running with controlled error recovery
  useEffect(() => {
    const isGenerating = generationStatus?.job?.status === 'generating' || generatingQuestions;
    const currentCourseId = selectedDomainItem?.type === 'course' ? selectedDomainItem.item?._id : null;

    if (isGenerating && currentCourseId) {
      let pollErrorStreak = 0;
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const statusData = await fetchGenerationStatus(currentCourseId);
            pollErrorStreak = 0;
            if (statusData?.job?.status === 'completed') {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
              setGeneratingQuestions(false);
              showToast('All syllabus modules, tasks, and questions verified successfully!');
              fetchCourseQuestions(currentCourseId);
              if (selectedDomainItem?.item && selectedDomainItem?.type) {
                fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
              }
            } else if (statusData?.job?.status === 'failed' || statusData?.job?.status === 'partial' || statusData?.job?.status === 'cancelled') {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
              setGeneratingQuestions(false);
              showToast(statusData.job.error || (statusData.job.status === 'partial' ? 'Partial generation completed.' : 'Generation job halted.'));
              if (selectedDomainItem?.item && selectedDomainItem?.type) {
                fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
              }
            }
          } catch (e) {
            pollErrorStreak++;
            console.warn(`[Generation Poller] Temporary connection hitch (retry ${pollErrorStreak}/6):`, e.message);
            // Controlled resilience: if temporary glitch, continue polling without halting job
            if (pollErrorStreak >= 6) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
              setGeneratingQuestions(false);
              showToast('Reconnection limit reached. You can refresh or click Resume to continue tracking.');
            }
          }
        }, 2000);
      }
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [generationStatus?.job?.status, generatingQuestions, selectedDomainItem, fetchGenerationStatus, fetchCourseQuestions]);

  // Trigger AI Question Generation for Course
  const handleTriggerGenerateQuestions = async (courseId, forceRegenerate = false) => {
    setGeneratingQuestions(true);
    try {
      const res = await api.post(`/admin/syllabus/generate-questions/${courseId}`, {
        questionsPerTopic: 2,
        forceRegenerate
      });
      if (res.data?.success) {
        showToast(res.data.message || 'Generation initiated across all 4 modules.');
        fetchGenerationStatus(courseId);
      }
    } catch (err) {
      console.error('Generation error:', err);
      showToast(err.response?.data?.message || 'Question generation failed.');
      setGeneratingQuestions(false);
    }
  };

  // Trigger Global AI Question Generation for ALL Domains Dynamically
  const handleGenerateAllDomains = async (forceRegenerate = false) => {
    setGeneratingQuestions(true);
    try {
      showToast('Initiating global question generation across all domains...');
      const res = await api.post('/admin/syllabus/generate-all-domains', {
        questionsPerTopic: 2,
        forceRegenerate
      });
      if (res.data?.success) {
        showToast(res.data.message || 'Global question generation initiated across all domains.');
        if (selectedDomainItem?.item?._id) {
          fetchGenerationStatus(selectedDomainItem.item._id);
        }
      }
    } catch (err) {
      console.error('Global generation error:', err);
      showToast(err.response?.data?.message || 'Failed to trigger global question generation.');
      setGeneratingQuestions(false);
    }
  };

  // Retry Generation Job
  const handleRetryGeneration = async (courseId, jobId) => {
    setGeneratingQuestions(true);
    try {
      showToast('Resuming question generation...');
      const res = await api.post(`/admin/syllabus/retry-generation/${jobId}`);
      if (res.data?.success) {
        showToast('Generation job resumed.');
        fetchGenerationStatus(courseId);
      }
    } catch (err) {
      console.error('Retry error:', err);
      showToast(err.response?.data?.message || 'Failed to retry generation.');
      setGeneratingQuestions(false);
    }
  };

  // Regenerate Topic Questions
  const handleRegenerateTopic = async (courseId, moduleId, topic) => {
    try {
      showToast(`Regenerating questions for "${topic}"...`);
      const res = await api.post('/admin/syllabus/regenerate-topic', { courseId, moduleId, topic });
      if (res.data.success) {
        showToast(res.data.message || `Topic "${topic}" questions regenerated!`);
        fetchGenerationStatus(courseId);
        fetchCourseQuestions(courseId);
      }
    } catch (err) {
      console.error('Topic regeneration error:', err);
      showToast(err.response?.data?.message || 'Topic regeneration failed.');
    }
  };

  // Fetch Flagged Questions
  const fetchFlaggedQuestions = useCallback(async (courseId = null) => {
    const cId = courseId || selectedDomainItem?.item?._id || 'overall';
    setLoadingFlagged(true);
    try {
      const res = await api.get(`/admin/syllabus/flagged-questions/${cId}`);
      if (res.data?.success) {
        setFlaggedQuestionsList(res.data.data.questions || []);
      }
    } catch (err) {
      console.error('Error fetching flagged questions:', err);
    } finally {
      setLoadingFlagged(false);
    }
  }, [selectedDomainItem]);

  // Update Verification Status (verified, tested, flagged)
  const handleUpdateVerification = async (type, id, status, reason = '') => {
    try {
      const res = await api.patch(`/admin/syllabus/question/${type}/${id}/verification`, { status, reason });
      if (res.data.success) {
        showToast(`Question marked as ${status.toUpperCase()}`);
        if (selectedDomainItem?.item?._id) {
          fetchGenerationStatus(selectedDomainItem.item._id);
          fetchCourseQuestions(selectedDomainItem.item._id);
          fetchFlaggedQuestions(selectedDomainItem.item._id);
          if (selectedDomainItem?.item && selectedDomainItem?.type) {
            fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
          }
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Failed to update verification status.');
    }
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (item, type) => {
    setEditingQuestionItem({ item, type });
    setEditValidationResult(null);

    const isMcq = item.questionType === 'mcq' || (Array.isArray(item.options) && item.options.length > 0);
    const existingTestCases = Array.isArray(item.testCases) && item.testCases.length > 0
      ? item.testCases
      : (item.sampleInput || item.expectedOutput)
      ? [{ input: item.sampleInput || '', expectedOutput: item.expectedOutput || item.sampleOutput || '', isHidden: false }]
      : [{ input: '', expectedOutput: '', isHidden: false }, { input: '', expectedOutput: '', isHidden: true }];

    const defaultOptions = [
      { optionId: 'A', text: '' },
      { optionId: 'B', text: '' },
      { optionId: 'C', text: '' },
      { optionId: 'D', text: '' }
    ];

    let currentOptions = defaultOptions;
    if (Array.isArray(item.options) && item.options.length === 4) {
      currentOptions = item.options.map((opt, i) => ({
        optionId: opt.optionId || ['A', 'B', 'C', 'D'][i],
        text: opt.text || opt.value || ''
      }));
    }

    setEditQuestionForm({
      title: item.title || '',
      problemStatement: item.problemStatement || item.instructions || item.description || '',
      description: item.description || item.instructions || '',
      inputFormat: item.inputFormat || '',
      outputFormat: item.outputFormat || '',
      constraints: item.constraints || '',
      sampleInput: item.sampleInput || '',
      sampleOutput: item.sampleOutput || '',
      referenceSolution: item.referenceSolution || item.solutionCode || item.testingSolution || '',
      explanation: item.explanation || '',
      difficulty: item.difficulty || 'Easy',
      points: Number(item.points) || 10,
      expectedOutput: item.expectedOutput || '',
      compiler: item.compiler || item.technology || 'javascript',
      technology: item.technology || '',
      testCases: existingTestCases,
      questionType: isMcq ? 'mcq' : 'coding',
      options: currentOptions,
      correctAnswer: item.correctAnswer || 'A',
      topic: item.topic || '',
      moduleId: item.moduleId?._id || item.moduleId || ''
    });
    setEditingQuestionModalOpen(true);
  };

  // Save Question Edit with Automatic Compiler / MCQ Validation
  const handleSaveQuestionEdit = async (e) => {
    e.preventDefault();
    if (!editingQuestionItem) return;
    const { item, type } = editingQuestionItem;

    setSubmittingQuestionEdit(true);
    setEditValidationResult(null);

    try {
      const res = await api.put(`/admin/syllabus/question/${type}/${item._id}`, editQuestionForm);
      if (res.data.success) {
        const val = res.data.validation;
        if (val && !val.isValid) {
          setEditValidationResult(val);
          showToast(`Saved, but flagged: ${val.reason}`);
        } else {
          showToast('Question details and solution verified by compiler!');
          setEditingQuestionModalOpen(false);
        }

        const cId = selectedDomainItem?.item?._id;
        if (cId) {
          fetchGenerationStatus(cId);
          fetchCourseQuestions(cId);
          fetchFlaggedQuestions(cId);
          if (selectedDomainItem?.item && selectedDomainItem?.type) {
            fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
          }
        }
      }
    } catch (err) {
      console.error('Question edit error:', err);
      showToast(err.response?.data?.message || 'Failed to save question edit.');
    } finally {
      setSubmittingQuestionEdit(false);
    }
  };

  // Open Delete Question Modal
  const handleOpenDeleteQuestion = (item, type) => {
    setQuestionToDelete({ item, type });
    setDeleteQuestionReason('');
    setDeleteQuestionModalOpen(true);
  };

  // Confirm Delete Question (Soft Delete, Preserves Student Records)
  const handleConfirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    const { item, type } = questionToDelete;
    setDeletingQuestion(true);
    try {
      const res = await api.delete(`/admin/syllabus/question/${type}/${item._id}`, {
        data: { reason: deleteQuestionReason }
      });
      if (res.data.success) {
        showToast(res.data.message || 'Question deleted successfully.');
        setDeleteQuestionModalOpen(false);
        const cId = selectedDomainItem?.item?._id;
        if (cId) {
          fetchGenerationStatus(cId);
          fetchCourseQuestions(cId);
          fetchFlaggedQuestions(cId);
          if (selectedDomainItem?.item && selectedDomainItem?.type) {
            fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
          }
        }
      }
    } catch (err) {
      console.error('Delete question error:', err);
      showToast(err.response?.data?.message || 'Failed to delete question.');
    } finally {
      setDeletingQuestion(false);
    }
  };

  // Revalidate Question on Demand
  const handleRevalidateQuestion = async (item, type) => {
    try {
      showToast(`Revalidating "${item.title || 'question'}"...`);
      const res = await api.post(`/admin/syllabus/question/${type}/${item._id}/revalidate`);
      showToast(res.data.message || (res.data.success ? 'Validation passed!' : 'Validation failed.'));
      const cId = selectedDomainItem?.item?._id;
      if (cId) {
        fetchGenerationStatus(cId);
        fetchCourseQuestions(cId);
        fetchFlaggedQuestions(cId);
        if (selectedDomainItem?.item && selectedDomainItem?.type) {
          fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
        }
      }
    } catch (err) {
      console.error('Revalidate error:', err);
      showToast(err.response?.data?.message || 'Revalidation failed.');
    }
  };

  // Open Recover Question Modal
  const handleOpenRecoverQuestion = (item, type) => {
    setQuestionToRecover({ item, type });
    setRecoverResult(null);
    setRecoverQuestionModalOpen(true);
  };

  // Execute Recover Question (Runs compiler / MCQ validation)
  const handleExecuteRecoverQuestion = async () => {
    if (!questionToRecover) return;
    const { item, type } = questionToRecover;
    setRecoveringQuestion(true);
    setRecoverResult(null);
    try {
      const res = await api.post(`/admin/syllabus/question/${type}/${item._id}/recover`);
      if (res.data.success) {
        showToast('Question successfully recovered and verified by compiler!');
        setRecoverQuestionModalOpen(false);
        const cId = selectedDomainItem?.item?._id;
        if (cId) {
          fetchGenerationStatus(cId);
          fetchCourseQuestions(cId);
          fetchFlaggedQuestions(cId);
          if (selectedDomainItem?.item && selectedDomainItem?.type) {
            fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
          }
        }
      }
    } catch (err) {
      console.error('Recover error:', err);
      const errData = err.response?.data || {};
      setRecoverResult({
        success: false,
        flagReason: errData.flagReason || err.message,
        compilerError: errData.compilerError,
        failedTestCases: errData.failedTestCases || []
      });
      showToast(errData.message || 'Recovery failed: Validation did not pass.');
      const cId = selectedDomainItem?.item?._id;
      if (cId) {
        fetchGenerationStatus(cId);
        fetchFlaggedQuestions(cId);
      }
    } finally {
      setRecoveringQuestion(false);
    }
  };

  // Open Admin Override Modal
  const handleOpenOverrideQuestion = (item, type) => {
    setQuestionToOverride({ item, type });
    setOverrideReason('');
    setOverrideModalOpen(true);
  };

  // Confirm Admin Override
  const handleConfirmOverrideQuestion = async () => {
    if (!questionToOverride) return;
    if (!overrideReason.trim()) {
      showToast('Please provide a mandatory override reason.');
      return;
    }
    const { item, type } = questionToOverride;
    setSubmittingOverride(true);
    try {
      const res = await api.post(`/admin/syllabus/question/${type}/${item._id}/override`, {
        reason: overrideReason
      });
      if (res.data.success) {
        showToast('Administrative override applied and logged in audit history.');
        setOverrideModalOpen(false);
        const cId = selectedDomainItem?.item?._id;
        if (cId) {
          fetchGenerationStatus(cId);
          fetchCourseQuestions(cId);
          fetchFlaggedQuestions(cId);
          if (selectedDomainItem?.item && selectedDomainItem?.type) {
            fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
          }
        }
      }
    } catch (err) {
      console.error('Override error:', err);
      showToast(err.response?.data?.message || 'Failed to apply admin override.');
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Publish Verified Questions to Students
  const handlePublishQuestions = async (courseId) => {
    try {
      const res = await api.post(`/admin/syllabus/publish-questions/${courseId}`);
      if (res.data.success) {
        showToast(res.data.message || 'All verified questions published to student dashboards!');
        fetchGenerationStatus(courseId);
      }
    } catch (err) {
      console.error('Publish error:', err);
      showToast('Failed to publish questions.');
    }
  };

  // Open Item Detail View
  const handleOpenDetail = (item, type) => {
    setSelectedDomainItem({ item, type });
    fetchItemDetail(item, type);
    if (type === 'course') {
      fetchGenerationStatus(item._id);
      fetchCourseQuestions(item._id);
    }
  };

  // Open Update / Edit Modal
  const handleOpenUpdateModal = () => {
    if (!selectedDomainItem) return;
    const { item, type } = selectedDomainItem;
    if (type === 'course') {
      const matchedDom = technicalDomains.find(d =>
        (item.domainId && (d._id === item.domainId || d._id === item.domainId?._id)) ||
        (item.domain && d.name.toLowerCase() === item.domain.toLowerCase())
      );
      const durVal = item.durationValue || item.durationWeeks || 12;
      const durUnit = item.durationUnit || (item.durationText?.toLowerCase().includes('month') ? 'Months' : 'Weeks');
      setEditCourseForm({
        title: item.title || '',
        coursePrefix: item.coursePrefix || (item.slug ? `SQ-${item.slug.toUpperCase()}` : 'SQ-CRS'),
        studentIdPrefix: item.studentIdPrefix || (item.slug ? `SQ-${item.slug.toUpperCase()}` : 'SQ-STU'),
        startingSequence: item.startingSequence || 1,
        domain: item.domain || matchedDom?.name || (allAvailableDomains[0] || 'Enterprise Software'),
        domainId: item.domainId?._id || item.domainId || matchedDom?._id || '',
        description: item.description || '',
        durationValue: durVal,
        durationUnit: durUnit,
        durationWeeks: item.durationWeeks || durVal,
        durationText: item.durationText || `${durVal} ${durUnit}`,
        totalHours: item.totalHours || 120,
        totalCourseFee: item.totalCourseFee !== undefined ? item.totalCourseFee : 24000,
        monthlyInstallment: item.monthlyInstallment !== undefined ? item.monthlyInstallment : 2000,
        level: item.level || 'All Levels',
        isActive: item.isActive !== false
      });
    } else if (type === 'internship') {
      const matchedDom = technicalDomains.find(d =>
        (item.domainId && (d._id === item.domainId || d._id === item.domainId?._id)) ||
        (item.domain && d.name.toLowerCase() === item.domain.toLowerCase())
      );
      setEditInternshipForm({
        title: item.title || '',
        domain: item.domain || matchedDom?.name || 'Full Stack Development',
        domainId: item.domainId?._id || item.domainId || matchedDom?._id || '',
        techStack: Array.isArray(item.techStack) ? item.techStack.join(', ') : item.techStack || '',
        description: item.description || '',
        durationText: item.durationText || (item.durationWeeks === 2 ? '15 Days' : `${item.durationWeeks || 4} Weeks`),
        durationWeeks: item.durationWeeks || 4,
        stipend: item.stipend || 0,
        isPaid: Boolean(item.isPaid || (item.stipend > 0)),
        level: item.level || 'Intermediate',
        isActive: item.isActive !== false
      });
    } else if (type === 'project') {
      const matchedDom = technicalDomains.find(d =>
        (item.domainId && (d._id === item.domainId || d._id === item.domainId?._id)) ||
        (item.domain && d.name.toLowerCase() === item.domain.toLowerCase())
      );
      setEditProjectForm({
        title: item.title || '',
        description: item.description || '',
        domain: item.domain || matchedDom?.name || 'Enterprise Software',
        domainId: item.domainId?._id || item.domainId || matchedDom?._id || '',
        technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : item.technologies || '',
        requirements: Array.isArray(item.requirements) ? item.requirements.join('\n') : item.requirements || '',
        difficulty: item.difficulty || 'Intermediate',
        xpReward: item.xpReward || 300,
        estimatedHours: item.estimatedHours || 40,
        courseId: item.courseId?._id || item.courseId || '',
        status: item.status || 'Available'
      });
    }
    setUpdateModalTab(type === 'project' ? 'info' : 'syllabus');
    setShowSyllabusUploadForm(false);
    setUpdateSyllabusOpen(true);
    if (type === 'course' && item._id) {
      fetchGenerationStatus(item._id);
    }
  };

  // Submit Details Edit Info
  const handleEditInfoSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDomainItem) return;
    setUpdatingSyllabus(true);

    const { item, type } = selectedDomainItem;
    const endpoint =
      type === 'internship' ? `/admin/domain-management/internships/${item._id}` :
      type === 'project' ? `/admin/domain-management/projects/${item._id}` :
      `/admin/domain-management/courses/${item._id}`;

    try {
      const payload =
        type === 'internship' ? editInternshipForm :
        type === 'project' ? editProjectForm :
        editCourseForm;

      const res = await api.put(endpoint, payload);
      if (res.data.success) {
        showToast(res.data.message || `${type.toUpperCase()} details updated successfully!`);
        setSelectedDomainItem({ item: res.data.data, type });
        setUpdateSyllabusOpen(false);
        fetchDomainData();
        fetchItemDetail(res.data.data, type);
      }
    } catch (err) {
      console.error('Update details error:', err);
      alert(err.response?.data?.message || 'Failed to update details.');
    } finally {
      setUpdatingSyllabus(false);
    }
  };

  // Submit Syllabus Update (Text or PDF)
  const handleUpdateSyllabus = async (e) => {
    e.preventDefault();
    if (!selectedDomainItem) return;
    setUpdatingSyllabus(true);

    const { item, type } = selectedDomainItem;
    const domainSlug = item.slug || item.domain || item.title.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
      if (syllabusMode === 'pdf' && syllabusFile) {
        const formData = new FormData();
        formData.append('file', syllabusFile);
        formData.append('domain', domainSlug);
        formData.append('courseTitle', item.title);
        formData.append('courseId', item._id);
        formData.append('tasksPerModule', tasksPerModule);
        formData.append('isNewCourse', 'false');

        const res = await api.post('/admin/syllabus/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        });

        if (res.data.success) {
          showToast(res.data.message || 'Syllabus parsed successfully! Generating tasks in background.');
          setShowSyllabusUploadForm(false);
          setSyllabusFile(null);
          setGeneratingQuestions(true);
          fetchItemDetail(item, type);
          if (item._id) {
            fetchGenerationStatus(item._id);
          }
        }
      } else {
        if (!syllabusText.trim()) {
          showToast('Please enter syllabus text content.');
          setUpdatingSyllabus(false);
          return;
        }

        const res = await api.post('/admin/syllabus/upload-pdf', {
          text: syllabusText,
          domain: domainSlug,
          courseTitle: item.title,
          courseId: item._id,
          tasksPerModule,
          isNewCourse: false
        }, {
          timeout: 60000
        });

        if (res.data.success) {
          showToast(res.data.message || 'Syllabus parsed successfully! Generating tasks in background.');
          setShowSyllabusUploadForm(false);
          setSyllabusText('');
          setGeneratingQuestions(true);
          fetchItemDetail(item, type);
          if (item._id) {
            fetchGenerationStatus(item._id);
          }
        }
      }
    } catch (err) {
      console.error('Update syllabus error:', err);
      showToast(err.response?.data?.message || err.userMessage || err.message || 'Failed to update syllabus.');
    } finally {
      setUpdatingSyllabus(false);
    }
  };

  // Safe Cancel Generation Job without deleting saved tasks
  const handleCancelGenerationJob = async (jobId) => {
    if (!jobId) return;
    setCancellingJob(true);
    try {
      const res = await api.post(`/admin/syllabus/cancel-job/${jobId}`);
      if (res.data.success) {
        showToast('Generation cancelled safely. All completed modules and tasks are preserved.');
        setGeneratingQuestions(false);
        if (selectedDomainItem?.item?._id) {
          await fetchGenerationStatus(selectedDomainItem.item._id);
          fetchItemDetail(selectedDomainItem.item, selectedDomainItem.type);
        }
      }
    } catch (err) {
      console.error('Cancel generation error:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to cancel generation.');
    } finally {
      setCancellingJob(false);
    }
  };

  // Safe Resume Generation Job from last incomplete module
  const handleResumeSyllabusJob = async (jobId) => {
    if (!jobId) return;
    setGeneratingQuestions(true);
    try {
      const res = await api.post(`/admin/syllabus/resume-job/${jobId}`);
      if (res.data.success) {
        showToast('Resuming generation from the last incomplete module...');
        if (selectedDomainItem?.item?._id) {
          await fetchGenerationStatus(selectedDomainItem.item._id);
        }
      }
    } catch (err) {
      console.error('Resume generation error:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to resume generation.');
      setGeneratingQuestions(false);
    }
  };

  // Handle Delete Item
  const handleDeleteDomainItem = async () => {
    if (!selectedDomainItem) return;
    setDeletingItem(true);

    const { item, type } = selectedDomainItem;
    const endpoint =
      type === 'internship' ? `/admin/domain-management/internships/${item._id}` :
      type === 'project' ? `/admin/domain-management/projects/${item._id}` :
      `/admin/domain-management/courses/${item._id}`;

    try {
      const res = await api.delete(endpoint);
      if (res.data.success) {
        showToast(res.data.message || `${type.toUpperCase()} deleted successfully.`);
        setDeleteConfirmOpen(false);
        setSelectedDomainItem(null);
        setItemDetail(null);
        fetchDomainData();
      }
    } catch (err) {
      console.error(`Delete ${type} error:`, err);
      alert(err.response?.data?.message || `Failed to delete ${type}.`);
    } finally {
      setDeletingItem(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = (defaultType = null) => {
    resetAddForms();
    if (defaultType) {
      setSelectedType(defaultType);
    } else if (effectiveFixedType) {
      setSelectedType(
        effectiveFixedType === 'internship' ? 'Internship' :
        effectiveFixedType === 'project' ? 'Project' : 'Course'
      );
    } else {
      setSelectedType(
        activeTab === 'internship' ? 'Internship' :
        activeTab === 'project' ? 'Project' : 'Course'
      );
    }
    const firstDomain = (allAvailableDomains && allAvailableDomains[0]) || 'Enterprise Software';
    const firstCat = categories.find(c => c.domain === firstDomain && c.isActive);
    setCourseForm(prev => ({
      ...prev,
      domain: firstDomain,
      categoryId: firstCat ? firstCat._id : '',
      category: firstCat ? firstCat.name : ''
    }));
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    resetAddForms();
  };

  // Handle Form Submission for new record
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (selectedType === 'Course') {
        let finalTitle = courseForm.title ? courseForm.title.trim() : '';

        // If course title was left empty but a PDF was attached, extract title from PDF filename
        if (!finalTitle && courseForm.syllabusFile && courseForm.syllabusFile.name) {
          finalTitle = courseForm.syllabusFile.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
        }

        if (!finalTitle) {
          alert('Please enter a Course Title at the top of the form.');
          setSubmitting(false);
          return;
        }

        const updatedCourseForm = { ...courseForm, title: finalTitle };
        let payload = updatedCourseForm;

        if (updatedCourseForm.syllabusOption === 'pdf' && updatedCourseForm.syllabusFile) {
          const formData = new FormData();
          Object.keys(updatedCourseForm).forEach(key => {
            if (key !== 'syllabusFile' && updatedCourseForm[key] !== null && updatedCourseForm[key] !== undefined) {
              formData.append(key, updatedCourseForm[key]);
            }
          });
          formData.append('syllabusFile', updatedCourseForm.syllabusFile);
          payload = formData;
        }

        const res = await api.post('/admin/domain-management/courses', payload, { timeout: 90000 });
        if (res.data.success) {
          showToast(res.data.message || 'Course added successfully with syllabus modules.');
          setCourseForm(INITIAL_COURSE_FORM);
          setActiveTab('course');
          setAddModalOpen(false);
          fetchDomainData();
        }
      } else if (selectedType === 'Internship') {
        let finalTitle = internshipForm.title ? internshipForm.title.trim() : '';

        if (!finalTitle && internshipForm.syllabusFile && internshipForm.syllabusFile.name) {
          finalTitle = internshipForm.syllabusFile.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
        }

        if (!finalTitle) {
          alert('Please enter an Internship Title at the top of the form.');
          setSubmitting(false);
          return;
        }

        const updatedInternshipForm = { ...internshipForm, title: finalTitle };
        let payload = updatedInternshipForm;

        if (updatedInternshipForm.syllabusOption === 'pdf' && updatedInternshipForm.syllabusFile) {
          const formData = new FormData();
          Object.keys(updatedInternshipForm).forEach(key => {
            if (key !== 'syllabusFile' && updatedInternshipForm[key] !== null && updatedInternshipForm[key] !== undefined) {
              formData.append(key, updatedInternshipForm[key]);
            }
          });
          formData.append('syllabusFile', updatedInternshipForm.syllabusFile);
          payload = formData;
        }

        const res = await api.post('/admin/domain-management/internships', payload, { timeout: 90000 });
        if (res.data.success) {
          showToast(res.data.message || 'Internship added successfully with syllabus modules.');
          setInternshipForm(INITIAL_INTERNSHIP_FORM);
          setActiveTab('internship');
          setAddModalOpen(false);
          fetchDomainData();
        }
      } else if (selectedType === 'Project') {
        const res = await api.post('/admin/domain-management/projects', projectForm);
        if (res.data.success) {
          showToast(res.data.message || 'Project added successfully.');
          setProjectForm(INITIAL_PROJECT_FORM);
          setActiveTab('project');
          setAddModalOpen(false);
          fetchDomainData();
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save data. Please check form fields.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items according to search query and domain filter
  const filteredCourses = data.courses.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      c.title?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
    const matchesDomain = selectedDomainFilter === 'All' ||
      (c.domain && c.domain.toLowerCase() === selectedDomainFilter.toLowerCase()) ||
      (c.category && c.category.toLowerCase() === selectedDomainFilter.toLowerCase());
    return matchesSearch && matchesDomain;
  });

  const filteredInternships = data.internships.filter(i => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      i.title?.toLowerCase().includes(q) ||
      i.domain?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      (i.techStack || []).some(t => t.toLowerCase().includes(q))
    );
    const matchesDomain = selectedDomainFilter === 'All' ||
      (i.domain && i.domain.toLowerCase() === selectedDomainFilter.toLowerCase()) ||
      (i.category && i.category.toLowerCase() === selectedDomainFilter.toLowerCase());
    return matchesSearch && matchesDomain;
  });

  const filteredProjects = data.projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      p.title?.toLowerCase().includes(q) ||
      p.domain?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(q))
    );
    const matchesDomain = selectedDomainFilter === 'All' ||
      (p.domain && p.domain.toLowerCase() === selectedDomainFilter.toLowerCase()) ||
      (p.category && p.category.toLowerCase() === selectedDomainFilter.toLowerCase());
    return matchesSearch && matchesDomain;
  });

  // Dynamic Domains strictly derived from live database records
  const dbDomainOptions = useMemo(() => {
    const set = new Set();
    [...(data?.courses || []), ...(data?.internships || []), ...(data?.projects || [])].forEach(item => {
      if (item.category && item.category.trim()) set.add(item.category.trim());
      if (item.domain && item.domain.trim()) set.add(item.domain.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [data]);

  const availableDomainOptions = useMemo(() => {
    const set = new Set();
    const currentList =
      activeTab === 'course' ? (data?.courses || []) :
      activeTab === 'internship' ? (data?.internships || []) :
      (data?.projects || []);

    currentList.forEach(item => {
      if (item.category && item.category.trim()) set.add(item.category.trim());
      if (item.domain && item.domain.trim()) set.add(item.domain.trim());
    });
    return ['All', ...Array.from(set).filter(Boolean).sort()];
  }, [data, activeTab]);

  // Available domains for Course Categories and Course creation
  const allAvailableDomains = useMemo(() => {
    const set = new Set();
    (technicalDomains || []).forEach(d => {
      if (d.name && d.name.trim()) set.add(d.name.trim());
    });
    categories.forEach(c => {
      if (c.domain && c.domain.trim()) set.add(c.domain.trim());
    });
    [...(data?.courses || []), ...(data?.internships || []), ...(data?.projects || [])].forEach(item => {
      if (item.category && item.category.trim()) set.add(item.category.trim());
      if (item.domain && item.domain.trim()) set.add(item.domain.trim());
    });
    if (set.size === 0) {
      DOMAIN_CATEGORIES.forEach(d => set.add(d));
    }
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [technicalDomains, categories, data]);

  // Filtered Course Categories
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const q = categorySearch.toLowerCase().trim();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.domain && c.domain.toLowerCase().includes(q));

      const matchesDomain = selectedCategoryDomainFilter === 'All' || c.domain === selectedCategoryDomainFilter;
      const matchesStatus =
        selectedCategoryStatusFilter === 'All' ||
        (selectedCategoryStatusFilter === 'Active' && c.isActive) ||
        (selectedCategoryStatusFilter === 'Inactive' && !c.isActive);

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [categories, categorySearch, selectedCategoryDomainFilter, selectedCategoryStatusFilter]);

  // Helper getters for selected item
  const selectedItem = selectedDomainItem?.item;
  const itemType = selectedDomainItem?.type || 'course';

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-2 sm:px-4">

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-emerald-400 animate-slide-in-right text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          VIEW 1: DOMAIN ITEM DETAIL VIEW (OPENED WHEN COURSE / INTERNSHIP / PROJECT BOX CLICKED)
         ════════════════════════════════════════════════════════════════ */}
      {selectedDomainItem && selectedItem ? (
        <div className="space-y-6 animate-fade-in">
          {/* Top Breadcrumb Header */}
          <div className="bg-white rounded-3xl border border-purple-100/90 p-4 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/admin/command-center"
                className="px-4 py-2.5 bg-white hover:bg-white text-slate-700 border border-slate-200/90 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Dashboard</span>
              </Link>
              <button
                onClick={() => { setSelectedDomainItem(null); setItemDetail(null); }}
                className="px-4 py-2.5 bg-white hover:bg-white text-purple-900 border border-purple-200/80 font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4 text-purple-600" />
                <span>Back to {effectiveFixedType === 'course' ? 'Courses' : effectiveFixedType === 'internship' ? 'Internships' : effectiveFixedType === 'project' ? 'Projects' : 'Domain Catalog'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {itemType === 'internship' ? 'Internship Domain:' : itemType === 'project' ? 'Project Domain:' : 'Associated Domain:'}
              </span>
              <span className="text-xs font-bold bg-white text-purple-800 border border-purple-200 px-3 py-1 rounded-xl uppercase">
                {selectedItem.domain || selectedItem.category || 'Technical Domain'}
              </span>
            </div>
          </div>

          {/* Item Hero Banner Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                {/* Subtle Accent Pill Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-white text-[#E02B91] border border-pink-200 text-xs font-black uppercase tracking-wider">
                    {selectedItem.domain || selectedItem.category || 'Domain Track'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white text-purple-700 border border-purple-200 text-xs font-bold">
                    {selectedItem.level || selectedItem.difficulty || 'All Levels'}
                  </span>
                  
                  {itemType === 'course' && (
                    <span className="px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedItem.durationWeeks || 12} Weeks ({selectedItem.totalHours || 120} Hrs)</span>
                    </span>
                  )}

                  {itemType === 'internship' && (
                    <>
                      <span className="px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedItem.durationText || (selectedItem.durationWeeks === 2 ? '15 Days' : `${selectedItem.durationWeeks || 4} Weeks`)}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 text-xs font-black">
                        {selectedItem.stipend > 0 ? `₹${selectedItem.stipend.toLocaleString()}` : 'Free / Stipend Available'}
                      </span>
                    </>
                  )}

                  {itemType === 'project' && (
                    <>
                      <span className="px-3 py-1 rounded-full bg-white text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{selectedItem.estimatedHours || 40} Hours</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white text-purple-700 border border-purple-200 text-xs font-black">
                        +{selectedItem.xpReward || 300} XP
                      </span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-snug">
                  {selectedItem.title}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-xl">
                  {selectedItem.description || `Comprehensive training modules and practical tasks for ${selectedItem.title}.`}
                </p>

                {/* Tech Badges if Internship or Project */}
                {(selectedItem.techStack || selectedItem.technologies) && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(selectedItem.techStack || selectedItem.technologies || []).map((tech, idx) => (
                      <span key={idx} className="text-[11px] font-bold bg-white text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons: Update & Delete */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start">
                <button
                  onClick={handleOpenUpdateModal}
                  className={`px-5 py-2.5 bg-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border-2 ${ itemType === 'project' ? 'border-amber-600 text-amber-700 hover:border-amber-700 hover:text-amber-800' : itemType === 'course' ? 'border-blue-600 text-blue-700 hover:border-blue-700 hover:text-blue-800' : 'border-emerald-600 text-emerald-700 hover:border-emerald-700 hover:text-emerald-800' }`}
                >
                  {itemType === 'project' ? <Edit3 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  <span>{itemType === 'project' ? 'Edit Project Specs' : itemType === 'course' ? 'Update Course' : 'Update Internship'}</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="px-5 py-2.5 bg-white hover:border-slate-500 text-slate-700 hover:text-slate-900 border border-slate-300 font-extrabold text-xs sm:text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete {itemType === 'course' ? 'Course' : itemType === 'internship' ? 'Internship' : 'Project'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 border-t border-slate-100">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>{itemType === 'project' ? 'Deliverables' : itemType === 'internship' ? 'Milestones' : 'Total Modules'}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">
                  {itemType === 'project' ? (selectedItem.requirements?.length || 0) : (itemDetail?.modules?.length ?? itemDetail?.totalModules ?? 0)}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#E02B91]" />
                  <span>{itemType === 'project' ? 'Tech Stack' : 'Generated Tasks'}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#E02B91]">
                  {itemType === 'project' ? ((selectedItem.technologies || selectedItem.techStack || []).length) : (itemDetail?.modules ? itemDetail.modules.reduce((sum, m) => sum + (m.tasks?.length || 0), 0) : (itemDetail?.totalTasks ?? 0))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Status</span>
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-600 flex items-center gap-1">
                  {selectedItem.status || 'Active'}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500" />
                  <span>{itemType === 'internship' ? 'Stipend' : itemType === 'project' ? 'XP Reward' : 'Level'}</span>
                </div>
                <div className="text-sm sm:text-base font-black text-purple-700 truncate">
                  {itemType === 'internship' ? (selectedItem.stipend > 0 ? `₹${selectedItem.stipend.toLocaleString()}` : 'Free') :
                   itemType === 'project' ? `+${selectedItem.xpReward || 300} XP` :
                   (selectedItem.level || 'All Levels')}
                </div>
              </div>
            </div>
          </div>

          {/* AI 4-Module Question Bank Summary & Action Toolbar (Course Only) */}
          {itemType === 'course' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-purple-100/90 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                      Automatic AI Question Bank (4 Modules)
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${ generationStatus?.job?.status === 'completed' ? 'bg-white text-emerald-800 border border-emerald-200' : generationStatus?.job?.status === 'generating' ? 'bg-white text-purple-800 border border-purple-200 animate-pulse' : generationStatus?.job?.status === 'failed' ? 'bg-white text-rose-800 border border-rose-200' : 'bg-white text-slate-700 border border-slate-200' }`}>
                      {generationStatus?.job?.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {generationStatus?.job?.currentStep || 'Complete questions generated across Interview Arena, Game Hub, Mock Interview, and Practice.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {generationStatus?.job?.status === 'failed' && generationStatus?.job?._id && (
                    <button
                      type="button"
                      disabled={generatingQuestions}
                      onClick={() => handleRetryGeneration(selectedItem._id, generationStatus.job._id)}
                      className="bg-white px-4 py-2 text-sq-gradient font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-[#9333EA]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingQuestions ? 'Resuming...' : 'Retry Generation'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={generatingQuestions || generationStatus?.job?.status === 'generating'}
                    onClick={() => handleTriggerGenerateQuestions(selectedItem._id, true)}
                    className="bg-white px-4 py-2 text-sq-gradient font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-[#9333EA]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{generatingQuestions || generationStatus?.job?.status === 'generating' ? 'Generating Questions...' : 'Regenerate All 4 Modules'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={generatingQuestions || generationStatus?.job?.status === 'generating'}
                    onClick={() => handleGenerateAllDomains(false)}
                    className="bg-white px-3.5 py-2 text-blue-700 font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-blue-600"
                    title="Generate syllabus-based questions dynamically across ALL courses and domains in the database"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Generate All Domains</span>
                  </button>

                  <button
                    type="button"
                    disabled={generatingQuestions || generationStatus?.job?.status === 'generating' || (generationStatus?.counts?.total || 0) === 0 || generationStatus?.job?.status !== 'completed'}
                    onClick={() => handlePublishQuestions(selectedItem._id)}
                    className={`px-4 py-2 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer ${ generationStatus?.job?.status === 'completed' && (generationStatus?.counts?.total || 0) > 0 ? 'bg-white text-emerald-700 shadow-emerald-500/20 hover:opacity-95 border border-emerald-600' : 'bg-white text-slate-400 border border-slate-200 cursor-not-allowed opacity-60' }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish to Students</span>
                  </button>
                </div>
              </div>

              {/* Progress bar if generating */}
              {(generationStatus?.job?.status === 'generating' || generatingQuestions) && (
                <div className="bg-white space-y-2 p-3.5 rounded-2xl border border-purple-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping inline-block" />
                      {generationStatus?.job?.currentStep || 'Generating and testing questions in background...'}
                    </span>
                    <span className="text-xs text-purple-700 font-mono font-black">
                      {generationStatus?.job?.progress || 0}% Complete
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, generationStatus?.job?.progress || 0)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>
                      Modules: {generationStatus?.job?.stats?.completedModules || 0} / {generationStatus?.job?.stats?.totalModules || generationStatus?.counts?.totalModules || 0}
                    </span>
                    <span>
                      Tested Solutions: <strong className="text-emerald-700">{generationStatus?.counts?.testedSolutions || 0}</strong>
                    </span>
                    {generationStatus?.job?.stats?.failedBatches > 0 && (
                      <span className="text-rose-600 font-bold">
                        Failed Batches: {generationStatus.job.stats.failedBatches}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Error & Resume Banner if Job Encountered Issues */}
              {generationStatus?.job?.status === 'failed' && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Generation Interrupted / Incomplete Modules Detected</span>
                    </div>
                    <p className="text-slate-600">
                      {generationStatus.job.error || 'A temporary issue occurred during task generation. Completed modules have been preserved in database.'}
                    </p>
                  </div>
                  {generationStatus.job._id && (
                    <button
                      type="button"
                      disabled={generatingQuestions}
                      onClick={() => handleRetryGeneration(selectedItem._id, generationStatus.job._id)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${generatingQuestions ? 'animate-spin' : ''}`} />
                      <span>Resume Incomplete Modules</span>
                    </button>
                  )}
                </div>
              )}

              {/* Module Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <div
                  onClick={() => setActiveQuestionsTab('arena')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition text-center shadow-2xs ${ activeQuestionsTab === 'arena' ? 'bg-white border-purple-300 ring-2 ring-purple-500/20 shadow-xs' : 'bg-white hover:bg-white border-slate-200/80' }`}
                >
                  <div className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${ activeQuestionsTab === 'arena' ? 'text-purple-900 font-black' : 'text-slate-500' }`}>
                    1. Interview Arena
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight mt-1 ${ activeQuestionsTab === 'arena' ? 'text-purple-700' : 'text-slate-900' }`}>
                    {generationStatus?.counts?.interviewArena ?? courseQuestionsData?.interviewArena?.length ?? 0}
                  </div>
                </div>

                <div
                  onClick={() => setActiveQuestionsTab('mock')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition text-center shadow-2xs ${ activeQuestionsTab === 'mock' ? 'bg-white border-purple-300 ring-2 ring-purple-500/20 shadow-xs' : 'bg-white hover:bg-white border-slate-200/80' }`}
                >
                  <div className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${ activeQuestionsTab === 'mock' ? 'text-purple-900 font-black' : 'text-slate-500' }`}>
                    2. Mock Interview
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight mt-1 ${ activeQuestionsTab === 'mock' ? 'text-purple-700' : 'text-slate-900' }`}>
                    {generationStatus?.counts?.mockInterview ?? courseQuestionsData?.mockInterview?.length ?? 0}
                  </div>
                </div>

                <div
                  onClick={() => setActiveQuestionsTab('modules')}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition text-center shadow-2xs ${ activeQuestionsTab === 'modules' ? 'bg-white border-purple-300 ring-2 ring-purple-500/20 shadow-xs' : 'bg-white hover:bg-white border-slate-200/80' }`}
                >
                  <div className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${ activeQuestionsTab === 'modules' ? 'text-purple-900 font-black' : 'text-slate-500' }`}>
                    3. Testing & Practice
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight mt-1 ${ activeQuestionsTab === 'modules' ? 'text-purple-700' : 'text-slate-900' }`}>
                    {generationStatus?.counts?.testingPractice ?? courseQuestionsData?.testingPractice?.length ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Tested Solutions
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-emerald-600 mt-1">
                    {generationStatus?.counts?.testedSolutions ?? 0}
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveQuestionsTab('flagged');
                    if (selectedItem?._id) {
                      fetchFlaggedQuestions(selectedItem._id);
                    }
                  }}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition text-center shadow-2xs ${
                    activeQuestionsTab === 'flagged'
                      ? 'bg-white border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-white hover:bg-rose-50/20 border-slate-200/80'
                  }`}
                >
                  <div className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${
                    activeQuestionsTab === 'flagged' ? 'text-rose-900 font-black' : 'text-slate-500'
                  }`}>
                    Flagged Review
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight mt-1 ${
                    (generationStatus?.counts?.flagged ?? 0) > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {generationStatus?.counts?.flagged ?? 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              PROJECT VIEW: SPECIFICATIONS, DELIVERABLES & REQUIREMENTS
             ════════════════════════════════════════════════════════════════ */}
          {itemType === 'project' ? (
            <div className="space-y-6">
              {/* Project Deliverables Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-purple-600" />
                    <span>Project Specifications & Deliverables</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Core technical architecture, functional deliverables, technology stack, and evaluation guidelines.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenUpdateModal}
                    className="bg-white px-4 py-2.5 hover:opacity-95 text-sq-gradient font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer border border-[#9333EA]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Project Specs</span>
                  </button>
                </div>
              </div>

              {/* Main 2-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Requirements & Scope */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Scope / Description Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Project Overview & Scope</h4>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-purple-700 border border-purple-200">
                        {selectedItem.difficulty || 'Intermediate'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedItem.description || 'No detailed scope provided yet for this project.'}
                    </p>
                  </div>

                  {/* Requirements & Deliverables Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                          Key Deliverables & Functional Requirements ({(selectedItem.requirements || []).length})
                        </h4>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">
                        Evaluation Checklist
                      </span>
                    </div>

                    {(!selectedItem.requirements || selectedItem.requirements.length === 0) ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-bold text-slate-500">No specific deliverables listed yet.</p>
                        <p className="text-[11px] text-slate-400">Click "Edit Project Specs" to add functional deliverables and requirements.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedItem.requirements.map((req, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-white hover:border-purple-200 hover:shadow-2xs transition"
                          >
                            <div className="w-6 h-6 rounded-full bg-white text-purple-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {req}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 1 Col: Tech Stack & Project Info */}
                <div className="space-y-6">
                  {/* Tech Stack Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Code2 className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Required Tech Stack</h4>
                    </div>

                    {(!selectedItem.technologies || selectedItem.technologies.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No technologies listed.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-white text-purple-800 border border-purple-200 text-xs font-extrabold shadow-2xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Project Info Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                      Project Information
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-semibold">Associated Domain</span>
                        <span className="font-bold text-slate-900">{selectedItem.domain || selectedItem.category || 'Enterprise Software'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-semibold">Difficulty Level</span>
                        <span className="font-bold text-purple-700">{selectedItem.difficulty || 'Intermediate'}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-semibold">Estimated Effort</span>
                        <span className="font-bold text-slate-900">{selectedItem.estimatedHours || 40} Hours</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500 font-semibold">XP Completion Reward</span>
                        <span className="font-black text-amber-600">+{selectedItem.xpReward || 300} XP</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-500 font-semibold">Current Status</span>
                        <span className="font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200 text-[11px]">
                          {selectedItem.status || 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Repository & Demo links if provided */}
                  {(selectedItem.githubRepoUrl || selectedItem.liveDemoUrl) && (
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-2xs">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                        Project Links
                      </h4>
                      {selectedItem.githubRepoUrl && (
                        <a
                          href={selectedItem.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-bold text-purple-700 hover:underline"
                        >
                          <span>GitHub Repository</span>
                        </a>
                      )}
                      {selectedItem.liveDemoUrl && (
                        <a
                          href={selectedItem.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline"
                        >
                          <span>Live Demo Preview</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Syllabus Modules List Section (Testing & Practice) */}
              {activeQuestionsTab === 'modules' && (
              <div className="space-y-4">
                {/* Toolbar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {itemType === 'internship' ? 'Internship Milestones & Tasks' : 'Syllabus Modules & Generated Questions'}
                    </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Click any module to view sub-topics and generated questions ({itemDetail?.modules?.length || 0} Total Modules)
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-3.5 py-2 bg-white hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Expand All Modules
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-3.5 py-2 bg-white hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="w-8 h-8 border-4 border-[#E02B91] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading modules & syllabus...</p>
              </div>
            ) : itemDetail?.modules?.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-800">No Syllabus Modules Generated Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Update {itemType.charAt(0).toUpperCase() + itemType.slice(1)}" above to upload a PDF or paste syllabus text. System will auto-generate modules and tasks!
                  </p>
                </div>
                <button
                  onClick={handleOpenUpdateModal}
                  className="bg-white px-6 py-3 text-sq-gradient font-bold text-xs rounded-2xl shadow-md transition border border-[#9333EA]"
                >
                  + Upload Syllabus PDF / Text
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {itemDetail?.modules?.map((mod, idx) => {
                  const isOpen = Boolean(openModules[mod._id]);
                  const taskCount = mod.tasks?.length || 0;

                  return (
                    <div
                      key={mod._id}
                      className="bg-white border border-slate-200 rounded-3xl shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300"
                    >
                      {/* Module Header Bar */}
                      <div
                        onClick={() => toggleModule(mod._id)}
                        className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none border-b border-slate-100"
                      >
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="bg-white w-12 h-12 rounded-2xl text-sq-gradient font-black text-base flex items-center justify-center shadow-xs shrink-0 border border-[#9333EA]">
                            M{String(idx + 1).padStart(2, '0')}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Module {idx + 1}
                              </span>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
                                Active Syllabus
                              </span>
                              {(() => {
                                const mProg = generationStatus?.job?.moduleProgress?.find(p => (p.moduleId && p.moduleId.toString() === mod._id?.toString()) || p.order === (idx + 1));
                                return (
                                  <>
                                    {mProg?.status === 'generating' && (
                                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-purple-800 border border-purple-200 animate-pulse">
                                        Generating...
                                      </span>
                                    )}
                                    {mProg?.status === 'completed' && (
                                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
                                        Completed & Verified
                                      </span>
                                    )}
                                    {mProg?.status === 'failed' && (
                                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-rose-700 border border-rose-200">
                                        Batch Error
                                      </span>
                                    )}
                                    {mProg?.testedCount > 0 && (
                                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-teal-700 border border-teal-200">
                                        {mProg.testedCount} Tested Solutions
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#E02B91] border border-pink-200">
                                {taskCount} Questions Generated
                              </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                              {mod.title}
                            </h3>

                            {mod.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span className="text-xs font-bold text-slate-400">
                            {isOpen ? 'Collapse' : 'Expand Topics & Questions'}
                          </span>
                          <div className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl">
                            {isOpen ? <ChevronDown className="w-5 h-5 text-[#E02B91]" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Section */}
                      {isOpen && (
                        <div className="p-5 sm:p-6 bg-white space-y-4">
                          {mod.description && (
                            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
                              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Module Sub-topics & Overview</p>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">{mod.description}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1 pt-1 flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 text-[#E02B91] font-black">
                              <Sparkles className="w-4 h-4" />
                              <span>System Generated Questions & Tasks ({taskCount} Total)</span>
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegenerateTopic(selectedItem._id, mod._id, mod.title);
                              }}
                              className="px-3 py-1 bg-white hover:bg-white text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>Regenerate Module Questions</span>
                            </button>
                          </div>

                          {!mod.tasks || mod.tasks.length === 0 ? (
                            <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-400">
                              No questions generated for this module yet.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {mod.tasks.map((t, tIdx) => (
                                <div
                                  key={t._id || tIdx}
                                  className={`bg-white border rounded-2xl p-4 space-y-3 shadow-2xs transition ${
                                    t.verificationStatus === 'flagged' ? 'border-rose-300 ring-1 ring-rose-400/20' : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                        t.verificationStatus === 'flagged'
                                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                          : 'bg-white border border-pink-200 text-[#E02B91]'
                                      }`}>
                                        #{t.order || tIdx + 1}
                                      </div>

                                      <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-xs font-black text-slate-900 truncate max-w-md">
                                            {t.title}
                                          </span>
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 capitalize">
                                            {t.taskType || 'coding'}
                                          </span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ t.difficulty === 'Easy' ? 'bg-white text-emerald-700 border-emerald-200' : t.difficulty === 'Medium' ? 'bg-white text-amber-700 border-amber-200' : 'bg-white text-red-700 border-red-200' }`}>
                                            {t.difficulty || 'Easy'}
                                          </span>
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-800">
                                            +{t.points || 10} pts
                                          </span>

                                          {/* Verification Status Badge */}
                                          {t.verificationStatus === 'flagged' ? (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3 text-rose-600" />
                                              <span>Flagged Review</span>
                                            </span>
                                          ) : (t.isTested || t.verificationStatus === 'tested') ? (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                                              <span>Tested & Verified</span>
                                            </span>
                                          ) : t.verificationStatus === 'verified' ? (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                              <Check className="w-3 h-3 text-emerald-600" />
                                              <span>Verified</span>
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 flex items-center gap-1">
                                              <Clock className="w-3 h-3 text-slate-400" />
                                              <span>Pending</span>
                                            </span>
                                          )}
                                        </div>

                                        {t.description && t.description !== t.title && (
                                          <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">
                                            {t.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons: Edit, Delete, Revalidate, Recover */}
                                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditQuestion(t, 'task')}
                                        className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                        title="Edit Question & Revalidate"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Edit</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenDeleteQuestion(t, 'task')}
                                        className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                        title="Delete Question"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                      </button>

                                      {t.verificationStatus === 'flagged' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenRecoverQuestion(t, 'task')}
                                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                            title="Rerun compiler & Recover"
                                          >
                                            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                                            <span>Recover</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleOpenOverrideQuestion(t, 'task')}
                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                            title="Admin Manual Override"
                                          >
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            <span>Override</span>
                                          </button>
                                        </>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleRevalidateQuestion(t, 'task')}
                                        className="p-1 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
                                        title="Rerun Compiler Validation"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Prominent Exact Flag Reason Indicator */}
                                  {t.verificationStatus === 'flagged' && (
                                    <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-black text-rose-800 flex items-center gap-1.5">
                                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                          <span>Exact Flag Reason: {t.flagReason || 'Compiler validation or test cases failed.'}</span>
                                        </span>
                                        {t.flaggedAt && (
                                          <span className="text-[10px] text-rose-600/70 font-mono">
                                            Flagged: {new Date(t.flaggedAt).toLocaleString()}
                                          </span>
                                        )}
                                      </div>

                                      {t.compilerError && (
                                        <div className="p-2.5 bg-slate-900 text-rose-300 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                                          {t.compilerError}
                                        </div>
                                      )}

                                      {t.failedTestCases && t.failedTestCases.length > 0 && (
                                        <div className="p-2 bg-white rounded-lg border border-rose-200 text-[11px] text-rose-900 space-y-1 font-mono">
                                          <div className="font-bold text-rose-800">Failed Test Case Details:</div>
                                          <div>Input: <span className="bg-slate-100 px-1 py-0.5 rounded">{t.failedTestCases[0].input || 'None'}</span></div>
                                          <div>Expected: <span className="bg-slate-100 px-1 py-0.5 rounded">{t.failedTestCases[0].expectedOutput}</span></div>
                                          <div>Actual: <span className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded">{t.failedTestCases[0].actualOutput || 'No output'}</span></div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* TAB 2: INTERVIEW ARENA QUESTIONS */}
          {activeQuestionsTab === 'arena' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Module 1: Interview Arena Questions ({courseQuestionsData?.interviewArena?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Technical, Conceptual, Coding, Scenario, and Output-prediction questions mapped to syllabus topics.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={questionFilterStatus}
                    onChange={(e) => setQuestionFilterStatus(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="all">All Verification Statuses</option>
                    <option value="verified">Verified Only</option>
                    <option value="tested">Tested Only</option>
                    <option value="flagged">Flagged for Review</option>
                  </select>
                </div>
              </div>

              {loadingQuestions ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase">Loading Interview Arena questions...</p>
                </div>
              ) : courseQuestionsData?.interviewArena?.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                  <Code2 className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-700">No Interview Arena Questions Generated Yet</h4>
                  <button
                    onClick={() => handleTriggerGenerateQuestions(selectedItem._id)}
                    className="bg-white px-5 py-2.5 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
                  >
                    Generate Interview Arena Questions
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseQuestionsData.interviewArena
                    .filter(q => questionFilterStatus === 'all' || q.verificationStatus === questionFilterStatus)
                    .map((q) => (
                      <div key={q._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:border-slate-200 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-purple-700 font-mono">#{q.questionNumber}</span>
                            <h4 className="text-sm font-black text-slate-900">{q.title}</h4>
                            {q.technology && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white text-purple-800 border border-purple-200">
                                {q.technology}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600">
                              Topic: {q.topic || q.category}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${ q.difficulty === 'Easy' ? 'bg-white text-emerald-700' : q.difficulty === 'Medium' ? 'bg-white text-amber-700' : 'bg-white text-rose-700' }`}>
                              {q.difficulty}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${ q.verificationStatus === 'tested' ? 'bg-white text-blue-700 border border-blue-200' : q.verificationStatus === 'flagged' ? 'bg-white text-rose-700 border border-rose-200' : 'bg-white text-emerald-700 border border-emerald-200' }`}>
                              {q.verificationStatus?.toUpperCase() || 'VERIFIED'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(q, 'interview')}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-purple-600" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteQuestion(q, 'interview')}
                              className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>

                            {q.verificationStatus === 'flagged' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRecoverQuestion(q, 'interview')}
                                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Rerun Compiler & Recover"
                                >
                                  <RotateCcw className="w-3 h-3 text-teal-600" />
                                  <span>Recover</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenOverrideQuestion(q, 'interview')}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Admin Manual Override"
                                >
                                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                                  <span>Override</span>
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRevalidateQuestion(q, 'interview')}
                              className="p-1 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
                              title="Rerun Compiler Validation"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium whitespace-pre-line line-clamp-2">
                          {q.problemStatement}
                        </p>

                        {/* Prominent Exact Flag Reason Indicator */}
                        {q.verificationStatus === 'flagged' && (
                          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-rose-800 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Exact Flag Reason: {q.flagReason || 'Compilation or test cases failed.'}</span>
                              </span>
                              {q.flaggedAt && (
                                <span className="text-[10px] text-rose-600/70 font-mono">
                                  Flagged: {new Date(q.flaggedAt).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {q.compilerError && (
                              <div className="p-2.5 bg-slate-900 text-rose-300 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                                {q.compilerError}
                              </div>
                            )}

                            {q.failedTestCases && q.failedTestCases.length > 0 && (
                              <div className="p-2 bg-white rounded-lg border border-rose-200 text-[11px] text-rose-900 space-y-1 font-mono">
                                <div className="font-bold text-rose-800">Failed Test Case Details:</div>
                                <div>Input: <span className="bg-slate-100 px-1 py-0.5 rounded">{q.failedTestCases[0].input || 'None'}</span></div>
                                <div>Expected: <span className="bg-slate-100 px-1 py-0.5 rounded">{q.failedTestCases[0].expectedOutput}</span></div>
                                <div>Actual: <span className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded">{q.failedTestCases[0].actualOutput || 'No output'}</span></div>
                              </div>
                            )}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="p-3 bg-white rounded-xl text-[11px] text-purple-900 border border-purple-100/60 font-medium whitespace-pre-line">
                            <span className="font-bold">Explanation & Reference Rationale:</span> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MOCK INTERVIEW QUESTIONS */}
          {activeQuestionsTab === 'mock' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Module 2: Mock Interview Questions ({courseQuestionsData?.mockInterview?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Strict domain-isolated questions with key concept rubrics for open-ended and coding evaluation.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={questionFilterStatus}
                    onChange={(e) => setQuestionFilterStatus(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="all">All Verification Statuses</option>
                    <option value="verified">Verified Only</option>
                    <option value="tested">Tested Only</option>
                    <option value="flagged">Flagged for Review</option>
                  </select>
                </div>
              </div>

              {loadingQuestions ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase">Loading Mock Interview questions...</p>
                </div>
              ) : courseQuestionsData?.mockInterview?.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-black text-slate-700">No Mock Interview Questions Generated Yet</h4>
                  <button
                    onClick={() => handleTriggerGenerateQuestions(selectedItem._id)}
                    className="bg-white px-5 py-2.5 text-blue-700 font-black text-xs rounded-xl shadow-md transition border border-blue-600"
                  >
                    Generate Mock Interview Questions
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseQuestionsData.mockInterview
                    .filter(m => questionFilterStatus === 'all' || m.verificationStatus === questionFilterStatus)
                    .map((m) => (
                      <div key={m._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:border-cyan-300 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-cyan-700 font-mono">#{m.questionNumber}</span>
                            <h4 className="text-sm font-black text-slate-900">{m.title}</h4>
                            {m.technology && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white text-cyan-800 border border-cyan-200">
                                {m.technology}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600">
                              Topic: {m.topic || m.category}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white text-amber-700">
                              {m.difficulty}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${ m.verificationStatus === 'flagged' ? 'bg-white text-rose-700 border border-rose-200' : 'bg-white text-emerald-700 border border-emerald-200' }`}>
                              {m.verificationStatus?.toUpperCase() || 'VERIFIED'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(m, 'mock')}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-purple-600" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteQuestion(m, 'mock')}
                              className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>

                            {m.verificationStatus === 'flagged' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRecoverQuestion(m, 'mock')}
                                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Rerun Compiler & Recover"
                                >
                                  <RotateCcw className="w-3 h-3 text-teal-600" />
                                  <span>Recover</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenOverrideQuestion(m, 'mock')}
                                  className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Admin Manual Override"
                                >
                                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                                  <span>Override</span>
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRevalidateQuestion(m, 'mock')}
                              className="p-1 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
                              title="Rerun Compiler Validation"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium whitespace-pre-line line-clamp-3">
                          {m.problemStatement}
                        </p>

                        {/* Prominent Exact Flag Reason Indicator */}
                        {m.verificationStatus === 'flagged' && (
                          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-rose-800 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>Exact Flag Reason: {m.flagReason || 'Compilation or test cases failed.'}</span>
                              </span>
                              {m.flaggedAt && (
                                <span className="text-[10px] text-rose-600/70 font-mono">
                                  Flagged: {new Date(m.flaggedAt).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {m.compilerError && (
                              <div className="p-2.5 bg-slate-900 text-rose-300 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                                {m.compilerError}
                              </div>
                            )}

                            {m.failedTestCases && m.failedTestCases.length > 0 && (
                              <div className="p-2 bg-white rounded-lg border border-rose-200 text-[11px] text-rose-900 space-y-1 font-mono">
                                <div className="font-bold text-rose-800">Failed Test Case Details:</div>
                                <div>Input: <span className="bg-slate-100 px-1 py-0.5 rounded">{m.failedTestCases[0].input || 'None'}</span></div>
                                <div>Expected: <span className="bg-slate-100 px-1 py-0.5 rounded">{m.failedTestCases[0].expectedOutput}</span></div>
                                <div>Actual: <span className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded">{m.failedTestCases[0].actualOutput || 'No output'}</span></div>
                              </div>
                            )}
                          </div>
                        )}

                        {m.keyConcepts && m.keyConcepts.length > 0 && (
                          <div className="p-3 bg-white rounded-xl text-[11px] text-cyan-900 border border-cyan-100/60 font-medium">
                            <span className="font-bold">Evaluation Criteria Key Concepts:</span>{' '}
                            {m.keyConcepts.map(k => (
                              <span key={k} className="inline-block bg-white text-cyan-800 px-2 py-0.5 rounded-md font-mono text-[10px] mr-1.5 border border-cyan-200/60">
                                {k}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: DEDICATED FLAGGED REVIEW & RECOVERY VIEW
             ══════════════════════════════════════════════════════ */}
          {activeQuestionsTab === 'flagged' && (
            <div className="space-y-4">
              {/* Toolbar & Filter Header */}
              <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-200">
                        <AlertCircle className="w-4 h-4" />
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Flagged Review & Compiler Diagnostic Hub
                      </h3>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 font-mono">
                        {flaggedQuestionsList.length} Flagged
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Strict compiler-isolated questions flagged during automatic validation. Recover by fixing solution and rerunning compiler.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(flaggedFilterModule !== 'all' || flaggedFilterDifficulty !== 'all' || flaggedFilterType !== 'all' || flaggedFilterReason !== 'all' || flaggedSearch.trim()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setFlaggedFilterModule('all');
                          setFlaggedFilterDifficulty('all');
                          setFlaggedFilterType('all');
                          setFlaggedFilterReason('all');
                          setFlaggedSearch('');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear Filters</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const cId = selectedDomainItem?.item?._id;
                        if (cId) fetchFlaggedQuestions(cId);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      title="Refresh flagged questions"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingFlagged ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
                  {/* Search */}
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Search title, prompt, compiler errors..."
                      value={flaggedSearch}
                      onChange={(e) => setFlaggedSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>

                  {/* Module Filter */}
                  <div>
                    <select
                      value={flaggedFilterModule}
                      onChange={(e) => setFlaggedFilterModule(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="all">All Modules</option>
                      {Array.from(new Set(flaggedQuestionsList.map(q => q.moduleTitle).filter(Boolean))).map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <select
                      value={flaggedFilterDifficulty}
                      onChange={(e) => setFlaggedFilterDifficulty(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  {/* Question Type Filter */}
                  <div>
                    <select
                      value={flaggedFilterType}
                      onChange={(e) => setFlaggedFilterType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value="all">All Types</option>
                      <option value="coding">Coding Questions</option>
                      <option value="mcq">MCQ Questions</option>
                      <option value="arena">Arena</option>
                      <option value="mock">Mock</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Flagged Questions List Content */}
              {loadingFlagged ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                  <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase">Loading Flagged Questions...</p>
                </div>
              ) : (() => {
                const filtered = flaggedQuestionsList.filter(q => {
                  if (flaggedFilterModule !== 'all' && q.moduleTitle !== flaggedFilterModule) return false;
                  if (flaggedFilterDifficulty !== 'all' && (q.difficulty || '').toLowerCase() !== flaggedFilterDifficulty.toLowerCase()) return false;
                  if (flaggedFilterType !== 'all') {
                    const isMcq = q.questionType === 'mcq' || (Array.isArray(q.options) && q.options.length > 0);
                    if (flaggedFilterType === 'coding' && isMcq) return false;
                    if (flaggedFilterType === 'mcq' && !isMcq) return false;
                    if (flaggedFilterType === 'arena' && q.sourceType !== 'arena') return false;
                    if (flaggedFilterType === 'mock' && q.sourceType !== 'mock') return false;
                  }
                  if (flaggedSearch.trim()) {
                    const s = flaggedSearch.toLowerCase();
                    const text = `${q.title || ''} ${q.problemStatement || ''} ${q.flagReason || ''} ${q.compilerError || ''}`.toLowerCase();
                    if (!text.includes(s)) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-black text-slate-800">
                        {flaggedQuestionsList.length === 0 ? 'Zero Flagged Questions! All Tested Solutions Verified.' : 'No Flagged Questions Matched Your Filter.'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        {flaggedQuestionsList.length === 0
                          ? 'Every generated task and question has passed compiler test cases or options validation.'
                          : 'Try clearing the search or resetting module and difficulty dropdowns.'}
                      </p>
                      {flaggedQuestionsList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFlaggedFilterModule('all');
                            setFlaggedFilterDifficulty('all');
                            setFlaggedFilterType('all');
                            setFlaggedFilterReason('all');
                            setFlaggedSearch('');
                          }}
                          className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition border border-rose-200"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((q) => {
                      const isMcq = q.questionType === 'mcq' || (Array.isArray(q.options) && q.options.length > 0);
                      const sType = q.sourceType || 'task';

                      return (
                        <div
                          key={q._id}
                          className="bg-white rounded-2xl border-2 border-rose-200/90 p-5 shadow-2xs space-y-3.5 hover:border-rose-300 transition"
                        >
                          {/* Card Header & Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                                {sType.toUpperCase()} #{q.taskNumber || q.questionNumber || 'Q'}
                              </span>
                              <h4 className="text-sm font-black text-slate-900">{q.title}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                isMcq ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                {isMcq ? 'MCQ Question' : 'Coding Problem'}
                              </span>
                              {q.moduleTitle && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {q.moduleTitle}
                                </span>
                              )}
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                {q.difficulty || 'Easy'}
                              </span>
                              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">
                                FLAGGED
                              </span>
                              {q.manualReviewStatus === 'OVERRIDDEN' && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  MANUAL OVERRIDE
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                              {/* Recover Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenRecoverQuestion(q, sType)}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                title="Rerun Compiler & Recover Question"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Recover Question</span>
                              </button>

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditQuestion(q, sType)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-purple-700 border border-purple-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Edit Question Details & Solution"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Revalidate Button */}
                              <button
                                type="button"
                                onClick={() => handleRevalidateQuestion(q, sType)}
                                className="p-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition cursor-pointer"
                                title="Rerun Compiler Validation"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {/* Override Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenOverrideQuestion(q, sType)}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Administrative Manual Override"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Override</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteQuestion(q, sType)}
                                className="px-2 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Delete Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Problem Statement Preview */}
                          <p className="text-xs text-slate-700 font-medium whitespace-pre-line line-clamp-2">
                            {q.problemStatement || q.description}
                          </p>

                          {/* EXACT FLAG REASON DIAGNOSTIC BOX */}
                          <div className="p-4 bg-rose-50/90 border border-rose-300 rounded-2xl space-y-2.5 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <span className="text-xs font-black text-rose-900 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Exact Reason: {q.flagReason || 'Compilation or test cases execution failed.'}</span>
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-rose-700/80 font-mono">
                                {q.flaggedAt && <span>Flagged: {new Date(q.flaggedAt).toLocaleString()}</span>}
                                {q.lastValidatedAt && <span>• Checked: {new Date(q.lastValidatedAt).toLocaleTimeString()}</span>}
                              </div>
                            </div>

                            {/* Compiler Error / Console Trace */}
                            {q.compilerError && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-rose-700" />
                                  <span>Compiler Output / Diagnostic Trace:</span>
                                </div>
                                <div className="p-3 bg-slate-950 text-rose-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                                  {q.compilerError}
                                </div>
                              </div>
                            )}

                            {/* Failed Test Cases Breakdown */}
                            {q.failedTestCases && q.failedTestCases.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <div className="text-[11px] font-bold text-rose-900">
                                  Failed Test Case Diagnostics ({q.failedTestCases.length}):
                                </div>
                                <div className="space-y-2">
                                  {q.failedTestCases.map((tc, idx) => (
                                    <div key={idx} className="p-3 bg-white rounded-xl border border-rose-200 text-[11px] text-rose-950 font-mono space-y-1">
                                      <div className="font-bold text-rose-800">Test Case #{idx + 1} {tc.isHidden ? '(Hidden Test Case)' : '(Sample Test Case)'}:</div>
                                      <div><span className="text-slate-500">Input:</span> <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">{tc.input || '(Empty Input)'}</span></div>
                                      <div><span className="text-slate-500">Expected:</span> <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">{tc.expectedOutput}</span></div>
                                      <div><span className="text-slate-500">Actual:</span> <span className="bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded font-bold">{tc.actualOutput || '(No output produced)'}</span></div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Reference Solution / Answer Preview */}
                            {(q.referenceSolution || q.solutionCode) && (
                              <details className="text-[11px] text-slate-700 font-medium">
                                <summary className="cursor-pointer text-purple-700 font-bold hover:underline py-1">
                                  View Reference Solution Code
                                </summary>
                                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto mt-1 whitespace-pre-wrap">
                                  {q.referenceSolution || q.solutionCode}
                                </pre>
                              </details>
                            )}

                            {/* MCQ Options Display */}
                            {isMcq && Array.isArray(q.options) && q.options.length > 0 && (
                              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-1.5">
                                <div className="text-[11px] font-bold text-purple-900">MCQ Options Configuration:</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                                  {q.options.map(opt => (
                                    <div
                                      key={opt.optionId}
                                      className={`p-2 rounded-lg border text-[11px] font-medium ${
                                        opt.optionId === q.correctAnswer
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                          : 'bg-slate-50 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      <span className="font-mono font-bold mr-1.5">({opt.optionId})</span>
                                      {opt.text}
                                      {opt.optionId === q.correctAnswer && <span className="ml-2 text-[10px] text-emerald-700 uppercase font-black">✓ Correct</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Audit History Log */}
                          {q.auditHistory && q.auditHistory.length > 0 && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[10px] text-slate-600 space-y-1">
                              <span className="font-bold text-slate-700 uppercase tracking-wider">Audit Log:</span>
                              <div className="space-y-0.5">
                                {q.auditHistory.slice(-2).map((a, i) => (
                                  <div key={i} className="font-mono text-slate-500">
                                    • {new Date(a.timestamp).toLocaleString()} — <span className="font-bold text-slate-700">{a.action}</span>: {a.reason || 'Status updated'} {a.performedBy ? `by ${a.performedBy}` : ''}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  ) : (

        /* ════════════════════════════════════════════════════════════════
            VIEW 2: DOMAIN MANAGEMENT MAIN CATALOG LIST
           ════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">

              {/* Header */}
              <div className="bg-white relative overflow-hidden rounded-3xl border border-purple-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="bg-white absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Link
                      to="/admin/command-center"
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-700 bg-white/90 hover:bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Dashboard</span>
                    </Link>
                    <div className="bg-white inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
                      {effectiveFixedType === 'course' ? <BookOpen className="w-3.5 h-3.5 text-purple-600" /> :
                       effectiveFixedType === 'internship' ? <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> :
                       effectiveFixedType === 'project' ? <FolderGit2 className="w-3.5 h-3.5 text-amber-600" /> :
                       <Layers className="w-3.5 h-3.5 text-purple-600" />}
                      <span>{effectiveFixedType === 'course' ? 'Course Management' :
                             effectiveFixedType === 'internship' ? 'Internship Management' :
                             effectiveFixedType === 'project' ? 'Project Management' : 'Institute Core Catalog'}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {effectiveFixedType === 'course' ? 'Course Management' :
                     effectiveFixedType === 'internship' ? 'Internship Management' :
                     effectiveFixedType === 'project' ? 'Project Management' : 'Domain Management'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium">
                    {effectiveFixedType === 'course' ? 'Manage official institute courses, syllabus modules, topics, and automated AI question generation.' :
                     effectiveFixedType === 'internship' ? 'Manage live industry internships, stipends, partner companies, open positions, and placement tracks.' :
                     effectiveFixedType === 'project' ? 'Manage capstone projects, deliverables, tech stacks, repository milestones, and XP rewards.' :
                     "Manage your company's official training courses, live industry internships, and practical capstone projects."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => setInternshipStudentModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-xl transition flex items-center gap-2 cursor-pointer border border-emerald-500"
                  >
                    <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
                    <span>Internship Students Add</span>
                  </button>

                  <button
                    onClick={() => handleOpenAddModal(effectiveFixedType === 'course' ? 'Course' : effectiveFixedType === 'internship' ? 'Internship' : effectiveFixedType === 'project' ? 'Project' : undefined)}
                    className="bg-white relative z-10 px-6 py-3 text-sq-gradient font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl transition flex items-center gap-2 cursor-pointer border border-[#9333EA]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add {effectiveFixedType === 'course' ? 'Course' : effectiveFixedType === 'internship' ? 'Internship' : effectiveFixedType === 'project' ? 'Project' : 'Record'}</span>
                  </button>
                </div>
              </div>

          {/* Category Cards (Full 3-card switcher for all domains OR focused summary metrics for single-page mode) */}
          {!effectiveFixedType ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. COURSE CARD */}
              <div
                onClick={() => setActiveTab('course')}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all duration-200 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden ${ activeTab === 'course' ? 'bg-white border-purple-400 shadow-md ring-2 ring-purple-400/20' : 'bg-white border-slate-200 hover:border-purple-200 hover:shadow-sm' }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${ activeTab === 'course' ? 'bg-white text-sq-gradient border border-[#9333EA]' : 'bg-white text-purple-700' }`}>
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${ activeTab === 'course' ? 'bg-white text-sq-gradient border border-[#9333EA]' : 'bg-white text-purple-700 border border-purple-200' }`}>
                    {data.courses.length} Records
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Course</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Manage all Course-related data, modules, durations, and syllabi.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-purple-700">
                  <span>{activeTab === 'course' ? 'Currently Viewing' : 'View Courses'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'course' ? 'rotate-90 text-purple-600' : ''}`} />
                </div>
              </div>

              {/* 2. INTERNSHIP CARD */}
              <div
                onClick={() => setActiveTab('internship')}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all duration-200 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden ${ activeTab === 'internship' ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm' }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${ activeTab === 'internship' ? 'bg-white text-emerald-700 border border-emerald-600' : 'bg-white text-emerald-700' }`}>
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${ activeTab === 'internship' ? 'bg-white text-emerald-700 border border-emerald-600' : 'bg-white text-slate-700' }`}>
                    {data.internships.length} Records
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Internship</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Manage all Internship-related data, stipends, tech stacks, and domain tracks.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>{activeTab === 'internship' ? 'Currently Viewing' : 'View Internships'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'internship' ? 'rotate-90 text-emerald-600' : ''}`} />
                </div>
              </div>

              {/* 3. PROJECT CARD */}
              <div
                onClick={() => setActiveTab('project')}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border-2 transition-all duration-200 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden ${ activeTab === 'project' ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm' }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${ activeTab === 'project' ? 'bg-white text-amber-700 border border-amber-600' : 'bg-white text-amber-800' }`}>
                    <FolderGit2 className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-black px-3 py-1 rounded-full ${ activeTab === 'project' ? 'bg-white text-amber-700 border border-amber-600' : 'bg-white text-slate-700' }`}>
                    {data.projects.length} Records
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Project</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Manage all Project-related data, capstone deliverables, and XP milestones.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>{activeTab === 'project' ? 'Currently Viewing' : 'View Projects'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'project' ? 'rotate-90 text-amber-700' : ''}`} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Total {effectiveFixedType === 'course' ? 'Courses' : effectiveFixedType === 'internship' ? 'Internships' : 'Projects'}
                </span>
                <div className="text-2xl font-black font-mono text-purple-700">
                  {effectiveFixedType === 'course' ? data.courses.length : effectiveFixedType === 'internship' ? data.internships.length : data.projects.length}
                </div>
                <p className="text-[11px] text-slate-500">Active records in database catalog</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Status & Availability</span>
                <div className="text-2xl font-black font-mono text-emerald-600">
                  {effectiveFixedType === 'course'
                    ? `${data.courses.filter(c => c.isActive).length} Published`
                    : effectiveFixedType === 'internship'
                    ? `${data.internships.filter(i => i.isActive).length} Open Tracks`
                    : `${data.projects.filter(p => p.isActive).length} Active Projects`}
                </div>
                <p className="text-[11px] text-slate-500">Live and accessible to students</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Specialized Feature</span>
                <div className="text-sm font-bold text-purple-900 mt-1">
                  {effectiveFixedType === 'course' ? 'AI Question Generator (4 Modules)' : effectiveFixedType === 'internship' ? 'Stipend & Partner Matching' : 'GitHub Sync & XP Milestones'}
                </div>
                <p className="text-[11px] text-slate-500">Integrated domain automation</p>
              </div>
            </div>
          )}

          {/* AI 4-Module Question Bank Summary & Overview Toolbar (Course Only) */}
          {(effectiveFixedType === 'course' || activeTab === 'course') && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-purple-100/90 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                      Automatic AI Question Bank (4 Modules)
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${ (overallQuestionStats?.counts?.total ?? 0) > 0 ? 'bg-white text-emerald-800 border border-emerald-200' : 'bg-white text-purple-800 border border-purple-200' }`}>
                      {(overallQuestionStats?.counts?.total ?? 0) > 0 ? 'ACTIVE' : 'READY'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {overallQuestionStats?.job?.currentStep || 'Complete questions generated across Interview Arena, Game Hub, Mock Interview, and Practice (Courses Catalog Overview).'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span>Courses:</span>
                    <strong className="text-purple-700 font-mono font-black">{overallQuestionStats?.counts?.totalCourses ?? data.courses?.length ?? 0}</strong>
                  </div>
                  <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span>Modules:</span>
                    <strong className="text-purple-700 font-mono font-black">{overallQuestionStats?.counts?.totalModules ?? 0}</strong>
                  </div>
                  <div className="text-xs font-bold text-purple-900 bg-white border border-purple-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Overall Questions:</span>
                    <strong className="text-purple-700 font-mono font-black">{overallQuestionStats?.counts?.total ?? 0}</strong>
                  </div>
                </div>
              </div>

              {/* Module Metrics - Catalog Overall */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    1. Interview Arena
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900 mt-1">
                    {overallQuestionStats?.counts?.interviewArena ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    2. Mock Interview
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-slate-900 mt-1">
                    {overallQuestionStats?.counts?.mockInterview ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-purple-200/80 text-center shadow-2xs">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-purple-900 font-black">
                    3. Testing & Practice
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-purple-700 mt-1">
                    {overallQuestionStats?.counts?.testingPractice ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Tested Solutions
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-emerald-600 mt-1">
                    {overallQuestionStats?.counts?.testedSolutions ?? 0}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 text-center shadow-2xs">
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Flagged Review
                  </div>
                  <div className={`text-2xl font-black font-mono tracking-tight mt-1 ${ (overallQuestionStats?.counts?.flagged ?? 0) > 0 ? 'text-rose-600' : 'text-slate-900' }`}>
                    {overallQuestionStats?.counts?.flagged ?? 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Active Catalog:
              </span>
              <span className="text-sm font-black text-slate-900 capitalize">
                {activeTab === 'course' ? 'Courses Catalog' : activeTab === 'internship' ? 'Internship Catalog' : 'Projects Catalog'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search in ${activeTab}s...`}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:inline">Domain:</span>
                <select
                  value={selectedDomainFilter}
                  onChange={(e) => setSelectedDomainFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 shrink-0"
                >
                  {availableDomainOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Domains' : cat}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleOpenAddModal(activeTab === 'course' ? 'Course' : activeTab === 'internship' ? 'Internship' : 'Project')}
                className="px-4 py-2 bg-white hover:bg-white text-purple-900 border border-purple-200/80 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-purple-600" />
                <span>Add {activeTab === 'course' ? 'Course' : activeTab === 'internship' ? 'Internship' : 'Project'}</span>
              </button>
            </div>
          </div>

          {/* DATA SECTION */}
          {loading && !((data?.courses?.length || 0) + (data?.internships?.length || 0) + (data?.projects?.length || 0) + (categories?.length || 0)) ? (
            <div className="flex items-center justify-center min-h-[300px] bg-white rounded-3xl border border-slate-200">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading database records...</p>
                <button
                  type="button"
                  onClick={() => fetchDomainData(false)}
                  className="inline-block text-xs font-bold text-purple-600 hover:text-purple-700 underline pt-2 cursor-pointer"
                >
                  Click to Retry
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* 1. COURSES TAB CONTENT */}
              {activeTab === 'course' && (
                <div className="space-y-4">
                  {filteredCourses.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-black text-slate-700">No Course records found in database</p>
                      <button
                        onClick={() => handleOpenAddModal('Course')}
                        className="bg-white px-5 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition border border-[#9333EA]"
                      >
                        + Add First Course
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCourses.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => handleOpenDetail(c, 'course')}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-purple-700 border border-purple-200">
                                {c.domain || 'Course'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ c.isActive ? 'bg-white text-emerald-700 border border-emerald-200' : 'bg-white text-slate-500' }`}>
                                {c.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                              {c.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                              {c.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span className="flex items-center gap-1 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {c.durationText || `${c.durationWeeks} Weeks`} ({c.totalHours || (c.durationWeeks || 12) * 10} Hours)
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                {c.level || 'All Levels'}
                              </span>
                            </div>

                            <div className="flex items-center justify-end pt-1">
                              <span className="text-xs font-bold text-purple-700 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                                Manage Course <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. INTERNSHIPS TAB CONTENT */}
              {activeTab === 'internship' && (
                <div className="space-y-4">
                  {filteredInternships.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                      <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-black text-slate-700">No Internship records found in database</p>
                      <button
                        onClick={() => handleOpenAddModal('Internship')}
                        className="bg-white px-4 py-2 text-emerald-700 font-bold text-xs rounded-xl shadow-xs border border-emerald-600"
                      >
                        + Add First Internship
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredInternships.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleOpenDetail(item, 'internship')}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-md hover:border-emerald-500 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200/80">
                                {item.domain || 'Internship'}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200/80">
                                {item.stipend > 0 ? `₹${item.stipend.toLocaleString()}` : 'Stipend Pending'}
                              </span>
                            </div>

                            <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
                              {item.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>

                            {item.techStack && item.techStack.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.techStack.slice(0, 4).map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded-md"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {item.techStack.length > 4 && (
                                  <span className="text-[10px] text-slate-400 font-bold px-1 self-center">
                                    +{item.techStack.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {item.durationText || (item.durationWeeks === 2 ? '15 Days' : `${item.durationWeeks || 4} Weeks`)}
                              </span>
                              <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-xl">
                                {item.level || 'Intermediate'}
                              </span>
                            </div>

                            <div className="flex items-center justify-end pt-1">
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                                Manage Internship <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. PROJECTS TAB CONTENT */}
              {activeTab === 'project' && (
                <div className="space-y-4">
                  {filteredProjects.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                      <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-black text-slate-700">No Project records found in database</p>
                      <button
                        onClick={() => handleOpenAddModal('Project')}
                        className="bg-white px-4 py-2 text-amber-700 font-bold text-xs rounded-xl shadow-xs border border-amber-600"
                      >
                        + Add First Project
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProjects.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleOpenDetail(p, 'project')}
                          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-md hover:border-amber-500 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white text-amber-800 border border-amber-200/80">
                                {p.domain || p.category || 'Project'}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-purple-700 border border-purple-200/80">
                                +{p.xpReward || 250} XP
                              </span>
                            </div>

                            <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                              {p.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {p.description}
                            </p>

                            {p.technologies && p.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {p.technologies.slice(0, 4).map((tech, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded-md"
                                  >
                                    {tech}
                                  </span>
                                ))}
                                {p.technologies.length > 4 && (
                                  <span className="text-[10px] text-slate-400 font-bold px-1 self-center">
                                    +{p.technologies.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                                {p.courseId?.title ? `Course: ${p.courseId.title}` : 'Universal Capstone'}
                              </span>
                              <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-xl">
                                {p.difficulty || 'Intermediate'}
                              </span>
                            </div>

                            <div className="flex items-center justify-end pt-1">
                              <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                                Manage Project <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 1: UPDATE & EDIT MODAL (FOR COURSE / INTERNSHIP / PROJECT)
         ══════════════════════════════════════════════════════ */}
      {updateSyllabusOpen && selectedDomainItem && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col my-auto animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xs shrink-0 ${ itemType === 'project' ? 'bg-white text-amber-700' : 'bg-white text-sq-gradient border border-[#9333EA]' }`}>
                  {itemType === 'project' ? <FolderGit2 className="w-5 h-5 text-amber-700" /> : <Upload className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {itemType === 'project' ? `Edit Project Specs — ${selectedItem.title}` : `Update ${itemType.toUpperCase()} — ${selectedItem.title}`}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {itemType === 'project'
                      ? 'Edit project title, technologies, specifications, and details'
                      : 'Upload PDF / text syllabus or edit domain settings & information'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUpdateSyllabusOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Modal Sub-Tabs: Shown for courses/internships, hidden for projects */}
              {itemType !== 'project' && (
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setUpdateModalTab('syllabus')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${ updateModalTab === 'syllabus' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900' }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#E02B91]" />
                    <span>Update Syllabus & Modules</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpdateModalTab('info')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${ updateModalTab === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900' }`}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Edit Details</span>
                  </button>
                </div>
              )}

            {/* TAB 1: SYLLABUS UPLOAD / TEXT PASTE / LIVE REAL-TIME PROGRESS */}
            {updateModalTab === 'syllabus' && (() => {
              const activeJob = (generationStatus?.courseId === selectedItem?._id || generationStatus?.job?.courseId === selectedItem?._id) ? generationStatus?.job : null;
              const isJobGenerating = activeJob?.status === 'generating' || updatingSyllabus || (generatingQuestions && generationStatus?.courseId === selectedItem?._id);
              const isJobCompleted = activeJob?.status === 'completed';
              const isJobPartial = activeJob?.status === 'partial';
              const isJobFailed = activeJob?.status === 'failed';
              const isJobCancelled = activeJob?.status === 'cancelled';
              const hasTrackableJob = Boolean(activeJob && (isJobGenerating || isJobCompleted || isJobPartial || isJobFailed || isJobCancelled));

              const SYLLABUS_STAGES = [
                { id: 1, label: 'PDF Uploaded' },
                { id: 2, label: 'PDF Parsing' },
                { id: 3, label: 'Syllabus Extraction' },
                { id: 4, label: 'Module Identification' },
                { id: 5, label: 'Topic Identification' },
                { id: 6, label: 'Task Generation' },
                { id: 7, label: 'Solution Preparation' },
                { id: 8, label: 'Test-Case Validation' },
                { id: 9, label: 'Database Saving' },
                { id: 10, label: 'Completed' },
              ];

              const getStageState = (stageId) => {
                if (!activeJob) return 'pending';
                const status = activeJob.status;
                const progress = activeJob.progress || 0;
                const totalMods = activeJob.stats?.totalModules || activeJob.parsedModules?.length || 0;
                const completedMods = activeJob.stats?.completedModules || 0;
                const isDone = status === 'completed';
                const isErr = status === 'failed';

                if (stageId === 1) return 'completed';
                if (stageId === 2) return 'completed';
                if (stageId === 3) return (totalMods > 0 || progress >= 5 || isDone) ? 'completed' : 'active';
                if (stageId === 4) return totalMods > 0 ? 'completed' : (progress >= 5 ? 'active' : 'pending');
                if (stageId === 5) {
                  if (completedMods > 0 || progress >= 20 || isDone) return 'completed';
                  if (progress >= 5) return 'active';
                  return 'pending';
                }
                if (stageId === 6) {
                  if (isDone || (completedMods >= totalMods && totalMods > 0) || progress >= 85) return 'completed';
                  if (status === 'generating') return 'active';
                  if (isErr && completedMods === 0) return 'failed';
                  return 'pending';
                }
                if (stageId === 7) {
                  if (isDone || progress >= 88) return 'completed';
                  if (status === 'generating' && progress >= 30) return 'active';
                  return 'pending';
                }
                if (stageId === 8) {
                  if (isDone || progress >= 95) return 'completed';
                  if (status === 'generating' && progress >= 85) return 'active';
                  return 'pending';
                }
                if (stageId === 9) {
                  if (isDone) return 'completed';
                  if (completedMods > 0 || status === 'generating') return 'active';
                  return 'pending';
                }
                if (stageId === 10) {
                  if (isDone) return 'completed';
                  if (status === 'partial') return 'partial';
                  if (status === 'failed') return 'failed';
                  if (status === 'cancelled') return 'cancelled';
                  return 'pending';
                }
                return 'pending';
              };

              const totalModulesCount = activeJob?.stats?.totalModules || activeJob?.parsedModules?.length || 0;
              const completedModulesCount = activeJob?.stats?.completedModules || 0;
              const tasksPerMod = activeJob?.tasksPerModule || tasksPerModule || 12;
              const tasksRemainingCount = Math.max(0, (totalModulesCount - completedModulesCount) * tasksPerMod);
              const tasksGeneratedCount = generationStatus?.counts?.testingPractice || activeJob?.stats?.testingPracticeCount || (activeJob?.moduleProgress ? activeJob.moduleProgress.reduce((sum, m) => sum + (m.questionsCount || 0), 0) : 0);
              const currentModuleName = activeJob?.currentModule || (isJobCompleted ? 'All Modules Finished' : (completedModulesCount > 0 ? `Module ${completedModulesCount} of ${totalModulesCount}` : 'Identifying Modules & Topics...'));
              const actualProgressPct = activeJob?.progress || (isJobCompleted ? 100 : updatingSyllabus ? 10 : 0);

              // ── REAL-TIME PROGRESS & LIVE MONITOR VIEW ──
              if (hasTrackableJob && !showSyllabusUploadForm) {
                return (
                  <div className="space-y-4">
                    {/* Header Banner with Real-time Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Real-Time AI Syllabus Pipeline
                          </h4>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isJobCompleted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isJobPartial
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isJobFailed
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isJobCancelled
                              ? 'bg-slate-100 text-slate-700 border border-slate-300'
                              : 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse'
                          }`}>
                            {isJobCompleted ? 'Generation Completed' : isJobPartial ? 'Partial Completion' : isJobFailed ? 'Generation Incomplete' : isJobCancelled ? 'Cancelled' : 'Generating Tasks...'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {activeJob?.currentStep || 'Live database-driven syllabus extraction and verified task generation.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSyllabusUploadForm(true)}
                        className="text-[11px] font-bold text-slate-600 hover:text-purple-600 hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition shrink-0"
                      >
                        Upload Different Syllabus
                      </button>
                    </div>

                    {/* Accurate 10-Stage Pipeline Stepper */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                          10-Stage Execution Pipeline
                        </span>
                        <span className="text-[11px] font-bold text-purple-700">
                          {actualProgressPct}% Complete
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {SYLLABUS_STAGES.map((stage) => {
                          const state = getStageState(stage.id);
                          return (
                            <div
                              key={stage.id}
                              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition ${
                                state === 'completed'
                                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                  : state === 'active'
                                  ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-400/20 shadow-xs'
                                  : state === 'failed'
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : state === 'partial'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : state === 'cancelled'
                                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                                  : 'bg-slate-50/60 border-slate-200/80 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black opacity-60">
                                  #{stage.id}
                                </span>
                                {state === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />}
                                {state === 'active' && <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />}
                                {state === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                                {state === 'partial' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                                {state === 'cancelled' && <StopCircle className="w-3.5 h-3.5 text-slate-500" />}
                                {state === 'pending' && <Clock className="w-3.5 h-3.5 text-slate-300" />}
                              </div>
                              <p className="text-[11px] font-bold leading-tight">
                                {stage.label}
                              </p>
                              <span className="text-[9px] font-black uppercase tracking-wider opacity-70">
                                {state}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Accurate Real-Time Database Metrics (Never Fake) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Module</span>
                        <p className="text-xs font-black text-slate-800 truncate" title={currentModuleName}>
                          {currentModuleName}
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Modules</span>
                        <p className="text-sm font-black text-purple-700">
                          {totalModulesCount} <span className="text-[10px] text-slate-400 font-bold">Modules</span>
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks Generated</span>
                        <p className="text-sm font-black text-emerald-600">
                          {tasksGeneratedCount} <span className="text-[10px] text-slate-400 font-bold">Tasks</span>
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks Remaining</span>
                        <p className="text-sm font-black text-amber-600">
                          {tasksRemainingCount} <span className="text-[10px] text-slate-400 font-bold">Tasks</span>
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                        <p className="text-sm font-black text-blue-600">
                          {actualProgressPct}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar with Animated Gradient */}
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          {isJobGenerating ? <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" /> : <Database className="w-3.5 h-3.5 text-slate-400" />}
                          <span>Live Progress Telemetry</span>
                        </span>
                        <span className="font-mono font-black text-purple-700">{actualProgressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                        <div
                          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, actualProgressPct)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {activeJob?.currentStep || 'Extracting topics and generating tasks...'}
                      </p>
                    </div>

                    {/* Module-by-Module Real Progress Cards */}
                    {activeJob?.moduleProgress && activeJob.moduleProgress.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <ListOrdered className="w-4 h-4 text-purple-600" />
                            <span>Sequential Module Progress ({completedModulesCount}/{totalModulesCount})</span>
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Saved sequentially to database</span>
                        </div>

                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {activeJob.moduleProgress.map((m) => (
                            <div
                              key={m.order}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                                m.status === 'completed'
                                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-900'
                                  : m.status === 'generating'
                                  ? 'bg-purple-50/60 border-purple-300 text-slate-900 shadow-xs'
                                  : m.status === 'failed'
                                  ? 'bg-rose-50/60 border-rose-200 text-slate-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="min-w-0 flex-1 flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                  m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                  m.status === 'generating' ? 'bg-purple-100 text-purple-800' :
                                  m.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  Module {m.order}
                                </span>
                                <p className="text-xs font-bold text-slate-800 truncate" title={m.title}>
                                  {m.title}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {m.status === 'completed' ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>{m.questionsCount || tasksPerMod} Tasks Saved</span>
                                  </span>
                                ) : m.status === 'generating' ? (
                                  <span className="text-[10px] font-bold text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" />
                                    <span>Generating...</span>
                                  </span>
                                ) : m.status === 'failed' ? (
                                  <span className="text-[10px] font-bold text-rose-700 bg-white border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1" title={m.error || 'Failed'}>
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    <span>Failed (Resumable)</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exact Failure Reason Diagnostics Alert (if partial or failed) */}
                    {(isJobPartial || isJobFailed) && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-rose-800 font-black">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{isJobPartial ? 'Partial Generation Notice' : 'Generation Halted'}</span>
                        </div>
                        <p className="text-[11px] text-rose-700 font-medium">
                          {activeJob?.error || activeJob?.lastErrorDetails?.backendException || 'A module timed out or rate limit occurred during task generation.'}
                        </p>
                        <p className="text-[10px] text-rose-600 font-bold">
                          ✓ All {completedModulesCount} completed modules and {tasksGeneratedCount} tasks are safely saved in the database. Resuming will continue without duplicate task creation.
                        </p>
                      </div>
                    )}

                    {/* Cancellation Notice */}
                    {isJobCancelled && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-amber-800 font-black">
                          <StopCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Generation Cancelled by Administrator</span>
                        </div>
                        <p className="text-[11px] text-amber-700 font-medium">
                          All {completedModulesCount} completed modules and {tasksGeneratedCount} saved tasks are preserved in the database.
                        </p>
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 flex-wrap">
                      {isJobGenerating && (
                        <>
                          <button
                            type="button"
                            disabled
                            className="bg-purple-100 text-purple-700 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed border border-purple-200"
                          >
                            <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
                            <span>Generating Tasks... ({actualProgressPct}%)</span>
                          </button>

                          <button
                            type="button"
                            disabled={cancellingJob}
                            onClick={() => handleCancelGenerationJob(activeJob?._id)}
                            className="px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <StopCircle className="w-4 h-4 text-rose-500" />
                            <span>{cancellingJob ? 'Cancelling...' : 'Cancel Generation'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUpdateSyllabusOpen(false)}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            Run in Background & Close
                          </button>
                        </>
                      )}

                      {isJobCompleted && (
                        <>
                          <button
                            type="button"
                            disabled
                            className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-default"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Generation Completed</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setUpdateSyllabusOpen(false);
                              if (selectedItem && itemType) {
                                fetchItemDetail(selectedItem, itemType);
                              }
                            }}
                            className="bg-white px-5 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-xs border border-[#9333EA] hover:opacity-95 transition flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>View Generated Tasks</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowSyllabusUploadForm(true)}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            Upload New Syllabus
                          </button>
                        </>
                      )}

                      {(isJobPartial || isJobFailed) && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResumeSyllabusJob(activeJob?._id)}
                            className="bg-white px-5 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-xs border border-[#9333EA] hover:opacity-95 transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Resume Incomplete Modules</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowSyllabusUploadForm(true)}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            Upload New Syllabus
                          </button>

                          <button
                            type="button"
                            onClick={() => setUpdateSyllabusOpen(false)}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            Close
                          </button>
                        </>
                      )}

                      {isJobCancelled && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResumeSyllabusJob(activeJob?._id)}
                            className="bg-white px-5 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-xs border border-[#9333EA] hover:opacity-95 transition flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Resume Generation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowSyllabusUploadForm(true)}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            Upload New Syllabus
                          </button>

                          <button
                            type="button"
                            onClick={() => setUpdateSyllabusOpen(false)}
                            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              }

              // ── UPLOAD FORM VIEW (FILE OR TEXT INPUT) ──
              return (
                <form onSubmit={handleUpdateSyllabus} className="space-y-4">
                  {/* Banner to switch back to Live Progress if a job exists */}
                  {hasTrackableJob && (
                    <div className="flex items-center justify-between p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2 text-purple-900 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>A generation record exists for this course ({activeJob.status}).</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSyllabusUploadForm(false)}
                        className="text-[11px] font-black text-purple-700 hover:text-purple-900 underline"
                      >
                        View Live Progress Pipeline →
                      </button>
                    </div>
                  )}

                  {/* Mode Toggle Pills: Upload PDF File vs Paste Syllabus Text */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setSyllabusMode('pdf')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${ syllabusMode === 'pdf' ? 'bg-white text-sq-gradient shadow-xs border border-[#9333EA]' : 'bg-white text-slate-600 hover:bg-white' }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Upload PDF File</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSyllabusMode('text')}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${ syllabusMode === 'text' ? 'bg-white text-sq-gradient shadow-xs border border-[#9333EA]' : 'bg-white text-slate-600 hover:bg-white' }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Paste Syllabus Text</span>
                    </button>
                  </div>

                  {/* File Upload Zone OR Text Area */}
                  {syllabusMode === 'pdf' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#E02B91] bg-white hover:bg-white rounded-2xl p-8 text-center cursor-pointer transition space-y-3"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSyllabusFile(e.target.files[0])}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-white text-[#E02B91] flex items-center justify-center text-xl mx-auto">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      {syllabusFile ? (
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-900">{syllabusFile.name}</p>
                          <p className="text-[11px] text-emerald-600 font-bold">
                            {(syllabusFile.size / 1024).toFixed(1)} KB — Ready to Parse
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-800">
                            Click or drag syllabus PDF here
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Supports standard curriculum PDF documents
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Paste Syllabus Content</label>
                      <textarea
                        rows="6"
                        value={syllabusText}
                        onChange={(e) => setSyllabusText(e.target.value)}
                        placeholder={`Module 1: Overview of ${selectedItem.title}\n- Core concepts\n- Hands-on setup\n\nModule 2: Core Engineering\n- Practical tasks\n- Best practices`}
                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91] resize-none"
                      />
                    </div>
                  )}

                  {/* Tasks per Module Counter Box */}
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Tasks Generated Per Module</p>
                      <p className="text-[11px] text-slate-400 font-medium">Recommended 10 to 15 sequential tasks</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        max="15"
                        value={tasksPerModule}
                        onChange={(e) => setTasksPerModule(parseInt(e.target.value, 10) || 12)}
                        className="w-16 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E02B91]"
                      />
                      <span className="text-xs font-bold text-slate-500">Tasks</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={updatingSyllabus}
                      onClick={() => setUpdateSyllabusOpen(false)}
                      className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updatingSyllabus || isJobGenerating}
                      className="bg-white px-6 py-2.5 hover:opacity-95 text-sq-gradient font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-60 border border-[#9333EA]"
                    >
                      {updatingSyllabus ? <RefreshCw className="w-4 h-4 animate-spin text-purple-600" /> : <Sparkles className="w-4 h-4" />}
                      <span>{updatingSyllabus ? 'Parsing PDF & Starting Generation...' : 'Parse PDF & Generate Tasks'}</span>
                    </button>
                  </div>
                </form>
              );
            })()}

            {/* TAB 2: EDIT INFORMATION FORM */}
            {updateModalTab === 'info' && (
              <form onSubmit={handleEditInfoSubmit} className="space-y-4">
                {/* 1. COURSE EDIT FORM */}
                {itemType === 'course' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Course Title</label>
                      <input
                        type="text"
                        required
                        value={editCourseForm.title}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    {/* Course ID Prefix, Student ID Prefix & Starting Sequence */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-purple-100">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Course Prefix *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SQ-JAVA"
                          value={editCourseForm.coursePrefix || ''}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, coursePrefix: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Student ID Prefix *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. SQ-JAVA"
                          value={editCourseForm.studentIdPrefix || ''}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, studentIdPrefix: e.target.value.toUpperCase() })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">Start Sequence *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editCourseForm.startingSequence || 1}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, startingSequence: Math.max(1, Number(e.target.value)) })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div className="sm:col-span-3 flex items-center justify-between text-[11px] text-purple-700 font-mono bg-white px-2.5 py-1 rounded border border-purple-200 mt-1">
                        <span className="font-semibold text-slate-600">ID Format Preview:</span>
                        <strong className="text-purple-600 font-extrabold">
                          {(editCourseForm.studentIdPrefix || editCourseForm.coursePrefix || 'SQ-COURSE').replace(/[-_]+$/, '')}-{String(editCourseForm.startingSequence || 1).padStart(4, '0')}
                        </strong>
                      </div>
                    </div>

                    {/* Associated Domain */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <span>Associated Domain</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex items-center gap-1.5">
                          {editCourseForm.domain && (
                            <button
                              type="button"
                              onClick={() => {
                                const matchedDom = technicalDomains.find(d => d.name?.toLowerCase() === editCourseForm.domain?.toLowerCase()) || { name: editCourseForm.domain };
                                handleOpenEditDomain(matchedDom);
                              }}
                              className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer transition px-1 py-0.5 rounded hover:bg-white"
                              title="Edit / Rename domain"
                            >
                              <Edit3 className="w-3 h-3 text-purple-600" />
                              <span>Edit</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenAddDomain()}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer transition px-1 py-0.5 rounded hover:bg-white"
                            title="Add New Domain"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>New</span>
                          </button>
                        </div>
                      </div>

                      <select
                        value={editCourseForm.domain}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__add_domain__') {
                            handleOpenAddDomain();
                            return;
                          }
                          setEditCourseForm(prev => ({
                            ...prev,
                            domain: val,
                            category: val
                          }));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="" disabled>Select Associated Domain</option>
                        {allAvailableDomains.map((dom) => (
                          <option key={dom} value={dom}>{dom}</option>
                        ))}
                        <option value="__add_domain__" className="font-bold text-purple-700 bg-white">
                          + Add New Domain
                        </option>
                      </select>
                    </div>

                    {/* Course Duration & Academic Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          Course Duration <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editCourseForm.durationValue || editCourseForm.durationWeeks || 12}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            const unit = editCourseForm.durationUnit || 'Weeks';
                            setEditCourseForm({
                              ...editCourseForm,
                              durationValue: val,
                              durationWeeks: unit === 'Months' ? val * 4 : val,
                              durationText: `${val} ${unit}`
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                          placeholder="12"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          Duration Unit <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={editCourseForm.durationUnit || 'Weeks'}
                          onChange={(e) => {
                            const unit = e.target.value;
                            const val = editCourseForm.durationValue || editCourseForm.durationWeeks || 12;
                            setEditCourseForm({
                              ...editCourseForm,
                              durationUnit: unit,
                              durationWeeks: unit === 'Months' ? val * 4 : val,
                              durationText: `${val} ${unit}`
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="Weeks">Weeks</option>
                          <option value="Months">Months</option>
                          <option value="Days">Days</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          Total Hours <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editCourseForm.totalHours !== undefined ? editCourseForm.totalHours : 120}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, totalHours: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                          placeholder="120"
                        />
                      </div>
                    </div>

                    {/* Fee Management Configuration */}
                    <div className="bg-white border border-purple-200/80 rounded-2xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-purple-900 uppercase tracking-wider font-mono">
                          Course Fee & Installment Structure
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                          Financial Configuration
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-800">
                            Total Course Fee (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            required
                            value={editCourseForm.totalCourseFee !== undefined ? editCourseForm.totalCourseFee : 24000}
                            onChange={(e) => setEditCourseForm({ ...editCourseForm, totalCourseFee: Math.max(0, Number(e.target.value)) })}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-purple-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-800">
                            Monthly Installment Amount (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            required
                            value={editCourseForm.monthlyInstallment !== undefined ? editCourseForm.monthlyInstallment : 2000}
                            onChange={(e) => setEditCourseForm({ ...editCourseForm, monthlyInstallment: Math.max(1, Number(e.target.value)) })}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-purple-700 focus:ring-2 focus:ring-purple-400"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-purple-700/80">
                        Monthly installment determines the payment schedule and is calculated independently from academic duration.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Level</label>
                        <select
                          value={editCourseForm.level}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, level: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="All Levels">All Levels</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Status</label>
                        <select
                          value={editCourseForm.isActive ? 'Active' : 'Inactive'}
                          onChange={(e) => setEditCourseForm({ ...editCourseForm, isActive: e.target.value === 'Active' })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Description</label>
                      <textarea
                        rows="3"
                        value={editCourseForm.description}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 2. INTERNSHIP EDIT FORM */}
                {itemType === 'internship' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Internship Title</label>
                      <input
                        type="text"
                        required
                        value={editInternshipForm.title}
                        onChange={(e) => setEditInternshipForm({ ...editInternshipForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Associated Domain</label>
                        <select
                          value={editInternshipForm.domain}
                          onChange={(e) => setEditInternshipForm({
                            ...editInternshipForm,
                            domain: e.target.value
                          })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 font-sans"
                        >
                          {allAvailableDomains.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Duration</label>
                        <select
                          value={editInternshipForm.durationText || '1 Month'}
                          onChange={(e) => {
                            const text = e.target.value;
                            const weeks = text === '15 Days' ? 2 : text === '30 Days' || text === '1 Month' ? 4 : text === '45 Days' ? 6 : text === '2 Months' ? 8 : text === '3 Months' ? 12 : 24;
                            setEditInternshipForm({ ...editInternshipForm, durationText: text, durationWeeks: weeks });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="15 Days">15 Days</option>
                          <option value="30 Days">30 Days</option>
                          <option value="1 Month">1 Month</option>
                          <option value="45 Days">45 Days</option>
                          <option value="2 Months">2 Months</option>
                          <option value="3 Months">3 Months</option>
                          <option value="6 Months">6 Months</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Internship Fee / Amount (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 2000 for 15 Days or 5000 for 1 Month"
                          value={editInternshipForm.stipend}
                          onChange={(e) => setEditInternshipForm({ ...editInternshipForm, stipend: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tech Stack (comma separated)</label>
                      <input
                        type="text"
                        value={editInternshipForm.techStack}
                        onChange={(e) => setEditInternshipForm({ ...editInternshipForm, techStack: e.target.value })}
                        placeholder="React, Node.js, MongoDB, Tailwind"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Description</label>
                      <textarea
                        rows="3"
                        value={editInternshipForm.description}
                        onChange={(e) => setEditInternshipForm({ ...editInternshipForm, description: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900"
                      />
                    </div>
                  </>
                )}

                {/* 3. PROJECT EDIT FORM */}
                {itemType === 'project' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editProjectForm.title}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Associated Domain</label>
                        <select
                          value={editProjectForm.domain}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, domain: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500 font-sans"
                        >
                          {allAvailableDomains.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Status</label>
                        <select
                          value={editProjectForm.status || 'Available'}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, status: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Available">Available</option>
                          <option value="Active">Active</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Difficulty Level</label>
                        <select
                          value={editProjectForm.difficulty || 'Intermediate'}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, difficulty: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Industry Level">Industry Level</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Estimated Effort (Hours)</label>
                        <input
                          type="number"
                          value={editProjectForm.estimatedHours || 40}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, estimatedHours: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">XP Completion Reward</label>
                        <input
                          type="number"
                          value={editProjectForm.xpReward || 300}
                          onChange={(e) => setEditProjectForm({ ...editProjectForm, xpReward: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Required Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={editProjectForm.technologies}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, technologies: e.target.value })}
                        placeholder="React, Node.js, Express, MongoDB, Tailwind"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Functional Deliverables & Requirements</label>
                        <span className="text-[10px] text-slate-400">One requirement per line</span>
                      </div>
                      <textarea
                        rows="4"
                        value={editProjectForm.requirements}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, requirements: e.target.value })}
                        placeholder="User Authentication with JWT&#10;Product Catalog with Search and Filter&#10;Shopping Cart & Checkout Flow&#10;Admin Order Management Panel"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Project Overview & Scope Guidelines</label>
                      <textarea
                        rows="3"
                        value={editProjectForm.description}
                        onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                        placeholder="Detailed project guidelines and scope for students..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}

                {/* Submit Action */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setUpdateSyllabusOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updatingSyllabus}
                    className="bg-white px-6 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition disabled:opacity-60 border border-[#9333EA]"
                  >
                    <span>{updatingSyllabus ? 'Saving Details...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 2: DELETE CONFIRMATION MODAL
         ══════════════════════════════════════════════════════ */}
      {deleteConfirmOpen && selectedDomainItem && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-rose-500 overflow-hidden max-h-[85vh] flex flex-col my-auto animate-scale-up">

            <div className="bg-white p-5 text-sq-gradient flex items-center justify-between shrink-0 border border-[#9333EA]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Delete {itemType.toUpperCase()} Confirmation
                </h3>
              </div>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#9333EA] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1.5 font-medium">
                <p className="font-bold">Are you sure you want to permanently delete this {itemType}?</p>
                <p className="text-rose-700 font-mono text-[11px] truncate">"{selectedItem.title}"</p>
                <p className="text-[11px] text-rose-600 font-normal pt-1">
                  This action will also delete or archive all associated syllabus modules and tasks from the database!
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={deletingItem}
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deletingItem}
                  onClick={handleDeleteDomainItem}
                  className="bg-white px-5 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer border border-[#9333EA]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deletingItem ? 'Deleting...' : `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 3: + ADD NEW ITEM MODAL (COURSE / INTERNSHIP / PROJECT)
         ══════════════════════════════════════════════════════ */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[85vh] flex flex-col my-auto animate-scale-up">

            <div className="flex items-start justify-between border-b border-slate-100 p-5 shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Add New {effectiveFixedType ? selectedType : 'Domain Catalog Record'}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {effectiveFixedType === 'course' ? 'Create a new course with duration, curriculum, and syllabus upload' :
                   effectiveFixedType === 'internship' ? 'Create a new industry internship with stipend, duration, and partner company' :
                   effectiveFixedType === 'project' ? 'Create a new capstone project with deliverables, tech stack, and XP' :
                   'Create a new Course, Internship, or Capstone Project'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseAddModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {!effectiveFixedType && (
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  {['Course', 'Internship', 'Project'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${ selectedType === t ? 'bg-white text-sq-gradient shadow-xs border border-[#9333EA]' : 'bg-white text-slate-600 hover:bg-white' }`}
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              )}

              {selectedType === 'Course' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master Python Full Stack Engineering"
                      value={courseForm.title}
                      onChange={(e) => {
                        const t = e.target.value;
                        setCourseForm(prev => {
                          const autoP = (!prev.coursePrefix || prev.coursePrefix.startsWith('SQ-')) 
                            ? 'SQ-' + t.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase()
                            : prev.coursePrefix;
                          return {
                            ...prev,
                            title: t,
                            coursePrefix: prev.coursePrefix ? prev.coursePrefix : (t.trim() ? autoP : ''),
                            studentIdPrefix: prev.studentIdPrefix ? prev.studentIdPrefix : (t.trim() ? autoP : '')
                          };
                        });
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Course ID Prefix, Student ID Prefix & Starting Sequence */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-purple-100">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Course Prefix *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SQ-JAVA"
                        value={courseForm.coursePrefix || ''}
                        onChange={(e) => {
                          const p = e.target.value.toUpperCase();
                          setCourseForm(prev => ({
                            ...prev,
                            coursePrefix: p,
                            studentIdPrefix: prev.studentIdPrefix || p
                          }));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Student ID Prefix *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SQ-JAVA"
                        value={courseForm.studentIdPrefix || ''}
                        onChange={(e) => setCourseForm({ ...courseForm, studentIdPrefix: e.target.value.toUpperCase() })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Start Sequence *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={courseForm.startingSequence || 1}
                        onChange={(e) => setCourseForm({ ...courseForm, startingSequence: Math.max(1, Number(e.target.value)) })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                    <div className="sm:col-span-3 flex items-center justify-between text-[11px] text-purple-700 font-mono bg-white px-2.5 py-1 rounded border border-purple-200 mt-1">
                      <span className="font-semibold text-slate-600">ID Format Preview:</span>
                      <strong className="text-purple-600 font-extrabold">
                        {(courseForm.studentIdPrefix || courseForm.coursePrefix || 'SQ-COURSE').replace(/[-_]+$/, '')}-{String(courseForm.startingSequence || 1).padStart(4, '0')}
                      </strong>
                    </div>
                  </div>

                  {/* Associated Domain */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <span>Associated Domain</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        {courseForm.domain && (
                          <button
                            type="button"
                            onClick={() => {
                              const matchedDom = technicalDomains.find(d => d.name?.toLowerCase() === courseForm.domain?.toLowerCase()) || { name: courseForm.domain };
                              handleOpenEditDomain(matchedDom);
                            }}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer transition px-1 py-0.5 rounded hover:bg-white"
                            title="Edit / Rename domain"
                          >
                            <Edit3 className="w-3 h-3 text-purple-600" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenAddDomain()}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer transition px-1 py-0.5 rounded hover:bg-white"
                          title="Add New Domain"
                        >
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>New</span>
                        </button>
                      </div>
                    </div>

                    <select
                      value={courseForm.domain}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__add_domain__') {
                          handleOpenAddDomain();
                          return;
                        }
                        setCourseForm(prev => ({
                          ...prev,
                          domain: val,
                          category: val
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="" disabled>Select Associated Domain</option>
                      {allAvailableDomains.map((dom) => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                      <option value="__add_domain__" className="font-bold text-purple-700 bg-white">
                        + Add New Domain
                      </option>
                    </select>
                  </div>

                  {/* Course Duration & Academic Hours */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">
                        Course Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={courseForm.durationValue || courseForm.durationWeeks || 12}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          const unit = courseForm.durationUnit || 'Weeks';
                          setCourseForm({
                            ...courseForm,
                            durationValue: val,
                            durationWeeks: unit === 'Months' ? val * 4 : val,
                            durationText: `${val} ${unit}`
                          });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                        placeholder="12"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">
                        Duration Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={courseForm.durationUnit || 'Weeks'}
                        onChange={(e) => {
                          const unit = e.target.value;
                          const val = courseForm.durationValue || courseForm.durationWeeks || 12;
                          setCourseForm({
                            ...courseForm,
                            durationUnit: unit,
                            durationWeeks: unit === 'Months' ? val * 4 : val,
                            durationText: `${val} ${unit}`
                          });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Days">Days</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">
                        Total Hours <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={courseForm.totalHours !== undefined ? courseForm.totalHours : 120}
                        onChange={(e) => setCourseForm({ ...courseForm, totalHours: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                        placeholder="120"
                      />
                    </div>
                  </div>

                  {/* Fee Management Configuration (Mandatory) */}
                  <div className="bg-white border border-purple-200/80 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-900 uppercase tracking-wider font-mono">
                        Course Fee & Installment Structure
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                        Financial Configuration
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          Total Course Fee (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          value={courseForm.totalCourseFee}
                          onChange={(e) => setCourseForm({ ...courseForm, totalCourseFee: Math.max(0, Number(e.target.value)) })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-purple-400"
                          placeholder="24000"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">
                          Monthly Installment Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          required
                          value={courseForm.monthlyInstallment}
                          onChange={(e) => setCourseForm({ ...courseForm, monthlyInstallment: Math.max(1, Number(e.target.value)) })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-purple-700 focus:ring-2 focus:ring-purple-400"
                          placeholder="2000"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-purple-700/80">
                      Monthly installment determines the payment schedule and is calculated independently from academic duration.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Level</label>
                    <select
                      value={courseForm.level}
                      onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Course overview and objectives..."
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900"
                    />
                  </div>

                  {/* ── COURSE SYLLABUS MODULE SETUP ── */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>Syllabus & Module Setup</span>
                      </label>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                        Auto Task Generator
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCourseForm({ ...courseForm, syllabusOption: 'text' })}
                        className={`py-2 px-3 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${ courseForm.syllabusOption === 'text' ? 'bg-white text-sq-gradient border-purple-600 shadow-xs border' : 'bg-white text-slate-700 border-slate-200 hover:bg-white' }`}
                      >
                        📝 Custom Text Outline
                      </button>
                      <button
                        type="button"
                        onClick={() => setCourseForm({ ...courseForm, syllabusOption: 'pdf' })}
                        className={`py-2 px-3 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${ courseForm.syllabusOption === 'pdf' ? 'bg-white text-sq-gradient border-purple-600 shadow-xs border' : 'bg-white text-slate-700 border-slate-200 hover:bg-white' }`}
                      >
                        📄 Upload PDF Syllabus
                      </button>
                    </div>

                    {/* Tasks Per Module Count Selection */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Tasks Generated Per Module (10 to 15):</span>
                        <span className="text-purple-600 font-mono font-extrabold">{courseForm.tasksPerModule || 12} Qs/Module</span>
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="15"
                        value={courseForm.tasksPerModule}
                        onChange={(e) => setCourseForm({ ...courseForm, tasksPerModule: Math.min(15, Math.max(10, Number(e.target.value) || 12)) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    {courseForm.syllabusOption === 'text' && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Enter Syllabus Text Outline:</label>
                        <textarea
                          rows="4"
                          placeholder={`Module 1: Getting Started with ${courseForm.title || 'Course'}\n- Topic 1: Core Syntax\n- Topic 2: Variables\n\nModule 2: Advanced Topics...`}
                          value={courseForm.syllabusText}
                          onChange={(e) => setCourseForm({ ...courseForm, syllabusText: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    )}

                    {courseForm.syllabusOption === 'pdf' && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block">Select PDF Syllabus File:</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setCourseForm({ ...courseForm, syllabusFile: e.target.files[0] })}
                          className="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                        />
                        {courseForm.syllabusFile && (
                          <p className="text-[11px] text-emerald-600 font-bold">
                            Attached: {courseForm.syllabusFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedType === 'Internship' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Internship Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Developer Internship Track"
                      value={internshipForm.title}
                      onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Associated Domain</label>
                      <select
                        value={internshipForm.domain}
                        onChange={(e) => setInternshipForm({
                          ...internshipForm,
                          domain: e.target.value
                        })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 font-sans"
                      >
                        {allAvailableDomains.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Duration</label>
                      <select
                        value={internshipForm.durationText || '1 Month'}
                        onChange={(e) => {
                          const text = e.target.value;
                          const weeks = text === '15 Days' ? 2 : text === '30 Days' || text === '1 Month' ? 4 : text === '45 Days' ? 6 : text === '2 Months' ? 8 : text === '3 Months' ? 12 : 24;
                          setInternshipForm({ ...internshipForm, durationText: text, durationWeeks: weeks });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="1 Month">1 Month</option>
                        <option value="45 Days">45 Days</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Internship Fee / Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 2000 for 15 Days or 5000 for 1 Month"
                        value={internshipForm.stipend}
                        onChange={(e) => setInternshipForm({ ...internshipForm, stipend: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, MongoDB, Tailwind"
                      value={internshipForm.techStack}
                      onChange={(e) => setInternshipForm({ ...internshipForm, techStack: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Internship duties, projects, and deliverables..."
                      value={internshipForm.description}
                      onChange={(e) => setInternshipForm({ ...internshipForm, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900"
                    />
                  </div>

                  {/* ── INTERNSHIP SYLLABUS MODULE SETUP ── */}
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Syllabus & Module Setup</span>
                      </label>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Auto Task Generator
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setInternshipForm({ ...internshipForm, syllabusOption: 'text' })}
                        className={`py-2 px-3 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${ internshipForm.syllabusOption === 'text' ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs border' : 'bg-white text-slate-700 border-slate-200 hover:bg-white' }`}
                      >
                        📝 Custom Text Outline
                      </button>
                      <button
                        type="button"
                        onClick={() => setInternshipForm({ ...internshipForm, syllabusOption: 'pdf' })}
                        className={`py-2 px-3 rounded-xl text-[11px] font-bold border transition text-center cursor-pointer ${ internshipForm.syllabusOption === 'pdf' ? 'bg-white text-emerald-700 border-emerald-600 shadow-xs border' : 'bg-white text-slate-700 border-slate-200 hover:bg-white' }`}
                      >
                        📄 Upload PDF Syllabus
                      </button>
                    </div>

                    {/* Tasks Per Module Count Selection */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Tasks Generated Per Module (10 to 15):</span>
                        <span className="text-emerald-600 font-mono font-extrabold">{internshipForm.tasksPerModule || 12} Qs/Module</span>
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="15"
                        value={internshipForm.tasksPerModule}
                        onChange={(e) => setInternshipForm({ ...internshipForm, tasksPerModule: Math.min(15, Math.max(10, Number(e.target.value) || 12)) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {internshipForm.syllabusOption === 'text' && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Enter Syllabus Text Outline:</label>
                        <textarea
                          rows="4"
                          placeholder={`Module 1: Internship Fundamentals\n- Task 1: Environment Setup\n\nModule 2: Project Milestones...`}
                          value={internshipForm.syllabusText}
                          onChange={(e) => setInternshipForm({ ...internshipForm, syllabusText: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}

                    {internshipForm.syllabusOption === 'pdf' && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 block">Select PDF Syllabus File:</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setInternshipForm({ ...internshipForm, syllabusFile: e.target.files[0] })}
                          className="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                        />
                        {internshipForm.syllabusFile && (
                          <p className="text-[11px] text-emerald-600 font-bold">
                            Attached: {internshipForm.syllabusFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedType === 'Project' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI E-Commerce Recommendation Engine Capstone"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Associated Domain</label>
                      <select
                        value={projectForm.domain}
                        onChange={(e) => setProjectForm({ ...projectForm, domain: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 font-sans"
                      >
                        {allAvailableDomains.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">XP Reward</label>
                      <input
                        type="number"
                        value={projectForm.xpReward}
                        onChange={(e) => setProjectForm({ ...projectForm, xpReward: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Technologies (comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Python, OpenCV, PostgreSQL"
                      value={projectForm.technologies}
                      onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Capstone specs and requirements..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-white px-6 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition disabled:opacity-60 border border-[#9333EA]"
                >
                  <span>{submitting ? 'Saving Record...' : `Create ${selectedType}`}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 2.5: COMPREHENSIVE EDIT QUESTION MODAL (CODING & MCQ)
         ══════════════════════════════════════════════════════ */}
      {editingQuestionModalOpen && editingQuestionItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col my-auto animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
                    <Edit3 className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Edit Question & Validate Solution ({editingQuestionItem.type.toUpperCase()})
                  </h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    editQuestionForm.questionType === 'mcq' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {editQuestionForm.questionType === 'mcq' ? 'MCQ' : 'CODING'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Question ID: <span className="font-mono text-purple-700 font-bold">{editingQuestionItem.item._id}</span> • Edits preserve ID and rerun compiler validation automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveQuestionEdit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Validation Failure Warning if any */}
              {editValidationResult && !editValidationResult.isValid && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-black">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Compiler / Option Validation Warning: {editValidationResult.reason}</span>
                  </div>
                  {editValidationResult.compilerError && (
                    <div className="p-3 bg-slate-950 text-rose-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap">
                      {editValidationResult.compilerError}
                    </div>
                  )}
                  {editValidationResult.failedTestCases && editValidationResult.failedTestCases.length > 0 && (
                    <div className="text-[11px] font-mono text-rose-800 space-y-1">
                      <div className="font-bold">Failed Test Case Detail:</div>
                      <div>Input: {editValidationResult.failedTestCases[0].input || 'None'}</div>
                      <div>Expected: {editValidationResult.failedTestCases[0].expectedOutput}</div>
                      <div>Actual: {editValidationResult.failedTestCases[0].actualOutput || 'No output'}</div>
                    </div>
                  )}
                  <p className="text-[11px] text-rose-700 font-medium">
                    You can adjust the reference solution, test cases, or options below and save again to re-validate.
                  </p>
                </div>
              )}

              {/* Title & Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Question Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editQuestionForm.title}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    placeholder="e.g. Reverse a Linked List"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Question Format</label>
                  <select
                    value={editQuestionForm.questionType}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, questionType: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="coding">Coding Execution Problem</option>
                    <option value="mcq">Multiple Choice Question (MCQ)</option>
                  </select>
                </div>
              </div>

              {/* Difficulty, Points, Topic, Language */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Difficulty</label>
                  <select
                    value={editQuestionForm.difficulty}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, difficulty: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Points</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editQuestionForm.points}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, points: Number(e.target.value) || 10 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Topic / Category</label>
                  <input
                    type="text"
                    value={editQuestionForm.topic}
                    onChange={(e) => setEditQuestionForm({ ...editQuestionForm, topic: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    placeholder="e.g. Arrays & Hashing"
                  />
                </div>

                {editQuestionForm.questionType === 'coding' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Compiler / Runtime</label>
                    <select
                      value={editQuestionForm.compiler}
                      onChange={(e) => setEditQuestionForm({ ...editQuestionForm, compiler: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="javascript">JavaScript / Node.js</option>
                      <option value="python">Python 3</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
                      <option value="html">HTML / CSS / JS</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Correct MCQ Answer <span className="text-rose-500">*</span></label>
                    <select
                      value={editQuestionForm.correctAnswer}
                      onChange={(e) => setEditQuestionForm({ ...editQuestionForm, correctAnswer: e.target.value })}
                      className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs font-black text-purple-700 focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Problem Statement / Prompt */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {editQuestionForm.questionType === 'mcq' ? 'MCQ Question Statement' : 'Problem Statement'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  value={editQuestionForm.problemStatement}
                  onChange={(e) => setEditQuestionForm({ ...editQuestionForm, problemStatement: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-400 font-mono"
                  placeholder="Detailed description of the problem or question..."
                />
              </div>

              {/* CODING-SPECIFIC FIELDS: Input/Output format, constraints, reference solution, test cases */}
              {editQuestionForm.questionType === 'coding' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Input Format</label>
                      <textarea
                        rows="2"
                        value={editQuestionForm.inputFormat}
                        onChange={(e) => setEditQuestionForm({ ...editQuestionForm, inputFormat: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900"
                        placeholder="e.g. An integer array nums followed by target"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Output Format</label>
                      <textarea
                        rows="2"
                        value={editQuestionForm.outputFormat}
                        onChange={(e) => setEditQuestionForm({ ...editQuestionForm, outputFormat: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono text-slate-900"
                        placeholder="e.g. Return the indices of the two numbers"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Constraints</label>
                    <input
                      type="text"
                      value={editQuestionForm.constraints}
                      onChange={(e) => setEditQuestionForm({ ...editQuestionForm, constraints: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                      placeholder="e.g. 2 <= nums.length <= 10^4, -10^9 <= target <= 10^9"
                    />
                  </div>

                  {/* Reference Solution Code */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-purple-600" />
                        <span>Verified Reference Solution Code <span className="text-rose-500">*</span></span>
                      </label>
                      <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Evaluated by {editQuestionForm.compiler} sandbox
                      </span>
                    </div>
                    <textarea
                      rows="6"
                      required
                      value={editQuestionForm.referenceSolution}
                      onChange={(e) => setEditQuestionForm({ ...editQuestionForm, referenceSolution: e.target.value })}
                      className="w-full bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-purple-400"
                      placeholder={`// Reference solution executable in ${editQuestionForm.compiler}\nfunction solution(input) {\n  return input;\n}`}
                    />
                  </div>

                  {/* Test Cases Manager */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Test Cases & Hidden Validation Cases ({editQuestionForm.testCases?.length || 0})</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditQuestionForm(prev => ({
                            ...prev,
                            testCases: [...(prev.testCases || []), { input: '', expectedOutput: '', isHidden: false }]
                          }));
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Add Test Case</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(editQuestionForm.testCases || []).map((tc, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                          <div className="sm:col-span-5 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500">Input #{idx + 1}:</span>
                            <input
                              type="text"
                              value={tc.input || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditQuestionForm(prev => {
                                  const updated = [...(prev.testCases || [])];
                                  updated[idx] = { ...updated[idx], input: val };
                                  return { ...prev, testCases: updated };
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                              placeholder="e.g. 5 or [1,2,3]"
                            />
                          </div>

                          <div className="sm:col-span-4 space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-500">Expected Output:</span>
                            <input
                              type="text"
                              required
                              value={tc.expectedOutput || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditQuestionForm(prev => {
                                  const updated = [...(prev.testCases || [])];
                                  updated[idx] = { ...updated[idx], expectedOutput: val };
                                  return { ...prev, testCases: updated };
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono"
                              placeholder="Exact expected string"
                            />
                          </div>

                          <div className="sm:col-span-2 flex items-center gap-1.5 pt-3 sm:pt-0">
                            <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!tc.isHidden}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setEditQuestionForm(prev => {
                                    const updated = [...(prev.testCases || [])];
                                    updated[idx] = { ...updated[idx], isHidden: checked };
                                    return { ...prev, testCases: updated };
                                  });
                                }}
                                className="rounded text-purple-600"
                              />
                              <span>Hidden</span>
                            </label>
                          </div>

                          <div className="sm:col-span-1 text-right pt-3 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditQuestionForm(prev => ({
                                  ...prev,
                                  testCases: (prev.testCases || []).filter((_, i) => i !== idx)
                                }));
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Remove test case"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* MCQ-SPECIFIC FIELDS: Exactly 4 options A, B, C, D */}
              {editQuestionForm.questionType === 'mcq' && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-600" />
                      <span>Multiple Choice Options (Exactly 4 Required: A, B, C, D)</span>
                    </label>
                    <span className="text-[10px] text-purple-700 font-bold">
                      Selected Key: Option {editQuestionForm.correctAnswer}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D'].map((key) => {
                      const opt = (editQuestionForm.options || []).find(o => o.optionId === key) || { optionId: key, text: '' };
                      const isCorrect = editQuestionForm.correctAnswer === key;

                      return (
                        <div
                          key={key}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 transition ${
                            isCorrect ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400' : 'bg-white border-slate-200'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setEditQuestionForm({ ...editQuestionForm, correctAnswer: key })}
                            className={`w-7 h-7 rounded-lg text-xs font-black font-mono flex items-center justify-center cursor-pointer transition ${
                              isCorrect ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-purple-100'
                            }`}
                            title={`Click to mark Option ${key} as correct`}
                          >
                            {key}
                          </button>

                          <input
                            type="text"
                            required
                            value={opt.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditQuestionForm(prev => {
                                const updatedOpts = ['A', 'B', 'C', 'D'].map(k => {
                                  const existing = (prev.options || []).find(o => o.optionId === k) || { optionId: k, text: '' };
                                  return k === key ? { ...existing, text: val } : existing;
                                });
                                return { ...prev, options: updatedOpts };
                              });
                            }}
                            className="flex-1 bg-transparent border-0 text-xs font-medium text-slate-900 focus:outline-none"
                            placeholder={`Enter text for Option ${key}...`}
                          />

                          {isCorrect && (
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                              ✓ Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation & Rationale */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Detailed Explanation & Solution Rationale</label>
                <textarea
                  rows="2"
                  value={editQuestionForm.explanation}
                  onChange={(e) => setEditQuestionForm({ ...editQuestionForm, explanation: e.target.value })}
                  placeholder="Theoretical background, algorithm complexity, and best practices..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submittingQuestionEdit}
                  onClick={() => setEditingQuestionModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestionEdit}
                  className="bg-white px-6 py-2.5 hover:opacity-95 text-sq-gradient font-bold text-xs rounded-xl shadow-md transition cursor-pointer border border-[#9333EA] flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingQuestionEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Validating & Saving...</span>
                    </>
                  ) : (
                    <span>Save & Run Compiler Validation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 2.6: DELETE QUESTION CONFIRMATION MODAL
         ══════════════════════════════════════════════════════ */}
      {deleteQuestionModalOpen && questionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-rose-300 overflow-hidden my-auto animate-scale-up">
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Delete Question Confirmation
                  </h3>
                  <p className="text-[11px] text-rose-700 font-medium">
                    Preserves student submissions & module hierarchy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-1.5 font-medium">
                <p className="font-bold">Are you sure you want to delete this question?</p>
                <p className="text-purple-700 font-mono text-[11px] font-bold">"{questionToDelete.item.title}"</p>
                <p className="text-[11px] text-slate-500 font-normal pt-1">
                  The question will be safely archived without deleting the parent syllabus module or corrupting student performance records. All dashboard counts will update immediately.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for Deletion (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Duplicate question, out of syllabus"
                  value={deleteQuestionReason}
                  onChange={(e) => setDeleteQuestionReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  disabled={deletingQuestion}
                  onClick={() => setDeleteQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingQuestion}
                  onClick={handleConfirmDeleteQuestion}
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deletingQuestion ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 2.7: RECOVER QUESTION (COMPILER RERUN) MODAL
         ══════════════════════════════════════════════════════ */}
      {recoverQuestionModalOpen && questionToRecover && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border-2 border-teal-300 overflow-hidden my-auto animate-scale-up">
            <div className="p-5 border-b border-teal-100 flex items-center justify-between bg-teal-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Recover Question via Compiler Validation
                  </h3>
                  <p className="text-[11px] text-teal-700 font-medium">
                    Requires passing 100% of test cases before removing flag
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRecoverQuestionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800">
                  Question: <span className="text-purple-700 font-mono">{questionToRecover.item.title}</span>
                </div>
                <div className="text-[11px] text-rose-700 font-medium">
                  Current Flag Reason: {questionToRecover.item.flagReason || 'Compilation or test cases failed'}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  STACK QUEUE enforces strict code evaluation. Clicking <strong>Execute Recovery</strong> will compile and test the reference solution against all registered test cases. The flag will only be lifted if the code passes cleanly.
                </p>
              </div>

              {recoverResult && !recoverResult.success && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-black">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Recovery Blocked: Code Still Fails Validation!</span>
                  </div>
                  <p className="text-[11px] text-rose-700">{recoverResult.flagReason}</p>
                  {recoverResult.compilerError && (
                    <div className="p-2.5 bg-slate-950 text-rose-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap">
                      {recoverResult.compilerError}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600">
                    Please use <strong>Edit Question</strong> to correct the reference solution or test cases before recovering.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  disabled={recoveringQuestion}
                  onClick={() => setRecoverQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={recoveringQuestion}
                  onClick={handleExecuteRecoverQuestion}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {recoveringQuestion ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Rerunning Sandbox Compiler...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Execute Recovery & Unflag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 2.8: ADMINISTRATIVE MANUAL OVERRIDE MODAL
         ══════════════════════════════════════════════════════ */}
      {overrideModalOpen && questionToOverride && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-amber-300 overflow-hidden my-auto animate-scale-up">
            <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Administrative Manual Override
                  </h3>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Strict non-compiler verification with mandatory audit reason
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                <div className="font-bold">
                  Question: <span className="text-purple-700 font-mono">{questionToOverride.item.title}</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <strong>Important Notice:</strong> Manual overrides verify questions for conceptual/pedagogical exceptions. The question will be unflagged, but it will <strong>NOT</strong> be falsely counted as a compiler-tested solution (`isTested` remains false).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Mandatory Override Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="State clearly why this question is approved manually (e.g. Open-ended system design prompt, compiler sandbox limitation)..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submittingOverride}
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingOverride || !overrideReason.trim()}
                  onClick={handleConfirmOverrideQuestion}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingOverride ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Audit Log...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Confirm Override</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL: ADD / EDIT (RENAME) TECHNICAL DOMAIN
         ══════════════════════════════════════════════════════ */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden my-auto animate-scale-up">
            {/* Modal Header */}
            <div className="bg-white p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-purple-700 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {domainModalMode === 'edit' ? 'Rename Technical Domain' : 'Add New Technical Domain'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {domainModalMode === 'edit' ? 'Update domain name and description' : 'Create an additional technical domain in database'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDomainModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitDomain} className="p-5 sm:p-6 space-y-4">
              {domainModalMode === 'edit' && (
                <div className="p-3 rounded-xl bg-white border border-purple-200/80 text-[11px] text-purple-900 font-medium leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    Renaming this domain will keep all linked categories, courses, and student records intact. The updated name reflects everywhere automatically.
                  </span>
                </div>
              )}

              {/* Domain Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Domain Name <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g., DevOps & Cloud, AI & Robotics</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter technical domain name..."
                  value={domainForm.name}
                  onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Domain Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea
                  rows="3"
                  placeholder="Describe the technical track and learning specializations covered..."
                  value={domainForm.description}
                  onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDomainModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDomain}
                  className="bg-white px-6 py-2.5 text-sq-gradient font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition cursor-pointer disabled:opacity-50 border border-[#9333EA]"
                >
                  {submittingDomain ? 'Saving...' : domainModalMode === 'edit' ? 'Update Domain' : 'Save Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internship Students Add (Google Sheet) Modal */}
      <InternshipStudentsAddModal
        isOpen={internshipStudentModalOpen}
        onClose={() => setInternshipStudentModalOpen(false)}
        onSuccess={() => {
          fetchDomainData();
        }}
      />

    </div>
  );
}
