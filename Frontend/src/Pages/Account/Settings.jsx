import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  ArrowLeft,
  Save,
  ShieldCheck,
  Lock,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { updateUserProfile } from "../../services/authService";

const AccountSettings = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    try {
      const loggedInUser = localStorage.getItem("user");

      if (!loggedInUser) return;

      const parsedUser = JSON.parse(loggedInUser);

      setUser(parsedUser);

      setFormData({
        name: parsedUser?.name || "",
        email: parsedUser?.email || "",
      });
    } catch (error) {
      console.error("Unable to load user:", error);
    }
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setMessageType("error");
      setMessage("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setMessageType("error");
      setMessage("Please enter your email address.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const updatedUser = await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessageType("success");
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      setMessageType("error");
      setMessage(
        error?.message || "Unable to update your profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // PASSWORD
  // =====================================================

  const handleUpdatePassword = () => {
    navigate("/forgot-password");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-white to-[#FFF9EC] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() => navigate("/account")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-[#082B5C] shadow-sm transition hover:border-[#E3AE32] hover:text-[#C58A18]"
        >
          <ArrowLeft size={17} />
          Back to Account
        </button>

        {/* =================================================
            MAIN CARD
        ================================================= */}

        <div className="overflow-hidden rounded-[2rem] border border-[#E3AE32]/20 bg-white shadow-xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="relative overflow-hidden bg-gradient-to-r from-[#082B5C] via-[#0B3975] to-[#082B5C] px-6 py-8 text-white sm:px-8">

            {/* Decorative circles */}

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E3AE32]/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* Title */}

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-[#C58A18] p-4 shadow-lg">
                  <Settings
                    size={28}
                    className="text-white"
                  />
                </div>

                <div>

                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#E3AE32]">
                    <ShieldCheck size={15} />
                    Account
                  </div>

                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Account Settings
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Manage your profile and account security.
                  </p>

                </div>
              </div>

              {/* Secure badge */}

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">

                <Lock
                  size={16}
                  className="text-[#E3AE32]"
                />

                Secure Account

              </div>

            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="p-6 sm:p-8">

            <div className="grid gap-6 lg:grid-cols-2">

              {/* =================================================
                  PROFILE CARD
              ================================================= */}

              <div className="rounded-[1.75rem] border border-[#E3AE32]/20 bg-gradient-to-br from-[#F8FBFF] to-white p-6">

                <div className="mb-6 flex items-center gap-4">

                  <div className="rounded-xl bg-[#082B5C] p-3">
                    <User
                      size={22}
                      className="text-[#E3AE32]"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#082B5C]">
                      Profile Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Update your personal information.
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={handleSave}
                  className="space-y-5"
                >

                  {/* Name */}

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-[#082B5C]"
                    >
                      Full Name
                    </label>

                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                      />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSaving}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-blue-100 bg-white py-3 pl-11 pr-4 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:ring-2 focus:ring-[#E3AE32]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />

                    </div>

                  </div>

                  {/* Email */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-[#082B5C]"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C58A18]"
                      />

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSaving}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-blue-100 bg-white py-3 pl-11 pr-4 text-sm text-[#082B5C] outline-none transition placeholder:text-slate-400 focus:border-[#C58A18] focus:ring-2 focus:ring-[#E3AE32]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />

                    </div>

                  </div>

                  {/* Message */}

                  {message && (
                    <div
                      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                        messageType === "success"
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >

                      {messageType === "success" ? (
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                      )}

                      <span>{message}</span>

                    </div>
                  )}

                  {/* Save */}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#082B5C] px-6 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#C58A18] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <Save size={18} />

                    {isSaving
                      ? "Saving Changes..."
                      : "Save Changes"}

                  </button>

                </form>
              </div>

              {/* =================================================
                  SECURITY CARD
              ================================================= */}

              <div className="rounded-[1.75rem] border border-[#E3AE32]/20 bg-gradient-to-br from-[#FFF9EC] to-white p-6">

                <div className="mb-6 flex items-center gap-4">

                  <div className="rounded-xl bg-[#C58A18] p-3">
                    <ShieldCheck
                      size={22}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-[#082B5C]">
                      Security
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Protect your FastBooking account.
                    </p>
                  </div>

                </div>

                {/* Password */}

                <div className="rounded-2xl border border-[#E3AE32]/20 bg-white p-5 shadow-sm">

                  <div className="flex items-start gap-4">

                    <div className="rounded-xl bg-[#FFF4D6] p-3">
                      <KeyRound
                        size={22}
                        className="text-[#C58A18]"
                      />
                    </div>

                    <div className="flex-1">

                      <h3 className="font-semibold text-[#082B5C]">
                        Password
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Change your password regularly to keep
                        your account secure.
                      </p>

                      <button
                        type="button"
                        onClick={handleUpdatePassword}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#082B5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C58A18]"
                      >
                        <Lock size={16} />
                        Update Password
                      </button>

                    </div>

                  </div>

                </div>

                {/* Current Account */}

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

                  <div className="flex items-center gap-3">

                    <div className="rounded-full bg-white p-2 shadow-sm">
                      <User
                        size={18}
                        className="text-[#082B5C]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Current Account
                      </p>

                      <p className="mt-1 font-semibold text-[#082B5C]">
                        {user?.name || "Guest User"}
                      </p>

                      <p className="text-sm text-slate-600">
                        {user?.email || "Not signed in"}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Security Notice */}

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#E3AE32]/20 bg-white p-4">

                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-[#C58A18]"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    Never share your password or verification
                    codes with anyone. FastBooking will never
                    ask for your password through email.
                  </p>

                </div>

              </div>
            </div>

            {/* =================================================
                BOTTOM INFO
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-blue-100 bg-[#F8FBFF] p-5">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Settings
                    size={21}
                    className="text-[#C58A18]"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-[#082B5C]">
                    Keep your information up to date
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Accurate profile information helps us provide
                    a smoother booking experience.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;