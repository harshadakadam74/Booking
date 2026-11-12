import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CreditCard } from "lucide-react";

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const bookingId = params.get("bookingId");
  const message = location.state?.message || "The payment was not completed. Your booking has not been confirmed.";

  const retryPayment = () => {
    params.delete("reason");
    navigate(`/payment?${params.toString()}`);
  };

  return (
    <main className="min-h-[65vh] bg-slate-50 px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={32} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-[#082B5C]">Payment not completed</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <p className="mt-2 text-xs text-slate-500">The booking remains unconfirmed until the payment gateway verifies successful payment.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {bookingId && (
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
