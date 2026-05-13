import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';

const AccountBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const savedBookings = localStorage.getItem('userBookings');
    setBookings(savedBookings ? JSON.parse(savedBookings) : []);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => navigate('/account')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Account
        </button>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <Calendar size={28} className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-gray-600">Review your completed and upcoming trips.</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={56} className="mx-auto text-gray-300 mb-6" />
              <p className="text-gray-500 mb-6">You don't have any bookings yet.</p>
              <Link
                to="/book"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Start Booking
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-3xl p-6 bg-gray-50">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{booking.property}</h2>
                      <p className="text-gray-600">{booking.location}</p>
                      {booking.propertyType && (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mt-2">
                          {booking.propertyType}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="mt-1 font-semibold text-blue-700">{booking.status}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium text-gray-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium text-gray-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium text-gray-900">
                        {booking.guests?.adults || 0} adults
                        {booking.guests?.children > 0 && `, ${booking.guests.children} children`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <p className="text-gray-700">Booking ID: <span className="font-mono text-sm">{booking.id}</span></p>
                    <p className="text-2xl font-bold text-blue-600">${booking.total}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountBookings;
