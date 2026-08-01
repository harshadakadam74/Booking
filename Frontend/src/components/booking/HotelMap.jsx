import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const HotelMap = ({ location }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-gray-900">
        <MapPin className="text-red-500" size={18} />
        <h3 className="text-xl font-bold">Location</h3>
      </div>

      <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-100 via-sky-50 to-green-100 p-4">
        <div className="flex h-full items-end justify-between rounded-xl border border-dashed border-blue-300 bg-white/40 p-4">
          <div>
            <p className="text-sm text-gray-500">Hotel Location</p>
            <p className="text-lg font-bold text-gray-900">{location || 'Bhopal, Madhya Pradesh'}</p>
          </div>
          <Navigation className="text-blue-600" size={22} />
        </div>
      </div>

      <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">
        <Navigation size={16} />
        Open in Google Maps
      </button>
    </div>
  );
};

export default HotelMap;
