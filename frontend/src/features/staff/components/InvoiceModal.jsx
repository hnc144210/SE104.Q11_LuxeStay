// src/features/staff/components/InvoiceModal.jsx
import React from "react";
import { X, Printer } from "lucide-react";

const InvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  // Format tiền tệ VND
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format ngày giờ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-green-100 text-green-700 p-1 rounded">
              <CheckCircle size={16} />
            </span>
            Thanh toán thành công
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nội dung Hóa đơn */}
        <div className="p-8" id="invoice-print">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-blue-900">
              Hóa Đơn Thanh Toán
            </h1>
            <p className="text-gray-500 text-sm">Mã hóa đơn: #{invoice.id}</p>
            <p className="text-gray-500 text-sm">
              Ngày lập: {formatDate(invoice.issue_date)}
            </p>
          </div>

          {/* Thông tin khách hàng & Phòng */}
          <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Khách hàng:</p>
              <p className="font-bold text-lg">
                {invoice.customers?.full_name}
              </p>
              <p>{invoice.customers?.phone_number}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Phòng:</p>
              <p className="font-bold text-lg">
                {invoice.rentals?.rooms?.room_number} -{" "}
                {invoice.rentals?.rooms?.room_types?.name}
              </p>
              <p className="text-xs text-gray-400">
                Check-in: {formatDate(invoice.rentals?.start_date)}
              </p>
            </div>
          </div>

          <hr className="border-dashed border-gray-300 my-4" />

          {/* Bảng chi tiết tiền */}
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Tiền phòng:</span>
              <span className="font-medium">
                {formatMoney(invoice.room_charge)}
              </span>
            </div>

            {invoice.service_charge > 0 && (
              <div className="flex justify-between">
                <span>Dịch vụ sử dụng:</span>
                <span className="font-medium">
                  {formatMoney(invoice.service_charge)}
                </span>
              </div>
            )}

            {invoice.surcharge > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Phụ thu quá người:</span>
                <span>+ {formatMoney(invoice.surcharge)}</span>
              </div>
            )}

            {invoice.foreign_surcharge_amount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Phụ thu khách nước ngoài:</span>
                <span>+ {formatMoney(invoice.foreign_surcharge_amount)}</span>
              </div>
            )}
          </div>

          <hr className="border-gray-800 my-4" />

          {/* Tổng cộng */}
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-500 text-xs">Phương thức thanh toán</p>
              <p className="font-bold uppercase text-sm">
                {invoice.payment_method === "cash"
                  ? "Tiền mặt"
                  : invoice.payment_method}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Tổng thanh toán</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatMoney(invoice.total_amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition"
          >
            <Printer size={18} /> In hóa đơn
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-100 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
