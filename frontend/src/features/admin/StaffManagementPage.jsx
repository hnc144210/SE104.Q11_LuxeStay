import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Mail, Phone } from "lucide-react"; // Đã bỏ Briefcase
import {
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../admin/api/adminApi";

const StaffManagementPage = () => {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // State form cho nhân viên
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    salary: "",
    status: "active",
    // Vẫn giữ key position/department trong state để tránh lỗi nếu API trả về,
    // nhưng không hiển thị lên UI nữa.
    position: "",
    department: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // 1. Fetch dữ liệu
  const fetchStaffsList = async () => {
    try {
      setLoading(true);
      const res = await getStaffs(search ? { search } : {});
      setStaffs(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchStaffsList(), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Xử lý Submit Form (Tạo/Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateStaff(editId, formData);
      } else {
        await createStaff(formData);
      }
      setShowModal(false);
      fetchStaffsList();
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await deleteStaff(id);
        fetchStaffsList();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      salary: "",
      status: "active",
      position: "",
      department: "",
    });
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (staff) => {
    // Map dữ liệu từ API vào Form
    setFormData({
      full_name: staff.full_name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      salary: staff.salary || "",
      status: staff.status || "active",
      position: staff.position || "",
      department: staff.department || "",
    });
    setIsEdit(true);
    setEditId(staff.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition active:scale-95"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Liên lạc
                </th>
                {/* ĐÃ XÓA CỘT VỊ TRÍ/PHÒNG BAN */}
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  {/* Colspan giảm từ 5 xuống 4 */}
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : staffs.length === 0 ? (
                <tr>
                  {/* Colspan giảm từ 5 xuống 4 */}
                  <td colSpan="4" className="p-8 text-center text-gray-400">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                staffs.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition group">
                    {/* Cột 1: Avatar & Tên */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-50">
                          {s.avatar_url ? (
                            <img
                              src={s.avatar_url}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            s.full_name?.charAt(0).toUpperCase() || "S"
                          )}
                        </div>
                        <span className="font-bold text-gray-700">
                          {s.full_name}
                        </span>
                      </div>
                    </td>

                    {/* Cột 2: Phone & Email */}
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone size={12} className="text-gray-400" />{" "}
                        {s.phone || "---"}
                      </div>
                      {s.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Mail size={12} /> {s.email}
                        </div>
                      )}
                    </td>

                    {/* ĐÃ XÓA CỘT VỊ TRÍ/PHÒNG BAN Ở ĐÂY */}

                    {/* Cột 3: Status Badge */}
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          s.status === "active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        Đang làm việc
                      </span>
                    </td>

                    {/* Cột 4: Actions */}
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
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

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {isEdit ? "Cập nhật" : "Thêm mới"} nhân viên
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Họ tên & Email (Đã gom lại cho gọn) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Họ tên
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Row 2: SĐT & Lương (Thay thế vị trí của Phòng ban/Job cũ) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Row 3: Trạng thái */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white transition"
                >
                  <option value="active">Đang làm việc</option>
                  <option value="inactive">Đã nghỉ việc</option>
                </select>
              </div>

              {/* Buttons */}
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

export default StaffManagementPage;
