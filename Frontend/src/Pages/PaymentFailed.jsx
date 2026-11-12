import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CreditCard } from "lucide-react";
import { verifyCapturedPaymentIntent } from "../services/bookingService";

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const bookingId = params.get("bookingId");
  const paymentIntentId = params.get("paymentIntentId");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [statusError, setStatusError] = useState("");
  const message = location.state?.message || "The payment was not confirmed. Check its status or retry checkout.";

  const retryPayment = () => {
    params.delete("reason");
    navigate(`/payment?${params.toString()}`);
  };

  const checkPaymentStatus = async () => {
    if (!paymentIntentId || checkingPayment) return;
    setCheckingPayment(true);
    setStatusError("");
    try {
      const result = await verifyCapturedPaymentIntent(paymentIntentId);
      const booking = result?.booking;
      if (booking?.bookingStatus !== "CONFIRMED" || booking?.paymentStatus !== "SUCCESS") {
        throw new Error("The backend has not confirmed a successful payment yet.");
      }
      navigate(`/payment/success?bookingId=${encodeURIComponent(booking._id)}`, {
        replace: true,
        state: { booking },
      });
    } catch (error) {
      setStatusError(error.message || "Unable to check payment status right now.");
    } finally {
      setCheckingPayment(false);
    }
  };

  return (
    <main className="min-h-[65vh] bg-slate-50 px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={32} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-[#082B5C]">Payment not completed</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-2 text-xs text-slate-500">A new booking is created only after the backend verifies successful payment.</p>
        {statusError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{statusError}</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {paymentIntentId && (
            <button type="button" onClick={checkPaymentStatus} disabled={checkingPayment} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#082B5C] px-5 py-3 font-semibold text-[#082B5C] disabled:opacity-60">
              {checkingPayment ? "Checking payment…" : "Check payment status"}
            </button>
          )}
          {(bookingId || paymentIntentId) && (
            <button type="button" onClick={retryPayment} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B5C] px-5 py-3 font-bold text-white hover:bg-[#123f77]">
              <CreditCard size={17} /> Retry payment
            </button>
          )}
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
            <ArrowLeft size={17} /> Return to checkout
          </button>
          <Link to="/account/bookings" className="rounded-xl border border-[#082B5C] px-5 py-3 font-semibold text-[#082B5C]">My bookings</Link>
        </div>
      </section>
    </main>
  );
};

export default PaymentFailed;
