import React from 'react';
import { BadgeCheck, CalendarDays, Hash, QrCode } from 'lucide-react';

const BookingOverview = ({ booking }) => {
  const overview = {
    bookingId: booking?.id || 'BK11560186',
    status: booking?.status || 'Confirmed',
    bookingDate: booking?.bookedAt ? new Date(booking.bookedAt).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) : '28 Jul 2026',
    confirmationNumber: booking?.confirmationNumber || 'CNF-782945',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Booking Overview</h2>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gray-50 p-5">
          <Hash className="mb-3 text-blue-600" />
          <p className="text-gray-500">Booking ID</p>
          <h3 className="font-bold text-gray-900">{overview.bookingId}</h3>
        </div>

        <div className="rounded-xl bg-gray-50 p-5">
          <BadgeCheck className="mb-3 text-green-600" />
          <p className="text-gray-500">Booking Status</p>
          <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            {overview.status}
          </span>
        </div>

        <div className="rounded-xl bg-gray-50 p-5">
          <CalendarDays className="mb-3 text-orange-600" />
          <p className="text-gray-500">Booking Date</p>
          <h3 className="font-bold text-gray-900">{overview.bookingDate}</h3>
        </div>

        <div className="rounded-xl bg-gray-50 p-5">
          <QrCode className="mb-3 text-purple-600" />
          <p className="text-gray-500">Confirmation No.</p>
          <h3 className="font-bold text-gray-900">{overview.confirmationNumber}</h3>
        </div>
      </div>
    </div>
  );
};

export default BookingOverview;
