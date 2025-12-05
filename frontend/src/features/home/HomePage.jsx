import React from "react";
import Snowfall from "react-snowfall";
import Navbar from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

// Import các section con
import HeroSection from "./components/HeroSection";
import ServiceSection from "./components/ServiceSection";
import DestinationSection from "./components/DestinationSection";
import BookingStepsSection from "./components/BookingStepsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import { Search } from "lucide-react";

export const HomePage = () => {
  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden relative">
      <Navbar />

      {/* Hiệu ứng tuyết rơi */}
      <Snowfall
        color="#dee4fd"
        snowflakeCount={250}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          zIndex: 50, // Giảm zIndex xuống để không che mất Navbar (z-50)
          pointerEvents: "none",
        }}
      />

      <main>
        {/* 👇 Thanh Search sẽ nằm trong component này */}
        <HeroSection />

        <ServiceSection />
        <DestinationSection />
        <BookingStepsSection />
        <TestimonialsSection />

        {/* Subscribe Section */}
        <div className="py-20 px-4 md:px-20 max-w-7xl mx-auto relative z-10">
          <div className="bg-purple-50 rounded-tl-[80px] rounded-3xl p-16 relative overflow-hidden text-center shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl select-none">
              📧
            </div>
            <h2 className="text-3xl font-bold text-[#181E4B] mb-10 leading-relaxed text-center px-4 font-serif">
              Subscribe to get information, latest news and other
              <br />
              interesting offers about LuxeStay
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center max-w-xl mx-auto relative z-10">
              <input
                type="email"
                placeholder="Your email"
                className="p-4 rounded-xl flex-1 border border-gray-200 outline-none focus:ring-2 focus:ring-[#DF6951]"
              />
              <button className="bg-[#DF6951] text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:bg-orange-600 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
