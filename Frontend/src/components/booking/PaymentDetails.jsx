import React from "react";
import {
  CreditCard,
  BadgeCheck,
  Receipt,
  Percent,
  IndianRupee,
  RefreshCcw,
  Download,
  Headphones,
} from "lucide-react";

const PaymentDetails = ({ booking }) => {
  const payment = {
    method: booking?.paymentMethod || "Razorpay",
    status: booking?.paymentStatus || "Paid",
    transactionId:
      booking?.transactionId || "TXN987654321",
    gst: booking?.gst ?? 540,
    coupon: booking?.couponDiscount ?? 500,
    serviceCharge: booking?.serviceCharge ?? 150,
    totalAmount: booking?.total ?? 12190,
    refundStatus:
      booking?.refundStatus || "Not Applicable",
  };

  const isPaid =
    payment.status.toLowerCase() === "paid";

  const handleDownloadInvoice = () => {
    alert("Invoice download started.");
  };

  const handleDownloadReceipt = () => {
    alert("Receipt download started.");
  };

  const handleRefund = () => {
    if (payment.refundStatus !== "Not Applicable") {
      alert("Refund request submitted.");
    } else {
      alert("Refund is not applicable for this booking.");
    }
  };

  const handleSupport = () => {
    alert("Contact Support selected.");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">

        <div className="rounded-xl bg-blue-50 p-3">
          <CreditCard
            size={24}
            className="text-[#082B5C]"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#082B5C]">
            Payment Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Booking Payment Information
          </p>
        </div>

      </div>

      {/* Payment Information */}
      <div className="grid gap-5 md:grid-cols-2">

        {/* Payment Method */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18]">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <CreditCard
              size={18}
              className="text-[#082B5C]"
            />
            Payment Method
          </div>

          <p className="text-lg font-bold text-[#082B5C]">
            {payment.method}
          </p>

        </div>

        {/* Payment Status */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18]">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <BadgeCheck
              size={18}
              className={
                isPaid
                  ? "text-green-600"
                  : "text-[#C58A18]"
              }
            />
            Payment Status
          </div>

          <span
            className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${
              isPaid
                ? "bg-green-100 text-green-700"
                : "bg-[#FFF3CD] text-[#9A6700]"
            }`}
          >
            {payment.status}
          </span>

        </div>

        {/* Transaction ID */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18]">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Receipt
              size={18}
              className="text-[#C58A18]"
            />
            Transaction ID
          </div>

          <p className="break-all font-bold text-[#082B5C]">
            {payment.transactionId}
          </p>

        </div>

        {/* GST */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18]">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <IndianRupee
              size={18}
              className="text-[#082B5C]"
            />
            GST
          </div>

          <p className="font-bold text-[#082B5C]">
            ₹ {Number(payment.gst).toLocaleString("en-IN")}
          </p>

        </div>

        {/* Coupon */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18]">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Percent
              size={18}
              className="text-[#C58A18]"
            />
            Coupon Discount
          </div>

          <p className="font-bold text-green-600">
            - ₹{" "}
            {Number(payment.coupon).toLocaleString("en-IN")}
          </p>

        </div>

        {/* Service Charges */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 transition duration-300 hover:border-[#C58A18]">

          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Receipt
              size={18}
              className="text-[#082B5C]"
            />
            Service Charges
          </div>

          <p className="font-bold text-[#082B5C]">
            ₹{" "}
            {Number(payment.serviceCharge).toLocaleString(
              "en-IN"
            )}
          </p>

        </div>

      </div>

      {/* Total Payment */}
      <div className="mt-7 rounded-2xl border border-[#E3AE32]/30 bg-[#FFF8E7] p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Paid
            </p>

            <div className="mt-1 flex items-center gap-1">
              <IndianRupee
                size={25}
                className="text-[#C58A18]"
              />

              <p className="text-3xl font-bold text-[#082B5C]">
                {Number(
                  payment.totalAmount
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Refund */}
          <div className="text-left sm:text-right">

            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 sm:justify-end">
              <RefreshCcw size={17} />
              Refund Status
            </div>

            <span className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C]">
              {payment.refundStatus}
            </span>

          </div>

        </div>

      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">

        {/* Invoice */}
        <button
          type="button"
          onClick={handleDownloadInvoice}
          className="inline-flex items-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-md"
        >
          <Download size={16} />
          Download Invoice
        </button>

        {/* Receipt */}
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="inline-flex items-center gap-2 rounded-xl bg-[#C58A18] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#A96F0E] hover:shadow-md"
        >
          <Receipt size={16} />
          Download Receipt
        </button>

        {/* Refund */}
        <button
          type="button"
          onClick={handleRefund}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-[#082B5C] transition duration-300 hover:border-[#C58A18] hover:bg-[#FFF8E7]"
        >
          <RefreshCcw size={16} />
          Request Refund
        </button>

        {/* Support */}
        <button
          type="button"
          onClick={handleSupport}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-semibold text-[#082B5C] transition duration-300 hover:border-[#C58A18] hover:bg-blue-50"
        >
          <Headphones size={16} />
          Contact Support
        </button>

      </div>

      {/* Gold Divider */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default PaymentDetails;