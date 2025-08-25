import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

export default function ContactPage() {
  const showToast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing in a field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
      isValid = false;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the API URL from env variable or use default
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9990';
      console.log(`Trying API URL: ${API_URL}/api/contact`);
      
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
        // Simplified CORS handling
        credentials: 'omit', // Changed from 'include' to avoid CORS preflight issues
        mode: 'cors',
      });
      
      // Check if the response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || errorData.message || 'Something went wrong. Please try again later.');
        } catch {
          // If parsing fails, use the raw error text
          throw new Error(errorText || 'Something went wrong. Please try again later.');
        }
      }
      
      // Parse the response as JSON, with proper error handling
      let responseData;
      try {
        responseData = await response.json();
        console.log("Form submission successful:", responseData);
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        // The response was ok but we couldn't parse the JSON
        throw new Error('Server returned an invalid response. Please try again later.');
      }
      
      // Success
      showToast("Thank you, we'll get back to you soon.", "success");
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Check if it's a network error (Failed to fetch)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('Network error details:', error);
        
        // More helpful message for network errors
        showToast(`Network error: Could not connect to the API server at ${import.meta.env.VITE_API_URL || 'http://localhost:9990'}. Please ensure the backend server is running.`, "error");
        
        // Provide more guidance in the console
        console.info('Troubleshooting steps:');
        console.info('1. Make sure the API server is running on port 9999');
        console.info('2. Check for CORS issues in browser console');
        console.info('3. Verify the API endpoint URL is correct');
      } else {
        showToast(error.message || 'Failed to submit form. Please try again later.', "error");
      }
      
      // Log additional debug info to console
      console.debug('API URL used:', import.meta.env.VITE_API_URL || 'http://localhost:9990');
      console.debug('Form data attempted to send:', formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Have questions about Career Compass? Reach out to us and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              error={errors.name}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              required
            />
            
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              error={errors.email}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
              required
            />
          </div>
          
          <FormInput
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Subject of your message"
            error={errors.subject}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            }
            required
          />
          
          <div className="mb-4">
            <label htmlFor="message" className="block mb-1.5 font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <div className="relative form-focus-ring rounded-xl">
              <div className="absolute top-4 left-4 text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className={`
                  border rounded-xl px-5 py-4 pl-12 w-full 
                  transition-all duration-200 
                  focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500
                  dark:bg-gray-800 dark:border-gray-700 dark:text-white
                  shadow-md hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600
                  ${errors.message ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-700'}
                `}
                placeholder="How can we help you?"
                required
              ></textarea>
            </div>
            {errors.message && (
              <p className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.message}
              </p>
            )}
          </div>
          
          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="py-4 px-12 text-lg font-semibold pulse-on-hover"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Email Us</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Send us an email directly</p>
          <a href="mailto:support@careercompass.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            support@careercompass.com
          </a>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Live Chat</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Chat with our support team</p>
          <button onClick={() => alert('Chat feature coming soon!')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Start Chat
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Schedule Call</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Book a consultation with us</p>
          <button onClick={() => alert('Scheduling feature coming soon!')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Book Appointment
          </button>
        </div>
      </div>
      
      <div className="mt-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Need Help or Experiencing Issues?</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Find quick answers to common questions about Career Compass or test the API connection.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => alert('FAQ page coming soon!')}
            className="font-medium"
          >
            Visit FAQ Page
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('/api-test.html', '_blank')}
            className="font-medium text-blue-600"
          >
            API Test Tool
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              const apiUrl = prompt('Enter API URL to test:', 'http://localhost:9990');
              if (apiUrl) {
                fetch(`${apiUrl}/api/ping`)
                  .then(response => response.json())
                  .then(data => alert(`API Response: ${JSON.stringify(data)}`))
                  .catch(error => alert(`API Error: ${error.message}`));
              }
            }}
            className="font-medium text-green-600"
          >
            Test Custom API URL
          </Button>
        </div>
      </div>
    </div>
  );
}
