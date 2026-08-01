import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookingHeader from '../../components/booking/BookingHeader';
import BookingStatus from '../../components/booking/BookingStatus';
import HotelInformation from '../../components/booking/HotelInformation';
import RoomInformation from '../../components/booking/RoomInformation';
import GuestInformation from '../../components/booking/GuestInformation';
import PaymentDetails from '../../components/booking/PaymentDetails';
import BookingTimeline from '../../components/booking/BookingTimeline';
import BookingInvoice from '../../components/booking/BookingInvoice';
import BookingActions from '../../components/booking/BookingActions';
import BookingOverview from '../../components/booking/BookingOverview';
import QRCodeCard from '../../components/booking/QRCodeCard';
import HotelMap from '../../components/booking/HotelMap';

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userBookings');
    const bookings = stored ? JSON.parse(stored) : [];
    const match = bookings.find(
      (item) => String(item.id) === String(id) || String(item._id) === String(id)
    );

    setBooking(
      match || {
        id,
        property: 'Grand Plaza Hotel',
        location: 'New York, USA',
        propertyType: 'Hotel',
        total: 1050,
        status: 'confirmed',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80',
        checkIn: '2026-05-16',
        checkOut: '2026-05-23',
        guests: { adults: 2, rooms: 1, children: 0 },
        guestName: 'Guest User',
        guestEmail: 'guest@example.com',
        guestPhone: '+91 98765 43210',
        amenities: ['Wi-Fi', 'Parking', 'Pool', 'Restaurant'],
        bookedAt: '2026-05-10',
      }
    );
  }, [id]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="rounded-3xl bg-white p-8 shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading booking...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <BookingHeader title={booking.property || 'Booking Details'} />

        <div className="space-y-6">
          <BookingOverview booking={booking} />
          <BookingStatus status={booking.status} total={booking.total} />

          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-6">
              <HotelInformation booking={booking} />
              <RoomInformation booking={booking} />
              <GuestInformation booking={booking} />
              <BookingTimeline />
            </div>

            <div className="space-y-6">
              <QRCodeCard bookingId={booking.id || id} />
              <HotelMap location={booking.location} />
              <PaymentDetails booking={booking} />
              <BookingInvoice booking={booking} />
            </div>
          </div>

          <BookingActions />
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
