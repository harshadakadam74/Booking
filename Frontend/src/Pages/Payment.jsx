import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Lock,
  Shield,
  ArrowLeft,
  Star,
  CheckCircle,
  MapPin,
  CalendarDays,
  Users,
  Building2,
  Sparkles,
} from "lucide-react";
import { createBooking } from "../services/bookingService";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { property, searchParams } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  // =========================================================
  // CALCULATE NIGHTS
  // =========================================================

  const calculateNights = () => {
    if (
      !searchParams?.dates?.startDate ||
      !searchParams?.dates?.endDate
    ) {
      return 0;
    }

    const start = new Date(searchParams.dates.startDate);
    const end = new Date(searchParams.dates.endDate);

    const difference = end - start;

    const nights = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return nights > 0 ? nights : 0;
  };

  // =========================================================
  // CALCULATE TOTAL
  // =========================================================

  const calculateTotal = () => {
    if (!property) return 0;

    const nights = calculateNights();
    const rooms = Number(searchParams?.guests?.rooms || 1);
    const price = Number(property.price || 0);

    return price * nights * rooms;
  };

  // =========================================================
  // CARD NUMBER FORMAT
  // =========================================================

  const formatCardNumber = (value) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 16);

    const parts = [];

    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }

    return parts.join(" ");
  };

  // =========================================================
  // EXPIRY FORMAT
  // =========================================================

  const formatExpiry = (value) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (digits.length >= 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    }

    return digits;
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    if (!searchParams?.dates?.startDate) {
      newErrors.booking = "Check-in date is missing.";
    }

    if (!searchParams?.dates?.endDate) {
      newErrors.booking = "Check-out date is missing.";
    }

    if (calculateNights() <= 0) {
      newErrors.booking = "Please select valid booking dates.";
    }

    // Card validation
    if (paymentMethod === "card") {
      if (!cardDetails.name.trim()) {
        newErrors.name = "Cardholder name is required.";
      }

      const cardNumber = cardDetails.number.replace(/\s/g, "");

      if (!cardNumber) {
        newErrors.number = "Card number is required.";
      } else if (cardNumber.length !== 16) {
        newErrors.number =
          "Enter a valid 16-digit card number.";
      }

      if (!cardDetails.expiry.trim()) {
        newErrors.expiry = "Expiry date is required.";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.expiry = "Enter expiry as MM/YY.";
      }

      if (!cardDetails.cvv.trim()) {
        newErrors.cvv = "CVV is required.";
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        newErrors.cvv = "Enter a valid CVV.";
      }
    }

    // Billing validation
    if (!billingAddress.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!billingAddress.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!billingAddress.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required.";
    }

    if (!billingAddress.country.trim()) {
      newErrors.country = "Country is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!property) {
      setBookingError(
        "Booking information is missing. Please select a hotel again."
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setBookingError("");

    try {
      const bookingPayload = {
        property: property.name,

        checkInDate: searchParams.dates.startDate,

        checkOutDate: searchParams.dates.endDate,

        numberOfGuests:
          Number(searchParams?.guests?.adults || 1) +
          Number(searchParams?.guests?.children || 0),

        numberOfRooms:
          Number(searchParams?.guests?.rooms || 1),

        pricePerNight: Number(property.price || 0),

        totalPrice: calculateTotal(),

        paymentMethod,

        specialRequests: "",

        guestName: user?.name || "",

        guestEmail: user?.email || "",

        guestPhone:
          user?.mobile ||
          user?.phone ||
          "",
      };

      const response = await createBooking(bookingPayload);

      const booking = response?.booking || response || null;

      navigate("/payment-success", {
        replace: true,
        state: {
          property,
          searchParams,
          total: calculateTotal(),
          booking,
          paymentMethod,
        },
      });
    } catch (error) {
      console.error("Booking creation error:", error);

      setBookingError(
        error?.response?.data?.message ||
          error?.message ||
          "Booking creation failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================================================
  // INPUT STYLE
  // =========================================================

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    }`;

  // =========================================================
  // NO BOOKING DATA
  // =========================================================

  if (!property || !searchParams) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <CreditCard
                size={30}
                className="text-blue-700"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              No Booking Information Found
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please select a property and booking dates
              before continuing to payment.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
            >
              <ArrowLeft size={17} />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const total = calculateTotal();

  const adults = Number(
    searchParams?.guests?.adults || 1
  );

  const children = Number(
    searchParams?.guests?.children || 0
  );

  const rooms = Number(
    searchParams?.guests?.rooms || 1
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex items-center gap-2 text-sm text-blue-100 transition hover:text-white"
              >
                <ArrowLeft size={17} />
                Back to Booking
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <CreditCard size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Secure Payment
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Complete your reservation securely
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur md:flex">
              <Shield
                size={22}
                className="text-yellow-400"
              />

              <div>
                <p className="text-xs uppercase tracking-wider text-blue-100">
                  Secure Checkout
                </p>

                <p className="mt-1 text-sm font-semibold">
                  SSL Protected
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ==================================================
            MAIN
        ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

          <div className="grid lg:grid-cols-3">

            {/* ==================================================
                PAYMENT SECTION
            ================================================== */}

            <div className="border-b border-slate-100 lg:col-span-2 lg:border-b-0 lg:border-r">

              <div className="p-6 sm:p-8 lg:p-10">

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Payment Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter your payment and billing information.
                  </p>
                </div>

                {/* PAYMENT METHOD */}

                <div className="mb-8">

                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {/* CARD */}

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("card");
                        setBookingError("");
                      }}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                        paymentMethod === "card"
                          ? "border-blue-700 bg-blue-50 text-blue-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          paymentMethod === "card"
                            ? "bg-blue-700 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <CreditCard size={21} />
                      </div>

                      <div>
                        <p className="font-semibold">
                          Credit / Debit Card
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Visa, Mastercard, RuPay
                        </p>
                      </div>

                      {paymentMethod === "card" && (
                        <CheckCircle
                          size={19}
                          className="ml-auto shrink-0 text-blue-700"
                        />
                      )}
                    </button>

                    {/* PAYPAL */}

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("paypal");
                        setBookingError("");
                      }}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                        paymentMethod === "paypal"
                          ? "border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-yellow-200"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
                        P
                      </div>

                      <div>
                        <p className="font-semibold">
                          PayPal
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Fast & secure payment
                        </p>
                      </div>

                      {paymentMethod === "paypal" && (
                        <CheckCircle
                          size={19}
                          className="ml-auto shrink-0 text-yellow-600"
                        />
                      )}
                    </button>

                  </div>
                </div>

                {/* ==================================================
                    CARD FORM
                ================================================== */}

                {paymentMethod === "card" ? (
                  <form onSubmit={handleSubmit}>

                    {/* CARD INFORMATION */}

                    <div className="mb-8">

                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                          <CreditCard
                            size={18}
                            className="text-blue-700"
                          />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Card Information
                          </h3>

                          <p className="text-xs text-slate-500">
                            Your card details are encrypted
                          </p>
                        </div>
                      </div>

                      <div className="space-y-5">

                        {/* CARDHOLDER */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Cardholder Name
                          </label>

                          <input
                            type="text"
                            autoComplete="cc-name"
                            placeholder="John Doe"
                            className={inputClass("name")}
                            value={cardDetails.name}
                            onChange={(e) =>
                              setCardDetails((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />

                          {errors.name && (
                            <p className="mt-1 text-sm font-medium text-red-500">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        {/* CARD NUMBER */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Card Number
                          </label>

                          <div className="relative">
                            <CreditCard
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              placeholder="1234 5678 9012 3456"
                              className={`${inputClass(
                                "number"
                              )} pl-11`}
                              value={cardDetails.number}
                              onChange={(e) =>
                                setCardDetails((prev) => ({
                                  ...prev,
                                  number:
                                    formatCardNumber(
                                      e.target.value
                                    ),
                                }))
                              }
                              maxLength={19}
                            />
                          </div>

                          {errors.number && (
                            <p className="mt-1 text-sm font-medium text-red-500">
                              {errors.number}
                            </p>
                          )}
                        </div>

                        {/* EXPIRY + CVV */}

                        <div className="grid gap-5 sm:grid-cols-2">

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              Expiry Date
                            </label>

                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              placeholder="MM/YY"
                              className={inputClass(
                                "expiry"
                              )}
                              value={cardDetails.expiry}
                              onChange={(e) =>
                                setCardDetails((prev) => ({
                                  ...prev,
                                  expiry:
                                    formatExpiry(
                                      e.target.value
                                    ),
                                }))
                              }
                              maxLength={5}
                            />

                            {errors.expiry && (
                              <p className="mt-1 text-sm font-medium text-red-500">
                                {errors.expiry}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              CVV
                            </label>

                            <input
                              type="password"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder="•••"
                              className={inputClass("cvv")}
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                setCardDetails((prev) => ({
                                  ...prev,
                                  cvv: e.target.value
                                    .replace(
                                      /\D/g,
                                      ""
                                    )
                                    .slice(0, 4),
                                }))
                              }
                              maxLength={4}
                            />

                            {errors.cvv && (
                              <p className="mt-1 text-sm font-medium text-red-500">
                                {errors.cvv}
                              </p>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* BILLING ADDRESS */}

                    <div className="mb-8 border-t border-slate-100 pt-8">

                      <div className="mb-5">
                        <h3 className="font-bold text-slate-900">
                          Billing Address
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Enter the address associated with your payment method.
                        </p>
                      </div>

                      <div className="space-y-5">

                        {/* ADDRESS */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Address
                          </label>

                          <input
                            type="text"
                            autoComplete="street-address"
                            placeholder="123 Main Street"
                            className={inputClass(
                              "address"
                            )}
                            value={billingAddress.address}
                            onChange={(e) =>
                              setBillingAddress((prev) => ({
                                ...prev,
                                address:
                                  e.target.value,
                              }))
                            }
                          />

                          {errors.address && (
                            <p className="mt-1 text-sm font-medium text-red-500">
                              {errors.address}
                            </p>
                          )}
                        </div>

                        {/* CITY + ZIP */}

                        <div className="grid gap-5 sm:grid-cols-2">

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              City
                            </label>

                            <input
                              type="text"
                              autoComplete="address-level2"
                              placeholder="Mumbai"
                              className={inputClass(
                                "city"
                              )}
                              value={billingAddress.city}
                              onChange={(e) =>
                                setBillingAddress(
                                  (prev) => ({
                                    ...prev,
                                    city: e.target.value,
                                  })
                                )
                              }
                            />

                            {errors.city && (
                              <p className="mt-1 text-sm font-medium text-red-500">
                                {errors.city}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              ZIP / PIN Code
                            </label>

                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="postal-code"
                              placeholder="411001"
                              className={inputClass(
                                "zipCode"
                              )}
                              value={
                                billingAddress.zipCode
                              }
                              onChange={(e) =>
                                setBillingAddress(
                                  (prev) => ({
                                    ...prev,
                                    zipCode:
                                      e.target.value
                                        .replace(
                                          /\D/g,
                                          ""
                                        )
                                        .slice(0, 10),
                                  })
                                )
                              }
                            />

                            {errors.zipCode && (
                              <p className="mt-1 text-sm font-medium text-red-500">
                                {errors.zipCode}
                              </p>
                            )}
                          </div>

                        </div>

                        {/* COUNTRY */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Country
                          </label>

                          <select
                            className={inputClass(
                              "country"
                            )}
                            value={billingAddress.country}
                            onChange={(e) =>
                              setBillingAddress(
                                (prev) => ({
                                  ...prev,
                                  country:
                                    e.target.value,
                                })
                              )
                            }
                          >
                            <option value="">
                              Select Country
                            </option>

                            <option value="IN">
                              India
                            </option>

                            <option value="US">
                              United States
                            </option>

                            <option value="UK">
                              United Kingdom
                            </option>

                            <option value="CA">
                              Canada
                            </option>

                            <option value="AU">
                              Australia
                            </option>
                          </select>

                          {errors.country && (
                            <p className="mt-1 text-sm font-medium text-red-500">
                              {errors.country}
                            </p>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* FORM ERROR */}

                    {(bookingError || errors.booking) && (
                      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {bookingError || errors.booking}
                      </div>
                    )}

                    {/* PAY BUTTON */}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock size={19} />
                          Pay ${total.toLocaleString()}
                        </>
                      )}
                    </button>

                  </form>
                ) : (

                  /* ==================================================
                     PAYPAL
                  ================================================== */

                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-bold text-white shadow-lg">
                      P
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      Continue with PayPal
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      You will be redirected to PayPal to
                      securely complete your payment.
                    </p>

                    {(bookingError || errors.booking) && (
                      <div className="mx-auto mt-5 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {bookingError || errors.booking}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue with PayPal
                          <ArrowLeft
                            size={17}
                            className="rotate-180"
                          />
                        </>
                      )}
                    </button>

                  </div>
                )}

              </div>
            </div>

            {/* ==================================================
                BOOKING SUMMARY
            ================================================== */}

            <div className="bg-slate-50">

              <div className="p-6 sm:p-8 lg:sticky lg:top-6">

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Booking Summary
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review your reservation
                  </p>
                </div>

                {/* PROPERTY */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="h-52 w-full object-cover"
                    />

                    <div className="absolute left-3 top-3 rounded-full bg-blue-950/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                      FastBooking
                    </div>
                  </div>

                  <div className="p-5">

                    <h3 className="font-bold text-slate-900">
                      {property.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin
                        size={15}
                        className="text-blue-700"
                      />

                      {property.location}
                    </div>

                    <div className="mt-3 flex items-center gap-1">
                      <Star
                        size={16}
                        className="fill-yellow-500 text-yellow-500"
                      />

                      <span className="text-sm font-bold text-slate-700">
                        {property.rating || "4.5"}
                      </span>

                      <span className="text-xs text-slate-400">
                        Excellent stay
                      </span>
                    </div>

                  </div>
                </div>

                {/* STAY DETAILS */}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

                  <h3 className="mb-4 font-bold text-slate-900">
                    Stay Details
                  </h3>

                  <div className="space-y-4">

                    {/* DATES */}

                    <div className="flex gap-3">
                      <CalendarDays
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-700"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Dates
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-700">
                          {new Date(
                            searchParams.dates.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            searchParams.dates.endDate
                          ).toLocaleDateString()}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {nights} night
                          {nights !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* GUESTS */}

                    <div className="flex gap-3">
                      <Users
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-700"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Guests
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-700">
                          {adults} adult
                          {adults !== 1 ? "s" : ""},{" "}
                          {children} child
                          {children !== 1 ? "ren" : ""}
                        </p>
                      </div>
                    </div>

                    {/* ROOMS */}

                    <div className="flex gap-3">
                      <Building2
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-700"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Rooms
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-slate-700">
                          {rooms} room
                          {rooms !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* PRICE */}

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      ${property.price} × {nights} nights
                    </span>

                    <span className="font-semibold text-slate-800">
                      ${(Number(property.price || 0) * nights).toLocaleString()}
                    </span>
                  </div>

                  {rooms > 1 && (
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Rooms
                      </span>

                      <span>
                        × {rooms}
                      </span>
                    </div>
                  )}

                  <div className="my-4 border-t border-blue-100" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-extrabold text-blue-800">
                      ${total.toLocaleString()}
                    </span>
                  </div>

                </div>

                {/* SECURITY */}

                <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-white">
                      <Shield size={20} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Secure Payment
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Your information is encrypted
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-5 flex items-center justify-center gap-2 px-4 text-center text-xs text-slate-400">
          <Sparkles
            size={14}
            className="text-yellow-500"
          />

          <span>
            Your payment is securely handled by FastBooking.
          </span>

          <Lock
            size={13}
            className="text-blue-600"
          />
        </div>

      </div>
    </div>
  );
};

export default Payment;