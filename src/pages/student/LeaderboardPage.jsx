import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [scopeFilter, setScopeFilter] = useState('global');

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const res = await api.get('/leaderboard', {
          params: { type: scopeFilter, time: timeFilter }
        });
        if (res.data.success) {
          setLeaderboard(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, [timeFilter, scopeFilter]);

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs uppercase tracking-wider font-mono">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Institute Champions Arena</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">STACK QUEUE Leaderboard</h1>
          <p className="text-xs text-slate-600">
            Ranked by verified XP earned through challenge correctness and code efficiency.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl text-xs">
          {/* Scope */}
          <div className="flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-xs">
            {['global', 'batch', 'course'].map((s) => (
              <button
                key={s}
                onClick={() => setScopeFilter(s)}
                className={`px-3 py-1 rounded-md capitalize font-semibold transition ${
                  scopeFilter === s ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Time */}
          <div className="flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-xs">
            {['weekly', 'monthly', 'all-time'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1 rounded-md capitalize font-semibold transition ${
                  timeFilter === t ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {!loading && top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {top3[1] && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 order-2 md:order-1 relative overflow-hidden shadow-sm">
              <div className="absolute top-3 left-3 text-slate-500 text-xs font-mono font-bold">#2 Rank</div>
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-lg text-slate-700 shadow-xs">
                {top3[1].name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{top3[1].name}</h3>
                <p className="text-[11px] text-slate-500">{top3[1].college} • {top3[1].batch}</p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-amber-700 font-bold">{top3[1].xp} XP</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Champion) */}
          {top3[0] && (
            <div className="bg-gradient-to-b from-amber-50/60 to-white border-2 border-amber-300 rounded-2xl p-6 flex flex-col items-center text-center space-y-3 order-1 md:order-2 shadow-md relative overflow-hidden scale-105">
              <div className="absolute top-3 left-3 flex items-center space-x-1 text-amber-700 text-xs font-mono font-bold">
                <Medal className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>#1 Champion</span>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center font-black text-2xl text-amber-700 shadow-sm">
                {top3[0].name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{top3[0].name}</h3>
                <p className="text-xs text-purple-700 font-medium">{top3[0].college} • {top3[0].batch}</p>
              </div>
              <div className="flex items-center space-x-3 text-sm font-mono pt-1">
                <span className="text-amber-700 font-black">{top3[0].xp} XP</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-semibold">{top3[0].challengesSolved} Solved</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center space-y-3 order-3 relative overflow-hidden shadow-sm">
              <div className="absolute top-3 left-3 text-amber-800 text-xs font-mono font-bold">#3 Rank</div>
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-lg text-amber-800 shadow-xs">
                {top3[2].name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{top3[2].name}</h3>
                <p className="text-[11px] text-slate-500">{top3[2].college} • {top3[2].batch}</p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-amber-700 font-bold">{top3[2].xp} XP</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Rankings Table or Empty State */}
      {leaderboard.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Leaderboard Data Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no ranked students for the selected filter scope. Earn XP by completing challenges to appear on the leaderboard.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider">Standing Table</span>
            <span className="text-slate-500 font-mono text-[11px]">{leaderboard.length} Students Listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center w-16">Rank</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">College / Batch</th>
                  <th className="px-4 py-3 font-semibold text-center">XP</th>
                  <th className="px-4 py-3 font-semibold text-center">Level</th>
                  <th className="px-4 py-3 font-semibold text-center">Solved</th>
                  <th className="px-4 py-3 font-semibold text-center">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaderboard.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center font-bold text-xs text-purple-700 border border-purple-200">
                          {row.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-800">{row.college}</p>
                        <p className="text-[10px] text-slate-500">{row.batch}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-amber-700">
                      {row.xp}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
                        Lv.{row.level?.level || 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-700">
                      {row.challengesSolved}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-amber-800">
                      {row.badgesCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
