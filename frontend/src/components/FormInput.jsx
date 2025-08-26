// Reusable input component for forms
export default function FormInput({ label, type = "text", value, onChange, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`border rounded px-3 py-2 w-full focus:ring focus:ring-blue-200 ${className}`}
        {...props}
      />
    </div>
  );
}
