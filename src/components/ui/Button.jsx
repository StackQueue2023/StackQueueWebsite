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
  category = null,
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
    primary: 'bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA] text-white border-0 shadow-sm hover:opacity-95 focus:ring-purple-400 active:scale-[0.98]',
    gradient: 'bg-gradient-to-r from-[#EC4899] via-[#DB2777] to-[#9333EA] text-white border-0 shadow-sm hover:opacity-95 focus:ring-purple-400 active:scale-[0.98]',
    course: 'bg-blue-600 hover:bg-blue-700 border border-blue-600 text-white shadow-xs focus:ring-blue-500 active:scale-[0.98]',
    internship: 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 text-white shadow-xs focus:ring-emerald-500 active:scale-[0.98]',
    project: 'bg-amber-600 hover:bg-amber-700 border border-amber-600 text-white shadow-xs focus:ring-amber-500 active:scale-[0.98]',
    product: 'bg-amber-600 hover:bg-amber-700 border border-amber-600 text-white shadow-xs focus:ring-amber-500 active:scale-[0.98]',
    success: 'bg-emerald-600 hover:bg-emerald-700 border border-emerald-600 text-white shadow-xs focus:ring-emerald-500 active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-700 border border-rose-600 text-white shadow-xs focus:ring-rose-500 active:scale-[0.98]',
    warning: 'bg-amber-500 hover:bg-amber-600 border border-amber-500 text-white shadow-xs focus:ring-amber-500 active:scale-[0.98]',
    secondary: 'bg-purple-50 border border-purple-300 text-[#7E22CE] hover:bg-purple-100 focus:ring-purple-400 active:scale-[0.98]',
    outline: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-300 active:scale-[0.98]',
    ghost: 'bg-transparent text-[#9333EA] hover:bg-purple-50 focus:ring-purple-200'
  };

  const resolvedVariant = category || variant;
  const isGradientText = false;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[resolvedVariant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className={`w-4 h-4 shrink-0 ${isGradientText ? 'text-[#9333EA]' : ''}`} />
      ) : null}
      <span className={isGradientText ? 'text-sq-gradient font-bold' : ''}>{children}</span>
    </button>
  );
}
