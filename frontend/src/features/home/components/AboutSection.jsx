import React from "react";
import { CheckCircle, Star, Award, Users } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-24 px-6 md:px-20 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* --- LEFT: IMAGE COLLAGE --- */}
        <div className="relative">
          {/* Ảnh chính (Lớn) */}
          <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200">
            <img
              src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop"
              alt="Luxury Room"
              className="w-full h-[500px] object-cover hover:scale-105 transition duration-700"
            />

            {/* Card nổi: Đánh giá */}
            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 animate-fade-in-up">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="font-bold text-gray-800 text-sm">
                4.9/5 Đánh giá xuất sắc
              </p>
              <p className="text-xs text-gray-500">Từ hơn 2000+ khách hàng</p>
            </div>
          </div>

          {/* Ảnh phụ (Nhỏ - Nằm đè lên) */}
          <div className="absolute -top-12 -right-12 z-0 hidden md:block">
            <div className="w-64 h-64 rounded-[2rem] overflow-hidden border-8 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2071&auto=format&fit=crop"
                alt="Detail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Decor: Chấm bi */}
          <div className="absolute -bottom-10 -left-10 text-[#DF6951]/20 -z-10">
            <svg
              width="100"
              height="100"
              fill="currentColor"
              viewBox="0 0 100 100"
            >
              <pattern
                id="dots"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="2" />
              </pattern>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>
        </div>

        {/* --- RIGHT: TEXT CONTENT --- */}
        <div className="space-y-8">
          <div>
            <h3 className="text-[#DF6951] font-bold uppercase tracking-widest text-sm mb-3">
              Về LuxeStay
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#181E4B] leading-tight">
              Định Nghĩa Lại <br />
              <span className="relative z-10">
                Sự Nghỉ Dưỡng
                <img
                  src="/picture/underline.png"
                  className="absolute -bottom-1 left-0 w-full -z-10 opacity-50"
                  alt=""
                />
              </span>
            </h2>
          </div>

          <p className="text-gray-500 text-lg leading-relaxed">
            Tại LuxeStay, chúng tôi không chỉ cung cấp một chốn nghỉ ngơi, mà
            mang đến một hành trình đánh thức mọi giác quan. Mỗi căn phòng là
            một tác phẩm nghệ thuật, kết hợp hoàn hảo giữa kiến trúc hiện đại và
            hơi thở thiên nhiên.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Không gian sang trọng bậc nhất",
              "Dịch vụ phòng 24/7",
              "Ẩm thực tinh hoa Á - Âu",
              "Spa & Chăm sóc sức khỏe",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="text-[#DF6951]" size={20} />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-8 pt-4 border-t border-gray-100">
            <div>
              <h4 className="text-3xl font-bold text-[#181E4B] flex items-center gap-2">
                15+ <Award className="text-yellow-500" size={24} />
              </h4>
              <p className="text-gray-500 text-sm">Năm kinh nghiệm</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-[#181E4B] flex items-center gap-2">
                500+ <Users className="text-blue-500" size={24} />
              </h4>
              <p className="text-gray-500 text-sm">Phòng cao cấp</p>
            </div>
          </div>

          <button className="bg-[#181E4B] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition hover:-translate-y-1">
            Tìm hiểu thêm về chúng tôi
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
