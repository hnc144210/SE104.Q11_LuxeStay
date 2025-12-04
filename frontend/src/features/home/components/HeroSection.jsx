import React from "react";
import SearchForm from "./SearchForm"; // Import default (không dùng dấu ngoặc {})

const HeroSection = () => {
  return (
    <section
      className="relative w-full min-h-screen md:h-[90vh] flex flex-col justify-center bg-cover bg-no-repeat bg-[center_top] md:bg-right-top pt-32 md:pt-0"
      style={{
        backgroundImage: 'url("/picture/heroSection.png")',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-20 w-full flex-1 flex items-center">
        <div className="max-w-xl space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-text-dark leading-tight">
            Find your{" "}
            <div className="relative inline-block">
              <span className="relative z-10 text-primary">Comfort</span>
              <img
                src="/picture/decore.png"
                alt=""
                className="absolute -bottom-2 left-0 w-full -z-0"
              />
            </div>
            <br />
            and enjoy the
            <br />
            luxury life
          </h1>

          <p className="text-text-light text-base leading-relaxed max-w-md font-sans">
            We provide the best hotels and resorts at the most affordable
            prices. Let LuxeStay take care of your sleep so you can enjoy your
            trip.
          </p>

          <div className="pt-4">
            <button className="bg-secondary text-white px-8 py-4 rounded-[10px] shadow-xl shadow-secondary/30 hover:bg-orange-600 hover:shadow-none transition-all font-bold text-lg font-sans">
              Find out more
            </button>
          </div>
        </div>
        <SearchForm />
      </div>
    </section>
  );
};

export default HeroSection;
