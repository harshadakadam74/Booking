import React from 'react';

const timeline = [
  { label: 'Booked', active: true },
  { label: 'Confirmed', active: true },
  { label: 'Checked In', active: false },
  { label: 'Completed', active: false },
];

const BookingTimeline = () => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Booking Timeline</h3>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {timeline.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3 md:flex-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-sm font-medium ${step.active ? 'text-blue-700' : 'text-gray-500'}`}>
              {step.label}
            </span>
            {index < timeline.length - 1 && <div className="hidden h-px flex-1 bg-gray-200 md:block" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingTimeline;
