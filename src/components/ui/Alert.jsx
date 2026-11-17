import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/**
 * Universal Alert Component
 * Consistent alerts with icons and standard colors:
 * - success: Green
 * - error: Red
 * - warning: Yellow
 * - info: Blue
 */
export default function Alert({
  type = 'info',
  title = null,
  children,
  onClose = null,
  className = ''
}) {
  const configs = {
    success: {
      bg: 'bg-white border-emerald-300 text-emerald-800',
      iconColor: 'text-emerald-600',
      Icon: CheckCircle2
    },
    error: {
      bg: 'bg-white border-rose-300 text-rose-800',
      iconColor: 'text-rose-600',
      Icon: XCircle
    },
    warning: {
      bg: 'bg-white border-amber-400 text-amber-800',
      iconColor: 'text-amber-600',
      Icon: AlertTriangle
    },
    info: {
      bg: 'bg-white border-purple-300 text-[#9333EA]',
      iconColor: 'text-[#9333EA]',
      Icon: Info
    }
  };

  const cfg = configs[type] || configs.info;
  const Icon = cfg.Icon;

  return (
    <div className={`flex items-start p-4 border rounded-xl shadow-sm text-xs ${cfg.bg} ${className}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 mr-3 ${cfg.iconColor}`} />
      <div className="flex-1 space-y-0.5">
        {title && <div className="font-bold">{title}</div>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
