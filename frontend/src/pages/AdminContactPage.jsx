import React from 'react';
import AdminContactTable from '../components/AdminContactTable';
import Button from '../components/Button';

export default function AdminContactPage() {
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contact Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and respond to customer inquiries and feedback
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
            </svg>
          }
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3l-3-3" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Messages</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">Loading...</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">Loading...</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">Loading...</p>
            </div>
          </div>
        </div>

        {/* Contact Table */}
        <AdminContactTable />
        
        {/* Help & Info */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Managing Contact Submissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Handling Inquiries</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Review new messages promptly</li>
                <li>Mark messages as "In Progress" when you start addressing them</li>
                <li>Use the "Reply via Email" button to respond directly to customers</li>
                <li>Mark as "Resolved" once the inquiry has been addressed</li>
                <li>Flag as "Spam" any suspicious or inappropriate messages</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Best Practices</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>Respond to all inquiries within 24-48 hours</li>
                <li>Use a professional tone in all communications</li>
                <li>Provide clear and concise information</li>
                <li>Follow up with customers after resolving their inquiry</li>
                <li>Document common questions for FAQ development</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
