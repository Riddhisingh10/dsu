import React from 'react';
import { Sliders, Eye, Activity, Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CalibrationSidebar({ config, setConfig, isSplit, setIsSplit, onSave, loading }) {
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
        {/* Diopter Slider */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs uppercase tracking-widest text-cyber-green/70">
            <span>Lens Power (Sphere)</span>
            <span className="text-cyber-green">{config.sphere.toFixed(1)}D</span>
          </div>
          <input
            type="range"
            min="-6"
            max="4"
            step="0.1"
            value={config.sphere}
            onChange={(e) => handleChange('sphere', e.target.value)}
            className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer"
          />
        </div>

        {/* Focal Distance */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs uppercase tracking-widest text-cyber-green/70">
            <span>Focal Distance</span>
            <span className="text-cyber-green">{config.distance_cm}cm</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={config.distance_cm}
            onChange={(e) => handleChange('distance_cm', e.target.value)}
            className="w-full accent-cyber-green bg-cyber-green-dim h-1 rounded-full appearance-none cursor-pointer"
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
