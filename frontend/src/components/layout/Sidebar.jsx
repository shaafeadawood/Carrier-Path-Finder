import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserProfile } from '../../contexts/useUserProfile';

const SidebarLink = ({ to, icon, label, isActive, collapsed }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
};

export default function Sidebar({ collapsed = false, toggleCollapse }) {
  const location = useLocation();
  const { userProfile } = useUserProfile();
  const [section, setSection] = useState('main');

  // Navigation links with icons
  const mainNavItems = [
    { 
      to: '/dashboard', 
      icon: '📊', 
      label: 'Dashboard',
      active: location.pathname === '/dashboard' 
    },
    { 
      to: '/cv', 
      icon: '📝', 
      label: 'CV Manager',
      active: location.pathname === '/cv' 
    },
    { 
      to: '/job-recommendations', 
      icon: '🔍', 
      label: 'Job Matches',
      active: location.pathname === '/job-recommendations' 
    },
    { 
      to: '/skills-gap', 
      icon: '📈', 
      label: 'Skills Gap',
      active: location.pathname === '/skills-gap' 
    },
    { 
      to: '/learning-plan', 
      icon: '📚', 
      label: 'Learning Plan',
      active: location.pathname === '/learning-plan' 
    }
  ];

  return (
    <aside 
      className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Toggle button */}
      <button 
        onClick={toggleCollapse}
        className="self-end p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-2 mr-2 hidden md:block"
      >
        {collapsed ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        )}
      </button>

      {/* Profile summary */}
      <div className={`flex items-center gap-3 p-4 mb-3 ${collapsed ? 'justify-center' : ''}`}>
        {userProfile && (
          <>
            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-lg">
              {userProfile.name?.charAt(0) || userProfile.email?.charAt(0) || '?'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="font-medium truncate">{userProfile.name || 'User'}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{userProfile.email}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="px-3 mb-2">
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => setSection('main')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition 
              ${section === 'main' 
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'}
            `}
          >
            {collapsed ? '📋' : 'Main'}
          </button>
          <button
            onClick={() => setSection('tools')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition 
              ${section === 'tools' 
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'}
            `}
          >
            {collapsed ? '🛠️' : 'Tools'}
          </button>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {section === 'main' && (
          <div className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <SidebarLink 
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={item.active}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}

        {section === 'tools' && (
          <div className="flex flex-col gap-1">
            <SidebarLink 
              to="/onboarding" 
              icon="👤" 
              label="Profile Settings" 
              isActive={location.pathname === '/onboarding'} 
              collapsed={collapsed}
            />
            
            <div className="mt-4 px-3">
              <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${collapsed ? 'text-center' : ''}`}>
                {collapsed ? '💡' : 'Career Tools'}
              </h3>
            </div>
            
            <SidebarLink 
              to="/learning-plan" 
              icon="🎯" 
              label="Goal Tracking" 
              isActive={false} 
              collapsed={collapsed}
            />
            
            <SidebarLink 
              to="/learning-plan" 
              icon="📅" 
              label="Weekly Planner" 
              isActive={false} 
              collapsed={collapsed}
            />
            
            <SidebarLink 
              to="/learning-plan" 
              icon="🧩" 
              label="Skills Builder" 
              isActive={false} 
              collapsed={collapsed}
            />
          </div>
        )}
      </nav>

      {/* Footer - User Settings */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <Link
          to="/onboarding"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-200`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}