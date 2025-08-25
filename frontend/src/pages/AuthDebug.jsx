import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useUserProfile } from '../contexts/useUserProfile';
import Card from '../components/Card';

export default function AuthDebug() {
  const { session, userProfile, loading } = useUserProfile();
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [localStorageData, setLocalStorageData] = useState({});
  
  useEffect(() => {
    async function checkSupabaseSession() {
      try {
        setSessionLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("Supabase session error:", error);
        setSupabaseSession(data.session);
      } catch (err) {
        console.error("Error checking session:", err);
      } finally {
        setSessionLoading(false);
      }
    }
    
    // Get local storage data
    const storageItems = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      try {
        const value = localStorage.getItem(key);
        storageItems[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
      } catch (e) {
        storageItems[key] = '[Error reading value]';
      }
    }
    setLocalStorageData(storageItems);
    
    checkSupabaseSession();
  }, []);
  
  const handleForceLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('userProfile');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('redirectAfterLogin');
      alert('Forced logout successful. Refreshing page...');
      window.location.href = '/';
    } catch (error) {
      console.error('Error during forced logout:', error);
      alert('Error during forced logout: ' + error.message);
    }
  };
  
  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4">Loading authentication data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Context Session State */}
        <Card>
          <h2 className="text-xl font-bold mb-2">Context Session State</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <p><strong>Session Exists:</strong> {session ? 'Yes' : 'No'}</p>
            {session && (
              <>
                <p><strong>User ID:</strong> {session.user.id}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Last Sign In:</strong> {new Date(session.user.last_sign_in_at).toLocaleString()}</p>
              </>
            )}
          </div>
        </Card>
        
        {/* Supabase Direct Session */}
        <Card>
          <h2 className="text-xl font-bold mb-2">Supabase Direct Session</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <p><strong>Session Exists:</strong> {supabaseSession ? 'Yes' : 'No'}</p>
            {supabaseSession && (
              <>
                <p><strong>User ID:</strong> {supabaseSession.user.id}</p>
                <p><strong>Email:</strong> {supabaseSession.user.email}</p>
                <p><strong>Last Sign In:</strong> {new Date(supabaseSession.user.last_sign_in_at).toLocaleString()}</p>
              </>
            )}
          </div>
        </Card>
        
        {/* User Profile */}
        <Card>
          <h2 className="text-xl font-bold mb-2">User Profile</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <p><strong>Profile Exists:</strong> {userProfile ? 'Yes' : 'No'}</p>
            {userProfile && (
              <>
                <p><strong>ID:</strong> {userProfile.id}</p>
                <p><strong>Name:</strong> {userProfile.name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Onboarded:</strong> {userProfile.is_onboarded ? 'Yes' : 'No'}</p>
                <p><strong>Skills:</strong> {userProfile.skills?.join(', ') || 'None'}</p>
                <p><strong>Career Goal:</strong> {userProfile.career_goal || 'Not set'}</p>
              </>
            )}
          </div>
        </Card>
        
        {/* LocalStorage */}
        <Card>
          <h2 className="text-xl font-bold mb-2">LocalStorage Items</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-h-80 overflow-auto">
            <pre className="text-sm">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handleForceLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Force Logout & Clear Storage
        </button>
      </div>
    </div>
  );
}
