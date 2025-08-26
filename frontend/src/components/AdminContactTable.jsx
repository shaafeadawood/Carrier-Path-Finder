import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Button from './Button';
import { useToast } from './Toast';

export default function AdminContactTable() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const showToast = useToast();

  const statusBadgeColors = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    spam: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  // Fetch contact form submissions
  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('contact_forms')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setMessages(data || []);
      } catch (err) {
        console.error('Error fetching contact messages:', err);
        setError('Failed to load contact messages. Please try again later.');
        showToast('Failed to load messages', 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [showToast]);

  // Update message status
  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('contact_forms')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status } : msg
      ));
      
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }

      showToast(`Message marked as ${status}`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // View message details
  const viewMessage = (message) => {
    setSelectedMessage(message);
  };

  // Close message details modal
  const closeMessageView = () => {
    setSelectedMessage(null);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full">
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{error}</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden w-full">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contact Form Submissions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage and respond to customer inquiries
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name / Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{message.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{message.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs">{message.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(message.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColors[message.status] || statusBadgeColors.new}`}>
                      {message.status || 'new'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewMessage(message)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Message Details</h3>
              <button
                onClick={closeMessageView}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(selectedMessage.created_at)}
                  </span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColors[selectedMessage.status] || statusBadgeColors.new}`}>
                    {selectedMessage.status || 'new'}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{selectedMessage.subject}</h4>
                <div className="flex items-center mb-6">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <a href={`mailto:${selectedMessage.email}`} className="hover:underline">{selectedMessage.email}</a>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</h5>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Received on {formatDate(selectedMessage.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Status: <span className="font-medium">{selectedMessage.status || 'new'}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus(selectedMessage.id, 'in_progress')}
                >
                  Mark In Progress
                </Button>
                <Button
                  variant={selectedMessage.status === 'resolved' ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => updateStatus(selectedMessage.id, 'resolved')}
                >
                  Mark Resolved
                </Button>
              </div>
              <div className="space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateStatus(selectedMessage.id, 'spam')}
                >
                  Mark as Spam
                </Button>
                <a href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="sm">
                    Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}