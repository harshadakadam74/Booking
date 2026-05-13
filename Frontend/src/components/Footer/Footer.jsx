import { Link } from "react-router-dom";
import footerSections from './footerLinks';

const Footer = () => {
  return (
    <footer className="bg-blue-100 text-sm text-gray-700">

      {/* Footer columns */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 text-center md:text-left">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4 className="font-bold mb-3 text-black">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="block text-gray-700 transition hover:text-blue-700 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-300 max-w-5xl mx-auto mt-10 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-gray-500">
          <p className="mb-4">
            FastBooking is part of Booking Holdings Inc., the world leader in
            online travel and related services.
          </p>
          <p className="text-xms sm:text-sm">
            Copyright © 1996–2026 FastBooking™. All rights reserved.
          </p>

          {/* Logos */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-6 font-semibold">
            <span className="text-blue-700 text-xl font-semibold ">FastBooking</span>
            <span className="text-blue-500 text-xl font-semibold">priceline</span>
            <span className="text-orange-500 font-bold">KAYAK</span>
            <span className="text-gray-800 text-xl">agoda</span>
            <span className="text-blue-600 text-xl">OpenTable</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
