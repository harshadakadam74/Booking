import React from "react";
import {
  BadgeCheck,
  CalendarDays,
  Hash,
  QrCode,
} from "lucide-react";

const BookingOverview = ({ booking }) => {
  const overview = {
    bookingId:
      booking?.bookingId ||
      booking?.id ||
      "BK11560186",

    status:
      booking?.status ||
      "Confirmed",

    bookingDate: booking?.bookedAt
      ? new Date(booking.bookedAt).toLocaleDateString(
          "en-US",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "28 Jul 2026",

    confirmationNumber:
      booking?.confirmationNumber ||
      "CNF-782945",
  };

  // Status Theme
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return {
          badge:
            "bg-green-50 text-green-700 border-green-200",
          icon: "text-green-600",
        };

      case "pending":
        return {
          badge:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: "text-[#C58A18]",
        };

      case "cancelled":
      case "canceled":
        return {
          badge:
            "bg-red-50 text-red-700 border-red-200",
          icon: "text-red-600",
        };

      default:
        return {
          badge:
            "bg-blue-50 text-[#082B5C] border-blue-200",
          icon: "text-[#082B5C]",
        };
    }
  };

  const statusStyle = getStatusStyle(
    overview.status
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md">

      {/* Header */}
      <div className="relative bg-[#082B5C] px-6 py-5">

        {/* Gold Accent */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#C58A18]" />

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#E3AE32]">
              FastBooking
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Booking Overview
            </h2>
          </div>

          <div className="hidden rounded-xl bg-white/10 p-3 sm:block">
            <QrCode
              size={28}
              className="text-[#E3AE32]"
            />
          </div>

        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Booking ID */}
        <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

          <div className="mb-4 inline-flex rounded-xl bg-white p-3 shadow-sm">
            <Hash
              size={20}
              className="text-[#082B5C]"
            />
          </div>

          <p className="text-sm text-slate-500">
            Booking ID
          </p>

          <h3 className="mt-1 break-all font-bold text-[#082B5C]">
            {overview.bookingId}
          </h3>

        </div>

        {/* Booking Status */}
        <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

          <div className="mb-4 inline-flex rounded-xl bg-white p-3 shadow-sm">
            <BadgeCheck
              size={20}
              className={statusStyle.icon}
            />
          </div>

          <p className="text-sm text-slate-500">
            Booking Status
          </p>

          <span
            className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${statusStyle.badge}`}
          >
            {overview.status}
          </span>

        </div>

        {/* Booking Date */}
        <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

          <div className="mb-4 inline-flex rounded-xl bg-white p-3 shadow-sm">
            <CalendarDays
              size={20}
              className="text-[#C58A18]"
            />
          </div>

          <p className="text-sm text-slate-500">
            Booking Date
          </p>

          <h3 className="mt-1 font-bold text-[#082B5C]">
            {overview.bookingDate}
          </h3>

        </div>

        {/* Confirmation Number */}
        <div className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#C58A18] hover:shadow-md">

          <div className="mb-4 inline-flex rounded-xl bg-white p-3 shadow-sm">
            <QrCode
              size={20}
              className="text-[#C58A18]"
            />
          </div>

          <p className="text-sm text-slate-500">
            Confirmation No.
          </p>

          <h3 className="mt-1 break-all font-bold text-[#082B5C]">
            {overview.confirmationNumber}
          </h3>

        </div>

      </div>

      {/* Bottom Gold Line */}
      <div className="mx-6 mb-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default BookingOverview;