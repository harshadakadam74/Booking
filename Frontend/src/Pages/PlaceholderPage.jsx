import React from "react";
import { ArrowLeft, Sparkles, Construction } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlaceholderPage = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-100/60">

          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 px-6 py-12 text-center text-white sm:px-10">
            
            {/* Decorative circles */}
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-400/10" />
            <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-blue-400/10" />

            <div className="relative">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-lg backdrop-blur">
                <Construction
                  size={38}
                  className="text-yellow-400"
                />
              </div>

              <div className="mb-3 flex items-center justify-center gap-2">
                <Sparkles
                  size={17}
                  className="text-yellow-400"
                />

                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                  FastBooking
                </span>

                <Sparkles
                  size={17}
                  className="text-yellow-400"
                />
              </div>

              <h1 className="text-3xl font-extrabold sm:text-4xl">
                {title}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                {description}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-10 text-center sm:px-10 sm:py-12">

            <div className="mx-auto max-w-2xl rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 text-blue-950">
                <Construction size={23} />
              </div>

              <h2 className="text-xl font-bold text-slate-900">
                Coming Soon
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                We're working hard to bring you the best experience.
                This page will be available soon.
              </p>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-800 hover:to-indigo-950"
            >
              <ArrowLeft size={17} />
              Go Back
            </button>

          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} FastBooking. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;