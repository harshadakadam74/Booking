import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingHeader = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        onClick={() => navigate('/account/bookings')}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft size={18} />
        Back to My Bookings
      </button>

      <div className="bg-white rounded-3xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>
    </div>
  );
};

export default BookingHeader;
