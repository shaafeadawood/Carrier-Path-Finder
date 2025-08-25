// Google login button for Career Compass
export default function GoogleLoginButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded shadow hover:bg-gray-50 disabled:opacity-50"
    >
      <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.4-.2-2.7-.4-3.5z"/><path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 16.1 3 9.1 7.6 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c6.2 0 11.4-2 15.2-5.4l-7-5.7C29.5 35.7 26.9 37 24 37c-5.6 0-10.3-3.7-12-8.7l-6.7 5.2C9.1 40.4 16.1 45 24 45z"/><path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.3 3.5-4.3 6-8.3 6-5.6 0-10.3-3.7-12-8.7l-6.7 5.2C9.1 40.4 16.1 45 24 45c6.2 0 11.4-2 15.2-5.4l-7-5.7C29.5 35.7 26.9 37 24 37c-5.6 0-10.3-3.7-12-8.7l-6.7 5.2C9.1 40.4 16.1 45 24 45z"/></g></svg>
      <span>Sign in with Google</span>
    </button>
  );
}
