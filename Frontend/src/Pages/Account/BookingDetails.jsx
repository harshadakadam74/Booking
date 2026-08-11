import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Sparkles,
  ArrowLeft,
  CalendarDays,
  Users,
  Hotel,
} from "lucide-react";

import BookingHeader from "../../components/booking/BookingHeader";
import BookingStatus from "../../components/booking/BookingStatus";
import HotelInformation from "../../components/booking/HotelInformation";
import RoomInformation from "../../components/booking/RoomInformation";
import GuestInformation from "../../components/booking/GuestInformation";
import PaymentDetails from "../../components/booking/PaymentDetails";
import BookingTimeline from "../../components/booking/BookingTimeline";
import BookingInvoice from "../../components/booking/BookingInvoice";
import BookingActions from "../../components/booking/BookingActions";
import BookingOverview from "../../components/booking/BookingOverview";
import QRCodeCard from "../../components/booking/QRCodeCard";
import HotelMap from "../../components/booking/HotelMap";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  // =====================================================
  // FALLBACK BOOKING
  // =====================================================

  const createFallbackBooking = (bookingId) => ({
    id: bookingId,

    property: "Grand Plaza Hotel",

    location: "New York, USA",

    propertyType: "Hotel",

    total: 1050,

    status: "confirmed",

    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",

    checkIn: "2026-05-16",

    checkOut: "2026-05-23",

    guests: {
      adults: 2,
      rooms: 1,
      children: 0,
    },

    guestName: "Guest User",

    guestEmail: "guest@example.com",

    guestPhone: "+91 98765 43210",

    amenities: [
      "Wi-Fi",
      "Parking",
      "Pool",
      "Restaurant",
    ],

    bookedAt: "2026-05-10",

    confirmationNumber: "CNF-782945",
  });

  // =====================================================
  // LOAD BOOKING
  // =====================================================

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("userBookings");

      const bookings = stored
        ? JSON.parse(stored)
        : [];

      const match = bookings.find(
        (item) =>
          String(item.id) === String(id) ||
          String(item._id) === String(id)
      );

      setBooking(
        match || createFallbackBooking(id)
      );
    } catch (error) {
      console.error(
        "Failed to load booking:",
        error
      );

      setBooking(createFallbackBooking(id));
    }
  }, [id]);

  // =====================================================
  // TRIP DURATION
  // =====================================================

  const getTripDuration = () => {
    if (
      !booking?.checkIn ||
      !booking?.checkOut
    ) {
      return "Flexible stay";
    }

    const start = new Date(
      booking.checkIn
    );

    const end = new Date(
      booking.checkOut
    );

    const diff = Math.max(
      1,
      Math.round(
        (end - start) /
          (1000 * 60 * 60 * 24)
      )
    );

    return `${diff} night${
      diff > 1 ? "s" : ""
    }`;
  };

  // =====================================================
  // DOWNLOAD RECEIPT
  // =====================================================

  const handleDownloadReceipt = () => {
    const receipt = `
FASTBOOKING
================================

BOOKING RECEIPT

Booking ID:
${booking?.id || id}

Confirmation Number:
${booking?.confirmationNumber || "N/A"}

Property:
${booking?.property || "Booking"}

Location:
${booking?.location || "N/A"}

Status:
${booking?.status || "Confirmed"}

Check-in:
${booking?.checkIn || "N/A"}

Check-out:
${booking?.checkOut || "N/A"}

Guests:
${booking?.guests?.adults || 0} Adults
${booking?.guests?.children || 0} Children

Rooms:
${booking?.guests?.rooms || 1}

Total:
$${booking?.total || 0}

================================
Thank you for booking with FastBooking.
`;

    const blob = new Blob(
      [receipt],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `fastbooking-receipt-${
      booking?.id || id
    }.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // MODIFY BOOKING
  // =====================================================

  const handleModifyBooking = () => {
    navigate("/book", {
      state: {
        booking,
      },
    });
  };

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const handleCancelBooking = () => {
    if (!booking) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      const stored =
        localStorage.getItem(
          "userBookings"
        );

      const bookings = stored
        ? JSON.parse(stored)
        : [];

      const nextBookings =
        bookings.map((item) => {
          const sameBooking =
            String(item.id) ===
              String(booking.id) ||
            String(item._id) ===
              String(booking.id);

          return sameBooking
            ? {
                ...item,
                status: "cancelled",
              }
            : item;
        });

      localStorage.setItem(
        "userBookings",
        JSON.stringify(nextBookings)
      );

      setBooking({
        ...booking,
        status: "cancelled",
      });
    } catch (error) {
      console.error(
        "Unable to cancel booking:",
        error
      );
    }
  };

  // =====================================================
  // CONTACT HOTEL
  // =====================================================

  const handleContactHotel = () => {
    const property =
      booking?.property ||
      "FastBooking";

    const email =
      `reservations@${property
        .toLowerCase()
        .replace(/\s+/g, "")}.com`;

    const subject = encodeURIComponent(
      `Booking Inquiry ${
        booking?.id || id
      }`
    );

    window.location.href =
      `mailto:${email}?subject=${subject}`;
  };

  // =====================================================
  // REBOOK
  // =====================================================

  const handleRebook = () => {
    navigate("/book-place", {
      state: {
        location:
          booking?.location ||
          "New York, USA",

        dates: {
          startDate: booking?.checkIn
            ? new Date(
                booking.checkIn
              )
            : new Date(),

          endDate: booking?.checkOut
            ? new Date(
                booking.checkOut
              )
            : new Date(
                Date.now() +
                  3 *
                    24 *
                    60 *
                    60 *
                    1000
              ),
        },

        guests:
          booking?.guests || {
            adults: 2,
            children: 0,
            rooms: 1,
          },
      },
    });
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    navigate(-1);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E3AE32]/30 border-t-[#082B5C]" />

          <p className="font-semibold text-[#082B5C]">
            Loading booking...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // VALUES
  // =====================================================

  const totalGuests =
    (booking.guests?.adults || 0) +
    (booking.guests?.children || 0);

  const isCancelled =
    String(booking.status || "")
      .toLowerCase() === "cancelled";

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          HEADER
      ================================================= */}

      <BookingHeader
        title={
          booking.property ||
          "Booking Details"
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/30 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:bg-[#FFF9EC]"
        >
          <ArrowLeft size={17} />

          Back to bookings
        </button>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#082B5C] p-6 text-white shadow-xl sm:p-8">

          {/* Gold Glow */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E3AE32]/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            {/* HOTEL INFO */}

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/40 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">

                <Sparkles
                  size={16}
                  className="text-[#E3AE32]"
                />

                Trip ready to go

              </div>

              <h1 className="text-2xl font-bold sm:text-4xl">
                {booking.property ||
                  "Your Stay"}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-blue-100">

                <MapPin
                  size={17}
                  className="text-[#E3AE32]"
                />

                {booking.location ||
                  "Destination"}

              </p>

              {booking.confirmationNumber && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">

                  <span className="text-blue-200">
                    Confirmation:
                  </span>

                  <span className="font-bold text-[#E3AE32]">
                    {booking.confirmationNumber}
                  </span>

                </div>
              )}

            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              {/* Stay */}

              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur sm:px-5">

                <div className="flex items-center gap-2">

                  <CalendarDays
                    size={16}
                    className="text-[#E3AE32]"
                  />

                  <p className="text-[10px] uppercase tracking-widest text-blue-200 sm:text-xs">
                    Stay
                  </p>

                </div>

                <p className="mt-2 text-sm font-bold sm:text-base">
                  {getTripDuration()}
                </p>

              </div>

              {/* Guests */}

              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur sm:px-5">

                <div className="flex items-center gap-2">

                  <Users
                    size={16}
                    className="text-[#E3AE32]"
                  />

                  <p className="text-[10px] uppercase tracking-widest text-blue-200 sm:text-xs">
                    Guests
                  </p>

                </div>

                <p className="mt-2 text-sm font-bold sm:text-base">
                  {totalGuests}
                </p>

              </div>

              {/* Rooms */}

              <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur sm:px-5">

                <div className="flex items-center gap-2">

                  <Hotel
                    size={16}
                    className="text-[#E3AE32]"
                  />

                  <p className="text-[10px] uppercase tracking-widest text-blue-200 sm:text-xs">
                    Rooms
                  </p>

                </div>

                <p className="mt-2 text-sm font-bold sm:text-base">
                  {booking.guests?.rooms ||
                    1}
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* =================================================
            BOOKING OVERVIEW
        ================================================= */}

        <div className="space-y-6">

          <BookingOverview
            booking={booking}
          />

          {/* STATUS */}

          <BookingStatus
            status={booking.status}
            total={booking.total}
          />

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">

            {/* LEFT COLUMN */}

            <div className="space-y-6">

              <HotelInformation
                booking={booking}
              />

              <RoomInformation
                booking={booking}
              />

              <GuestInformation
                booking={booking}
              />

              <BookingTimeline />

            </div>

            {/* RIGHT COLUMN */}

            <div className="space-y-6">

              <QRCodeCard
                bookingId={
                  booking.id || id
                }
              />

              <HotelMap
                location={
                  booking.location
                }
              />

              <PaymentDetails
                booking={booking}
              />

              <BookingInvoice
                booking={booking}
              />

            </div>

          </div>

          {/* =================================================
              BOOKING ACTIONS
          ================================================= */}

          <BookingActions
            onDownloadReceipt={
              handleDownloadReceipt
            }
            onModifyBooking={
              handleModifyBooking
            }
            onCancelBooking={
              handleCancelBooking
            }
            onContactHotel={
              handleContactHotel
            }
            onRebook={handleRebook}
            isCancelled={isCancelled}
          />

        </div>
      </main>
    </div>
  );
};

export default BookingDetails;