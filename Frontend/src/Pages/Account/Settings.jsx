import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

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
            <Settings size={28} className="text-gray-600" />
            <div>
              <h1 className="text-3xl font-bold">Account Settings</h1>
              <p className="text-gray-600">Update your profile, email and password preferences.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="font-semibold text-lg mb-3">Profile</h2>
              <p className="text-gray-700">Name: {user?.name || 'Guest User'}</p>
              <p className="text-gray-700 mt-2">Email: {user?.email || 'Not signed in'}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="font-semibold text-lg mb-3">Security</h2>
              <p className="text-gray-700">Change password and update your account security settings.</p>
              <button
                className="mt-4 inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
