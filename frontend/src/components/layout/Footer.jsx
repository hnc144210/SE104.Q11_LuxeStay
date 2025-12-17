import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-white pt-20 pb-10 px-4 md:px-20 border-t border-gray-100 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-16">
        {/* CỘT 1: Logo & Slogan */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold text-[#181E4B] tracking-tight">
            Luxe Stay
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Đặt kỳ nghỉ mơ ước chỉ trong vài phút, tận hưởng trọn vẹn sự tiện
            nghi và đẳng cấp dài lâu.
          </p>
        </div>

        {/* CỘT 2: Công ty */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#181E4B]">Công ty</h3>
          <ul className="space-y-4 text-gray-500 font-medium">
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Về chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Ứng dụng di động
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT 3: Liên hệ */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#181E4B]">Liên hệ</h3>
          <ul className="space-y-4 text-gray-500 font-medium">
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Trợ giúp / FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Báo chí
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Đối tác liên kết
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT 4: Khám phá */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-[#181E4B]">Khám phá</h3>
          <ul className="space-y-4 text-gray-500 font-medium">
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Ưu đãi mùa hè
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Dịch vụ đưa đón
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#DF6951] transition">
                Mẹo du lịch giá rẻ
              </a>
            </li>
          </ul>
        </div>

        {/* CỘT 5: Mạng xã hội (Social) */}
        <div className="col-span-1 md:col-span-5 lg:col-span-1 flex flex-col gap-6">
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition text-blue-600">
              <FaFacebookF size={20} />
            </button>
            <button className="w-12 h-12 rounded-full shadow-md flex items-center justify-center text-white bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 transition">
              <FaInstagram size={20} />
            </button>
            <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition text-blue-400">
              <FaTwitter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 text-sm font-medium mt-10 pt-10 border-t border-gray-100">
        Bản quyền © 2025 LuxeStay. Bảo lưu mọi quyền.
      </div>

      {/* Decor góc phải dưới (Tùy chọn) */}
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-50 rounded-full blur-3xl -z-10 opacity-50"></div>
    </footer>
  );
};

export default Footer;
 