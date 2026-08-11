import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

import footerSections from "./footerLinks";

const Footer = () => {
  return (
    <footer className="bg-white">

      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-5">

        {/* Brand */}
        <div className="md:col-span-1">
          <Link
            to="/"
            className="text-2xl font-bold text-[#082B5C]"
          >
            Fast<span className="text-[#C58A18]">Booking</span>
          </Link>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Find your perfect stay with FastBooking. Book hotels quickly,
            securely, and easily from anywhere.
          </p>

          {/* Social Icons */}
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-full bg-blue-50 p-2.5 text-[#082B5C] transition duration-300 hover:bg-[#082B5C] hover:text-white"
            >
              <Facebook size={17} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full bg-blue-50 p-2.5 text-[#082B5C] transition duration-300 hover:bg-[#C58A18] hover:text-white"
            >
              <Instagram size={17} />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              className="rounded-full bg-blue-50 p-2.5 text-[#082B5C] transition duration-300 hover:bg-[#082B5C] hover:text-white"
            >
              <Twitter size={17} />
            </a>
          </div>
        </div>

        {/* Footer Columns */}
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="mb-4 font-bold text-[#082B5C]">
              {section.title}
            </h4>

            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 transition duration-300 hover:text-[#C58A18]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Contact Information */}
      <div className="border-t border-blue-100 bg-blue-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={17} className="text-[#C58A18]" />
            <span>India</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={17} className="text-[#C58A18]" />
            <span>support@fastbooking.com</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={17} className="text-[#C58A18]" />
            <span>+91 98765 43210</span>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-100">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6">

          <p className="mb-3 text-sm text-slate-500">
            FastBooking helps travelers discover and book comfortable
            stays quickly and securely.
          </p>

          <p className="text-xs text-slate-400 sm:text-sm">
            Copyright © 1996–2026{" "}
            <span className="font-semibold text-[#082B5C]">
              FastBooking™
            </span>
            . All rights reserved.
          </p>

          {/* Brand Names */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm font-semibold">

            <span className="text-[#082B5C]">
              Fast<span className="text-[#C58A18]">Booking</span>
            </span>

            <span className="text-[#082B5C]">
              priceline
            </span>

            <span className="text-[#C58A18]">
              KAYAK
            </span>

            <span className="text-slate-700">
              agoda
            </span>

            <span className="text-[#082B5C]">
              OpenTable
            </span>

          </div>

          {/* Gold Accent */}
          <div className="mx-auto mt-6 h-px max-w-xs bg-gradient-to-r from-transparent via-[#C58A18] to-transparent" />

        </div>
      </div>

    </footer>
  );
};

export default Footer;