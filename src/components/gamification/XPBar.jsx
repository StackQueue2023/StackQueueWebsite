import React from 'react';
import { Zap } from 'lucide-react';

export default function XPBar({ totalXp = 0, currentLevel = { level: 1, title: 'Beginner', icon: '🌱' } }) {
  // XP tiers corresponding to server xpRules
  const TIERS = [
    { level: 1, minXp: 0, maxXp: 150 },
    { level: 2, minXp: 150, maxXp: 350 },
    { level: 3, minXp: 350, maxXp: 650 },
    { level: 4, minXp: 650, maxXp: 1100 },
    { level: 5, minXp: 1100, maxXp: 1750 },
    { level: 6, minXp: 1750, maxXp: 2600 },
    { level: 7, minXp: 2600, maxXp: 3700 },
    { level: 8, minXp: 3700, maxXp: 5200 },
    { level: 9, minXp: 5200, maxXp: 7200 },
    { level: 10, minXp: 7200, maxXp: 10000 }
  ];

  const currentTier = TIERS.find(t => t.level === currentLevel.level) || TIERS[0];
  const tierRange = Math.max(1, currentTier.maxXp - currentTier.minXp);
  const xpInCurrentTier = Math.max(0, totalXp - currentTier.minXp);
  const percentage = Math.min(100, Math.round((xpInCurrentTier / tierRange) * 100));

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center space-x-1.5 font-semibold text-purple-700">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-bold text-slate-900">{totalXp} XP</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700">{currentLevel.icon} Lv.{currentLevel.level} {currentLevel.title}</span>
        </div>
        <span className="text-slate-500 text-[11px]">
          {currentTier.maxXp - totalXp > 0 ? `${currentTier.maxXp - totalXp} XP to Level ${currentLevel.level + 1}` : 'Max Level'}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className="h-full bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] rounded-full transition-all duration-500 shadow-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
