import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Shield, Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cyber-green/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyber-accent/5 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center rounded-full mb-4">
            <Eye className="text-cyber-green w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            EYE<span className="text-cyber-green">P</span>
          </h1>
          <p className="text-cyber-green/50 text-[10px] tracking-[0.3em] uppercase mt-1">
            Vision Assistive Portal
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-cyber-green/70 ml-1 tracking-widest">Email Access</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-green/50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-green/20 text-cyber-green focus:border-cyber-green outline-none transition-all"
                placeholder="operator@nexus.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-cyber-green/70 ml-1 tracking-widest">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-green/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-cyber-dark border border-cyber-green/20 text-cyber-green focus:border-cyber-green outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs bg-red-500/10 p-2 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyber-green text-cyber-black font-black uppercase tracking-widest hover:bg-cyber-accent transition-colors disabled:opacity-50 mt-4"
            style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
          >
            {loading ? 'Processing...' : isSignUp ? 'Initialize Profile' : 'Gain Access'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] uppercase tracking-widest text-cyber-green/50 hover:text-cyber-green transition-colors"
          >
            {isSignUp ? 'Already registered? Access terminal' : 'Need new credentials? Register ID'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
