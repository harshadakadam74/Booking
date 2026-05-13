import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Shield, ArrowLeft, Star } from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { property, searchParams } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    if (!property || !searchParams?.dates) return 0;

    const nights = Math.ceil((searchParams.dates.endDate - searchParams.dates.startDate) / (1000 * 60 * 60 * 24));
    return property.price * nights;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardDetails.name.trim()) newErrors.name = 'Cardholder name is required';
    if (!cardDetails.number.trim()) newErrors.number = 'Card number is required';
    if (!cardDetails.expiry.trim()) newErrors.expiry = 'Expiry date is required';
    if (!cardDetails.cvv.trim()) newErrors.cvv = 'CVV is required';

    if (!billingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!billingAddress.city.trim()) newErrors.city = 'City is required';
    if (!billingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!billingAddress.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/payment-success', {
        state: {
          property,
          searchParams,
          total: calculateTotal()
        }
      });
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking information found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border rounded-lg flex items-center gap-3 ${
                      paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span>Credit/Debit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 border rounded-lg flex items-center gap-3 ${
                      paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                    <span>PayPal</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmit}>
                  {/* Card Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Card Information</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className={`w-full p-3 border rounded-lg ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                          maxLength="19"
                        />
                        {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className={`w-full p-3 border rounded-lg ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                            maxLength="5"
                          />
                          {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className={`w-full p-3 border rounded-lg ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/[^0-9]/g, '') }))}
                            maxLength="4"
                          />
                          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Billing Address</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <input
                          type="text"
                          placeholder="123 Main St"
                          className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                          value={billingAddress.address}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, address: e.target.value }))}
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <input
                            type="text"
                            placeholder="New York"
                            className={`w-full p-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">ZIP Code</label>
                          <input
                            type="text"
                            placeholder="10001"
                            className={`w-full p-3 border rounded-lg ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                            value={billingAddress.zipCode}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                          />
                          {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Country</label>
                        <select
                          className={`w-full p-3 border rounded-lg ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
                        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Complete Payment
                      </>
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'paypal' && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment.</p>
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Continue with PayPal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold">{property.name}</h4>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <div className="flex items-center mt-1">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm ml-1">{property.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Dates</span>
                    <span>
                      {searchParams?.dates && `${new Date(searchParams.dates.startDate).toLocaleDateString()} - ${new Date(searchParams.dates.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Guests</span>
                    <span>
                      {searchParams?.guests && `${searchParams.guests.adults} adults, ${searchParams.guests.children} children`}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Rooms</span>
                    <span>{searchParams?.guests?.rooms || 1}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Shield size={20} />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;