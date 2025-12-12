import React, { useEffect, useState } from "react";
import { getFeaturedRooms } from "../api/homeApi";
import {
  Star,
  MapPin,
  Users,
  BedDouble,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DestinationSection = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getFeaturedRooms();
        if (res.success && Array.isArray(res.data)) {
          // Chỉ lấy 3 phòng đầu tiên để hiển thị
          setRooms(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // --- 2. HELPER XỬ LÝ ẢNH ---
  const getDisplayImage = (imgData) => {
    const DEFAULT_IMG =
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop";

    if (!imgData) return DEFAULT_IMG;

    // Nếu là mảng JS
    if (Array.isArray(imgData)) return imgData[0] || DEFAULT_IMG;

    // Nếu là chuỗi Postgres "{url,url}"
    if (typeof imgData === "string") {
      const clean = imgData.replace(/^\{|\}$/g, "").replace(/"/g, "");
      const urls = clean.split(",");
      return urls[0] && urls[0].trim() ? urls[0].trim() : DEFAULT_IMG;
    }

    return DEFAULT_IMG;
  };

  // --- 3. RENDER ---
  return (
    <section className="py-20 px-4 md:px-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h3 className="text-[#DF6951] font-bold uppercase tracking-widest text-sm mb-2">
            Điểm Đến Hàng Đầu
          </h3>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#181E4B]">
            Phòng Được Yêu Thích Nhất
          </h2>
        </div>
        <button
          onClick={() => navigate("/search-results")}
          className="hidden md:flex items-center gap-2 text-gray-500 hover:text-[#DF6951] transition font-medium"
        ></button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading
          ? // Skeleton Loading
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden h-[450px] animate-pulse"
              >
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))
          : rooms.map((room) => {
              const imageUrl = getDisplayImage(room.images);
              const price = Number(
                room.room_types?.base_price || 0
              ).toLocaleString();
              const rating = (4.5 + Math.random() * 0.5).toFixed(1); // Fake rating cho đẹp

              return (
                <div
                  key={room.id}
                  onClick={() => navigate(`/room-details/${room.id}`)}
                  className="group bg-white rounded-[24px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Image Area */}
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={imageUrl}
                      alt={room.room_number}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#181E4B] font-bold px-3 py-1 rounded-full text-xs shadow-md flex items-center gap-1">
                      <Star
                        size={12}
                        className="text-yellow-500 fill-yellow-500"
                      />
                      {rating}
                    </div>
                    <div className="absolute top-4 left-4 bg-[#DF6951] text-white font-bold px-3 py-1 rounded-full text-xs shadow-md">
                      Phổ biến
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-[#181E4B] line-clamp-1">
                          {room.room_types?.name} - {room.room_number}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                          <MapPin size={14} />
                          <span>Trung tâm thành phố</span>
                        </div>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="flex items-center gap-4 my-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Users size={16} className="text-[#DF6951]" />
                        <span>{room.room_types?.max_guests} Khách</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BedDouble size={16} className="text-[#DF6951]" />
                        <span>1 Giường lớn</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-auto flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-[#181E4B]">
                          {price}
                        </span>
                        <span className="text-sm text-gray-400 font-medium">
                          {" "}
                          ₫/đêm
                        </span>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#DF6951] group-hover:text-white transition-colors">
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Mobile View All Button */}
      <div className="mt-8 text-center md:hidden">
        <button
          onClick={() => navigate("/search-results")}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition w-full"
        >
          Xem tất cả phòng
        </button>
      </div>
    </section>
  );
};

export default DestinationSection;
