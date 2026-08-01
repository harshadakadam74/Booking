import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowLeft, Save } from 'lucide-react';
import { updateUserProfile } from '../../services/authService';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      setFormData({
        name: parsedUser?.name || '',
        email: parsedUser?.email || '',
      });
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const updatedUser = await updateUserProfile({
        name: formData.name,
        email: formData.email,
      });

      setUser(updatedUser);
      setMessage('Profile updated successfully.');
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      setMessage(error.message || 'Unable to update your profile.');
    } finally {
      setIsSaving(false);
    }
  };

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
              <h2 className="font-semibold text-lg mb-4">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full hover:bg-blue-700 transition disabled:opacity-60"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {message && <p className="text-sm text-green-600">{message}</p>}
              </div>
            </div>
            <div className="rounded-3xl border border-gray-200 p-6 bg-gray-50">
              <h2 className="font-semibold text-lg mb-3">Security</h2>
              <p className="text-gray-700">Change password and update your account security settings.</p>
              <button
                className="mt-4 inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-full hover:bg-blue-700 transition"
              >
                Update Password
              </button>
              <div className="mt-6 rounded-xl bg-white border border-gray-200 p-4">
                <p className="text-sm text-gray-500">Current account</p>
                <p className="font-semibold text-gray-800 mt-1">{user?.name || 'Guest User'}</p>
                <p className="text-gray-600">{user?.email || 'Not signed in'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
