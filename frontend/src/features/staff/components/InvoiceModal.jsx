import React, { useEffect, useState } from "react";
import { X, Printer, Loader2 } from "lucide-react";
import { getInvoiceById } from "../api/staffApi";

const InvoiceModal = ({ invoiceId, invoiceData, onClose }) => {
  const [invoice, setInvoice] = useState(invoiceData || null);
  const [loading, setLoading] = useState(!invoiceData);

  // Fetch dữ liệu nếu chỉ có ID (trường hợp xem lịch sử)
  useEffect(() => {
    if (!invoice && invoiceId) {
      const fetchInvoice = async () => {
        try {
          setLoading(true);
          const res = await getInvoiceById(invoiceId);
          if (res.success) {
            setInvoice(res.data);
          }
        } catch (err) {
          console.error("Lỗi tải hóa đơn:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [invoiceId, invoice]);

  const handlePrint = () => {
    window.print();
  };

  // --- RENDERING LOADING ---
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  // --- 1. CHUẨN HÓA DỮ LIỆU ---
  const rental = invoice.rental || invoice.rentals || {};
  const room = rental.room || rental.rooms || {};
  const roomType = room.room_type || room.room_types || {};
  const customer = invoice.customer || invoice.customers || {};
  const services = rental.service_usage || [];
  const staffName =
    invoice.staff?.full_name || invoice.profiles?.full_name || "Nhân viên";

  // --- 2. XỬ LÝ NGÀY THÁNG ---
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "---" : date.toLocaleDateString("vi-VN");
  };

  // Tính số đêm lưu trú
  const startDate = new Date(rental.start_date);
  const endDate = rental.end_date ? new Date(rental.end_date) : new Date();
  let nights = 0;
  if (!isNaN(startDate) && !isNaN(endDate)) {
    nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  }
  if (nights < 1) nights = 1;

  // Giá phòng gốc
  const basePrice = Number(rental.price_at_rental || roomType.base_price || 0);

  return (
    // LỚP NGOÀI CÙNG: Flex center và h-full để căn giữa màn hình
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-2 sm:p-4 transition-opacity">
      {/* MODAL CARD: Thêm flex-col và max-h-full để giới hạn chiều cao */}
      <div className="relative w-full max-w-2xl max-h-full flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl transition-all print:w-full print:max-w-none print:shadow-none print:rounded-none print:h-auto print:overflow-visible">
        {/* HEADER MODAL: Thêm flex-shrink-0 để không bị bóp méo, giảm padding */}
        <div className="flex-shrink-0 flex justify-between items-center p-3 border-b border-gray-100 bg-gray-50 print:hidden">
          <h3 className="font-bold text-gray-800">Chi tiết Hóa đơn</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
            >
              <Printer size={16} /> In
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* NỘI DUNG HÓA ĐƠN: Thêm flex-1 và overflow-y-auto (lưới an toàn). Giảm mạnh padding */}
        <div
          className="flex-1 overflow-y-auto p-4 print:p-0 print:overflow-visible"
          id="invoice-content"
        >
          {/* 1. Header Khách sạn (Nén lại) */}
          <div className="text-center mb-4 border-b border-gray-100 pb-3">
            <h1 className="text-2xl font-extrabold text-blue-900 uppercase tracking-widest">
              LUXESTAY HOTEL
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              ĐH CNTT - Hàn Thuyên, Linh Trung, Thủ Đức | Hotline: 0909 123 456
            </p>
          </div>

          {/* 2. Thông tin Hóa đơn & Khách hàng (Nén lại) */}
          <div className="flex justify-between mb-4">
            <div className="w-1/2">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">
                Khách hàng
              </p>
              <h4 className="text-base font-bold text-gray-800 capitalize truncate pr-2">
                {customer.full_name || "Khách lẻ"}
              </h4>
              <p className="text-gray-600 text-xs mt-0.5">
                SĐT: {customer.phone_number || "---"}
              </p>
            </div>
            <div className="text-right w-1/2">
              <h2 className="text-xl font-bold text-gray-800 mb-0.5">
                HÓA ĐƠN GTGT
              </h2>
              <p className="text-xs text-gray-500">
                Mã:{" "}
                <span className="font-mono text-gray-900 font-bold">
                  #{invoice.id}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                Ngày: {formatDate(invoice.issue_date)}
              </p>
            </div>
          </div>

          {/* 3. Bảng chi tiết (Giảm padding các ô) */}
          <table className="w-full mb-4 border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[11px] uppercase border-y border-gray-200">
                <th className="py-2 px-2 text-left font-semibold">Hạng mục</th>
                <th className="py-2 px-2 text-center font-semibold">Đơn vị</th>
                <th className="py-2 px-2 text-center font-semibold">SL</th>
                <th className="py-2 px-2 text-right font-semibold">
                  Thành tiền
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {/* Dòng 1: Tiền phòng */}
              <tr className="border-b border-gray-50">
                <td className="py-2 px-2">
                  <span className="font-bold block text-gray-800 text-sm">
                    P.{room.room_number || "--"} - {roomType.name}
                  </span>
                  <span className="text-[11px] text-gray-400 block">
                    {formatDate(rental.start_date)}—
                    {formatDate(rental.end_date)}
                  </span>
                </td>
                <td className="py-2 px-2 text-center text-[11px] text-gray-500">
                  VNĐ
                </td>
                <td className="py-2 px-2 text-center font-medium">{nights}</td>
                <td className="py-2 px-2 text-right font-bold text-gray-900">
                  {Number(invoice.room_charge).toLocaleString()}
                </td>
              </tr>

              {/* Dòng 2+: Dịch vụ (Loop) */}
              {services.map((usage, idx) => (
                <tr
                  key={`svc-${idx}`}
                  className="border-b border-gray-50 text-[13px]"
                >
                  <td className="py-2 px-2 pl-6 text-gray-600 relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]">
                      •
                    </span>
                    {usage.services?.name || "Dịch vụ"}
                  </td>
                  <td className="py-2 px-2 text-center text-gray-500 text-[11px]">
                    {usage.services?.unit || "Lần"}
                  </td>
                  <td className="py-2 px-2 text-center">{usage.quantity}</td>
                  <td className="py-2 px-2 text-right">
                    {parseInt(usage.total_price).toLocaleString()}
                  </td>
                </tr>
              ))}

              {/* Phụ thu (nếu có) */}
              {(invoice.surcharge > 0 ||
                invoice.foreign_surcharge_amount > 0) && (
                <tr className="border-b border-gray-50 bg-orange-50/30 text-[13px]">
                  <td
                    className="py-2 px-2 text-orange-800 font-medium"
                    colSpan={3}
                  >
                    Phụ thu (Quá người / Khách nước ngoài)
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-orange-700">
                    {(
                      invoice.surcharge + invoice.foreign_surcharge_amount
                    ).toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 4. Tổng kết tiền (Nén lại) */}
          <div className="flex justify-end">
            <div className="w-full sm:w-2/3 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Thanh toán:</span>
                <span className="font-medium capitalize">
                  {invoice.payment_method === "cash"
                    ? "Tiền mặt"
                    : invoice.payment_method === "transfer"
                    ? "Chuyển khoản"
                    : "Thẻ tín dụng"}
                </span>
              </div>
              <div className="border-t border-gray-800 pt-2 mt-2 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">
                  TỔNG CỘNG
                </span>
                <span className="text-2xl font-extrabold text-blue-800 whitespace-nowrap">
                  {parseInt(invoice.total_amount).toLocaleString()}{" "}
                  <span className="text-sm font-bold">VND</span>
                </span>
              </div>
            </div>
          </div>

          {/* Footer (Nén lại) */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-gray-400 print:mt-12">
            <p>Cảm ơn quý khách! | Wifi: luxestay123</p>
          </div>
        </div>
      </div>

      {/* Style CSS cho lúc in ấn (Giữ nguyên) */}
      <style>
        {`
          @media print {
            @page { margin: 0; size: auto; }
            body * { visibility: hidden; }
            #invoice-content, #invoice-content * { visibility: visible; }
            #invoice-content { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                margin: 0;
                padding: 20px; /* Giảm padding khi in */
                background-color: white;
                height: auto; /* Khi in thì cho nó dài tự nhiên */
                overflow: visible;
            }
            /* Ẩn các nút khi in */
            .print\\:hidden { display: none !important; }
          }
        `}
      </style>
    </div>
  );
};

export default InvoiceModal;
