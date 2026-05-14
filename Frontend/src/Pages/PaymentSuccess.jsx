import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Home } from 'lucide-react';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { property, searchParams, total } = location.state || {};

  // Save booking to localStorage when component mounts
  useEffect(() => {
    if (property && searchParams && total) {
      const bookingId = `BK${Date.now().toString().slice(-8)}`;

      const newBooking = {
        id: bookingId,
        property: property.name,
        location: property.location,
        image: property.image,
        checkIn: searchParams.dates ? new Date(searchParams.dates.startDate).toISOString().split('T')[0] : '',
        checkOut: searchParams.dates ? new Date(searchParams.dates.endDate).toISOString().split('T')[0] : '',
        guests: searchParams.guests || {},
        status: 'confirmed',
        total: total,
        bookedAt: new Date().toISOString(),
        propertyType: property.type
      };

      // Get existing bookings from localStorage
      const existingBookings = localStorage.getItem('userBookings');
      const bookings = existingBookings ? JSON.parse(existingBookings) : [];

      // Add new booking
      bookings.unshift(newBooking); // Add to beginning of array

      // Save back to localStorage
      localStorage.setItem('userBookings', JSON.stringify(bookings));
    }
  }, [property, searchParams, total]);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Booking information not found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const bookingId = `BK${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Your reservation has been successfully completed.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-green-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <p className="text-green-100">Booking ID: {bookingId}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Property Information</h3>
                <div className="flex gap-4 mb-4">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{property.name}</h4>
                    <p className="text-gray-600">{property.location}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(property.rating)
                                ? 'bg-yellow-400'
                                : 'bg-gray-300'
                            } rounded-full mr-1`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {property.rating} ({property.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {searchParams?.dates && new Date(searchParams.dates.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {searchParams?.dates && new Date(searchParams.dates.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">
                      {searchParams?.guests && `${searchParams.guests.adults} adults`}
                      {searchParams?.guests?.children > 0 && `, ${searchParams.guests.children} children`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rooms:</span>
                    <span className="font-medium">{searchParams?.guests?.rooms || 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Room rate</span>
                  <span>${property.price} × {Math.ceil((searchParams?.dates?.endDate - searchParams?.dates?.startDate) / (1000 * 60 * 60 * 24))} nights</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span>Taxes & fees</span>
                  <span>${Math.round(total * 0.12)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Total paid</span>
                  <span>${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            <Download size={20} />
            Download Receipt
          </button>
          <button className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            <Mail size={20} />
            Email Confirmation
          </button>
          <button
            onClick={() => navigate('/account')}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <Home size={20} />
            View My Bookings
          </button>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Check Your Email</h4>
              <p className="text-sm text-gray-600">
                You'll receive a confirmation email with all booking details.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Property Confirmation</h4>
              <p className="text-sm text-gray-600">
                The property will confirm your booking within 24 hours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Home size={24} className="text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Manage Your Booking</h4>
              <p className="text-sm text-gray-600">
                View and manage your bookings in your account dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;