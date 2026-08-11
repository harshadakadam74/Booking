import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Plus,
  WalletCards,
} from "lucide-react";

const AccountPayments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/account")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:text-[#C58A18]"
        >
          <ArrowLeft size={17} />
          Back to Account
        </button>

        {/* Main Card */}
        <div className="overflow-hidden rounded-[2rem] border border-[#E3AE32]/20 bg-white shadow-xl">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#082B5C] via-[#0B3975] to-[#082B5C] px-6 py-8 text-white sm:px-8">
            
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E3AE32]/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#C58A18] p-4 shadow-lg">
                  <CreditCard size={28} className="text-white" />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#E3AE32]">
                    <WalletCards size={15} />
                    Account
                  </div>

                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Payment Methods
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Manage your payment methods and billing information.
                  </p>
                </div>
              </div>

              {/* Secure Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <ShieldCheck size={17} className="text-[#E3AE32]" />
                Secure Payments
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">

            {/* Security Info */}
            <div className="mb-6 rounded-2xl border border-[#E3AE32]/20 bg-[#FFF9EC] p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Lock size={21} className="text-[#C58A18]" />
                </div>

                <div>
                  <h2 className="font-semibold text-[#082B5C]">
                    Your payment information is protected
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    FastBooking uses secure payment processing to help
                    protect your billing information.
                  </p>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="rounded-[1.75rem] border border-dashed border-[#E3AE32]/40 bg-gradient-to-br from-[#F8FBFF] to-[#FFF9EC] px-6 py-14 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
                <CreditCard
                  size={38}
                  className="text-[#C58A18]"
                />
              </div>

              <h2 className="mt-6 text-xl font-bold text-[#082B5C]">
                No saved payment methods
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You don't have any saved cards or payment methods yet.
                Add one during your next booking for a faster checkout.
              </p>

              <button
                type="button"
                onClick={() => navigate("/payment")}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#082B5C] px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-lg"
              >
                <Plus size={18} />
                Add Payment Method
              </button>
            </div>

            {/* Payment Features */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <ShieldCheck
                  size={22}
                  className="text-[#082B5C]"
                />

                <h3 className="mt-3 font-semibold text-[#082B5C]">
                  Secure
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your payment details are handled securely.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E3AE32]/20 bg-[#FFF9EC] p-5">
                <CreditCard
                  size={22}
                  className="text-[#C58A18]"
                />

                <h3 className="mt-3 font-semibold text-[#082B5C]">
                  Easy Checkout
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Save a payment method for faster bookings.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <Lock
                  size={22}
                  className="text-[#082B5C]"
                />

                <h3 className="mt-3 font-semibold text-[#082B5C]">
                  Protected
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Payment information stays protected.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPayments;