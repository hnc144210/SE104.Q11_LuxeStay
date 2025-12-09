// src/features/staff/CheckOutPage.jsx
import React, { useEffect, useState } from "react";
import { getOccupiedRooms, performCheckOut } from "../staff/api/staffApi"; // Import file API ở Bước 1
import {
  CreditCard,
  Banknote,
  Wallet,
  Loader2,
  CheckCircle,
} from "lucide-react";

const CheckOutPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null); // Phòng đang chọn để check-out
  const [processing, setProcessing] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null); // Kết quả sau khi check-out thành công

  // Load danh sách phòng đang có khách
  useEffect(() => {
    fetchOccupiedRooms();
  }, []);

  const fetchOccupiedRooms = async () => {
    try {
      const res = await getOccupiedRooms();
      if (res.success) {
        setRooms(res.data); // Giả sử API trả về list rooms
      }
    } catch (error) {
      console.error("Lỗi tải danh sách phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (paymentMethod) => {
    if (!selectedRoom) return;
    setProcessing(true);

    try {
      // Backend của bạn cần rental_id.
      // Giả định: API list rooms trả về thông tin rental hiện tại hoặc ta phải tìm rental active.
      // Ở đây giả định object room có chứa current_rental_id
      const payload = {
        rental_id: selectedRoom.current_rental_id, // Cần đảm bảo backend trả field này
        payment_method: paymentMethod,
      };

      const res = await performCheckOut(payload);

      if (res.success) {
        setInvoiceResult(res.data.invoice); // Lưu hóa đơn để hiển thị
        setSelectedRoom(null); // Đóng modal chọn phòng
        fetchOccupiedRooms(); // Refresh lại danh sách
      }
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi check-out");
    } finally {
      setProcessing(false);
    }
  };

  // Render danh sách phòng
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Trả phòng & Thanh toán
      </h1>

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.length === 0 ? (
            <p className="text-gray-500 col-span-4 text-center">
              Không có phòng nào đang thuê.
            </p>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm cursor-pointer hover:shadow-md hover:border-orange-400 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                    Phòng {room.room_number}
                  </span>
                  <span className="text-xs text-gray-500">
                    {room.room_types?.name}
                  </span>
                </div>
                <p className="text-gray-800 font-semibold truncate">
                  {/* Giả định API trả tên khách đại diện */}
                  Khách: {room.current_customer_name || "Đang cập nhật"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click để thanh toán
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL XÁC NHẬN THANH TOÁN */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Thanh toán: Phòng {selectedRoom.room_number}
            </h3>
            <p className="text-gray-600 mb-6">
              Vui lòng chọn phương thức thanh toán để hoàn tất trả phòng và xuất
              hóa đơn.
            </p>

            <div className="space-y-3">
              <PaymentButton
                icon={Banknote}
                label="Tiền mặt"
                onClick={() => handleCheckOut("cash")}
                disabled={processing}
              />
              <PaymentButton
                icon={CreditCard}
                label="Thẻ ngân hàng"
                onClick={() => handleCheckOut("card")}
                disabled={processing}
              />
              <PaymentButton
                icon={Wallet}
                label="Chuyển khoản"
                onClick={() => handleCheckOut("transfer")}
                disabled={processing}
              />
            </div>

            <button
              onClick={() => setSelectedRoom(null)}
              className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700"
              disabled={processing}
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* MODAL HIỂN THỊ HÓA ĐƠN THÀNH CÔNG */}
      {invoiceResult && (
        <InvoiceModal
          invoice={invoiceResult}
          onClose={() => setInvoiceResult(null)}
        />
      )}
    </div>
  );
};

// Component nút thanh toán nhỏ
const PaymentButton = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition disabled:opacity-50"
  >
    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
      {disabled ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <Icon size={20} />
      )}
    </div>
    <span className="font-medium text-gray-700">{label}</span>
  </button>
);

export default CheckOutPage;
