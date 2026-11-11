import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Trophy, Lock, CheckCircle2, Zap } from 'lucide-react';

export default function AchievementsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await api.get('/student/achievements');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const badges = data?.badges || [];
  const xpHistory = data?.xpHistory || [];
  const unlockedCount = data?.unlockedCount || 0;
  const totalBadges = data?.totalBadges || badges.length;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider font-mono">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Honors & Medals</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Achievements & Badges</h1>
          <p className="text-xs text-slate-600">
            Earn institute honors by solving algorithmic hurdles, maintaining active streaks, and delivering industry projects.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl text-center shrink-0">
          <p className="text-[10px] uppercase font-bold text-slate-500">Unlocked Badges</p>
          <p className="text-xl font-black text-amber-700 font-mono">
            {unlockedCount} / {totalBadges}
          </p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Medal Showcase</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                  badge.isUnlocked
                    ? 'bg-white border-amber-200'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${badge.color || 'from-amber-400 to-orange-500'} p-0.5 shadow-sm flex items-center justify-center text-2xl`}>
                      {badge.isUnlocked ? '🏆' : <Lock className="w-5 h-5 text-slate-400" />}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      +{badge.xpBonus} XP
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900">{badge.name}</h3>
                      {badge.isUnlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{badge.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] flex justify-between items-center text-slate-500 font-mono">
                  <span>{badge.category}</span>
                  <span>{badge.isUnlocked ? (badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Unlocked') : 'Locked'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP Audit Ledger */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>XP Transaction Ledger (Audit Trail)</span>
        </h2>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold text-center">Amount</th>
                  <th className="px-4 py-3 font-semibold text-center">Balance After</th>
                  <th className="px-4 py-3 font-semibold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {xpHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                      No XP transactions recorded yet. Complete your first challenge!
                    </td>
                  </tr>
                ) : (
                  xpHistory.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-purple-700 font-semibold uppercase text-[11px]">
                        {tx.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-xs font-sans">
                        {tx.description || tx.reason}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">
                        +{tx.amount} XP
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {tx.balanceAfter} XP
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
