import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Square,
  Circle,
  Type,
  MousePointer,
  Link2,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Save,
  Smartphone,
  Eye,
  Sliders,
  X
} from 'lucide-react';
import api from '../../api/client';

export default function UiUxDesignWorkspace({
  courseId,
  question,
  initialState,
  onSubmitSolution,
  isSubmitting
}) {
  // Artboards state
  const [artboards, setArtboards] = useState(
    initialState?.artboards || [
      { id: 'ab_1', title: 'Screen 1 — Welcome', width: 320, height: 480 }
    ]
  );
  const [activeArtboardId, setActiveArtboardId] = useState('ab_1');

  // Layers state
  const [layers, setLayers] = useState(
    initialState?.layers || [
      {
        id: 'layer_1',
        artboardId: 'ab_1',
        type: 'text',
        name: 'Header Title',
        text: 'Welcome to App',
        x: 40,
        y: 60,
        width: 240,
        height: 40,
        fill: '#1e293b',
        fontSize: 22,
        fontWeight: 'bold',
        borderRadius: 0
      },
      {
        id: 'layer_2',
        artboardId: 'ab_1',
        type: 'button',
        name: 'Primary Button',
        text: 'Get Started →',
        x: 40,
        y: 380,
        width: 240,
        height: 48,
        fill: '#4f46e5',
        textColor: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        borderRadius: 12
      }
    ]
  );

  const [selectedLayerId, setSelectedLayerId] = useState('layer_2');
  const [prototypeLinks, setPrototypeLinks] = useState(initialState?.prototypeLinks || []);
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'rectangle', 'circle', 'text', 'button', 'input'
  const [previewMode, setPreviewMode] = useState(false);
  const [previewActiveScreen, setPreviewActiveScreen] = useState('ab_1');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved'
  const saveTimeoutRef = useRef(null);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const activeArtboard = artboards.find(a => a.id === activeArtboardId) || artboards[0];

  // Auto-save debouncer
  const triggerAutoSave = (updatedData) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.post(`/workspace/state/${courseId}/${question._id}`, {
          environmentType: 'uiux_design',
          stateData: updatedData
        });
        setSaveStatus('saved');
      } catch (e) {
        console.error('Workspace auto-save error:', e);
        setSaveStatus('saved');
      }
    }, 1200);
  };

  const updateLayers = (newLayers) => {
    setLayers(newLayers);
    triggerAutoSave({ artboards, layers: newLayers, prototypeLinks });
  };

  const updateArtboards = (newArtboards) => {
    setArtboards(newArtboards);
    triggerAutoSave({ artboards: newArtboards, layers, prototypeLinks });
  };

  const updatePrototypeLinks = (newLinks) => {
    setPrototypeLinks(newLinks);
    triggerAutoSave({ artboards, layers, prototypeLinks: newLinks });
  };

  // Add Artboard
  const handleAddArtboard = () => {
    const nextNum = artboards.length + 1;
    const newAb = {
      id: `ab_${Date.now()}`,
      title: `Screen ${nextNum} — Details`,
      width: 320,
      height: 480
    };
    const nextAbs = [...artboards, newAb];
    updateArtboards(nextAbs);
    setActiveArtboardId(newAb.id);
  };

  // Add Layer to active artboard
  const handleAddElement = (type) => {
    const newId = `layer_${Date.now()}`;
    let newElement = {
      id: newId,
      artboardId: activeArtboardId,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.length + 1}`,
      x: 40,
      y: 120 + ((layers.filter(l => l.artboardId === activeArtboardId).length * 40) % 200),
      width: type === 'button' || type === 'input' ? 240 : (type === 'circle' ? 80 : 200),
      height: type === 'button' || type === 'input' ? 44 : (type === 'circle' ? 80 : 100),
      fill: type === 'button' ? '#4f46e5' : (type === 'circle' ? '#ec4899' : (type === 'text' ? '#0f172a' : '#f1f5f9')),
      textColor: '#ffffff',
      text: type === 'text' ? 'New Typography Layer' : (type === 'button' ? 'Action Button' : (type === 'input' ? 'Enter placeholder...' : '')),
      fontSize: type === 'text' ? 16 : 14,
      borderRadius: type === 'circle' ? 999 : (type === 'button' || type === 'input' ? 8 : 4)
    };

    const nextLayers = [...layers, newElement];
    updateLayers(nextLayers);
    setSelectedLayerId(newId);
    setActiveTool('select');
  };

  // Update selected layer property
  const handlePropertyChange = (field, value) => {
    if (!selectedLayerId) return;
    const nextLayers = layers.map(l => (l.id === selectedLayerId ? { ...l, [field]: value } : l));
    updateLayers(nextLayers);
  };

  // Delete layer
  const handleDeleteLayer = (id) => {
    const nextLayers = layers.filter(l => l.id !== id);
    updateLayers(nextLayers);
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // Connect Prototype Link from selected layer to artboard
  const handleSetPrototypeTarget = (targetArtboardId) => {
    if (!selectedLayerId) return;
    let nextLinks = prototypeLinks.filter(pl => pl.sourceLayerId !== selectedLayerId);
    if (targetArtboardId) {
      nextLinks.push({
        sourceLayerId: selectedLayerId,
        sourceArtboardId: activeArtboardId,
        targetArtboardId
      });
    }
    updatePrototypeLinks(nextLinks);
  };

  const currentProtoTarget = prototypeLinks.find(pl => pl.sourceLayerId === selectedLayerId)?.targetArtboardId || '';

  // Trigger Master Evaluation
  const handleValidateAndSubmit = () => {
    const payload = {
      artboards,
      layers,
      prototypeLinks
    };
    onSubmitSolution('uiux_design', payload);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded-lg transition ${activeTool === 'select' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Pointer / Select"
            >
              <MousePointer className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddElement('rectangle')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Add Rectangle / Card"
            >
              <Square className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddElement('circle')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Add Circle / Avatar"
            >
              <Circle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddElement('text')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Add Typography"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAddElement('button')}
              className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition text-[11px] font-bold"
              title="Add Button Component"
            >
              + Button
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Artboards selector */}
          <div className="flex items-center space-x-1">
            {artboards.map(ab => (
              <button
                key={ab.id}
                onClick={() => setActiveArtboardId(ab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeArtboardId === ab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ab.title}
              </button>
            ))}
            <button
              onClick={handleAddArtboard}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              title="Add Artboard Screen"
            >
              + Screen
            </button>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{saveStatus === 'saving' ? 'Auto-saving...' : 'Auto-saved'}</span>
          </span>

          <button
            onClick={() => {
              setPreviewActiveScreen(artboards[0]?.id || 'ab_1');
              setPreviewMode(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Prototype</span>
          </button>

          <button
            onClick={handleValidateAndSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Verifying Design...' : 'Submit & Validate'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Layers Tree */}
        <div className="w-48 bg-slate-950/80 border-r border-slate-800 flex flex-col p-3 overflow-y-auto">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Artboard Layers</span>
          </div>

          <div className="space-y-1">
            {layers
              .filter(l => l.artboardId === activeArtboardId)
              .map(layer => (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                    selectedLayerId === layer.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{layer.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(layer.id);
                    }}
                    className="text-slate-400 hover:text-rose-400 text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            {layers.filter(l => l.artboardId === activeArtboardId).length === 0 && (
              <p className="text-[11px] text-slate-500 italic py-2">No elements on this screen. Use the toolbar above to add shapes, text, or buttons.</p>
            )}
          </div>
        </div>

        {/* Center: Canvas Viewport */}
        <div className="flex-1 bg-slate-900/60 p-6 overflow-auto flex items-center justify-center relative">
          {/* Mobile Artboard Frame */}
          <div
            style={{ width: `${activeArtboard?.width || 320}px`, height: `${activeArtboard?.height || 480}px` }}
            className="bg-white rounded-3xl shadow-2xl relative border-4 border-slate-700 overflow-hidden select-none transition-all"
          >
            {/* Phone Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 mr-2" />
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Render Layers */}
            {layers
              .filter(l => l.artboardId === activeArtboardId)
              .map(layer => {
                const isSelected = selectedLayerId === layer.id;
                const hasProtoWire = prototypeLinks.some(pl => pl.sourceLayerId === layer.id);

                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    style={{
                      position: 'absolute',
                      left: `${layer.x}px`,
                      top: `${layer.y}px`,
                      width: `${layer.width}px`,
                      height: `${layer.height}px`,
                      backgroundColor: layer.type === 'text' ? 'transparent' : layer.fill,
                      color: layer.textColor || '#ffffff',
                      borderRadius: `${layer.borderRadius || 0}px`,
                      fontSize: `${layer.fontSize || 14}px`,
                      fontWeight: layer.fontWeight || 'normal'
                    }}
                    className={`cursor-pointer transition flex items-center justify-center text-center p-2 relative ${
                      isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:ring-1 hover:ring-indigo-300'
                    }`}
                  >
                    {layer.type === 'text' && (
                      <span style={{ color: layer.fill }}>{layer.text || 'Text Layer'}</span>
                    )}
                    {layer.type === 'button' && (
                      <span className="font-bold">{layer.text || 'Button'}</span>
                    )}
                    {layer.type === 'input' && (
                      <div className="w-full text-left px-2 text-slate-400 text-xs border border-slate-300 rounded bg-white">
                        {layer.text || 'Input field...'}
                      </div>
                    )}
                    {(layer.type === 'rectangle' || layer.type === 'circle') && (
                      <span className="text-[10px] opacity-75">{layer.name}</span>
                    )}

                    {hasProtoWire && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                        <Link2 className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Inspector Properties Panel */}
        <div className="w-64 bg-slate-950/90 border-l border-slate-800 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Sliders className="w-3.5 h-3.5" />
            <span>Design Inspector</span>
          </div>

          {selectedLayer ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Layer Name</label>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={(e) => handlePropertyChange('name', e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              {(selectedLayer.type === 'text' || selectedLayer.type === 'button' || selectedLayer.type === 'input') && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Label / Text Content</label>
                  <input
                    type="text"
                    value={selectedLayer.text}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              )}

              {/* Position and Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Width (px)</label>
                  <input
                    type="number"
                    value={selectedLayer.width}
                    onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Height (px)</label>
                  <input
                    type="number"
                    value={selectedLayer.height}
                    onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-xs"
                  />
                </div>
              </div>

              {/* Color styling */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Fill / Theme Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="color"
                    value={selectedLayer.fill}
                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <input
                    type="text"
                    value={selectedLayer.fill}
                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 font-mono text-white text-xs"
                  />
                </div>
              </div>

              {/* Corner Radius */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400">Corner Radius (px)</label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={selectedLayer.borderRadius || 0}
                  onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value))}
                  className="w-full mt-1"
                />
                <span className="text-[10px] text-slate-400">{selectedLayer.borderRadius || 0}px</span>
              </div>

              {/* Prototyping Link Wire */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-indigo-400 flex items-center space-x-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Prototype Interaction</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">On click, navigate to target screen:</p>
                <select
                  value={currentProtoTarget}
                  onChange={(e) => handleSetPrototypeTarget(e.target.value)}
                  className="w-full mt-1.5 bg-slate-900 border border-indigo-900/60 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="">None (Static)</option>
                  {artboards
                    .filter(a => a.id !== activeArtboardId)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        Navigate to {a.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select any layer on the canvas to inspect and edit design tokens.</p>
          )}
        </div>
      </div>

      {/* Interactive Prototype Player Modal */}
      {previewMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Play className="w-4 h-4 text-emerald-400 fill-current" />
                <h3 className="font-bold text-sm text-white">Live Prototype Preview</h3>
              </div>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Screen Container */}
            <div className="flex justify-center py-2">
              <div className="w-[300px] h-[450px] bg-white rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                {layers
                  .filter(l => l.artboardId === previewActiveScreen)
                  .map(layer => {
                    const wire = prototypeLinks.find(pl => pl.sourceLayerId === layer.id);

                    return (
                      <div
                        key={layer.id}
                        onClick={() => {
                          if (wire?.targetArtboardId) {
                            setPreviewActiveScreen(wire.targetArtboardId);
                          }
                        }}
                        style={{
                          position: 'absolute',
                          left: `${(layer.x * 300) / 320}px`,
                          top: `${(layer.y * 450) / 480}px`,
                          width: `${(layer.width * 300) / 320}px`,
                          height: `${(layer.height * 450) / 480}px`,
                          backgroundColor: layer.type === 'text' ? 'transparent' : layer.fill,
                          color: layer.textColor || '#ffffff',
                          borderRadius: `${layer.borderRadius || 0}px`,
                          fontSize: `${layer.fontSize || 13}px`,
                          fontWeight: layer.fontWeight || 'normal'
                        }}
                        className={`flex items-center justify-center text-center p-1 select-none ${
                          wire ? 'cursor-pointer hover:opacity-90 active:scale-95 transition ring-2 ring-emerald-400' : ''
                        }`}
                      >
                        {layer.type === 'text' ? (
                          <span style={{ color: layer.fill }}>{layer.text}</span>
                        ) : (
                          <span>{layer.text || layer.name}</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400">
              {artboards.find(a => a.id === previewActiveScreen)?.title || 'Active Screen'} — Click interactive components to test transitions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
