import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError, addBooking } from "../bookingSlice";
import { createBooking } from "../services/bookingService";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Users,
  DoorOpen,
  DollarSign,
  Building2,
  MessageSquare,
} from "lucide-react";

export default function BookingForm() {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.booking);

  const [formData, setFormData] = useState({
    property: "",
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    numberOfRooms: 1,
    pricePerNight: 0,
    specialRequests: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "numberOfGuests" ||
        name === "numberOfRooms" ||
        name === "pricePerNight"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields
    if (
      !formData.property ||
      !formData.checkInDate ||
      !formData.checkOutDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate dates
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);

    if (checkOut <= checkIn) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Validate guests and rooms
    if (formData.numberOfGuests < 1) {
      toast.error("Number of guests must be at least 1");
      return;
    }

    if (formData.numberOfRooms < 1) {
      toast.error("Number of rooms must be at least 1");
      return;
    }

    if (formData.pricePerNight < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await createBooking(formData);

      if (response?.booking) {
        dispatch(addBooking(response.booking));
      }

      toast.success("Booking created successfully!");

      // Reset form
      setFormData({
        property: "",
        checkInDate: "",
        checkOutDate: "",
        numberOfGuests: 1,
        numberOfRooms: 1,
        pricePerNight: 0,
        specialRequests: "",
      });
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Booking creation failed";

      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">

      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF8E7]">
            <CalendarDays
              size={24}
              className="text-[#C58A18]"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#082B5C]">
              Create a Booking
            </h2>

            <p className="text-sm text-slate-500">
              Enter your stay details below
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Property */}
        <div>
          <label
            htmlFor="property"
            className="mb-2 block text-sm font-semibold text-[#082B5C]"
          >
            Property Name *
          </label>

          <div className="relative">
            <Building2
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C58A18]"
            />

            <input
              id="property"
              name="property"
              type="text"
              required
              value={formData.property}
              onChange={handleChange}
              placeholder="Enter property name"
              className="
                w-full rounded-xl border border-slate-300
                py-3 pl-10 pr-4
                text-slate-700
                outline-none
                transition
                focus:border-[#C58A18]
                focus:ring-2 focus:ring-[#C58A18]/20
              "
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Check In */}
          <div>
            <label
              htmlFor="checkInDate"
              className="mb-2 block text-sm font-semibold text-[#082B5C]"
            >
              Check-in Date *
            </label>

            <div className="relative">
              <CalendarDays
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C58A18]"
              />

              <input
                id="checkInDate"
                name="checkInDate"
                type="date"
                required
                value={formData.checkInDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="
                  w-full rounded-xl border border-slate-300
                  py-3 pl-10 pr-4
                  text-slate-700
                  outline-none
                  focus:border-[#C58A18]
                  focus:ring-2 focus:ring-[#C58A18]/20
                "
              />
            </div>
          </div>

          {/* Check Out */}
          <div>
            <label
              htmlFor="checkOutDate"
              className="mb-2 block text-sm font-semibold text-[#082B5C]"
            >
              Check-out Date *
            </label>

            <div className="relative">
              <CalendarDays
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C58A18]"
              />

              <input
                id="checkOutDate"
                name="checkOutDate"
                type="date"
                required
                value={formData.checkOutDate}
                onChange={handleChange}
                min={
                  formData.checkInDate ||
                  new Date().toISOString().split("T")[0]
                }
                className="
                  w-full rounded-xl border border-slate-300
                  py-3 pl-10 pr-4
                  text-slate-700
                  outline-none
                  focus:border-[#C58A18]
                  focus:ring-2 focus:ring-[#C58A18]/20
                "
              />
            </div>
          </div>
        </div>

        {/* Guests / Rooms / Price */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Guests */}
          <div>
            <label
              htmlFor="numberOfGuests"
              className="mb-2 block text-sm font-semibold text-[#082B5C]"
            >
              Number of Guests *
            </label>

            <div className="relative">
              <Users
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C58A18]"
              />

              <input
                id="numberOfGuests"
                name="numberOfGuests"
                type="number"
                min="1"
                required
                value={formData.numberOfGuests}
                onChange={handleChange}
                className="
                  w-full rounded-xl border border-slate-300
                  py-3 pl-10 pr-4
                  outline-none
                  focus:border-[#C58A18]
                  focus:ring-2 focus:ring-[#C58A18]/20
                "
              />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label
              htmlFor="numberOfRooms"
              className="mb-2 block text-sm font-semibold text-[#082B5C]"
            >
              Number of Rooms *
            </label>

            <div className="relative">
              <DoorOpen
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C58A18]"
              />

              <input
                id="numberOfRooms"
                name="numberOfRooms"
                type="number"
                min="1"
                required
                value={formData.numberOfRooms}
                onChange={handleChange}
                className="
                  w-full rounded-xl border border-slate-300
                  py-3 pl-10 pr-4
                  outline-none
                  focus:border-[#C58A18]
                  focus:ring-2 focus:ring-[#C58A18]/20
                "
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="pricePerNight"
              className="mb-2 block text-sm font-semibold text-[#082B5C]"
            >
              Price Per Night ($) *
            </label>

            <div className="relative">
              <DollarSign
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C58A18]"
              />

              <input
                id="pricePerNight"
                name="pricePerNight"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.pricePerNight}
                onChange={handleChange}
                className="
                  w-full rounded-xl border border-slate-300
                  py-3 pl-10 pr-4
                  outline-none
                  focus:border-[#C58A18]
                  focus:ring-2 focus:ring-[#C58A18]/20
                "
              />
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label
            htmlFor="specialRequests"
            className="mb-2 block text-sm font-semibold text-[#082B5C]"
          >
            Special Requests
          </label>

          <div className="relative">
            <MessageSquare
              size={19}
              className="absolute left-3 top-4 text-[#C58A18]"
            />

            <textarea
              id="specialRequests"
              name="specialRequests"
              rows="4"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests or notes..."
              className="
                w-full resize-none rounded-xl
                border border-slate-300
                py-3 pl-10 pr-4
                text-slate-700
                outline-none
                transition
                focus:border-[#C58A18]
                focus:ring-2 focus:ring-[#C58A18]/20
              "
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            w-full rounded-xl
            bg-[#082B5C]
            px-5 py-3.5
            text-sm font-bold text-white
            shadow-md
            transition-all duration-300
            hover:bg-[#C58A18]
            hover:shadow-lg
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:bg-slate-400
          "
        >
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>

      </form>
    </div>
  );
}