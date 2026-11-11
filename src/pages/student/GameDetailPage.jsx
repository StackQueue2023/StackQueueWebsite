import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  Star,
  Play,
  Zap,
  Clock,
  Trophy,
  Search,
  Layers
} from 'lucide-react';

export default function GameDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter and navigation states for 100 levels
  const [activeStage, setActiveStage] = useState(1); // 1 to 10
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    async function loadGame() {
      try {
        const res = await api.get(`/games/${slug}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load game:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const game = data?.game;
  const challenges = data?.challenges || [];
  const unlockedLevel = data?.unlockedLevel || 1;
  const completedIds = new Set((data?.completedChallenges || []).map((id) => id.toString()));

  // 10 Stages config (10 levels per stage for 100 levels)
  const STAGES = Array.from({ length: 10 }, (_, i) => {
    const stageNum = i + 1;
    const startLvl = i * 10 + 1;
    const endLvl = (i + 1) * 10;
    const stageChallenges = challenges.filter(
      (c) => c.levelNumber >= startLvl && c.levelNumber <= endLvl
    );
    const completedCount = stageChallenges.filter((c) =>
      completedIds.has(c._id.toString())
    ).length;
    const isUnlocked = startLvl <= unlockedLevel;
    const sampleCategory = stageChallenges[0]?.category || `Stage ${stageNum}`;

    return {
      stageNum,
      startLvl,
      endLvl,
      title: sampleCategory,
      total: stageChallenges.length || 10,
      completedCount,
      isUnlocked
    };
  });

  // Filtered challenges based on stage, search, difficulty
  const filteredChallenges = challenges.filter((ch) => {
    const inActiveStage =
      activeStage === 'all' ||
      (ch.levelNumber >= (activeStage - 1) * 10 + 1 && ch.levelNumber <= activeStage * 10);

    const matchesDifficulty =
      difficultyFilter === 'All' || ch.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.instructions.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.levelNumber.toString().includes(searchQuery);

    return inActiveStage && matchesDifficulty && matchesSearch;
  });

  const totalCompleted = challenges.filter((c) => completedIds.has(c._id.toString())).length;
  const progressPercent = challenges.length > 0 ? Math.round((totalCompleted / challenges.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <Link
        to="/games"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-purple-600 font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Game Hub</span>
      </Link>

      {/* Game Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {game?.category} Track
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100 Interactive Levels
              </span>
              <span className="text-xs text-amber-800 font-bold flex items-center space-x-1 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Badge: {game?.badgeRewardName}</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {game?.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {game?.description}
            </p>

            {/* Overall Progress bar */}
            <div className="pt-2 space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Battle Progress:</span>
                <span className="text-emerald-700 font-mono font-bold">
                  {totalCompleted} / {challenges.length || 100} Completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 border border-slate-200 overflow-hidden">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="bg-gradient-to-r from-[#8B2BE2] to-[#E02B91] h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0">
            <div className="text-center px-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Current Unlocked</p>
              <p className="text-xl font-black text-purple-700 font-mono">
                Level {unlockedLevel}
              </p>
            </div>
            <div className="w-px sm:w-full h-8 sm:h-px bg-slate-200"></div>
            <div className="text-center px-3">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total Stars</p>
              <p className="text-xl font-black text-amber-700 font-mono flex items-center justify-center space-x-1">
                <span>{data?.totalStars || 0}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Stage Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Battle Stages (100 Levels)
            </h2>
          </div>
        </div>

        {/* 10 Stages Slider / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {STAGES.map((st) => {
            const isSelected = activeStage === st.stageNum;
            const isStageComplete = st.completedCount === st.total;

            return (
              <button
                key={st.stageNum}
                onClick={() => {
                  if (st.isUnlocked) setActiveStage(st.stageNum);
                }}
                disabled={!st.isUnlocked}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-sm ring-2 ring-purple-500/20'
                    : st.isUnlocked
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono font-bold text-purple-700">
                    S{st.stageNum}
                  </span>
                  {st.isUnlocked ? (
                    isStageComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500">
                        {st.completedCount}/{st.total}
                      </span>
                    )
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                </div>

                <div className="text-xs font-bold truncate text-slate-800">{st.title}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Lvl {st.startLvl}-{st.endLvl}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search challenges in this track..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition"
          />
        </div>

        {/* Difficulty and Stage reset */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-2.5 py-1 rounded-lg transition ${
                difficultyFilter === d
                  ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white font-semibold shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}

          {activeStage !== 'all' && (
            <button
              onClick={() => setActiveStage('all')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 font-medium"
            >
              View All 100
            </button>
          )}
        </div>
      </div>

      {/* Challenges Roadmap List */}
      <div className="space-y-3">
        {filteredChallenges.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs shadow-sm">
            No challenges matching your current stage or search filters.
          </div>
        ) : (
          filteredChallenges.map((ch) => {
            const isUnlocked = ch.levelNumber <= unlockedLevel;
            const isCompleted = completedIds.has(ch._id.toString());

            return (
              <div
                key={ch._id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-white border-emerald-200 hover:border-emerald-300'
                    : isUnlocked
                    ? 'bg-white border-slate-200 hover:border-purple-300'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isUnlocked
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isUnlocked ? (
                      `L${ch.levelNumber}`
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{ch.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {ch.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          ch.difficulty === 'Beginner'
                            ? 'text-emerald-700'
                            : ch.difficulty === 'Intermediate'
                            ? 'text-purple-700'
                            : ch.difficulty === 'Advanced'
                            ? 'text-amber-800'
                            : 'text-rose-700'
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{ch.instructions}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0">
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-amber-700 font-semibold flex items-center space-x-0.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>+{ch.xpReward} XP</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 flex items-center space-x-0.5">
                      <Clock className="w-3" />
                      <span>{ch.timeLimitSeconds}s</span>
                    </span>
                  </div>

                  {isUnlocked ? (
                    <Link
                      to={`/challenges/${ch._id}`}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm ${
                        isCompleted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          : 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white shadow-md shadow-purple-500/20'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCompleted ? 'Replay' : 'Start Battle'}</span>
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
