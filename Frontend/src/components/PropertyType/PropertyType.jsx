import React from 'react';
import { Link } from 'react-router-dom';

import './PropertyType.css';

const BrowseByPropertyType = () => {
  const propertyTypes = [
    { name: 'Hotels', icon: '🏨', link: '/hotels' },
    { name: 'Apartments', icon: '🏢', link: '/apartments' },
    { name: 'Resorts', icon: '🏖️', link: '/resorts' },
    { name: 'Villas', icon: '🏠', link: '/villas' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-14">
      <section className="animate-fadeIn">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
          Browse by property type
        </h2>
        {/* Auto-Scrolling Horizontal List */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll space-x-4 sm:space-x-6">
            {/* Duplicate the list for seamless infinite scroll */}
            {[...propertyTypes, ...propertyTypes].map((type, index) => (
              <Link
                key={`${type.name}-${index}`}
                to={type.link}
                className="
                  flex flex-col items-center justify-center
                  bg-white border border-gray-100 rounded-lg sm:rounded-xl
                  p-4 sm:p-6 md:p-8
                  shadow-sm hover:shadow-md
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                  text-center
                  flex-shrink-0 w-32 sm:w-40 md:w-48
                "
              >
                <span className="text-2xl sm:text-3xl md:text-4xl mb-2">{type.icon}</span>
                <span className="text-sm sm:text-base md:text-lg font-medium text-gray-700">
                  {type.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrowseByPropertyType;