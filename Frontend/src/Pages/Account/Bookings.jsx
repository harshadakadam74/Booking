import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  ArrowLeft,
  MapPin,
  Users,
  Hotel,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Receipt,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY = "userBookings";

const AccountBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  useEffect(() => {
    const loadBookings = () => {
      try {
        const savedBookings = localStorage.getItem(STORAGE_KEY);

        if (!savedBookings) {
          setBookings([]);
          return;
        }

        const parsedBookings = JSON.parse(savedBookings);

        setBookings(Array.isArray(parsedBookings) ? parsedBookings : []);
      } catch (error) {
        console.error("Failed to load bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();

    // Update if another tab changes bookings
    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        loadBookings();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusStyle = (status) => {
    const normalizedStatus = String(status || "")
      .toLowerCase()
      .trim();

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled"
    ) {
      return {
        wrapper:
          "border-red-200 bg-red-50 text-red-700",
        icon: <XCircle size={15} />,
        label: "Cancelled",
      };
    }

    if (
      normalizedStatus === "completed" ||
      normalizedStatus === "complete"
    ) {
      return {
        wrapper:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: <CheckCircle2 size={15} />,
        label: "Completed",
      };
    }

    return {
      wrapper:
        "border-[#E3AE32]/40 bg-[#FFF9EC] text-[#A56F00]",
      icon: <CheckCircle2 size={15} />,
      label: "Confirmed",
    };
  };

  // =====================================================
  // GUEST COUNT
  // =====================================================

  const getGuestCount = (booking) => {
    const adults = Number(booking?.guests?.adults || 0);
    const children = Number(booking?.guests?.children || 0);

    return adults + children;
  };

  // =====================================================
  // TOTAL
  // =====================================================

  const formatPrice = (price) => {
    const amount = Number(price || 0);

    return amount.toLocaleString("en-IN");
  };

  // =====================================================
  // VIEW BOOKING
  // =====================================================

  const handleViewDetails = (booking) => {
    const bookingId = booking?.id || booking?._id;

    if (!bookingId) {
      console.error("Booking ID is missing.");
      return;
    }

    navigate(`/account/bookings/${bookingId}`);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 py-10">
        <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#082B5C]" />

            <p className="font-medium text-[#082B5C]">
              Loading your bookings...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 py-8 sm:px-6 lg:px-8">

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#082B5C]/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-[#E3AE32]/10 blur-3xl" />

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* =====================================================
            BACK BUTTON
        ====================================================== */}

        <Link
          to="/account"
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:bg-[#FFF9EC]"
        >
          <ArrowLeft size={17} />
          Back to Account
        </Link>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8 overflow-hidden rounded-[2rem] bg-[#082B5C] p-6 text-white shadow-xl sm:p-8">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E3AE32]/40 bg-[#E3AE32]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#E3AE32]">
                <Sparkles size={14} />
                FastBooking
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                My Bookings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Review your upcoming stays, completed trips and
                booking details — all in one place.
              </p>
            </div>

            {/* Booking Count */}

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
              <div className="rounded-xl bg-[#C58A18] p-3">
                <Calendar size={22} />
              </div>

              <div>
                <p className="text-xs text-blue-100">
                  Total Bookings
                </p>

                <p className="text-2xl font-bold">
                  {bookings.length}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {bookings.length === 0 ? (
          <div className="rounded-[2rem] border border-[#E3AE32]/20 bg-white p-8 text-center shadow-sm sm:p-14">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFF9EC]">
              <Calendar
                size={38}
                className="text-[#C58A18]"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#082B5C]">
              No bookings yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              You don't have any bookings yet. Start exploring
              amazing hotels and make your next trip memorable.
            </p>

            <Link
              to="/book"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#082B5C] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#C58A18]"
            >
              Start Booking
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (

          /* =====================================================
             BOOKING LIST
          ====================================================== */

          <div className="space-y-5">

            {bookings.map((booking, index) => {
              const bookingId =
                booking?.id ||
                booking?._id ||
                `booking-${index}`;

              const status = getStatusStyle(
                booking?.status
              );

              const guestCount = getGuestCount(booking);

              return (
                <article
                  key={bookingId}
                  className="group overflow-hidden rounded-[2rem] border border-[#E3AE32]/20 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#E3AE32]/50 hover:shadow-xl"
                >

                  {/* =================================================
                      BOOKING TOP
                  ================================================== */}

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      {/* HOTEL INFO */}

                      <div className="flex min-w-0 gap-4">

                        {/* Image / Icon */}

                        {booking?.image ? (
                          <img
                            src={booking.image}
                            alt={booking.property || "Hotel"}
                            className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm sm:h-24 sm:w-24"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#082B5C] sm:h-24 sm:w-24">
                            <Hotel
                              size={30}
                              className="text-[#E3AE32]"
                            />
                          </div>
                        )}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h2 className="truncate text-xl font-bold text-[#082B5C] sm:text-2xl">
                              {booking?.property ||
                                "Hotel Booking"}
                            </h2>

                            {booking?.propertyType && (
                              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                {booking.propertyType}
                              </span>
                            )}

                          </div>

                          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin
                              size={15}
                              className="text-[#C58A18]"
                            />
                            {booking?.location ||
                              "Destination not available"}
                          </p>

                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <Receipt size={14} />
                            Booking ID:
                            <span className="font-mono font-semibold text-slate-600">
                              {bookingId}
                            </span>
                          </p>

                        </div>
                      </div>

                      {/* STATUS */}

                      <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">

                        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                          Status
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.wrapper}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        BOOKING INFORMATION
                    ================================================== */}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      {/* Check In */}

                      <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4">

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Calendar
                            size={14}
                            className="text-[#C58A18]"
                          />
                          Check-in
                        </div>

                        <p className="mt-2 font-semibold text-[#082B5C]">
                          {formatDate(booking?.checkIn)}
                        </p>

                      </div>

                      {/* Check Out */}

                      <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4">

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Clock3
                            size={14}
                            className="text-[#C58A18]"
                          />
                          Check-out
                        </div>

                        <p className="mt-2 font-semibold text-[#082B5C]">
                          {formatDate(booking?.checkOut)}
                        </p>

                      </div>

                      {/* Guests */}

                      <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-4">

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Users
                            size={14}
                            className="text-[#C58A18]"
                          />
                          Guests
                        </div>

                        <p className="mt-2 font-semibold text-[#082B5C]">
                          {guestCount}{" "}
                          {guestCount === 1
                            ? "Guest"
                            : "Guests"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {booking?.guests?.rooms ||
                            1}{" "}
                          room
                          {(booking?.guests?.rooms ||
                            1) > 1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                      {/* Total */}

                      <div className="rounded-2xl border border-[#E3AE32]/30 bg-[#FFF9EC] p-4">

                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A56F00]">
                          <Receipt size={14} />
                          Total
                        </div>

                        <p className="mt-2 text-xl font-bold text-[#082B5C]">
                          ₹
                          {formatPrice(
                            booking?.total
                          )}
                        </p>

                      </div>

                    </div>

                    {/* =================================================
                        BOTTOM ACTION BAR
                    ================================================== */}

                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="text-sm text-slate-500">

                        {booking?.guestName && (
                          <span>
                            Guest:{" "}
                            <strong className="text-slate-700">
                              {booking.guestName}
                            </strong>
                          </span>
                        )}

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleViewDetails(
                            booking
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#082B5C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C58A18] focus:outline-none focus:ring-2 focus:ring-[#E3AE32] focus:ring-offset-2"
                      >
                        View Booking Details
                        <ArrowRight size={16} />
                      </button>

                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =====================================================
            FOOTER CTA
        ====================================================== */}

        {bookings.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-[#E3AE32]/20 bg-white p-5 shadow-sm sm:flex-row">

            <div>
              <p className="font-semibold text-[#082B5C]">
                Planning another trip?
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Find your next perfect stay with FastBooking.
              </p>
            </div>

            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-[#082B5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C58A18]"
            >
              Explore Hotels
              <ArrowRight size={16} />
            </Link>

          </div>
        )}

      </div>
    </section>
  );
};

export default AccountBookings;