// Reusable button component for Career Compass
export default function Button({ children, type = "button", className = "", ...props }) {
  return (
    <button
      type={type}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
