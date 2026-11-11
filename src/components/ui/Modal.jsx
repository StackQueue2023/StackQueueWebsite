import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Universal Modal Component
 * Standardized pure White surface dialog, rounded-2xl, soft shadow, backdrop blur.
 */
export default function Modal({
  isOpen = false,
  onClose = () => {},
  title = '',
  subtitle = null,
  children,
  maxWidth = 'max-w-lg',
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 text-left shadow-2xl transition-all ${className}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="text-sm text-slate-700">{children}</div>
        </div>
      </div>
    </div>
  );
}
