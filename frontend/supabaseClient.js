import { createClient } from '@supabase/supabase-js';

// Use environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values in case environment variables are not available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using fallback values. This is not recommended for production.');
}

// Create a custom Supabase client with debug hooks
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    debug: true, // Enable debug mode for auth
    onAuthStateChange: (event, session) => {
      console.log(`Supabase Auth Event: ${event}`, session ? "Session exists" : "No session");
      
      // Log additional details for debugging
      if (session) {
        console.log(`User: ${session.user.email}, ID: ${session.user.id}`);
        console.log(`Token expires: ${new Date(session.expires_at * 1000).toLocaleString()}`);
      }
      
      // When signing out, ensure local storage is properly cleared
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing local storage items');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('redirectAfterLogin');
      }
    }
  }
});

// Check and log initial session on load
async function checkInitialSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log("Initial Supabase Session Check:", data.session ? "User is logged in" : "No active session");
    if (error) console.error("Session check error:", error);
  } catch (err) {
    console.error("Error checking session:", err);
  }
}

// Run the check when the file is imported
checkInitialSession();