import React, { useState, useEffect } from 'react';
import { UserProfileContext } from './UserProfileContext.js';
import { supabase } from '../../supabaseClient';

export const UserProfileProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get session and subscribe to auth changes
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        setSession(session);
        console.log("Initial session loaded:", session ? "User is logged in" : "No active session");
        
        // Set up auth subscription
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event);
            
            if (event === 'SIGNED_IN') {
              console.log("User signed in with new session");
              setSession(newSession);
              
              // Clear any previous errors on new sign-in
              setError(null);
            } else if (event === 'SIGNED_OUT') {
              console.log("User signed out");
              setSession(null);
              clearProfile();
              
              // Optional: redirect to login page on sign out
              // window.location.href = '/login';
            } else if (event === 'TOKEN_REFRESHED') {
              console.log("Session token refreshed");
              setSession(newSession);
            } else if (event === 'USER_UPDATED') {
              console.log("User data updated");
              setSession(newSession);
            }
          }
        );
        
        return () => {
          if (authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      } catch (err) {
        console.error("Error getting auth session:", err);
        setError("Authentication error. Please try logging in again.");
        setLoading(false);
      }
    };
    
    getSession();
  }, []);
  
  // Load user profile from Supabase when session changes
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If no session, clear profile and return
        if (!session) {
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        // Try to fetch from Supabase
        console.log("Fetching profile from Supabase for user:", session.user.id);
        
        // First check if the table exists and create it if it doesn't
        // This ensures new installations work properly
        try {
          // We'll attempt to query the table first to see if it exists
          const { error: tableCheckError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
            
          if (tableCheckError && tableCheckError.code === '42P01') {
            console.log("Profiles table doesn't exist yet, application might be in initial setup");
          }
        } catch (tableErr) {
          console.warn("Error checking profiles table:", tableErr);
          // Continue with profile fetch attempt anyway
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
          console.warn("Error fetching profile from Supabase:", error);
          
          // Check if this might be a permissions issue or missing table
          if (error.code === '42P01' || error.message.includes('permission denied')) {
            throw new Error("Database setup issue. Please check Supabase configuration.");
          } else {
            throw error;
          }
        }
        
        // Get user metadata from session for fallback
        const userMeta = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User'
        };
        
        if (data) {
          console.log("✅ Profile successfully loaded from Supabase");
          
          // Check if profile needs metadata updates from latest session
          const updatedProfile = {
            ...data,
            // Ensure we always have these basic fields
            email: data.email || userMeta.email,
            name: data.name || userMeta.name,
            last_sign_in: new Date().toISOString()
          };
          
          setUserProfile(updatedProfile);
          
          // Update local storage
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          
          // Silently update profile with latest sign-in time
          supabase
            .from('profiles')
            .upsert(updatedProfile)
            .then(({error}) => {
              if (error) console.warn("Failed to update last sign in time:", error);
            });
            
        } else {
          console.log("No existing profile found, checking localStorage fallback");
          
          // No profile in Supabase, try localStorage as fallback
          const savedProfile = localStorage.getItem('userProfile');
          let profileData;
          
          if (savedProfile) {
            try {
              profileData = JSON.parse(savedProfile);
              console.log("Profile loaded from localStorage:", profileData);
              
              // Check if localStorage profile matches current user
              if (profileData.id !== session.user.id) {
                console.log("localStorage profile is for a different user, creating new profile");
                profileData = createNewUserProfile(session);
              }
            } catch (parseErr) {
              console.error("Error parsing localStorage profile:", parseErr);
              profileData = createNewUserProfile(session);
            }
          } else {
            console.log("No profile in localStorage, creating new profile");
            profileData = createNewUserProfile(session);
          }
          
          setUserProfile(profileData);
          
          // Create profile in Supabase
          const { error: createError } = await supabase
            .from('profiles')
            .upsert(profileData);
            
          if (createError) {
            console.error("Failed to create profile in Supabase:", createError);
          } else {
            console.log("✅ New profile created in Supabase");
          }
          
          // Also sync to backend
          try {
            await fetch('http://127.0.0.1:8000/api/user/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(profileData),
            });
          } catch (backendErr) {
            console.warn("Failed to sync new profile to backend:", backendErr);
          }
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile. Please refresh the page and try again.');
        
        // Try to use cached version as last resort
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            if (parsedProfile.id === session.user.id) {
              console.log("Using cached profile as fallback");
              setUserProfile(parsedProfile);
            }
          } catch (e) {
            console.error("Error parsing cached profile:", e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to create a new user profile
    function createNewUserProfile(session) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'New User',
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString(),
        is_onboarded: false,
        profile_complete: false,
        skills: [],
        career_goal: "",
        level: "Beginner"
      };
    }

    if (session) {
      loadUserProfile();
    } else {
      // No session, clear profile and stop loading
      setUserProfile(null);
      setLoading(false);
    }
  }, [session]);

  const updateProfile = async (newProfile) => {
    try {
      if (!session) {
        throw new Error('You must be logged in to update your profile');
      }
      
      // Ensure we have the current profile
      let currentProfile = userProfile;
      if (!currentProfile) {
        // Try to fetch latest from Supabase if no local profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          currentProfile = data;
        } else {
          // Create a minimal profile if nothing exists
          currentProfile = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 'User'
          };
        }
      }
      
      // Prepare the updated profile with timestamps
      const updatedProfile = { 
        ...currentProfile, 
        ...newProfile,
        id: session.user.id, // ensure ID is always correct
        updated_at: new Date().toISOString(),
        profile_complete: true, // Mark profile as complete when updated
        // If this update includes skills, career goals or education, consider onboarding complete
        is_onboarded: newProfile.skills || newProfile.career_goal || newProfile.education ? true : currentProfile.is_onboarded
      };
      
      console.log("Updating profile with data:", updatedProfile);
      
      // Update locally first for immediate UI response
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Track if any update fails
      let hasError = false;
      let errorMessage = "";
      
      // Send to Supabase
      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id,
          ...updatedProfile 
        });
        
      if (supabaseError) {
        console.error("Supabase profile update failed:", supabaseError);
        hasError = true;
        errorMessage = "Database update failed: " + supabaseError.message;
      } else {
        console.log("✅ Supabase profile updated successfully");
      }
      
      // Also update in backend
      try {
        const backendProfile = {
          ...updatedProfile,
          // Ensure we send email for identification
          email: updatedProfile.email || session.user.email
        };
        
        const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendProfile),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Backend profile update failed:', errorText);
          
          // Only set error if Supabase also failed
          if (hasError) {
            errorMessage += " Backend update also failed.";
          } else {
            console.log("Only backend update failed, profile still saved in Supabase");
          }
        } else {
          console.log("✅ Backend profile synced successfully");
          
          // Try to trigger roadmap generation if we have skills and career goal
          if (updatedProfile.skills?.length > 0 && updatedProfile.career_goal) {
            try {
              console.log("Initiating automatic roadmap generation...");
              fetch('http://127.0.0.1:8000/api/roadmap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: updatedProfile.email || session.user.email,
                  career_goal: updatedProfile.career_goal,
                  skills: updatedProfile.skills,
                  experience_level: updatedProfile.level || "Beginner"
                }),
              }).catch(e => console.warn("Non-critical roadmap generation error:", e));
            } catch (roadmapErr) {
              // Non-critical error, just log
              console.warn("Failed to trigger automatic roadmap generation:", roadmapErr);
            }
          }
        }
      } catch (backendErr) {
        console.warn('Error connecting to backend:', backendErr);
        // Don't consider this a complete failure if only backend failed
        if (hasError) {
          errorMessage += " Backend connection failed.";
        }
      }
      
      // Return appropriate result
      if (hasError) {
        return { 
          success: false, 
          data: updatedProfile, // Still return the data that was at least saved locally
          error: errorMessage,
          partial: true // Indicate that it partially worked (local storage)
        };
      } else {
        return { success: true, data: updatedProfile };
      }
    } catch (err) {
      console.error('Error in updateProfile function:', err);
      setError('Failed to update profile: ' + err.message);
      return { success: false, error: err.message };
    }
  };

  const clearProfile = () => {
    setUserProfile(null);
    localStorage.removeItem('userProfile');
  };

  return (
    <UserProfileContext.Provider 
      value={{ 
        userProfile, 
        session,
        loading, 
        error, 
        updateProfile, 
        clearProfile 
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};
