import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Calendar,
  Clock,
  Coffee,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getRentalById, extendRental } from "../api/staffApi";

const RentalDetailModal = ({ rentalId, onClose, onUpdateSuccess }) => {
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho chức năng Gia hạn
  const [isExtending, setIsExtending] = useState(false);
  const [newEndDate, setNewEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  // 1. Load dữ liệu chi tiết
  const fetchRentalDetails = async () => {
    try {
      setLoading(true);
      const res = await getRentalById(rentalId);

      if (res.success) {
        setRental(res.data);
        // Set mặc định ngày kết thúc hiện tại vào ô input
        if (res.data.end_date) {
          setNewEndDate(
            new Date(res.data.end_date).toISOString().split("T")[0]
          );
        }
      }
    } catch (err) {
      console.error("Lỗi tải rental:", err);
      alert("Không thể tải thông tin phiếu thuê.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rentalId) fetchRentalDetails();
  }, [rentalId]);

  // 2. Xử lý Gia hạn
  const handleExtend = async () => {
    // Validate cơ bản
    const currentEnd = new Date(rental.end_date).toISOString().split("T")[0];
    if (newEndDate <= currentEnd) {
      alert("Ngày gia hạn phải lớn hơn ngày trả phòng hiện tại!");
      return;
    }

    try {
      setSaving(true);
      const res = await extendRental(rental.id, newEndDate);

      alert(`✅ ${res.message}`);
      setIsExtending(false);
      fetchRentalDetails(); // Reload lại để cập nhật giao diện
      if (onUpdateSuccess) onUpdateSuccess(); // Báo cho trang cha reload (nếu cần)
    } catch (err) {
      alert(`❌ Lỗi gia hạn: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- RENDER ---
  if (!rentalId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Chi tiết Phiếu Thuê #{rental?.id}
            </h3>
            {rental && (
              <p className="text-sm text-blue-600 font-medium mt-1">
                Phòng {rental.room?.room_number} -{" "}
                {rental.room?.room_type?.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
            <>
              {/* 1. THÔNG TIN KHÁCH & THỜI GIAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Khách hàng */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <User size={18} /> Khách lưu trú
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {rental.rental_guests?.map((g, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-blue-100 pb-1 last:border-0"
                      >
                        <span className={g.is_primary ? "font-bold" : ""}>
                          {g.customer?.full_name} {g.is_primary && "(Chính)"}
                        </span>
                        <span className="text-gray-500">
                          {g.customer?.phone_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thời gian & Gia hạn */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isExtending
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock size={18} /> Thời gian lưu trú
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ngày đến:</span>
                      <span className="font-medium">
                        {new Date(rental.start_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>

                    {/* Khu vực Ngày đi / Gia hạn */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Ngày đi:</span>
                      {isExtending ? (
                        <input
                          type="date"
                          className="p-1 border border-yellow-400 rounded bg-white font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          value={newEndDate}
                          onChange={(e) => setNewEndDate(e.target.value)}
                          min={
                            new Date(rental.end_date)
                              .toISOString()
                              .split("T")[0]
                          }
                        />
                      ) : (
                        <span className="font-bold text-blue-600">
                          {new Date(rental.end_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      )}
                    </div>

                    {/* Nút thao tác */}
                    {!isExtending ? (
                      <button
                        onClick={() => setIsExtending(true)}
                        className="w-full mt-2 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition shadow-sm"
                      >
                        Gia hạn phòng
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setIsExtending(false);
                            setNewEndDate(rental.end_date.split("T")[0]);
                          }}
                          className="flex-1 py-2 bg-white border border-gray-300 text-gray-600 font-semibold rounded-lg hover:bg-gray-50"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleExtend}
                          disabled={saving}
                          className="flex-1 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 shadow-md flex justify-center items-center gap-2"
                        >
                          {saving ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Save size={16} />
                          )}
                          Lưu
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. DỊCH VỤ ĐÃ DÙNG */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Coffee size={18} className="text-orange-500" /> Dịch vụ đã
                  gọi
                </h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-500 font-semibold">
                      <tr>
                        <th className="px-4 py-2">Tên dịch vụ</th>
                        <th className="px-4 py-2 text-center">SL</th>
                        <th className="px-4 py-2 text-right">Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rental.service_usage?.length > 0 ? (
                        rental.service_usage.map((svc) => (
                          <tr key={svc.id}>
                            <td className="px-4 py-3">{svc.service?.name}</td>
                            <td className="px-4 py-3 text-center">
                              {svc.quantity}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {parseInt(svc.total_price).toLocaleString()} đ
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 py-6 text-center text-gray-400 italic"
                          >
                            Chưa sử dụng dịch vụ nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalDetailModal;
//src/features/staff/components/RentalDetailModal.jsx
