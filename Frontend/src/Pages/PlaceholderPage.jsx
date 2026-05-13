import React from 'react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 mb-8">{description}</p>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-500">
              This page is coming soon. We're working hard to bring you the best experience!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;