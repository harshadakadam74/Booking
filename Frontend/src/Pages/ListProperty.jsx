import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Home, DollarSign, Users, Image as ImageIcon, CheckCircle } from 'lucide-react';

const ListProperty = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    propertyType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',

    // Details
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    squareFeet: '',

    // Pricing
    nightlyRate: '',
    cleaningFee: '',
    serviceFee: '',

    // Amenities
    amenities: [],

    // Images
    images: [],

    // Policies
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'moderate',
    houseRules: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    setIsLoggedIn(true);
  }, [navigate]);

  const propertyTypes = [
    'Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Cottage',
    'Hotel Room', 'Resort', 'Serviced Apartment', 'Glamping Site'
  ];

  const amenitiesList = [
    'WiFi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating',
    'Pool', 'Hot tub', 'Gym', 'Parking', 'Pet friendly', 'Smoking allowed',
    'TV', 'Hair dryer', 'Iron', 'Fireplace', 'BBQ grill', 'Garden'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Property title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      case 2:
        if (!formData.bedrooms) newErrors.bedrooms = 'Number of bedrooms is required';
        if (!formData.bathrooms) newErrors.bathrooms = 'Number of bathrooms is required';
        if (!formData.maxGuests) newErrors.maxGuests = 'Maximum guests is required';
        break;
      case 3:
        if (!formData.nightlyRate) newErrors.nightlyRate = 'Nightly rate is required';
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would upload images and save property data
      console.log('Property listed:', formData);

      // Redirect to success page or property management
      navigate('/account');
    } catch (error) {
      console.error('Error listing property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 5 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Property Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g., Cozy Downtown Apartment"
                className={`w-full p-3 border rounded-lg ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.title}
                onChange={handleInputChange}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe your property, its features, and what makes it special..."
                className={`w-full p-3 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.description}
                onChange={handleInputChange}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Property Type</label>
              <select
                name="propertyType"
                className={`w-full p-3 border rounded-lg ${errors.propertyType ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.propertyType}
                onChange={handleInputChange}
              >
                <option value="">Select property type</option>
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street address"
                  className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  className={`w-full p-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.city}
                  onChange={handleInputChange}
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  min="0"
                  className={`w-full p-3 border rounded-lg ${errors.bedrooms ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                />
                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  min="0"
                  step="0.5"
                  className={`w-full p-3 border rounded-lg ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                />
                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Guests</label>
                <input
                  type="number"
                  name="maxGuests"
                  min="1"
                  className={`w-full p-3 border rounded-lg ${errors.maxGuests ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.maxGuests}
                  onChange={handleInputChange}
                />
                {errors.maxGuests && <p className="text-red-500 text-sm mt-1">{errors.maxGuests}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Square Feet (optional)</label>
              <input
                type="number"
                name="squareFeet"
                placeholder="Approximate size"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.squareFeet}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nightly Rate ($)</label>
              <input
                type="number"
                name="nightlyRate"
                min="0"
                placeholder="100"
                className={`w-full p-3 border rounded-lg ${errors.nightlyRate ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.nightlyRate}
                onChange={handleInputChange}
              />
              {errors.nightlyRate && <p className="text-red-500 text-sm mt-1">{errors.nightlyRate}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cleaning Fee ($)</label>
                <input
                  type="number"
                  name="cleaningFee"
                  min="0"
                  placeholder="50"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.cleaningFee}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Service Fee ($)</label>
                <input
                  type="number"
                  name="serviceFee"
                  min="0"
                  placeholder="20"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.serviceFee}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenitiesList.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">House Rules (optional)</label>
              <textarea
                name="houseRules"
                rows={3}
                placeholder="Any specific rules or guidelines for guests..."
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={formData.houseRules}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4">Property Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Upload high-quality photos of your property</p>
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
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 inline-block"
                >
                  Choose Images
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map(image => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.url}
                        alt="Property"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">List Your Property</h1>
          <p className="text-gray-600 text-center">Share your space with travelers from around the world</p>
        </div>

        {renderStepIndicator()}

        <div className="bg-white rounded-xl shadow-md p-8">
          {renderStepContent()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Listing Property...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    List Property
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProperty;