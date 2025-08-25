import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { useToast } from '../components/Toast';

// Password visibility toggle icon component
const PasswordToggleIcon = ({ showPassword, setShowPassword }) => (
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
    aria-label={showPassword ? "Hide password" : "Show password"}
    style={{ transform: 'translateY(-50%)' }}
  >
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

// Custom form input with password visibility toggle and strength indicator
const PasswordInput = ({ value, onChange, error, name, placeholder, autoComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Function to determine password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: 'bg-gray-200 dark:bg-gray-700' };
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Map strength to color and width
    const strengthMap = [
      { strength: 0, color: 'bg-gray-200 dark:bg-gray-700', width: '0%' },
      { strength: 1, color: 'bg-red-500', width: '20%' },
      { strength: 2, color: 'bg-orange-500', width: '40%' },
      { strength: 3, color: 'bg-yellow-500', width: '60%' },
      { strength: 4, color: 'bg-blue-500', width: '80%' },
      { strength: 5, color: 'bg-green-500', width: '100%' }
    ];
    
    return strengthMap[strength];
  };
  
  const passwordStrength = getPasswordStrength(value);
  
  return (
    <div className="relative">
      <FormInput
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        autoComplete={autoComplete}
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        rightIcon={<span className="w-5 h-5"></span>} // Placeholder to prevent error icon from appearing
        required
      />
      
      <PasswordToggleIcon showPassword={showPassword} setShowPassword={setShowPassword} />
      
      {/* Password strength indicator */}
      {value && (
        <div className="mt-1.5">
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${passwordStrength.color} transition-all duration-300 ease-out`}
              style={{ width: passwordStrength.width }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useToast();
  
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Validate token presence
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      showToast("Missing or invalid password reset token.", "error");
    }
  }, [token, showToast]);
  
  const validatePassword = () => {
    let newErrors = {};
    
    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validatePassword();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0 && token) {
      setIsSubmitting(true);
      
      try {
        const response = await fetch('/api/auth/password-reset-confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            token, 
            new_password: password 
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Something went wrong. Please try again.');
        }
        
        // Success
        setIsSuccess(true);
        showToast("Your password has been reset successfully.", "success");
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Password reset error:', error);
        showToast(error.message, "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // If token is invalid, show error state
  if (!isTokenValid) {
    return (
      <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900"></div>
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10 z-10 border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Invalid Reset Link</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              The password reset link is missing, invalid, or has expired.
            </p>
            <Link to="/forgot-password">
              <Button 
                variant="primary"
                fullWidth
                size="lg"
              >
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900"></div>
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10 z-10 border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Password Reset Complete</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link to="/login">
              <Button 
                variant="primary"
                fullWidth
                size="lg"
              >
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Normal form state
  return (
    <div className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Professional background elements */}
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
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Reset Your Password
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <PasswordInput
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Enter a strong password"
              autoComplete="new-password"
            />
          </div>
          
          <div className="space-y-3">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <PasswordInput
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            size="lg"
            className="mt-8 py-4 text-lg font-semibold pulse-on-hover"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
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
      </div>
    </div>
  );
}
