import { supabase } from "../../supabaseClient";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-blue-700 mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-4">Page not found.</p>
      <a href="/" className="text-blue-600 underline">Go Home</a>
    </div>
  );
}
