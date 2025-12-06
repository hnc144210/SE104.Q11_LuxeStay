import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CheckCircle,
  Home,
  FileText,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Download,
  Printer,
} from "lucide-react";

const BookingSuccessPage = () => {
  const location = useLocation();
  // Nhận dữ liệu từ BookingConfirmationPage gửi sang
  const successData = location.state;

  // 🛡️ Bảo vệ: Nếu user F5 hoặc vào trực tiếp link này -> Về Home (vì mất state)
  if (!successData) {
    return <Navigate to="/" replace />;
  }

  // Helper format
  const formatMoney = (amount) => Number(amount).toLocaleString("vi-VN") + " đ";

  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), "dd/MM/yyyy") : "N/A";
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <div className="flex-grow flex items-center justify-center pt-24 pb-20 px-4">
        <div className="bg-white max-w-3xl w-full rounded-3xl shadow-xl overflow-hidden relative animate-fade-in-up">
          {/* Decorative Top Line */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-teal-500"></div>

          <div className="p-8 md:p-12">
            {/* 1. HEADER SUCCESS */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-sm">
                <CheckCircle className="text-green-600 w-10 h-10 animate-bounce" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Đặt phòng thành công!
              </h1>
              <p className="text-gray-500">
                Mã đơn hàng:{" "}
                <span className="font-bold text-[#181E4B] text-lg">
                  #{successData.id}
                </span>
                <br className="hidden md:block mt-2" />
                Thông tin xác nhận đã được gửi tới{" "}
                <span className="font-medium text-gray-900">
                  {successData.customer_email}
                </span>
              </p>
            </div>

            {/* 2. TICKET / INVOICE CARD */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-8">
              {/* Header Ticket: Room Info */}
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row gap-5 bg-white items-start sm:items-center">
                <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                  <img
                    src={
                      successData.roomImage ||
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945"
                    }
                    alt="Room"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-[#181E4B] text-xl mb-1">
                    {successData.roomName}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin size={16} className="text-[#DF6951]" />
                    <span>Việt Nam</span>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Đã xác nhận
                </div>
              </div>

              {/* Body Ticket: Details Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" /> Check-in
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatDate(successData.check_in_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" /> Check-out
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatDate(successData.check_out_date)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Users size={16} className="text-blue-500" /> Số khách
                    </span>
                    <span className="font-bold text-gray-900">
                      {successData.num_guests} người
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-500" /> Thanh
                      toán
                    </span>
                    <span className="font-bold text-gray-900">
                      Chuyển khoản / Tiền mặt
                    </span>
                  </div>
                </div>

                {/* Ghi chú (Nếu có) */}
                {successData.note && (
                  <div className="md:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800 flex gap-2 items-start">
                    <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-xs uppercase block mb-1">
                        Ghi chú của bạn:
                      </span>
                      <p className="italic">"{successData.note}"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Ticket: Total Price */}
              <div className="bg-[#Fdfdfd] p-6 border-t border-dashed border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex gap-3">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition">
                    <Printer size={14} /> IN PHIẾU
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition">
                    <Download size={14} /> TẢI VỀ
                  </button>
                </div>

                <div className="text-right w-full sm:w-auto">
                  <div className="flex items-center justify-between sm:justify-end gap-8 mb-1">
                    <span className="text-gray-500 text-xs font-bold uppercase">
                      Tổng trị giá
                    </span>
                    <span className="text-xl font-bold text-[#181E4B]">
                      {formatMoney(successData.total_amount)}
                    </span>
                  </div>
                  {/* Hiển thị tiền cọc nếu có */}
                  <div className="flex items-center justify-between sm:justify-end gap-8">
                    <span className="text-gray-500 text-xs">
                      Cọc trước (0%):
                    </span>
                    <span className="text-sm font-bold text-[#DF6951]">
                      {formatMoney(successData.deposit_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="w-full sm:w-auto">
                <button className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <Home size={18} />
                  Về trang chủ
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
