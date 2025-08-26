export default function TestimonialCard({ name, feedback, avatar, title }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition duration-300">
      <img src={avatar} alt={name} className="w-16 h-16 rounded-full mb-3 border-4 border-indigo-100 dark:border-gray-800" />
      <p className="text-gray-600 dark:text-gray-300 italic mb-2 text-center">"{feedback}"</p>
      <div className="font-bold text-indigo-700 dark:text-indigo-300">{name}</div>
      <div className="text-xs text-gray-400">{title}</div>
    </div>
  );
}