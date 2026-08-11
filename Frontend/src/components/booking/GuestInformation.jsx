import React from "react";
import { User, Mail, Phone, Contact } from "lucide-react";

const GuestInformation = ({ booking }) => {
  const name = booking?.guestName || "Guest User";
  const email = booking?.guestEmail || "guest@example.com";
  const phone = booking?.guestPhone || "+91 98765 43210";

  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-md">

      {/* Header */}
      <div className="relative bg-[#082B5C] px-6 py-5">
        
        {/* Gold Accent */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-[#C58A18]" />

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <Contact
              size={22}
              className="text-[#E3AE32]"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Guest Information
            </h2>

            <p className="mt-1 text-sm text-blue-100">
              Guest details for this booking
            </p>
          </div>
        </div>
      </div>

      {/* Guest Details */}
      <div className="space-y-4 p-6">

        {/* Guest Name */}
        <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:border-[#C58A18] hover:shadow-sm">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <User
              size={20}
              className="text-[#082B5C]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Guest Name
            </p>

            <p className="mt-1 truncate font-semibold text-[#082B5C]">
              {name}
            </p>
          </div>

        </div>

        {/* Email */}
        <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:border-[#C58A18] hover:shadow-sm">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Mail
              size={20}
              className="text-[#C58A18]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email
            </p>

            <a
              href={`mailto:${email}`}
              className="mt-1 block truncate font-semibold text-[#082B5C] transition hover:text-[#C58A18]"
            >
              {email}
            </a>
          </div>

        </div>

        {/* Phone */}
        <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 transition duration-300 hover:border-[#C58A18] hover:shadow-sm">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Phone
              size={20}
              className="text-[#082B5C]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Phone
            </p>

            <a
              href={`tel:${phone}`}
              className="mt-1 block font-semibold text-[#082B5C] transition hover:text-[#C58A18]"
            >
              {phone}
            </a>
          </div>

        </div>

      </div>

      {/* Bottom Gold Line */}
      <div className="mx-6 mb-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default GuestInformation;