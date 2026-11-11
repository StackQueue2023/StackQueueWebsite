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
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      Icon: CheckCircle2
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      iconColor: 'text-red-600',
      Icon: XCircle
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      Icon: AlertTriangle
    },
    info: {
      bg: 'bg-purple-50 border-purple-200 text-purple-900',
      iconColor: 'text-purple-600',
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
