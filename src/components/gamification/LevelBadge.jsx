import React from 'react';

export default function LevelBadge({ level = { level: 1, title: 'Beginner', icon: '🌱' }, size = 'md' }) {
  const isSmall = size === 'sm';
  return (
    <div className={`inline-flex items-center space-x-1.5 font-medium rounded-lg border border-purple-200 bg-white text-[#9333EA] ${ isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm' }`}>
      <span>{level.icon || '🌱'}</span>
      <span className="font-semibold text-sq-gradient">Lv.{level.level || 1}</span>
      <span className="text-slate-500">({level.title || 'Beginner'})</span>
    </div>
  );
}
