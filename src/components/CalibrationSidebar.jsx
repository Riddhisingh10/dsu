import React from 'react';
import { Sliders, Eye, Activity, Save, AlertCircle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalibrationSidebar({ 
  config, 
  setConfig, 
  isSplit, 
  setIsSplit, 
  isAutoDistance,
  setIsAutoDistance,
  onSave, 
  loading 
}) {
  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: parseFloat(value) }));
  };

  return (
    <div className="w-80 h-full glass p-6 flex flex-col gap-8 overflow-y-auto border-r border-cyber-green/20">
      <div className="flex flex-col items-center gap-4 border-b border-cyber-green/20 pb-6 mb-2">
        <img 
          src="/logo.png" 
          alt="EYEP Logo" 
          className="w-full h-auto rounded-xl shadow-[0_0_20px_rgba(0,255,100,0.1)] border border-cyber-green/10"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden items-center gap-3">
          <Activity className="text-cyber-green w-6 h-6" />
          <h2 className="text-xl font-bold tracking-tighter text-cyber-green uppercase">
            EYEP NODE
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Neural Distance Toggle */}
        <div className="px-2">
          <button
            onClick={() => setIsAutoDistance(!isAutoDistance)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
              isAutoDistance 
              ? 'bg-cyber-green/20 border-cyber-green text-cyber-green shadow-[0_0_15px_rgba(0,255,100,0.1)]' 
              : 'bg-white/5 border-white/10 text-white/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <Cpu className={`w-4 h-4 ${isAutoDistance ? 'animate-pulse' : ''}`} />
              <div className="text-left">
                <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Neural Sensor</div>
                <div className="text-[8px] uppercase tracking-tighter opacity-50">Real-time CV Distance</div>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isAutoDistance ? 'bg-cyber-green shadow-[0_0_8px_#00ff64]' : 'bg-white/20'}`} />
          </button>
        </div>

        {/* Full Ophthalmic Prescription */}
        <div className="space-y-6">
          {/* Left Eye Segment */}
          <div className="space-y-4 p-4 bg-cyber-green/5 border border-cyber-green/10 rounded-lg">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyber-green mb-2 font-black border-b border-cyber-green/10 pb-2">Oculus Sinister (Left)</div>
            
            {/* Sphere */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Sphere (SPH)</span>
                <input type="number" min="-10" max="10" step="0.25" value={config.left_eye} onChange={(e) => handleChange('left_eye', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="-10" max="10" step="0.25" value={config.left_eye} onChange={(e) => handleChange('left_eye', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Cylinder */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Cylinder (CYL)</span>
                <input type="number" min="-6" max="6" step="0.25" value={config.left_cyl} onChange={(e) => handleChange('left_cyl', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="-6" max="6" step="0.25" value={config.left_cyl} onChange={(e) => handleChange('left_cyl', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Axis */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Axis</span>
                <div className="flex items-center">
                  <input type="number" min="0" max="180" step="1" value={config.left_axis} onChange={(e) => handleChange('left_axis', e.target.value)} className="w-16 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
                  <span className="text-cyber-green ml-1">°</span>
                </div>
              </div>
              <input type="range" min="0" max="180" step="1" value={config.left_axis} onChange={(e) => handleChange('left_axis', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Additional Power (AP) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Add Power (AP)</span>
                <input type="number" min="0" max="4" step="0.25" value={config.left_ap} onChange={(e) => handleChange('left_ap', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="0" max="4" step="0.25" value={config.left_ap} onChange={(e) => handleChange('left_ap', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Pupil Distance (PD) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Pupil Dist (PD)</span>
                <input type="number" min="20" max="45" step="0.5" value={config.left_pd} onChange={(e) => handleChange('left_pd', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="20" max="45" step="0.5" value={config.left_pd} onChange={(e) => handleChange('left_pd', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>
          </div>

          {/* Right Eye Segment */}
          <div className="space-y-4 p-4 bg-cyber-green/5 border border-cyber-green/10 rounded-lg">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyber-green mb-2 font-black border-b border-cyber-green/10 pb-2">Oculus Dexter (Right)</div>
            
            {/* Sphere */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Sphere (SPH)</span>
                <input type="number" min="-10" max="10" step="0.25" value={config.right_eye} onChange={(e) => handleChange('right_eye', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="-10" max="10" step="0.25" value={config.right_eye} onChange={(e) => handleChange('right_eye', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Cylinder */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Cylinder (CYL)</span>
                <input type="number" min="-6" max="6" step="0.25" value={config.right_cyl} onChange={(e) => handleChange('right_cyl', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="-6" max="6" step="0.25" value={config.right_cyl} onChange={(e) => handleChange('right_cyl', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Axis */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Axis</span>
                <div className="flex items-center">
                  <input type="number" min="0" max="180" step="1" value={config.right_axis} onChange={(e) => handleChange('right_axis', e.target.value)} className="w-16 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
                  <span className="text-cyber-green ml-1">°</span>
                </div>
              </div>
              <input type="range" min="0" max="180" step="1" value={config.right_axis} onChange={(e) => handleChange('right_axis', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Additional Power (AP) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Add Power (AP)</span>
                <input type="number" min="0" max="4" step="0.25" value={config.right_ap} onChange={(e) => handleChange('right_ap', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="0" max="4" step="0.25" value={config.right_ap} onChange={(e) => handleChange('right_ap', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>

            {/* Pupil Distance (PD) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-cyber-green/70">
                <span>Pupil Dist (PD)</span>
                <input type="number" min="20" max="45" step="0.5" value={config.right_pd} onChange={(e) => handleChange('right_pd', e.target.value)} className="w-20 bg-transparent border border-cyber-green/30 text-cyber-green text-right px-2 py-1 text-xs font-mono focus:border-cyber-green outline-none" />
              </div>
              <input type="range" min="20" max="45" step="0.5" value={config.right_pd} onChange={(e) => handleChange('right_pd', e.target.value)} className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Focal Distance */}
        <div className="space-y-3 px-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-cyber-green/70">
            <div className="flex items-center gap-2">
              <span>Observation Distance</span>
              {isAutoDistance && <div className="text-[8px] bg-cyber-green/20 px-1 rounded animate-pulse">AUTO</div>}
            </div>
            <span className="text-cyber-green">{config.distance_cm}cm</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="1"
            value={config.distance_cm}
            onChange={(e) => handleChange('distance_cm', e.target.value)}
            disabled={isAutoDistance}
            className={`w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer ${isAutoDistance ? 'opacity-30 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Contrast Boost */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs uppercase tracking-widest text-cyber-green/70">
            <span>Edge Contrast</span>
            <span className="text-cyber-green">x{config.contrast_boost.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={config.contrast_boost}
            onChange={(e) => handleChange('contrast_boost', e.target.value)}
            className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-auto">
        <button
          onClick={() => setIsSplit(!isSplit)}
          className={`flex items-center justify-between px-4 py-3 border transition-all duration-300 ${
            isSplit ? 'bg-cyber-green/10 border-cyber-green text-cyber-green' : 'border-white/10 text-white/50'
          }`}
        >
          <span className="text-xs font-bold uppercase">Split Simulation</span>
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={onSave}
          disabled={loading}
          className="cyber-button flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-red-900/20 border border-red-500/20 rounded flex gap-3">
        <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
        <p className="text-[10px] leading-tight text-red-200/70 italic">
          EYEP is an assistive software tool, not a medical device. Consult an optometrist for clinical correction.
        </p>
      </div>
    </div>
  );
}
