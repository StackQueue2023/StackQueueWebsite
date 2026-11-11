import React from 'react';

export default function CircularProgressRing({
  percentage = 0,
  label = 'Progress',
  size = 130,
  strokeWidth = 10,
  variant = 'purple', // purple, green, yellow, red
  subtitle = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cleanPercentage = Math.min(100, Math.max(0, Math.round(percentage)));
  const strokeDashoffset = circumference - (cleanPercentage / 100) * circumference;

  const colorConfig = {
    purple: {
      stroke: '#9333EA',
      bgStroke: '#F3E8FF',
      textColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    blue: {
      stroke: '#9333EA',
      bgStroke: '#F3E8FF',
      textColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700'
    },
    green: {
      stroke: '#16A34A',
      bgStroke: '#DCFCE7',
      textColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700'
    },
    yellow: {
      stroke: '#D97706',
      bgStroke: '#FEF3C7',
      textColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700'
    },
    red: {
      stroke: '#DC2626',
      bgStroke: '#FEE2E2',
      textColor: 'text-red-600',
      badgeBg: 'bg-red-50 text-red-700'
    }
  };

  const theme = colorConfig[variant] || colorConfig.purple;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90 origin-center drop-shadow-sm"
          width={size}
          height={size}
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.bgStroke}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-2xl font-black tracking-tight ${theme.textColor}`}>
            {cleanPercentage}%
          </span>
          {subtitle && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      <span className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </span>
    </div>
  );
}
