import React, { useState, useEffect } from "react";
import {
  Save,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Users,
  Globe,
  Home, // Icon cho phòng
} from "lucide-react";
import {
  getSystemConfig,
  updateRoomTypesConfig,
  updateGuestConfig,
  updateSurchargesConfig,
} from "./api/adminApi";

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Data States
  const [regulations, setRegulations] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);

  // Fetch Data
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await getSystemConfig();
      if (res.success) {
        setRegulations(res.data.regulations);
        setRoomTypes(res.data.room_types);
      }
    } catch (err) {
      alert("Lỗi tải cấu hình: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  // 1. Lưu cấu hình chung (Tab General)
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Lấy giá trị từ state (dùng key chuẩn trong JSON)
      const depositVal = Number(regulations.deposit_percentage?.value || 0);
      const surchargeRateVal = Number(regulations.surcharge_rate?.value || 0);
      const maxGuestVal = Number(regulations.max_guests_per_room?.value || 3);
      const foreignVal = Number(
        regulations.foreign_guest_surcharge_ratio?.value || 1
      );

      // Gọi API 1: Update Guest Config
      await updateGuestConfig(foreignVal);

      // Gọi API 2: Update Surcharges (Cọc, Quá người, Max người)
      await updateSurchargesConfig(depositVal, surchargeRateVal, maxGuestVal);

      alert("✅ Đã lưu các quy định chung!");
    } catch (err) {
      alert("❌ Lỗi lưu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 2. Lưu cấu hình loại phòng
  const handleSaveRoomTypes = async () => {
    try {
      setSaving(true);
      await updateRoomTypesConfig(roomTypes);
      alert("✅ Đã cập nhật giá phòng!");
    } catch (err) {
      alert("❌ Lỗi lưu loại phòng: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper change state regulations
  const handleRegChange = (key, newValue) => {
    setRegulations((prev) => ({
      ...prev,
      [key]: { ...prev[key], value: newValue },
    }));
  };

  // Helper change state room types
  const handleRoomTypeChange = (index, field, value) => {
    const newTypes = [...roomTypes];
    newTypes[index][field] = value;
    setRoomTypes(newTypes);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-blue-600" /> Cài Đặt Hệ Thống
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các quy định, giá cả và tham số vận hành.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "general"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Quy định chung
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "rooms"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Cấu hình Loại phòng
          </button>
        </div>
      </div>

      {/* --- TAB 1: QUY ĐỊNH CHUNG --- */}
      {activeTab === "general" && (
        <form
          onSubmit={handleSaveGeneral}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Card: Đặt cọc & Max người */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2 text-blue-700">
              <DollarSign size={20} />
              <h3 className="font-bold">Cơ bản</h3>
            </div>

            {/* Input: Deposit Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phần trăm cọc (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={regulations.deposit_percentage?.value || 0}
                onChange={(e) =>
                  handleRegChange("deposit_percentage", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {regulations.deposit_percentage?.description}
              </p>
            </div>

            {/* Input: Max Guests Per Room */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Home size={14} /> Số khách tiêu chuẩn/phòng
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={regulations.max_guests_per_room?.value || 3}
                onChange={(e) =>
                  handleRegChange("max_guests_per_room", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {regulations.max_guests_per_room?.description}
              </p>
            </div>
          </div>

          {/* Card: Phụ thu (Surcharges) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2 text-orange-700">
              <AlertCircle size={20} />
              <h3 className="font-bold">Phụ thu (Surcharges)</h3>
            </div>

            {/* Input: Foreign Guest Surcharge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Globe size={14} /> Hệ số khách nước ngoài (x lần)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={regulations.foreign_guest_surcharge_ratio?.value || 1.5}
                onChange={(e) =>
                  handleRegChange(
                    "foreign_guest_surcharge_ratio",
                    e.target.value
                  )
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {regulations.foreign_guest_surcharge_ratio?.description}
              </p>
            </div>

            {/* Input: Surcharge Rate (Extra Guest) */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Users size={14} /> Tỉ lệ phụ thu khách thứ 3 trở đi
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                value={regulations.surcharge_rate?.value || 0.25}
                onChange={(e) =>
                  handleRegChange("surcharge_rate", e.target.value)
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {regulations.surcharge_rate?.description} (VD: 0.25 là 25%)
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Lưu thay đổi chung
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: LOẠI PHÒNG (Đã rút gọn) --- */}
      {activeTab === "rooms" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((rt, idx) => (
              <div
                key={rt.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{rt.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    ID: {rt.id}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Chỉ giữ lại Input Giá phòng */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Giá cơ bản (VND)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none font-medium text-right text-lg text-blue-700"
                      value={rt.base_price}
                      onChange={(e) =>
                        handleRoomTypeChange(
                          idx,
                          "base_price",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>

                  {/* Có thể hiển thị thông tin dạng Text để user biết (không sửa được) */}
                  <div className="text-xs text-gray-400 mt-2 italic border-t pt-2">
                    * Sức chứa và Phụ thu áp dụng theo quy định chung.
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveRoomTypes}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              Cập nhật Giá phòng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
