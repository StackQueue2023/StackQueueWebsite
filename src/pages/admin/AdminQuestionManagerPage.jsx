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
  FileCheck2
} from 'lucide-react';
import interviewApi from '../../api/interviewApi';
import SyllabusCoverageReport from '../../components/syllabus/SyllabusCoverageReport';

export default function AdminQuestionManagerPage() {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [dynamicDomains, setDynamicDomains] = useState([]);
  const [activeMainView, setActiveMainView] = useState('questions'); // 'questions' | 'coverage'

  // Filters
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Edit / Create Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Programming Basics',
    domain: 'java',
    targetFeature: 'INTERVIEW_ARENA',
    questionType: 'coding',
    level: 1,
    difficulty: 'Easy',
    xp: 10,
    problemStatement: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
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
  }, []);

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
      xp: 10,
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
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
        setFormData({
          title: fullQ.title,
          category: fullQ.category,
          domain: (fullQ.domain || 'java').toLowerCase(),
          targetFeature: fullQ.targetFeature || 'INTERVIEW_ARENA',
          level: fullQ.level,
          difficulty: fullQ.difficulty,
          xp: fullQ.xp,
          problemStatement: fullQ.problemStatement,
          inputFormat: fullQ.inputFormat || '',
          outputFormat: fullQ.outputFormat || '',
          constraints: fullQ.constraints || '',
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

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (isCreating) {
        const res = await interviewApi.createQuestion({
          ...formData,
          testCases
        });
        if (res.data?.success) {
          alert('Question created successfully!');
          setEditModalOpen(false);
          loadData();
        }
      } else {
        const res = await interviewApi.updateQuestion(selectedQuestion._id, formData);
        if (res.data?.success) {
          alert('Question updated successfully!');
          setEditModalOpen(false);
          loadData();
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
        await interviewApi.deleteTestCase(tcId);
        setTestCases((prev) => prev.filter((t) => t._id !== tcId));
      } catch (err) {
        alert('Failed to delete test case');
      }
    }
  };

  // Filter list
  const filtered = questions.filter((q) => {
    const matchesDomain = domainFilter === 'all' || 
      (q.domain || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '') === domainFilter.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const matchesCollection = collectionFilter === 'all' || q.targetFeature === collectionFilter;
    const matchesStatus = statusFilter === 'all' || q.verificationStatus === statusFilter;
    const matchesLevel = levelFilter === 'all' || q.level === Number(levelFilter);
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.questionNumber.toString().includes(search) ||
      (q.domain && q.domain.toLowerCase().includes(search.toLowerCase())) ||
      (q.category && q.category.toLowerCase().includes(search.toLowerCase()));

    return matchesDomain && matchesCollection && matchesStatus && matchesLevel && matchesDiff && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
              Admin CMS
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">Interview Questions Manager</h1>
          <p className="text-xs text-slate-500">
            Manage, verify, edit, and inspect domain-specific questions across Interview Arena, Mock Interview, and Module Questions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* View Switcher: Question Bank Ledger vs. Syllabus Coverage Report */}
      <div className="flex items-center space-x-2 border-b border-purple-100 pb-3">
        <button
          type="button"
          onClick={() => setActiveMainView('questions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMainView === 'questions'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Question Bank Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainView('coverage')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMainView === 'coverage'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Syllabus Coverage Report</span>
        </button>
      </div>

      {activeMainView === 'coverage' ? (
        <SyllabusCoverageReport />
      ) : (
        <>
          {/* Synchronized Track & Question Bank Stats Cards */}
      {stats && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Interview Arena Card */}
            <button
              type="button"
              onClick={() => setCollectionFilter(collectionFilter === 'INTERVIEW_ARENA' ? 'all' : 'INTERVIEW_ARENA')}
              className={`bg-white border rounded-2xl p-4 text-left transition hover:shadow-md cursor-pointer ${
                collectionFilter === 'INTERVIEW_ARENA' ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/20' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  1. Arena
                </span>
                <span className="text-[10px] text-purple-600 font-sans font-medium">
                  {collectionFilter === 'INTERVIEW_ARENA' ? 'Active Filter' : 'Click to Filter'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {stats.arenaCount ?? questions.filter(q => q.targetFeature === 'INTERVIEW_ARENA').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Interview Arena Qs</div>
            </button>

            {/* Mock Interview Card */}
            <button
              type="button"
              onClick={() => setCollectionFilter(collectionFilter === 'MOCK_INTERVIEW' ? 'all' : 'MOCK_INTERVIEW')}
              className={`bg-white border rounded-2xl p-4 text-left transition hover:shadow-md cursor-pointer ${
                collectionFilter === 'MOCK_INTERVIEW' ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/20' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  2. Mock
                </span>
                <span className="text-[10px] text-purple-600 font-sans font-medium">
                  {collectionFilter === 'MOCK_INTERVIEW' ? 'Active Filter' : 'Click to Filter'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {stats.mockCount ?? questions.filter(q => q.targetFeature === 'MOCK_INTERVIEW').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Mock Interview Qs</div>
            </button>

            {/* Module Questions Card */}
            <button
              type="button"
              onClick={() => setCollectionFilter(collectionFilter === 'MODULE_QUESTIONS' ? 'all' : 'MODULE_QUESTIONS')}
              className={`bg-white border rounded-2xl p-4 text-left transition hover:shadow-md cursor-pointer ${
                collectionFilter === 'MODULE_QUESTIONS' ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/20' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  3. Module
                </span>
                <span className="text-[10px] text-purple-600 font-sans font-medium">
                  {collectionFilter === 'MODULE_QUESTIONS' ? 'Active Filter' : 'Click to Filter'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {stats.moduleCount ?? questions.filter(q => q.targetFeature === 'MODULE_QUESTIONS').length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Module Questions</div>
            </button>

            {/* Total Questions Card */}
            <button
              type="button"
              onClick={() => setCollectionFilter('all')}
              className={`bg-white border rounded-2xl p-4 text-left transition hover:shadow-md cursor-pointer ${
                collectionFilter === 'all' ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/20' : 'border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  All Tracks
                </span>
                <span className="text-[10px] text-slate-500 font-sans font-medium">
                  {collectionFilter === 'all' ? 'All Selected' : 'Show All'}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-2">
                {stats.totalQuestions ?? questions.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">Total Question Records</div>
            </button>
          </div>

          {/* Test Metrics & Platform Question Bank Scope */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-slate-500">
                Total Test Cases: <strong className="text-purple-700 font-mono font-bold">{stats.totalTestCases}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Submissions Tested: <strong className="text-amber-700 font-mono font-bold">{stats.totalSubmissions}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Pass Rate: <strong className="text-emerald-700 font-mono font-bold">{stats.passRate}%</strong>
              </span>
            </div>
            {stats.gameHubCount !== undefined && stats.testingPracticeCount !== undefined && (
              <div className="text-[11px] text-slate-500 font-mono">
                Platform AI Bank: Game Hub (<span className="font-bold text-slate-700">{stats.gameHubCount}</span>) • Practice (<span className="font-bold text-slate-700">{stats.testingPracticeCount}</span>) • Overall (<span className="font-bold text-purple-700">{stats.overallQuestions || 1236}</span>)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title, domain, category, #..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter (Dynamic from DB) */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white cursor-pointer font-bold"
          >
            <option value="all">All Domains</option>
            {dynamicDomains.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label} ({d.arenaQuestionsCount + (d.mockQuestionsCount || 0) + (d.moduleQuestionsCount || 0)} Qs)
              </option>
            ))}
          </select>

          {/* Collection Filter */}
          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white cursor-pointer"
          >
            <option value="all">All Collections</option>
            <option value="INTERVIEW_ARENA">Interview Arena</option>
            <option value="MOCK_INTERVIEW">Mock Interview</option>
            <option value="MODULE_QUESTIONS">Module Questions</option>
            <option value="TESTING_PRACTICE">Testing Practice</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="tested">Sandbox Tested</option>
            <option value="flagged">Flagged</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table Result Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="text-xs font-semibold text-slate-700">
          Showing <span className="font-bold text-purple-700 font-mono text-sm">{filtered.length}</span> question{filtered.length === 1 ? '' : 's'}
          {collectionFilter !== 'all' ? (
            <span className="ml-1 text-slate-600 font-normal">
              in track <strong className="text-purple-700 font-bold">{collectionFilter === 'INTERVIEW_ARENA' ? 'Interview Arena' : collectionFilter === 'MOCK_INTERVIEW' ? 'Mock Interview' : 'Module Questions'}</strong>
            </span>
          ) : (
            <span className="ml-1 text-slate-500 font-normal">across all tracks</span>
          )}
          {domainFilter !== 'all' && (
            <span className="ml-1 text-slate-500 font-normal">
              for domain <strong className="text-slate-800 uppercase font-mono">{domainFilter}</strong>
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Single Source of Truth: MongoDB <span className="text-purple-600 font-bold">InterviewQuestion</span>
        </div>
      </div>

      {/* Question Management Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Title & Domain</th>
                <th className="py-3.5 px-4">Target Track</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Test Cases</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {filtered.map((q) => {
                const tc = q.testCaseStats || { totalTests: 0, visibleTests: 0, hiddenTests: 0 };

                return (
                  <tr key={q._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-purple-600">
                      Q{q.questionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 max-w-xs">
                      <div className="truncate">{q.title}</div>
                      <div className="flex items-center space-x-1.5 mt-1 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold uppercase">
                          {q.domain || 'general'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{q.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {q.targetFeature === 'INTERVIEW_ARENA' ? 'Arena' : q.targetFeature === 'MOCK_INTERVIEW' ? 'Mock' : q.targetFeature === 'MODULE_QUESTIONS' ? 'Module' : q.targetFeature || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold border ${
                          q.difficulty === 'Easy'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : q.difficulty === 'Medium'
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-rose-700 bg-rose-50 border-rose-200'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-700 font-bold">{tc.visibleTests} vis</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-purple-600 font-bold">{tc.hiddenTests} hid</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.verificationStatus === 'tested' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {q.verificationStatus === 'tested' ? 'Verified' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(q)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition"
                          title="Edit Question & Tests"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Edit / Create Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="interview-question-modal bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[90vh] min-h-0 overflow-hidden text-slate-900">
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 bg-white">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {isCreating ? 'Create Interview Question' : `Edit Q${selectedQuestion?.questionNumber}: ${formData.title}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure question parameters, test cases, and starter code templates
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Body and Fixed Footer */}
            <form onSubmit={handleSaveQuestion} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="interview-question-modal-body flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-5 text-xs [overscroll-behavior-y:contain]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Level (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">XP Value</label>
                    <input
                      type="number"
                      value={formData.xp}
                      onChange={(e) => setFormData({ ...formData, xp: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Target Track (Collection)</label>
                    <select
                      value={formData.targetFeature || 'INTERVIEW_ARENA'}
                      onChange={(e) => setFormData({ ...formData, targetFeature: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition font-bold"
                    >
                      <option value="INTERVIEW_ARENA">Interview Arena (Default Track)</option>
                      <option value="MOCK_INTERVIEW">Mock Interview</option>
                      <option value="MODULE_QUESTIONS">Module Questions</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Assigning track dynamically reflects in the student portal & question bank dashboard.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Domain</label>
                    <select
                      value={formData.domain || 'java'}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition font-bold uppercase"
                    >
                      {dynamicDomains.length > 0 ? (
                        dynamicDomains.map((d) => (
                          <option key={d.key} value={d.key}>
                            {d.label} ({d.key})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="java">Java</option>
                          <option value="python">Python</option>
                        </>
                      )}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Enforces strict domain isolation for student arena loading.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Problem Statement</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.problemStatement}
                    onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition font-mono"
                  />
                </div>

                {/* Progressive Hints */}
                <div className="space-y-2">
                  <label className="block text-slate-700 font-semibold">
                    3 Progressive Hints (Conceptual only - No Code)
                  </label>
                  {formData.hints.map((hint, idx) => (
                    <input
                      key={idx}
                      type="text"
                      placeholder={`Hint ${idx + 1}...`}
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...formData.hints];
                        newHints[idx] = e.target.value;
                        setFormData({ ...formData, hints: newHints });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                    />
                  ))}
                </div>

                {/* Starter Code Fields */}
                <div className="space-y-3 pt-2">
                  <div className="font-semibold text-slate-800">Starter Code Templates:</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">JavaScript</label>
                      <textarea
                        rows={4}
                        value={formData.starterCode?.javascript || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            starterCode: { ...formData.starterCode, javascript: e.target.value }
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Python</label>
                      <textarea
                        rows={4}
                        value={formData.starterCode?.python || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            starterCode: { ...formData.starterCode, python: e.target.value }
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Java</label>
                      <textarea
                        rows={4}
                        value={formData.starterCode?.java || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            starterCode: { ...formData.starterCode, java: e.target.value }
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Cases Sub-Manager */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">
                      Test Cases ({testCases.length})
                    </div>
                  </div>

                  <div className="space-y-2">
                    {testCases.map((tc, idx) => (
                      <div
                        key={tc._id || idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400">#{idx + 1}</span>
                          {tc.isHidden ? (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              <Eye className="w-3 h-3" />
                              <span>Visible</span>
                            </span>
                          )}
                          <span className="text-slate-600">In: {tc.input}</span>
                          <span className="text-slate-400">➔</span>
                          <span className="text-emerald-700 font-semibold">Out: {tc.expectedOutput}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTestCase(tc._id, idx)}
                          className="text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Test Case Form */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-[11px] font-semibold text-slate-700">
                      Add New Test Case:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Input value (e.g. 4 or [2, 7, 11, 15])..."
                        value={newTestCase.input}
                        onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                        className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output (e.g. Even or [0, 1])..."
                        value={newTestCase.expectedOutput}
                        onChange={(e) =>
                          setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })
                        }
                        className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTestCase.isHidden}
                          onChange={(e) =>
                            setNewTestCase({ ...newTestCase, isHidden: e.target.checked })
                          }
                          className="rounded border-slate-300 text-purple-600 focus:ring-purple-400"
                        />
                        <span>Mark as Hidden Test Case (Strictly evaluated during submit)</span>
                      </label>

                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg font-semibold text-xs border border-slate-200 shadow-xs transition cursor-pointer"
                      >
                        + Add Test Case
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Fixed at bottom) */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex justify-end items-center space-x-3 shrink-0 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
