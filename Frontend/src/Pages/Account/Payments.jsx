import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft } from 'lucide-react';

const AccountPayments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/account')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Account
        </button>

        <div className="bg-white rounded-3xl shadow-md p-8">
          <div className="flex items-center gap-4 mb-6">
            <CreditCard size={28} className="text-green-600" />
            <div>
              <h1 className="text-3xl font-bold">Payment Methods</h1>
              <p className="text-gray-600">Manage saved cards and billing information.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500 mb-4">No saved payment methods yet.</p>
            <button
              onClick={() => navigate('/payment')}
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPayments;
