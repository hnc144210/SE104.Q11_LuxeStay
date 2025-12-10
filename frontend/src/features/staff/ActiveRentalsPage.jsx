// src/features/staff/ActiveRentalsPage.jsx
import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Clock,
  Search,
  Loader2,
  ArrowRight,
  BedDouble,
} from "lucide-react";
import { getActiveRentals } from "./api/staffApi";
import RentalDetailModal from "./components/RentalDetailModal";
import { getRentalById } from "./api/staffApi";
const ActiveRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRentalId, setSelectedRentalId] = useState(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const res = await getActiveRentals();
      console.log("Dữ liệu API trả về:", res.data); // <--- BẬT F12 ĐỂ XEM DÒNG NÀY
      setRentals(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách phòng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const filteredRentals = rentals.filter((r) => {
    const term = searchTerm.toLowerCase();
    const roomNum = r.rooms?.room_number?.toString() || "";
    const guestName =
      r.rental_guests?.[0]?.customers?.full_name?.toLowerCase() || "";
    return roomNum.includes(term) || guestName.includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BedDouble className="text-blue-600" /> Danh Sách Phòng Đang Thuê
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý khách đang lưu trú, xem dịch vụ và gia hạn phòng.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition bg-white"
            placeholder="Tìm số phòng hoặc khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DANH SÁCH CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center items-center flex-col text-gray-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">
              Hiện không có phòng nào đang được thuê.
            </p>
          </div>
        ) : (
          filteredRentals.map((rental) => {
            // --- 1. LẤY DỮ LIỆU ---
            const guestName =
              rental.rental_guests?.[0]?.customers?.full_name || "Khách lẻ";

            const roomNum =
              rental.rooms?.room_number || rental.room?.room_number || "---";
            const roomType =
              rental.rooms?.room_types?.name ||
              rental.room?.room_type?.name ||
              "Standard";

            // --- 2. XỬ LÝ NGÀY THÁNG ---
            // Chỉ new Date khi có dữ liệu thực sự
            const startDate = rental.start_date
              ? new Date(rental.start_date)
              : null;
            const endDate = rental.end_date ? new Date(rental.end_date) : null;
            const now = new Date();

            // --- 3. KIỂM TRA QUÁ HẠN ---
            let isOverdue = false;
            if (endDate) {
              // So sánh timestamp
              const checkDate = new Date(endDate);
              // Trick: Set checkDate về cuối ngày (23:59:59) nếu muốn tính hết ngày mới quá hạn
              // checkDate.setHours(23, 59, 59, 999);
              isOverdue = now > checkDate;
            }

            // --- 4. TÍNH SỐ ĐÊM ---
            let nights = 0;
            if (startDate && endDate) {
              const diffTime = endDate.getTime() - startDate.getTime();
              nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            if (nights < 1) nights = 1;

            // --- 5. FORMAT HIỂN THỊ ---
            const dateOptions = {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            };
            const startStr = startDate
              ? startDate.toLocaleDateString("vi-VN", dateOptions)
              : "---";
            const endStr = endDate
              ? endDate.toLocaleDateString("vi-VN", dateOptions)
              : "---"; // Nếu vẫn hiện "---" nghĩa là rental.end_date bị thiếu

            return (
              <div
                key={rental.id}
                onClick={() => setSelectedRentalId(rental.id)}
                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-lg group relative overflow-hidden ${
                  isOverdue
                    ? "border-red-200 shadow-red-50"
                    : "border-gray-200 shadow-sm hover:border-blue-200"
                }`}
              >
                {/* Badge Trạng thái */}
                <div
                  className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isOverdue
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOverdue ? "bg-red-500" : "bg-green-500 animate-pulse"
                    }`}
                  ></span>
                  {isOverdue ? "Quá hạn" : "Đang ở"}
                </div>

                {/* Info Phòng */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {roomNum}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {roomType}
                  </p>
                </div>

                {/* Info Khách */}
                <div className="space-y-2.5 border-t border-gray-50 pt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <User size={16} className="text-gray-400" />
                    <span className="font-semibold text-gray-900 truncate">
                      {guestName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {startStr} <span className="mx-1 text-gray-300">➜</span>
                      {/* Hiển thị ngày đi */}
                      <span
                        className={`ml-1 ${
                          isOverdue ? "text-red-600 font-bold" : ""
                        }`}
                      >
                        {endStr}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock size={16} className="text-gray-400" />
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {nights} đêm
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex justify-end text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                  Xem chi tiết <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedRentalId && (
        <RentalDetailModal
          rentalId={selectedRentalId}
          onClose={() => setSelectedRentalId(null)}
          onUpdateSuccess={() => {
            fetchRentals();
          }}
        />
      )}
    </div>
  );
};

export default ActiveRentalsPage;
