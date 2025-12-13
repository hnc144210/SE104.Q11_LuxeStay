import React, { useState } from "react";

// Mock Data - Review từ khách hàng (Đã Việt hóa)
const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thùy Linh",
    location: "Hà Nội, Vietnam",
    // Review tiếng Việt cho người Việt
    comment:
      "Dịch vụ ở đây thực sự đẳng cấp 5 sao. Phòng view biển tuyệt đẹp và nhân viên cực kỳ chu đáo. Gia đình mình đã có một kỳ nghỉ đáng nhớ!",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80", // Ảnh nữ Á Đông
  },
  {
    id: 2,
    name: "Mike Taylor",
    location: "London, UK",
    // Review tiếng Anh cho khách Tây
    comment:
      "LuxeStay provided the most comfortable bedding I've ever slept on. The service was impeccable and the view was breathtaking!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", // Ảnh nam phương Tây
  },
  {
    id: 3,
    name: "Trần Minh Tuấn",
    location: "TP. Hồ Chí Minh",
    // Review tiếng Việt
    comment:
      "Mình rất ấn tượng với quy trình đặt phòng nhanh gọn. Hồ bơi vô cực rất 'chill', đồ ăn sáng cũng rất ngon. Chắc chắn sẽ quay lại vào dịp tới.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80", // Ảnh nam Á Đông
  },
];

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 px-4 md:px-20 max-w-7xl mx-auto flex flex-col md:flex-row  md:gap-20 items-center justify-between">
      {/* --- CỘT TRÁI: TIÊU ĐỀ --- */}
      <div className="md:w-1/2 space-y-8 text-center md:text-left">
        <h3 className="text-text-light font-medium uppercase tracking-widest">
          Chứng nhận
        </h3>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-dark leading-tight">
          Nhận xét <br /> Từ khách hàng
        </h2>

        {/* Dấu chấm điều hướng (Pagination Dots) */}
        <div className="flex gap-4 justify-center md:justify-start mt-8">
          {testimonials.map((_, index) => (
            <div
              key={index}
              onClick={() => setActive(index)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                active === index ? "bg-text-dark scale-125" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* --- CỘT PHẢI: THẺ REVIEW --- */}
      <div className="md:w-1/2 w-full relative flex justify-center md:justify-start h-[300px]">
        {/* --- Card phụ (Làm nền mờ phía sau) --- */}
        <div className="absolute top-10 md:-right-6 w-[90%] md:w-full h-full bg-white border border-gray-100 rounded-[10px] shadow-sm opacity-40 scale-90 -z-10"></div>

        {/* --- Card chính (Hiển thị nội dung) --- */}
        <div className="ml-[150px] bg-white p-8 rounded-[10px] shadow-2xl relative w-[90%] md:w-full max-w-md h-fit min-h-[220px]">
          {/* Avatar bay lơ lửng (Absolute) */}
          <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md">
            <img
              src={testimonials[active].avatar}
              alt={testimonials[active].name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Nội dung review */}
          <p className=" text-base leading-relaxed mb-6 font-medium text-gray-500 italic">
            "{testimonials[active].comment}"
          </p>

          <h4 className="text-lg font-bold text-text-dark">
            {testimonials[active].name}
          </h4>
          <p className="text-sm text-text-light">
            {testimonials[active].location}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
