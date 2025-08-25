import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="p-4 shadow-sm bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link className="text-xl font-semibold" to="/">PathFinder</Link>
          <nav className="flex gap-4">
            <Link className={`hover:underline ${pathname==='/' ? 'font-semibold' : ''}`} to="/">Home</Link>
            <Link className={`hover:underline ${pathname.startsWith('/dashboard') ? 'font-semibold' : ''}`} to="/dashboard">Dashboard</Link>
            <Link className="hover:underline" to="/onboarding">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}