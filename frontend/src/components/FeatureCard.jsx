export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition duration-300 border border-gray-100 dark:border-gray-800">
      <div className="text-4xl mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-4 rounded-full h-16 w-16 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-center">{desc}</p>
    </div>
  );
}