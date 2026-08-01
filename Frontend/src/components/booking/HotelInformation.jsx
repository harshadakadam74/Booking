import React from 'react';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, ShieldCheck, Sparkles } from 'lucide-react';

const HotelInformation = ({ booking }) => {
  const amenities = booking?.amenities || ['Wi-Fi', 'Parking', 'Restaurant', 'Pool'];

  return (
    <div className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col md:flex-row gap-5">
        {booking?.image && (
          <img
            src={booking.image}
            alt={booking.property || 'Hotel'}
            className="h-48 w-full md:w-56 rounded-2xl object-cover"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 text-yellow-500">
            {[...Array(5)].map((_, index) => (
              <Star key={index} size={16} fill="currentColor" />
            ))}
            <span className="text-sm font-medium text-gray-700">4.8 / 5</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">{booking?.property || 'Luxury Downtown Hotel'}</h2>
          <p className="mt-2 inline-flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-red-500" />
            {booking?.location || 'Bhopal, India'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {amenities.map((item, idx) => (
              <span key={idx} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-gray-50 p-4">
          <Wifi size={18} className="text-blue-600 mb-2" />
          <p className="text-sm text-gray-500">Internet</p>
          <p className="font-semibold">High speed</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <Car size={18} className="text-blue-600 mb-2" />
          <p className="text-sm text-gray-500">Parking</p>
          <p className="font-semibold">Available</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <UtensilsCrossed size={18} className="text-blue-600 mb-2" />
          <p className="text-sm text-gray-500">Dining</p>
          <p className="font-semibold">On-site café</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <ShieldCheck size={18} className="text-blue-600 mb-2" />
          <p className="text-sm text-gray-500">Safety</p>
          <p className="font-semibold">24/7</p>
        </div>
      </div>

      <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
        <span className="font-semibold">Nearby attractions:</span> City Center, Lake View Park, Museum Road
      </div>
    </div>
  );
};

export default HotelInformation;
