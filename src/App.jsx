import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import VisionEngine from './components/VisionEngine';
import CalibrationSidebar from './components/CalibrationSidebar';
import { useVisionProfile } from './hooks/useVisionProfile';
import { LogOut, Monitor, Settings, Maximize2 } from 'lucide-react';

function App() {
  const [session, setSession] = useState({ user: { id: 'local-user', email: 'guest@eyep.io' } });
  const [isSplit, setIsSplit] = useState(true);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) setSession(existingSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { config, setConfig, loading, saveProfile } = useVisionProfile(session?.user);

  const handleSave = async () => {
    const success = await saveProfile(config);
    if (success) {
      console.log('EYEP: Profile saved locally.');
    }
  };

  return (
    <div className="flex h-screen bg-cyber-black text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <CalibrationSidebar 
        config={config} 
        setConfig={setConfig} 
        isSplit={isSplit}
        setIsSplit={setIsSplit}
        onSave={handleSave}
        loading={loading}
      />

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        {/* Header */}
        <header className="h-16 glass border-b border-cyber-green/10 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="EYEP" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <Monitor className="hidden text-cyber-green w-5 h-5" />
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">
              Primary Viewport <span className="text-cyber-green/50">Node_01</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-[10px] text-right">
              <div className="text-cyber-green/50 uppercase tracking-widest">System Status</div>
              <div className="text-white font-bold">CALIBRATED</div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 relative">
          <VisionEngine config={config} isSplit={isSplit} />
          
          {/* Overlay elements */}
          <div className="absolute inset-0 pointer-events-none border-[20px] border-cyber-black/20" />
          <div className="absolute top-8 left-8 p-4 glass border border-cyber-green/10 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyber-green animate-pulse rounded-full" />
              <span className="text-[10px] uppercase font-bold text-cyber-green tracking-widest">System Live</span>
            </div>
            <div className="text-[20px] font-mono text-cyber-green/30 select-none">
              {new Date().toLocaleTimeString([], { hour12: false })}
            </div>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-2">
             <button className="p-3 glass border border-cyber-green/10 text-cyber-green hover:bg-cyber-green/10 transition-all">
               <Maximize2 className="w-4 h-4" />
             </button>
             <button className="p-3 glass border border-cyber-green/10 text-cyber-green hover:bg-cyber-green/10 transition-all">
               <Settings className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Footer Stats */}
        <footer className="h-10 glass border-t border-cyber-green/10 flex items-center px-8 text-[10px] uppercase tracking-widest text-cyber-green/40">
          <div className="flex gap-8">
            <span>Latency: 2ms</span>
            <span>GPU: Stable (60FPS)</span>
            <span>Precision: High-Orbit</span>
          </div>
          <div className="ml-auto italic">
            EYEP v1.0.0 // Assistive Graphics Engine
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
