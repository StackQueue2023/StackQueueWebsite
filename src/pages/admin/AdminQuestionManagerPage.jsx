import React, { useState, useEffect } from 'react';
import {
  Code2,
  Plus,
  Search,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  Layers,
  FileCheck2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Filter,
  BarChart3,
  Award,
  Zap,
  Check,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  UserCheck,
  Sliders,
  Clock
} from 'lucide-react';
import interviewApi from '../../api/interviewApi';
import api from '../../api/client';
import SyllabusCoverageReport from '../../components/syllabus/SyllabusCoverageReport';
import QuestionEvaluationConfigModal from '../../components/workspaces/QuestionEvaluationConfigModal';

export default function AdminQuestionManagerPage() {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [dynamicDomains, setDynamicDomains] = useState([]);
  const [activeMainView, setActiveMainView] = useState('questions'); // 'questions' | 'coverage' | 'student-results'

  // Filters
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'coding' | 'mcq'
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Evaluation Engine Config Modal State
  const [evalConfigModalOpen, setEvalConfigModalOpen] = useState(false);
  const [evalConfigQuestion, setEvalConfigQuestion] = useState(null);

  // Pending Reviews View State
  const [pendingReviewsList, setPendingReviewsList] = useState([]);
  const [loadingPendingReviews, setLoadingPendingReviews] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedSubmissionForOverride, setSelectedSubmissionForOverride] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('Passed');
  const [overrideMarks, setOverrideMarks] = useState(10);
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Generator Modal State
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [selectedCourseForGen, setSelectedCourseForGen] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);

  // Student Results View State
  const [studentResultsList, setStudentResultsList] = useState([]);
  const [studentResultsSummary, setStudentResultsSummary] = useState(null);
  const [loadingStudentResults, setLoadingStudentResults] = useState(false);

  // Edit / Create Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Programming Basics',
    domain: 'java',
    targetFeature: 'INTERVIEW_ARENA',
    questionType: 'coding', // 'coding' | 'mcq'
    level: 1,
    difficulty: 'Easy',
    points: 10,
    xp: 10,
    problemStatement: '',
    // MCQ fields
    options: [
      { optionId: 'A', text: '' },
      { optionId: 'B', text: '' },
      { optionId: 'C', text: '' },
      { optionId: 'D', text: '' }
    ],
    correctAnswer: 'A',
    explanation: '',
    // Coding fields
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    referenceSolution: '',
    programmingLanguage: 'java',
    compiler: 'Java (JDK 22)',
    starterCode: {
      javascript: '// Write JS solution\nfunction solution(n) {\n  \n}',
      python: '# Write Python solution\ndef solution(n):\n    pass',
      java: '// Write Java solution\npublic class Solution {\n    \n}'
    },
    hints: ['', '', ''],
    tags: []
  });

  // Test Case Management inside Edit Modal
  const [testCases, setTestCases] = useState([]);
  const [newTestCase, setNewTestCase] = useState({
    input: '',
    expectedOutput: '',
    isHidden: false,
    explanation: ''
  });

  useEffect(() => {
    loadData();
    loadDomains();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/admin/domain-management/courses');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setCoursesList(res.data.data);
        if (res.data.data.length > 0 && !selectedCourseForGen) {
          setSelectedCourseForGen(res.data.data[0]._id);
        }
      }
    } catch (e) {
      console.error('Failed to load courses for generator:', e);
    }
  };

  const loadStudentResults = async () => {
    try {
      setLoadingStudentResults(true);
      const res = await api.get('/adaptive-questions/admin/student-results');
      if (res.data?.success) {
        setStudentResultsList(res.data.submissions || []);
        setStudentResultsSummary(res.data.summary || null);
      }
    } catch (e) {
      console.error('Failed to load student results:', e);
    } finally {
      setLoadingStudentResults(false);
    }
  };

  const loadPendingReviews = async () => {
    try {
      setLoadingPendingReviews(true);
      const res = await api.get('/adaptive-questions/admin/pending-reviews');
      if (res.data?.success) {
        setPendingReviewsList(res.data.submissions || []);
      }
    } catch (e) {
      console.error('Failed to load pending reviews:', e);
    } finally {
      setLoadingPendingReviews(false);
    }
  };

  const handleSaveOverride = async () => {
    if (!overrideReason.trim()) {
      alert('Please enter a mandatory reason for this manual review override.');
      return;
    }
    try {
      setIsSubmittingOverride(true);
      const res = await api.post('/adaptive-questions/admin/override-review', {
        submissionId: selectedSubmissionForOverride._id,
        overrideStatus,
        overrideMarks: Number(overrideMarks),
        reason: overrideReason
      });
      if (res.data?.success) {
        alert(res.data.message);
        setOverrideModalOpen(false);
        loadPendingReviews();
      }
    } catch (e) {
      console.error('Failed to override review:', e);
      alert('Failed to override review.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const loadDomains = async () => {
    try {
      const res = await interviewApi.getDomains();
      if (res.data?.success && Array.isArray(res.data.domains)) {
        const map = new Map();
        res.data.domains.forEach(d => {
          const rawKey = d.key || d.title || '';
          const normKey = rawKey.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          if (!normKey) return;

          if (!map.has(normKey)) {
            map.set(normKey, {
              ...d,
              key: normKey,
              label: d.label || d.title || normKey.toUpperCase()
            });
          } else {
            const existing = map.get(normKey);
            existing.arenaQuestionsCount = (existing.arenaQuestionsCount || 0) + (d.arenaQuestionsCount || 0);
            existing.mockQuestionsCount = (existing.mockQuestionsCount || 0) + (d.mockQuestionsCount || 0);
            existing.moduleQuestionsCount = (existing.moduleQuestionsCount || 0) + (d.moduleQuestionsCount || 0);
            if (d.label && (!existing.label || d.label.length > existing.label.length)) {
              existing.label = d.label;
            }
          }
        });
        setDynamicDomains(Array.from(map.values()));
      }
    } catch (e) {
      console.error('Failed to load domains in admin manager:', e);
    }
  };

  const loadData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        interviewApi.getAdminQuestions(),
        interviewApi.getAdminStats().catch(() => ({ data: { data: null } }))
      ]);

      if (qRes.data?.success) {
        setQuestions(qRes.data.data);
      }
      if (sRes.data?.success) {
        setStats(sRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin interview data:', err);
    }
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setSelectedQuestion(null);
    setFormData({
      title: '',
      category: 'Programming Basics',
      domain: dynamicDomains[0]?.key || 'java',
      targetFeature: collectionFilter !== 'all' ? collectionFilter : 'INTERVIEW_ARENA',
      questionType: 'coding',
      level: 1,
      difficulty: 'Easy',
      points: 10,
      xp: 10,
      problemStatement: '',
      options: [
        { optionId: 'A', text: '' },
        { optionId: 'B', text: '' },
        { optionId: 'C', text: '' },
        { optionId: 'D', text: '' }
      ],
      correctAnswer: 'A',
      explanation: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      referenceSolution: '',
      programmingLanguage: 'java',
      compiler: 'Java (JDK 22)',
      starterCode: {
        javascript: '// Write JS solution\nfunction solution(n) {\n  \n}',
        python: '# Write Python solution\ndef solution(n):\n    pass',
        java: '// Write Java solution\npublic class Solution {\n    \n}'
      },
      hints: ['', '', ''],
      tags: []
    });
    setTestCases([]);
    setEditModalOpen(true);
  };

  const handleOpenEdit = async (q) => {
    setIsCreating(false);
    setSelectedQuestion(q);
    try {
      const res = await interviewApi.getAdminQuestionById(q._id);
      if (res.data?.success) {
        const fullQ = res.data.data;
        const qType = fullQ.questionType || (fullQ.options && fullQ.options.length > 0 ? 'mcq' : 'coding');

        setFormData({
          title: fullQ.title,
          category: fullQ.category || 'General',
          domain: (fullQ.domain || 'java').toLowerCase(),
          targetFeature: fullQ.targetFeature || 'INTERVIEW_ARENA',
          questionType: qType,
          level: fullQ.level || 1,
          difficulty: fullQ.difficulty || 'Easy',
          points: fullQ.points || fullQ.xp || 10,
          xp: fullQ.xp || fullQ.points || 10,
          problemStatement: fullQ.problemStatement,
          options: (fullQ.options && fullQ.options.length === 4) ? fullQ.options : [
            { optionId: 'A', text: '' },
            { optionId: 'B', text: '' },
            { optionId: 'C', text: '' },
            { optionId: 'D', text: '' }
          ],
          correctAnswer: fullQ.correctAnswer || 'A',
          explanation: fullQ.explanation || '',
          inputFormat: fullQ.inputFormat || '',
          outputFormat: fullQ.outputFormat || '',
          constraints: fullQ.constraints || '',
          referenceSolution: fullQ.referenceSolution || '',
          programmingLanguage: fullQ.programmingLanguage || 'java',
          compiler: fullQ.compiler || 'Java (JDK 22)',
          starterCode: fullQ.starterCode || { javascript: '', python: '', java: '' },
          hints: fullQ.hints || ['', '', ''],
          tags: fullQ.tags || []
        });
        setTestCases(fullQ.testCases || []);
        setEditModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load question details for editing');
    }
  };

  const handleOpenPreview = (q) => {
    setPreviewQuestion(q);
    setPreviewModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (formData.questionType === 'mcq') {
        const res = await api.post('/adaptive-questions/admin/questions', {
          _id: isCreating ? undefined : selectedQuestion?._id,
          ...formData
        });
        if (res.data?.success) {
          alert(res.data.message || 'MCQ saved successfully!');
          setEditModalOpen(false);
          loadData();
        }
      } else {
        if (isCreating) {
          const res = await interviewApi.createQuestion({
            ...formData,
            testCases
          });
          if (res.data?.success) {
            alert('Coding question created successfully!');
            setEditModalOpen(false);
            loadData();
          }
        } else {
          const res = await interviewApi.updateQuestion(selectedQuestion._id, formData);
          if (res.data?.success) {
            alert('Coding question updated successfully!');
            setEditModalOpen(false);
            loadData();
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Are you sure you want to delete this question and all its test cases?')) {
      try {
        await interviewApi.deleteQuestion(id);
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      } catch (err) {
        alert('Failed to delete question');
      }
    }
  };

  const handleTriggerGenerator = async () => {
    if (!selectedCourseForGen) {
      alert('Please select a course to generate questions for.');
      return;
    }
    try {
      setGeneratingQuestions(true);
      setGenerationResult(null);
      const res = await api.post(`/adaptive-questions/admin/courses/${selectedCourseForGen}/generate`, { force: true });
      if (res.data?.success) {
        setGenerationResult(res.data.data);
        loadData();
      }
    } catch (err) {
      alert('Generation error: ' + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAddTestCase = async () => {
    if (!newTestCase.input.trim() && !newTestCase.expectedOutput.trim()) {
      alert('Please fill out input and expected output');
      return;
    }

    if (isCreating) {
      setTestCases((prev) => [...prev, newTestCase]);
      setNewTestCase({ input: '', expectedOutput: '', isHidden: false, explanation: '' });
      return;
    }

    try {
      const res = await interviewApi.addTestCase(selectedQuestion._id, newTestCase);
      if (res.data?.success) {
        setTestCases((prev) => [...prev, res.data.data]);
        setNewTestCase({ input: '', expectedOutput: '', isHidden: false, explanation: '' });
      }
    } catch (err) {
      alert('Failed to add test case');
    }
  };

  const handleDeleteTestCase = async (tcId, idx) => {
    if (isCreating) {
      setTestCases((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    if (window.confirm('Delete this test case?')) {
      try {
        await interviewApi.deleteTestCase(selectedQuestion._id, tcId);
        setTestCases((prev) => prev.filter((t) => t._id !== tcId));
      } catch (err) {
        alert('Failed to delete test case');
      }
    }
  };

  // Filter list
  const filtered = questions.filter((q) => {
    const qType = q.questionType || (q.options && q.options.length > 0 ? 'mcq' : 'coding');
    const matchesFormat = formatFilter === 'all' || qType === formatFilter;
    const matchesDomain = domainFilter === 'all' || 
      (q.domain || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '') === domainFilter.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const matchesCollection = collectionFilter === 'all' || q.targetFeature === collectionFilter;
    const matchesStatus = statusFilter === 'all' || q.verificationStatus === statusFilter;
    const matchesLevel = levelFilter === 'all' || q.level === Number(levelFilter);
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesSearch =
      !search ||
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.questionNumber?.toString().includes(search) ||
      (q.domain && q.domain.toLowerCase().includes(search.toLowerCase())) ||
      (q.category && q.category.toLowerCase().includes(search.toLowerCase()));

    return matchesFormat && matchesDomain && matchesCollection && matchesStatus && matchesLevel && matchesDiff && matchesSearch;
  });

  const selectedCourseObj = coursesList.find(c => c._id === selectedCourseForGen);
  const isCompilerCourse = selectedCourseObj ? !(
    (selectedCourseObj.title || '').toLowerCase().includes('ui') ||
    (selectedCourseObj.domain || '').toLowerCase().includes('design') ||
    selectedCourseObj.hasCompiler === false
  ) : true;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white inline-flex items-center space-x-1.5 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
              Adaptive Question CMS
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Adaptive Questions & Assessment Manager</h1>
          <p className="text-xs text-slate-500">
            Intelligently configures practical Coding vs 4-Option MCQs based on course compiler availability, student points, and immediate evaluation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setGeneratorModalOpen(true)}
            className="bg-white flex items-center space-x-2 px-4 py-2.5 text-indigo-700 rounded-xl text-xs font-bold transition shadow-sm border border-indigo-200 hover:bg-indigo-50/50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Generate Course Questions</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-purple-600 hover:bg-purple-700 flex items-center space-x-2 px-5 py-2.5 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Question Bank Ledger vs. Syllabus Coverage vs Student Performance */}
      <div className="flex items-center space-x-2 border-b border-purple-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveMainView('questions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMainView === 'questions'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Question Bank Ledger ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainView('student-results');
            loadStudentResults();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMainView === 'student-results'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Student Performance & Points</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainView('coverage')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMainView === 'coverage'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Syllabus Coverage Report</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainView('pending-reviews');
            loadPendingReviews();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMainView === 'pending-reviews'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Instructor Review Queue ({pendingReviewsList.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW 1: QUESTION BANK LEDGER (CODING & MCQ FILTERABLE)
          ───────────────────────────────────────────────────────────── */}
      {activeMainView === 'questions' && (
        <>
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by title, #ID, domain, or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Format Filter Tabs (All / Coding / MCQ) */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormatFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    formatFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Formats
                </button>
                <button
                  type="button"
                  onClick={() => setFormatFilter('coding')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    formatFilter === 'coding' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Coding Problems
                </button>
                <button
                  type="button"
                  onClick={() => setFormatFilter('mcq')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    formatFilter === 'mcq' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Multiple Choice (MCQ)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              {/* Domain Filter */}
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500 font-bold"
              >
                <option value="all">All Domains</option>
                {dynamicDomains.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>

              {/* Collection Filter */}
              <select
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Tracks</option>
                <option value="INTERVIEW_ARENA">Interview Arena</option>
                <option value="MOCK_INTERVIEW">Mock Interview</option>
                <option value="MODULE_QUESTIONS">Module Questions</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="tested">Sandbox Tested</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Table Header Count */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
            <div>
              Showing <span className="font-bold text-purple-700 font-mono text-sm">{filtered.length}</span> question{filtered.length === 1 ? '' : 's'}
              {formatFilter !== 'all' && (
                <span className="ml-1 text-slate-500">
                  filtered by <strong className="text-purple-700 font-bold">{formatFilter === 'mcq' ? 'Multiple Choice (MCQ)' : 'Coding Problems'}</strong>
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Database: MongoDB <span className="text-purple-600 font-bold">InterviewQuestion</span>
            </div>
          </div>

          {/* Questions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Title & Domain</th>
                    <th className="py-3.5 px-4">Format / Type</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Points</th>
                    <th className="py-3.5 px-4">Specification</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span>No questions match the selected filters.</span>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q) => {
                      const isQMcq = q.questionType === 'mcq' || (q.options && q.options.length > 0);
                      const tc = q.testCaseStats || { totalTests: 0, visibleTests: 0, hiddenTests: 0 };

                      return (
                        <tr key={q._id} className="hover:bg-slate-50/60 transition group">
                          <td className="py-3.5 px-4 font-bold text-purple-600">
                            Q{q.questionNumber}
                          </td>
                          <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 max-w-xs">
                            <div className="truncate font-bold group-hover:text-purple-700 transition">{q.title}</div>
                            <div className="flex items-center space-x-1.5 mt-0.5 font-mono text-[10px] text-slate-400">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase">
                                {q.domain || 'general'}
                              </span>
                              <span>•</span>
                              <span>{q.topic || q.category}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-sans">
                            {isQMcq ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                4-Option MCQ
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Coding Problem
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                                q.difficulty === 'Easy' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                q.difficulty === 'Medium' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                'text-rose-700 bg-rose-50 border-rose-200'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {q.points || q.xp || 10} pts
                          </td>
                          <td className="py-3.5 px-4 text-[11px] font-sans">
                            {isQMcq ? (
                              <span className="text-purple-600 font-bold flex items-center space-x-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Correct: Option {q.correctAnswer || 'A'}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono">
                                {tc.visibleTests || 1} vis / {tc.hiddenTests || 2} hid tests
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenPreview(q)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                                title="Preview Question & Options"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEvalConfigQuestion(q);
                                  setEvalConfigModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition"
                                title="Configure Answer Evaluation Engine & Test Battery"
                              >
                                <Sliders className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(q)}
                                className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition"
                                title="Edit Question"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q._id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                                title="Delete Question"
                              >
                                <Trash2 className="w-4 h-4" />
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
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 2: STUDENT PERFORMANCE & POINTS RESULTS
          ───────────────────────────────────────────────────────────── */}
      {activeMainView === 'student-results' && (
        <div className="space-y-6">
          {/* Performance KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Submissions</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{studentResultsSummary?.total || 0}</p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Correct Answers</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{studentResultsSummary?.correct || 0}</p>
            </div>
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Wrong Answers</span>
              <p className="text-2xl font-black text-rose-800 mt-1">{studentResultsSummary?.wrong || 0}</p>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-700 uppercase">Overall Accuracy</span>
              <p className="text-2xl font-black text-indigo-800 mt-1">{studentResultsSummary?.accuracyPercent || 0}%</p>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Student Question Evaluation Ledger</h3>
              <button
                onClick={loadStudentResults}
                className="text-xs text-indigo-600 font-bold flex items-center space-x-1 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Ledger</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Question</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Answer / Code</th>
                    <th className="py-3 px-4 text-center">Result</th>
                    <th className="py-3 px-4 text-right">Points Won</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {loadingStudentResults ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading student submission records...</span>
                      </td>
                    </tr>
                  ) : studentResultsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span>No student evaluation records recorded yet.</span>
                      </td>
                    </tr>
                  ) : (
                    studentResultsList.map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          <div>{sub.studentId?.name || 'Student'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.studentId?.email}</div>
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold text-slate-700">
                          {sub.courseId?.title || 'Course'}
                        </td>
                        <td className="py-3 px-4 font-sans max-w-xs truncate">
                          {sub.questionId?.title || 'Question'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 uppercase">
                            {sub.questionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-700">
                          {sub.questionType === 'mcq' ? `Option ${sub.selectedOption}` : 'Source Code'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {sub.isCorrect ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Correct
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Wrong
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {sub.isCorrect ? `+${sub.pointsAwarded}` : '0'} pts
                        </td>
                        <td className="py-3 px-4 text-right text-[11px] text-slate-400">
                          {new Date(sub.evaluatedAt || sub.createdAt).toLocaleDateString()}
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

      {/* ─────────────────────────────────────────────────────────────
          VIEW 3: SYLLABUS COVERAGE REPORT
          ───────────────────────────────────────────────────────────── */}
      {activeMainView === 'coverage' && (
        <SyllabusCoverageReport />
      )}

      {/* ─────────────────────────────────────────────────────────────
          VIEW 4: INSTRUCTOR REVIEW QUEUE & MANUAL OVERRIDES
          ───────────────────────────────────────────────────────────── */}
      {activeMainView === 'pending-reviews' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Instructor Review Queue</h2>
              <p className="text-xs text-slate-500">Student submissions flagged for manual evaluation, rubric review, and score overrides</p>
            </div>
            <button
              onClick={loadPendingReviews}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPendingReviews ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingPendingReviews ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading pending reviews...</div>
          ) : pendingReviewsList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">All submissions evaluated!</p>
              <p className="text-slate-400">There are no pending submissions requiring instructor review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviewsList.map((sub) => (
                <div key={sub._id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{sub.studentId?.name || 'Student'}</span>
                      <span className="text-slate-400 ml-2">({sub.studentId?.email})</span>
                      <span className="text-slate-500 block font-mono text-[11px] mt-0.5">
                        Question: {sub.questionId?.title || 'Assessment Question'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 text-[10px]">
                        Pending Review
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSubmissionForOverride(sub);
                          setOverrideMarks(sub.questionId?.maxMarks || 10);
                          setOverrideStatus('Passed');
                          setOverrideReason('');
                          setOverrideModalOpen(true);
                        }}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-sm cursor-pointer"
                      >
                        Review & Override
                      </button>
                    </div>
                  </div>

                  {/* Student Answer */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Student's Submitted Answer:</span>
                    <p className="text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                      {sub.submittedAnswer || JSON.stringify(sub.scenarioResponse || sub.stateData, null, 2)}
                    </p>
                  </div>

                  {/* Evaluation Evidence & Missing Requirements */}
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Automated Score: {sub.percentage || 0}%
                    </span>
                    {sub.missingConcepts && sub.missingConcepts.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                        Missing: {sub.missingConcepts.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: MCQ PREVIEW MODAL (WITH 4 OPTIONS & ADMIN EXPLANATION)
          ───────────────────────────────────────────────────────────── */}
      {previewModalOpen && previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                  {previewQuestion.questionType === 'mcq' ? 'MCQ Question (4 Options)' : 'Coding Problem'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{previewQuestion.title}</h3>
                <p className="text-xs text-slate-500 font-mono">Q#{previewQuestion.questionNumber} • {previewQuestion.domain} • {previewQuestion.difficulty} • {previewQuestion.points || 10} Points</p>
              </div>

              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Problem Statement */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question Statement</span>
              <p className="text-sm text-slate-800 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/60 whitespace-pre-line">
                {previewQuestion.problemStatement}
              </p>
            </div>

            {/* Exactly 4 Options Display */}
            {previewQuestion.questionType === 'mcq' && previewQuestion.options && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Four Options</span>
                <div className="space-y-2">
                  {previewQuestion.options.map((opt) => {
                    const isRight = (opt.optionId === previewQuestion.correctAnswer);
                    return (
                      <div
                        key={opt.optionId}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                          isRight
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isRight ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {opt.optionId}
                          </span>
                          <span className="text-xs font-semibold">{opt.text}</span>
                        </div>

                        {isRight && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Correct Answer</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Admin Explanation */}
            {previewQuestion.explanation && (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-1 text-xs">
                <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Explanation (Stored for Admin Review Only)</span>
                </span>
                <p className="text-amber-950 font-medium leading-relaxed">
                  {previewQuestion.explanation}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADAPTIVE COURSE QUESTION GENERATOR
          ───────────────────────────────────────────────────────────── */}
      {generatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Adaptive Course Question Generator</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Automatically checks the course compiler and chooses between Coding or 4-Option MCQs.
                </p>
              </div>

              <button
                onClick={() => setGeneratorModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Target Course:
                </label>
                <select
                  value={selectedCourseForGen}
                  onChange={(e) => {
                    setSelectedCourseForGen(e.target.value);
                    setGenerationResult(null);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.domain || c.category || 'Domain'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Automatic Detection Feedback Banner */}
              <div className={`p-4 rounded-2xl border text-xs font-medium space-y-1.5 ${
                isCompilerCourse ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' : 'bg-purple-50/70 border-purple-200 text-purple-900'
              }`}>
                <span className="font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Configured Execution Environment Detected</span>
                </span>
                <p className="font-bold text-sm">
                  {isCompilerCourse ? 'Case A: Working Code Compiler Available' : 'Case B: No Compiler Required (MCQ Assessment)'}
                </p>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  {isCompilerCourse
                    ? 'Generates practical coding problems with test cases, constraints, and verified reference solutions.'
                    : 'Generates four-option multiple-choice questions (A, B, C, D) strictly aligned with the syllabus.'}
                </p>
              </div>

              {/* Result Feedback */}
              {generationResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <p className="font-bold text-sm flex items-center space-x-1.5 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Generation Complete!</span>
                  </p>
                  <p>Generated {generationResult.generatedCount} questions for course "{generationResult.courseTitle}".</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setGeneratorModalOpen(false)}
                className="px-4 py-2.5 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={generatingQuestions}
                onClick={handleTriggerGenerator}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              >
                {generatingQuestions ? 'Generating Questions...' : 'Run Generation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EDIT / CREATE MODAL (SUPPORTS BOTH MCQ & CODING)
          ───────────────────────────────────────────────────────────── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isCreating ? 'Create New Question' : `Edit Question #${selectedQuestion?.questionNumber}`}
                  </h3>
                  <p className="text-xs text-slate-500">Configure question format, 4 options, test cases, and point rewards.</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveQuestion} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Question Format Selector (Coding Problem vs MCQ) */}
              <div>
                <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-2">
                  Question Format:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, questionType: 'coding' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center space-x-2.5 ${
                      formData.questionType === 'coding' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-bold block text-slate-900">Practical Coding Problem</span>
                      <span className="text-[10px] text-slate-400">Compiler code editor & test cases</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, questionType: 'mcq' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-center space-x-2.5 ${
                      formData.questionType === 'mcq' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-bold block text-slate-900">Multiple-Choice Question (MCQ)</span>
                      <span className="text-[10px] text-slate-400">Exactly 4 options (A, B, C, D)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Title & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Question Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Design Thinking Principles"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Topic / Syllabus Module</label>
                  <input
                    type="text"
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    placeholder="e.g. User Research"
                  />
                </div>
              </div>

              {/* Difficulty & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Point Value (Awarded on Correct)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) || 10 })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Domain</label>
                  <select
                    value={formData.domain || 'java'}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold uppercase focus:outline-none focus:border-purple-500"
                  >
                    {dynamicDomains.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Question / Problem Statement
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.problemStatement}
                  onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
                  placeholder="Enter the complete question statement..."
                />
              </div>

              {/* ─────────────────────────────────────────────────────────
                  FIELDS FOR MCQ (EXACTLY FOUR OPTIONS + CORRECT ANSWER)
                  ───────────────────────────────────────────────────────── */}
              {formData.questionType === 'mcq' ? (
                <div className="space-y-4 bg-purple-50/40 p-4 rounded-2xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                      Configure Exactly Four Options (A, B, C, D)
                    </span>
                    <span className="text-[10px] text-purple-700 font-bold font-mono">
                      Active Correct Key: Option {formData.correctAnswer}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((optId, idx) => {
                      const isCorrect = (formData.correctAnswer === optId);

                      return (
                        <div key={optId} className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, correctAnswer: optId })}
                            className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center transition shrink-0 cursor-pointer ${
                              isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-400'
                            }`}
                            title={`Click to mark Option ${optId} as correct answer`}
                          >
                            {optId}
                          </button>

                          <input
                            type="text"
                            required
                            placeholder={`Enter text for Option ${optId}...`}
                            value={formData.options?.[idx]?.text || ''}
                            onChange={(e) => {
                              const newOpts = [...(formData.options || [])];
                              newOpts[idx] = { optionId: optId, text: e.target.value };
                              setFormData({ ...formData, options: newOpts });
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                          />

                          {isCorrect && (
                            <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                              ✓ Correct
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Admin Explanation Field */}
                  <div className="pt-2">
                    <label className="block text-slate-700 font-semibold mb-1">
                      Explanation (Stored for Admin Review Only - Never Shown to Students on Wrong Answer)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      placeholder="Explain the theoretical or practical reasoning for why this answer is correct..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ) : (
                /* ─────────────────────────────────────────────────────────
                    FIELDS FOR CODING PROBLEMS (INPUT/OUTPUT & STARTER CODE)
                    ───────────────────────────────────────────────────────── */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Input Format</label>
                      <input
                        type="text"
                        value={formData.inputFormat}
                        onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Output Format</label>
                      <input
                        type="text"
                        value={formData.outputFormat}
                        onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Test Cases */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800 block">Test Cases ({testCases.length})</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Sample Input..."
                        value={newTestCase.input}
                        onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output..."
                        value={newTestCase.expectedOutput}
                        onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      + Add Test Case
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end items-center space-x-3 shrink-0 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          MODAL: INSTRUCTOR MANUAL OVERRIDE DIALOG
          ───────────────────────────────────────────────────────────── */}
      {overrideModalOpen && selectedSubmissionForOverride && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Manual Evaluation Override</h3>
              <button onClick={() => setOverrideModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Override Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="Passed">Passed (Award Completion Points)</option>
                  <option value="Partially Correct">Partially Correct</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Awarded Marks</label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmissionForOverride.questionId?.maxMarks || 20}
                  value={overrideMarks}
                  onChange={(e) => setOverrideMarks(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mandatory Override Reason (Required for Audit History)
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State the justification for this score override..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOverride}
                disabled={isSubmittingOverride || !overrideReason.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs disabled:opacity-50"
              >
                {isSubmittingOverride ? 'Saving...' : 'Confirm Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: NON-CODING EVALUATION ENGINE CONFIGURATION & TEST BATTERY
          ───────────────────────────────────────────────────────────── */}
      {evalConfigModalOpen && evalConfigQuestion && (
        <QuestionEvaluationConfigModal
          question={evalConfigQuestion}
          isOpen={evalConfigModalOpen}
          onClose={() => setEvalConfigModalOpen(false)}
          onSaved={() => {
            loadQuestions();
          }}
        />
      )}
    </div>
  );
}
