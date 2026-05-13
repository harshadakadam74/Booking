import React, { useState } from 'react';

const CheckBox_travelling = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = [
    { id: 'work', label: 'Work' },
    { id: 'leisure', label: 'Leisure' },
    { id: 'family', label: 'Family' },
    { id: 'solo', label: 'Solo Travel' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'relaxation', label: 'Relaxation' }
  ];

  const handleCheckboxChange = (optionId) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Travel Purpose</h3>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleCheckboxChange(option.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {selectedOptions.length > 0 && (
        <p className="mt-4 text-sm text-gray-600">
          Selected: {selectedOptions.join(', ')}
        </p>
      )}
    </div>
  );
};

export default CheckBox_travelling;