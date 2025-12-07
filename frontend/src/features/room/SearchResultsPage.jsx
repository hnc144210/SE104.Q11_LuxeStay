import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";

// --- ICONS (Giữ nguyên) ---
const Icons = {
  Star: () => (
    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  User: () => (
    <svg
      className="w-4 h-4 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Moon: () => (
    <svg
      className="w-4 h-4 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  ),
  Heart: () => (
    <svg
      className="w-5 h-5 text-white hover:text-red-500 transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  MapPin: () => (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Search: () => (
    <svg
      className="w-5 h-5 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  ),
  Filter: () => (
    <svg
      className="w-4 h-4 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  ),
};

// --- SKELETON LOADING COMPONENT ---
const RoomSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-56 bg-gray-200"></div>
    <div className="p-5">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
    </div>
  </div>
);

// --- IMPROVED ROOM CARD ---
// [UPDATE 1] Thêm prop `onSelect` và gắn vào onClick button
const RoomCard = ({ room, onSelect }) => (
  <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1 z-0">
    {/* Image Section */}
    <div className="h-56 bg-gray-100 relative overflow-hidden">
      {room.image ? (
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
          <svg
            className="w-12 h-12 mb-2 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Chưa có hình ảnh</span>
        </div>
      )}

      {/* Badges & Actions */}
      <div className="absolute top-3 right-3 z-10">
        <button className="p-2 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full transition-colors">
          <Icons.Heart />
        </button>
      </div>
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {room.status === "available" ? "Còn trống" : room.status}
        </span>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center text-gray-500 text-xs mb-1 gap-1">
            <Icons.MapPin />
            <span>Trung tâm thành phố</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {room.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
          <Icons.Star />
          <span className="text-sm font-bold text-blue-800">4.8</span>
        </div>
      </div>

      {/* Amenities / Info Tags */}
      <div className="flex flex-wrap gap-2 mb-4 mt-3">
        <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
          <Icons.User /> {room.max_guests} khách
        </span>
        <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
          <Icons.Moon /> {room.nights} đêm
        </span>
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">
            Tổng giá cho {room.nights} đêm
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-gray-900">
              {room.price ? room.price.toLocaleString() : 0}
            </span>
            <span className="text-sm font-semibold text-gray-600 underline decoration-dotted">
              đ
            </span>
          </div>
        </div>
        {/* [UPDATE 2] Gắn sự kiện onClick vào nút */}
        <button
          onClick={onSelect}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200"
        >
          Chọn phòng
        </button>
      </div>
    </div>
  </div>
);

// -----------------------------------------------------------------------

const SearchResultsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      check_in_date:
        location.state?.check_in_date || query.get("check_in_date"),
      check_out_date:
        location.state?.check_out_date || query.get("check_out_date"),
      max_guests: location.state?.max_guests || query.get("max_guests"),
    };
  }, [location.state, location.search]);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      if (!searchParams.check_in_date || !searchParams.check_out_date) {
        setError("Vui lòng chọn ngày nhận và trả phòng để tìm kiếm.");
        setLoading(false);
        return;
      }

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("check_in_date", searchParams.check_in_date);
        queryParams.append("check_out_date", searchParams.check_out_date);
        if (searchParams.max_guests) {
          queryParams.append("max_guests", searchParams.max_guests);
        }

        const BASE_URL = "http://localhost:3000/api/v1";
        const apiUrl = `${BASE_URL}/rooms/availability?${queryParams.toString()}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Lỗi kết nối (${response.status})`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {}
          throw new Error(errorMessage);
        }

        const rawData = await response.json();

        let roomList = [];
        if (rawData.success && rawData.data?.all_available_rooms) {
          roomList = rawData.data.all_available_rooms.map((item) => ({
            id: item.room_id,
            name: `${item.room_type.name} - ${item.room_number}`,
            price: item.pricing.total_price,
            max_guests: item.room_type.max_guests,
            nights: item.pricing.nights,
            description: item.room_type.name,
            status: item.status,
            image:
              "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          }));
        }
        setRooms(roomList);
      } catch (err) {
        console.error("❌ Lỗi Fetch:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [searchParams]);

  // [UPDATE 3] Hàm xử lý khi chọn phòng
  const handleSelectRoom = (room) => {
    // Chuyển hướng sang trang chi tiết phòng
    // Truyền state để trang detail không phải chọn lại ngày
    navigate(`/room-details/${room.id}`, {
      state: {
        check_in_date: searchParams.check_in_date,
        check_out_date: searchParams.check_out_date,
        max_guests: searchParams.max_guests,
        roomData: room, // Truyền luôn data phòng qua để đỡ phải fetch lại (nếu muốn)
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <div className="pt-20 flex-grow flex flex-col">
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm transition-all duration-300">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kết quả tìm kiếm
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Hơn {rooms.length > 0 ? rooms.length : 0} chỗ nghỉ phù hợp với
                  bạn
                </p>
              </div>

              <div className="flex items-center bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                <div className="flex items-center px-4 py-2 bg-white rounded-md shadow-sm border border-gray-100">
                  <span className="text-sm font-medium text-gray-900 mr-2">
                    {searchParams.check_in_date}
                  </span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-sm font-medium text-gray-900 mr-4">
                    {searchParams.check_out_date}
                  </span>
                  <div className="h-4 w-px bg-gray-300 mx-2"></div>
                  <span className="text-sm text-gray-600">
                    {searchParams.max_guests} khách
                  </span>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="ml-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition"
                >
                  Thay đổi
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition whitespace-nowrap">
                <Icons.Filter /> Bộ lọc
              </button>
              <button className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 whitespace-nowrap">
                Giá thấp nhất
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                Đánh giá cao
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                Gần trung tâm
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow container mx-auto px-4 py-8 relative z-0">
          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-xl p-6 mb-8 flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">
                  Đã xảy ra lỗi
                </h3>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <RoomSkeleton key={n} />
              ))}
            </div>
          ) : (
            <>
              {!error && rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
                  <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <Icons.Search />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy phòng trống
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Rất tiếc, chúng tôi không tìm thấy phòng nào phù hợp trong
                    khoảng thời gian
                    <strong> {searchParams.check_in_date}</strong> đến{" "}
                    <strong>{searchParams.check_out_date}</strong>.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5"
                  >
                    Tìm kiếm ngày khác
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rooms.map((room, index) => (
                    // [UPDATE 4] Truyền props onSelect
                    <RoomCard
                      key={room.id || index}
                      room={room}
                      onSelect={() => handleSelectRoom(room)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
