import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useUserProfile } from "../contexts/useUserProfile";

export default function ProtectedRoute({ requiresOnboarding = false }) {
  const location = useLocation();
  const { session, userProfile, loading } = useUserProfile();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    async function checkSessionAndRedirect() {
      try {
        console.log("ProtectedRoute check - Loading:", loading, "Context Session:", !!session, "UserProfile:", !!userProfile);
        
        // Get session directly from Supabase as source of truth
        const { data, error } = await supabase.auth.getSession();
        const currentSession = data?.session;
        
        // Log authentication state for debugging
        console.log("Supabase direct session check result:", !!currentSession, "Error:", !!error);
        
        // Wait for loading to complete OR if we already know there's no session
        if (!loading || (!currentSession && !loading)) {
          if (!currentSession) {
            console.log("No active session found in Supabase, redirecting to login");
            // Store the current path to redirect back after login
            localStorage.setItem('redirectAfterLogin', location.pathname);
            setRedirectPath('/login');
          } else if (requiresOnboarding && userProfile && !userProfile.is_onboarded) {
            // If route requires completed onboarding but user hasn't done it
            console.log("User not onboarded, redirecting to onboarding");
            setRedirectPath('/onboarding');
          } else if (location.pathname === '/onboarding' && userProfile?.is_onboarded) {
            // Don't let onboarded users go back to onboarding
            console.log("User already onboarded, redirecting to dashboard");
            setRedirectPath('/dashboard');
          } else {
            // No redirect needed - user is authenticated
            console.log("Authentication check passed, allowing access to protected route");
            setRedirectPath(null);
          }
          setIsCheckingRedirect(false);
        }
      } catch (error) {
        console.error("Error in ProtectedRoute:", error);
        // On error, default to secure behavior - redirect to login
        setRedirectPath('/login');
        setIsCheckingRedirect(false);
      }
    }

    checkSessionAndRedirect();
  }, [location.pathname, loading, session, userProfile, requiresOnboarding]);

  // Check for ongoing CV parsing or profile operations
  const isPendingOperation = localStorage.getItem('pendingOperation') === 'true';
  
  // While checking auth or if there's a pending operation, show loading
  // Only show loading if we're still checking or have a pending operation
  if ((isCheckingRedirect && loading) || isPendingOperation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's a redirect path, navigate there
  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Otherwise render the protected content
  return <Outlet />;
}
