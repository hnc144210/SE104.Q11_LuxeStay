import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { getRoomById } from "../../features/room/api/roomApi";
import { X, ChevronLeft } from "lucide-react"; // Import thêm icon X và Back

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { check_in_date, check_out_date, max_guests } = location.state || {};

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State quản lý Modal xem ảnh
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await getRoomById(id);

        if (response.success && response.data) {
          const apiData = response.data;

          // --- [LOGIC XỬ LÝ ẢNH] ---
          const DEFAULT_IMAGES = [
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
          ];

          let roomImages = [];

          if (apiData.images) {
            if (Array.isArray(apiData.images) && apiData.images.length > 0) {
              roomImages = apiData.images;
            } else if (typeof apiData.images === "string") {
              let cleanString = apiData.images
                .replace(/^\{|\}$/g, "")
                .replace(/"/g, "");
              let urls = cleanString.split(",");
              roomImages = urls
                .filter((u) => u && u.trim() !== "")
                .map((u) => u.trim());
            }
          }

          if (roomImages.length === 0) roomImages = DEFAULT_IMAGES;
          while (roomImages.length < 3) {
            roomImages.push(
              DEFAULT_IMAGES[roomImages.length % DEFAULT_IMAGES.length]
            );
          }

          // --- [TRANSFORM DATA] ---
          const formattedRoom = {
            id: apiData.id,
            title: `${apiData.room_types.name} - ${apiData.room_number}`,
            price: Number(apiData.room_types.base_price),
            description:
              apiData.note || `Phòng ${apiData.room_types.name} tiện nghi...`,
            rating: 4.8,
            reviews: 120,
            images: roomImages,
            host: {
              name: "LuxeStay Staff",
              avatar:
                "https://ui-avatars.com/api/?name=Luxe+Stay&background=0D8ABC&color=fff",
            },
            specs: {
              guests: apiData.room_types.max_guests,
              bedrooms: 1,
              beds: Math.ceil(apiData.room_types.max_guests / 2),
              baths: 1,
            },
            amenities: [
              { code: "wifi", name: "Wifi miễn phí" },
              { code: "ac", name: "Điều hòa nhiệt độ" },
              { code: "parking", name: "Bãi đỗ xe" },
              { code: "tv", name: "Smart TV" },
            ],
            status: apiData.status,
          };

          setRoom(formattedRoom);
        }
      } catch (err) {
        console.error("Lỗi tải phòng:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  const handleReserve = () => {
    navigate("/booking-confirmation", {
      state: {
        room: { id: room.id, name: room.title, price: room.price },
        check_in_date,
        check_out_date,
        max_guests: max_guests || room.specs.guests,
      },
    });
  };

  // --- RENDERING ---

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải...
      </div>
    );
  if (error || !room)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Lỗi tải dữ liệu.
      </div>
    );

  // === 1. MODAL XEM FULL ẢNH ===
  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fade-in">
        {/* Header Modal */}
        <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b flex justify-between items-center">
          <button
            onClick={() => setShowAllPhotos(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="font-bold text-gray-700">Tất cả ảnh</span>
          <button
            onClick={() => setShowAllPhotos(false)} // Nút đóng
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Modal: Grid ảnh */}
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-4 md:space-y-8 pb-20">
          {room.images.map((img, idx) => (
            <div key={idx} className="w-full">
              <img
                src={img}
                alt={`Room gallery ${idx}`}
                className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // === 2. GIAO DIỆN CHÍNH ===
  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />

      <div className="pt-24 px-4 md:px-20 pb-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#181E4B]">{room.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="font-bold text-black">★ {room.rating}</span>
            <span className="underline">({room.reviews} đánh giá)</span>
            <span>•</span>
            <span
              className={
                room.status === "available"
                  ? "text-green-600 font-bold"
                  : "text-red-500"
              }
            >
              {room.status === "available" ? "Đang trống" : "Đã kín"}
            </span>
          </div>
        </div>

        {/* Gallery Grid (Click để mở Modal) */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-10 shadow-sm relative group">
          <div
            className="col-span-2 row-span-2 cursor-pointer"
            onClick={() => setShowAllPhotos(true)}
          >
            <img
              src={room.images[0]}
              alt="Main"
              className="w-full h-full object-cover hover:opacity-95 transition"
            />
          </div>

          <div
            className="col-span-1 row-span-1 cursor-pointer hidden md:block"
            onClick={() => setShowAllPhotos(true)}
          >
            <img
              src={room.images[1]}
              alt="Sub 1"
              className="w-full h-full object-cover hover:opacity-95 transition"
            />
          </div>

          <div
            className="col-span-1 row-span-1 cursor-pointer hidden md:block"
            onClick={() => setShowAllPhotos(true)}
          >
            <img
              src={room.images[2]}
              alt="Sub 2"
              className="w-full h-full object-cover hover:opacity-95 transition"
            />
          </div>

          {/* Nút Xem tất cả ảnh */}
          <div
            onClick={() => setShowAllPhotos(true)}
            className="col-span-2 row-span-1 md:col-span-2 md:row-span-1 bg-gray-100 flex items-center justify-center text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition relative"
          >
            {/* Ảnh nền mờ cho nút xem thêm */}
            <img
              src={room.images[3] || room.images[0]}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              alt="more"
            />
            <div className="relative z-10 bg-white/80 px-4 py-2 rounded-lg shadow-sm backdrop-blur-sm border border-white/50">
              Xem tất cả {room.images.length} ảnh
            </div>
          </div>
        </div>

        {/* Layout Chi tiết & Booking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
          {/* CỘT TRÁI: THÔNG TIN */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex justify-between items-center border-b pb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Phòng quản lý bởi {room.host.name}
                </h2>
                <p className="text-gray-500">
                  {room.specs.guests} khách • {room.specs.bedrooms} phòng ngủ •{" "}
                  {room.specs.beds} giường
                </p>
              </div>
              <img
                src={room.host.avatar}
                alt="Host"
                className="w-14 h-14 rounded-full"
              />
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-bold mb-4">Mô tả</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Tiện nghi</h3>
              <div className="grid grid-cols-2 gap-4">
                {room.amenities.map((am, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <span className="text-green-500">✓</span> {am.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM ĐẶT PHÒNG */}
          <div className="relative">
            <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-bold text-[#181E4B]">
                  {room.price?.toLocaleString()} VND
                </span>
                <span className="text-gray-500"> / đêm</span>
              </div>

              <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
                <div className="flex border-b">
                  <div className="flex-1 p-3 border-r">
                    <p className="text-xs font-bold uppercase text-gray-500">
                      Check-in
                    </p>
                    <p className="text-sm font-medium">
                      {check_in_date || "---"}
                    </p>
                  </div>
                  <div className="flex-1 p-3">
                    <p className="text-xs font-bold uppercase text-gray-500">
                      Check-out
                    </p>
                    <p className="text-sm font-medium">
                      {check_out_date || "---"}
                    </p>
                  </div>
                </div>
              </div>

              {(!check_in_date || !check_out_date) && (
                <div className="mb-4 text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                  ⚠️ Vui lòng chọn ngày để đặt phòng.
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={
                  !check_in_date ||
                  !check_out_date ||
                  room.status !== "available"
                }
                className="w-full bg-[#DF6951] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {room.status === "available"
                  ? "Đặt Ngay"
                  : "Phòng Không Khả Dụng"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoomDetailsPage;
