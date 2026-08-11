import React from "react";
import {
  Check,
  Circle,
  CalendarCheck,
  Clock,
} from "lucide-react";

const timeline = [
  {
    label: "Booked",
    active: true,
  },
  {
    label: "Confirmed",
    active: true,
  },
  {
    label: "Checked In",
    active: false,
  },
  {
    label: "Completed",
    active: false,
  },
];

const BookingTimeline = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-md">

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-blue-50 p-3">
          <CalendarCheck
            size={22}
            className="text-[#082B5C]"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#082B5C]">
            Booking Timeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your booking progress
          </p>
        </div>

      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-0">

        {timeline.map((step, index) => (
          <div
            key={step.label}
            className="relative flex md:flex-1 md:flex-col md:items-center"
          >

            {/* Desktop connector */}
            {index < timeline.length - 1 && (
              <div
                className={`absolute left-1/2 top-5 hidden h-0.5 w-full md:block ${
                  timeline[index + 1].active
                    ? "bg-[#C58A18]"
                    : "bg-blue-100"
                }`}
              />
            )}

            {/* Mobile connector */}
            {index < timeline.length - 1 && (
              <div
                className={`absolute left-5 top-10 h-full w-0.5 md:hidden ${
                  timeline[index + 1].active
                    ? "bg-[#C58A18]"
                    : "bg-blue-100"
                }`}
              />
            )}

            {/* Step */}
            <div className="relative z-10 flex items-center gap-4 md:flex-col md:gap-3">

              {/* Circle */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 ${
                  step.active
                    ? "border-[#C58A18] bg-[#082B5C] text-white"
                    : "border-blue-200 bg-white text-slate-400"
                }`}
              >
                {step.active ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <Circle size={15} />
                )}
              </div>

              {/* Label */}
              <div className="md:text-center">

                <p
                  className={`text-sm font-semibold ${
                    step.active
                      ? "text-[#082B5C]"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </p>

                <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                  {step.active ? "Completed" : "Upcoming"}
                </p>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* Current Status */}
      <div className="mt-7 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

        <div className="rounded-full bg-white p-2 shadow-sm">
          <Clock
            size={17}
            className="text-[#C58A18]"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#082B5C]">
            Current Status
          </p>

          <p className="text-xs text-slate-500">
            Your booking has been confirmed successfully.
          </p>
        </div>

      </div>

      {/* Gold Divider */}
      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

    </div>
  );
};

export default BookingTimeline;