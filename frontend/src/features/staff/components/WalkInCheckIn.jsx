import React, { useState, useEffect } from "react";
import {
  Calculator,
  UserPlus,
  Calendar,
  Home,
  CreditCard,
  ChevronRight,
  User,
  X,
  Save,
  Loader2,
} from "lucide-react";
import {
  getStaffRooms,
  getStaffCustomers,
  calculateWalkInPrice,
  checkInWalkIn,
  createStaffCustomer,
} from "../api/staffApi";

const WalkInCheckIn = () => {
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);

  // State cho Modal Tạo Khách
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    identity_card: "",
    phone_number: "",
    type: "domestic", // domestic | foreign
    email: "",
    address: "",
  });

  const [form, setForm] = useState({
    room_id: "",
    customer_id: "",
    check_out_date: "",
    deposit_amount: 0,
  });

  // Load dữ liệu ban đầu
  const fetchInitialData = async () => {
    try {
      const [roomRes, cusRes] = await Promise.all([
        getStaffRooms({ status: "available" }),
        getStaffCustomers(),
      ]);
      setRooms(roomRes.data || []);
      setCustomers(cusRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu walk-in:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- 1. XỬ LÝ TẠO KHÁCH HÀNG MỚI ---
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (
      !newCustomer.full_name ||
      !newCustomer.identity_card ||
      !newCustomer.phone_number
    ) {
      alert("Vui lòng điền đủ: Họ tên, CMND/CCCD và Số điện thoại");
      return;
    }

    try {
      setCreatingCustomer(true);
      const res = await createStaffCustomer(newCustomer);

      if (res.success) {
        alert("✅ Tạo khách hàng thành công!");

        // Refresh lại danh sách khách
        const cusRes = await getStaffCustomers();
        setCustomers(cusRes.data || []);

        // Tự động chọn khách hàng vừa tạo
        setForm((prev) => ({ ...prev, customer_id: res.data.id }));

        // Đóng modal & reset form
        setShowCustomerModal(false);
        setNewCustomer({
          full_name: "",
          identity_card: "",
          phone_number: "",
          type: "domestic",
          email: "",
          address: "",
        });
      }
    } catch (err) {
      alert("Lỗi tạo khách: " + (err.response?.data?.message || err.message));
    } finally {
      setCreatingCustomer(false);
    }
  };

  // --- 2. TÍNH TIỀN ---
  const handleCalc = async () => {
    if (!form.room_id || !form.customer_id || !form.check_out_date) {
      return alert(
        "Vui lòng chọn đầy đủ: Phòng, Khách hàng và Ngày trả phòng!"
      );
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

  // --- 3. CHECK-IN ---
  const handleSubmit = async () => {
    if (!bill) return alert("Vui lòng bấm 'Tính Tiền' trước!");
    try {
      setLoading(true);
      await checkInWalkIn({
        room_id: form.room_id,
        customer_ids: [form.customer_id],
        check_out_date: form.check_out_date,
        deposit_amount: parseInt(form.deposit_amount),
      });
      alert("✅ Check-in thành công!");
      window.location.reload();
    } catch (e) {
      alert("❌ Lỗi: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in relative">
      {/* --- CỘT TRÁI: FORM NHẬP LIỆU (7 phần) --- */}
      <div className="lg:col-span-7 space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
            <UserPlus size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 text-sm">
              Khách Vãng Lai (Walk-in)
            </h4>
            <p className="text-blue-700/80 text-xs mt-0.5">
              Sử dụng cho khách đến trực tiếp quầy mà chưa có booking trước.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Chọn Phòng */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Home size={16} className="text-blue-500" /> Chọn Phòng Trống
            </label>
            <div className="relative">
              <select
                className="w-full p-3.5 pl-4 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-gray-50 text-gray-700"
                value={form.room_id}
                onChange={(e) => {
                  setForm({ ...form, room_id: e.target.value });
                  setBill(null);
                }}
              >
                <option value="">-- Chọn phòng từ danh sách --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    P.{r.room_number} - {r.room_types?.name} (
                    {parseInt(r.room_types?.base_price).toLocaleString()}đ)
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Chọn Khách Hàng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-blue-500" /> Khách Hàng Đại Diện
            </label>
            <div className="flex gap-3">
              <div className="relative w-full">
                <select
                  className="w-full p-3.5 pl-4 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:bg-gray-50 text-gray-700"
                  value={form.customer_id}
                  onChange={(e) =>
                    setForm({ ...form, customer_id: e.target.value })
                  }
                >
                  <option value="">-- Tìm kiếm khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} - {c.identity_card}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>

              {/* Nút mở Modal */}
              <button
                onClick={() => setShowCustomerModal(true)}
                className="px-4 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition shadow-sm flex items-center justify-center whitespace-nowrap gap-2 font-medium"
                title="Tạo khách mới"
              >
                <UserPlus size={18} />{" "}
                <span className="hidden sm:inline">Thêm mới</span>
              </button>
            </div>
          </div>

          {/* Ngày Trả Phòng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Ngày Trả Phòng
            </label>
            <input
              type="date"
              className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
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
            className="w-full mt-4 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 flex justify-center items-center gap-2 transition shadow-lg disabled:opacity-70 active:scale-[0.98]"
          >
            {loading && !bill ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Calculator size={20} />
            )}
            {loading && !bill ? "Đang tính toán..." : "Tính Toán Chi Phí"}
          </button>
        </div>
      </div>

      {/* --- CỘT PHẢI: BILL PREVIEW (5 phần) --- */}
      <div className="lg:col-span-5">
        <div
          className={`bg-white rounded-2xl border ${
            bill
              ? "border-green-100 shadow-xl shadow-green-100/50"
              : "border-gray-200 shadow-sm"
          } h-full flex flex-col transition-all duration-500 overflow-hidden`}
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <CreditCard size={20} className="text-gray-400" /> Chi tiết thanh
              toán
            </h3>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {bill ? (
              <div className="space-y-6 animate-scale-up">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-medium">
                      Phòng {bill.room_number}
                    </span>
                    <span className="font-bold text-gray-900">
                      {bill.base_price?.toLocaleString()} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500">Thời gian lưu trú</span>
                    <span className="font-medium text-gray-900">
                      {bill.nights} đêm
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-gray-500">Thành tiền phòng</span>
                    <span className="font-medium text-gray-900">
                      {bill.room_charge?.toLocaleString()} đ
                    </span>
                  </div>
                  {bill.surcharge > 0 && (
                    <div className="flex justify-between items-center px-3 text-orange-600 bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                      <span className="flex items-center gap-1 font-medium">
                        Phụ thu
                      </span>
                      <span className="font-bold">
                        + {bill.surcharge?.toLocaleString()} đ
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-200"></div>

                <div className="flex justify-between items-end">
                  <span className="text-gray-500 font-medium pb-1">
                    Tổng dự kiến
                  </span>
                  <span className="text-3xl font-extrabold text-blue-600 tracking-tight">
                    {bill.total_price?.toLocaleString()} đ
                  </span>
                </div>

                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-yellow-800 uppercase tracking-wide">
                      Tiền cọc thực thu
                    </label>
                    <span className="text-[10px] font-bold text-yellow-700 bg-yellow-200/50 px-2 py-1 rounded">
                      Mặc định: {bill.deposit_percentage}%
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-white p-3 pr-12 rounded-lg border border-yellow-200 focus:ring-2 focus:ring-yellow-400 outline-none font-bold text-gray-800 text-right text-lg shadow-sm transition-all"
                      value={form.deposit_amount}
                      onChange={(e) =>
                        setForm({ ...form, deposit_amount: e.target.value })
                      }
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  {loading ? (
                    "Đang xử lý..."
                  ) : (
                    <>
                      <span>Xác nhận Nhận Phòng</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-10 opacity-60">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  Vui lòng nhập thông tin bên trái <br /> và nhấn{" "}
                  <span className="font-bold text-gray-700">"Tính Toán"</span>{" "}
                  để xem chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL TẠO KHÁCH HÀNG --- */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <UserPlus size={20} className="text-blue-600" /> Thêm Khách Hàng
                Mới
              </h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Nguyen Van A"
                    value={newCustomer.full_name}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        full_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0909..."
                    value={newCustomer.phone_number}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                    CMND/CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Số ID..."
                    value={newCustomer.identity_card}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        identity_card: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                    Loại khách
                  </label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={newCustomer.type}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, type: e.target.value })
                    }
                  >
                    <option value="domestic">Trong nước</option>
                    <option value="foreign">Quốc tế</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="email@example.com (Tùy chọn)"
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">
                  Địa chỉ
                </label>
                <input
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập địa chỉ..."
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={creatingCustomer}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex justify-center gap-2 items-center transition disabled:opacity-70"
                >
                  {creatingCustomer ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {creatingCustomer ? "Đang lưu..." : "Lưu Khách Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkInCheckIn;
