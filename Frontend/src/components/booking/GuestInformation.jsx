import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

const GuestInformation = ({ booking }) => {
  const name = booking?.guestName || 'Guest User';
  const email = booking?.guestEmail || 'guest@example.com';
  const phone = booking?.guestPhone || '+91 98765 43210';

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-5">Guest Information</h3>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="text-blue-600" size={18} />
          <div>
            <p className="text-sm text-gray-500">Guest Name</p>
            <p className="font-semibold text-gray-900">{name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="text-blue-600" size={18} />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-gray-900">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="text-blue-600" size={18} />
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-semibold text-gray-900">{phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestInformation;
