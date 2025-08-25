import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useToast } from '../components/Toast';

// Email validation regex
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Invalid email format";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/auth/password-reset-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Something went wrong. Please try again.');
        }
        
        // Success
        setEmailSent(true);
        showToast("If your email is registered, you'll receive password reset instructions soon.", "success");
      } catch (error) {
        console.error('Password reset request error:', error);
        showToast(error.message, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Professional background elements - adjusted for within-layout positioning */}
      <div className="absolute inset-0 z-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900"></div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Soft light blobs in background */}
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-indigo-400 to-blue-500"
              style={{
                width: `${Math.random() * 300 + 150}px`,
                height: `${Math.random() * 300 + 150}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.07,
                filter: 'blur(100px)',
                transform: `scale(${Math.random() * 0.6 + 0.4})`,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10 transform transition-all duration-500 hover:shadow-2xl z-10 border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.6s_ease-out] animate-[slideUp_0.5s_ease-out] my-16" style={{animation: 'fadeIn 0.6s ease-out, slideUp 0.5s ease-out'}}>
        {!emailSent ? (
          <>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
              Reset Your Password
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                error={errors.email}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                }
                autoComplete="email"
                required
              />
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                size="lg"
                className="mt-6 py-4 text-lg font-semibold pulse-on-hover"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
              
              <div className="text-center mt-4">
                <Link 
                  to="/login" 
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-200"
                >
                  Back to login
                </Link>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Check Your Email</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              If an account exists for {email}, you'll receive an email with a link to reset your password.
            </p>
            <div className="flex flex-col space-y-3">
              <Link to="/login">
                <Button 
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  Return to Login
                </Button>
              </Link>
              <button
                onClick={() => setEmailSent(false)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-200"
              >
                Try a different email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
