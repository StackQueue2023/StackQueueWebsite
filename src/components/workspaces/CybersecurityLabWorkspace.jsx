import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Terminal,
  Sparkles,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import api from '../../api/client';

export default function CybersecurityLabWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  const [firewallRules, setFirewallRules] = useState(
    initialState?.firewallRules || [
      { id: 'rule_1', action: 'DENY', protocol: 'TCP', port: 23, description: 'Block unencrypted Telnet port' },
      { id: 'rule_2', action: 'DENY', protocol: 'TCP', port: 21, description: 'Block cleartext FTP port' },
      { id: 'rule_3', action: 'ALLOW', protocol: 'TCP', port: 443, description: 'Allow HTTPS encrypted web traffic' },
      { id: 'rule_4', action: 'ALLOW', protocol: 'TCP', port: 22, description: 'Allow SSH with key-based authentication' }
    ]
  );

  const [packetLogs, setPacketLogs] = useState([
    { id: 1, src: '192.168.1.105', dst: '10.0.0.1:443', proto: 'TCP', status: 'ALLOWED', alert: false },
    { id: 2, src: '45.33.32.156', dst: '10.0.0.1:23', proto: 'TCP', status: 'BLOCKED', alert: true },
    { id: 3, src: '198.51.100.4', dst: '10.0.0.1:21', proto: 'TCP', status: 'BLOCKED', alert: true },
    { id: 4, src: '192.168.1.20', dst: '10.0.0.1:22', proto: 'TCP', status: 'ALLOWED', alert: false }
  ]);

  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'cybersecurity_lab',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Cyber auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const updateRules = (newRules) => {
    setFirewallRules(newRules);
    triggerAutoSave({ firewallRules: newRules, packetLogs });
  };

  const handleAddRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      action: 'DENY',
      protocol: 'TCP',
      port: 8080,
      description: 'Custom ingress policy'
    };
    updateRules([...firewallRules, newRule]);
  };

  const handleToggleAction = (idx) => {
    const next = firewallRules.map((r, i) => i === idx ? { ...r, action: r.action === 'ALLOW' ? 'DENY' : 'ALLOW' } : r);
    updateRules(next);
  };

  const handleValidateAndSubmit = () => {
    const payload = {
      firewallRules,
      auditFindings: [
        { type: 'port_scan', mitigated: true },
        { type: 'telnet_exposure', mitigated: true }
      ]
    };
    onSubmitSolution('cybersecurity_lab', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-rose-400">
            <Shield className="w-4 h-4" />
            <span>Cybersecurity Threat Defense & Firewall Security Lab</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Auditing Policies...' : 'Verify Perimeter Security'}</span>
          </button>
        </div>
      </div>

      {/* Main Lab View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Firewall Policy Matrix */}
        <div className="flex-1 p-4 border-r border-slate-800 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Active Ingress Firewall Policies</span>
            <button
              onClick={handleAddRule}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
            >
              + Add Rule
            </button>
          </div>

          <div className="space-y-2">
            {firewallRules.map((rule, idx) => (
              <div key={rule.id || idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleAction(idx)}
                    className={`px-2.5 py-1 rounded-lg font-bold font-mono text-[10px] ${
                      rule.action === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {rule.action}
                  </button>
                  <div className="font-mono text-white">
                    <span>PORT {rule.port}</span>
                    <span className="text-slate-500 mx-1.5">/</span>
                    <span className="text-cyan-400">{rule.protocol}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] truncate">{rule.description}</span>
                </div>

                <button
                  onClick={() => updateRules(firewallRules.filter((_, i) => i !== idx))}
                  className="text-slate-600 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Packet Log Monitor */}
        <div className="w-80 bg-slate-950/90 p-4 flex flex-col overflow-hidden">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-slate-800">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Real-time Ingress Packet Stream</span>
          </div>

          <div className="flex-1 mt-3 overflow-y-auto space-y-2 font-mono text-[11px]">
            {packetLogs.map(pkt => (
              <div key={pkt.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px]">{pkt.src}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${pkt.status === 'ALLOWED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {pkt.status}
                  </span>
                </div>
                <div className="text-slate-500 text-[10px] flex justify-between">
                  <span>Target: {pkt.dst}</span>
                  <span>{pkt.proto}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
