import React from 'react';

export default function LevelBadge({ level = { level: 1, title: 'Beginner', icon: '🌱' }, size = 'md' }) {
  const isSmall = size === 'sm';
  return (
    <div className={`inline-flex items-center space-x-1.5 font-medium rounded-lg border border-brand-500/30 bg-brand-950/40 text-brand-300 ${
      isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      <span>{level.icon || '🌱'}</span>
      <span className="font-semibold text-white">Lv.{level.level || 1}</span>
      <span className="text-slate-400">({level.title || 'Beginner'})</span>
    </div>
  );
}
