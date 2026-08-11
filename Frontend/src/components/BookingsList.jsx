import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setBookings,
  setError,
} from "../bookingSlice";
import { getUserBookings } from "../services/bookingService";
import { toast } from "react-toastify";

import {
  CalendarDays,
  Users,
  DoorOpen,
  DollarSign,
  CreditCard,
  Building2,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function BookingsList() {
  const dispatch = useDispatch();

  const { bookings, loading } = useSelector(
    (state) => state.booking
  );

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    dispatch(setLoading(true));

    try {
      const response = await getUserBookings();

      dispatch(setBookings(response?.bookings || []));
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch bookings";

      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      PENDING:
        "bg-yellow-50 text-yellow-700 border border-yellow-200",

      CONFIRMED:
        "bg-green-50 text-green-700 border border-green-200",

      CHECKED_IN:
        "bg-blue-50 text-blue-700 border border-blue-200",

      COMPLETED:
        "bg-slate-100 text-slate-700 border border-slate-200",

      CANCELLED:
        "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      colors[status] ||
      "bg-slate-100 text-slate-700 border border-slate-200"
    );
  };

  // Format status
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              h-10 w-10 animate-spin rounded-full
              border-4 border-slate-200
              border-t-[#C58A18]
            "
          />

          <p className="text-sm font-medium text-[#082B5C]">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!bookings || bookings.length === 0) {
    return (
      <div
        className="
          mx-auto max-w-2xl
          rounded-2xl
          border border-slate-200
          bg-white
          px-6 py-12
          text-center
          shadow-sm
        "
      >
        <div
          className="
            mx-auto mb-5
            flex h-16 w-16
            items-center justify-center
            rounded-2xl
            bg-[#FFF8E7]
          "
        >
          <CalendarDays
            size={32}
            className="text-[#C58A18]"
          />
        </div>

        <h2 className="text-2xl font-bold text-[#082B5C]">
          No Bookings Found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          You don't have any bookings yet. Start exploring
          hotels, resorts, villas, and apartments.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* ================= HEADER ================= */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="h-px w-8 bg-[#C58A18]" />

            <span
              className="
                text-xs font-semibold
                uppercase tracking-widest
                text-[#C58A18]
              "
            >
              Your Trips
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#082B5C]">
            My Bookings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage your upcoming and previous stays.
          </p>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={fetchBookings}
          className="
            inline-flex items-center justify-center
            gap-2 rounded-xl
            border border-[#082B5C]
            bg-white
            px-4 py-2.5
            text-sm font-semibold
            text-[#082B5C]
            transition-all duration-300
            hover:border-[#C58A18]
            hover:bg-[#FFF8E7]
            hover:text-[#C58A18]
          "
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* ================= BOOKINGS ================= */}
      <div className="grid gap-6">

        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="
              group overflow-hidden
              rounded-2xl
              border border-slate-200
              bg-white
              shadow-sm
              transition-all duration-300
              hover:-translate-y-1
              hover:border-[#C58A18]/40
              hover:shadow-xl
            "
          >

            {/* Gold top border */}
            <div
              className="
                h-1 w-full
                bg-gradient-to-r
                from-[#082B5C]
                via-[#C58A18]
                to-[#082B5C]
              "
            />

            <div className="p-5 sm:p-6">

              {/* ================= TOP ================= */}
              <div
                className="
                  mb-6 flex
                  flex-col gap-4
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <div className="flex items-start gap-3">

                  <div
                    className="
                      flex h-12 w-12 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-[#FFF8E7]
                    "
                  >
                    <Building2
                      size={24}
                      className="text-[#C58A18]"
                    />
                  </div>

                  <div>
                    <h3
                      className="
                        text-xl font-bold
                        text-[#082B5C]
                      "
                    >
                      {booking.property}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Booking ID: {booking._id}
                    </p>
                  </div>
                </div>

                <span
                  className={`
                    inline-flex w-fit
                    rounded-full
                    px-3 py-1.5
                    text-xs font-semibold
                    ${getStatusColor(booking.bookingStatus)}
                  `}
                >
                  {formatStatus(booking.bookingStatus)}
                </span>
              </div>

              {/* ================= FIRST ROW ================= */}
              <div
                className="
                  grid grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >

                {/* Check In */}
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs font-medium text-slate-500">
                      Check-in
                    </span>
                  </div>

                  <p className="font-semibold text-[#082B5C]">
                    {formatDate(booking.checkInDate)}
                  </p>
                </div>

                {/* Check Out */}
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs font-medium text-slate-500">
                      Check-out
                    </span>
                  </div>

                  <p className="font-semibold text-[#082B5C]">
                    {formatDate(booking.checkOutDate)}
                  </p>
                </div>

                {/* Nights */}
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs font-medium text-slate-500">
                      Nights
                    </span>
                  </div>

                  <p className="font-semibold text-[#082B5C]">
                    {booking.numberOfNights || 0}
                  </p>
                </div>

                {/* Total */}
                <div className="rounded-xl bg-[#FFF8E7] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <DollarSign
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs font-medium text-slate-500">
                      Total Price
                    </span>
                  </div>

                  <p className="text-xl font-bold text-[#082B5C]">
                    ${booking.totalPrice ?? 0}
                  </p>
                </div>
              </div>

              {/* ================= SECOND ROW ================= */}
              <div
                className="
                  mt-4 grid grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >

                {/* Guests */}
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Users
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs text-slate-500">
                      Guests
                    </span>
                  </div>

                  <p className="font-semibold text-[#082B5C]">
                    {booking.numberOfGuests}
                  </p>
                </div>

                {/* Rooms */}
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <DoorOpen
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs text-slate-500">
                      Rooms
                    </span>
                  </div>

                  <p className="font-semibold text-[#082B5C]">
                    {booking.numberOfRooms}
                  </p>
                </div>

                {/* Price */}
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <DollarSign
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs text-slate-500">
                      Price / Night
                    </span>
                  </div>

                  <p className="font-semibold text-[#082B5C]">
                    ${booking.pricePerNight}
                  </p>
                </div>

                {/* Payment */}
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CreditCard
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <span className="text-xs text-slate-500">
                      Payment
                    </span>
                  </div>

                  <p className="font-semibold capitalize text-[#082B5C]">
                    {booking.paymentStatus || "Pending"}
                  </p>
                </div>
              </div>

              {/* ================= SPECIAL REQUEST ================= */}
              {booking.specialRequests && (
                <div
                  className="
                    mt-5
                    rounded-xl
                    border border-[#C58A18]/20
                    bg-[#FFF8E7]
                    p-4
                  "
                >
                  <div className="mb-2 flex items-center gap-2">
                    <FileText
                      size={17}
                      className="text-[#C58A18]"
                    />

                    <p className="text-sm font-semibold text-[#082B5C]">
                      Special Requests
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    {booking.specialRequests}
                  </p>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}