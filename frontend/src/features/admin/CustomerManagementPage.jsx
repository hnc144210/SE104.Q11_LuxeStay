import React, { useState, useEffect } from "react";
// [FIX] Import từng hàm (Named Import)
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from "../customer/api/customerApi"; // Đảm bảo đường dẫn đúng

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // State form
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
      const params = search ? { search } : {};
      // [FIX] Gọi hàm getCustomers đã import
      const response = await getCustomers(params);
      setCustomers(response.data || []);
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
      if (isEdit) {
        // [FIX] Gọi hàm updateCustomer
        await updateCustomer(editId, formData);
        alert("Cập nhật thành công");
      } else {
        // [FIX] Gọi hàm createCustomer
        await createCustomer(formData);
        alert("Thêm khách hàng thành công");
      }
      setShowModal(false);
      fetchCustomersList();
      resetForm();
    } catch (err) {
      alert(err.message || "Lỗi xử lý");
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
    setFormData({
      full_name: customer.full_name,
      identity_card: customer.identity_card,
      phone_number: customer.phone_number,
      email: customer.email || "",
      type: customer.type,
      address: customer.address || "",
    });
    setIsEdit(true);
    setEditId(customer.id);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Thêm khách hàng
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, CMND, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded shadow-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Họ tên</th>
              <th className="p-4">CMND/CCCD</th>
              <th className="p-4">SĐT</th>
              <th className="p-4">Loại khách</th>
              <th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{c.full_name}</td>
                  <td className="p-4">{c.identity_card}</td>
                  <td className="p-4">{c.phone_number}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        c.type === "domestic"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {c.type === "domestic" ? "Trong nước" : "Nước ngoài"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {isEdit ? "Cập nhật" : "Thêm mới"} khách hàng
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Họ tên *</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">CMND/CCCD *</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.identity_card}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identity_card: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">SĐT *</label>
                  <input
                    required
                    type="text"
                    className="w-full border p-2 rounded"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Loại khách</label>
                  <select
                    className="w-full border p-2 rounded"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="domestic">Trong nước</option>
                    <option value="foreign">Nước ngoài</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Địa chỉ</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Lưu
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
