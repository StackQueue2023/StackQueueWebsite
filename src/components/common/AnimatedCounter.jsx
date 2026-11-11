import React, { useState, useEffect, useRef } from 'react';

export default function AnimatedCounter({ value = '50+', duration = 2000, className = '' }) {
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    // Parse numeric value and any suffix/prefix like "+" or ","
    const strVal = String(value).trim();
    const match = strVal.match(/^(\D*)(\d+[\d,.]*)(\D*)$/);

    if (!match) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = match[1] || '';
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3] || '';
    const targetNum = parseInt(numStr, 10);

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime = null;

          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease-out cubic formula
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentNum = Math.floor(easeProgress * targetNum);

            // Format with commas if original had commas
            const formatted = match[2].includes(',')
              ? currentNum.toLocaleString()
              : String(currentNum);

            setDisplayValue(`${prefix}${formatted}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setDisplayValue(strVal);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    const el = elementRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={elementRef} className={className}>
      {hasAnimated ? displayValue : '0'}
    </span>
  );
}
