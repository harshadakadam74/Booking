import React from "react";
import { Download, FileText, Receipt } from "lucide-react";

const BookingInvoice = ({
  booking,
  onDownloadInvoice,
}) => {
  const invoiceId =
    booking?.invoiceId ||
    `INV-${booking?.id || booking?.bookingId || "BK0001"}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md">

      {/* Header */}
      <div className="relative bg-[#082B5C] px-6 py-5">

        {/* Gold Accent */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#C58A18]" />

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-white/10 p-3">
              <Receipt
                size={22}
                className="text-[#E3AE32]"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Invoice
              </h3>

              <p className="mt-1 text-sm text-blue-100">
                FastBooking Reservation
              </p>
            </div>

          </div>

          <FileText
            size={30}
            className="text-[#E3AE32]"
          />

        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-6">

        {/* Invoice ID */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Invoice ID
              </p>

              <p className="mt-1 text-lg font-bold text-[#082B5C]">
                {invoiceId}
              </p>
            </div>

            <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
              <span className="text-xs font-semibold text-[#C58A18]">
                PAID
              </span>
            </div>

          </div>

        </div>

        {/* Booking Information */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Booking ID
            </p>

            <p className="mt-1 font-semibold text-[#082B5C]">
              {booking?.bookingId ||
                booking?.id ||
                "BK0001"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Total Amount
            </p>

            <p className="mt-1 font-semibold text-[#082B5C]">
              ₹{booking?.totalAmount || "0"}
            </p>
          </div>

        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={() => onDownloadInvoice?.(booking)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-lg"
        >
          <Download size={18} />

          Download Invoice
        </button>

        {/* Bottom Accent */}
        <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

        <p className="mt-3 text-center text-xs text-slate-400">
          Thank you for booking with FastBooking
        </p>

      </div>
    </div>
  );
};

export default BookingInvoice;