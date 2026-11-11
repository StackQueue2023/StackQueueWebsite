import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Lock,
  CheckCircle2,
  Calendar,
  Timer,
  BarChart3,
  Search,
  Sparkles,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import interviewApi from '../../api/interviewApi';
import api from '../../api/client';
import {
  getStudentAllowedDomains,
  isDomainAllowedForStudent,
  isQuestionInDomain,
  normalizeDomainKey
} from '../../utils/studentLanguages';

const DOMAIN_CONFIGS = [
  { key: 'all', title: 'All Domains', icon: '⚡', subtitle: 'Algorithmic & Domain Questions' },
  { key: 'java', title: 'Java Domain', icon: '☕', subtitle: 'Core Java, OOPs, Collections & Algorithms' },
  { key: 'python', title: 'Python Domain', icon: '🐍', subtitle: 'Pythonic Logic, Lists, Dicts & Scripts' },
  { key: 'cpp', title: 'C++ Domain', icon: '⚡', subtitle: 'C++ Basics, Pointers, Memory & Logic' },
  { key: 'javascript', title: 'JavaScript & Web', icon: '🌐', subtitle: 'JS Engine, Async, ES6+ & DOM Logic' },
  { key: 'dsa', title: 'Data Structures', icon: '🧠', subtitle: 'Arrays, Stacks, Trees, Graphs & DP' },
  { key: 'fullstack', title: 'Full Stack Track', icon: '🚀', subtitle: 'Full-Stack Architecture & API Logic' }
];

export default function ProgrammingGamesPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dynamicDomains, setDynamicDomains] = useState([]);
  const [studentDomain, setStudentDomain] = useState(null);
  const [needsDomainSelection, setNeedsDomainSelection] = useState(false);

  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [progressStats, setProgressStats] = useState(null);

  useEffect(() => {
    initPage();
  }, []);

  const getDomainIcon = (domKey = '') => {
    const k = domKey.toLowerCase();
    if (k.includes('java') && !k.includes('javascript')) return '☕';
    if (k.includes('python')) return '🐍';
    if (k.includes('cpp') || k.includes('c++') || k === 'c') return '⚡';
    if (k.includes('react') || k.includes('web') || k.includes('javascript')) return '🌐';
    if (k.includes('data') || k.includes('analytics')) return '📊';
    if (k.includes('cloud') || k.includes('aws') || k.includes('azure')) return '☁️';
    if (k.includes('cyber') || k.includes('security')) return '🛡️';
    if (k.includes('ai') || k.includes('intelligence') || k.includes('learning')) return '🤖';
    return '🎓';
  };

  const initPage = async () => {
    try {
      setLoading(true);
      const [domRes, dailyRes, progRes] = await Promise.all([
        interviewApi.getDomains().catch(() => ({ data: { success: false, domains: [] } })),
        interviewApi.getDailyChallenge().catch(() => ({ data: { data: null } })),
        interviewApi.getInterviewProgress().catch(() => ({ data: { data: null } }))
      ]);

      const domains = domRes.data?.domains || [];
      setDynamicDomains(domains);

      const assignedDom = domRes.data?.studentDomain || null;
      setStudentDomain(assignedDom);

      // Determine initial active domain
      let activeDom = assignedDom;
      if (!activeDom && domains.length > 0) {
        // Find domain with questions
        const withQ = domains.find(d => d.arenaQuestionsCount > 0);
        activeDom = withQ ? withQ.key : domains[0].key;
      }

      if (activeDom) {
        setSelectedDomain(activeDom);
        await loadQuestionsForDomain(activeDom);
      } else {
        setNeedsDomainSelection(true);
      }

      if (dailyRes.data?.data) {
        setDailyChallenge(dailyRes.data.data);
      }
      if (progRes.data?.data) {
        setProgressStats(progRes.data.data);
      }
    } catch (err) {
      console.error('Failed to init Programming Games page:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForDomain = async (domainKey) => {
    try {
      setLoading(true);
      const qRes = await interviewApi.getQuestions({ domain: domainKey });
      if (qRes.data?.needsDomainSelection) {
        setNeedsDomainSelection(true);
        setQuestions([]);
      } else {
        setNeedsDomainSelection(false);
        const list = qRes.data?.data || [];
        setQuestions(list);
      }
    } catch (err) {
      console.error('Failed to load domain questions:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDomain = async (domainKey) => {
    setSelectedDomain(domainKey);
    setNeedsDomainSelection(false);
    await loadQuestionsForDomain(domainKey);
    // Persist choice for student
    interviewApi.selectDomain({ domain: domainKey }).catch(() => {});
  };

  // Dynamic domain configurations loaded from database with strict deduplication & merged counts
  const displayDomains = useMemo(() => {
    const map = new Map();
    (dynamicDomains || []).forEach(d => {
      const rawKey = d.key || d.title || '';
      const normKey = rawKey.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (!normKey) return;

      const qCount = d.arenaQuestionsCount || d.count || 0;
      if (!map.has(normKey)) {
        map.set(normKey, {
          key: normKey,
          title: d.label || d.title || normKey.toUpperCase(),
          icon: getDomainIcon(normKey),
          count: qCount,
          category: d.category
        });
      } else {
        const existing = map.get(normKey);
        existing.count += qCount;
        // Prefer official or longer formatted title
        if (d.label && (!existing.title || d.label.length > existing.title.length)) {
          existing.title = d.label;
        }
      }
    });
    return Array.from(map.values());
  }, [dynamicDomains]);

  // Robust Filter Pipeline using useMemo
  const filteredQuestions = useMemo(() => {
    const list = questions.filter((q) => {
      // 1. Level Filter
      const matchesLevel =
        selectedLevel === 'all' ||
        String(q.level) === String(selectedLevel);

      // 2. Difficulty Filter
      const qDiff = (q.difficulty || 'Easy').toLowerCase();
      const matchesDiff =
        selectedDifficulty === 'all' ||
        qDiff === selectedDifficulty.toLowerCase();

      // 3. Category Filter
      const matchesCategory =
        selectedCategory === 'all' ||
        q.category === selectedCategory;

      // 4. Search Query Filter
      const qTitleStr = (q.title || '').toLowerCase();
      const qNumStr = (q.questionNumber || '').toString();
      const matchesSearch =
        !searchQuery ||
        qTitleStr.includes(searchQuery.toLowerCase()) ||
        qNumStr.includes(searchQuery) ||
        (q.tags && q.tags.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesLevel && matchesDiff && matchesCategory && matchesSearch;
    });

    if (selectedDifficulty === 'all') {
      const easyList = list.filter(q => (q.difficulty || 'Easy').toLowerCase() === 'easy');
      const medList = list.filter(q => (q.difficulty || 'Easy').toLowerCase() === 'medium');
      const hardList = list.filter(q => (q.difficulty || 'Easy').toLowerCase() === 'hard');
      const otherList = list.filter(q => {
        const d = (q.difficulty || 'Easy').toLowerCase();
        return d !== 'easy' && d !== 'medium' && d !== 'hard';
      });

      const mixed = [];
      const maxLen = Math.max(easyList.length, medList.length, hardList.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < easyList.length) mixed.push(easyList[i]);
        if (i < medList.length) mixed.push(medList[i]);
        if (i < hardList.length) mixed.push(hardList[i]);
      }
      mixed.push(...otherList);
      return mixed;
    }

    return list;
  }, [questions, selectedDomain, selectedLevel, selectedDifficulty, selectedCategory, searchQuery]);

  // Debug Logging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Interview Arena Debug]', {
        totalQuestionsInState: questions.length,
        selectedDomain,
        selectedDifficulty,
        selectedLevel,
        searchQuery,
        filteredQuestionsCount: filteredQuestions.length,
        sampleQuestion: questions[0] || null
      });
    }
  }, [questions, selectedDomain, selectedDifficulty, selectedLevel, searchQuery, filteredQuestions]);

  const totalSolved = questions.filter((q) => q.isSolved).length;

  const resetAllFilters = () => {
    setSelectedDomain('all');
    setSelectedLevel('all');
    setSelectedDifficulty('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-700 text-xs font-semibold">
              <Code2 className="w-3.5 h-3.5" />
              <span>{questions.length} Interview Challenges • 10 Progression Levels</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Programming Interview Arena
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Master essential coding interviews from fundamentals to advanced algorithmic design. Practice with real test cases in Java, Python, or JavaScript.
            </p>

            {/* Overall Progress Pills */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">
                  Solved: <strong className="text-emerald-600">{totalSolved}</strong> / {questions.length}
                </span>
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700">
                  Total XP: <strong className="text-amber-600">{progressStats?.progress?.totalInterviewXp || 0}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => navigate('/interview-game/interview-mode')}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-2xl shadow-md shadow-purple-500/20 transition group cursor-pointer"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-100">
                    Timed Challenge
                  </div>
                  <div className="text-sm font-bold">Start Mock Interview</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition ml-4" />
            </button>

            <button
              onClick={() => navigate('/interview-game/progress')}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl shadow-sm transition group"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Analytics</div>
                  <div className="text-sm font-bold text-slate-900">Mastery & Radar Stats</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition ml-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Challenge Spotlight Banner */}
      {dailyChallenge?.question && (
        <div
          onClick={() => navigate(`/interview-game/question/${dailyChallenge.question._id}`)}
          className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm cursor-pointer hover:border-amber-300 hover:shadow-md transition"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Daily Coding Challenge
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                  +20 Bonus XP
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Q{dailyChallenge.question.questionNumber}: {dailyChallenge.question.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {dailyChallenge.question.problemStatement}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/interview-game/question/${dailyChallenge.question._id}`);
            }}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition shrink-0 cursor-pointer"
          >
            <span>Solve Daily Question</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Domain Interview Roadmap Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Domain-Wise Interview Roadmaps</span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">
              (Select domain to view targeted Java, Python, or Full Stack interview questions)
            </span>
          </h2>
        </div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {displayDomains.map((d) => {
            const isSelected = selectedDomain && d.key && (
              selectedDomain === d.key ||
              selectedDomain.toLowerCase().replace(/[^a-z0-9]/g, '') === d.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            );

            return (
              <button
                key={d.key}
                onClick={() => handleSelectDomain(d.key)}
                title={d.title}
                className={`flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white border-purple-600 shadow-md ring-2 ring-purple-500/30 scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-purple-400 text-slate-700 hover:bg-purple-50/50 shadow-xs'
                }`}
              >
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{d.icon}</div>
                <div className="text-xs font-black tracking-tight">{d.title}</div>
                <div className={`text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {d.count} Qs
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Needs Domain Selection Notice */}
      {needsDomainSelection && (
        <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Select Your Domain Track to Start Practicing</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            StackQueue LMS generates domain-specific interview challenges tailored directly to your syllabus. Choose your learning track above to view your questions.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by domain, title, tags or #..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg capitalize transition ${
                  selectedDifficulty === d
                    ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {selectedDomain !== 'all' && (
            <button
              onClick={() => setSelectedDomain('all')}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs transition border border-purple-200 font-bold flex items-center gap-1"
            >
              Domain: {DOMAIN_CONFIGS.find(d => d.key === selectedDomain)?.title || selectedDomain} ✕
            </button>
          )}

          {selectedLevel !== 'all' && (
            <button
              onClick={() => setSelectedLevel('all')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition border border-slate-200 font-medium"
            >
              Reset Level Filter ✕
            </button>
          )}

          {(selectedDomain !== 'all' || selectedDifficulty !== 'all' || selectedLevel !== 'all' || searchQuery) && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions Grid & Contextual Empty States */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Loading interview challenges...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No interview questions exist in database</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please run database seeding or add interview questions via the Admin Dashboard.
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900">No questions match your current search or filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are {questions.length} total questions available. Try selecting "All Domains" or clearing search/difficulty filters.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 transition inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((q) => {
            // Section 3: Unlock all available domain courses in Interview Arena. Students must be able to select and practice any available domain.
            const isLocked = false;

            return (
              <div
                key={q._id}
                onClick={() => {
                  if (!isLocked) {
                    navigate(`/interview-game/question/${q._id}`);
                  }
                }}
                className={`group rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isLocked
                    ? 'bg-slate-50 border-slate-200/70 opacity-60 cursor-not-allowed'
                    : q.isSolved
                    ? 'bg-white hover:bg-emerald-50/20 border-emerald-300 hover:border-emerald-500 shadow-sm cursor-pointer'
                    : 'bg-white hover:bg-purple-50/20 border-slate-200/90 hover:border-purple-400 shadow-sm cursor-pointer'
                }`}
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">
                      Q{q.questionNumber}
                    </span>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {q.difficulty}
                      </span>

                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      ) : q.isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : null}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition line-clamp-1">
                    {q.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {q.problemStatement}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Level {q.level} • {q.category}
                  </span>

                  <div className="flex items-center space-x-1.5 text-amber-600 font-mono font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{q.xp || 10} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
