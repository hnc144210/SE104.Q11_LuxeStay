import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { getStaffRooms, updateBooking } from "../api/staffApi"; // Tận dụng hàm lấy phòng có sẵn

const EditBookingModal = ({ booking, onClose, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);

  // State form data
  const [formData, setFormData] = useState({
    room_id: booking.room?.id || "",
    check_in_date: booking.check_in_date
      ? booking.check_in_date.split("T")[0]
      : "",
    check_out_date: booking.check_out_date
      ? booking.check_out_date.split("T")[0]
      : "",
    num_guests: booking.num_guests || 1,
    deposit_amount: booking.deposit_amount || 0,
    status: booking.status || "pending",
  });

  // Load danh sách phòng để chọn nếu muốn đổi phòng
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Lấy tất cả phòng (bao gồm cả phòng đang có khách, vì có thể đổi lịch)
        const res = await getStaffRooms();
        setRooms(res.data || []);
      } catch (err) {
        console.error("Lỗi load phòng:", err);
      }
    };
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Gọi API Update
      const res = await updateBooking(booking.id, formData);

      if (res.success) {
        alert("✅ Cập nhật thành công!");
        onUpdateSuccess(); // Reload lại danh sách bên ngoài
        onClose();
      }
    } catch (err) {
      alert("❌ Lỗi: " + (err.message || "Không thể cập nhật"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">
            Cập nhật Booking #{booking.id}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Phòng & Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng
              </label>
              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} - {r.room_types?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg font-bold outline-none ${
                  formData.status === "confirmed"
                    ? "text-green-600 bg-green-50"
                    : formData.status === "cancelled"
                    ? "text-red-600 bg-red-50"
                    : "text-yellow-600 bg-yellow-50"
                }`}
              >
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="confirmed">Đã xác nhận (Confirmed)</option>
                <option value="checked_in">Đã Check-in</option>
                <option value="cancelled">Hủy bỏ</option>
                <option value="completed">Hoàn tất</option>
              </select>
            </div>
          </div>

          {/* Ngày Check-in / Check-out */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày đến
              </label>
              <input
                type="date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày đi
              </label>
              <input
                type="date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Số khách & Tiền cọc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số khách
              </label>
              <input
                type="number"
                name="num_guests"
                min="1"
                value={formData.num_guests}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiền cọc (VNĐ)
              </label>
              <input
                type="number"
                name="deposit_amount"
                min="0"
                value={formData.deposit_amount}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg font-medium text-right"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
