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
  Users,
} from "lucide-react";
import {
  getStaffRooms,
  getStaffCustomers,
  calculateWalkInPrice,
  checkInWalkIn,
  createStaffCustomer,
} from "../api/staffApi";

const SYSTEM_SETTINGS = {
  STANDARD_CAPACITY: 3, // Tiêu chuẩn 3 người
};

const WalkInCheckIn = () => {
  const [rooms, setRooms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    full_name: "",
    identity_card: "",
    phone_number: "",
    type: "domestic",
    email: "",
    address: "",
  });

  const [form, setForm] = useState({
    room_id: "",
    customer_id: "",
    check_out_date: "",
    num_guests: 1,
    // deposit_amount: 0 // Đã bỏ, khách vãng lai không cần cọc
  });

  // Load dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, cusRes] = await Promise.all([
          getStaffRooms({ status: "available" }),
          getStaffCustomers(),
        ]);
        setRooms(roomRes.data || []);
        setCustomers(cusRes.data || []);
      } catch (err) {
        console.error("Load data error:", err);
      }
    };
    fetchData();
  }, []);

  // Tạo khách mới
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (
      !newCustomer.full_name ||
      !newCustomer.identity_card ||
      !newCustomer.phone_number
    ) {
      alert("Vui lòng điền đủ: Họ tên, CMND/CCCD và SĐT");
      return;
    }
    try {
      setCreatingCustomer(true);
      const res = await createStaffCustomer(newCustomer);
      if (res.success) {
        alert("✅ Tạo khách hàng thành công!");
        const cusRes = await getStaffCustomers();
        setCustomers(cusRes.data || []);
        setForm((prev) => ({ ...prev, customer_id: res.data.id }));
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
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setCreatingCustomer(false);
    }
  };

  // 1. TÍNH TOÁN CHI PHÍ (Preview)
  const handleCalc = async () => {
    if (!form.room_id || !form.customer_id || !form.check_out_date) {
      return alert("Vui lòng nhập đủ: Phòng, Khách, Ngày đi");
    }
    try {
      setLoading(true);
      const res = await calculateWalkInPrice({
        room_id: form.room_id,
        check_out_date: form.check_out_date,
        customer_ids: [form.customer_id],
        num_guests: parseInt(form.num_guests),
      });
      setBill(res.data);
    } catch (e) {
      alert("Lỗi tính giá: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  // 2. XÁC NHẬN CHECK-IN (Không cần cọc)
  const handleSubmit = async () => {
    if (!bill) return alert("Vui lòng bấm 'Tính Toán' trước!");
    try {
      setLoading(true);
      await checkInWalkIn({
        room_id: form.room_id,
        customer_ids: [form.customer_id],
        check_out_date: form.check_out_date,
        deposit_amount: 0, // ✅ Khách vãng lai mặc định cọc = 0
        num_guests: parseInt(form.num_guests), // Gửi số khách thực tế
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in w-full">
      {/* === CỘT TRÁI: FORM === */}
      <div className="xl:col-span-7 space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg text-blue-600">
            <UserPlus size={20} />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">
              Check-in Khách Lẻ (Walk-in)
            </h4>
            <p className="text-sm text-blue-700">
              Khách nhận phòng trực tiếp, thanh toán sau khi trả phòng.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          {/* Chọn Phòng */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Chọn Phòng
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
              value={form.room_id}
              onChange={(e) => {
                setForm({ ...form, room_id: e.target.value });
                setBill(null);
              }}
            >
              <option value="">-- Danh sách phòng trống --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  P.{r.room_number} - {r.room_types?.name} (
                  {parseInt(r.room_types?.base_price).toLocaleString()}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Khách */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Khách Đại Diện
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
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
            </div>
            <button
              onClick={() => setShowCustomerModal(true)}
              className="p-3 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 whitespace-nowrap"
            >
              + Mới
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Số Khách */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Số Khách
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                value={form.num_guests}
                onChange={(e) => {
                  setForm({ ...form, num_guests: e.target.value });
                  setBill(null);
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} người{" "}
                    {n > SYSTEM_SETTINGS.STANDARD_CAPACITY ? "(+Phí)" : ""}
                  </option>
                ))}
              </select>
            </div>
            {/* Ngày Trả Phòng */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ngày Trả Phòng
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => {
                  setForm({ ...form, check_out_date: e.target.value });
                  setBill(null);
                }}
              />
            </div>
          </div>

          <button
            onClick={handleCalc}
            className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition flex justify-center items-center gap-2"
          >
            {loading && !bill ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Calculator size={18} />
            )}
            Tính Toán Chi Phí
          </button>
        </div>
      </div>

      {/* === CỘT PHẢI: BILL PREVIEW === */}
      <div className="xl:col-span-5">
        <div
          className={`bg-white rounded-xl border ${
            bill ? "border-green-200 shadow-xl" : "border-gray-200"
          } p-6 h-full flex flex-col`}
        >
          <h3 className="font-bold text-lg text-gray-800 border-b pb-4 mb-4 flex items-center gap-2">
            <CreditCard size={20} /> Chi Tiết Dự Kiến
          </h3>

          {bill ? (
            <div className="flex-1 flex flex-col gap-4 animate-scale-up">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>
                    Phòng {bill.room_number} ({bill.nights} đêm)
                  </span>
                  <span className="font-bold text-gray-900">
                    {bill.room_charge?.toLocaleString()} đ
                  </span>
                </div>

                {/* Phụ thu */}
                {(bill.surcharge > 0 || bill.foreign_surcharge > 0) && (
                  <div className="bg-gray-50 p-2 rounded border border-gray-100 space-y-1">
                    {bill.surcharge > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Phụ thu quá người</span>
                        <span>+{bill.surcharge?.toLocaleString()} đ</span>
                      </div>
                    )}
                    {bill.foreign_surcharge > 0 && (
                      <div className="flex justify-between text-purple-600">
                        <span>Phụ thu khách QT</span>
                        <span>
                          +{bill.foreign_surcharge?.toLocaleString()} đ
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-dashed pt-3 flex justify-between items-end">
                  <span className="text-gray-500 font-medium">
                    Tổng cộng dự kiến
                  </span>
                  <span className="text-2xl font-bold text-blue-700">
                    {bill.total_price?.toLocaleString()} đ
                  </span>
                </div>
              </div>

              <div className="bg-green-50 text-green-700 p-3 rounded text-sm text-center">
                ✓ Khách check-in trực tiếp không cần đặt cọc. <br />
                Thanh toán toàn bộ khi trả phòng.
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg mt-auto flex justify-center items-center gap-2"
              >
                {loading ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <span>Xác Nhận Nhận Phòng</span> <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
              <Calculator size={48} className="mb-2" />
              <p>Nhập thông tin và bấm Tính Toán</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo Khách (Form giữ nguyên) */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Thêm Khách Mới</h3>
              <button onClick={() => setShowCustomerModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  className="p-2 border rounded w-full"
                  placeholder="Họ tên"
                  value={newCustomer.full_name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      full_name: e.target.value,
                    })
                  }
                />
                <input
                  required
                  className="p-2 border rounded w-full"
                  placeholder="SĐT"
                  value={newCustomer.phone_number}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  className="p-2 border rounded w-full"
                  placeholder="CMND/CCCD"
                  value={newCustomer.identity_card}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      identity_card: e.target.value,
                    })
                  }
                />
                <select
                  className="p-2 border rounded w-full bg-white"
                  value={newCustomer.type}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, type: e.target.value })
                  }
                >
                  <option value="domestic">Trong nước</option>
                  <option value="foreign">Quốc tế</option>
                </select>
              </div>
              <input
                className="p-2 border rounded w-full"
                type="email"
                placeholder="Email (tùy chọn)"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
              <input
                className="p-2 border rounded w-full"
                placeholder="Địa chỉ"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingCustomer}
                  className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {creatingCustomer ? "Đang lưu..." : "Lưu"}
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
