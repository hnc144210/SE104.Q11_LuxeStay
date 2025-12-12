import React from "react";

const steps = [
  {
    title: "Đặt phòng",
    desc: "Chọn phòng phù hợp với nhu cầu và xác nhận đặt chỗ dễ dàng qua hệ thống.",
    icon: "🏨",
  },
  {
    title: "Check-in",
    desc: "Nhận phòng nhanh chóng với mã xác nhận và sẵn sàng cho kỳ nghỉ của bạn.",
    icon: "🔑",
  },
  {
    title: "Tận hưởng Kỳ nghỉ",
    desc: "Thư giãn và trải nghiệm những dịch vụ đẳng cấp trong suốt thời gian lưu trú.",
    icon: "✨",
  },
  {
    title: "Check-out",
    desc: "Hoàn tất thủ tục trả phòng thuận tiện và nhận hóa đơn chi tiết.",
    icon: "🚪",
  },
  {
    title: "Thanh toán",
    desc: "Thanh toán an toàn với nhiều phương thức linh hoạt và bảo mật cao.",
    icon: "💳",
  },
];

const BookingStepsSection = () => {
  return (
    <section className="py-24 px-4 md:px-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left - Steps */}
        <div>
          <h2 className="text-blue-600 font-bold uppercase tracking-widest text-lg mb-3">
            Quy Trình Đơn Giản
          </h2>

          <p className="text-gray-600 text-lg mb-12 leading-relaxed">
            Trải nghiệm đặt phòng liền mạch từ đầu đến cuối với quy trình rõ
            ràng
          </p>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-5 items-start group hover:translate-x-2 transition-transform duration-300"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br from-blue-50 to-blue-100 shadow-md group-hover:shadow-lg group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-md">
                    {idx + 1}
                  </div>
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Image Card */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Background Blur Effects */}
          <div className="absolute top-10 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

          {/* Main Card */}
          <div className="bg-white p-6 rounded-[32px] shadow-2xl max-w-sm w-full relative z-10 border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                className="w-full h-72 object-cover rounded-[24px] mb-6 shadow-lg"
                alt="Luxury Hotel"
              />
              {/* Badge on Image */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <span className="text-yellow-500 text-lg">⭐</span>
                <span className="font-bold text-gray-900 text-sm">5.0</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-gray-900 text-2xl">Deluxe Pool</h4>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span className="text-blue-600">📍</span>
                Pool đạt chuẩn 5 sao
              </p>
            </div>

            {/* Avatars - Popular */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-3 border-white overflow-hidden shadow-md">
                  <img
                    src="https://ui-avatars.com/api/?name=Alice&background=4F46E5"
                    alt="User 1"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-3 border-white overflow-hidden shadow-md">
                  <img
                    src="https://ui-avatars.com/api/?name=Bob&background=7C3AED"
                    alt="User 2"
                  />
                </div>
                <div className="w-10 h-10 rounded-full border-3 border-white overflow-hidden shadow-md">
                  <img
                    src="https://ui-avatars.com/api/?name=Charlie&background=2563EB"
                    alt="User 3"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs flex items-center justify-center border-3 border-white font-bold shadow-md">
                  125+
                </div>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Đã đặt tuần này
              </span>
            </div>
          </div>

          {/* Floating Badge - Confirmed */}
          <div className="absolute top-[55%] -right-6 lg:-right-8 bg-white p-5 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.12)] z-20 flex gap-4 items-center border border-gray-50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300 animate-[bounce_3s_infinite]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              ✓
            </div>
            <div>
              <span className="text-xs text-gray-500 block uppercase tracking-wider font-bold mb-1">
                Trạng thái
              </span>
              <h5 className="font-bold text-gray-900 text-base">Đã xác nhận</h5>
            </div>
          </div>

          {/* Floating Badge - Rating */}
          <div className="absolute bottom-[15%] -left-6 bg-white p-4 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.12)] z-20 border border-gray-50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-bold text-gray-900 text-xl">4.9</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">2.5k+ đánh giá</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingStepsSection;
