import React from 'react';

/**
 * Universal Input & Form Field Component
 * White background, gray border, blue focus ring, red validation state.
 */
export default function Input({
  label = null,
  error = null,
  helperText = null,
  id,
  type = 'text',
  className = '',
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full bg-white text-slate-900 text-xs rounded-xl border px-3.5 py-2.5 transition focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-400 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100 text-red-900'
            : 'border-slate-300 focus:border-purple-600 focus:ring-purple-100'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
}
