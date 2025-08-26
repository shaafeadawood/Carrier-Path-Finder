import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useUserProfile } from '../contexts/useUserProfile';
import DarkModeToggle from './DarkModeToggle';
import Avatar from './Avatar';
import Button from './Button';

// Component to conditionally show admin link if user is an admin
function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { session } = useUserProfile();

  useEffect(() => {
    async function checkAdminStatus() {
      if (!session?.user?.id) return;
      
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', session.user.id)
          .single();
          
        setIsAdmin(!!data);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      }
    }
    
    checkAdminStatus();
  }, [session]);

  if (!isAdmin) return null;
  
  return (
    <Link 
      to="/admin" 
      className="block px-4 py-2 text-sm text-purple-700 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
    >
      Admin Dashboard
    </Link>
  );
}

export default function Navbar() {
  const navigate = useNavigate(); // eslint-disable-line no-unused-vars
  const location = useLocation();
  const { session, userProfile } = useUserProfile();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState("");
  
  // Track authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // User dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const avatarRef = useRef(null);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutMsg("");
    setIsUserMenuOpen(false);
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any local storage items related to authentication
      localStorage.removeItem('userProfile');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('redirectAfterLogin');
      
      // Reset state
      setIsAuthenticated(false);
      setUserName("");
      setUserEmail("");
      
      setLogoutMsg("Logged out successfully. Redirecting...");
      setTimeout(() => {
        setLoggingOut(false);
        setLogoutMsg("");
        // Force a full page reload to clear any in-memory state
        window.location.href = '/login';
      }, 1200);
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutMsg("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 
      'text-white font-medium border-b-2 border-white' : 
      'text-white/80 hover:text-white hover:border-b-2 hover:border-white/50';
  };

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close user menu when clicking outside
      if (userMenuRef.current && 
          !userMenuRef.current.contains(event.target) &&
          avatarRef.current && 
          !avatarRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Update state when session or profile changes and check active session
  useEffect(() => {
    async function checkAuthState() {
      // Get current session directly from Supabase
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session;
      
      // Use Supabase session as the source of truth
      const isLoggedIn = !!currentSession;
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn && userProfile) {
        setUserName(userProfile.name || currentSession?.user?.email?.split('@')[0] || "User");
        setUserEmail(currentSession?.user?.email || "");
      } else if (isLoggedIn) {
        // Fallback if we have session but no profile
        setUserName(currentSession.user?.email?.split('@')[0] || "User");
        setUserEmail(currentSession?.user?.email || "");
      } else {
        setUserName("");
        setUserEmail("");
      }
    }
    
    checkAuthState();
  }, [session, userProfile]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-3 px-4 lg:px-6">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/images/logo.png" alt="Career Compass Logo" className="h-12 w-auto" />
              <span className="text-xl font-bold hidden sm:inline-block">Career Compass</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`py-2 px-1 transition-colors duration-200 ${isActive('/')}`}>Home</Link>
              
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className={`py-2 px-1 transition-colors duration-200 ${isActive('/dashboard')}`}>Dashboard</Link>
                  <Link to="/cv" className={`py-2 px-1 transition-colors duration-200 ${isActive('/cv')}`}>CV Manager</Link>
                  <Link to="/learning-plan" className={`py-2 px-1 transition-colors duration-200 ${isActive('/learning-plan')}`}>Learning Plan</Link>
                </>
              )}
              
              {!isAuthenticated && (
                <>
                  <Link to="/signup" className="py-2 px-1 transition-colors duration-200 text-white/80 hover:text-white">
                    Features
                  </Link>
                  <Link to="/contact" className="py-2 px-1 transition-colors duration-200 text-white/80 hover:text-white">
                    Contact
                  </Link>
                </>
              )}
              
              {isAuthenticated && (
                <Link to="/contact" className="py-2 px-1 transition-colors duration-200 text-white/80 hover:text-white">
                  Contact
                </Link>
              )}
            </nav>
            
            {/* Right side: Auth, User menu, Theme toggle */}
            <div className="flex items-center space-x-4">
              {/* Authentication buttons */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button 
                      variant="secondary"
                      size="sm"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup" className="hidden sm:block">
                    <Button 
                      variant="primary"
                      size="sm"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  {/* User avatar with dropdown */}
                  <button 
                    ref={avatarRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="hidden md:block font-medium">
                      {userName}
                    </span>
                    <Avatar 
                      name={userName} 
                      size="md"
                      className="ring-2 ring-white/30"
                    />
                  </button>
                  
                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div 
                      ref={userMenuRef}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                      </div>
                      
                      <Link 
                        to="/onboarding" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Your Profile
                      </Link>
                      
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Dashboard
                      </Link>

                      <AdminLink />
                      
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={loggingOut}
                      >
                        {loggingOut ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-2 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            <span>Logging out...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            <span>Sign out</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Dark mode toggle */}
              <DarkModeToggle />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden rounded-md p-1 text-white hover:text-white hover:bg-indigo-800 focus:outline-none"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile navigation menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden bg-indigo-800 shadow-inner pb-3 px-4">
              <Link to="/" className="block py-2.5 text-white border-b border-indigo-700">Home</Link>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block py-2.5 text-white border-b border-indigo-700">Dashboard</Link>
                  <Link to="/onboarding" className="block py-2.5 text-white border-b border-indigo-700">Profile</Link>
                  <Link to="/cv" className="block py-2.5 text-white border-b border-indigo-700">CV Manager</Link>
                  <Link to="/learning-plan" className="block py-2.5 text-white border-b border-indigo-700">Learning Plan</Link>
                  <div className="py-2.5 border-b border-indigo-700">
                    <AdminLink />
                  </div>
                  <Link to="/contact" className="block py-2.5 text-white">Contact Us</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2.5 text-white border-b border-indigo-700">Log In</Link>
                  <Link to="/signup" className="block py-2.5 text-white border-b border-indigo-700">Sign Up</Link>
                  <Link to="/contact" className="block py-2.5 text-white">Contact Us</Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>
      
      {/* Logout message notification */}
      {logoutMsg && (
        <div className="w-full text-center py-2 bg-green-100 text-green-700 font-medium shadow-inner">
          {logoutMsg}
        </div>
      )}
    </>
  );
}