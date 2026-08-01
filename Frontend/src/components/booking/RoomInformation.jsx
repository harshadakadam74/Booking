import React from 'react';
import { BedDouble, UsersRound, Sparkles } from 'lucide-react';

const RoomInformation = ({ booking }) => {
  const guests = booking?.guests || { adults: 2, rooms: 1 };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Room Information</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <BedDouble size={18} />
            <span className="text-sm">Room type</span>
          </div>
          <p className="font-semibold text-gray-900">{booking?.propertyType || 'Deluxe Room'}</p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <UsersRound size={18} />
            <span className="text-sm">Guests</span>
          </div>
          <p className="font-semibold text-gray-900">{guests.adults || 2} adults</p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Sparkles size={18} />
            <span className="text-sm">Amenities</span>
          </div>
          <p className="font-semibold text-gray-900">Breakfast, AC, Wi‑Fi</p>
        </div>
      </div>
    </div>
  );
};

export default RoomInformation;
