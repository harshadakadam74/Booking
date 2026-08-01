import React from 'react';
import QRCode from 'react-qr-code';

const QRCodeCard = ({ bookingId }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-gray-900">Booking QR Code</h2>

      <div className="flex justify-center">
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <QRCode value={String(bookingId || 'BK11560186')} size={180} />
        </div>
      </div>

      <p className="mt-4 text-center text-gray-500">Show this QR Code during Check-in</p>
    </div>
  );
};

export default QRCodeCard;
