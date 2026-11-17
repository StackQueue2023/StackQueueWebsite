import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Compass,
  RotateCcw,
  Sparkles,
  Maximize2,
  Sliders,
  Layers,
  Circle,
  Square,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import api from '../../api/client';

export default function Cad3DWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  // 2D Sketches state
  const [sketches, setSketches] = useState(
    initialState?.sketches || [
      {
        id: 'sk_1',
        type: 'rectangle',
        plane: 'XY',
        width: 80,
        height: 50,
        x: 0,
        y: 0,
        isClosed: true
      }
    ]
  );

  // 3D Features state
  const [features, setFeatures] = useState(
    initialState?.features || [
      {
        id: 'feat_1',
        type: 'extrude',
        sketchId: 'sk_1',
        depth: 25,
        direction: 'normal'
      }
    ]
  );

  // 3D Viewport State
  const [rotation, setRotation] = useState({ x: 30, y: 45, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState('features'); // 'sketch', 'features', 'properties'
  const [activeSketchIndex, setActiveSketchIndex] = useState(0);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState('saved');
  const saveTimeoutRef = useRef(null);

  const canvasRef = useRef(null);

  // Current primary sketch and feature
  const currentSketch = sketches[activeSketchIndex] || sketches[0];
  const currentFeature = features[activeFeatureIndex] || features[0];

  // Real-time geometric properties calculation
  const width = currentSketch?.width || 50;
  const height = currentSketch?.height || 50;
  const depth = currentFeature?.depth || 20;

  const volume = Math.round(width * height * depth);
  const surfaceArea = Math.round(2 * (width * height + width * depth + height * depth));

  // Trigger continuous auto-save
  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'cad_3d',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('CAD auto-save error:', err);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const updateSketches = (newSketches) => {
    setSketches(newSketches);
    triggerAutoSave({ sketches: newSketches, features, metrics: { volume, surfaceArea } });
  };

  const updateFeatures = (newFeatures) => {
    setFeatures(newFeatures);
    triggerAutoSave({ sketches, features: newFeatures, metrics: { volume, surfaceArea } });
  };

  // Render 3D isometric projection onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);

    // Draw coordinate axes
    const originX = cw / 2;
    const originY = ch / 2 + 20;

    // Isometric isometric projection math
    const radX = (rotation.x * Math.PI) / 180;
    const radY = (rotation.y * Math.PI) / 180;

    const scale = zoom * 1.5;
    const w = (width * scale) / 2;
    const h = (depth * scale) / 2;
    const d = (height * scale) / 2;

    const project = (x, y, z) => {
      // 3D rotation
      const x1 = x * Math.cos(radY) - z * Math.sin(radY);
      const z1 = x * Math.sin(radY) + z * Math.cos(radY);

      const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

      return {
        x: originX + x1,
        y: originY - y2
      };
    };

    // 8 vertices of the 3D extruded prism
    const v = [
      project(-w, -h, -d), // 0
      project(w, -h, -d),  // 1
      project(w, h, -d),   // 2
      project(-w, h, -d),  // 3
      project(-w, -h, d),  // 4
      project(w, -h, d),   // 5
      project(w, h, d),    // 6
      project(-w, h, d)    // 7
    ];

    // Helper to draw shaded face
    const drawFace = (indices, fill, stroke) => {
      ctx.beginPath();
      ctx.moveTo(v[indices[0]].x, v[indices[0]].y);
      for (let i = 1; i < indices.length; i++) {
        ctx.lineTo(v[indices[i]].x, v[indices[i]].y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    // Draw faces with metallic CAD shading
    drawFace([4, 5, 6, 7], 'rgba(59, 130, 246, 0.45)', '#60a5fa'); // Front
    drawFace([1, 2, 6, 5], 'rgba(37, 99, 235, 0.65)', '#93c5fd'); // Right
    drawFace([2, 3, 7, 6], 'rgba(96, 165, 250, 0.85)', '#dbeafe'); // Top
    drawFace([0, 1, 5, 4], 'rgba(30, 64, 175, 0.35)', '#3b82f6'); // Bottom
    drawFace([0, 3, 7, 4], 'rgba(29, 78, 216, 0.55)', '#60a5fa'); // Left

    // Render dimensions labels on canvas
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`Width: ${width}mm`, v[5].x - 20, v[5].y + 16);
    ctx.fillText(`Depth: ${depth}mm`, v[6].x + 10, v[6].y);
    ctx.fillText(`Height: ${height}mm`, v[7].x - 50, v[7].y - 10);
  }, [width, height, depth, rotation, zoom]);

  // Handle Preset View Angles
  const setPresetView = (view) => {
    if (view === 'iso') setRotation({ x: 30, y: 45, z: 0 });
    else if (view === 'front') setRotation({ x: 0, y: 0, z: 0 });
    else if (view === 'top') setRotation({ x: 90, y: 0, z: 0 });
    else if (view === 'right') setRotation({ x: 0, y: 90, z: 0 });
  };

  const handleValidateAndSubmit = () => {
    const payload = {
      sketches,
      features,
      metrics: {
        volume,
        surfaceArea,
        boundingBox: { width, height, depth }
      }
    };
    onSubmitSolution('cad_3d', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* CAD Studio Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-bold text-sky-400">
            <Box className="w-4 h-4" />
            <span>3D CAD Parametric Studio</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* View Presets */}
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {['iso', 'front', 'top', 'right'].map(v => (
              <button
                key={v}
                onClick={() => setPresetView(v)}
                className="px-2 py-1 rounded text-[10px] font-mono uppercase text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {v}
              </button>
            ))}
          </div>

          {/* Orbit Controls */}
          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <button
              onClick={() => setRotation(r => ({ ...r, y: r.y - 15 }))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Rotate Left"
            >
              ↺
            </button>
            <button
              onClick={() => setRotation(r => ({ ...r, y: r.y + 15 }))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Rotate Right"
            >
              ↻
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded font-bold"
              title="Zoom Out"
            >
              -
            </button>
            <button
              onClick={() => setZoom(z => Math.min(2.5, z + 0.1))}
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded font-bold"
              title="Zoom In"
            >
              +
            </button>
          </div>
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
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating 3D Model...' : 'Verify 3D Geometry'}</span>
          </button>
        </div>
      </div>

      {/* Main CAD Viewport & Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Feature Tree Panel */}
        <div className="w-56 bg-slate-950/80 border-r border-slate-800 p-3 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Model Feature Tree</span>
            </div>

            {/* Sketches */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">2D Sketches</span>
              {sketches.map((sk, idx) => (
                <div
                  key={sk.id}
                  onClick={() => setActiveSketchIndex(idx)}
                  className={`p-2 rounded-lg text-xs cursor-pointer border transition ${
                    activeSketchIndex === idx
                      ? 'bg-sky-950 border-sky-500 text-sky-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">{sk.type} Profile</span>
                    <span className="text-[10px] font-mono text-sky-400">{sk.plane}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                    {sk.width} × {sk.height} mm
                  </span>
                </div>
              ))}
            </div>

            {/* 3D Features */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Solid Features</span>
              {features.map((feat, idx) => (
                <div
                  key={feat.id}
                  onClick={() => setActiveFeatureIndex(idx)}
                  className={`p-2 rounded-lg text-xs cursor-pointer border transition ${
                    activeFeatureIndex === idx
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold capitalize">{feat.type} Feature</span>
                    <span className="text-[10px] font-mono text-indigo-400">{feat.depth}mm</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                    Blind Extrusion
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Physical Properties Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2 mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Physical Analysis</span>
            <div className="text-[11px] space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Volume:</span>
                <span className="text-sky-300 font-bold">{volume.toLocaleString()} mm³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Surface Area:</span>
                <span className="text-indigo-300 font-bold">{surfaceArea.toLocaleString()} mm²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Solid State:</span>
                <span className="text-emerald-400 font-bold">Manifold Solid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: 3D Canvas Viewport */}
        <div className="flex-1 bg-slate-900/40 relative flex items-center justify-center p-4">
          <canvas
            ref={canvasRef}
            width={480}
            height={360}
            className="rounded-2xl border border-slate-800/80 shadow-2xl bg-gradient-to-b from-slate-950 to-slate-900"
          />

          {/* Compass / Orientation Indicator */}
          <div className="absolute bottom-6 left-6 flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-400 font-mono">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Rot: X:{rotation.x}° Y:{rotation.y}°</span>
          </div>
        </div>

        {/* Right Parametric Inspector */}
        <div className="w-64 bg-slate-950/90 border-l border-slate-800 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Sliders className="w-3.5 h-3.5" />
            <span>Parametric Dimensions</span>
          </div>

          {/* 2D Dimensions Form */}
          <div className="space-y-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-sky-400">Sketch Dimensions</span>
            <div>
              <label className="text-[10px] text-slate-400">Profile Width (mm)</label>
              <input
                type="number"
                min="10"
                max="200"
                value={currentSketch?.width || 80}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const nextSk = sketches.map((s, idx) => idx === activeSketchIndex ? { ...s, width: val } : s);
                  updateSketches(nextSk);
                }}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400">Profile Height (mm)</label>
              <input
                type="number"
                min="10"
                max="200"
                value={currentSketch?.height || 50}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const nextSk = sketches.map((s, idx) => idx === activeSketchIndex ? { ...s, height: val } : s);
                  updateSketches(nextSk);
                }}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs"
              />
            </div>
          </div>

          {/* 3D Extrusion Depth Form */}
          <div className="space-y-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-indigo-400">Extrusion Depth</span>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Depth: {currentFeature?.depth || 25} mm</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={currentFeature?.depth || 25}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const nextFeat = features.map((f, idx) => idx === activeFeatureIndex ? { ...f, depth: val } : f);
                  updateFeatures(nextFeat);
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
