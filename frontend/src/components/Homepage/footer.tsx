import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-16 bg-blue-900 text-white border-t border-blue-700 overflow-hidden">
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-blue-400 to-purple-500" />

      <div className="relative max-w-5xl mx-auto px-6 py-10 text-center space-y-5 sm:space-y-6">
        {/* Title */}
        <h4 className="text-xl sm:text-2xl font-bold text-white">
          Contact Us
        </h4>

        {/* Address */}
        <p className="flex items-center justify-center text-xs sm:text-sm text-blue-200 gap-2 max-w-md mx-auto">
          <MapPin className="h-4 w-4 text-indigo-300 flex-shrink-0" />
          A. Mabini Ave, Barangay Sambat, Tanauan City, Batangas 4232, Philippines
        </p>

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-blue-200 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-indigo-300 flex-shrink-0" />
            <span>(043) 773-8927 | 0920-803-0527</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-indigo-300 flex-shrink-0" />
            <a
              href="mailto:inquiry@nst.edu.ph"
              className="hover:text-white hover:underline transition break-all"
            >
              inquiry@nst.edu.ph
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto my-4 w-20 h-[2px] bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full" />

        {/* Footer Text */}
        <p className="text-[10px] sm:text-xs text-blue-200">
          © 2025 <span className="font-semibold text-white">Nova Schola Student Hub</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
