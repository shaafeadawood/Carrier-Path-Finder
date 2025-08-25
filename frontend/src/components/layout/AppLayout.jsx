import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../hooks/useTheme';

export default function AppLayout({ children }) {
  const { isDarkMode } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  return (
    <div className={`flex h-screen flex-col ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar collapsed={sidebarCollapsed} toggleCollapse={toggleSidebar} />
        </div>
        
        {/* Mobile Sidebar Toggle */}
        <button 
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-indigo-600 text-white shadow-lg md:hidden"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
        
        {/* Content Area */}
        <main className={`flex-1 overflow-auto transition-all duration-300 bg-gray-50 dark:bg-gray-900`}>
          <div className="h-full max-w-7xl mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
