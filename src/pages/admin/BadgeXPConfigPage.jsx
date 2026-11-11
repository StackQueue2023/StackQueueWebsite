import React, { useState } from 'react';
import api from '../../api/client';
import { Award, Zap, PlusCircle } from 'lucide-react';

export default function BadgeXPConfigPage() {
  const [badgeName, setBadgeName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [targetType, setTargetType] = useState('challenges_count');
  const [targetValue, setTargetValue] = useState(10);
  const [xpBonus, setXpBonus] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/badges', {
        name: badgeName,
        description,
        category,
        criteria: {
          type: targetType,
          targetValue: Number(targetValue)
        },
        icon: 'Award',
        color: 'from-amber-400 to-orange-500',
        xpBonus: Number(xpBonus)
      });
      if (res.data.success) {
        alert(`Custom badge "${badgeName}" created successfully!`);
        setBadgeName('');
        setDescription('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating badge');
    } finally {
      setSubmitting(false);
    }
  };

  const levels = [
    { level: 1, title: 'Beginner', minXp: 0, maxXp: 150, icon: '🌱' },
    { level: 2, title: 'Explorer', minXp: 150, maxXp: 350, icon: '🧭' },
    { level: 3, title: 'Learner', minXp: 350, maxXp: 650, icon: '📚' },
    { level: 4, title: 'Developer', minXp: 650, maxXp: 1100, icon: '💻' },
    { level: 5, title: 'Problem Solver', minXp: 1100, maxXp: 1750, icon: '🧩' },
    { level: 6, title: 'Builder', minXp: 1750, maxXp: 2600, icon: '🔨' },
    { level: 7, title: 'Advanced Developer', minXp: 2600, maxXp: 3700, icon: '⚡' },
    { level: 8, title: 'Industry Ready', minXp: 3700, maxXp: 5200, icon: '🚀' },
    { level: 9, title: 'Project Engineer', minXp: 5200, maxXp: 7200, icon: '🛡️' },
    { level: 10, title: 'IT Champion', minXp: 7200, maxXp: '10,000+', icon: '👑' }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-6 shadow-xs space-y-1">
        <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider font-mono">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Gamification Governance</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">XP Engine & Badge Configuration</h1>
        <p className="text-xs text-slate-600">
          Administer institutional leveling tiers, XP rules, and create custom achievement medals.
        </p>
      </div>

      {/* Centralized XP Rules Summary */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Centralized XP Economy Rules</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Beginner Challenge</span>
            <span className="text-amber-700 font-bold text-sm">+15 XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Intermediate</span>
            <span className="text-amber-700 font-bold text-sm">+30 XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Advanced</span>
            <span className="text-amber-700 font-bold text-sm">+60 XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Expert / Real Mission</span>
            <span className="text-amber-700 font-bold text-sm">+120 XP</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">First Attempt Bonus</span>
            <span className="text-emerald-700 font-bold text-sm">+15 XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Daily 4-Pack Bonus</span>
            <span className="text-emerald-700 font-bold text-sm">+100 XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Kanban Task Finished</span>
            <span className="text-purple-700 font-bold text-sm">+50 XP</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Project Delivery</span>
            <span className="text-purple-700 font-bold text-sm">+300 XP</span>
          </div>
        </div>
      </div>

      {/* 10 Level Progression Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">10-Tier Level Progression Ladder</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {levels.map((lvl) => (
            <div key={lvl.level} className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-1 text-center shadow-xs">
              <span className="text-2xl">{lvl.icon}</span>
              <p className="text-xs font-bold text-slate-900">Level {lvl.level}</p>
              <p className="text-[11px] text-purple-700 font-semibold">{lvl.title}</p>
              <span className="text-[10px] text-slate-500 font-mono block">
                {lvl.minXp} - {lvl.maxXp} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Custom Badge Form */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <PlusCircle className="w-4 h-4 text-amber-500" />
          <span>Mint Custom Achievement Badge</span>
        </h2>

        <form onSubmit={handleCreateBadge} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-700 font-semibold">Badge Name:</label>
              <input
                type="text"
                required
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                placeholder="e.g. Master of Recursion"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
              >
                <option value="General">General</option>
                <option value="Language">Language</option>
                <option value="DSA">DSA</option>
                <option value="DevOps">DevOps</option>
                <option value="Projects">Projects</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-semibold">Badge Description:</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Solved 10 recursive tree challenges without viewing hints."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Unlock Condition Type:</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition"
              >
                <option value="challenges_count">Solved Challenges Count</option>
                <option value="xp_threshold">Total XP Threshold</option>
                <option value="project_count">Projects Completed</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Target Threshold Value:</label>
              <input
                type="number"
                min="1"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">XP Unlock Bonus:</label>
              <input
                type="number"
                min="10"
                value={xpBonus}
                onChange={(e) => setXpBonus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 focus:bg-white transition font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create & Register Badge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
