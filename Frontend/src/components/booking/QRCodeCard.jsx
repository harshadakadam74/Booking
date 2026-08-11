import React from "react";
import QRCode from "react-qr-code";
import { QrCode, ShieldCheck } from "lucide-react";

const QRCodeCard = ({ bookingId }) => {
  const qrValue = String(bookingId || "BK11560186");

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-blue-50 p-3">
          <QrCode
            size={22}
            className="text-[#082B5C]"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#082B5C]">
            Booking QR Code
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Use this QR code for quick check-in
          </p>
        </div>

      </div>

      {/* QR Code Area */}
      <div className="flex justify-center">

        <div className="rounded-3xl border-2 border-[#E3AE32]/40 bg-[#FFF8E7] p-5 shadow-sm">

          <div className="rounded-2xl bg-white p-4 shadow-md">

            <QRCode
              value={qrValue}
              size={180}
              bgColor="#FFFFFF"
              fgColor="#082B5C"
            />

          </div>

        </div>

      </div>

      {/* Booking ID */}
      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">

        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Booking ID
        </p>

        <p className="mt-1 font-bold text-[#082B5C]">
          {qrValue}
        </p>

      </div>

      {/* Check-in Message */}
      <div className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-slate-600">

        <ShieldCheck
          size={17}
          className="text-[#C58A18]"
        />

        <p>
          Show this QR Code during Check-in
        </p>

      </div>

      {/* Gold Divider */}
      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default QRCodeCard;