import React, { useState } from "react";
import { Briefcase, Heart, Users, User, Mountain, Coffee } from "lucide-react";

const CheckBox_travelling = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const options = [
    { id: "work", label: "Work", icon: Briefcase },
    { id: "leisure", label: "Leisure", icon: Coffee },
    { id: "family", label: "Family", icon: Users },
    { id: "solo", label: "Solo Travel", icon: User },
    { id: "adventure", label: "Adventure", icon: Mountain },
    { id: "relaxation", label: "Relaxation", icon: Heart },
  ];

  const handleCheckboxChange = (optionId) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-md">

      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-bold text-[#082B5C]">
          Travel Purpose
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Select what best describes your trip
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOptions.includes(option.id);

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                isSelected
                  ? "border-[#C58A18] bg-[#FFF8E7] shadow-sm"
                  : "border-blue-100 bg-blue-50 hover:border-[#C58A18] hover:bg-[#FFF8E7]"
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(option.id)}
                className="h-4 w-4 cursor-pointer accent-[#082B5C]"
              />

              {/* Icon */}
              <div
                className={`rounded-lg p-2 ${
                  isSelected
                    ? "bg-[#082B5C] text-[#E3AE32]"
                    : "bg-white text-[#082B5C]"
                }`}
              >
                <Icon size={17} />
              </div>

              {/* Label */}
              <span
                className={`text-sm font-semibold ${
                  isSelected
                    ? "text-[#082B5C]"
                    : "text-slate-700"
                }`}
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Selected Options */}
      {selectedOptions.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#E3AE32]/40 bg-[#FFF8E7] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#C58A18]">
            Selected Travel Purpose
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {selectedOptions.map((id) => {
              const option = options.find((item) => item.id === id);

              return (
                <span
                  key={id}
                  className="rounded-full bg-[#082B5C] px-3 py-1 text-xs font-semibold text-white"
                >
                  {option?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Gold Accent */}
      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />
    </div>
  );
};

export default CheckBox_travelling;