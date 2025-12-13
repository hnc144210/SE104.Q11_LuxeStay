import React from "react";
import Snowfall from "react-snowfall";
import Navbar from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

// Components
import HeroSection from "./components/HeroSection";
import SearchForm from "./components/SearchForm"; // Import Search Form riêng
import AboutSection from "./components/AboutSection";
import DestinationSection from "./components/DestinationSection";
import BookingStepsSection from "./components/BookingStepsSection";
import TestimonialsSection from "./components/TestimonialsSection";

export const HomePage = () => {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden relative">
      <Navbar />

      {/* Tuyết rơi */}
      <Snowfall
        color="#dee4fd"
        snowflakeCount={200}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: 50,
          pointerEvents: "none",
        }}
      />

      <main>
        {/* 1. HERO SECTION */}
        <HeroSection />

        {/* 2. SEARCH SECTION (Floating Bar) */}
        {/* Wrapper này dùng margin âm để kéo thanh search đè lên phần dưới của Hero */}
        <div className="relative z-30 px-4 -mt-16 md:-mt-20 mb-20">
          <SearchForm />
        </div>

        {/* 3. Các Section khác */}
        <AboutSection />
        <DestinationSection />
        <BookingStepsSection />
        <TestimonialsSection />

        {/* Subscribe Section */}
        <div className="py-20 px-4 md:px-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-purple-50 rounded-tl-[80px] rounded-3xl p-10 md:p-16 relative overflow-hidden text-center shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl select-none">
              📧
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#181E4B] mb-10 leading-relaxed font-serif">
              Đăng ký để nhận thông tin, tin tức mới nhất và các ưu đãi hấp dẫn
              khác về LuxeStay.
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center max-w-xl mx-auto relative z-10">
              <input
                type="email"
                placeholder="email"
                className="p-4 rounded-xl flex-1 border border-gray-200 outline-none focus:ring-2 focus:ring-[#DF6951]"
              />
              <button className="bg-[#DF6951] text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:bg-orange-600 transition">
                Đăng kí
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
