import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Home,
  FileText,
  Printer,
  Download,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";

const BookingSuccessPage = () => {
  // Mock Data (Dữ liệu giả lập đơn hàng vừa đặt xong)
  const bookingSuccess = {
    id: "BK-7890234",
    roomTitle: "Nha Trang Luxury Resort & Spa",
    location: "Nha Trang, Vietnam",
    image:
      "https://images.unsplash.com/photo-1571896349842-6e5a513e610a?q=80&w=800&auto=format&fit=crop",
    checkIn: "Dec 12, 2025",
    checkOut: "Dec 17, 2025",
    nights: 5,
    guests: 2,
    totalPrice: 730,
    paymentMethod: "Credit Card (Visa ending in 4242)",
    customerEmail: "john.doe@example.com",
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen font-sans flex flex-col">
      <div className="flex-grow flex items-center justify-center pt-28 pb-20 px-4">
        {/* --- MAIN CARD --- */}
        <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Top Decor Line */}
          <div className="h-2 bg-gradient-to-r from-[#4facfe] to-[#00f2fe]"></div>

          <div className="p-8 md:p-12">
            {/* 1. SUCCESS HEADER */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
                <CheckCircle className="text-green-500 w-10 h-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#181E4B] mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-500">
                Yay! You successfully booked{" "}
                <span className="font-bold text-[#181E4B]">
                  {bookingSuccess.roomTitle}
                </span>
                .
                <br className="hidden md:block" />
                We have sent a confirmation email to{" "}
                <span className="text-[#0e7490] font-medium">
                  {bookingSuccess.customerEmail}
                </span>
                .
              </p>
            </div>

            {/* 2. BOOKING DETAILS TICKET */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
              {/* Header Ticket */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-6 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                    Booking ID
                  </p>
                  <p className="text-xl font-bold text-[#181E4B]">
                    {bookingSuccess.id}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <Printer size={16} /> Print
                  </button>
                  <button className="flex items-center gap-2 text-sm text-white bg-[#181E4B] px-4 py-2 rounded-lg hover:opacity-90 transition">
                    <Download size={16} /> Receipt
                  </button>
                </div>
              </div>

              {/* Body Ticket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Room Info */}
                <div className="flex gap-4">
                  <img
                    src={bookingSuccess.image}
                    alt="Room"
                    className="w-20 h-20 rounded-xl object-cover shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-[#181E4B] text-lg leading-tight mb-1">
                      {bookingSuccess.roomTitle}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin size={14} />
                      <span>{bookingSuccess.location}</span>
                    </div>
                  </div>
                </div>

                {/* Date & Guest Info */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} className="text-[#DF6951]" />
                      <span className="text-sm font-medium">Check-in</span>
                    </div>
                    <span className="font-bold text-[#181E4B] text-sm">
                      {bookingSuccess.checkIn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={18} className="text-[#DF6951]" />
                      <span className="text-sm font-medium">Check-out</span>
                    </div>
                    <span className="font-bold text-[#181E4B] text-sm">
                      {bookingSuccess.checkOut}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={18} className="text-[#DF6951]" />
                      <span className="text-sm font-medium">Guests</span>
                    </div>
                    <span className="font-bold text-[#181E4B] text-sm">
                      {bookingSuccess.guests} Guests
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Ticket (Total) */}
              <div className="mt-6 pt-6 border-t border-dashed border-gray-300 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Payment Method
                  </p>
                  <p className="text-sm font-medium text-[#181E4B]">
                    {bookingSuccess.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-[#DF6951]">
                    ${bookingSuccess.totalPrice}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. ACTIONS */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-[#DF6951] text-white font-bold py-4 px-8 rounded-xl hover:bg-orange-600 transition shadow-lg transform hover:-translate-y-0.5">
                  <Home size={20} /> Back to Home
                </button>
              </Link>

              <Link to="/profile/bookings" className="w-full md:w-auto">
                <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-[#181E4B] font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition">
                  <FileText size={20} /> View My Bookings
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
