import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="py-16">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold leading-tight">Find your ideal career path, one step at a time.</h1>
        <p className="mt-4 text-lg text-gray-600">We’ll analyze your skills, close gaps, and generate a personalized learning roadmap.</p>
        <div className="mt-8 flex gap-3">
          <Link to="/onboarding" className="px-5 py-3 rounded-xl bg-black text-white">Get Started</Link>
          <Link to="/dashboard" className="px-5 py-3 rounded-xl border">View Dashboard</Link>
        </div>
      </div>
    </section>
  )
}