import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function InterviewTimer({
  initialSeconds = 1800,
  onTimeUp = () => {},
  isPaused = false
}) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPaused, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 180; // 3 minutes
  const isWarning = timeLeft <= 600 && !isUrgent; // 10 minutes

  return (
    <div
      className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm transition-all ${ isUrgent ? 'bg-white border-rose-300 text-rose-700 animate-pulse shadow-sm' : isWarning ? 'bg-white border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-800' }`}
    >
      <Timer className={`w-4 h-4 ${isUrgent ? 'text-rose-600 animate-spin' : 'text-purple-600'}`} />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isUrgent && (
        <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-1.5 py-0.5 bg-white text-rose-700 rounded">
          Hurry!
        </span>
      )}
    </div>
  );
}
