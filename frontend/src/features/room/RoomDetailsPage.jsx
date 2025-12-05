import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getRoomById } from "./api/roomApi";

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy thông tin ngày tháng từ trang Search (nếu có)
  const { check_in_date, check_out_date, max_guests } = location.state || {};

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        // Gọi API Backend lấy dữ liệu thật
        const response = await getRoomById(id);

        if (response.success && response.data) {
          const apiData = response.data;

          // Transform dữ liệu từ DB thành format UI cần
          // Lưu ý: Do DB chưa có cột description/image, ta sẽ tự sinh dựa trên loại phòng
          const formattedRoom = {
            id: apiData.id,
            title: `${apiData.room_types.name} - ${apiData.room_number}`,
            // Giá gốc từ DB
            price: Number(apiData.room_types.base_price),
            description:
              apiData.note ||
              `Trải nghiệm kỳ nghỉ tuyệt vời tại phòng ${apiData.room_types.name}. Phòng được trang bị đầy đủ tiện nghi, không gian thoáng mát, phù hợp cho ${apiData.room_types.max_guests} người.`,
            rating: 4.8, // Hardcode vì DB chưa có bảng review
            reviews: 120,
            // Hardcode ảnh vì DB chưa có bảng images
            images: [
              "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
              "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
            ],
            host: {
              name: "LuxeStay Staff",
              avatar: "https://ui-avatars.com/api/?name=Luxe+Stay",
            },
            specs: {
              guests: apiData.room_types.max_guests,
              bedrooms: 1, // Mặc định
              beds: Math.ceil(apiData.room_types.max_guests / 2), // Tự tính toán số giường
              baths: 1,
            },
            amenities: [
              { code: "wifi", name: "Wifi miễn phí" },
              { code: "ac", name: "Điều hòa nhiệt độ" },
              { code: "parking", name: "Bãi đỗ xe" },
            ],
            safety: [{ code: "fire_ext", name: "Bình chữa cháy" }],
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
    // Chuyển sang trang Booking Confirmation với dữ liệu thật
    navigate("/booking-confirmation", {
      state: {
        room: {
          id: room.id,
          name: room.title,
          price: room.price, // Giá lấy từ DB
        },
        check_in_date,
        check_out_date,
        max_guests: max_guests || room.specs.guests, // Nếu user chưa chọn khách thì lấy max của phòng
      },
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải thông tin phòng...</div>
      </div>
    );

  if (error || !room)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">
          Không tìm thấy phòng hoặc có lỗi xảy ra.
        </div>
      </div>
    );

  return (
    <div className="bg-white min-h-screen font-sans pt-20 px-4 md:px-20 pb-10">
      <Navbar />
      {/* 1. Header & Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#181E4B]">{room.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <span className="font-bold text-black flex items-center gap-1">
            ★ {room.rating}
          </span>
          <span className="underline">({room.reviews} reviews)</span>
          <span>•</span>
          <span>
            Status: {room.status === "available" ? "available" : "busy"}
          </span>
        </div>
      </div>

      {/* 2. Gallery (Hiển thị ảnh) */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10">
        <div className="col-span-2 row-span-2 cursor-pointer">
          <img
            src={room.images[0]}
            alt="Main"
            className="w-full h-full object-cover hover:opacity-95 transition"
          />
        </div>
        <div className="col-span-1 row-span-1">
          <img
            src={room.images[1]}
            alt="Sub 1"
            className="w-full h-full object-cover hover:opacity-95 transition"
          />
        </div>
        <div className="col-span-1 row-span-1">
          <img
            src={room.images[2]}
            alt="Sub 2"
            className="w-full h-full object-cover hover:opacity-95 transition"
          />
        </div>
        <div className="col-span-2 row-span-1 bg-gray-100 flex items-center justify-center text-gray-500">
          Xem thêm ảnh
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
        {/* LEFT COLUMN: Thông tin chi tiết */}
        <div className="md:col-span-2 space-y-8">
          {/* Host Info */}
          <div className="flex justify-between items-center border-b pb-6">
            <div>
              <h2 className="text-xl font-bold">
                Phòng quản lý bởi {room.host.name}
              </h2>
              <p className="text-gray-500">
                {room.specs.guests} khách • {room.specs.bedrooms} phòng ngủ •{" "}
                {room.specs.beds} giường • {room.specs.baths} phòng tắm
              </p>
            </div>
            <img
              src={room.host.avatar}
              alt="Host"
              className="w-12 h-12 rounded-full"
            />
          </div>

          {/* Description */}
          <div className="border-b pb-6">
            <h3 className="text-xl font-bold mb-4">Mô tả</h3>
            <p className="text-gray-600 leading-relaxed">{room.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tiện nghi</h3>
            <div className="grid grid-cols-2 gap-4">
              {room.amenities.map((am, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-gray-600"
                >
                  ✓ {am.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING CARD */}
        <div className="relative">
          <div className="sticky top-28 bg-white border shadow-xl rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-2xl font-bold text-[#181E4B]">
                  {room.price?.toLocaleString()} VND
                </span>
                <span className="text-gray-500"> / đêm</span>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Nhận phòng:</span>
                <span className={!check_in_date ? "text-red-500" : ""}>
                  {check_in_date || "Chưa chọn"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Trả phòng:</span>
                <span className={!check_out_date ? "text-red-500" : ""}>
                  {check_out_date || "Chưa chọn"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Khách:</span>
                <span>{max_guests || room.specs.guests} người</span>
              </div>
            </div>

            {/* Nếu user vào thẳng link mà chưa có ngày, yêu cầu quay lại tìm kiếm */}
            {(!check_in_date || !check_out_date) && (
              <div className="mb-4 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                Vui lòng chọn ngày để đặt phòng.
              </div>
            )}

            <button
              onClick={handleReserve}
              disabled={
                !check_in_date || !check_out_date || room.status !== "available"
              }
              className="w-full bg-[#DF6951] text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {room.status === "available"
                ? "Đặt ngay"
                : "Phòng không khả dụng"}
            </button>

            {!check_in_date && (
              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 text-blue-600 text-sm hover:underline"
              >
                Quay lại tìm kiếm
              </button>
            )}

            <div className="mt-4 text-center text-xs text-gray-500">
              Bạn chưa bị trừ tiền ở bước này.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoomDetailsPage;
