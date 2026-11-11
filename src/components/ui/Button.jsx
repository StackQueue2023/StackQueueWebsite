import React from 'react';

/**
 * Universal Button Component conforming to the 5-color light theme system:
 * - primary: Blue background, white text (Main actions, CTAs, Login, Start Challenge)
 * - success: Green background, white text (Complete, Approve, Mark Complete)
 * - danger: Red background, white text (Delete, Remove, Critical actions)
 * - warning: Yellow background, dark text (Hint, Review, Attention, XP)
 * - secondary: White background, blue border & blue text (Cancel, Back, View)
 * - outline: White background, gray border & gray text (Neutral options)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon = null,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs font-semibold gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] text-white shadow-md shadow-purple-500/20 focus:ring-purple-400 active:scale-[0.98]',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500 active:scale-[0.98]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow focus:ring-red-500 active:scale-[0.98]',
    warning: 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-sm hover:shadow focus:ring-amber-400 active:scale-[0.98]',
    secondary: 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/80 focus:ring-purple-400 active:scale-[0.98]',
    outline: 'bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 focus:ring-purple-300 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:text-purple-700 hover:bg-purple-50 focus:ring-purple-200'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
