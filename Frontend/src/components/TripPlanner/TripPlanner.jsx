import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { indianDestinations } from '../../Data/IndianDestinations';

const TripPlanner = () => {
  const navigate = useNavigate();

  const handleDestinationClick = (destination) => {
    const searchData = {
      location: destination.name + ", India",
      dates: {
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        key: "selection"
      },
      guests: {
        adults: 2,
        children: 0,
        rooms: 1
      },
      workTrip: false,
    };

    navigate('/book-place', {
      state: searchData,
    });
  };

  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Quick and easy trip planner
          </h2>
          <p className="text-xl text-gray-600">
            Pick a vibe and explore the top destinations in India
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {indianDestinations.map((destination) => (
            <div
              key={destination.id}
              onClick={() => handleDestinationClick(destination)}
              className="group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Image Container */}
              <div className="relative h-56 overflow-hidden bg-gray-200">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {destination.name}
                  </h3>
                  <p className="text-sm text-gray-200 mb-2">
                    {destination.vibe}
                  </p>
                  <div className="flex items-center text-gray-100 text-sm">
                    <Navigation size={14} className="mr-1" />
                    <span>{destination.distance} km away</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-gray-50 group-hover:bg-blue-50 transition-colors">
                <p className="text-xs text-gray-600 line-clamp-2">
                  {destination.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Explore More Button */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Looking for more inspiration? Browse all destinations
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
