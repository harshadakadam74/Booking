import React from 'react';
import {
  CreditCard,
  BadgeCheck,
  Receipt,
  Percent,
  Wallet,
  IndianRupee,
  RefreshCcw,
} from 'lucide-react';

const PaymentDetails = ({ booking }) => {
  const payment = {
    method: 'Razorpay',
    status: 'Paid',
    transactionId: 'TXN987654321',
    gst: 540,
    coupon: 500,
    serviceCharge: 150,
    totalAmount: booking?.total || 12190,
    refundStatus: 'Not Applicable',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Wallet size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
          <p className="text-sm text-gray-500">Booking Payment Information</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <CreditCard size={18} />
            Payment Method
          </div>
          <p className="text-lg font-semibold text-gray-900">{payment.method}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <BadgeCheck size={18} />
            Payment Status
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
            {payment.status}
          </span>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Receipt size={18} />
            Transaction ID
          </div>
          <p className="break-all font-semibold text-gray-900">{payment.transactionId}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <IndianRupee size={18} />
            GST
          </div>
          <p className="font-semibold text-gray-900">₹ {payment.gst}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Percent size={18} />
            Coupon Discount
          </div>
          <p className="font-semibold text-green-600">- ₹ {payment.coupon}</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-500">
            <Receipt size={18} />
            Service Charges
          </div>
          <p className="font-semibold text-gray-900">₹ {payment.serviceCharge}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-gray-500">Total Paid</h3>
            <p className="text-3xl font-bold text-blue-600">₹ {payment.totalAmount}</p>
          </div>

          <div className="text-left sm:text-right">
            <div className="mb-2 flex items-center gap-2 justify-start sm:justify-end text-gray-500">
              <RefreshCcw size={18} />
              Refund Status
            </div>
            <span className="rounded-full bg-gray-100 px-4 py-2 font-medium text-gray-700">
              {payment.refundStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <button className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">
          Download Invoice
        </button>

        <button className="rounded-xl bg-green-600 px-5 py-3 text-white transition hover:bg-green-700">
          Download Receipt
        </button>

        <button className="rounded-xl border border-gray-200 px-5 py-3 transition hover:bg-gray-100">
          Request Refund
        </button>

        <button className="rounded-xl border border-gray-200 px-5 py-3 transition hover:bg-gray-100">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default PaymentDetails;
