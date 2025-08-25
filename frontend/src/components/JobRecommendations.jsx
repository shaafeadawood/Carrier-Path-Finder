import React, { useState, useEffect } from 'react';

// Sample job data (in a real app, this would come from an API)
const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp Inc.",
    location: "Remote",
    description: "We're looking for a Frontend Developer experienced in React to join our team to build modern, responsive web applications.",
    skills: ["React", "JavaScript", "HTML", "CSS", "Redux", "TypeScript", "Responsive Design"],
    category: "Development"
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "InnovateSoft",
    location: "New York, NY",
    description: "Full Stack Engineer position available for someone with both frontend and backend expertise to develop end-to-end solutions.",
    skills: ["JavaScript", "Node.js", "MongoDB", "Express", "React", "RESTful APIs", "Git"],
    category: "Development"
  },
  {
    id: 3,
    title: "UX/UI Designer",
    company: "DesignMasters",
    location: "San Francisco, CA",
    description: "Looking for a talented UX/UI Designer to create beautiful and functional interfaces that provide exceptional user experiences.",
    skills: ["Figma", "Adobe XD", "UI Design", "Prototyping", "User Research", "Wireframing", "Accessibility"],
    category: "Design"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Remote",
    description: "DevOps Engineer needed to manage our cloud infrastructure and CI/CD pipelines for reliable and scalable application deployment.",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Jenkins", "Linux"],
    category: "DevOps"
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "DataInsight",
    location: "Boston, MA",
    description: "Data Scientist position for someone with strong analytical and machine learning skills to extract insights from complex datasets.",
    skills: ["Python", "Machine Learning", "Data Analysis", "SQL", "TensorFlow", "Statistics", "Data Visualization"],
    category: "Data Science"
  },
  {
    id: 6,
    title: "Backend Developer",
    company: "ServerLogic",
    location: "Remote",
    description: "Backend Developer needed to build and maintain our API services and server-side infrastructure.",
    skills: ["Java", "Spring Boot", "RESTful APIs", "SQL", "Microservices", "Cloud Services", "Authentication"],
    category: "Development"
  },
  {
    id: 7,
    title: "Product Manager",
    company: "ProductFirst",
    location: "Chicago, IL",
    description: "Product Manager to lead the development of innovative products from conception to launch, working with cross-functional teams.",
    skills: ["Product Development", "Agile", "User Stories", "Roadmapping", "Stakeholder Management", "Market Research", "Leadership"],
    category: "Management"
  },
  {
    id: 8,
    title: "Database Administrator",
    company: "DataSystems Inc.",
    location: "Remote",
    description: "Experienced DBA needed to manage and optimize database systems, ensuring high performance, security and availability.",
    skills: ["SQL", "PostgreSQL", "Database Design", "Performance Tuning", "Data Modeling", "Backup & Recovery", "Security"],
    category: "Database"
  },
  {
    id: 9,
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    location: "Seattle, WA",
    description: "Machine Learning Engineer to develop and deploy advanced ML models for solving complex business problems.",
    skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Computer Vision", "Model Deployment"],
    category: "AI & ML"
  },
  {
    id: 10,
    title: "Project Manager",
    company: "DeliverIT Solutions",
    location: "Austin, TX",
    description: "Project Manager to lead technical projects, ensuring they're delivered on time, within scope and budget.",
    skills: ["Project Management", "Scrum", "Communication", "Risk Management", "Budgeting", "Team Leadership", "Client Relations"],
    category: "Management"
  }
];

// Calculate match score between user skills and job with weighted scoring
const calculateMatchScore = (userSkills = [], jobSkills = [], education = [], experience = []) => {
  if (userSkills.length === 0) return 0;
  if (jobSkills.length === 0) return 50; // Base match score if job has no listed skills
  
  // Skills match (60% of total score)
  let skillsScore = 0;
  const matchedSkills = [];
  
  // Calculate exact and partial skill matches
  jobSkills.forEach(jobSkill => {
    const jobSkillLower = jobSkill.toLowerCase().trim();
    
    // Check for exact matches first (higher weight)
    const exactMatch = userSkills.some(userSkill => 
      userSkill.toLowerCase().trim() === jobSkillLower
    );
    
    if (exactMatch) {
      skillsScore += 1;
      matchedSkills.push(jobSkill);
      return;
    }
    
    // Check for partial matches (lower weight)
    const partialMatch = userSkills.some(userSkill => {
      const userSkillLower = userSkill.toLowerCase().trim();
      return userSkillLower.includes(jobSkillLower) || 
             jobSkillLower.includes(userSkillLower) && 
             userSkillLower.length > 2; // Avoid matching on very short strings
    });
    
    if (partialMatch) {
      skillsScore += 0.7; // Partial match has 70% weight of exact match
      matchedSkills.push(jobSkill);
    }
  });
  
  const normalizedSkillsScore = (skillsScore / jobSkills.length) * 60;
  
  // Education relevance (20% of total score)
  let educationScore = 0;
  if (education && education.length > 0) {
    // Check if education fields relate to job title
    const relevantDegrees = education.filter(edu => {
      const degreeField = (edu.field || "").toLowerCase();
      const jobTitleLower = jobSkills.join(" ").toLowerCase();
      
      return jobSkills.some(skill => 
        degreeField.includes(skill.toLowerCase()) || 
        jobTitleLower.includes(degreeField)
      );
    });
    
    educationScore = relevantDegrees.length > 0 ? 20 : 10;
  }
  
  // Experience relevance (20% of total score)
  let experienceScore = 0;
  if (experience && experience.length > 0) {
    // Check if past job titles/descriptions relate to current job
    const relevantExperience = experience.filter(exp => {
      const roleTitle = (exp.title || "").toLowerCase();
      const jobTitleLower = jobSkills.join(" ").toLowerCase();
      
      return jobSkills.some(skill => 
        roleTitle.includes(skill.toLowerCase()) || 
        jobTitleLower.includes(roleTitle)
      );
    });
    
    experienceScore = (relevantExperience.length / experience.length) * 20;
  }
  
  // Calculate final weighted score
  const totalScore = normalizedSkillsScore + educationScore + experienceScore;
  
  // Return rounded score and matched skills
  return {
    score: Math.min(Math.round(totalScore), 100), // Cap at 100
    matchedSkills
  };
};

const JobRecommendations = ({ cvData, isUsingFallback }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!cvData) {
      setLoading(false);
      return;
    }
    
    // In a real app, you'd call an API here
    // For now, we'll simulate an API call with setTimeout
    const timer = setTimeout(() => {
      const userSkills = cvData.skills || [];
      const userEducation = cvData.education || [];
      const userExperience = cvData.experience || [];
      
      // Calculate match scores for each job based on user's CV data
      const scoredJobs = SAMPLE_JOBS.map(job => {
        // Get both score and matched skills from our improved matching algorithm
        const { score, matchedSkills } = calculateMatchScore(
          userSkills, 
          job.skills, 
          userEducation, 
          userExperience
        );
        
        return {
          ...job,
          matchScore: score,
          matchedSkills: matchedSkills || []
        };
      });
      
      // Sort jobs by match score (highest first)
      const sortedJobs = scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
      
      setRecommendations(sortedJobs);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [cvData]);
  
  if (loading) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Job Recommendations
        </h3>
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }
  
  if (isUsingFallback) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Job Recommendations
        </h3>
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            Advanced job matching is limited during basic extraction mode.
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Try again later when API limits reset for personalized job recommendations based on your full CV analysis.
        </p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          In the meantime, you can explore jobs based on your industry or manually search for opportunities.
        </p>
      </div>
    );
  }
  
  if (!cvData || !cvData.skills || cvData.skills.length === 0) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Job Recommendations
        </h3>
        <div className="flex flex-col items-center py-6">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            We need more information about your skills to provide personalized job recommendations.
            Please upload your CV or add skills manually to see matching opportunities.
          </p>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Update Your Skills
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Personalized Job Recommendations
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Based on your skills</span>
          <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded text-xs">
            {cvData.skills.length} skills analyzed
          </div>
        </div>
      </div>
      
      <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-6">
        <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          These recommendations are dynamically generated based on your skills, education, and experience. 
          Update your CV to see more accurate matches.
        </p>
      </div>
      
      <div className="space-y-4">
        {recommendations.slice(0, 4).map(job => (
          <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-lg text-indigo-600 dark:text-indigo-400">{job.title}</h4>
              <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                job.matchScore >= 80 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : job.matchScore >= 60
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{job.matchScore}% Match</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-700 dark:text-gray-300 font-medium">{job.company}</p>
              <span className="text-gray-400">•</span>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{job.location}</span>
              </p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 pb-2 border-b border-gray-100 dark:border-gray-700">
              {job.description}
            </p>
            
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Skills:</span>
                  {(job.matchedSkills && job.matchedSkills.length > 0) && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">
                      {job.matchedSkills.length}/{job.skills.length} matched
                    </span>
                  )}
                </div>
                
                <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  Why this match?
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {job.skills.map((skill, i) => {
                  const isMatched = job.matchedSkills && job.matchedSkills.includes(skill);
                  
                  return (
                    <span 
                      key={i} 
                      className={`px-2 py-0.5 rounded-full text-xs flex items-center
                        ${isMatched 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
                    >
                      {isMatched && (
                        <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      )}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-3 py-1 border border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 text-sm rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition">
                Save
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition flex items-center gap-1">
                <span>Apply Now</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex flex-col items-center">
        <button className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <span>View All Recommendations</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Not seeing the right matches?
          </span>
          <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            Refine your skills
          </button>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Categories</h4>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(recommendations.map(job => job.category))).map((category, i) => (
            <button 
              key={i} 
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobRecommendations;
