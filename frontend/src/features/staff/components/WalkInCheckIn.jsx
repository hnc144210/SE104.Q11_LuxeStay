import React, { useState, useEffect } from "react";
import { Calculator, UserPlus } from "lucide-react";
import {
  getStaffRooms,
  getStaffCustomers,
  calculateWalkInPrice,
  checkInWalkIn,
} from "../api/staffApi";

const WalkInCheckIn = () => {
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);

  const [form, setForm] = useState({
    room_id: "",
    customer_id: "",
    check_out_date: "",
    deposit_amount: 0,
  });

  const fetchRooms = async () => {
    try {
      const res = await getStaffRooms({ status: "available" });
      console.log(res);
      setRooms(res.data || []);
    } catch (err) {
      console.error("Lỗi fetch rooms:", err);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCalc = async () => {
    if (!form.room_id || !form.customer_id || !form.check_out_date) {
      return alert("Vui lòng nhập đầy đủ: Phòng, Khách hàng, Ngày trả phòng!");
    }
    try {
      setLoading(true);
      const res = await calculateWalkInPrice({
        room_id: form.room_id,
        check_out_date: form.check_out_date,
        num_guests: 1,
      });
      setBill(res.data);
      setForm((prev) => ({ ...prev, deposit_amount: res.data.deposit_amount }));
    } catch (e) {
      alert("Lỗi tính giá: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!bill) return alert("Vui lòng tính toán trước!");
    try {
      setLoading(true);
      await checkInWalkIn({
        room_id: form.room_id,
        customer_ids: [form.customer_id],
        check_out_date: form.check_out_date,
        deposit_amount: parseInt(form.deposit_amount),
      });
      alert("✅ Walk-in Check-in thành công!");
      window.location.reload();
    } catch (e) {
      alert(" Lỗi: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      {/* LEFT: FORM */}
      <div className="space-y-5">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
          Dành cho khách lẻ đến trực tiếp quầy (Chưa có Booking).
        </div>

        <div>
          <label className="label-style">Chọn Phòng Trống</label>
          <select
            className="input-style"
            value={form.room_id}
            onChange={(e) => {
              setForm({ ...form, room_id: e.target.value });
              setBill(null);
            }}
          >
            <option value="">-- Danh sách phòng Available --</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                P.{r.room_number} - {r.room_types?.name} (
                {parseInt(r.room_types?.base_price).toLocaleString()}đ)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-style">Khách Hàng Đại Diện</label>
          <div className="flex gap-2">
            <select
              className="input-style"
              value={form.customer_id}
              onChange={(e) =>
                setForm({ ...form, customer_id: e.target.value })
              }
            >
              <option value="">-- Tìm khách hàng --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} - {c.identity_card}
                </option>
              ))}
            </select>
            <a
              href="/staff/customers"
              target="_blank"
              className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
            >
              <UserPlus size={20} />
            </a>
          </div>
        </div>

        <div>
          <label className="label-style">Ngày Trả Phòng</label>
          <input
            type="date"
            className="input-style"
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              setForm({ ...form, check_out_date: e.target.value });
              setBill(null);
            }}
          />
        </div>

        <button
          onClick={handleCalc}
          disabled={loading}
          className="w-full bg-gray-800 text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 flex justify-center items-center gap-2 transition shadow-lg disabled:opacity-50"
        >
          <Calculator size={20} />{" "}
          {loading ? "Đang tính..." : "Tính Toán Chi Phí"}
        </button>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
        <h3 className="font-bold text-lg text-gray-800 border-b border-gray-100 pb-3 mb-4 flex justify-between">
          <span>Chi tiết thanh toán</span>
          {bill && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Đã tính toán
            </span>
          )}
        </h3>

        {bill ? (
          <div className="space-y-5 animate-scale-up">
            <div className="space-y-3 text-sm text-gray-600">
              <Row
                label={`Phòng ${bill.room_number}`}
                value={bill.base_price}
              />
              <div className="flex justify-between">
                <span>Số đêm:</span>
                <span className="font-bold">{bill.nights} đêm</span>
              </div>
              <Row label="Thành tiền phòng" value={bill.room_charge} />
              {bill.surcharge > 0 && (
                <Row
                  label="Phụ thu"
                  value={bill.surcharge}
                  color="text-orange-600"
                  isAdd
                />
              )}
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-dashed border-gray-200">
              <span className="text-gray-500 font-medium">Tổng dự kiến</span>
              <span className="text-2xl font-extrabold text-blue-600">
                {bill.total_price?.toLocaleString()} đ
              </span>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-bold text-yellow-800 uppercase">
                  Tiền cọc (VND)
                </label>
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">
                  Gợi ý: {bill.deposit_percentage}%
                </span>
              </div>
              <input
                type="number"
                className="w-full bg-white p-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-gray-800 text-right"
                value={form.deposit_amount}
                onChange={(e) =>
                  setForm({ ...form, deposit_amount: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác nhận Nhận Phòng"}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 flex flex-col items-center">
            <Calculator size={40} className="mb-2 opacity-20" />
            <p>
              Vui lòng nhập thông tin và nhấn <strong>"Tính Toán"</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components & styles local
const Row = ({ label, value, color = "text-gray-900", isAdd }) => (
  <div className={`flex justify-between ${color}`}>
    <span>{label}:</span>
    <span className="font-bold">
      {isAdd && "+ "}
      {value?.toLocaleString()} đ
    </span>
  </div>
);
const labelStyle = "block text-sm font-bold text-gray-700 mb-1";
const inputStyle =
  "w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-500 shadow-sm transition";

export default WalkInCheckIn;
//src/features/staff/components/WalkInCheckIn.jsx
