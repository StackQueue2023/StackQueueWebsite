import React, { useState } from 'react';
import { Layers, Play, RotateCcw, ArrowRight } from 'lucide-react';

export default function DSAVisualizer({ challenge = {} }) {
  // Stack LIFO state
  const [stack, setStack] = useState(['Google', 'YouTube', 'Instagram', 'GitHub']);
  const [poppedHistory, setPoppedHistory] = useState([]);

  // Array Visualizer state (Bubble Sort demonstration)
  const [arrayBars, setArrayBars] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [comparingIdx, setComparingIdx] = useState([-1, -1]);
  const [isSorting, setIsSorting] = useState(false);

  const handlePop = () => {
    if (stack.length > 0) {
      const item = stack[stack.length - 1];
      setStack(stack.slice(0, stack.length - 1));
      setPoppedHistory([item, ...poppedHistory]);
    }
  };

  const handleResetStack = () => {
    setStack(['Google', 'YouTube', 'Instagram', 'GitHub']);
    setPoppedHistory([]);
  };

  const runBubbleStep = async () => {
    setIsSorting(true);
    let arr = [...arrayBars];
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparingIdx([j, j + 1]);
        await new Promise(r => setTimeout(r, 400));
        if (arr[j] > arr[j + 1]) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArrayBars([...arr]);
          await new Promise(r => setTimeout(r, 300));
        }
      }
    }
    setComparingIdx([-1, -1]);
    setIsSorting(false);
  };

  const resetArray = () => {
    setArrayBars([64, 34, 25, 12, 22, 11, 90]);
    setComparingIdx([-1, -1]);
  };

  const isStackGame = challenge.category === 'Stack' || challenge.title.includes('Stack') || challenge.title.includes('Browser');

  if (isStackGame) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-purple-700 font-semibold">
            <Layers className="w-4 h-4" />
            <span>Interactive LIFO Stack Inspector</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePop}
              disabled={stack.length === 0}
              className="px-2.5 py-1 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] disabled:opacity-40 text-white rounded text-xs font-semibold shadow-sm transition"
            >
              Pop (Click Back)
            </button>
            <button
              onClick={handleResetStack}
              className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded transition"
              title="Reset Stack"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-end items-center shadow-sm">
          <div className="w-64 space-y-2 border-b-4 border-l-4 border-r-4 border-purple-400 rounded-b-xl p-3 bg-purple-50/40 min-h-[180px] flex flex-col justify-end">
            {stack.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8 italic">Stack is Empty (Underflow)</p>
            ) : (
              stack.map((item, idx) => {
                const isTop = idx === stack.length - 1;
                return (
                  <div
                    key={idx}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all ${
                      isTop
                        ? 'bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] text-white border-2 border-purple-400 shadow-sm'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {item} {isTop && '← [TOP / LIFO]'}
                  </div>
                );
              })
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono">Top of Stack is the most recently visited page</p>
        </div>

        {poppedHistory.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs flex items-center space-x-2">
            <span className="text-slate-600 font-semibold">Pages Popped by Back Button:</span>
            <div className="flex items-center space-x-1 font-mono text-purple-700">
              {poppedHistory.map((h, i) => (
                <span key={i} className="inline-flex items-center">
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px] text-slate-800 shadow-xs">{h}</span>
                  {i < poppedHistory.length - 1 && <ArrowRight className="w-3 h-3 mx-1 text-slate-400" />}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Algorithm Visualizer (Sorting & Search)
  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-800">Algorithm Visualizer: Bubble Sort Step Engine</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={runBubbleStep}
            disabled={isSorting}
            className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-[#8B2BE2] via-[#B829B6] to-[#E02B91] hover:from-[#7b24cc] hover:to-[#c92280] disabled:opacity-50 text-white rounded text-xs font-semibold shadow-sm transition"
          >
            <Play className="w-3 h-3" />
            <span>{isSorting ? 'Sorting...' : 'Play Sort'}</span>
          </button>
          <button
            onClick={resetArray}
            disabled={isSorting}
            className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded transition"
            title="Reset Array"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex items-end justify-center space-x-3 shadow-sm">
        {arrayBars.map((val, idx) => {
          const isComparing = comparingIdx.includes(idx);
          const heightPercent = Math.round((val / 100) * 100);
          return (
            <div key={idx} className="flex flex-col items-center space-y-1">
              <span className="text-[10px] font-mono text-slate-600 font-semibold">{val}</span>
              <div
                className={`w-8 rounded-t transition-all duration-200 shadow-sm ${
                  isComparing
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-t from-[#8B2BE2] to-[#E02B91]'
                }`}
                style={{ height: `${heightPercent * 1.6}px` }}
              />
              <span className="text-[9px] font-mono text-slate-400">[{idx}]</span>
            </div>
          );
        })}
      </div>
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-700 flex justify-between">
        <span>Time Complexity: <strong className="text-purple-700 font-mono">O(n²)</strong></span>
        <span>Space Complexity: <strong className="text-emerald-700 font-mono">O(1)</strong> Auxiliary</span>
      </div>
    </div>
  );
}
