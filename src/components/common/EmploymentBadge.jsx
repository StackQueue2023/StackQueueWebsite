import React from 'react';

export const EmploymentBadge = ({ type, className = '' }) => {
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block ${className}`}>
      {type || 'FULL-TIME'}
    </span>
  );
};

export default EmploymentBadge;
