export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition duration-300">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2 text-indigo-700 dark:text-indigo-300">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center">{desc}</p>
    </div>
  );
}