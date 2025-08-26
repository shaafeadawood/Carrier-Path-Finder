import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Radar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, RadialLinearScale, Tooltip, Legend);

const SkillsVisualization = ({ currentSkills, targetSkills }) => {
  // Prepare data for pie chart showing skills breakdown
  const pieData = {
    labels: ['Current Skills', 'Skills to Develop'],
    datasets: [
      {
        data: [currentSkills?.length || 0, targetSkills?.length || 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for radar chart showing skill categories
  const skillCategories = {
    'Programming': 0,
    'Design': 0,
    'Database': 0, 
    'DevOps': 0,
    'Soft Skills': 0,
    'Cloud': 0,
  };

  // Function to categorize skills
  const categorizeSkill = (skill) => {
    skill = skill.toLowerCase();
    if (/java|python|javascript|react|angular|vue|typescript|node|ruby|php|c\+\+|c#|swift|kotlin|go|rust/.test(skill)) {
      return 'Programming';
    } else if (/ui|ux|figma|sketch|adobe|photoshop|illustrator|design|css/.test(skill)) {
      return 'Design';
    } else if (/sql|mongodb|postgres|mysql|oracle|database|nosql|redis/.test(skill)) {
      return 'Database';
    } else if (/docker|kubernetes|jenkins|ci\/cd|devops|automation/.test(skill)) {
      return 'DevOps';
    } else if (/aws|azure|gcp|cloud/.test(skill)) {
      return 'Cloud';
    } else {
      return 'Soft Skills';
    }
  };

  // Count skills in each category
  currentSkills?.forEach(skill => {
    const category = categorizeSkill(skill);
    skillCategories[category] = (skillCategories[category] || 0) + 1;
  });

  const radarData = {
    labels: Object.keys(skillCategories),
    datasets: [
      {
        label: 'Your Skills By Category',
        data: Object.values(skillCategories),
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        ticks: {
          stepSize: 1,
          showLabelBackdrop: false,
          font: {
            size: 10
          }
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw} skills`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} skills`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="mt-5 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Skills Breakdown</h3>
          <div className="h-64">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Skills by Category</h3>
          <div className="h-64">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Skills Balance</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentSkills?.length > targetSkills?.length 
            ? "You have a strong foundation of skills! Focus on deepening your expertise." 
            : "You have identified areas to grow! Keep expanding your skill set."}
        </p>
        
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-600">
            <div className="bg-blue-600 h-4 rounded-full" style={{
              width: `${currentSkills?.length ? Math.min(100, (currentSkills.length / (currentSkills.length + targetSkills?.length)) * 100) : 0}%`
            }}></div>
          </div>
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {currentSkills?.length || 0} / {(currentSkills?.length || 0) + (targetSkills?.length || 0)} skills
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkillsVisualization;