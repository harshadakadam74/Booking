import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  MapPin,
  Home,
  DollarSign,
  Users,
  Image as ImageIcon,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building2,
  Sparkles,
} from "lucide-react";

const ListProperty = () => {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",

    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    squareFeet: "",

    nightlyRate: "",
    cleaningFee: "",
    serviceFee: "",

    amenities: [],
    images: [],

    checkInTime: "15:00",
    checkOutTime: "11:00",
    cancellationPolicy: "moderate",
    houseRules: "",
  });

  const propertyTypes = [
    "Apartment",
    "House",
    "Villa",
    "Condo",
    "Cabin",
    "Cottage",
    "Hotel Room",
    "Resort",
    "Serviced Apartment",
    "Glamping Site",
  ];

  const amenitiesList = [
    "WiFi",
    "Kitchen",
    "Washer",
    "Dryer",
    "Air conditioning",
    "Heating",
    "Pool",
    "Hot tub",
    "Gym",
    "Parking",
    "Pet friendly",
    "Smoking allowed",
    "TV",
    "Hair dryer",
    "Iron",
    "Fireplace",
    "BBQ grill",
    "Garden",
  ];

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");

    if (!token && !user) {
      navigate("/login", {
        state: {
          from: "/list-property",
        },
        replace: true,
      });
      return;
    }

    setIsLoggedIn(true);
  }, [navigate]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // =========================================================
  // AMENITIES
  // =========================================================

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((item) => item !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // =========================================================
  // IMAGE UPLOAD
  // =========================================================

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    const newImages = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      id: `${Date.now()}-${index}-${Math.random()}`,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    setErrors((prev) => ({
      ...prev,
      images: "",
    }));

    e.target.value = "";
  };

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  const removeImage = (imageId) => {
    setFormData((prev) => {
      const imageToRemove = prev.images.find(
        (image) => image.id === imageId
      );

      if (imageToRemove?.url) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return {
        ...prev,
        images: prev.images.filter((image) => image.id !== imageId),
      };
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Property title is required";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }

      if (!formData.propertyType) {
        newErrors.propertyType = "Property type is required";
      }

      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }

      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }
    }

    if (step === 2) {
      if (
        formData.bedrooms === "" ||
        Number(formData.bedrooms) < 0
      ) {
        newErrors.bedrooms = "Number of bedrooms is required";
      }

      if (
        formData.bathrooms === "" ||
        Number(formData.bathrooms) < 0
      ) {
        newErrors.bathrooms = "Number of bathrooms is required";
      }

      if (
        formData.maxGuests === "" ||
        Number(formData.maxGuests) < 1
      ) {
        newErrors.maxGuests = "Maximum guests is required";
      }
    }

    if (step === 3) {
      if (!formData.nightlyRate) {
        newErrors.nightlyRate = "Nightly rate is required";
      } else if (Number(formData.nightlyRate) <= 0) {
        newErrors.nightlyRate =
          "Nightly rate must be greater than 0";
      }
    }

    if (step === 5) {
      if (formData.images.length === 0) {
        newErrors.images =
          "Please upload at least one property image";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // NEXT
  // =========================================================

  const nextStep = () => {
    if (!validateStep(currentStep)) return;

    setCurrentStep((prev) => Math.min(prev + 1, 5));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // PREVIOUS
  // =========================================================

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));

    setErrors({});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    try {
      const propertyData = {
        ...formData,
        images: formData.images.map((image) => image.file),
      };

      console.log("Property listed:", propertyData);

      // Replace with your backend API
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      navigate("/account", {
        state: {
          propertyListed: true,
        },
      });
    } catch (error) {
      console.error("Error listing property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // STEP INDICATOR
  // =========================================================

  const renderStepIndicator = () => {
    const steps = [
      {
        number: 1,
        title: "Basic Info",
        icon: Building2,
      },
      {
        number: 2,
        title: "Details",
        icon: Home,
      },
      {
        number: 3,
        title: "Pricing",
        icon: DollarSign,
      },
      {
        number: 4,
        title: "Amenities",
        icon: Sparkles,
      },
      {
        number: 5,
        title: "Photos",
        icon: ImageIcon,
      },
    ];

    return (
      <div className="mb-8 overflow-x-auto">
        <div className="mx-auto flex min-w-[680px] items-center justify-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <React.Fragment key={step.number}>
                <button
                  type="button"
                  disabled={step.number > currentStep}
                  onClick={() => {
                    if (step.number < currentStep) {
                      setCurrentStep(step.number);
                      setErrors({});
                    }
                  }}
                  className="group flex flex-col items-center"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "border-[#D4AF37] bg-[#D4AF37] text-white shadow-lg shadow-yellow-200"
                        : isCompleted
                        ? "border-[#0B3B82] bg-[#0B3B82] text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Icon size={19} />
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs font-bold ${
                      isActive
                        ? "text-[#B8962E]"
                        : isCompleted
                        ? "text-[#0B3B82]"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-3 mb-6 h-1 w-14 rounded-full transition-all ${
                      currentStep > step.number
                        ? "bg-[#0B3B82]"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // =========================================================
  // ERROR
  // =========================================================

  const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
      <p className="mt-2 text-sm font-medium text-red-500">
        {message}
      </p>
    );
  };

  // =========================================================
  // INPUT CLASS
  // =========================================================

  const inputClass = (field) =>
    `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-200 focus:border-[#0B3B82] focus:ring-blue-100"
    }`;

  // =========================================================
  // STEP CONTENT
  // =========================================================

  const renderStepContent = () => {
    switch (currentStep) {
      // =====================================================
      // STEP 1
      // =====================================================

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <div className="mb-7">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B3B82]">
                  <Building2 size={14} />
                  Step 01
                </span>

                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  Tell us about your property
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Start with the basic information guests need
                  to know.
                </p>
              </div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Property Title
              </label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Luxury Downtown Apartment"
                className={inputClass("title")}
                value={formData.title}
                onChange={handleInputChange}
              />

              <ErrorMessage message={errors.title} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                rows={5}
                placeholder="Describe your property, its features, location and what makes it special..."
                className={inputClass("description")}
                value={formData.description}
                onChange={handleInputChange}
              />

              <ErrorMessage message={errors.description} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Property Type
              </label>

              <select
                name="propertyType"
                className={inputClass("propertyType")}
                value={formData.propertyType}
                onChange={handleInputChange}
              >
                <option value="">
                  Select property type
                </option>

                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <ErrorMessage message={errors.propertyType} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <MapPin
                    size={16}
                    className="text-[#D4AF37]"
                  />
                  Location
                </span>
              </label>

              <input
                type="text"
                name="address"
                placeholder="Street address"
                className={inputClass("address")}
                value={formData.address}
                onChange={handleInputChange}
              />

              <ErrorMessage message={errors.address} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className={inputClass("city")}
                  value={formData.city}
                  onChange={handleInputChange}
                />

                <ErrorMessage message={errors.city} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  className={inputClass("state")}
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  ZIP Code
                </label>

                <input
                  type="text"
                  name="zipCode"
                  placeholder="ZIP Code"
                  className={inputClass("zipCode")}
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Country
              </label>

              <input
                type="text"
                name="country"
                className={inputClass("country")}
                value={formData.country}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      // =====================================================
      // STEP 2
      // =====================================================

      case 2:
        return (
          <div className="space-y-7">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B3B82]">
                <Home size={14} />
                Step 02
              </span>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Property details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell guests about your property's space and
                capacity.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-[#D4AF37]">
                <Users
                  className="mb-4 text-[#D4AF37]"
                  size={24}
                />

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Bedrooms
                </label>

                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  className={inputClass("bedrooms")}
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                />

                <ErrorMessage message={errors.bedrooms} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-[#D4AF37]">
                <Home
                  className="mb-4 text-[#D4AF37]"
                  size={24}
                />

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Bathrooms
                </label>

                <input
                  type="number"
                  name="bathrooms"
                  min="0"
                  step="0.5"
                  className={inputClass("bathrooms")}
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                />

                <ErrorMessage message={errors.bathrooms} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-[#D4AF37]">
                <Users
                  className="mb-4 text-[#D4AF37]"
                  size={24}
                />

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Maximum Guests
                </label>

                <input
                  type="number"
                  name="maxGuests"
                  min="1"
                  className={inputClass("maxGuests")}
                  value={formData.maxGuests}
                  onChange={handleInputChange}
                />

                <ErrorMessage message={errors.maxGuests} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Square Feet
              </label>

              <input
                type="number"
                name="squareFeet"
                min="0"
                placeholder="Approximate property size"
                className={inputClass("squareFeet")}
                value={formData.squareFeet}
                onChange={handleInputChange}
              />

              <p className="mt-1 text-xs text-slate-400">
                Optional
              </p>
            </div>
          </div>
        );

      // =====================================================
      // STEP 3
      // =====================================================

      case 3:
        return (
          <div className="space-y-7">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B3B82]">
                <DollarSign size={14} />
                Step 03
              </span>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Set your pricing
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose your nightly price and additional fees.
              </p>
            </div>

            <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-blue-50 to-yellow-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-white">
                  <DollarSign size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-[#0B3B82]">
                    Pricing tip
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Competitive pricing can help your property
                    attract more bookings.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Nightly Rate ($)
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#D4AF37]">
                  $
                </span>

                <input
                  type="number"
                  name="nightlyRate"
                  min="0"
                  placeholder="100"
                  className={`${inputClass(
                    "nightlyRate"
                  )} pl-9 text-lg font-bold`}
                  value={formData.nightlyRate}
                  onChange={handleInputChange}
                />
              </div>

              <ErrorMessage message={errors.nightlyRate} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Cleaning Fee ($)
                </label>

                <input
                  type="number"
                  name="cleaningFee"
                  min="0"
                  placeholder="50"
                  className={inputClass("cleaningFee")}
                  value={formData.cleaningFee}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Service Fee ($)
                </label>

                <input
                  type="number"
                  name="serviceFee"
                  min="0"
                  placeholder="20"
                  className={inputClass("serviceFee")}
                  value={formData.serviceFee}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      // =====================================================
      // STEP 4
      // =====================================================

      case 4:
        return (
          <div className="space-y-7">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B3B82]">
                <Sparkles size={14} />
                Step 04
              </span>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Amenities & rules
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select everything your guests can enjoy.
              </p>
            </div>

            <div>
              <label className="mb-4 block text-sm font-bold text-slate-700">
                Available Amenities
              </label>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {amenitiesList.map((amenity) => {
                  const selected =
                    formData.amenities.includes(amenity);

                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() =>
                        handleAmenityToggle(amenity)
                      }
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition ${
                        selected
                          ? "border-[#D4AF37] bg-yellow-50 text-[#0B3B82]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-[#D4AF37] hover:bg-yellow-50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-[#D4AF37] bg-[#D4AF37] text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {selected && (
                          <CheckCircle size={14} />
                        )}
                      </span>

                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                House Rules
              </label>

              <textarea
                name="houseRules"
                rows={4}
                placeholder="Any specific rules or guidelines for guests..."
                className={inputClass("houseRules")}
                value={formData.houseRules}
                onChange={handleInputChange}
              />

              <p className="mt-1 text-xs text-slate-400">
                Optional
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Check-in Time
                </label>

                <input
                  type="time"
                  name="checkInTime"
                  className={inputClass("checkInTime")}
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Check-out Time
                </label>

                <input
                  type="time"
                  name="checkOutTime"
                  className={inputClass("checkOutTime")}
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Cancellation Policy
              </label>

              <select
                name="cancellationPolicy"
                className={inputClass("cancellationPolicy")}
                value={formData.cancellationPolicy}
                onChange={handleInputChange}
              >
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </select>
            </div>
          </div>
        );

      // =====================================================
      // STEP 5
      // =====================================================

      case 5:
        return (
          <div className="space-y-7">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B3B82]">
                <ImageIcon size={14} />
                Step 05
              </span>

              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Add property photos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                High-quality photos make your property more
                attractive to guests.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-dashed border-[#D4AF37]/50 bg-gradient-to-br from-blue-50 to-yellow-50 p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B3B82] text-[#D4AF37] shadow-lg">
                <Upload size={30} />
              </div>

              <h3 className="font-bold text-slate-800">
                Upload your property photos
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Add photos of bedrooms, bathrooms, living spaces,
                exterior, amenities and special features.
              </p>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />

              <label
                htmlFor="image-upload"
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0B3B82] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#082f69]"
              >
                <ImageIcon size={18} />
                Choose Images
              </label>

              <p className="mt-3 text-xs text-slate-400">
                JPG, PNG, WEBP supported
              </p>
            </div>

            <ErrorMessage message={errors.images} />

            {formData.images.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">
                    Uploaded Photos
                  </h3>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-[#0B3B82]">
                    {formData.images.length} photo
                    {formData.images.length !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      <img
                        src={image.url}
                        alt={`Property ${index + 1}`}
                        className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#D4AF37] px-2 py-1 text-[10px] font-bold text-white shadow">
                          COVER
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(image.id)
                        }
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow transition hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // =========================================================
  // AUTH LOADING
  // =========================================================

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-[#0B3B82]" />
          <p className="font-semibold text-slate-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#082F69] via-[#0B3B82] to-[#123F7A] p-7 text-white shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition hover:text-[#D4AF37]"
              >
                <ChevronLeft size={17} />
                Back
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-white/10 text-[#D4AF37] backdrop-blur">
                  <Home size={27} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-extrabold">
                      List Your Property
                    </h1>

                    <Sparkles
                      size={20}
                      className="text-[#D4AF37]"
                    />
                  </div>

                  <p className="mt-1 text-sm text-blue-100">
                    Share your space with travelers from around
                    the world
                  </p>
                </div>
              </div>
            </div>

            {/* STEP BOX */}
            <div className="rounded-2xl border border-[#D4AF37]/40 bg-white/10 px-6 py-4 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                Current Step
              </p>

              <p className="mt-1 text-3xl font-extrabold">
                {currentStep}
                <span className="text-base font-normal text-blue-200">
                  {" "}
                  / 5
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* STEP INDICATOR */}
        {renderStepIndicator()}

        {/* MAIN FORM */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {/* GOLD TOP LINE */}
          <div className="h-1.5 bg-gradient-to-r from-[#0B3B82] via-[#D4AF37] to-[#0B3B82]" />

          <div className="p-6 sm:p-8 lg:p-10">
            {renderStepContent()}

            {/* NAVIGATION */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#D4AF37] hover:bg-yellow-50 hover:text-[#0B3B82]"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0B3B82] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#082F69]"
                >
                  Continue
                  <ChevronRight size={17} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#B8962E] via-[#D4AF37] to-[#B8962E] px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-yellow-200 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Listing Property...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      List Property
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <Sparkles
            size={14}
            className="text-[#D4AF37]"
          />
          Your property information is securely handled by
          <span className="font-bold text-[#0B3B82]">
            FastBooking
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListProperty;