import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HotelCardImage from "../components/HotelCardImage";
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
  createPaymentOrder,
  getBookingById,
  verifyPayment,
  verifyLegacyBookingPayment,
} from "../services/bookingService";
import { getHotelById } from "../services/destinationService";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state || {};
  const routeProperty = routeState.property;
  const urlParams = new URLSearchParams(location.search);
  const propertyId = urlParams.get("hotelId") || routeProperty?._id || "";
  const searchParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      location: routeState.searchParams?.location || "",
      dates: {
        startDate: parseDate(params.get("checkIn") || routeState.searchParams?.dates?.startDate),
        endDate: parseDate(params.get("checkOut") || routeState.searchParams?.dates?.endDate),
        key: "selection",
      },
      guests: {
        adults: Number(params.get("adults") ?? routeState.searchParams?.guests?.adults ?? 1),
        children: Number(params.get("children") ?? routeState.searchParams?.guests?.children ?? 0),
        rooms: Number(params.get("rooms") ?? routeState.searchParams?.guests?.rooms ?? 1),
      },
    };
  }, [location.search, routeState.searchParams]);
  const isValidPropertyId = /^[a-f\d]{24}$/i.test(propertyId);
  const [property, setProperty] = useState(null);
  const [hotelLoading, setHotelLoading] = useState(isValidPropertyId);
  const [hotelLookupError, setHotelLookupError] = useState(null);
  const [hotelRetryCount, setHotelRetryCount] = useState(0);
  const roomTypes = Array.isArray(property?.roomTypes) ? property.roomTypes : [];
  const [roomTypeId, setRoomTypeId] = useState(urlParams.get("roomTypeId") || "");
  const selectedRoomType = roomTypes.find((roomType) => String(roomType._id) === roomTypeId);

  const [billingAddress, setBillingAddress] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [eligibilityError, setEligibilityError] = useState("");
  const [eligibilityRetryCount, setEligibilityRetryCount] = useState(0);
  const [locationStatus, setLocationStatus] = useState("");
  const [detectedGuestLocation, setDetectedGuestLocation] = useState(null);
  const bookingIdempotencyKey = useRef(null);
  const paymentIdempotencyStorageKey = [
    "fastBookingPayment",
    propertyId,
    searchParams.dates.startDate?.toISOString().slice(0, 10) || "",
    searchParams.dates.endDate?.toISOString().slice(0, 10) || "",
    searchParams.guests.adults + searchParams.guests.children,
    searchParams.guests.rooms,
    roomTypeId,
  ].join(":");
  const getPaymentIdempotencyKey = () => {
    if (bookingIdempotencyKey.current) return bookingIdempotencyKey.current;
    try {
      bookingIdempotencyKey.current = sessionStorage.getItem(paymentIdempotencyStorageKey);
    } catch (storageError) {
      console.error("Unable to read the payment retry key:", storageError);
    }
    bookingIdempotencyKey.current ||= window.crypto.randomUUID();
    try {
      sessionStorage.setItem(paymentIdempotencyStorageKey, bookingIdempotencyKey.current);
    } catch (storageError) {
      console.error("Unable to save the payment retry key:", storageError);
    }
    return bookingIdempotencyKey.current;
  };
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
    let active = true;

    const loadHotel = async () => {
      if (!isValidPropertyId) {
        setProperty(null);
        setHotelLookupError({
          status: 400,
          message: propertyId
            ? "The hotel ID in this checkout link is invalid."
            : "Hotel details are missing. Please select a hotel again.",
        });
        setHotelLoading(false);
        return;
      }

      setHotelLoading(true);
      setHotelLookupError(null);
      setProperty(null);
      try {
        const hotel = await getHotelById(propertyId);
        if (!hotel || String(hotel._id) !== propertyId) {
          throw new Error("The hotel lookup returned an inconsistent hotel ID.");
        }
        if (active) setProperty(hotel);
      } catch (error) {
        if (active) {
          setHotelLookupError({
            status: error.response?.status,
            message: error.response?.data?.message || error.message || "Unable to load hotel details.",
          });
        }
      } finally {
        if (active) setHotelLoading(false);
      }
    };

    loadHotel();
    return () => {
      active = false;
    };
  }, [isValidPropertyId, propertyId, hotelRetryCount]);

  useEffect(() => {
    if (!property) return;
    const requestedRoomTypeId = new URLSearchParams(location.search).get("roomTypeId");
    setRoomTypeId((current) => {
      if (requestedRoomTypeId) return requestedRoomTypeId;
      if (current && property.roomTypes?.some((roomType) => String(roomType._id) === current)) {
        return current;
      }
      return String(property.roomTypes?.[0]?._id || "");
    });
  }, [property, location.search]);

  useEffect(() => {
    let active = true;

    const validateEligibility = async () => {
      if (hotelLoading || !property || !isValidPropertyId ||
        !searchParams.dates.startDate || !searchParams.dates.endDate) {
        setEligibility({
          eligible: false,
          reasons: [{
            code: "MISSING_BOOKING_DETAILS",
            message: "A hotel and valid stay dates are required.",
          }],
        });
        setEligibilityError("");
        setEligibilityLoading(false);
        return;
      }

      setEligibilityLoading(true);
      setEligibility(null);
      setEligibilityError("");
      const request = {
        propertyId,
        checkInDate: searchParams.dates.startDate,
        checkOutDate: searchParams.dates.endDate,
        numberOfGuests:
          searchParams.guests.adults + searchParams.guests.children,
        numberOfRooms: searchParams.guests.rooms,
        ...(new URLSearchParams(location.search).get("bookingId")
          ? { bookingId: new URLSearchParams(location.search).get("bookingId") }
          : {}),
        ...(new URLSearchParams(location.search).get("paymentIntentId")
          ? { paymentIntentId: new URLSearchParams(location.search).get("paymentIntentId") }
          : {}),
        ...(roomTypeId ? { roomTypeId } : {}),
      };

      try {
        const result = await checkBookingEligibility(request);
        if (active) {
          setEligibility(result || {
            eligible: false,
            reasons: [{ code: "VALIDATION_FAILED", message: "The server did not return booking eligibility." }],
          });
          setEligibilityError("");
        }
      } catch (error) {
        if (active) {
          setEligibility(null);
          setEligibilityError(
            error.response?.status === 404
              ? "This hotel or room is no longer available."
              : error.response?.data?.message || error.message || "Unable to verify availability right now."
          );
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
    propertyId,
    isValidPropertyId,
    hotelLoading,
    searchParams.dates.startDate,
    searchParams.dates.endDate,
    searchParams.guests.adults,
    searchParams.guests.children,
    searchParams.guests.rooms,
    roomTypeId,
    eligibilityRetryCount,
  ]);

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = (address = billingAddress) => {
    const newErrors = {};

    if (!searchParams.dates.startDate) {
      newErrors.booking = "Check-in date is missing.";
    }

    if (!searchParams.dates.endDate) {
      newErrors.booking = "Check-out date is missing.";
    }

    if (calculateNights() <= 0) {
      newErrors.booking = "Please select valid booking dates.";
    }

    // Billing validation
    if (address.address.trim().length < 5 || address.address.trim().length > 200) {
      newErrors.address = "Enter an address between 5 and 200 characters.";
    }

    if (address.city.trim().length < 2 || address.city.trim().length > 100) {
      newErrors.city = "Enter a city between 2 and 100 characters.";
    }

    if (address.state.trim().length < 2 || address.state.trim().length > 100) {
      newErrors.state = "Enter a state or region between 2 and 100 characters.";
    }

    const validPostalCode = address.country === "IN"
      ? /^[1-9]\d{5}$/.test(address.zipCode.trim())
      : /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(address.zipCode.trim());
    if (!validPostalCode) {
      newErrors.zipCode = address.country === "IN"
        ? "Enter a valid 6-digit Indian PIN code."
        : "Enter a valid postal code.";
    }

    if (!/^[A-Z]{2}$/.test(address.country)) {
      newErrors.country = "Select a valid country.";
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
        state: address.state || address.region || address.province || "",
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
        state: previous.state || detectedAddress.state || "",
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

    if (eligibilityLoading || eligibilityError || eligibility?.eligible !== true) {
      setBookingError(
        eligibilityError ||
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

    let pendingBookingId = new URLSearchParams(location.search).get("bookingId") || "";
    let paymentIntentId = new URLSearchParams(location.search).get("paymentIntentId") || "";
    let bookingId = pendingBookingId;
    let reservationPayload;
    try {
      let booking;
      if (pendingBookingId) {
        const response = await getBookingById(pendingBookingId);
        booking = response?.booking;
        const bookingMatchesCheckout = booking?.bookingStatus === "PENDING" &&
          booking?.paymentStatus !== "SUCCESS" &&
          String(booking.propertyId) === propertyId &&
          new Date(booking.checkInDate).toISOString().slice(0, 10) ===
            new Date(searchParams.dates.startDate).toISOString().slice(0, 10) &&
          new Date(booking.checkOutDate).toISOString().slice(0, 10) ===
            new Date(searchParams.dates.endDate).toISOString().slice(0, 10) &&
          Number(booking.numberOfRooms) === Number(searchParams.guests.rooms) &&
          String(booking.roomTypeId || "") === String(roomTypeId || "");
        if (!bookingMatchesCheckout) {
          throw new Error("This pending booking no longer matches the checkout. Return to the hotel and check availability again.");
        }
        if (Number(booking.totalPrice) !== Number(eligibility?.pricing?.totalPrice)) {
          throw new Error("The hotel price changed. Return to the hotel and start a new booking at the current price.");
        }
      } else if (!paymentIntentId) {
        const detectedLocation = detectedGuestLocation || await getGuestLocation();
        const detectedAddress = detectedLocation?.detectedAddress || {};
        const nextBillingAddress = {
          address: billingAddress.address || detectedAddress.address || "",
          city: billingAddress.city || detectedAddress.city || "",
          state: billingAddress.state || detectedAddress.state || "",
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
          propertyId,
          billingAddress: {
            address: nextBillingAddress.address.trim(),
            city: nextBillingAddress.city.trim(),
            state: nextBillingAddress.state.trim(),
            zipCode: nextBillingAddress.zipCode.trim(),
            country: nextBillingAddress.country,
          },
          checkInDate: searchParams.dates.startDate,
          checkOutDate: searchParams.dates.endDate,
          numberOfGuests:
            Number(searchParams?.guests?.adults || 1) +
            Number(searchParams?.guests?.children || 0),
          numberOfRooms: Number(searchParams?.guests?.rooms || 1),
          specialRequests: "",
          guestName: user?.name || "",
          guestEmail: user?.email || "",
          guestPhone: user?.mobile || user?.phone || "",
          guestLocation: detectedLocation?.coordinates || null,
        };
        if (roomTypeId) bookingPayload.roomTypeId = roomTypeId;
        reservationPayload = bookingPayload;
      }

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay Checkout failed to load");

      const orderResult = await createPaymentOrder(
        pendingBookingId
          ? pendingBookingId
          : paymentIntentId
            ? { paymentIntentId }
            : reservationPayload,
        !pendingBookingId && !paymentIntentId ? getPaymentIdempotencyKey() : undefined
      );
      paymentIntentId = String(orderResult.paymentIntentId || paymentIntentId);
      if (paymentIntentId) {
        const nextParams = new URLSearchParams(location.search);
        nextParams.set("paymentIntentId", paymentIntentId);
        navigate(
          { pathname: location.pathname, search: `?${nextParams.toString()}` },
          { replace: true }
        );
      }
      const { order, key } = orderResult;
      const expectedOrderAmount = Math.round(Number(eligibility?.pricing?.totalPrice) * 100);
      if (!key || !order?.id || !Number.isInteger(Number(order.amount)) ||
        Number(order.amount) <= 0 ||
        Number(order.amount) !== expectedOrderAmount || order.currency !== "INR") {
        throw new Error("The payment gateway returned an invalid order. No payment was started.");
      }
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
              const verificationResult = pendingBookingId
                ? await verifyLegacyBookingPayment(pendingBookingId, paymentResponse)
                : await verifyPayment(paymentIntentId, paymentResponse);
              const verifiedBooking = verificationResult?.booking;
              if (verifiedBooking?.bookingStatus !== "CONFIRMED" ||
                verifiedBooking?.paymentStatus !== "SUCCESS") {
                throw new Error("Payment was not verified as successful. The booking is not confirmed.");
              }
              resolve(verifiedBooking);
            } catch (error) {
              reject(new Error(error?.message || "Payment verification failed"));
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled")) },
        });
        razorpay.on("payment.failed", () => reject(new Error("Payment failed")));
        razorpay.open();
      });
      if (!confirmedBooking) {
        throw new Error("The server did not confirm the paid booking.");
      }

      bookingId = String(confirmedBooking._id || confirmedBooking.id || "");
      if (!bookingId) throw new Error("The server did not return the confirmed booking ID.");
      try {
        sessionStorage.removeItem(paymentIdempotencyStorageKey);
      } catch (storageError) {
        console.error("Unable to clear the payment retry key:", storageError);
      }
      navigate(`/payment/success?bookingId=${encodeURIComponent(bookingId)}`, {
        replace: true,
        state: {
          property,
          searchParams,
          total: calculateTotal(),
          booking: confirmedBooking,
          paymentMethod: "RAZORPAY",
        },
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      if (pendingBookingId || paymentIntentId) {
        const failureParams = new URLSearchParams(location.search);
        if (pendingBookingId) failureParams.set("bookingId", pendingBookingId);
        if (paymentIntentId) failureParams.set("paymentIntentId", paymentIntentId);
        navigate(`/payment/failed?${failureParams.toString()}`, {
          replace: true,
          state: { message: error?.response?.data?.message || error?.message || "Payment could not be completed." },
        });
      } else {
        setBookingError(
          error?.response?.data?.message ||
            error?.message ||
          "Payment could not be started. Please try again."
        );
      }
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

  if (hotelLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-700 shadow-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
          Loading hotel details…
        </div>
      </div>
    );
  }

  if (!property) {
    const hotelWasDeleted = hotelLookupError?.status === 404;
    const invalidHotelLink = hotelLookupError?.status === 400;
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
              {hotelWasDeleted ? "Hotel no longer exists" : invalidHotelLink ? "Invalid hotel link" : "Hotel details unavailable"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {hotelLookupError?.message || "Select a hotel from search results before continuing to checkout."}
            </p>

            <button
              type="button"
              onClick={() => invalidHotelLink || hotelWasDeleted
                ? navigate("/book-place")
                : setHotelRetryCount((count) => count + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
            >
              <ArrowLeft size={17} />
              {invalidHotelLink || hotelWasDeleted ? "Search hotels" : "Retry"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!searchParams.dates.startDate || !searchParams.dates.endDate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900">Stay dates are missing</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose your dates and room for this hotel before continuing to checkout.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/hotel/${encodeURIComponent(propertyId)}`)}
            className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white"
          >
            Choose stay details
          </button>
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
                        const nextRoomTypeId = event.target.value;
                        setRoomTypeId(nextRoomTypeId);
                        setBookingError("");
                        setEligibilityError("");
                        const nextParams = new URLSearchParams(location.search);
                        if (nextRoomTypeId) nextParams.set("roomTypeId", nextRoomTypeId);
                        else nextParams.delete("roomTypeId");
                        navigate(
                          { pathname: location.pathname, search: nextParams.toString() ? `?${nextParams}` : "" },
                          { replace: true, state: routeState }
                        );
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

                  <div className="grid gap-4">

                    {/* CARD */}

                    <button
                      type="button"
                      onClick={() => setBookingError("")}
                      className="flex items-center gap-3 rounded-2xl border-2 border-blue-700 bg-blue-50 p-4 text-left text-blue-800 shadow-sm transition"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
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

                      <CheckCircle size={19} className="ml-auto shrink-0 text-blue-700" />
                    </button>

                  </div>
                </div>

                {/* ==================================================
                    CARD FORM
                ================================================== */}

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

                        {/* CITY + STATE + PIN */}

                        <div className="grid gap-5 sm:grid-cols-2">

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                              City
                            </label>

                            <input
                              type="text"
                              autoComplete="address-level2"
                              placeholder="Nanded"
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
                              State
                            </label>

                            <input
                              type="text"
                              autoComplete="address-level1"
                              placeholder="Maharashtra"
                              className={inputClass("state")}
                              value={billingAddress.state}
                              onChange={(event) => setBillingAddress((previous) => ({
                                ...previous,
                                state: event.target.value,
                              }))}
                            />

                            {errors.state && (
                              <p className="mt-1 text-sm font-medium text-red-500">
                                {errors.state}
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
                              onChange={(event) => setBillingAddress((previous) => ({
                                ...previous,
                                zipCode: event.target.value.replace(/[^A-Za-z0-9 -]/g, "").slice(0, 10),
                              }))}
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

                            <option value="GB">
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
                    {!eligibilityLoading && eligibilityError && (
                      <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{eligibilityError}</span>
                        <button
                          type="button"
                          onClick={() => setEligibilityRetryCount((count) => count + 1)}
                          className="shrink-0 rounded-lg border border-red-300 px-3 py-1.5 font-semibold hover:bg-red-100"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    {!eligibilityLoading && !eligibilityError && eligibility?.eligible !== true && (
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
                      disabled={isProcessing || eligibilityLoading || Boolean(eligibilityError) || eligibility?.eligible !== true}
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
                    <HotelCardImage
                      src={property.image || property.images?.[0]}
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

                    {Number(property.ratingCount) > 0 && Number.isFinite(Number(property.rating)) && (
                      <div className="mt-3 flex items-center gap-1">
                      <Star
                        size={16}
                        className="fill-yellow-500 text-yellow-500"
                      />

                      <span className="text-sm font-bold text-slate-700">
                        {Number(property.rating).toFixed(1)}
                      </span>

                      <span className="text-xs text-slate-400">
                        {property.ratingCount} recorded rating{property.ratingCount === 1 ? "" : "s"}
                      </span>
                      </div>
                    )}

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

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between gap-3">
                      <span>Separate taxes and fees</span>
                      <span>Not configured</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Discount</span>
                      <span>None applied</span>
                    </div>
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

                  <p className="mb-3 text-xs leading-5 text-slate-500">
                    The total is calculated from the selected room rate by the booking service. No separate tax or discount policy is configured, so no additional amounts have been invented.
                  </p>

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