import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError, addBooking } from "../bookingSlice";
import { createBooking } from "../services/bookingService";
import { toast } from "react-toastify";

export default function BookingForm() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.auth);

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
      [name]: name === "numberOfGuests" || name === "numberOfRooms" || name === "pricePerNight" 
        ? Number(value) 
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.property || !formData.checkInDate || !formData.checkOutDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    dispatch(setLoading(true));

    try {
      const response = await createBooking(formData);
      dispatch(addBooking(response.booking));
      toast.success("Booking created successfully!");
      
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
      const errorMsg = error.message || "Booking creation failed";
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold mb-6">Create a Booking</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="property" className="block text-sm font-medium text-gray-700">
            Property Name *
          </label>
          <input
            id="property"
            name="property"
            type="text"
            required
            value={formData.property}
            onChange={handleChange}
            placeholder="Enter property name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700">
              Check-in Date *
            </label>
            <input
              id="checkInDate"
              name="checkInDate"
              type="date"
              required
              value={formData.checkInDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700">
              Check-out Date *
            </label>
            <input
              id="checkOutDate"
              name="checkOutDate"
              type="date"
              required
              value={formData.checkOutDate}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700">
              Number of Guests *
            </label>
            <input
              id="numberOfGuests"
              name="numberOfGuests"
              type="number"
              min="1"
              value={formData.numberOfGuests}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700">
              Number of Rooms *
            </label>
            <input
              id="numberOfRooms"
              name="numberOfRooms"
              type="number"
              min="1"
              value={formData.numberOfRooms}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700">
              Price Per Night ($) *
            </label>
            <input
              id="pricePerNight"
              name="pricePerNight"
              type="number"
              min="0"
              step="0.01"
              value={formData.pricePerNight}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
            Special Requests
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows="4"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests or notes..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400"
        >
          {loading ? "Creating Booking..." : "Create Booking"}
        </button>
      </form>
    </div>
  );
}
