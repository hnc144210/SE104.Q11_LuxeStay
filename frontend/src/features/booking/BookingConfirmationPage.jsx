import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import {
  createBooking,
  getCustomerDetail,
  getBookingRegulations, // <--- Import hàm mới
} from "./api/bookingApi";
import { useAuthContext } from "../../features/context/AuthContext";
import { Info, CheckCircle, Loader2 } from "lucide-react";

const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // --- 1. STATE CONFIG (Thay thế hằng số cứng) ---
  // Khởi tạo giá trị mặc định phòng hờ khi chưa load xong API
  const [config, setConfig] = useState({
    surcharge_rate: 0.25, // Mặc định 25%
    foreign_guest_surcharge_ratio: 1.5, // Mặc định 1.5x
    deposit_percentage: 50, // Mặc định 50%
    max_guests_per_room: 3, // Mặc định 3 người
  });

  const [customer, setCustomer] = useState(null);
  const [loadingData, setLoadingData] = useState(true); // Loading chung cho cả Customer và Config

  // Lấy dữ liệu từ trang trước
  const bookingData = location.state || {};
  const {
    room,
    check_in_date,
    check_out_date,
    max_guests: initialMaxGuests,
  } = bookingData;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [numGuests, setNumGuests] = useState(parseInt(initialMaxGuests) || 1);

  const [priceBreakdown, setPriceBreakdown] = useState({
    nights: 0,
    roomCharge: 0,
    surcharge: 0,
    foreignSurcharge: 0,
    totalEstimate: 0,
    depositAmount: 0,
  });

  // --- 2. FETCH DỮ LIỆU TỪ API ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Gọi song song 2 API: Lấy thông tin khách & Lấy quy định hệ thống
        const [customerRes, configRes] = await Promise.all([
          getCustomerDetail(),
          getBookingRegulations(),
        ]);

        // Xử lý Customer
        if (customerRes.success && customerRes.data) {
          setCustomer(customerRes.data);
        }

        // Xử lý Config (Map dữ liệu từ DB regulations vào State)
        if (configRes.success && configRes.data && configRes.data.regulations) {
          const reg = configRes.data.regulations; // Object { key: { value: ... } }

          setConfig({
            surcharge_rate: Number(reg.surcharge_rate?.value) || 0.25,
            foreign_guest_surcharge_ratio:
              Number(reg.foreign_guest_surcharge_ratio?.value) || 1.5,
            deposit_percentage: Number(reg.deposit_percentage?.value) || 50,
            max_guests_per_room: Number(reg.max_guests_per_room?.value) || 3,
          });
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // --- 3. TÍNH TOÁN GIÁ (Dựa trên config động) ---
  useEffect(() => {
    if (!room || !check_in_date || !check_out_date) return;

    const start = new Date(check_in_date);
    const end = new Date(check_out_date);
    const nights = Math.max(
      1,
      Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    );
    const basePrice = room.price || room.room_types?.base_price || 0;

    // A. Tiền phòng
    const roomCharge = basePrice * nights;

    // B. Phụ thu quá người (Sử dụng config.max_guests_per_room & config.surcharge_rate)
    let surcharge = 0;
    if (numGuests > config.max_guests_per_room) {
      const extraPeople = numGuests - config.max_guests_per_room;
      surcharge = basePrice * config.surcharge_rate * extraPeople * nights;
    }

    // C. Phụ thu khách nước ngoài (Sử dụng config.foreign_guest_surcharge_ratio)
    let foreignSurcharge = 0;
    const tempTotal = roomCharge + surcharge;

    // Ưu tiên lấy type từ DB, fallback
    const isForeigner = customer?.type === "foreign";

    if (isForeigner) {
      // Công thức: Tổng * (Hệ số - 1) = Phần chênh lệch thêm vào
      foreignSurcharge = tempTotal * (config.foreign_guest_surcharge_ratio - 1);
    }

    const totalEstimate = tempTotal + foreignSurcharge;

    // D. Tiền cọc (Sử dụng config.deposit_percentage)
    const depositAmount = totalEstimate * (config.deposit_percentage / 100);

    setPriceBreakdown({
      nights,
      roomCharge,
      surcharge,
      foreignSurcharge,
      totalEstimate,
      depositAmount,
    });
  }, [numGuests, customer, room, check_in_date, check_out_date, config]); // Thêm config vào dependency

  // --- 4. XỬ LÝ SUBMIT ---
  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        room_id: room.id,
        check_in_date,
        check_out_date,
        num_guests: parseInt(numGuests),
        deposit_amount: priceBreakdown.depositAmount,
        note: note,
      };

      const response = await createBooking(payload);

      if (response.success) {
        const createdBooking = response.data;
        const successState = {
          id: createdBooking.id,
          roomName: createdBooking.room?.room_type?.name || room.name,
          roomImage: room.image,
          check_in_date: createdBooking.check_in_date,
          check_out_date: createdBooking.check_out_date,
          num_guests: numGuests,
          deposit_amount: createdBooking.deposit_amount,
          total_amount: priceBreakdown.totalEstimate,
          customer_email: customer?.email || user?.email,
          note: note,
        };
        navigate("/booking-success", { state: successState });
      }
    } catch (err) {
      console.error("Booking Error:", err);
      setError(err.message || "Đặt phòng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!room)
    return (
      <div className="p-8 text-center text-red-500">Thiếu thông tin phòng.</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-5xl">
        <h1 className="text-3xl font-bold text-[#181E4B] mb-8">
          Xác nhận đặt phòng
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* === CỘT TRÁI === */}
          <div className="lg:col-span-2 space-y-6">
            {/* THÔNG TIN KHÁCH HÀNG */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                👤 Thông tin khách hàng
              </h3>

              {loadingData ? (
                <div className="flex justify-center py-4 text-blue-500 gap-2">
                  <Loader2 className="animate-spin" /> Đang tải dữ liệu...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Họ tên
                    </span>
                    <span className="font-bold text-gray-800 text-base">
                      {customer?.full_name || user?.full_name || "---"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Email
                    </span>
                    <span className="font-medium text-gray-700">
                      {customer?.email || user?.email || "---"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Số điện thoại
                    </span>
                    <span className="font-medium text-gray-700">
                      {customer?.phone_number || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 block text-xs uppercase mb-1">
                      Loại khách
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-xs inline-block ${
                        customer?.type === "foreign"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {customer?.type === "foreign"
                        ? "Quốc tế (Foreign)"
                        : "Trong nước (Domestic)"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CHI TIẾT CHUYẾN ĐI */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                ✈️ Chi tiết chuyến đi
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Nhận phòng
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {check_in_date}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">
                    Trả phòng
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {check_out_date}
                  </p>
                </div>
              </div>

              {/* Dropdown số khách */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Số lượng khách
                </label>
                <div className="relative">
                  <select
                    value={numGuests}
                    onChange={(e) => setNumGuests(parseInt(e.target.value))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
                  >
                    {[...Array(6)].map((_, i) => {
                      const val = i + 1;
                      const isExtra = val > config.max_guests_per_room; // Dùng config
                      return (
                        <option key={val} value={val}>
                          {val} người{" "}
                          {isExtra
                            ? `(Phụ thu +${config.surcharge_rate * 100}%)` // Dùng config
                            : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12} />
                  <span>
                    Tiêu chuẩn {config.max_guests_per_room} người. Khách thứ{" "}
                    {config.max_guests_per_room + 1} trở đi tính thêm phí.
                  </span>
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Yêu cầu đặc biệt..."
                />
              </div>
            </div>
          </div>

          {/* === CỘT PHẢI: BILL === */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
              <div className="mb-4">
                {room.image && (
                  <img
                    src={room.image}
                    alt="Room"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-xl text-[#181E4B] line-clamp-1">
                  {room.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {priceBreakdown.nights} đêm • {numGuests} người
                </p>
              </div>

              <div className="border-t border-dashed border-gray-300 py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Giá thuê ({priceBreakdown.nights} đêm)</span>
                  <span className="font-medium">
                    {priceBreakdown.roomCharge.toLocaleString()} đ
                  </span>
                </div>

                {priceBreakdown.surcharge > 0 && (
                  <div className="flex justify-between text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Info size={12} /> Phụ thu quá người
                    </span>
                    <span className="font-bold">
                      +{priceBreakdown.surcharge.toLocaleString()} đ
                    </span>
                  </div>
                )}

                {priceBreakdown.foreignSurcharge > 0 && (
                  <div className="flex justify-between text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                      <Info size={12} /> Phụ thu khách QT (x
                      {config.foreign_guest_surcharge_ratio})
                    </span>
                    <span className="font-bold">
                      +{priceBreakdown.foreignSurcharge.toLocaleString()} đ
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end font-bold text-xl text-blue-800 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500 font-normal pb-1">
                  Chi phí ước tính
                </span>
                <span>{priceBreakdown.totalEstimate.toLocaleString()} đ</span>
              </div>

              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-yellow-800 uppercase">
                    Tiền cọc ({config.deposit_percentage}%) {/* Dùng config */}
                  </span>
                </div>
                <div className="text-right text-lg font-extrabold text-yellow-700">
                  {priceBreakdown.depositAmount.toLocaleString()} đ
                </div>
                <p className="text-[10px] text-yellow-600 mt-1 italic text-center">
                  *Vui lòng thanh toán cọc để giữ phòng.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded mt-4 border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={submitting || loadingData}
                className="w-full mt-6 bg-[#DF6951] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:bg-gray-300 flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
