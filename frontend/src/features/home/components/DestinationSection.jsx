import React from "react";

// Mock Data - Đổi sang thông tin Phòng/Khách sạn
const destinations = [
  {
    name: "Dalat Edensee Resort", // Tên cụ thể
    location: "Da Lat, Viet Nam",
    price: "$150/night",
    rating: "4.8 ⭐",
    img: "https://i.pinimg.com/1200x/a9/6c/8c/a96c8cc6ffe91e4f1e81820d18e27a63.jpg",
  },
  {
    name: "The Londoner Hotel",
    location: "Vung Tau, Viet Nam",
    price: "$320/night",
    rating: "4.9 ⭐",
    img: "https://i.pinimg.com/1200x/6c/c2/4a/6cc24ad4c8f1bb9acb39267e53af0acc.jpg",
  },
  {
    name: "Amalfi Coast Villa",
    location: "Nha Trang, Viet Nam",
    price: "$450/night",
    rating: "5.0 ⭐",
    img: "https://i.pinimg.com/1200x/f5/e1/30/f5e1304d987a678e22ed69430fc26a81.jpg",
  },
];

const DestinationSection = () => {
  return (
    <section className="py-10 px-4 md:px-20 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-text-light font-medium uppercase">Top Rated</h3>
        <h2 className="text-4xl font-serif font-bold text-text-dark">
          Popular Stays
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {destinations.map((place, index) => (
          <div
            key={index}
            className="bg-white rounded-[24px] shadow-lg overflow-hidden hover:shadow-2xl transition group cursor-pointer"
          >
            <div className="h-80 overflow-hidden relative">
              <img
                src={place.img}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
              {/* Thêm tag 'Hot' hoặc 'Sale' nếu thích */}
              <div className="absolute top-4 right-4 bg-white text-text-dark font-bold px-3 py-1 rounded-full text-xs shadow-md">
                Popular
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-2 text-text-dark">
                <h3 className="font-bold text-lg">{place.name}</h3>
                <span className="text-primary font-bold">{place.price}</span>
              </div>

              <div className="flex items-center gap-2 text-text-light text-sm mb-4">
                <span>📍</span> {place.location}
              </div>

              <div className="flex justify-between items-center text-text-light text-sm pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span>🛋️</span> <span>2 Guests</span>
                </div>
                <div className="flex items-center gap-1 text-orange-500 font-bold">
                  <span>★</span> <span>{place.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DestinationSection;
