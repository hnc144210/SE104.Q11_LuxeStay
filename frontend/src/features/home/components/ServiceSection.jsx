import React from "react";

// Mock Data - Đổi sang dịch vụ khách sạn
const services = [
  {
    title: "Best Price",
    desc: "Ensure you get the best rates for your luxury stays without hidden fees.",
    icon: "💎", // Icon kim cương thể hiện sự cao cấp/giá trị
  },
  {
    title: "Easy Booking",
    desc: "Quick and secure reservation process with instant confirmation.",
    icon: "✅", // Icon check thể hiện sự nhanh chóng
    active: false, // Item này đang được highlight
  },
  {
    title: "Luxury Amenities",
    desc: "Enjoy world-class swimming pools, spas, and fine dining restaurants.",
    icon: "🍷", // Icon ly rượu thể hiện sự hưởng thụ
  },
  {
    title: "24/7 Support",
    desc: "Our concierge team is always available to assist with your needs.",
    icon: "🎧", // Icon tai nghe hỗ trợ
  },
];

const ServiceSection = () => {
  return (
    <section className="py-20 text-center px-4 md:px-20 max-w-7xl mx-auto">
      <h3 className="text-text-light font-medium uppercase tracking-widest">
        Facilities
      </h3>
      <h2 className="text-4xl font-serif font-bold text-text-dark mb-12">
        We Offer Best Services
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {services.map((item, index) => (
          <div
            key={index}
            className={`p-8 rounded-[30px] hover:shadow-2xl transition duration-300 cursor-pointer ${
              item.active
                ? "bg-white shadow-xl"
                : "bg-transparent group hover:bg-white"
            }`}
          >
            <div className="text-4xl mb-6">{item.icon}</div>
            <h4 className="text-xl font-bold text-text-dark mb-3">
              {item.title}
            </h4>
            <p className="text-text-light text-sm leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceSection;
