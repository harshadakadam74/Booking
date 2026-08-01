import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BookingStatus = ({ status, total }) => {
  const normalized = String(status || 'Confirmed').toLowerCase();
  const isConfirmed = normalized === 'confirmed' || normalized === 'paid' || normalized === 'completed';

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div>
        <p className="text-sm text-gray-500">Booking status</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-700">
          <CheckCircle2 size={16} />
          {isConfirmed ? 'Confirmed' : status || 'Confirmed'}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Total paid</p>
        <p className="text-3xl font-bold text-blue-600">${total || 0}</p>
      </div>
    </div>
  );
};

export default BookingStatus;
