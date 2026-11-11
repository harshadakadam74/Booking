import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  checkBookingEligibility,
  createBooking,
  createDummyPayment,
  createPaymentOrder,
  verifyPayment,
} from "../services/bookingService";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { property, searchParams } = location.state || {};
  const roomTypes = Array.isArray(property?.roomTypes) ? property.roomTypes : [];
  const initialRoomTypeId = String(property?.roomTypes?.[0]?._id || "");
  const [roomTypeId, setRoomTypeId] = useState(initialRoomTypeId);
  const selectedRoomType = roomTypes.find((roomType) => String(roomType._id) === roomTypeId);

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState("");
  const [detectedGuestLocation, setDetectedGuestLocation] = useState(null);
  const bookingIdempotencyKey = useRef(null);
  const pricePerNight = Number(
    eligibility?.pricing?.pricePerNight ??
      selectedRoomType?.price ??
      property?.price ??
      0
  );

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
    if (Number.isFinite(Number(eligibility?.pricing?.totalPrice))) {
      return Number(eligibility.pricing.totalPrice);
    }

    const nights = calculateNights();
    const rooms = Number(searchParams?.guests?.rooms || 1);
    return pricePerNight * nights * rooms;
  };

  useEffect(() => {
    setRoomTypeId(initialRoomTypeId);
  }, [initialRoomTypeId, property?._id, property?.id, property?.name]);

  useEffect(() => {
    let active = true;

    const validateEligibility = async () => {
      if (!property || !searchParams?.dates?.startDate || !searchParams?.dates?.endDate) {
        setEligibility({
          eligible: false,
          reasons: [{ code: "MISSING_BOOKING_DETAILS", message: "Hotel and stay dates are required." }],
        });
        setEligibilityLoading(false);
        return;
      }

      setEligibilityLoading(true);
      setEligibility(null);
      const propertyId = property._id || property.id;
      const request = {
        property: property.name,
        checkInDate: searchParams.dates.startDate,
        checkOutDate: searchParams.dates.endDate,
        numberOfGuests:
          Number(searchParams?.guests?.adults || 1) +
          Number(searchParams?.guests?.children || 0),
        numberOfRooms: Number(searchParams?.guests?.rooms || 1),
        ...(roomTypeId ? { roomTypeId } : {}),
      };
      if (typeof propertyId === "string" && /^[a-f\d]{24}$/i.test(propertyId)) {
        request.propertyId = propertyId;
      }

      try {
        const result = await checkBookingEligibility(request);
        if (active) {
          setEligibility(result || {
            eligible: false,
            reasons: [{ code: "VALIDATION_FAILED", message: "The server did not return booking eligibility." }],
          });
        }
      } catch (error) {
        if (active) {
          setEligibility({
            eligible: false,
            reasons: [{
              code: "VALIDATION_FAILED",
              message: error.response?.data?.message || error.message || "Unable to validate this booking.",
            }],
          });
        }
      } finally {
        if (active) setEligibilityLoading(false);
      }
    };

    validateEligibility();
    return () => {
      active = false;
    };
  }, [
    property,
    searchParams?.dates?.startDate,
    searchParams?.dates?.endDate,
    searchParams?.guests?.adults,
    searchParams?.guests?.children,
    searchParams?.guests?.rooms,
    roomTypeId,
  ]);

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = (address = billingAddress) => {
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

    // Billing validation
    if (!address.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!address.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required.";
    }

    if (!address.country.trim()) {
      newErrors.country = "Country is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const reverseGeocode = useCallback(async ({ latitude, longitude }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${latitude}&lon=${longitude}`
      );

      if (!response.ok) return {};

      const address = (await response.json()).address || {};
      const supportedCountries = ["IN", "US", "GB", "CA", "AU"];

      return {
        address: [address.house_number, address.road]
          .filter(Boolean)
          .join(" "),
        city: address.city || address.town || address.village || "",
        zipCode: address.postcode || "",
        country: supportedCountries.includes(address.country_code?.toUpperCase())
          ? address.country_code.toUpperCase()
          : "",
      };
    } catch {
      return {};
    }
  }, []);

  const getGuestLocation = useCallback(() => new Promise((resolve) => {
    if (!navigator.geolocation) {
      setLocationStatus("Location detection is not supported by this browser.");
      resolve(null);
      return;
    }

    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const coordinates = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          capturedAt: new Date().toISOString(),
        };
        const detectedAddress = await reverseGeocode(coordinates);
        setLocationStatus(
          Object.values(detectedAddress).some(Boolean)
            ? "Location and address detected."
            : "Location detected."
        );
        resolve({ coordinates, detectedAddress });
      },
      () => {
        setLocationStatus("Location permission was not granted. Continuing booking.");
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }), [reverseGeocode]);

  useEffect(() => {
    let isMounted = true;

    getGuestLocation().then((detectedLocation) => {
      if (!isMounted || !detectedLocation) return;

      setDetectedGuestLocation(detectedLocation);
      const detectedAddress = detectedLocation.detectedAddress || {};

      setBillingAddress((previous) => ({
        address: previous.address || detectedAddress.address || "",
        city: previous.city || detectedAddress.city || "",
        zipCode: previous.zipCode || detectedAddress.zipCode || "",
        country: previous.country || detectedAddress.country || "",
      }));
    });

    return () => {
      isMounted = false;
    };
  }, [getGuestLocation]);

  // =========================================================
  // SUBMIT BOOKING
  // =========================================================

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (eligibilityLoading || eligibility?.eligible !== true) {
      setBookingError(
        eligibility?.reasons?.map((reason) => reason.message).join(" ") ||
          "Wait for the server to confirm this hotel is bookable."
      );
      return;
    }

    if (!property) {
      setBookingError(
        "Booking information is missing. Please select a hotel again."
      );
      return;
    }

    setIsProcessing(true);
    setBookingError("");

    try {
      const detectedLocation =
        detectedGuestLocation || await getGuestLocation();
      const detectedAddress = detectedLocation?.detectedAddress || {};
      const nextBillingAddress = {
        address: billingAddress.address || detectedAddress.address || "",
        city: billingAddress.city || detectedAddress.city || "",
        zipCode: billingAddress.zipCode || detectedAddress.zipCode || "",
        country: billingAddress.country || detectedAddress.country || "",
      };

      setBillingAddress(nextBillingAddress);

      if (!validateForm(nextBillingAddress)) {
        setIsProcessing(false);
        return;
      }

      const bookingPayload = {
        property: property.name,

        checkInDate: searchParams.dates.startDate,

        checkOutDate: searchParams.dates.endDate,

        numberOfGuests:
          Number(searchParams?.guests?.adults || 1) +
          Number(searchParams?.guests?.children || 0),

        numberOfRooms:
          Number(searchParams?.guests?.rooms || 1),

        specialRequests: "",

        guestName: user?.name || "",

        guestEmail: user?.email || "",

        guestPhone:
          user?.mobile ||
          user?.phone ||
          "",

        guestLocation: detectedLocation?.coordinates || null,
      };

      const propertyId = property._id || property.id;
      if (typeof propertyId === "string" && /^[a-f\d]{24}$/i.test(propertyId)) {
        bookingPayload.propertyId = propertyId;
      }
      if (roomTypeId) bookingPayload.roomTypeId = roomTypeId;

      bookingIdempotencyKey.current ||= window.crypto.randomUUID();
      const response = await createBooking(bookingPayload, bookingIdempotencyKey.current);

      const booking = response?.booking || response || null;
      const bookingId = booking?._id || booking?.id;
      if (!bookingId) throw new Error("Booking ID was not returned by the server");

      if (paymentMethod === "dummy") {
        const dummyResult = await createDummyPayment(bookingId);
        navigate("/payment-success", {
          replace: true,
          state: {
            property,
            searchParams,
            total: calculateTotal(),
            booking: dummyResult?.booking || booking,
            paymentMethod: "DUMMY",
          },
        });
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay Checkout failed to load");

      const { order, key } = await createPaymentOrder(bookingId);
      const confirmedBooking = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key,
          amount: order.amount,
          currency: order.currency,
          name: "FastBooking",
          description: `Hotel booking - ${property.name}`,
          order_id: order.id,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.mobile || user?.phone || "",
          },
          theme: { color: "#0B5ED7" },
          handler: async (paymentResponse) => {
            try {
              const verificationResult = await verifyPayment(bookingId, paymentResponse);
              resolve(verificationResult?.booking);
            } catch (error) {
              reject(new Error(error?.message || "Payment verification failed"));
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled")) },
        });
        razorpay.on("payment.failed", () => reject(new Error("Payment failed")));
        razorpay.open();
      });

      navigate("/payment-success", {
        replace: true,
        state: {
          property,
          searchParams,
          total: calculateTotal(),
          booking: confirmedBooking || booking,
          paymentMethod: "RAZORPAY",
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

        <div className="mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-blue-950 via-blue-900 to-indigo-900 p-6 text-white shadow-xl sm:p-8">
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
                    Continue to Razorpay Checkout to enter payment details securely.
                  </p>
                </div>

                {/* PAYMENT METHOD */}

                {roomTypes.length > 0 && (
                  <label className="mb-8 block text-sm font-semibold text-slate-700">
                    Room type
                    <select
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                      value={roomTypeId}
                      onChange={(event) => {
                        setRoomTypeId(event.target.value);
                        setBookingError("");
                      }}
                      required
                    >
                      <option value="">Select a room type</option>
                      {roomTypes.map((roomType) => (
                        <option key={roomType._id} value={roomType._id}>
                          {roomType.name} — ₹{Number(roomType.price ?? property.price).toLocaleString("en-IN")} / night
                        </option>
                      ))}
                    </select>
                    {selectedRoomType && (
                      <span className="mt-1 block text-xs font-normal text-slate-500">
                        Room inventory will be checked for your selected dates.
                      </span>
                    )}
                  </label>
                )}

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
                          Razorpay Checkout
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          UPI, cards and net banking
                        </p>
                      </div>

                      {paymentMethod === "card" && (
                        <CheckCircle
                          size={19}
                          className="ml-auto shrink-0 text-blue-700"
                        />
                      )}
                    </button>

                    {/* DUMMY PAYMENT */}

                    <button
                      type="button"
                      disabled={!import.meta.env.DEV}
                      onClick={() => {
                        setPaymentMethod("dummy");
                        setBookingError("");
                      }}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${
                        paymentMethod === "dummy"
                          ? "border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-yellow-200"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
                        P
                      </div>

                      <div>
                        <p className="font-semibold">
                          Dummy payment
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Development testing only
                        </p>
                      </div>

                      {paymentMethod === "dummy" && (
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

                    <div className="mb-8 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                      <Shield size={20} className="mt-0.5 shrink-0" />
                      <p>
                        Payment details are collected only in Razorpay Checkout. FastBooking
                        does not request or store card numbers or security codes.
                      </p>
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

                    {eligibilityLoading && (
                      <p className="mb-5 text-sm text-slate-600">Checking hotel availability…</p>
                    )}
                    {!eligibilityLoading && eligibility?.eligible !== true && (
                      <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                        {eligibility?.reasons?.map((reason) => reason.message).join(" ") ||
                          "The server could not confirm this hotel is bookable."}
                      </div>
                    )}

                    {locationStatus && (
                      <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
                        <MapPin size={16} />
                        {locationStatus}
                      </div>
                    )}

                    {/* PAY BUTTON */}

                    <button
                      type="submit"
                      disabled={isProcessing || eligibilityLoading || eligibility?.eligible !== true}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-700 to-blue-800 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-indigo-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock size={19} />
                          Pay ₹{total.toLocaleString("en-IN")}
                        </>
                      )}
                    </button>

                  </form>
                ) : (

                  /* ==================================================
                     DUMMY PAYMENT
                  ================================================== */

                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-2xl font-bold text-white shadow-lg">
                      P
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      Complete payment
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      This test payment confirms the booking without charging money.
                    </p>

                    {(bookingError || errors.booking) && (
                      <div className="mx-auto mt-5 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {bookingError || errors.booking}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isProcessing || eligibilityLoading || eligibility?.eligible !== true}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete dummy payment
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

                    {selectedRoomType && (
                      <div className="flex gap-3">
                        <Building2
                          size={18}
                          className="mt-0.5 shrink-0 text-blue-700"
                        />
                        <div>
                          <p className="text-xs text-slate-400">Room type</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-700">
                            {selectedRoomType.name}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* PRICE */}

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {property.currency || "INR"} {pricePerNight.toLocaleString("en-IN")} × {nights} nights × {rooms} rooms
                    </span>

                    <span className="font-semibold text-slate-800">
                      {property.currency || "INR"} {calculateTotal().toLocaleString("en-IN")}
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
                      ₹{total.toLocaleString("en-IN")}
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