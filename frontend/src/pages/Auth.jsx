import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { supabase } from "../../supabaseClient";
import { useToast } from "../components/Toast";

// Email validation regex
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Password visibility toggle icon component
const EyeIcon = ({ visible, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
    aria-label={visible ? "Hide password" : "Show password"}
  >
    {visible ? (
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

// Empty component since we don't want the logo or text
const BrandLogo = () => null;

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
  const isSignupMode = name === 'password' && autoComplete === 'new-password';
  
  // Custom toggle button for password visibility
  const PasswordToggleIcon = () => (
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
      <PasswordToggleIcon />
      
      {/* Password strength indicator (only show for signup password field) */}
      {isSignupMode && value && (
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

export default function Auth() {
  const location = useLocation();
  const [mode, setMode] = useState(location.pathname === "/signup" ? "signup" : "login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const showToast = useToast();

  // Update mode when URL changes and clear errors when switching modes
  useEffect(() => {
    // Set mode based on URL path
    const newMode = location.pathname === "/signup" ? "signup" : "login";
    setMode(newMode);
    
    // Clear errors and messages when mode changes
    setErrors({});
    setMessage("");
  }, [location.pathname, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const validate = () => {
    let newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email format";
    
    if (!form.password) newErrors.password = "Password is required";
    else if (mode === "signup" && form.password.length < 8) 
      newErrors.password = "Password must be at least 8 characters";
    
    if (mode === "signup") {
      if (!form.confirm) newErrors.confirm = "Please confirm your password";
      else if (form.password !== form.confirm)
        newErrors.confirm = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const newErrors = validate();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);
      
      try {
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
          });
          
          if (error) {
            throw error;
          } else {
            showToast("Account created! Please check your email to verify before logging in.", "success");
            setMode("login");
          }
        } else {
          const { error, data } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });
          
          if (error) {
            if (error.message.toLowerCase().includes("email not confirmed")) {
              throw new Error("Please verify your email before logging in.");
            } else {
              throw error;
            }
          } else {
            showToast("Login successful!", "success");
            
            // Check if we have a stored redirect path
            const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
            localStorage.removeItem('redirectAfterLogin'); // Clear it after use
            
            // Check if user needs to complete onboarding first
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('is_onboarded, profile_complete')
                .eq('id', data.user.id)
                .single();
                
              console.log("Auth check for profile completion:", profileData);
              
              // If profile exists but is not complete, go to onboarding
              if (profileData && (!profileData.is_onboarded || !profileData.profile_complete)) {
                console.log("User needs to complete onboarding");
                localStorage.setItem('needsOnboarding', 'true');
                setTimeout(() => {
                  navigate("/onboarding");
                }, 1000);
              } else {
                // Otherwise go to the stored redirect or dashboard
                setTimeout(() => {
                  navigate(redirectTo);
                }, 1000);
              }
            } catch (profileErr) {
              console.error("Error checking profile completion:", profileErr);
              // If we can't determine profile status, go to onboarding to be safe
              setTimeout(() => {
                navigate("/onboarding");
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        setErrors({ general: error.message });
        showToast(error.message, "error");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleGoogle = async () => {
    try {
      // Check if we need to store a redirect path
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/auth') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      // Start the OAuth flow with Google
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      
      if (error) {
        throw error;
      } else {
        showToast("Redirecting to Google for authentication...", "info");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErrors({ general: error.message });
      showToast(error.message, "error");
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
        {message && (
          <div className="mb-6 py-4 px-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 flex items-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}
        
        <div className="flex justify-center mb-8 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl shadow-inner relative">
          {/* Animated selection indicator */}
          <div 
            className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 ease-in-out transform top-1"
            style={{ 
              left: mode === "login" ? "4px" : "calc(50% + 4px)",
            }}
          ></div>
          
          <button
            className={`flex-1 py-3.5 px-4 rounded-lg font-semibold text-base transition-colors duration-200 relative z-10 ${
              mode === "login"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-300"
            }`}
            onClick={() => navigate("/login")}
            disabled={submitting}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3.5 px-4 rounded-lg font-semibold text-base transition-colors duration-200 relative z-10 ${
              mode === "signup"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-300"
            }`}
            onClick={() => navigate("/signup")}
            disabled={submitting}
          >
            Sign Up
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
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
          
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          
          {mode === "signup" && (
            <PasswordInput
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              error={errors.confirm}
              placeholder="Confirm Password"
              autoComplete="new-password"
            />
          )}
          
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{errors.general}</span>
            </div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={submitting}
            size="lg"
            className="mt-6 py-4 text-lg font-semibold pulse-on-hover"
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>
          
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 py-1 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium rounded-full shadow-sm">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleGoogle}
            variant="secondary"
            fullWidth
            size="lg"
            className="py-3.5 shadow-md"
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.63 2.7 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.42 17.56 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.9-2.17 5.36-4.62 7.01l7.1 5.53C43.93 37.13 46.1 31.32 46.1 24.55z"/>
                  <path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 010-8.58l-7.98-6.2A23.97 23.97 0 000 24c0 3.77.9 7.34 2.69 10.49l7.98-6.2z"/>
                  <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.58l-7.1-5.53c-1.98 1.33-4.5 2.13-8.04 2.13-6.44 0-11.87-3.92-13.33-9.29l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </g>
              </svg>
            }
          >
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </Button>
        </form>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/signup")}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-200"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  onClick={() => navigate("/login")}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-200"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          
          {mode === "login" && (
            <div className="mt-5">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/30"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}