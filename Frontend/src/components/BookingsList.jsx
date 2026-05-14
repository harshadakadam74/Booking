import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setBookings, setError } from "../bookingSlice";
import { getUserBookings } from "../services/bookingService";
import { toast } from "react-toastify";

export default function BookingsList() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.booking);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    dispatch(setLoading(true));
    try {
      const response = await getUserBookings();
      dispatch(setBookings(response.bookings));
    } catch (error) {
      const errorMsg = error.message || "Failed to fetch bookings";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CHECKED_IN: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No bookings found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{booking.property}</h3>
                <p className="text-gray-500 text-sm">ID: {booking._id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.bookingStatus)}`}>
                {booking.bookingStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">Check-in</p>
                <p className="font-semibold">{new Date(booking.checkInDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Check-out</p>
                <p className="font-semibold">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Nights</p>
                <p className="font-semibold">{booking.numberOfNights}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Price</p>
                <p className="font-semibold text-green-600">${booking.totalPrice}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Guests</p>
                <p className="font-semibold">{booking.numberOfGuests}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Rooms</p>
                <p className="font-semibold">{booking.numberOfRooms}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Price/Night</p>
                <p className="font-semibold">${booking.pricePerNight}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Payment Status</p>
                <p className="font-semibold capitalize">{booking.paymentStatus}</p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-500 text-sm">Special Requests</p>
                <p className="text-gray-700">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
