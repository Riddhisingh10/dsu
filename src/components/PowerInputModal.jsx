import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ArrowRight, Zap, Shield } from 'lucide-react';

export default function PowerInputModal({ onSubmit }) {
  const [step, setStep] = useState(0); // 0 = welcome, 1 = left eye, 2 = right eye
  const [prescription, setPrescription] = useState({
    left_eye: 0, left_cyl: 0, left_axis: 0, left_ap: 0, left_pd: 32,
    right_eye: 0, right_cyl: 0, right_axis: 0, right_ap: 0, right_pd: 32,
  });

  const update = (field, value) => {
    setPrescription(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleComplete = () => {
    onSubmit(prescription);
  };

  const inputStyle = "w-full bg-[#0A0F1A] border border-cyan-500/30 text-cyan-400 text-center px-3 py-3 text-lg font-mono focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.15)] outline-none transition-all rounded-sm";
  const labelStyle = "text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2 block";

  return (
    <div className="fixed inset-0 z-[100] bg-[#060A14] flex items-center justify-center font-mono overflow-hidden">
      {/* Tactical Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#060A14_100%)]" />
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-500/30 rounded-full"
          initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0], y: [null, Math.random() * window.innerHeight] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <AnimatePresence mode="wait">
        {/* STEP 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center max-w-lg px-8"
          >
            <motion.div
              className="w-40 h-40 mx-auto mb-10 relative flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="absolute inset-0 bg-cyan-500/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <img 
                src="/logo.png" 
                alt="EYEP Logo" 
                className="w-full h-full object-contain relative z-10 brightness-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] rounded-lg"
                onError={(e) => {
                  e.target.src = "https://cdn-icons-png.flaticon.com/512/25/25231.png";
                }}
              />
            </motion.div>

            <h1 className="text-3xl font-black text-white uppercase tracking-[0.15em] mb-4">
              EYEP <span className="text-cyan-400">Vision</span> Platform
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              Adaptive display technology that pre-distorts pixel emissions to compensate for refractive errors in real-time.
            </p>
            <p className="text-xs text-cyan-400/60 uppercase tracking-widest mb-10">
              Enter your prescription to begin calibration
            </p>

            <motion.button
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-black uppercase tracking-[0.2em] text-sm hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] transition-all duration-300 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-4 h-4" />
              Begin Calibration
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="mt-8 text-[8px] text-slate-600 uppercase tracking-[0.3em]">
              EYEP is not a medical device. Consult an optometrist for clinical prescriptions.
            </div>
          </motion.div>
        )}

        {/* STEP 1: Left Eye */}
        {step === 1 && (
          <motion.div
            key="left-eye"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 w-full max-w-md px-8"
          >
            <div className="bg-[#0D1424]/80 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Step 1 of 2</span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">Left Eye</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8">Oculus Sinister (OS)</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelStyle}>Sphere (SPH)</label>
                  <input type="number" min="-10" max="10" step="0.25" value={prescription.left_eye} onChange={e => update('left_eye', e.target.value)} className={inputStyle} placeholder="-2.50" />
                </div>
                <div>
                  <label className={labelStyle}>Cylinder (CYL)</label>
                  <input type="number" min="-6" max="6" step="0.25" value={prescription.left_cyl} onChange={e => update('left_cyl', e.target.value)} className={inputStyle} placeholder="-0.75" />
                </div>
                <div>
                  <label className={labelStyle}>Axis (°)</label>
                  <input type="number" min="0" max="180" step="1" value={prescription.left_axis} onChange={e => update('left_axis', e.target.value)} className={inputStyle} placeholder="90" />
                </div>
                <div>
                  <label className={labelStyle}>Add Power (AP)</label>
                  <input type="number" min="0" max="4" step="0.25" value={prescription.left_ap} onChange={e => update('left_ap', e.target.value)} className={inputStyle} placeholder="1.00" />
                </div>
              </div>

              <div className="mb-8">
                <label className={labelStyle}>Pupil Distance - Left (mm)</label>
                <input type="number" min="20" max="45" step="0.5" value={prescription.left_pd} onChange={e => update('left_pd', e.target.value)} className={inputStyle} placeholder="32" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-slate-700 text-slate-500 text-xs font-bold uppercase tracking-widest hover:border-slate-500 transition-all">
                  Back
                </button>
                <motion.button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 text-xs font-bold uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  Right Eye <ArrowRight className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Right Eye */}
        {step === 2 && (
          <motion.div
            key="right-eye"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 w-full max-w-md px-8"
          >
            <div className="bg-[#0D1424]/80 backdrop-blur-xl border border-cyan-500/20 p-8 rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Step 2 of 2</span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-1">Right Eye</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8">Oculus Dexter (OD)</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelStyle}>Sphere (SPH)</label>
                  <input type="number" min="-10" max="10" step="0.25" value={prescription.right_eye} onChange={e => update('right_eye', e.target.value)} className={inputStyle} placeholder="-2.50" />
                </div>
                <div>
                  <label className={labelStyle}>Cylinder (CYL)</label>
                  <input type="number" min="-6" max="6" step="0.25" value={prescription.right_cyl} onChange={e => update('right_cyl', e.target.value)} className={inputStyle} placeholder="-0.75" />
                </div>
                <div>
                  <label className={labelStyle}>Axis (°)</label>
                  <input type="number" min="0" max="180" step="1" value={prescription.right_axis} onChange={e => update('right_axis', e.target.value)} className={inputStyle} placeholder="90" />
                </div>
                <div>
                  <label className={labelStyle}>Add Power (AP)</label>
                  <input type="number" min="0" max="4" step="0.25" value={prescription.right_ap} onChange={e => update('right_ap', e.target.value)} className={inputStyle} placeholder="1.00" />
                </div>
              </div>

              <div className="mb-8">
                <label className={labelStyle}>Pupil Distance - Right (mm)</label>
                <input type="number" min="20" max="45" step="0.5" value={prescription.right_pd} onChange={e => update('right_pd', e.target.value)} className={inputStyle} placeholder="32" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-slate-700 text-slate-500 text-xs font-bold uppercase tracking-widest hover:border-slate-500 transition-all">
                  Back
                </button>
                <motion.button
                  onClick={handleComplete}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-400/50 text-white text-xs font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  Launch EYEP Engine
                </motion.button>
              </div>
            </div>

            {/* Prescription Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 bg-[#0D1424]/50 border border-slate-800 p-4 rounded-lg"
            >
              <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3">Prescription Summary</div>
              <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div>
                  <div className="text-cyan-400/60 font-bold uppercase tracking-widest mb-1">Left (OS)</div>
                  <div className="text-white/70 font-mono">
                    SPH {prescription.left_eye >= 0 ? '+' : ''}{prescription.left_eye} / CYL {prescription.left_cyl >= 0 ? '+' : ''}{prescription.left_cyl} × {prescription.left_axis}°
                  </div>
                </div>
                <div>
                  <div className="text-emerald-400/60 font-bold uppercase tracking-widest mb-1">Right (OD)</div>
                  <div className="text-white/70 font-mono">
                    SPH {prescription.right_eye >= 0 ? '+' : ''}{prescription.right_eye} / CYL {prescription.right_cyl >= 0 ? '+' : ''}{prescription.right_cyl} × {prescription.right_axis}°
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
