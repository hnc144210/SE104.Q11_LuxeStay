import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  getRooms,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
} from "./api/adminApi";

const RoomManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    room_number: "",
    room_type_id: "1", // Mặc định loại 1
    status: "available",
    note: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await getRooms(params);
      setRooms(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter]);

  // Xử lý Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateRoom(editId, formData);
      } else {
        await createRoom(formData);
      }
      setShowModal(false);
      fetchRooms();
      resetForm();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phòng này?")) return;
    try {
      await deleteRoom(id);
      fetchRooms();
    } catch (err) {
      alert("Không thể xóa: " + err.message);
    }
  };

  const handleEdit = (room) => {
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_types?.id || "1",
      status: room.status,
      note: room.note || "",
    });
    setEditId(room.id);
    setIsEdit(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      room_type_id: "1",
      status: "available",
      note: "",
    });
    setIsEdit(false);
    setEditId(null);
  };

  // Helper Badge Color
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-700 border-green-100";
      case "occupied":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "maintenance":
        return "bg-red-50 text-red-700 border-red-100";
      case "cleaning":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Phòng</h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách phòng và trạng thái hiện tại
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={18} /> Thêm phòng mới
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "available", "occupied", "cleaning", "maintenance"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {status === "all" ? "Tất cả" : status}
            </button>
          )
        )}
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Số phòng
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Loại phòng
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Giá niêm yết
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Chưa có phòng nào.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="font-bold text-gray-800 text-lg">
                        {room.room_number}
                      </div>
                      {room.note && (
                        <div className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
                          {room.note}
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="font-medium text-gray-700">
                        {room.room_types?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {room.room_types?.max_guests} khách tối đa
                      </div>
                    </td>
                    <td className="p-5 font-medium text-gray-600">
                      {Number(room.room_types?.base_price).toLocaleString()} đ
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(
                          room.status
                        )}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {isEdit ? "Cập nhật phòng" : "Thêm phòng mới"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Số phòng
                </label>
                <input
                  required
                  type="text"
                  value={formData.room_number}
                  onChange={(e) =>
                    setFormData({ ...formData, room_number: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="Ví dụ: 101, 202..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Loại phòng
                  </label>
                  <select
                    value={formData.room_type_id}
                    onChange={(e) =>
                      setFormData({ ...formData, room_type_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="1">Standard (A)</option>
                    <option value="2">Deluxe (B)</option>
                    <option value="3">Suite (C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="available">Trống</option>
                    <option value="occupied">Đang ở</option>
                    <option value="cleaning">Dọn dẹp</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows="3"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition resize-none"
                  placeholder="Ghi chú thêm về phòng này..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagementPage;
