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
		<div className="bg-white dark:bg-gray-900 transition-colors duration-300 min-h-screen flex flex-col">
			<main className="flex-1">
				{/* Hero Section */}
				<section className="relative flex flex-col-reverse md:flex-row items-center justify-between px-6 py-16 max-w-7xl mx-auto">
					<div className="w-full md:w-1/2 text-center md:text-left">
						<h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-700 dark:text-indigo-300 mb-4 leading-tight">
							Find Your Ideal Career Path
						</h1>
						<p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8">
							AI-powered guidance, personalized roadmaps, and real progress
							tracking. Start your journey today!
						</p>
						<a
							href="/onboarding"
							className="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:scale-105 hover:from-indigo-700 hover:to-purple-700 transition"
						>
							Start Your Career Journey
						</a>
					</div>
					<div className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0">
						{/* Removed hero image as requested */}
					</div>
				</section>

				{/* Features */}
				<section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
					<div className="max-w-6xl mx-auto px-4">
						<h2 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-10">
							Why Choose Career Compass?
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
							{features.map((f) => (
								<FeatureCard key={f.title} {...f} />
							))}
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section className="py-16 max-w-5xl mx-auto px-4">
					<h2 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-10">
						How It Works
					</h2>
					<div className="flex flex-col md:flex-row items-center justify-between gap-8">
						<div className="flex flex-col items-center">
							<div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full p-4 mb-2 text-3xl">
								1️⃣
							</div>
							<h3 className="font-bold mb-1">Sign Up & Create Profile</h3>
							<p className="text-gray-500 dark:text-gray-400 text-sm text-center">
								Register and tell us about your background and goals.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full p-4 mb-2 text-3xl">
								2️⃣
							</div>
							<h3 className="font-bold mb-1">Get Personalized Roadmap</h3>
							<p className="text-gray-500 dark:text-gray-400 text-sm text-center">
								Receive a step-by-step plan tailored just for you.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full p-4 mb-2 text-3xl">
								3️⃣
							</div>
							<h3 className="font-bold mb-1">Track Progress</h3>
							<p className="text-gray-500 dark:text-gray-400 text-sm text-center">
								Monitor your achievements and stay motivated.
							</p>
						</div>
					</div>
				</section>

				{/* Testimonials */}
				<section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
					<div className="max-w-6xl mx-auto px-4">
						<h2 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-300 mb-10">
							Success Stories
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
							{testimonials.map((t) => (
								<TestimonialCard key={t.name} {...t} />
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}

