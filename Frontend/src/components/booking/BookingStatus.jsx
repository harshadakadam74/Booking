import React from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  CreditCard,
} from "lucide-react";

const BookingStatus = ({ status, total }) => {
  const normalized = String(status || "Confirmed").toLowerCase();

  const getStatusConfig = () => {
    if (
      normalized === "confirmed" ||
      normalized === "paid" ||
      normalized === "completed"
    ) {
      return {
        label:
          normalized === "paid"
            ? "Paid"
            : normalized === "completed"
            ? "Completed"
            : "Confirmed",
        icon: CheckCircle2,
        iconColor: "text-green-600",
        badge:
          "border-green-200 bg-green-50 text-green-700",
      };
    }

    if (
      normalized === "pending" ||
      normalized === "processing"
    ) {
      return {
        label: "Pending",
        icon: Clock3,
        iconColor: "text-[#C58A18]",
        badge:
          "border-yellow-200 bg-yellow-50 text-yellow-700",
      };
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled"
    ) {
      return {
        label: "Cancelled",
        icon: XCircle,
        iconColor: "text-red-600",
        badge:
          "border-red-200 bg-red-50 text-red-700",
      };
    }

    return {
      label: status || "Confirmed",
      icon: CheckCircle2,
      iconColor: "text-[#082B5C]",
      badge:
        "border-blue-200 bg-blue-50 text-[#082B5C]",
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Gold Accent */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-[#C58A18]" />

      <div className="flex flex-col gap-5 pl-2 sm:flex-row sm:items-center sm:justify-between">

        {/* Booking Status */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Booking Status
          </p>

          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusConfig.badge}`}
          >
            <StatusIcon
              size={17}
              className={statusConfig.iconColor}
            />

            {statusConfig.label}
          </div>
        </div>

        {/* Total Paid */}
        <div className="rounded-2xl bg-blue-50 px-6 py-4 text-left sm:min-w-[180px] sm:text-right">

          <div className="flex items-center gap-2 sm:justify-end">
            <CreditCard
              size={17}
              className="text-[#C58A18]"
            />

            <p className="text-sm font-medium text-slate-500">
              Total Paid
            </p>
          </div>

          <p className="mt-1 text-3xl font-bold text-[#082B5C]">
            ₹{Number(total || 0).toLocaleString("en-IN")}
          </p>

        </div>

      </div>

      {/* Gold Divider */}
      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

      <p className="mt-3 text-xs text-slate-400">
        Payment and booking information is securely maintained by FastBooking.
      </p>

    </div>
  );
};

export default BookingStatus;