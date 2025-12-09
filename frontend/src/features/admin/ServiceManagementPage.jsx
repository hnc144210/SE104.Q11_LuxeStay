import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Power,
  Coffee,
  DollarSign,
} from "lucide-react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "./api/adminApi";

const ServiceManagementPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    unit: "",
    is_active: true,
  });
  const [editId, setEditId] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getServices({ search });
      console.log("Fetched Services:", res);
      setServices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchServices(), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateService(editId, formData);
      } else {
        await createService(formData);
      }
      setShowModal(false);
      fetchServices();
      resetForm();
      alert(isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa vĩnh viễn dịch vụ này?")) {
      try {
        await deleteService(id);
        fetchServices();
      } catch (err) {
        alert(err.message || "Không thể xóa (có thể do đã có lịch sử sử dụng)");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleServiceStatus(id);
      fetchServices();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", unit: "", is_active: true });
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      unit: item.unit || "",
      is_active: item.is_active,
    });
    setEditId(item.id);
    setIsEdit(true);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Quản Lý Dịch Vụ & Menu
      </h1>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-blue-500"
            placeholder="Tìm tên dịch vụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"
        >
          <Plus size={18} /> Thêm Mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b">
            <tr>
              <th className="p-4">Tên Dịch Vụ</th>
              <th className="p-4">Đơn Giá</th>
              <th className="p-4">Đơn Vị</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-700 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <Coffee size={18} />
                    </div>
                    {s.name}
                  </td>
                  <td className="p-4 text-blue-600 font-bold">
                    {parseInt(s.price).toLocaleString()} đ
                  </td>
                  <td className="p-4 text-gray-500">{s.unit || "Lần"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        s.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.is_active ? "Có sẵn" : "Ngưng bán"}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(s.id)}
                      className={`p-2 rounded hover:bg-gray-100 ${
                        s.is_active ? "text-green-600" : "text-gray-400"
                      }`}
                      title={s.is_active ? "Tắt" : "Bật"}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {isEdit ? "Cập Nhật Dịch Vụ" : "Thêm Dịch Vụ Mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Tên Dịch Vụ
                </label>
                <input
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="VD: Nước suối, Giặt ủi..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Đơn Giá
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={16}
                    />
                    <input
                      required
                      type="number"
                      className="w-full pl-9 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Đơn Vị Tính
                  </label>
                  <input
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Lon, Chai, Kg..."
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 shadow-lg"
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

export default ServiceManagementPage;
