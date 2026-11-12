import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Download,
  Mail,
  Home,
  CalendarDays,
  Users,
  MapPin,
  Sparkles,
  Copy,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import printReceipt from "../utils/printReceipt";
import { getBookingById } from "../services/bookingService";
import { getHotelById } from "../services/destinationService";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state || {};
  const requestedBookingId = new URLSearchParams(location.search).get("bookingId") ||
    routeState.booking?._id || routeState.booking?.id || "";
  const [property, setProperty] = useState(routeState.property || null);
  const [backendBooking, setBackendBooking] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verificationError, setVerificationError] = useState("");

  const [copied, setCopied] = useState(false);
  const hasSavedBooking = useRef(false);
  const bookingId = String(requestedBookingId || "");
  const searchParams = routeState.searchParams || (backendBooking ? {
    dates: {
      startDate: backendBooking.checkInDate,
      endDate: backendBooking.checkOutDate,
    },
    guests: {
      adults: backendBooking.numberOfGuests,
      children: 0,
      rooms: backendBooking.numberOfRooms,
    },
  } : null);
  const isPaymentConfirmed = backendBooking?.bookingStatus === "CONFIRMED" &&
    backendBooking?.paymentStatus === "SUCCESS" && Boolean(bookingId);

  useEffect(() => {
    let active = true;
    const verifyBooking = async () => {
      if (!bookingId) {
        setVerificationError("A booking confirmation number is required.");
        setVerificationLoading(false);
        return;
      }
      setVerificationLoading(true);
      setVerificationError("");
      try {
        const response = await getBookingById(bookingId);
        const booking = response?.booking;
        if (booking?.bookingStatus !== "CONFIRMED" || booking?.paymentStatus !== "SUCCESS") {
          throw new Error("The server has not confirmed successful payment for this booking.");
        }
        if (active) setBackendBooking(booking);
        const hotelId = String(booking.propertyId || "");
        if (hotelId) {
          try {
            const hotel = await getHotelById(hotelId);
            if (active) {
              setProperty(hotel || {
                name: booking.property || "Hotel booking",
                location: "Hotel details are no longer available",
              });
            }
          } catch {
            if (active) {
              setProperty({
                name: booking.property || "Hotel booking",
                location: "Hotel details are no longer available",
              });
            }
          }
        } else if (active) {
          setProperty({
            name: booking.property || routeState.property?.name || "Hotel booking",
            location: booking.location || routeState.property?.location || "",
          });
        }
      } catch (error) {
        if (active) {
          setVerificationError(error.response?.data?.message || error.message || "Unable to verify this booking.");
          setBackendBooking(null);
        }
      } finally {
        if (active) setVerificationLoading(false);
      }
    };
    verifyBooking();
    return () => {
      active = false;
    };
  }, [bookingId, routeState.property]);

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not provided";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --------------------------------------------------
  // STAY LENGTH
  // --------------------------------------------------

  const getStayLength = (dates) => {
    if (!dates?.startDate || !dates?.endDate) return 1;

    const diff = Math.ceil(
      (new Date(dates.endDate) - new Date(dates.startDate)) /
        (1000 * 60 * 60 * 24),
    );

    return Math.max(1, diff);
  };

  // --------------------------------------------------
  // SAVE BOOKING
  // --------------------------------------------------

  useEffect(() => {
    if (
      !property ||
      !searchParams ||
      !isPaymentConfirmed ||
      hasSavedBooking.current
    ) {
      return;
    }

    try {
      const newBooking = {
        id: bookingId,
        backendBookingId:
          backendBooking?.id ||
          backendBooking?._id ||
          backendBooking?.bookingId ||
          null,

        property: property.name,
        location: property.location,
        confirmationNumber: backendBooking.confirmationNumber || bookingId,
        roomType: backendBooking.roomTypeName || "Room",
        paymentId: backendBooking.paymentDetails?.paymentId || backendBooking.paymentDetails?.transactionId,
        image: property.image || property.images?.[0] || "",

        checkIn: searchParams.dates
          ? new Date(searchParams.dates.startDate).toISOString().split("T")[0]
          : "",

        checkOut: searchParams.dates
          ? new Date(searchParams.dates.endDate).toISOString().split("T")[0]
          : "",

        guests: searchParams.guests || {},

        status: "confirmed",

        total: Number(backendBooking.totalPrice),

        bookedAt: new Date().toISOString(),

        propertyType: property.type,

        rating: property.rating,
        reviews: property.ratingCount,
      };

      const existingBookings = localStorage.getItem("userBookings");

      const parsedBookings = existingBookings ? JSON.parse(existingBookings) : [];
      const bookings = Array.isArray(parsedBookings) ? parsedBookings : [];
      const existingBookingIndex = bookings.findIndex((booking) => (
        String(booking.backendBookingId || booking.id || "") === bookingId
      ));
      if (existingBookingIndex >= 0) {
        bookings[existingBookingIndex] = { ...bookings[existingBookingIndex], ...newBooking };
      } else {
        bookings.unshift(newBooking);
      }

      localStorage.setItem("userBookings", JSON.stringify(bookings));

      hasSavedBooking.current = true;
    } catch (error) {
      console.error("Unable to save booking:", error);
    }
  }, [bookingId, property, searchParams, backendBooking, isPaymentConfirmed]);

  // --------------------------------------------------
  // NO BOOKING
  // --------------------------------------------------

  if (verificationLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <p aria-live="polite" className="rounded-2xl bg-white px-6 py-5 text-slate-700 shadow">Verifying payment and booking with FastBooking…</p>
      </main>
    );
  }

  if (!property || !searchParams || !isPaymentConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <CheckCircle size={32} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {isPaymentConfirmed ? "Booking information was not found" : "Payment is not confirmed"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {verificationError || "No successful payment confirmation is available for this booking. Return to your bookings or start again."}
          </p>

          <button
            onClick={() => navigate("/account/bookings")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-800 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-900"
          >
            <Home size={18} />
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // CALCULATIONS
  // --------------------------------------------------

  const nights = Number(backendBooking.numberOfNights) || getStayLength(searchParams?.dates);
  const rooms = Number(backendBooking.numberOfRooms || searchParams?.guests?.rooms || 1);
  const totalAmount = Number(backendBooking.totalPrice);
  const currency = property.currency || "INR";
  const confirmationNumber = backendBooking.confirmationNumber || bookingId;
  const paymentId = backendBooking.paymentDetails?.paymentId ||
    backendBooking.paymentDetails?.transactionId ||
    "Not provided";
  const roomTypeName = backendBooking.roomTypeName || "Room";
  const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);

  const adults = searchParams?.guests?.adults || 0;

  const children = searchParams?.guests?.children || 0;

  const guestSummary = [
    adults ? `${adults} adult${adults > 1 ? "s" : ""}` : null,

    children ? `${children} child${children > 1 ? "ren" : ""}` : null,
  ]
    .filter(Boolean)
    .join(" • ") ||
    `${backendBooking.numberOfGuests} guest${backendBooking.numberOfGuests === 1 ? "" : "s"}`;

  // --------------------------------------------------
  // COPY BOOKING ID
  // --------------------------------------------------

  const handleCopyBookingId = async () => {
    try {
      await navigator.clipboard.writeText(bookingId);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Unable to copy booking ID", error);
    }
  };

  // --------------------------------------------------
  // DOWNLOAD / PRINT RECEIPT
  // --------------------------------------------------

  const handleDownloadReceipt = () => {
    printReceipt({
      bookingId,
      confirmationNumber,
      property: property.name,
      location: property.location,
      roomType: roomTypeName,
      paymentId,
      checkIn: formatDate(searchParams?.dates?.startDate),
      checkOut: formatDate(searchParams?.dates?.endDate),
      guests: searchParams?.guests,
      rooms,
      total: totalAmount,
      currency: currency === "INR" ? "₹" : `${currency} `,
    });
  };

  // --------------------------------------------------
  // EMAIL CONFIRMATION
  // --------------------------------------------------

  const handleEmailConfirmation = () => {
    const mailto = `mailto:reservations@fastbooking.com?subject=${encodeURIComponent(
      `Booking Confirmation ${bookingId}`,
    )}&body=${encodeURIComponent(
      `Hi there,

Here is your booking confirmation.

Booking ID: ${bookingId}
Confirmation number: ${confirmationNumber}
Property: ${property.name}
Room: ${roomTypeName}
Check-in: ${formatDate(searchParams?.dates?.startDate)}
Check-out: ${formatDate(searchParams?.dates?.endDate)}
Total: ${formatCurrency(totalAmount)}
Payment ID: ${paymentId}

Thank you for booking with FastBooking.`,
    )}`;

    window.location.href = mailto;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ==========================================
            SUCCESS HEADER
        ========================================== */}

        <div className="mb-6 overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 p-7 text-white shadow-xl sm:p-9">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-400/30 bg-yellow-400 shadow-lg shadow-yellow-500/20">
              <CheckCircle
                size={42}
                className="text-blue-950"
                strokeWidth={2.5}
              />
            </div>

            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
              <Sparkles size={14} />
              Reservation Secured
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Booking Confirmed
            </h1>

            <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">
              Your stay is booked successfully. Everything is ready for your
              upcoming trip.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <CheckCircle size={16} className="text-yellow-400" />
                <span>Confirmed</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <Clock size={16} className="text-yellow-400" />
                <span>
                  {nights} night
                  {nights > 1 ? "s" : ""} planned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            MAIN SHEET
        ========================================== */}

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            {/* ======================================
                LEFT
            ====================================== */}

            <div className="space-y-6">
              {/* PROPERTY CARD */}

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {property.image || property.images?.[0]
                    ? (
                      <img
                        src={property.image || property.images[0]}
                        alt={property.name}
                        className="h-36 w-full rounded-2xl object-cover shadow-sm sm:h-28 sm:w-28"
                      />
                    )
                    : <div className="h-36 w-full rounded-2xl bg-slate-200 sm:h-28 sm:w-28" aria-label="No hotel image available" />}

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {property.name}
                      </h2>

                      {property.type && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                          {property.type}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-blue-700" />

                      {property.location}
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-semibold">Room:</span> {roomTypeName}
                    </p>

                    {/* Rating */}

                    {Number(property.ratingCount) > 0 && Number.isFinite(Number(property.rating)) && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center text-yellow-500" aria-label={`${property.rating} out of 5`}>
                          {Number(property.rating).toFixed(1)} ★
                        </div>
                        <span className="text-sm text-slate-600">
                          {property.ratingCount} recorded rating{property.ratingCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STAY + TRAVELERS */}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* DATES */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      <CalendarDays size={18} className="text-blue-700" />
                    </div>
                    Stay Dates
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Check-in
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(searchParams?.dates?.startDate)}
                      </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Check-out
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(searchParams?.dates?.endDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TRAVELERS */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50">
                      <Users size={18} className="text-yellow-700" />
                    </div>
                    Travelers
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Guests
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {guestSummary}
                      </p>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Rooms
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {rooms} room
                        {rooms > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOOKING STATUS */}

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-800 text-yellow-400 shadow-lg">
                    <ShieldCheck size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-blue-950">
                      Your reservation is secure
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Your booking has been successfully recorded. Keep your
                      booking ID for future reference.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================
                RIGHT - PAYMENT SUMMARY
            ====================================== */}

            <div className="rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-blue-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                    Payment Summary
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    Total Paid
                  </h3>
                </div>

                <div className="rounded-2xl border border-yellow-200 bg-yellow-400 px-4 py-3 text-lg font-extrabold text-blue-950 shadow-sm">
                  {formatCurrency(totalAmount)}
                </div>
              </div>

              {/* PRICE DETAILS */}

              <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                  <span>Room rate</span>

                  <span className="font-medium text-slate-900">
                    {formatCurrency(backendBooking.pricePerNight)} × {nights} night
                    {nights > 1 ? "s" : ""} × {rooms} room{rooms === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Total Paid</span>

                    <span className="text-2xl font-extrabold text-blue-900">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOOKING ID */}

              <div className="mt-4 rounded-2xl border border-yellow-300 bg-yellow-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">
                      Confirmation number
                    </p>
                    <p className="mt-1 font-bold tracking-wide text-blue-950">
                      {confirmationNumber}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">
                      Booking ID
                    </p>

                    <p className="mt-1 font-bold tracking-wide text-blue-950">
                      {bookingId}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyBookingId}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-950"
                  >
                    <Copy size={15} />

                    {copied ? "Copied" : "Copy ID"}
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Payment ID
                </p>
                <p className="mt-1 break-all font-semibold text-slate-900">{paymentId}</p>
              </div>

              {/* SECURE PAYMENT */}

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <ShieldCheck size={22} className="shrink-0 text-blue-700" />

                <div>
                  <p className="text-sm font-bold text-blue-950">
                    Secure Payment
                  </p>

                  <p className="mt-1 text-xs text-blue-700">
                    Your payment and booking information are securely handled by
                    FastBooking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            ACTION BUTTONS
        ========================================== */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-900 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-950"
          >
            <Download size={18} />
            Download Receipt
          </button>

          <button
            type="button"
            onClick={handleEmailConfirmation}
            className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-400 bg-yellow-400 px-5 py-3.5 font-bold text-blue-950 shadow-lg shadow-yellow-100 transition hover:bg-yellow-500"
          >
            <Mail size={18} />
            Email Confirmation
          </button>

          <button
            type="button"
            onClick={() => navigate("/account/bookings")}
            className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3.5 font-bold text-blue-900 shadow-sm transition hover:bg-blue-50"
          >
            <Home size={18} />
            View My Bookings
          </button>
        </div>

        {/* ==========================================
            WHAT HAPPENS NEXT
        ========================================== */}

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100">
              <ArrowRight size={18} className="text-yellow-700" />
            </div>
            What Happens Next?
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {/* STEP 1 */}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                <Mail size={19} />
              </div>

              <h4 className="font-bold text-slate-900">Check Your Inbox</h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                You will receive a confirmation email containing your booking
                details.
              </p>
            </div>

            {/* STEP 2 */}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-yellow-100 p-3 text-yellow-700">
                <CheckCircle size={19} />
              </div>

              <h4 className="font-bold text-slate-900">
                Reservation Confirmed
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your property reservation has been successfully confirmed.
              </p>
            </div>

            {/* STEP 3 */}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 inline-flex rounded-xl bg-blue-100 p-3 text-blue-700">
                <Home size={19} />
              </div>

              <h4 className="font-bold text-slate-900">Manage Your Stay</h4>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Visit your account anytime to view or manage your booking.
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            RETURN HOME
        ========================================== */}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            <Home size={17} />
            Return Home
          </button>
        </div>

        {/* FOOTER */}

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <Sparkles size={14} className="text-yellow-500" />
          Thank you for choosing FastBooking.
        </div>
      </div>

      {/* PRINT STYLES */}

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            button {
              display: none !important;
            }

            .shadow-xl,
            .shadow-lg,
            .shadow-sm {
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentSuccess;
