import React from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../../contexts/useUserProfile';
import Avatar from '../Avatar';
import DarkModeToggle from '../DarkModeToggle';
import { supabase } from '../../../supabaseClient';

export default function Header() {
  const { userProfile } = useUserProfile();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between px-4 lg:px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/images/logo.png" alt="Career Compass Logo" className="h-10 w-auto" />
        <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400 hidden sm:inline-block">
          Career Compass
        </span>
      </Link>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="w-full relative">
          <input
            type="text"
            placeholder="Search resources, skills..."
            className="w-full py-2 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Right Section - User Menu, Notifications, Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <DarkModeToggle className="text-sm" />

        {/* User Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {userProfile?.name || 'User'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {userProfile?.career_goal || 'Career seeker'}
            </div>
          </div>
          <div className="group relative">
            <Avatar
              name={userProfile?.name || 'User'}
              size="md"
              className="cursor-pointer ring-2 ring-indigo-100 dark:ring-indigo-900"
              src={userProfile?.avatar_url}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700 hidden group-hover:block">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userProfile?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {userProfile?.email || ''}
                </p>
              </div>
              
              <Link to="/onboarding" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Your Profile
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}