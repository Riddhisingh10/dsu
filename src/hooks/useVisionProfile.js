import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisionProfile(user) {
  const [config, setConfig] = useState({
    sphere: 0.0,
    distance_cm: 40,
    contrast_boost: 1.0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vision_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setConfig({
          sphere: data.sphere,
          distance_cm: data.distance_cm,
          contrast_boost: data.contrast_boost,
        });
      }
    } catch (err) {
      console.error('Error fetching vision profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (newConfig) => {
    if (!supabase) return false;
    try {
      setLoading(true);
      const { error } = await supabase
        .from('vision_configs')
        .upsert({
          user_id: user.id,
          sphere: newConfig.sphere,
          distance_cm: newConfig.distance_cm,
          contrast_boost: newConfig.contrast_boost,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving vision profile:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { config, setConfig, loading, saveProfile };
}
