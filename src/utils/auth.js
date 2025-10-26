import { supabase } from '../supabaseClient';

export const isUserLoggedIn = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Synchronous version for immediate checks (less reliable)
export const isUserLoggedInSync = () => {
  try {
    // Check if there's any auth data in localStorage
    const keys = Object.keys(localStorage);
    const authKey = keys.find(key => key.includes('supabase.auth.token'));
    if (!authKey) return false;
    
    const authData = localStorage.getItem(authKey);
    if (!authData) return false;
    
    const parsed = JSON.parse(authData);
    return !!(parsed && parsed.access_token);
  } catch (error) {
    return false;
  }
}; 