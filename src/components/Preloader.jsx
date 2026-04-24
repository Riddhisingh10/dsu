import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING_CORE');

  const steps = [
    { threshold: 10, text: 'SYNCHRONIZING_NEURAL_LINK' },
    { threshold: 30, text: 'BOOTING_OPTICAL_ENGINE' },
    { threshold: 50, text: 'CALIBRATING_PIXEL_EMISSION' },
    { threshold: 70, text: 'LOADING_EYE_PROFILES' },
    { threshold: 90, text: 'FINALIZING_BIOMETRIC_SYNC' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 8;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1000);
          return 100;
        }
        
        const step = steps.find(s => next >= s.threshold && prev < s.threshold);
        if (step) setStatus(step.text);
        
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#060A14] flex flex-col items-center justify-center font-mono overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.1) 0%, transparent 70%)'
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Animated Logo Container */}
        <div className="relative w-48 h-48 mb-12">
          <motion.div 
            className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-4 border border-amber-500/10 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          <img 
            src="/logo.png" 
            alt="EYEP Logo" 
            className="w-full h-full object-contain p-4 brightness-125 drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          />
          
          {/* Scanning Line */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20 opacity-40"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Status Text */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-cyan-400 tracking-[0.4em] uppercase">
              System_Status
            </span>
          </div>
          <h2 className="text-sm font-bold text-white tracking-widest mb-8 min-w-[300px]">
            {status}... {Math.round(progress)}%
          </h2>
        </div>

        {/* Tactical Progress Bar */}
        <div className="w-64 h-1 bg-slate-900 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-600 to-amber-500"
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Memory Addresses (Faux Data) */}
        <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-1 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="text-[8px] text-cyan-500 font-mono">
              0x{Math.random().toString(16).substr(2, 8).toUpperCase()} // OK
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight 
          }}
          animate={{ 
            y: [null, Math.random() * -100],
            opacity: [0.2, 0]
          }}
          transition={{ 
            duration: Math.random() * 2 + 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />
      ))}
    </div>
  );
}
