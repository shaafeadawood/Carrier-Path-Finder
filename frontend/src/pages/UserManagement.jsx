import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Spinner from '../components/Spinner';
import Card from '../components/Card';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;
  
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Calculate the range for pagination
      const start = (currentPage - 1) * usersPerPage;
      const end = start + usersPerPage - 1;
      
      // Create the query
      let query = supabase
        .from('profiles')
        .select('id, name, email, created_at, is_onboarded, profile_complete, level');
        
      // Apply search filter if searchTerm is provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      // Get total count for pagination
      const { count } = await query.select('id', { count: 'exact', head: true });
      setTotalPages(Math.ceil(count / usersPerPage));
      
      // Get paginated results
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(start, end);
        
      if (error) throw error;
      
      // Check if each user is an admin
      const usersWithAdminStatus = await Promise.all(
        data.map(async (user) => {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single();
            
          return {
            ...user,
            isAdmin: !!adminData,
            adminRole: adminData?.role || null
          };
        })
      );
      
      setUsers(usersWithAdminStatus);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMakeAdmin = async (userId, email) => {
    try {
      // Check if already an admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (existingAdmin) {
        toast.error('User is already an admin');
        return;
      }
      
      // Make the user an admin
      const { error } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: email,
          role: 'admin'
        });
        
      if (error) throw error;
      
      toast.success('User has been granted admin privileges');
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: true, adminRole: 'admin' } : user
      ));
      
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Failed to update user privileges');
    }
  };
  
  const handleRemoveAdmin = async (userId) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success('Admin privileges revoked');
      
      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: false, adminRole: null } : user
      ));
      
    } catch (error) {
      console.error('Error removing admin privileges:', error);
      toast.error('Failed to revoke admin privileges');
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-6">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">User Management</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg 
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="large" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        onClick={() => handleUserSelect(user)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-800 dark:text-primary-200 font-medium">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name || 'Unnamed User'}
                              </div>
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                                  {user.adminRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(user.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_onboarded ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.isAdmin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAdmin(user.id);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeAdmin(user.id, user.email);
                              }}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              Make Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {renderPagination()}
            </>
          )}
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        {selectedUser ? (
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Details</h2>
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-800 dark:text-primary-200 text-4xl font-medium">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedUser.name || 'Not provided'}</p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedUser.email}</p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Member since</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedUser.created_at)}</p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <div className="flex items-center mt-1">
                  <div className={`h-3 w-3 rounded-full mr-2 ${selectedUser.is_onboarded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {selectedUser.is_onboarded ? 'Active' : 'Pending Onboarding'}
                  </p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Profile Completion</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${selectedUser.profile_complete ? '100%' : '0%'}` }}
                  ></div>
                </div>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                  {selectedUser.profile_complete ? 'Complete' : 'Incomplete'}
                </p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Experience Level</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                  {selectedUser.level || 'Not specified'}
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No user selected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Click on a user to view detailed information
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
