import FeatureCard from "../components/FeatureCard";
import TestimonialCard from "../components/TestimonialCard";

const features = [
	{
		icon: "🧭",
		title: "Personalized Roadmap",
		desc: "Get a learning path tailored to your skills, goals, and interests.",
	},
	{
		icon: "📈",
		title: "Career Progress Tracking",
		desc: "Track your growth and milestones as you advance.",
	},
	{
		icon: "🤖",
		title: "AI Career Guidance",
		desc: "Smart suggestions powered by Gemini API for your next steps.",
	},
	{
		icon: "📝",
		title: "Resume/Skill Evaluation",
		desc: "Analyze your resume and skills to find improvement areas.",
	},
];

const testimonials = [
	{
		name: "Ayesha K.",
		feedback:
			"Career Compass helped me land my dream job! The roadmap and AI tips were spot on.",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
		title: "Software Engineer",
	},
	{
		name: "Ali R.",
		feedback:
			"The progress tracking and personalized advice kept me motivated throughout my journey.",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
		title: "Data Analyst",
	},
	{
		name: "Sara M.",
		feedback:
			"I loved the personalized roadmap and the easy-to-use dashboard. Highly recommended!",
		avatar: "https://randomuser.me/api/portraits/women/68.jpg",
		title: "UI/UX Designer",
	},
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
          {/* Background geometric elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>
            <div className="absolute top-40 right-10 w-60 h-60 rounded-full bg-purple-600 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-10 left-1/4 w-40 h-40 rounded-full bg-indigo-400 opacity-10 blur-2xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Hero content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Dream Career</span> With AI Guidance
                  </h1>
                  <p className="mt-6 text-xl text-indigo-100 max-w-2xl">
                    Discover personalized career paths, analyze your skills, and get AI-powered recommendations tailored to your unique profile.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a
                    href="/onboarding"
                    className="inline-flex items-center px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-lg shadow-lg hover:scale-105 hover:shadow-xl transition duration-200"
                  >
                    Start Your Journey
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a
                    href="#features"
                    className="inline-flex items-center px-8 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium text-lg hover:bg-white/20 transition duration-200"
                  >
                    Learn More
                  </a>
                </div>

                {/* Trust badges */}
                <div className="pt-4">
                  <p className="text-sm text-indigo-200 mb-2">Trusted by professionals from</p>
                  <div className="flex gap-6 items-center flex-wrap">
                    <div className="text-white/60 font-semibold">Google</div>
                    <div className="text-white/60 font-semibold">Microsoft</div>
                    <div className="text-white/60 font-semibold">Meta</div>
                    <div className="text-white/60 font-semibold">Amazon</div>
                  </div>
                </div>
              </div>

              {/* Hero image/illustration */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/20 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-xl w-full max-w-md">
                  <div className="bg-white/5 rounded-lg p-5 mb-4">
                    <div className="h-2 w-24 bg-purple-400/30 rounded-full mb-4"></div>
                    <div className="h-2 w-full bg-indigo-400/30 rounded-full mb-3"></div>
                    <div className="h-2 w-5/6 bg-indigo-400/30 rounded-full mb-3"></div>
                    <div className="h-2 w-4/6 bg-indigo-400/30 rounded-full"></div>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <div className="h-8 w-8 bg-purple-400/30 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-purple-400/30 rounded-full mb-2"></div>
                      <div className="h-2 w-32 bg-indigo-400/30 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-2 w-5/6 bg-indigo-400/20 rounded-full mb-3"></div>
                  <div className="h-2 w-full bg-indigo-400/20 rounded-full mb-3"></div>
                  <div className="h-2 w-4/6 bg-indigo-400/20 rounded-full mb-6"></div>
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-10 rounded-lg w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 220" className="fill-white dark:fill-gray-900">
              <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,122.7C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3">Features</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Why Choose Career Compass?</h3>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our AI-powered platform offers everything you need to navigate your career path with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3">The Process</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">How Career Compass Works</h3>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Three simple steps to transform your career journey
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center relative">
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold">1</div>
                <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full p-4 mb-6 text-3xl w-16 h-16 flex items-center justify-center mx-auto">
                  👤
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Create Your Profile</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sign up and tell us about your skills, experience, education, and career goals.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center relative">
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold">2</div>
                <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full p-4 mb-6 text-3xl w-16 h-16 flex items-center justify-center mx-auto">
                  🧭
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Get Your Roadmap</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI analyzes your profile and generates a personalized career development plan.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center relative">
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold">3</div>
                <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full p-4 mb-6 text-3xl w-16 h-16 flex items-center justify-center mx-auto">
                  📈
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Track Your Progress</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Follow your personalized plan, track your achievements, and update your journey as you grow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3">Testimonials</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Success Stories</h3>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                See how Career Compass has helped professionals achieve their career goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <TestimonialCard key={t.name} {...t} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Career Journey?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who are using Career Compass to reach their career goals faster.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-white text-indigo-700 font-medium text-lg shadow-lg hover:bg-gray-100 transition duration-200"
              >
                Get Started For Free
              </a>
              <a
                href="/login"
                className="inline-flex items-center px-8 py-3 rounded-xl bg-transparent border-2 border-white text-white font-medium text-lg hover:bg-white/10 transition duration-200"
              >
                Sign In
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

