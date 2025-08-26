import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

/**
 * A radar chart component that visualizes skills and their proficiency levels
 */
const SkillsRadarChart = ({ skills = [] }) => {
  // Map skills to proficiency values (mock data, in a real app this would come from assessment)
  const skillProficiencyMap = skills.reduce((acc, skill) => {
    // Generate a random proficiency level between 40-95 for demo purposes
    // In a real app, this would come from the user's assessment data
    acc[skill] = Math.floor(Math.random() * 55) + 40;
    return acc;
  }, {});

  // Prepare data for the radar chart
  const data = {
    labels: skills.slice(0, 8), // Limit to 8 skills for better visualization
    datasets: [
      {
        label: 'Your Skills',
        data: skills.slice(0, 8).map(skill => skillProficiencyMap[skill]),
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // indigo with transparency
        borderColor: 'rgba(99, 102, 241, 0.8)', // indigo
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)',
      },
      {
        label: 'Industry Average',
        data: skills.slice(0, 8).map(() => Math.floor(Math.random() * 30) + 60), // Random industry average data
        backgroundColor: 'rgba(249, 115, 22, 0.2)', // orange with transparency
        borderColor: 'rgba(249, 115, 22, 0.8)', // orange
        pointBackgroundColor: 'rgba(249, 115, 22, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(249, 115, 22, 1)',
      }
    ]
  };

  // Chart options
  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(128, 128, 128, 0.2)', // gray lines
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.2)', // gray grid
        },
        pointLabels: {
          color: () => {
            // Get the theme from body class
            const isDarkMode = document.body.classList.contains('dark');
            return isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
          },
          font: {
            size: 12
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: () => {
            const isDarkMode = document.body.classList.contains('dark');
            return isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
          }
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: () => {
            const isDarkMode = document.body.classList.contains('dark');
            return isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  // If there are no skills, show a message
  if (!skills || skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400 mb-2">No skills data available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Add skills to your profile to see your radar chart
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <Radar data={data} options={options} />
    </div>
  );
};

export default SkillsRadarChart;