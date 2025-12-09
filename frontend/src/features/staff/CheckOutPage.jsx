import React, { useState, useEffect } from "react";
import {
  LogOut,
  CreditCard,
  Wallet,
  Banknote,
  User,
  Clock,
  CheckCircle,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { getActiveRentals, performCheckOut } from "./api/staffApi";
import InvoiceModal from "./components/InvoiceModal";

const CheckOutPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal Check-out
  const [selectedRental, setSelectedRental] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);

  // State hiển thị hóa đơn sau khi checkout thành công
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // 1. Fetch danh sách phòng đang thuê (Active Rentals)
  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await getActiveRentals();
      setRentals(res.data || []);
    } catch (err) {
      console.error("Lỗi tải rentals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // 2. Xử lý Check-out
  const handleCheckOut = async () => {
    if (!selectedRental) return;

    // Quan trọng: Kiểm tra ID trước khi gửi
    if (!selectedRental.id) {
      alert("Lỗi: Không tìm thấy Rental ID.");
      return;
    }

    try {
      setProcessing(true);

      // Gọi API Check-out
      const res = await performCheckOut({
        rental_id: selectedRental.id, // ID của bảng Rentals
        payment_method: paymentMethod,
      });

      // Thành công -> Lưu hóa đơn để hiển thị Modal Invoice
      setCreatedInvoice(res.data.invoice);

      // Đóng modal chọn thanh toán
      setSelectedRental(null);

      // Reload lại danh sách phòng
      fetchRentals();
    } catch (err) {
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  // Helper tính ngày
  const calculateDays = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    // Tính chênh lệch milliseconds -> ngày
    let diffDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
    return diffDays < 1 ? 1 : diffDays; // Tối thiểu 1 ngày
  };

  // Filter tìm kiếm theo tên khách hoặc số phòng
  const filteredRentals = rentals.filter((r) => {
    const term = searchTerm.toLowerCase();
    const roomNum = r.rooms?.room_number || "";
    // Lấy tên khách chính (is_primary = true)
    // Lưu ý: Tùy vào API trả về rental_guests là mảng hay object
    const guestName =
      r.rental_guests?.[0]?.customers?.full_name?.toLowerCase() || "";

    return roomNum.includes(term) || guestName.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Trả Phòng (Check-Out)
        </h1>

        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            placeholder="Tìm phòng, khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Danh sách phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-10">
            <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-500">Đang tải danh sách phòng...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm border-dashed">
            <LogOut size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">
              Không có phòng nào đang sử dụng.
            </p>
          </div>
        ) : (
          filteredRentals.map((item) => {
            const guestName =
              item.rental_guests?.[0]?.customers?.full_name || "Khách lẻ";
            const days = calculateDays(item.start_date);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Phòng
                    </span>
                    <h3 className="text-3xl font-bold text-blue-600 mt-1">
                      {item.rooms?.room_number}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {item.rooms?.room_types?.name}
                    </p>
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                    Active
                  </div>
                </div>

                <div className="space-y-3 mb-6 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-800">{guestName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span>
                      Thời gian: <strong>{days} đêm</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Banknote size={16} className="text-gray-400" />
                    <span>
                      Giá: {item.price_at_rental?.toLocaleString()} đ/đêm
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRental(item)}
                  className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition flex justify-center items-center gap-2 group-hover:shadow-lg group-hover:shadow-red-100"
                >
                  <LogOut size={18} /> Thủ tục Trả phòng
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL CHECK-OUT (Chọn phương thức thanh toán) */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  Xác nhận Thanh toán
                </h3>
                <p className="text-sm text-gray-500">
                  Phòng {selectedRental.rooms?.room_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Thông tin tóm tắt */}
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-900 border border-blue-100">
                <p>
                  Khách hàng:{" "}
                  <strong>
                    {selectedRental.rental_guests?.[0]?.customers?.full_name}
                  </strong>
                </p>
                <p>
                  Check-in:{" "}
                  {new Date(selectedRental.start_date).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>

              {/* Chọn phương thức thanh toán */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <PaymentOption
                    icon={Banknote}
                    label="Tiền mặt"
                    value="cash"
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                  <PaymentOption
                    icon={CreditCard}
                    label="Thẻ"
                    value="credit_card"
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                  <PaymentOption
                    icon={Wallet}
                    label="Chuyển khoản"
                    value="transfer"
                    selected={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                </div>
              </div>

              {/* Cảnh báo */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedRental(null)}
                  disabled={processing}
                  className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {processing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  {processing ? "Đang xử lý..." : "Thanh toán"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HÓA ĐƠN (Hiện sau khi thanh toán xong) */}
      {createdInvoice && (
        <InvoiceModal
          invoiceData={createdInvoice}
          onClose={() => setCreatedInvoice(null)}
        />
      )}
    </div>
  );
};

// Component con: Nút chọn phương thức thanh toán
const PaymentOption = ({ icon: Icon, label, value, selected, onSelect }) => (
  <button
    onClick={() => onSelect(value)}
    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${
      selected === value
        ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm"
        : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
    }`}
  >
    <Icon size={24} className="mb-1" />
    <span className="text-xs">{label}</span>
  </button>
);

export default CheckOutPage;
