import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  Server,
  Database,
  Network,
  Shield,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Plus,
  Trash2,
  Link,
  Cpu
} from 'lucide-react';
import api from '../../api/client';

const CLOUD_SERVICES = [
  { type: 'vpc', name: 'Virtual Private Cloud (VPC)', category: 'network', icon: Network, defaultProps: { cidr: '10.0.0.0/16' } },
  { type: 'subnet', name: 'Public/Private Subnet', category: 'network', icon: Layers, defaultProps: { cidr: '10.0.1.0/24' } },
  { type: 'ec2', name: 'EC2 Virtual Machine', category: 'compute', icon: Server, defaultProps: { instanceType: 't3.medium' } },
  { type: 'rds', name: 'RDS Managed Database', category: 'database', icon: Database, defaultProps: { engine: 'PostgreSQL 15' } },
  { type: 's3', name: 'S3 Object Storage Bucket', category: 'storage', icon: Cloud, defaultProps: { versioning: true } },
  { type: 'alb', name: 'Application Load Balancer', category: 'network', icon: Cpu, defaultProps: { scheme: 'internet-facing' } },
  { type: 'igw', name: 'Internet Gateway', category: 'network', icon: Network, defaultProps: {} }
];

export default function CloudArchitectureWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  const [nodes, setNodes] = useState(
    initialState?.nodes || [
      { id: 'node_vpc', type: 'vpc', name: 'Production VPC', x: 40, y: 30, width: 440, height: 260 },
      { id: 'node_ec2', type: 'ec2', name: 'Web Server (EC2)', x: 70, y: 80, instanceType: 't3.micro' },
      { id: 'node_rds', type: 'rds', name: 'Master DB (RDS)', x: 260, y: 80, engine: 'PostgreSQL' },
      { id: 'node_s3', type: 's3', name: 'Static Assets (S3)', x: 70, y: 180, bucket: 'app-assets' }
    ]
  );

  const [connections, setConnections] = useState(
    initialState?.connections || [
      { from: 'node_ec2', to: 'node_rds', label: 'DB Query (Port 5432)' },
      { from: 'node_ec2', to: 'node_s3', label: 'S3 PutObject' }
    ]
  );

  const [selectedNodeId, setSelectedNodeId] = useState('node_ec2');
  const [connectSourceId, setConnectSourceId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'cloud_topology',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Cloud auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const updateNodes = (newNodes) => {
    setNodes(newNodes);
    triggerAutoSave({ nodes: newNodes, connections });
  };

  const updateConnections = (newConns) => {
    setConnections(newConns);
    triggerAutoSave({ nodes, connections: newConns });
  };

  const handleAddService = (svc) => {
    const newId = `node_${Date.now()}`;
    const newNode = {
      id: newId,
      type: svc.type,
      name: `${svc.name.split('(')[0].trim()}`,
      x: 80 + (nodes.length * 30) % 200,
      y: 60 + (nodes.length * 25) % 150,
      ...svc.defaultProps
    };
    updateNodes([...nodes, newNode]);
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id) => {
    updateNodes(nodes.filter(n => n.id !== id));
    updateConnections(connections.filter(c => c.from !== id && c.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleStartConnect = (id) => {
    if (!connectSourceId) {
      setConnectSourceId(id);
    } else if (connectSourceId !== id) {
      // Connect source to target
      const newConn = { from: connectSourceId, to: id, label: 'Traffic Link' };
      updateConnections([...connections, newConn]);
      setConnectSourceId(null);
    } else {
      setConnectSourceId(null);
    }
  };

  const handleValidateAndSubmit = () => {
    const payload = {
      nodes,
      connections
    };
    onSubmitSolution('cloud_topology', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Cloud Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-amber-400">
            <Cloud className="w-4 h-4" />
            <span>Cloud Architecture & DevOps Topology Studio</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {connectSourceId && (
            <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40 animate-pulse">
              Click destination node to complete link wire
            </span>
          )}
        </div>

        {/* Right Status & Submit */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Verifying Topology...' : 'Validate Cloud Architecture'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Services Palette */}
        <div className="w-56 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col space-y-3 overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud Catalog</span>
          <div className="space-y-1.5">
            {CLOUD_SERVICES.map(svc => {
              const Icon = svc.icon;
              return (
                <button
                  key={svc.type}
                  onClick={() => handleAddService(svc)}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 text-left transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-200 truncate">{svc.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{svc.category}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Topology Canvas Viewport */}
        <div className="flex-1 bg-slate-900/60 p-6 overflow-auto relative">
          <div className="min-w-[650px] min-h-[400px] border border-dashed border-slate-800 rounded-2xl relative p-4 bg-slate-950/40">
            {/* Draw active nodes */}
            {nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const isConnectSource = connectSourceId === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: node.type === 'vpc' ? `${node.width || 440}px` : '180px',
                    height: node.type === 'vpc' ? `${node.height || 260}px` : 'auto',
                    zIndex: node.type === 'vpc' ? 1 : 10
                  }}
                  className={`rounded-2xl border transition cursor-pointer select-none ${
                    node.type === 'vpc'
                      ? 'border-dashed border-amber-500/40 bg-amber-950/10 p-3'
                      : 'border-slate-700 bg-slate-900/95 shadow-xl p-3 hover:border-amber-400'
                  } ${isSelected ? 'ring-2 ring-amber-400' : ''} ${
                    isConnectSource ? 'ring-2 ring-emerald-400 animate-pulse' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-white truncate">{node.name}</span>
                    </div>
                    {node.type !== 'vpc' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnect(node.id);
                        }}
                        className={`p-1 rounded-md text-[10px] ${
                          isConnectSource ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Connect wire to another node"
                      >
                        <Link className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {node.type !== 'vpc' && (
                    <div className="mt-2 text-[10px] text-slate-400 font-mono space-y-0.5">
                      {node.instanceType && <p>Type: {node.instanceType}</p>}
                      {node.engine && <p>Engine: {node.engine}</p>}
                      {node.cidr && <p>CIDR: {node.cidr}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connection Links Table */}
          <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Network Routing Links</span>
            <div className="flex flex-wrap gap-2 text-xs">
              {connections.map((c, idx) => {
                const source = nodes.find(n => n.id === c.from);
                const target = nodes.find(n => n.id === c.to);
                return (
                  <span
                    key={idx}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[11px]"
                  >
                    <span>{source?.name || c.from}</span>
                    <span className="text-amber-400">➔</span>
                    <span>{target?.name || c.to}</span>
                    <span className="text-slate-500 text-[10px]">({c.label})</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Inspector */}
        <div className="w-64 bg-slate-950/90 border-l border-slate-800 p-4 space-y-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Configuration</span>
          {selectedNode ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400">Node Label</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const next = nodes.map(n => n.id === selectedNode.id ? { ...n, name: e.target.value } : n);
                    updateNodes(next);
                  }}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              {selectedNode.type === 'ec2' && (
                <div>
                  <label className="text-[10px] text-slate-400">Compute Instance Size</label>
                  <select
                    value={selectedNode.instanceType || 't3.micro'}
                    onChange={(e) => {
                      const next = nodes.map(n => n.id === selectedNode.id ? { ...n, instanceType: e.target.value } : n);
                      updateNodes(next);
                    }}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  >
                    <option value="t3.nano">t3.nano (0.5 GB RAM)</option>
                    <option value="t3.micro">t3.micro (1.0 GB RAM)</option>
                    <option value="t3.medium">t3.medium (4.0 GB RAM)</option>
                    <option value="c5.xlarge">c5.xlarge (Compute Optimized)</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                className="w-full mt-4 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Service</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select any service node on the architecture grid to view and modify its properties.</p>
          )}
        </div>
      </div>
    </div>
  );
}
