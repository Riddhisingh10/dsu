import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVisionProfile(user) {
  const [config, setConfig] = useState({
    sphere: 2.0,
    left_eye: 2.0,
    right_eye: 2.0,
    left_cyl: 0.0,
    right_cyl: 0.0,
    left_axis: 0,
    right_axis: 0,
    left_ap: 0.0,
    right_ap: 0.0,
    left_pd: 32,
    right_pd: 32,
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
          left_eye: data.left_eye || 0.0,
          right_eye: data.right_eye || 0.0,
          left_cyl: data.left_cyl || 0.0,
          right_cyl: data.right_cyl || 0.0,
          left_axis: data.left_axis || 0,
          right_axis: data.right_axis || 0,
          left_ap: data.left_ap || 0.0,
          right_ap: data.right_ap || 0.0,
          left_pd: data.left_pd || 32,
          right_pd: data.right_pd || 32,
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
          left_eye: newConfig.left_eye,
          right_eye: newConfig.right_eye,
          left_cyl: newConfig.left_cyl,
          right_cyl: newConfig.right_cyl,
          left_axis: newConfig.left_axis,
          right_axis: newConfig.right_axis,
          left_ap: newConfig.left_ap,
          right_ap: newConfig.right_ap,
          left_pd: newConfig.left_pd,
          right_pd: newConfig.right_pd,
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
