import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-100 text-sm text-gray-700">

      {/* Footer columns */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 text-center md:text-left">

        {/* Support */}
        <div>
          <h4 className="font-bold mb-3 text-black">Support</h4>
          <ul className="space-y-2">
            <li><Link to="/trips" className="hover:underline">Manage your trips</Link></li>
            <li><Link to="/support" className="hover:underline">Contact Customer Service</Link></li>
            <li><Link to="/safety" className="hover:underline">Safety resource centre</Link></li>
          </ul>
        </div>

        {/* Discover */}
        <div>
          <h4 className="font-bold mb-3 text-black">Discover</h4>
          <ul className="space-y-2">
            <li><Link to="/genius" className="hover:underline">Genius loyalty programme</Link></li>
            <li><Link to="/deals" className="hover:underline">Seasonal and holiday deals</Link></li>
            <li><Link to="/articles" className="hover:underline">Travel articles</Link></li>
            <li><Link to="/business" className="hover:underline">Booking.com for Business</Link></li>
            <li><Link to="/awards" className="hover:underline">Traveller Review Awards</Link></li>
            <li><Link to="/agents" className="hover:underline">Booking.com for Travel Agents</Link></li>
          </ul>
        </div>

        {/* Terms */}
        <div>
          <h4 className="font-bold mb-3 text-black">Terms and settings</h4>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:underline">Privacy Notice</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
            <li><Link to="/accessibility" className="hover:underline">Accessibility Statement</Link></li>
            <li><Link to="/grievance" className="hover:underline">Grievance officer</Link></li>
            <li><Link to="/slavery" className="hover:underline">Modern Slavery Statement</Link></li>
            <li><Link to="/human-rights" className="hover:underline">Human Rights Statement</Link></li>
          </ul>
        </div>

        {/* Partners */}
        <div>
          <h4 className="font-bold mb-3 text-black">Partners</h4>
          <ul className="space-y-2">
            <li><Link to="/extranet" className="hover:underline">Extranet login</Link></li>
            <li><Link to="/partner-help" className="hover:underline">Partner help</Link></li>
            <li><Link to="/list-property" className="hover:underline">List your property</Link></li>
            <li><Link to="/affiliate" className="hover:underline">Become an affiliate</Link></li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h4 className="font-bold mb-3 text-black">About</h4>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:underline">About FastBooking</Link></li>
            <li><Link to="/how-we-work" className="hover:underline">How we work</Link></li>
            <li><Link to="/sustainability" className="hover:underline">Sustainability</Link></li>
            <li><Link to="/press" className="hover:underline">Press centre</Link></li>
            <li><Link to="/careers" className="hover:underline">Careers</Link></li>
            <li><Link to="/investors" className="hover:underline">Investor relations</Link></li>
            <li><Link to="/contact" className="hover:underline">Corporate contact</Link></li>
            <li><Link to="/content-guidelines" className="hover:underline">Content guidelines and reporting</Link></li>
          </ul>
        </div>
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
