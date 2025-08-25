import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

function TagInput({ tags, setTags }) {
  const [input, setInput] = useState("");
  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput("");
    }
  };
  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-indigo-600 text-white rounded-full flex items-center gap-2"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          placeholder="Add a skill and press Enter"
          className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [tags, setTags] = useState([]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("manual");
  const [cvName, setCvName] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    education: "",
    experience: "",
    projects: "",
    interests: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const navigate = useNavigate();

  // Load user profile if exists
  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      setLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) {
          navigate("/login");
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("name,email,education,experience,projects,interests,skills")
          .eq("id", session.user.id)
          .single();
        if (!cancelled && data) {
          setForm({
            name: data.name || "",
            email: data.email || "",
            education: data.education || "",
            experience: data.experience || "",
            projects: data.projects || "",
            interests: data.interests || "",
          });
          setTags(data.skills || []);
        }
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
          setSaveMsg("Could not load profile. Showing blank onboarding form.");
        }
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [navigate]);

  const steps = [
    "Personal Info",
    "Education",
    "Work Experience",
    "Skills",
    "Projects",
    "Interests",
  ];

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvName(file.name);
      setCvFile(file);
    }
  };
  
  const [cvFile, setCvFile] = useState(null);
  const [cvParsingStatus, setCvParsingStatus] = useState("");
  const [cvParsingError, setCvParsingError] = useState("");
  const [isParsingCV, setIsParsingCV] = useState(false);
  
    const parseCV = async () => {
        if (!cvFile) {
          setCvParsingError("Please select a CV file first.");
          return;
        }
        
        setIsParsingCV(true);
        setCvParsingError("");
        setCvParsingStatus("Uploading and parsing your CV...");
        
        // Set a timeout for long-running requests
        const timeoutId = setTimeout(() => {
          if (isParsingCV) {
            setCvParsingStatus("Processing is taking longer than expected. Please wait...");
          }
        }, 10000);
        
        try {
          // Create form data for file upload
          const formData = new FormData();
          formData.append("file", cvFile);
          
          // Include user email if available
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            formData.append("email", session.user.email);
          }
          
          // Send the file to the new improved CV parser endpoint
          const response = await fetch("http://127.0.0.1:8000/api/cv/parse", {
            method: "POST",
            body: formData,
          });
          
          // Check for non-OK responses
          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = "Failed to parse CV";
            
            try {
              // Try to parse error as JSON
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.detail || errorMessage;
            } catch (_) {
              // If not JSON, use the raw text
              if (errorText) errorMessage = errorText;
            }
            
            if (errorMessage.includes("rate limit")) {
              setCvParsingStatus(`API rate limit reached. Using basic extraction method with reduced accuracy.`);
            } else {
              throw new Error(errorMessage);
            }
          }
          
          const result = await response.json();
          console.log("CV Parsing Result:", result);
          
          // Check the response status
          if (result.status === "success" || result.status === "partial" || result.status === "error_with_fallback") {
            // Get the data whether it's from API, fallback, or cache
            let cvData = result.data || {};
            
            // Additional processing for nested parsed_data if needed
            if (cvData.parsed_data) {
              cvData = cvData.parsed_data;
            }
            
            console.log("Extracted CV data:", cvData);
            
            // Check if we received any meaningful data
            if (!cvData.name && !cvData.email && (!cvData.skills || cvData.skills.length === 0)) {
              setCvParsingError("Could not extract meaningful data from your CV. Please try a different file format or enter details manually.");
              setIsParsingCV(false);
              clearTimeout(timeoutId);
              return;
            }
            
            // Check if name looks like a section header instead of a real name
            if (cvData.name && ["About Me", "Profile", "Personal Information", "Curriculum Vitae", "Resume"].includes(cvData.name)) {
              console.log("Detected section header instead of name:", cvData.name);
              cvData.name = ""; // Clear invalid name
            }
            
            // Get the current user session for Supabase
            let currentUserEmail = "";
            try {
              const sessionResponse = await supabase.auth.getSession();
              currentUserEmail = sessionResponse.data?.session?.user?.email || "";
              console.log("Current user email from session:", currentUserEmail);
            } catch (sessionError) {
              console.error("Error getting session:", sessionError);
            }
            
            // Prepare career goal if available from CV or skills analysis
            let careerGoal = "";
            if (result.workflow_result && result.workflow_result.career_recommendations && 
                result.workflow_result.career_recommendations.length > 0) {
              careerGoal = result.workflow_result.career_recommendations[0].title || "";
            }
            
            // Handle education data which could be array or string
            let educationText = "";
            if (Array.isArray(cvData.education)) {
              educationText = cvData.education.map(edu => {
                // Handle both object format and string format
                if (typeof edu === 'object') {
                  return `${edu.degree || ""} in ${edu.field || ""} from ${edu.institution || ""}`;
                } else {
                  return edu;
                }
              }).join(", ");
            } else if (typeof cvData.education === 'string') {
              educationText = cvData.education;
            }
            
            // Handle work experience data which could be array or string
            let experienceText = "";
            if (Array.isArray(cvData.work_experience)) {
              experienceText = cvData.work_experience.map(exp => {
                // Handle both object format and string format
                if (typeof exp === 'object') {
                  return `${exp.position || ""} at ${exp.company || ""}`;
                } else {
                  return exp;
                }
              }).join(", ");
            } else if (typeof cvData.work_experience === 'string') {
              experienceText = cvData.work_experience;
            }
            
            // Handle projects data which could be array or string
            let projectsText = "";
            if (Array.isArray(cvData.projects)) {
              projectsText = cvData.projects.map(proj => {
                // Handle both object format and string format
                if (typeof proj === 'object') {
                  return proj.name || "";
                } else {
                  return proj;
                }
              }).join(", ");
            } else if (typeof cvData.projects === 'string') {
              projectsText = cvData.projects;
            }
            
            // Handle interests data which could be array or string
            let interestsText = "";
            if (Array.isArray(cvData.interests)) {
              interestsText = cvData.interests.join(", ");
            } else if (typeof cvData.interests === 'string') {
              interestsText = cvData.interests;
            }
            
            // Update form with extracted data, prioritize session email if available
            setForm({
              name: cvData.name || form.name,
              email: cvData.email || currentUserEmail || form.email,
              education: educationText || form.education,
              experience: experienceText || form.experience,
              projects: projectsText || form.projects,
              interests: interestsText || form.interests,
              career_goal: careerGoal || form.career_goal || "",
              level: cvData.experience_level || form.level || "Beginner",
            });
            
            // Update skills with better handling
            if (Array.isArray(cvData.skills) && cvData.skills.length > 0) {
              // Filter out skills that are clearly not skills
              const validSkills = cvData.skills.filter(skill => 
                typeof skill === 'string' && 
                skill.length >= 2 &&
                skill !== "Skills extraction requires full API" &&
                skill !== "Insufficient document text"
              );
              
              if (validSkills.length > 0) {
                setTags(validSkills);
              }
            }
            
            // Determine proper status message based on data quality
            const extractedParts = [];
            if (cvData.name && cvData.name.length > 0) extractedParts.push("name");
            if (cvData.email && cvData.email.length > 0) extractedParts.push("email");
            if (Array.isArray(cvData.skills) && cvData.skills.length > 0) extractedParts.push("skills");
            if (educationText) extractedParts.push("education");
            if (experienceText) extractedParts.push("work experience");
            if (projectsText) extractedParts.push("projects");
            if (interestsText) extractedParts.push("interests");
            
            if (extractedParts.length > 0) {
              setCvParsingStatus(`CV parsed successfully! Extracted: ${extractedParts.join(", ")}. Form has been pre-filled with your information.`);
            } else {
              setCvParsingStatus("CV parsed with limited results. Please review and complete any missing information.");
            }
            
            // Auto-advance to next step after a slight delay for user to see the success message
            setTimeout(() => {
              setMode("manual");
              setStep(1); // Start at personal info to verify
            }, 1500);
            
          } else if (result.error || result.status === "error") {
            // Handle error from the backend
            setCvParsingError(`Error: ${result.error || result.message || "Failed to parse CV. Please try manual entry."}`);
          } else {
            setCvParsingError("Unexpected response format from server. Please try manual entry.");
          }
        } catch (error) {
          console.error("Error parsing CV:", error);
          setCvParsingError(`Error: ${error.message || "Failed to parse CV. Please try manual entry."}`);
        } finally {
          clearTimeout(timeoutId);
          setIsParsingCV(false);
        }
      };  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!form.name.trim()) {
        newErrors.name = "Name is required.";
      }
      if (!form.email.trim()) {
        newErrors.email = "Email is required.";
      }
    } else if (step === 2) {
      if (!form.education.trim()) {
        newErrors.education = "Education is required.";
      }
    } else if (step === 3) {
      if (!form.experience.trim()) {
        newErrors.experience = "Work experience is required.";
      }
    } else if (step === 4) {
      if (tags.length === 0) {
        newErrors.skills = "Please add at least one skill.";
      }
    } else if (step === 5) {
      if (!form.projects.trim()) {
        newErrors.projects = "Projects are required.";
      }
    } else if (step === 6) {
      if (!form.interests.trim()) {
        newErrors.interests = "Interests are required.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    
    try {
      // Get the user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session) {
        setSaveMsg("Session expired. Please log in again.");
        setSaving(false);
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      
      // Prepare profile data with additional fields
      const profileData = {
        id: session.user.id,
        name: form.name,
        email: form.email,
        education: form.education,
        experience: form.experience,
        projects: form.projects,
        interests: form.interests,
        skills: tags,
        career_goal: form.career_goal || "Software Developer", // Default goal if not provided
        level: form.level || "Beginner", // Default level if not provided
        is_onboarded: true, // Mark profile as onboarded
        profile_complete: true, // Mark profile as complete
        updated_at: new Date().toISOString() // Add timestamp
      };
      
      setSaveMsg("Saving your profile...");
      
      // Save to Supabase first
      const { error: supabaseError } = await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id,
          ...profileData 
        });
      
      if (supabaseError) {
        console.error("Supabase profile update failed:", supabaseError);
        throw supabaseError;
      }
      
      // Also save to localStorage for local access
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      localStorage.removeItem('needsOnboarding'); // Clear onboarding flag
      
      setSaveMsg("Profile saved to database. Syncing with backend services...");
      
      // Send to backend
      const result = await sendProfileToBackend(profileData);
      
      if (result.error) {
        console.warn("Backend profile save warning:", result.error);
        setSaveMsg("Profile saved to database. Some advanced features may be limited due to backend connection issue.");
        
        // Still redirect after a delay, as core profile data is saved
        setTimeout(() => {
          setSaveMsg("Redirecting to dashboard...");
          navigate("/dashboard");
        }, 2000);
      } else {
        setSaveMsg("Profile saved successfully! Generating your personalized roadmap...");
        
        // Generate an initial roadmap if the profile includes skills
        if (tags.length > 0) {
          try {
            // Show roadmap generation status
            setSaveMsg("Generating your personalized career roadmap...");
            
            // Make the roadmap request and await the response
            const roadmapResponse = await fetch('http://127.0.0.1:8000/api/roadmap/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: profileData.email,
                career_goal: profileData.career_goal,
                skills: profileData.skills,
                user_id: session.user.id, // Add user ID for storage
                experience_level: profileData.level
              }),
            });
            
            if (roadmapResponse.ok) {
              setSaveMsg("Career roadmap generated! Redirecting to dashboard...");
            } else {
              setSaveMsg("Profile saved! Roadmap will be generated in the background. Redirecting to dashboard...");
            }
          } catch (roadmapErr) {
            console.warn("Error initiating roadmap generation:", roadmapErr);
            setSaveMsg("Profile saved! Roadmap generation will be retried later. Redirecting to dashboard...");
          }
        } else {
          setSaveMsg("Profile saved! Please add skills later to generate a roadmap. Redirecting to dashboard...");
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMsg(`Error: ${error.message || "Failed to save profile. Please try again."}`);
    } finally {
      setSaving(false);
    }
  };

  async function sendProfileToBackend(profileData) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        console.error(`Backend error: ${response.status} ${response.statusText}`);
        return { error: `HTTP error ${response.status}` };
      }
      
      const result = await response.json();
      console.log('Backend response:', result);
      return result;
    } catch (error) {
      console.error('Error sending profile to backend:', error);
      return { error: error.message || "Network or server error" };
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"><span className="text-lg text-gray-700 dark:text-gray-200">Loading profile...</span></div>;
  }
  // Progress bar calculation
  const progress = Math.round((step / steps.length) * 100);
  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-lg animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-tight">Onboarding</h2>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {/* Step Indicator */}
        <div className="flex justify-between mb-6 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {steps.map((label, idx) => (
            <div key={label} className={`flex-1 text-center ${step === idx + 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{label}</div>
          ))}
        </div>
        <div className="flex justify-center mb-6 gap-2">
          <button
            className={`px-4 py-2 rounded-l-lg font-semibold transition ${
              mode === "manual"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setMode("manual")}
            disabled={saving}
          >
            Manual Input
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg font-semibold transition ${
              mode === "cv"
                ? "bg-black text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
            onClick={() => setMode("cv")}
            disabled={saving}
          >
            Upload CV
          </button>
        </div>
        {mode === "cv" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block mb-2 font-medium text-gray-900 dark:text-gray-100">
                Upload your CV (PDF/Word)
              </label>
              <div className="flex items-center gap-2">
                <label className="px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleCvChange}
                    disabled={isParsingCV}
                  />
                  Choose File
                </label>
                <span className="text-gray-600 dark:text-gray-300 text-sm truncate max-w-[180px]">
                  {cvName || "No file selected"}
                </span>
              </div>
              
              {cvFile && (
                <div className="mt-4">
                  <button
                    onClick={parseCV}
                    disabled={isParsingCV || saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isParsingCV ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <span>Parsing CV...</span>
                      </div>
                    ) : (
                      "Parse CV and Fill Form"
                    )}
                  </button>
                </div>
              )}
              
              {cvParsingStatus && !cvParsingError && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{cvParsingStatus}</span>
                  </div>
                </div>
              )}
              
              {cvParsingError && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>{cvParsingError}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              Or{" "}
              <button
                className="underline"
                onClick={() => setMode("manual")}
                disabled={saving || isParsingCV}
              >
                enter details manually
              </button>
            </div>
          </div>
        )}
        {mode === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.name
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.email
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Email"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Education
                  </label>
                  <input
                    name="education"
                    value={form.education}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.education
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Education"
                    required
                  />
                  {errors.education && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.education}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Work Experience
                  </label>
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.experience
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Work Experience"
                    required
                  />
                  {errors.experience && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.experience}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Skills
                  </label>
                  <TagInput tags={tags} setTags={setTags} />
                  {errors.skills && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.skills}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Projects
                  </label>
                  <input
                    name="projects"
                    value={form.projects}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.projects
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Projects"
                    required
                  />
                  {errors.projects && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.projects}
                    </p>
                  )}
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">
                    Interests
                  </label>
                  <input
                    name="interests"
                    value={form.interests}
                    onChange={onChange}
                    className={`w-full border rounded-lg p-3 ${
                      errors.interests
                        ? "border-red-500 bg-red-50 dark:bg-red-900"
                        : "dark:bg-gray-700 dark:text-gray-100"
                    }`}
                    placeholder="Interests"
                    required
                  />
                  {errors.interests && (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {errors.interests}
                    </p>
                  )}
                </div>
                <div className="text-center text-green-600 font-semibold mt-4">
                  All done! Click Submit to finish.
                </div>
              </div>
            )}
            <div className="flex justify-between mt-8 gap-2">
              <button
                type="button"
                onClick={prev}
                disabled={step === 1 || saving}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  step === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Back
              </button>
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
                  disabled={saving}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Submit"}
                </button>
              )}
            </div>
            {saveMsg && <div className="mt-4 text-green-600 text-center font-semibold animate-fade-in">{saveMsg}</div>}
        {/* Subtle fade-in animation */}
        <style>{`
          .animate-fade-in {
            animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
          </form>
        )}
      </div>
    </section>
  );
}