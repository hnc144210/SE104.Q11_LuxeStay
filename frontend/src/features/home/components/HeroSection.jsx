import React from "react";
import SearchForm from "./SearchForm"; // Import default

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
            Tìm kiếm sự{" "}
            <div className="relative inline-block">
              <span className="relative z-10 text-primary">Tiện nghi</span>
              <img
                src="/picture/decore.png"
                alt=""
                className="absolute -bottom-2 left-0 w-full -z-0"
              />
            </div>
            <br />
            và tận hưởng
            <br />
            đẳng cấp thượng lưu
          </h1>

          <p className="text-text-light text-base leading-relaxed max-w-md font-sans">
            Chúng tôi mang đến những khách sạn và khu nghỉ dưỡng đẳng cấp với
            mức giá tốt nhất. Hãy để LuxeStay nâng niu giấc ngủ, giúp bạn tận
            hưởng trọn vẹn từng khoảnh khắc của chuyến đi.
          </p>

          <div className="pt-4">
            <button className="bg-secondary text-white px-8 py-4 rounded-[10px] shadow-xl shadow-secondary/30 hover:bg-orange-600 hover:shadow-none transition-all font-bold text-lg font-sans">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
