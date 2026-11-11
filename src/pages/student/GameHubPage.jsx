import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  Gamepad2,
  Palette,
  Coffee,
  Terminal,
  Brain,
  Zap,
  Layout,
  Database,
  Atom,
  GitBranch,
  Cloud,
  Layers,
  Star,
  Trophy,
  ArrowRight,
  Lock
} from 'lucide-react';
import { getStudentAllowedDomains, isDomainAllowedForStudent } from '../../utils/studentLanguages';

const ICON_MAP = {
  Palette,
  Coffee,
  Terminal,
  Brain,
  Zap,
  Layout,
  Database,
  Atom,
  GitBranch,
  Cloud,
  Layers,
  Gamepad2
};

export default function GameHubPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [allowedDomains, setAllowedDomains] = useState(['all']);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [gamesRes, meRes] = await Promise.all([
          api.get('/games').catch(() => ({ data: { success: false, data: [] } })),
          api.get('/auth/me').catch(() => ({ data: { success: false } }))
        ]);

        if (gamesRes.data.success) {
          setGames(gamesRes.data.data);
        }

        if (meRes.data?.success) {
          const doms = getStudentAllowedDomains(meRes.data.profile, meRes.data.user?.role);
          setAllowedDomains(doms);
        }
      } catch (err) {
        console.error('Failed to load games:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const categories = ['All', 'Frontend', 'Backend', 'Data Structures', 'Database', 'DevOps & Cloud', 'Full Stack'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const filteredGames = games.filter(g => {
    const matchesCat = activeCategory === 'All' || g.category === activeCategory;
    const matchesDiff = activeDifficulty === 'All' || g.difficulty === activeDifficulty || g.difficulty === 'All Levels';
    return matchesCat && matchesDiff;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎮</span>
            <h1 className="text-2xl font-black text-slate-900">Interactive Game Hub</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Master IT engineering through visual arenas, live sandboxes, and algorithm challenges customized for your enrolled domain.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <span className="text-slate-500">Domain-Matched Tracks:</span>
          <span className="font-bold text-emerald-600 font-mono">{games.length} Tracks</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/90 p-3 rounded-xl shadow-sm">
        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-500 font-medium">Difficulty:</span>
          <select
            value={activeDifficulty}
            onChange={(e) => setActiveDifficulty(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {difficulties.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No tracks available for this category</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Showing only tracks enabled for your enrolled course domain. Select 'All' to view all your domain's active tracks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const IconComponent = ICON_MAP[game.icon] || Gamepad2;
            const progressPercent = Math.min(100, Math.round(((game.unlockedLevel || 1) / (game.totalLevels || 10)) * 100));
            const isAllowed = isDomainAllowedForStudent(game.category || game.domain || game.slug, allowedDomains);

            return (
              <div
                key={game._id}
                className={`rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-300 relative overflow-hidden shadow-sm ${
                  isAllowed
                    ? 'bg-white border border-slate-200/90 hover:border-purple-400 hover:shadow-md group'
                    : 'bg-slate-50/80 border border-slate-200/70 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Top card metadata */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-xs ${
                      isAllowed ? 'bg-purple-50 border-purple-100 text-purple-600 group-hover:scale-105 transition-transform' : 'bg-slate-200 border-slate-300 text-slate-400'
                    }`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          {game.category}
                        </span>
                        {!isAllowed ? (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            100 Lvl
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {game.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-base font-bold transition ${isAllowed ? 'text-slate-900 group-hover:text-purple-600' : 'text-slate-500'}`}>
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  {/* Badge reward pill */}
                  {game.badgeRewardName && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-medium">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>Reward: {game.badgeRewardName}</span>
                    </div>
                  )}
                </div>

                {/* Bottom stats & action */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{game.totalStars || 0} Stars</span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">
                      Level {game.unlockedLevel || 1} / {game.totalLevels || 100}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isAllowed ? 'bg-gradient-to-r from-[#8B2BE2] to-[#E02B91]' : 'bg-slate-300'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {isAllowed ? (
                    <Link
                      to={`/games/${game.slug}`}
                      className="w-full py-2.5 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-md shadow-purple-500/20"
                    >
                      <span>Enter Arena</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      title="Course Not Enrolled - Locked for your domain"
                      className="w-full py-2.5 bg-slate-200 text-slate-400 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-not-allowed opacity-80"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Course Locked</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
