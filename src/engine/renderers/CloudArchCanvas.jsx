import React, { useState } from 'react';
import { Cloud, Globe, HardDrive, Database, User, RotateCcw, ArrowRight } from 'lucide-react';

export default function CloudArchCanvas({ onConnectionsChange = () => {} }) {
  const [connections, setConnections] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);

  const nodes = [
    { id: 'user', label: 'End User', icon: User, color: 'from-purple-500 to-pink-500' },
    { id: 'cf', label: 'CloudFront CDN', icon: Globe, color: 'from-indigo-500 to-purple-500' },
    { id: 's3', label: 'S3 Static Assets', icon: HardDrive, color: 'from-emerald-500 to-teal-500' },
    { id: 'rds', label: 'RDS Database', icon: Database, color: 'from-amber-500 to-orange-500' }
  ];

  const handleNodeClick = (nodeId) => {
    if (!selectedSource) {
      setSelectedSource(nodeId);
    } else {
      if (selectedSource !== nodeId) {
        const newConn = { from: selectedSource, to: nodeId };
        const exists = connections.some(c => c.from === newConn.from && c.to === newConn.to);
        if (!exists) {
          const updated = [...connections, newConn];
          setConnections(updated);
          onConnectionsChange(updated);
        }
      }
      setSelectedSource(null);
    }
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedSource(null);
    onConnectionsChange([]);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-purple-700 font-semibold">
          <Cloud className="w-4 h-4" />
          <span>Cloud Topology Linker (Click source node, then destination)</span>
        </div>
        <button
          onClick={handleReset}
          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded transition"
          title="Reset Connections"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Topology Board */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nodes.map((n) => {
            const Icon = n.icon;
            const isSource = selectedSource === n.id;
            const isConnected = connections.some(c => c.from === n.id || c.to === n.id);
            return (
              <button
                key={n.id}
                onClick={() => handleNodeClick(n.id)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition-all group ${
                  isSource
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 scale-105 shadow-md'
                    : isConnected
                    ? 'border-emerald-300 bg-emerald-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${n.color} flex items-center justify-center text-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 text-center">{n.label}</span>
                <span className="text-[10px] font-mono text-slate-400">[{n.id}]</span>
              </button>
            );
          })}
        </div>

        {/* Established Pipeline Links */}
        <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Configured Routing Pipeline:</p>
          {connections.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No links connected yet. Click "End User" then "CloudFront CDN".</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {connections.map((c, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono text-purple-700 shadow-xs">
                  <span className="font-semibold uppercase">{c.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold uppercase">{c.to}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
