import React from 'react';

// Helper function to generate JSON content
const generateJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

// Helper function to generate CSV content
const generateCSV = (data) => {
  if (!data) return '';
  
  // Extract all possible keys for CSV header
  const allKeys = new Set();
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key])) {
      if (typeof data[key][0] === 'object') {
        data[key].forEach(item => {
          Object.keys(item).forEach(subKey => {
            allKeys.add(`${key}_${subKey}`);
          });
        });
      } else {
        allKeys.add(key);
      }
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      Object.keys(data[key]).forEach(subKey => {
        allKeys.add(`${key}_${subKey}`);
      });
    } else {
      allKeys.add(key);
    }
  });
  
  const headers = Array.from(allKeys);
  
  // Function to flatten the data structure
  const flattenData = (data) => {
    const result = {};
    headers.forEach(header => {
      const [mainKey, subKey] = header.split('_');
      if (subKey) {
        if (Array.isArray(data[mainKey])) {
          if (typeof data[mainKey][0] === 'object') {
            result[header] = data[mainKey].map(item => item[subKey]).join('; ');
          }
        } else if (typeof data[mainKey] === 'object' && data[mainKey] !== null) {
          result[header] = data[mainKey][subKey];
        }
      } else if (Array.isArray(data[header])) {
        if (typeof data[header][0] === 'object') {
          // Handle array of objects
          result[header] = data[header].map(item => 
            Object.values(item).join(' - ')
          ).join('; ');
        } else {
          // Handle array of primitives
          result[header] = data[header].join('; ');
        }
      } else {
        result[header] = data[header];
      }
    });
    return result;
  };
  
  const flatData = flattenData(data);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\\n';
  csvContent += headers.map(header => {
    let value = flatData[header];
    if (value === undefined || value === null) value = '';
    
    // Escape values that contain commas or quotes
    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
      value = `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(',');
  
  return csvContent;
};

// Helper function to generate plain text
const generateText = (data) => {
  if (!data) return '';
  
  let text = '';
  
  // Personal Information
  text += 'PERSONAL INFORMATION\n';
  text += '====================\n';
  if (data.name) text += `Name: ${data.name}\n`;
  if (data.email) text += `Email: ${data.email}\n`;
  text += '\n';
  
  // Skills
  if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
    text += 'SKILLS\n';
    text += '======\n';
    text += data.skills.join(', ') + '\n';
    text += '\n';
  }
  
  // Education
  if (data.education) {
    text += 'EDUCATION\n';
    text += '=========\n';
    if (Array.isArray(data.education)) {
      data.education.forEach(edu => {
        if (typeof edu === 'object') {
          const degree = edu.degree || '';
          const field = edu.field ? `in ${edu.field}` : '';
          const institution = edu.institution ? `from ${edu.institution}` : '';
          const date = edu.date ? `(${edu.date})` : '';
          text += `${degree} ${field} ${institution} ${date}`.trim() + '\n';
        } else {
          text += edu + '\n';
        }
      });
    } else {
      text += data.education + '\n';
    }
    text += '\n';
  }
  
  // Work Experience
  if (data.work_experience) {
    text += 'WORK EXPERIENCE\n';
    text += '===============\n';
    if (Array.isArray(data.work_experience)) {
      data.work_experience.forEach(exp => {
        if (typeof exp === 'object') {
          const position = exp.position || '';
          const company = exp.company ? `at ${exp.company}` : '';
          const duration = exp.duration ? `(${exp.duration})` : '';
          text += `${position} ${company} ${duration}`.trim() + '\n';
          if (exp.description) text += `${exp.description}\n`;
          text += '\n';
        } else {
          text += exp + '\n';
        }
      });
    } else {
      text += data.work_experience + '\n';
    }
    text += '\n';
  }
  
  // Projects
  if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
    text += 'PROJECTS\n';
    text += '========\n';
    data.projects.forEach(proj => {
      if (typeof proj === 'object') {
        text += `${proj.name || 'Unnamed Project'}\n`;
        if (proj.description) text += `${proj.description}\n`;
        text += '\n';
      } else {
        text += proj + '\n';
      }
    });
    text += '\n';
  }
  
  // Interests
  if (data.interests && Array.isArray(data.interests) && data.interests.length > 0) {
    text += 'INTERESTS\n';
    text += '=========\n';
    text += data.interests.join(', ') + '\n';
  }
  
  return text;
};

const ExportOptions = ({ data }) => {
  if (!data) return null;
  
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  const handleExport = (format) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let content, fileName, mimeType;
    
    switch (format) {
      case 'json':
        content = generateJSON(data);
        fileName = `resume_data_${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = generateCSV(data);
        fileName = `resume_data_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
      case 'text':
      default:
        content = generateText(data);
        fileName = `resume_data_${timestamp}.txt`;
        mimeType = 'text/plain';
        break;
    }
    
    downloadFile(content, fileName, mimeType);
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Export Parsed CV Data</h4>
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => handleExport('json')}
          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition"
        >
          Export as JSON
        </button>
        <button 
          onClick={() => handleExport('csv')}
          className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition"
        >
          Export as CSV
        </button>
        <button 
          onClick={() => handleExport('text')}
          className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition"
        >
          Export as Text
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Export your CV data for use in other applications or for backup purposes.
      </p>
    </div>
  );
};

export default ExportOptions;