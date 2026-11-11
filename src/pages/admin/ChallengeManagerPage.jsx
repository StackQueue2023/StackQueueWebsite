import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { PlusCircle, Trash2, Settings, Plus, Eye, EyeOff } from 'lucide-react';

export default function ChallengeManagerPage() {
  const [challenges, setChallenges] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [gameSlug, setGameSlug] = useState('css-arena');
  const [levelNumber, setLevelNumber] = useState(1);
  const [category, setCategory] = useState('Flexbox');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [type, setType] = useState('css_rendering');
  const [language, setLanguage] = useState('javascript');
  const [runtime, setRuntime] = useState('Node.js');
  const [evaluationType, setEvaluationType] = useState('output_test_cases');
  const [instructions, setInstructions] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [targetConditionJson, setTargetConditionJson] = useState('{\n  ".container": {\n    "display": "flex",\n    "justify-content": "center"\n  }\n}');
  const [xpReward, setXpReward] = useState(25);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(120);

  // Test Cases Configurator State
  const [testCases, setTestCases] = useState([
    { input: '5 2 9 1', expectedOutput: '9', explanation: '9 is the largest', isHidden: false },
    { input: '10 3 7', expectedOutput: '10', explanation: 'Hidden test case', isHidden: true }
  ]);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const res = await api.get('/admin/challenges');
      if (res.data.success) {
        setChallenges(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    }
  };

  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      { input: '', expectedOutput: '', explanation: '', isHidden: false }
    ]);
  };

  const handleRemoveTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let parsedCondition = {};
      try {
        if (targetConditionJson.trim()) {
          parsedCondition = JSON.parse(targetConditionJson);
        }
      } catch (err) {
        alert('Invalid JSON in Target Condition field. Please check syntax.');
        setSubmitting(false);
        return;
      }

      const payload = {
        title,
        gameSlug,
        levelNumber: Number(levelNumber),
        category,
        difficulty,
        type,
        language,
        runtime,
        evaluationType,
        instructions,
        targetDescription,
        starterCode,
        targetCondition: parsedCondition,
        testCases,
        xpReward: Number(xpReward),
        timeLimitSeconds: Number(timeLimitSeconds)
      };

      const res = await api.post('/admin/challenges', payload);
      if (res.data.success) {
        alert(`Challenge "${title}" published successfully!`);
        setChallenges([...challenges, res.data.data]);
        setTitle('');
        setInstructions('');
        setStarterCode('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    try {
      const res = await api.delete(`/admin/challenges/${id}`);
      if (res.data.success) {
        setChallenges(challenges.filter(c => c._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Delete error');
    }
  };

  const gamesList = [
    { slug: 'css-arena', name: 'CSS Arena' },
    { slug: 'java-quest', name: 'Java Quest' },
    { slug: 'python-island', name: 'Python Island' },
    { slug: 'dsa-battle', name: 'DSA Battle' },
    { slug: 'javascript-reactor', name: 'JavaScript Reactor' },
    { slug: 'html-builder', name: 'HTML Builder' },
    { slug: 'sql-detective', name: 'SQL Detective' },
    { slug: 'react-lab', name: 'React Lab' },
    { slug: 'git-battle', name: 'Git Battle' },
    { slug: 'cloud-mission', name: 'Cloud Mission' },
    { slug: 'fullstack-challenge', name: 'Full Stack Challenge' }
  ];

  const typesList = [
    { value: 'coding_challenge', label: 'Algorithmic Coding Challenge (Test Cases)' },
    { value: 'css_rendering', label: 'CSS Rendering (Target DOM Conditions)' },
    { value: 'sql_query', label: 'SQL Query (Sandboxed SQLite / Tables)' },
    { value: 'mcq', label: 'Multiple Choice Question (MCQ)' },
    { value: 'output_prediction', label: 'Output Prediction' },
    { value: 'debugging', label: 'Debugging Challenge' },
    { value: 'code_completion', label: 'Code Completion' },
    { value: 'code_ordering', label: 'Code Block Ordering' },
    { value: 'git_scenario', label: 'Git Scenario & Commands' },
    { value: 'cloud_arch', label: 'Cloud Architecture Linker' }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/60 via-fuchsia-50/40 to-pink-50/50 border border-purple-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-purple-700 font-mono text-xs uppercase tracking-widest font-bold bg-gradient-to-r from-purple-100/90 via-fuchsia-100/90 to-pink-100/90 px-3.5 py-1 rounded-full border border-purple-200/80 shadow-2xs">
            <Settings className="w-3.5 h-3.5 text-purple-600" />
            <span>Database-Driven Content Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Challenge & Level Manager</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Publish test case-driven and condition-evaluated challenges. No reference solution code required.
          </p>
        </div>

        <div className="relative z-10 bg-white/80 border border-purple-200/80 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold text-purple-900 shadow-2xs">
          Published Challenges: {challenges.length}
        </div>
      </div>

      {/* Challenge Creator Form */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <PlusCircle className="w-4 h-4 text-purple-600" />
          <span>Create New Arena Challenge</span>
        </h2>

        <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
          {/* Row 1: Target Game, Engine Type, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Target Game:</label>
              <select
                value={gameSlug}
                onChange={(e) => setGameSlug(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
              >
                {gamesList.map(g => (
                  <option key={g.slug} value={g.slug}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Challenge Engine Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
              >
                {typesList.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Row 2: Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-700 font-semibold">Challenge Title:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Find the Largest Number in an Array"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Category / Topic:</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Arrays, Algorithms, Loops"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Row 3: Language, Runtime, Evaluation Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Programming Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="java">Java (Java 17)</option>
                <option value="python">Python (Python 3.x)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="sql">SQL (SQLite)</option>
                <option value="html_css">HTML / CSS</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Execution Runtime:</label>
              <input
                type="text"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                placeholder="e.g. Node.js v20, Java 17, Python 3.11"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Evaluation Method:</label>
              <select
                value={evaluationType}
                onChange={(e) => setEvaluationType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
              >
                <option value="output_test_cases">Test Case Output Based</option>
                <option value="dom_rendering">DOM / Rendering Based</option>
                <option value="function_test_cases">Function Call Signature</option>
                <option value="custom_evaluator">Custom Evaluator Rules</option>
              </select>
            </div>
          </div>

          {/* Goal Briefing */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Target Briefing / Goal:</label>
            <input
              type="text"
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              placeholder="e.g. Write a program that reads an array and prints the largest value."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition"
            />
          </div>

          {/* Detailed Instructions */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Detailed Instructions (Markdown supported):</label>
            <textarea
              rows={3}
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Explain the requirements, constraints, input/output formats..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono"
            />
          </div>

          {/* Starter Code (Optional) */}
          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Starter Code (Optional):</label>
            <textarea
              rows={3}
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              placeholder="// Student can modify or replace this starter code freely"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono text-xs"
            />
          </div>

          {/* Test Cases Configurator */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Evaluation Test Cases</h3>
                <p className="text-[11px] text-slate-500">Configure public (visible) and hidden test cases for automated evaluation.</p>
              </div>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="px-3.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl text-xs flex items-center space-x-1 border border-purple-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-2">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Test Case #{idx + 1} {tc.isHidden ? '(Hidden)' : '(Public)'}</span>
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[11px] text-slate-600 font-normal flex items-center space-x-1">
                          {tc.isHidden ? <EyeOff className="w-3 h-3 text-amber-600 inline" /> : <Eye className="w-3 h-3 text-emerald-600 inline" />}
                          <span>Hidden Test Case</span>
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Test Case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block">Input:</label>
                      <input
                        type="text"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        placeholder="e.g. 5 2 9 1"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block">Expected Output:</label>
                      <input
                        type="text"
                        required
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                        placeholder="e.g. 9"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Condition JSON Evaluator (for DOM / CSS rendering) */}
          {type === 'css_rendering' && (
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold flex items-center justify-between">
                <span>DOM Target Condition (JSON):</span>
                <span className="text-[10px] text-purple-700 font-mono">DOM Property Matching</span>
              </label>
              <textarea
                rows={3}
                value={targetConditionJson}
                onChange={(e) => setTargetConditionJson(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-purple-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono text-xs"
              />
            </div>
          )}

          {/* Level, XP, Time Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Level Number:</label>
              <input
                type="number"
                min="1"
                value={levelNumber}
                onChange={(e) => setLevelNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">XP Reward:</label>
              <input
                type="number"
                min="5"
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Time Limit (Seconds):</label>
              <input
                type="number"
                min="30"
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center space-x-1.5 disabled:opacity-50 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Challenge to Game Hub'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Challenges Directory */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">All Active Challenges</h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Game</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Language</th>
                  <th className="px-4 py-3 font-semibold text-center">Test Cases</th>
                  <th className="px-4 py-3 font-semibold text-center">Level</th>
                  <th className="px-4 py-3 font-semibold text-center">XP</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challenges.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-purple-700 font-bold uppercase text-[11px]">
                      {c.gameSlug ? c.gameSlug.replace(/-/g, ' ').toUpperCase() : 'GENERAL'}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-sans font-semibold">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] font-mono">
                      {c.language || 'javascript'}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700 font-bold">
                      {c.testCases?.length || 0} Cases
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      Lv.{c.levelNumber || 1}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-amber-700">
                      +{c.xpReward} XP
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
