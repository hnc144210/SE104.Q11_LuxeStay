import React, { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
// ✅ QUAN TRỌNG: Import từ staffApi
import { getStaffCustomers } from "./api/staffApi";

const StaffCustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Gọi API Staff
      const res = await getStaffCustomers();
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Thông tin khách hàng
        </h1>
        {/* Nút thêm khách ở đây nếu muốn */}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm tên hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="p-4">Họ tên</th>
              <th className="p-4">SĐT</th>
              <th className="p-4">CCCD</th>
              <th className="p-4">Loại khách</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-700">{c.full_name}</td>
                <td className="p-4 text-gray-600">{c.phone_number}</td>
                <td className="p-4 text-gray-500 font-mono">
                  {c.identity_card}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      c.type === "foreign"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {c.type === "foreign" ? "Quốc tế" : "Trong nước"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffCustomerPage;
