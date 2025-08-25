import { useState, useEffect } from "react";
import Card from "../components/Card";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import SkillsVisualization from "../components/SkillsVisualization";
import ExportOptions from "../components/ExportOptions";
import CVImprovement from "../components/CVImprovement";
import JobRecommendations from "../components/JobRecommendations";
import FallbackNotice from "../components/FallbackNotice";

export default function CVSection() {
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // First try to get profile from localStorage (works without Supabase)
        const localProfile = localStorage.getItem('userProfile');
        if (localProfile) {
          try {
            const parsedProfile = JSON.parse(localProfile);
            setUserProfile(parsedProfile);
            console.log("Loaded profile from localStorage");
          } catch (parseErr) {
            console.warn("Error parsing localStorage profile:", parseErr);
          }
        }
        
        // Now try Supabase if available
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (!sessionError && session) {
            const { data, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
              
            if (!error && data) {
              console.log("Loaded profile from Supabase");
              setUserProfile(data);
              // Update local storage with latest data
              localStorage.setItem('userProfile', JSON.stringify(data));
            } else if (error) {
              console.warn("Supabase profile error:", error);
              
              // If we have a localStorage profile, we can continue
              if (!localProfile) {
                // Create a basic profile with just the user data from the session
                const basicProfile = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
                };
                setUserProfile(basicProfile);
                localStorage.setItem('userProfile', JSON.stringify(basicProfile));
                console.log("Created basic profile from session data");
              }
            }
          } else {
            console.log("No active Supabase session, using local data only");
          }
        } catch (supabaseErr) {
          console.warn("Error with Supabase:", supabaseErr);
          // Continue with localStorage profile
        }
        
        // If we still don't have a profile, create a guest profile
        if (!userProfile && !localStorage.getItem('userProfile')) {
          const guestProfile = {
            id: "guest-" + Math.random().toString(36).substring(2, 9),
            name: "Guest User",
            email: "guest@example.com"
          };
          setUserProfile(guestProfile);
          localStorage.setItem('userProfile', JSON.stringify(guestProfile));
          console.log("Created guest profile");
        }
      } catch (err) {
        console.error("Error in profile handling:", err);
        setStatusMessage("Using offline mode - profile features limited.");
      }
    }
    
    fetchUserProfile();
  }, [navigate, userProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCvFile(file);
    setFileName(file.name);
    setStatusMessage("");
    setParsedData(null);
  };

  const uploadCV = async () => {
    if (!cvFile) {
      setStatusMessage("Please select a file to upload");
      return;
    }
    
    setLoading(true);
    setStatusMessage("Processing your CV with AI...");
    
    // Start multiple timers to update the user on progress
    const timers = [];
    
    timers.push(setTimeout(() => {
      if (loading) {
        setStatusMessage("Processing is taking longer than expected. Our AI is analyzing your document thoroughly.");
      }
    }, 10000)); // 10 seconds timeout
    
    timers.push(setTimeout(() => {
      if (loading) {
        setStatusMessage("Still processing... This might take up to a minute for large documents.");
      }
    }, 20000)); // 20 seconds timeout
    
    timers.push(setTimeout(() => {
      if (loading) {
        setStatusMessage("The AI service might be experiencing delays. We'll continue trying for a few more seconds...");
      }
    }, 30000)); // 30 seconds timeout
    
    // Set a hard timeout after 45 seconds to avoid hanging indefinitely
    timers.push(setTimeout(() => {
      if (loading) {
        setLoading(false);
        setStatusMessage("Request timed out. The AI service might be unavailable or experiencing issues. Please try again with a different file or try later.");
        setParsedData(null);
      }
    }, 45000)); // 45 seconds hard timeout
    
    try {
      const formData = new FormData();
      formData.append("cv_file", cvFile);
      
      // Include user email if available for profile update
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        formData.append("email", session.user.email);
      }
      
      // Use the new improved CV parser API endpoint
      const response = await fetch("http://127.0.0.1:8001/cv/parse", {
        method: "POST",
        body: formData,
      });
      
      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to process CV";
        
        try {
          // Try to parse error as JSON
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text
          if (errorText) errorMessage = errorText;
        }
        
        if (errorMessage.includes("rate limit")) {
          setStatusMessage(`API rate limit reached. Using basic extraction method with reduced accuracy. Try again later for full analysis.`);
          setIsUsingFallback(true);
        } else if (errorMessage.includes("format")) {
          setStatusMessage(`Error: Document format not supported or corrupted. Please try a different file.`);
        } else {
          setStatusMessage(`Error: ${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse the successful response
      const result = await response.json();
      console.log("API Response:", result);
      
      // We have some form of response, check what kind
      if (result.status === "success" || result.status === "partial" || result.status === "error_with_fallback") {
        // Get the data whether it's from API, fallback, or cache
        let cvData = result.data || {};
        
        // Additional processing for nested parsed_data if needed
        if (cvData.parsed_data) {
          cvData = cvData.parsed_data;
        }
        
        console.log("Processed CV data:", cvData);
        
        // Check if we have workflow_result with skills_analysis
        if (result.workflow_result && result.workflow_result.skills_analysis) {
          console.log("Found skills_analysis in workflow_result:", result.workflow_result.skills_analysis);
          // Add the skills_analysis to the CV data
          cvData.skills_analysis = result.workflow_result.skills_analysis;
          
          // Also add other workflow results if available
          if (result.workflow_result.career_recommendations) {
            cvData.career_recommendations = result.workflow_result.career_recommendations;
          }
          
          if (result.workflow_result.roadmap) {
            cvData.roadmap = result.workflow_result.roadmap;
          }
        } else {
          console.log("No skills_analysis found in API response");
        }
        
        // Add the full response as metadata for debugging
        cvData.full_api_response = result;
        
        // Set the parsed data and show details
        setParsedData(cvData);
        setShowDetail(true);
        
        // Check if we're using fallback mode due to API limits
        const fallbackMode = result.status === "error_with_fallback" || 
                            (result.api_error && result.api_error.includes("rate limit")) ||
                            (result.message && result.message.includes("basic extraction")) ||
                            (result.source && result.source === "fallback");
                            
        setIsUsingFallback(fallbackMode);
        
        // Show appropriate messages based on result status and extracted data
        if (result.status === "success" && !fallbackMode && !result.message) {
          setStatusMessage("CV processed successfully!");
        } else if (result.message) {
          if (fallbackMode) {
            setStatusMessage(`${result.message} We're using our basic extraction capability.`);
          } else {
            setStatusMessage(result.message);
          }
        } else if (result.status === "partial") {
          setStatusMessage("CV processed partially. Some information may be missing.");
        } else if (result.status === "error_with_fallback") {
          setStatusMessage("There was an issue processing your CV, but we extracted some basic information.");
        }
        
        // Check if we have useful data and show which parts were extracted
        const extractedParts = [];
        if (cvData.name && cvData.name !== "Name not detected") extractedParts.push("name");
        if (cvData.email && cvData.email !== "Email not detected") extractedParts.push("email");
        if (cvData.skills && Array.isArray(cvData.skills) && cvData.skills.length > 0 && 
            cvData.skills[0] !== "Skills extraction requires full API" && 
            cvData.skills[0] !== "Insufficient document text") {
          extractedParts.push("skills");
        }
        if (cvData.education && 
            (typeof cvData.education === "string" && cvData.education !== "Could not extract education information") || 
            (Array.isArray(cvData.education) && cvData.education.length > 0)) {
          extractedParts.push("education");
        }
        if (cvData.work_experience && 
            (typeof cvData.work_experience === "string" && cvData.work_experience !== "Could not extract work experience") || 
            (Array.isArray(cvData.work_experience) && cvData.work_experience.length > 0)) {
          extractedParts.push("work experience");
        }
        
        if (extractedParts.length > 0) {
          if (fallbackMode) {
            setStatusMessage(`CV processed using basic extraction. Successfully extracted: ${extractedParts.join(", ")}.`);
          } else {
            setStatusMessage(`CV processed successfully. Extracted: ${extractedParts.join(", ")}.`);
          }
        } else {
          setStatusMessage("CV processing returned minimal data. Please try manual input or a different file format.");
        }
      } else {
        // Unexpected result status
        setStatusMessage(`Unexpected response format from server. Please try again.`);
        console.error("Unexpected API response format:", result);
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
      
      if (!error.message.includes("API rate limit") && !error.message.includes("format")) {
        // Only set error message if not already set by specific error handling above
        setStatusMessage(`Error: ${error.message || "Failed to upload CV. Please check your connection and try again."}`);
      }
    } finally {
      // Clear all timers
      timers.forEach(timer => clearTimeout(timer));
      setLoading(false);
    }
  };

  const saveToProfile = async () => {
    if (!parsedData) {
      setStatusMessage("No CV data available.");
      return;
    }
    
    setLoading(true);
    setStatusMessage("Updating your profile...");
    
    try {
      // Try to get current session, but handle the case where Supabase is not working
      let userId = null;
      let userEmail = null;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!sessionError && session) {
          userId = session.user.id;
          userEmail = session.user.email;
          console.log("Got valid user session:", userId);
        } else {
          console.warn("No valid Supabase session:", sessionError);
        }
      } catch (sessionErr) {
        console.warn("Error getting Supabase session:", sessionErr);
        // Continue with local storage only
      }
      
      // Prepare profile data from parsed CV
      const profileData = {
        id: userId || "local-user",
        name: parsedData.name || (userProfile?.name || "User"),
        email: parsedData.email || (userProfile?.email || userEmail || "user@example.com"),
        education: Array.isArray(parsedData.education) ? 
          parsedData.education.map(edu => 
            `${edu.degree || ""} in ${edu.field || ""} from ${edu.institution || ""}`
          ).join(", ") : (parsedData.education || userProfile?.education || ""),
        experience: Array.isArray(parsedData.work_experience) ?
          parsedData.work_experience.map(exp => 
            `${exp.role || exp.position || ""} at ${exp.company || ""}`
          ).join(", ") : (parsedData.work_experience || userProfile?.experience || ""),
        projects: Array.isArray(parsedData.projects) ? 
          parsedData.projects.map(proj => proj.name).join(", ") : (parsedData.projects || userProfile?.projects || ""),
        interests: Array.isArray(parsedData.interests) ? 
          parsedData.interests.join(", ") : (parsedData.interests || userProfile?.interests || ""),
        skills: Array.isArray(parsedData.skills) ? 
          parsedData.skills : (userProfile?.skills || []),
        updated_at: new Date().toISOString()
      };
      
      // Always update localStorage copy first (this will work even without Supabase)
      localStorage.setItem('userProfile', JSON.stringify({...userProfile, ...profileData}));
      console.log("Updated user profile in local storage");

      // Try to update in Supabase if we have a user ID
      if (userId) {
        try {
          const { error: supabaseError } = await supabase
            .from('profiles')
            .upsert(profileData);
            
          if (supabaseError) {
            console.warn("Supabase update error:", supabaseError);
            
            // Check if it's a table not found error
            if (supabaseError.message && supabaseError.message.includes("table")) {
              setStatusMessage("Profile saved locally. Supabase table 'profiles' not found.");
            } else {
              setStatusMessage("Profile saved locally. Supabase update failed: " + supabaseError.message);
            }
          } else {
            console.log("Updated profile in Supabase successfully");
            setStatusMessage("Profile updated in Supabase successfully!");
          }
        } catch (supabaseErr) {
          console.warn("Exception updating Supabase:", supabaseErr);
          setStatusMessage("Profile saved locally. Supabase update error: " + supabaseErr.message);
        }
      } else {
        setStatusMessage("Profile saved locally (not logged in to Supabase)");
      }
      
      // Try to send to backend API as well
      try {
        const response = await fetch('http://127.0.0.1:8001/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        
        if (response.ok) {
          console.log("Updated profile in backend API");
        } else {
          console.warn("Backend API update warning:", await response.text());
        }
      } catch (backendErr) {
        console.warn("Backend API update error:", backendErr);
        // Non-critical error, we can continue without the backend
      }
      
      // Update local state
      setUserProfile({...userProfile, ...profileData});
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        setStatusMessage("Profile saved! Redirecting to dashboard...");
        try {
          navigate("/dashboard");
        } catch (navErr) {
          console.warn("Navigation error:", navErr);
          // Fallback - redirect to home
          window.location.href = "/";
        }
      }, 2000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatusMessage(`Error: ${error.message || "Failed to update profile. Profile saved locally only."}`);
    } finally {
      setLoading(false);
    }
  };

  const renderParsedData = () => {
    if (!parsedData) {
      console.log("No parsedData available to render");
      return null;
    }

    console.log("Rendering CV data:", parsedData);

    try {
      return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Extracted Information
          </h3>
          
          <FallbackNotice isVisible={isUsingFallback} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Personal Info</h4>
              <p><span className="font-medium">Name:</span> {parsedData.name || "Not found"}</p>
              <p><span className="font-medium">Email:</span> {parsedData.email || "Not found"}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {Array.isArray(parsedData.skills) && parsedData.skills.length > 0 ? (
                  parsedData.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills extracted</p>
                )}
              </div>
            </div>
          </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Education</h4>
          {Array.isArray(parsedData.education) && parsedData.education.length > 0 ? (
            <ul className="list-disc list-inside pl-4 space-y-1">
              {parsedData.education.map((edu, i) => (
                <li key={i}>
                  {edu.degree} in {edu.field} from {edu.institution}
                  {edu.date && <span className="text-gray-500"> ({edu.date})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p>{parsedData.education || "No education information extracted"}</p>
          )}
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Work Experience</h4>
          {Array.isArray(parsedData.work_experience) && parsedData.work_experience.length > 0 ? (
            <ul className="list-disc list-inside pl-4 space-y-1">
              {parsedData.work_experience.map((exp, i) => (
                <li key={i}>
                  {exp.position} at {exp.company}
                  {exp.duration && <span className="text-gray-500"> ({exp.duration})</span>}
                  {exp.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-4 mt-1">
                      {exp.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>{parsedData.work_experience || "No work experience extracted"}</p>
          )}
        </div>
        
        {(Array.isArray(parsedData.projects) && parsedData.projects.length > 0) && (
          <div className="mt-4">
            <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Projects</h4>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {parsedData.projects.map((proj, i) => (
                <li key={i}>
                  {proj.name}
                  {proj.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-4 mt-1">
                      {proj.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {(Array.isArray(parsedData.interests) && parsedData.interests.length > 0) && (
          <div className="mt-4">
            <h4 className="font-medium text-indigo-600 dark:text-indigo-400">Interests</h4>
            <p>{parsedData.interests.join(", ")}</p>
          </div>
        )}
        
        {Array.isArray(parsedData.skills) && parsedData.skills.length > 0 && (
          <SkillsVisualization skills={parsedData.skills} />
        )}
        
        {/* CV Improvement Suggestions */}
        <CVImprovement 
          data={parsedData} 
          isUsingFallback={isUsingFallback} 
          userId={userProfile?.id}
        />
        
        {/* Export options */}
        <ExportOptions data={parsedData} />
        
        <div className="mt-6 flex justify-between">
          <button 
            onClick={() => setShowDetail(false)} 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Hide Details
          </button>
          <button 
            onClick={saveToProfile} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            disabled={loading}
          >
            Update Profile with This Data
          </button>
        </div>
      </div>
    );
    } catch (error) {
      console.error("Error rendering CV data:", error);
      return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-400">
            Error Displaying CV Data
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            There was an error displaying your CV data. Please try uploading a different file or contact support.
          </p>
          <pre className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-auto">
            {JSON.stringify(parsedData, null, 2)}
          </pre>
        </div>
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        CV / Resume Manager
      </h1>
      
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Upload Your CV
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Upload your CV to extract your skills, education, and work experience. 
            Our AI-powered tool will analyze your document and help you keep your profile updated.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              id="cv-upload"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label 
              htmlFor="cv-upload"
              className="cursor-pointer inline-block mb-4"
            >
              <div className="flex flex-col items-center">
                <svg 
                  className="w-12 h-12 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="mt-2 text-gray-600 dark:text-gray-300">
                  {fileName ? fileName : "Click to select a file"}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Supports PDF, DOC, and DOCX formats
                </span>
              </div>
            </label>
            
            {fileName && (
              <div className="mt-4">
                <button
                  onClick={uploadCV}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Upload and Analyze CV"
                  )}
                </button>
              </div>
            )}
          </div>
          
          {statusMessage && (
            <div className={`p-4 rounded-lg ${
              statusMessage.startsWith("Error") || statusMessage.includes("rate limit") 
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                : statusMessage.includes("basic extraction") || statusMessage.includes("partially")
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}>
              <div className="flex items-start">
                {statusMessage.startsWith("Error") || statusMessage.includes("rate limit") ? (
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : statusMessage.includes("basic extraction") || statusMessage.includes("partially") ? (
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  {statusMessage}
                  {statusMessage.includes("rate limit") && (
                    <p className="mt-2 text-sm">
                      <strong>Tip:</strong> The CV analysis is using basic extraction due to API rate limits. 
                      This provides less detailed results. Try again later for full AI-powered analysis.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {showDetail && renderParsedData()}
        </div>
      </Card>
      
      {/* Quick links section */}
      {/* Show job recommendations if CV data is available */}
      {parsedData && <JobRecommendations cvData={parsedData} isUsingFallback={isUsingFallback} />}
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            View Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            See your career progress
          </p>
        </button>
        
        <button 
          onClick={() => navigate('/onboarding')} 
          className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Update Profile Manually
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edit your profile information
          </p>
        </button>
      </div>
      
      {/* Animation styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
