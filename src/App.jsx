import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import VisionEngine from './components/VisionEngine';
import CalibrationSidebar from './components/CalibrationSidebar';
import PowerInputModal from './components/PowerInputModal';
import { useVisionProfile } from './hooks/useVisionProfile';
import { LogOut, Monitor, Settings, Maximize2, Shield } from 'lucide-react';
import VisionSensor from './components/VisionSensor';
import Preloader from './components/Preloader';

function App() {
  const [session, setSession] = useState({ user: { id: 'local-user', email: 'guest@eyep.io' } });
  const [isSplit, setIsSplit] = useState(true);
  const [activeImage, setActiveImage] = useState(1);
  const [isAutoDistance, setIsAutoDistance] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [initialPower, setInitialPower] = useState({ sphere: 2.0, cyl: 0, axis: 0 });

  // Hook MUST be called before any useEffect that references its return values
  const { config, setConfig, loading, saveProfile } = useVisionProfile(session?.user);

  const demoImages = [
    '/demo/text_sample.png',
    '/demo/1.png',
    '/demo/2.png',
    '/demo/3.png',
    '/demo/4.png'
  ];

  const handleSave = useCallback(async () => {
    if (!config) return;
    const success = await saveProfile(config);
    if (success) console.log('EYEP: Profile saved.');
  }, [config, saveProfile]);

  // When the user submits their prescription from the onboarding modal
  const handlePrescriptionSubmit = useCallback((prescription) => {
    // Calculate the mathematical mean (average) for binocular synchronization
    const meanSphere = ((prescription.left_eye + prescription.left_ap) + (prescription.right_eye + prescription.right_ap)) / 2;
    const meanCyl = (prescription.left_cyl + prescription.right_cyl) / 2;
    const meanAxis = (prescription.left_axis + prescription.right_axis) / 2;

    const power = {
      sphere: meanSphere,
      cyl: meanCyl,
      axis: meanAxis
    };
    
    setInitialPower(power);
    
    // Set the live configuration to use these mean values as the baseline
    setConfig(prev => ({
      ...prev,
      ...prescription,
      // We can also ensure the initial live state starts at the target mean if desired
    }));
    
    setIsCalibrated(true);
  }, [setConfig]);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (!isCalibrated) return; // Don't allow shortcuts before calibration

      if (e.key >= '1' && e.key <= '5') {
        setActiveImage(parseInt(e.key));
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSplit(prev => !prev);
      }
      if (e.key.toLowerCase() === 'a') {
        setIsAutoDistance(prev => !prev);
      }
      if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSave, isCalibrated]);

  // Show the high-fidelity preloader
  if (loading || !config) {
    return <Preloader onComplete={() => {}} />;
  }

  // Show the onboarding modal if the user hasn't entered their prescription yet
  if (!isCalibrated) {
    return <PowerInputModal onSubmit={handlePrescriptionSubmit} />;
  }

  // Compute the aggregated power values for the shader
  const aggregatedSphere = ((config.left_eye + config.left_ap) + (config.right_eye + config.right_ap)) / 2;
  const aggregatedCyl = (config.left_cyl + config.right_cyl) / 2;
  const aggregatedAxis = (config.left_axis + config.right_axis) / 2;

  return (
    <div className="flex flex-col h-screen bg-[#060A14] text-slate-300 font-mono selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Tactical Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(245,158,11,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-amber-500/10 bg-[#0D1424]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="relative">
               <img src="/logo.png" alt="EYEP" className="w-8 h-8 object-contain brightness-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
               <div className="absolute -inset-1 border border-amber-500/20 rounded-full animate-pulse" />
             </div>
             <div className="h-4 w-px bg-slate-800 mx-2" />
             <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase italic">
               EYEP <span className="text-amber-500/80">Software-Defined Sight</span>
             </h1>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-bold">
           {/* Live power readout in header */}
           <div className="flex items-center gap-3 text-cyan-400/70 tracking-widest bg-black/40 px-3 py-1 border border-slate-800 rounded-sm">
              <span className="text-amber-500/50">SPH:</span> {aggregatedSphere.toFixed(2)}
              <span className="text-slate-700">|</span>
              <span className="text-amber-500/50">CYL:</span> {aggregatedCyl.toFixed(2)}
              <span className="text-slate-700">|</span>
              <span className="text-amber-500/50">AXIS:</span> {aggregatedAxis.toFixed(0)}°
           </div>
           <div className="flex items-center gap-2 text-slate-400 tracking-[0.2em]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span>EYEP_LINK_STABLE</span>
           </div>
           <div className="text-slate-500">
              {time.toLocaleTimeString([], { hour12: false })} UTC
           </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="flex-1 grid grid-cols-12 gap-1 p-1 overflow-hidden">
        
        {/* Left Column: Prescription & Controls */}
        <div className="col-span-3 flex flex-col gap-1 overflow-hidden">
          <CalibrationSidebar 
            config={config} 
            setConfig={setConfig} 
            isSplit={isSplit}
            setIsSplit={setIsSplit}
            isAutoDistance={isAutoDistance}
            setIsAutoDistance={setIsAutoDistance}
            onSave={handleSave}
            loading={loading}
          />
        </div>

        {/* Center Column: Primary Viewport */}
        <div className="col-span-9 flex flex-col gap-1 overflow-hidden relative group border border-slate-800 bg-black">
           {/* Viewport Header */}
           <div className="bg-[#0D1424] border-b border-slate-800 p-3 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                 <Monitor className="w-4 h-4 text-cyan-400" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Visual Engine Output</span>
              </div>
              <div className="flex gap-1">
                {demoImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i + 1)}
                    className={`w-6 h-6 border flex items-center justify-center text-[9px] transition-all font-bold ${
                      activeImage === i + 1 ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-slate-800 text-slate-600 hover:border-slate-700'
                    }`}
                  >
                    0{i + 1}
                  </button>
                ))}
              </div>
           </div>

           {/* Main Canvas Area */}
           <div className="flex-1 relative overflow-hidden">
              <VisionSensor 
                active={isAutoDistance} 
                onDistanceUpdate={(d) => setConfig(prev => ({ ...prev, distance_cm: d }))} 
              />
              <VisionEngine 
                config={{
                  ...config,
                  sphere: aggregatedSphere,
                  cyl: aggregatedCyl,
                  axis: aggregatedAxis,
                }} 
                initialPower={initialPower}
                isSplit={isSplit}
                imageUrl={demoImages[activeImage - 1]}
              />
              
              {/* Overlay HUD */}
              <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between border-[12px] border-black/20">
                 <div className="flex justify-between items-start">
                    <div className="bg-[#0D1424]/60 backdrop-blur-sm p-3 border border-white/5 space-y-1">
                       <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest">Target_Sync</span>
                       </div>
                       <div className="text-xl font-mono text-white/40 leading-none">
                          {config.distance_cm}
                          <span className="text-[10px] ml-1">cm</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.4em]">
                       Node_01 // Render_Scale: 1.0x
                    </div>
                    <div className="flex gap-2 pointer-events-auto">
                       <button
                         onClick={() => setIsCalibrated(false)}
                         className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-500 hover:text-cyan-400 transition-all text-[8px] font-bold uppercase tracking-wider px-3"
                       >
                         Recalibrate
                       </button>
                       <button className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-500 hover:text-cyan-400 transition-all">
                          <Maximize2 size={12} />
                       </button>
                       <button className="p-2 bg-slate-900 border border-slate-800 hover:border-cyan-400 text-slate-500 hover:text-cyan-400 transition-all">
                          <Settings size={12} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Global Status Bar */}
      <footer className="h-8 bg-[#0D1424] border-t border-slate-800 flex items-center px-6 text-[8px] uppercase tracking-[0.3em] font-black text-slate-600 shrink-0">
        <div className="flex gap-12">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>EYEP_PROTO: ACTIVE</span>
           </div>
           <div>Transmission: 1.25 GBPS</div>
           <div>Buffers: NOMINAL</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
           <Shield size={10} className="text-cyan-500" />
           <span>Security Node: Enabled</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
