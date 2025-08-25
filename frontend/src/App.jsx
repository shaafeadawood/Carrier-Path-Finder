import React from "react";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Routes, Route } from "react-router-dom";
import { UserProfileProvider } from './contexts/UserProfileProvider';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CVSection from './pages/CVSection.jsx'
import LearningPlanPage from './pages/LearningPlanPage.jsx'
import SkillsGapPage from './pages/SkillsGapPage.jsx'
import JobRecommendationPage from './pages/JobRecommendationPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import AuthDebug from './pages/AuthDebug.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import AdminContactPage from './pages/AdminContactPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminOverview from './pages/AdminOverview.jsx'
import UserManagement from './pages/UserManagement.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Non-dashboard layout for public pages
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="py-6 px-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 dark:text-gray-300 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Career Compass. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 text-sm">Terms of Service</a>
            <a href="/contact" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 text-sm">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  // Add console log for debugging
  console.log("App rendering - " + new Date().toISOString());

  return (
    <ThemeProvider>
      <UserProfileProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Auth /></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><Auth /></PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
            <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/auth-debug" element={<PublicLayout><AuthDebug /></PublicLayout>} />
            
            {/* Protected routes with app layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<PublicLayout><Onboarding /></PublicLayout>} />
              <Route path="/cv" element={<AppLayout><CVSection /></AppLayout>} />
              <Route path="/learning-plan" element={<AppLayout><LearningPlanPage /></AppLayout>} />
              <Route path="/learning-plan/:targetJobId" element={<AppLayout><LearningPlanPage /></AppLayout>} />
              <Route path="/learning-plan/career/:targetCareerPathId" element={<AppLayout><LearningPlanPage /></AppLayout>} />
              <Route path="/skills-gap" element={<AppLayout><SkillsGapPage /></AppLayout>} />
              <Route path="/job-recommendations" element={<AppLayout><JobRecommendationPage /></AppLayout>} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="contacts" element={<AdminContactPage />} />
                <Route path="users" element={<UserManagement />} />
                {/* We can add more admin routes here later */}
                <Route path="settings" element={
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">System Settings</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      System settings configuration will be implemented in a future update.
                    </p>
                  </div>
                } />
              </Route>
            </Route>
          </Routes>
        </ToastProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}