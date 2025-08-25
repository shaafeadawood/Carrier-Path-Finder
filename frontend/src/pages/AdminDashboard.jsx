import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { supabase } from '../../supabaseClient';
import Spinner from '../components/Spinner';
import FallbackNotice from '../components/FallbackNotice';

const AdminDashboard = () => {
  const { userProfile } = useUserProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (!userProfile?.id) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', userProfile.id)
          .single();

        if (error) throw error;
        
        setIsAdmin(!!data);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin privileges');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userProfile?.id]);

  // Navigation links for the admin dashboard
  const navLinks = [
    { path: '/admin', label: 'Overview', exact: true },
    { path: '/admin/contacts', label: 'Contact Messages' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/settings', label: 'Settings' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FallbackNotice 
          title="Access Denied"
          message="You don't have permission to access this area. Please contact an administrator if you believe this is a mistake."
          action={<Link to="/" className="btn btn-primary">Return to Home</Link>}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <FallbackNotice 
          title="Error"
          message={error}
          action={<button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Admin Dashboard</h1>
        
        {/* Admin Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap">
            {navLinks.map((link) => {
              const isActive = link.exact 
                ? location.pathname === link.path
                : location.pathname.startsWith(link.path);
              
              return (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={`mr-8 py-4 px-1 font-medium text-sm ${
                    isActive
                      ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Outlet for nested routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
