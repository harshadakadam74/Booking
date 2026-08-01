import React from 'react';
import { Download, PenSquare, Ban, MessageCircle, RotateCcw } from 'lucide-react';

const BookingActions = () => {
  const actions = [
    { label: 'Download Receipt', icon: Download },
    { label: 'Modify Booking', icon: PenSquare },
    { label: 'Cancel Booking', icon: Ban },
    { label: 'Contact Hotel', icon: MessageCircle },
    { label: 'Rebook', icon: RotateCcw },
  ];

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Booking Actions</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookingActions;
