import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, User, Mail, Phone } from "lucide-react";
import { getCustomers, createCustomer, updateCustomer } from "./api/adminApi";

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    identity_card: "",
    phone_number: "",
    email: "",
    type: "domestic",
    address: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchCustomersList = async () => {
    try {
      setLoading(true);
      const res = await getCustomers(search ? { search } : {});
      setCustomers(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomersList(), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await updateCustomer(editId, formData);
      else await createCustomer(formData);
      setShowModal(false);
      fetchCustomersList();
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      identity_card: "",
      phone_number: "",
      email: "",
      type: "domestic",
      address: "",
    });
    setIsEdit(false);
    setEditId(null);
  };

  const handleEdit = (customer) => {
    setFormData(customer);
    setIsEdit(true);
    setEditId(customer.id);
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
            placeholder="Tìm khách hàng..."
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
                  Họ tên
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Liên lạc
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  CMND/CCCD
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Loại khách
                </th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Không tìm thấy dữ liệu.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {c.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-700">
                          {c.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone size={12} className="text-gray-400" />{" "}
                        {c.phone_number}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Mail size={12} /> {c.email}
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-sm font-mono text-gray-600">
                      {c.identity_card}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          c.type === "domestic"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-purple-50 text-purple-700 border-purple-100"
                        }`}
                      >
                        {c.type === "domestic" ? "Trong nước" : "Quốc tế"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal giữ nguyên logic, chỉ copy class CSS đẹp từ RoomManagementPage xuống */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {isEdit ? "Cập nhật" : "Thêm mới"} khách hàng
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    CMND/CCCD
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.identity_card}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identity_card: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    SĐT
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Loại khách
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white transition"
                  >
                    <option value="domestic">Trong nước</option>
                    <option value="foreign">Nước ngoài</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                />
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

export default CustomerManagementPage;
