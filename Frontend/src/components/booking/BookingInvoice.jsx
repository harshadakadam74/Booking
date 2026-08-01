import React from 'react';
import { Download } from 'lucide-react';

const BookingInvoice = ({ booking }) => {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Invoice</h3>
      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Invoice ID</p>
        <p className="font-semibold text-gray-900">INV-{booking?.id || 'BK0001'}</p>
      </div>
      <button className="mt-4 inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">
        <Download size={16} />
        Download Invoice
      </button>
    </div>
  );
};

export default BookingInvoice;
