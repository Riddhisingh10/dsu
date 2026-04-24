import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mock Supabase Client for standalone mode
const createMockClient = () => {
  console.warn('EYEP: Running in standalone mode (no environment variables found).')
  
  const mockUser = {
    id: 'demo-user-id',
    email: 'demo@eyep.io',
    user_metadata: { full_name: 'Demo Pilot' }
  };

  return {
    auth: {
      getSession: async () => {
        const session = localStorage.getItem('eyep_mock_session');
        return { data: { session: session ? JSON.parse(session) : null }, error: null };
      },
      signInWithPassword: async ({ email }) => {
        const session = { user: { ...mockUser, email } };
        localStorage.setItem('eyep_mock_session', JSON.stringify(session));
        return { data: { session }, error: null };
      },
      signUp: async ({ email }) => {
        const session = { user: { ...mockUser, email } };
        localStorage.setItem('eyep_mock_session', JSON.stringify(session));
        return { data: { session }, error: null };
      },
      onAuthStateChange: (callback) => {
        const session = localStorage.getItem('eyep_mock_session');
        if (session) {
          setTimeout(() => callback('SIGNED_IN', JSON.parse(session)), 0);
        }
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: async () => {
        localStorage.removeItem('eyep_mock_session');
        window.location.reload(); // Hard refresh to reset state
        return { error: null };
      }
    },
    from: (table) => ({
      select: () => ({
        eq: (key, val) => ({
          single: async () => {
            const data = localStorage.getItem(`eyep_${table}_${val}`);
            return { data: data ? JSON.parse(data) : null, error: null };
          }
        })
      }),
      upsert: async (payload) => {
        const key = `eyep_${table}_${payload.user_id}`;
        localStorage.setItem(key, JSON.stringify(payload));
        return { error: null };
      }
    })
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();
