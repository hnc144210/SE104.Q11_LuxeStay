import e from "cors";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 px-4 md:px-20 border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
        {/* CỘT 1: Logo & Slogan */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-text-dark tracking-tight">
            Luxe Stay
          </h2>
          <p className="text-text-light text-sm leading-relaxed max-w-xs">
            Book your trip in minute, get full Control for much longer.
          </p>
        </div>

        {/* CỘT 2: Company */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text-dark">Company</h3>
          <ul className="space-y-4 text-text-light font-medium">
            <li>
              <a href="#" className="hover:text-primary transition">
                About
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Mobile
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT 3: Contact */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text-dark">Contact</h3>
          <ul className="space-y-4 text-text-light font-medium">
            <li>
              <a href="#" className="hover:text-primary transition">
                Help/FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Press
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Affiliates
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT 4: More */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text-dark">More</h3>
          <ul className="space-y-4 text-text-light font-medium">
            <li>
              <a href="#" className="hover:text-primary transition">
                Airlinefees
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Airline
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-primary transition">
                Low fare tips
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT 5: Social & App (Dành cho phần icon bên phải) */}
        <div className="col-span-1 md:col-span-5 lg:col-span-1 flex flex-col gap-6">
          {/* Social Icons */}
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition text-black">
              <FaFacebookF size={20} />
            </button>
            <button className="w-12 h-12 rounded-full shadow-md flex items-center justify-center text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 transition">
              <FaInstagram size={20} />
            </button>
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition text-black">
              <FaTwitter size={20} />
            </button>
          </div>

          {/* App Store Buttons */}
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-text-light text-sm font-medium mt-10">
        All rights reserved@luxestay.com
      </div>

      {/* Decorative Plus Signs (Optional - Giống ảnh mẫu góc phải trên) */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none hidden md:block">
        {/* Bạn có thể thêm file ảnh decor vào đây nếu muốn */}
      </div>
    </footer>
  );
};
export default Footer;
