export default function TestimonialCard({ name, feedback, avatar, title }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 hover:shadow-2xl transition duration-300 border border-gray-100 dark:border-gray-800 relative">
      {/* Quote mark decorative element */}
      <div className="absolute top-4 left-4 text-4xl text-indigo-200 dark:text-indigo-800 opacity-60 font-serif">
        "
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg relative z-10 pt-6">
        "{feedback}"
      </p>
      
      <div className="flex items-center mt-4">
        <img 
          src={avatar} 
          alt={name} 
          className="w-12 h-12 rounded-full mr-4 border-2 border-indigo-100 dark:border-indigo-800 object-cover" 
        />
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-indigo-600 dark:text-indigo-400">{title}</div>
        </div>
      </div>
    </div>
  );
}