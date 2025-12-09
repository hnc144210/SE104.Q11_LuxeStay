import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { getStaffBookings } from "./api/staffApi"; // <--- Quan trọng: Import từ staffApi

const StaffBookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await getStaffBookings(); // Gọi API Staff
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filtered = bookings.filter(
    (b) =>
      b.customer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.room?.room_number?.includes(search)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Danh sách Đặt phòng</h1>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-blue-500"
            placeholder="Tìm tên khách, số phòng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Phòng</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-blue-50/30">
                <td className="p-4 font-bold text-gray-700">
                  {b.customer?.full_name}
                </td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                    {b.room?.room_number}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      b.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "checked_in"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(b.check_in_date).toLocaleDateString()} -{" "}
                  {new Date(b.check_out_date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default StaffBookingPage;
