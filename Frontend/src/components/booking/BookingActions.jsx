import React from "react";
import {
  Download,
  PenSquare,
  Ban,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

const BookingActions = ({
  onDownloadReceipt,
  onModifyBooking,
  onCancelBooking,
  onContactHotel,
  onRebook,
  isCancelled = false,
}) => {
  const actions = [
    {
      label: "Download Receipt",
      icon: Download,
      onClick: onDownloadReceipt,
    },
    {
      label: "Modify Booking",
      icon: PenSquare,
      onClick: onModifyBooking,
    },
    {
      label: "Cancel Booking",
      icon: Ban,
      onClick: onCancelBooking,
      disabled: isCancelled,
    },
    {
      label: "Contact Hotel",
      icon: MessageCircle,
      onClick: onContactHotel,
    },
    {
      label: "Rebook",
      icon: RotateCcw,
      onClick: onRebook,
    },
  ];

  return (
    <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Heading */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#082B5C]">
            Booking Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your booking quickly and easily
          </p>
        </div>

        {/* Gold accent */}
        <div className="h-10 w-1 rounded-full bg-[#C58A18]" />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {actions.map(
          ({ label, icon: Icon, onClick, disabled = false }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              className={`
                group
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-4
                py-3
                text-sm
                font-semibold
                transition-all
                duration-300

                ${
                  disabled
                    ? `
                      cursor-not-allowed
                      border-gray-200
                      bg-gray-100
                      text-gray-400
                    `
                    : `
                      border-blue-100
                      bg-blue-50
                      text-[#082B5C]

                      hover:-translate-y-0.5
                      hover:border-[#C58A18]
                      hover:bg-[#082B5C]
                      hover:text-white
                      hover:shadow-lg
                    `
                }
              `}
            >
              <Icon
                size={18}
                className={`
                  transition-colors duration-300
                  ${
                    disabled
                      ? "text-gray-400"
                      : "text-[#C58A18] group-hover:text-[#E3AE32]"
                  }
                `}
              />

              <span>{label}</span>
            </button>
          )
        )}

      </div>

      {/* Bottom Gold Line */}
      <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default BookingActions;