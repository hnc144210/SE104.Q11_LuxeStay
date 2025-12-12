import React, { useState, useEffect } from "react";
import {
  Save,
  Settings,
  BedDouble,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Users,
  Globe,
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
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'rooms'

  // Data States
  const [regulations, setRegulations] = useState({});
  const [roomTypes, setRoomTypes] = useState([]);

  // Fetch Data khi vào trang
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

      // Update Surcharges (Cọc & Quá người)
      await updateSurchargesConfig(
        Number(regulations.deposit_percentage.value),
        Number(regulations.extra_guest_surcharge_ratio?.value || 0) // Dùng optional chaining nếu DB chưa có key này
      );

      // Update Guest Types (Nước ngoài)
      await updateGuestConfig(
        Number(regulations.foreign_guest_surcharge_ratio.value)
      );

      alert("✅ Đã lưu các quy định chung!");
    } catch (err) {
      alert("❌ Lỗi lưu: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 2. Lưu cấu hình loại phòng (Tab Rooms)
  const handleSaveRoomTypes = async () => {
    try {
      setSaving(true);
      await updateRoomTypesConfig(roomTypes);
      alert("✅ Đã cập nhật thông tin loại phòng!");
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
          {/* Card: Đặt cọc */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-blue-700">
              <DollarSign size={20} />
              <h3 className="font-bold">Quy định Đặt cọc</h3>
            </div>
            <div className="space-y-4">
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
                  Khách cần thanh toán trước bao nhiêu % tổng bill.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Phụ thu */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-orange-700">
              <AlertCircle size={20} />
              <h3 className="font-bold">Phụ thu (Surcharges)</h3>
            </div>
            <div className="space-y-4">
              {/* Khách nước ngoài */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Globe size={14} /> Hệ số khách nước ngoài (x lần)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={
                    regulations.foreign_guest_surcharge_ratio?.value || 1.5
                  }
                  onChange={(e) =>
                    handleRegChange(
                      "foreign_guest_surcharge_ratio",
                      e.target.value
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  VD: 1.5 = Tăng 50% so với giá gốc.
                </p>
              </div>

              {/* Quá số người (Nếu DB có key này) */}
              {regulations.extra_guest_surcharge_ratio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Users size={14} /> Hệ số khách ở ghép (x lần giá gốc)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={
                      regulations.extra_guest_surcharge_ratio?.value || 0.25
                    }
                    onChange={(e) =>
                      handleRegChange(
                        "extra_guest_surcharge_ratio",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    VD: 0.25 = Phụ thu 25% giá phòng/đêm cho mỗi người thừa.
                  </p>
                </div>
              )}
            </div>
          </div>

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
              Lưu thay đổi
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: LOẠI PHÒNG --- */}
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
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Giá cơ bản (VND)
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none font-medium text-right"
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

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Max Khách
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-center"
                        value={rt.max_guests}
                        onChange={(e) =>
                          handleRoomTypeChange(
                            idx,
                            "max_guests",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Tỉ lệ Surcharge
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none text-center"
                        value={rt.surcharge_ratio || 0.25}
                        onChange={(e) =>
                          handleRoomTypeChange(
                            idx,
                            "surcharge_ratio",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
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
              Cập nhật Loại phòng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
