import React, { useState } from "react";
import BookingCheckIn from "./components/BookingCheckIn";
import WalkInCheckIn from "./components/WalkInCheckIn";

const CheckInPage = () => {
  const [activeTab, setActiveTab] = useState("booking");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Check-In Khách Hàng</h1>

      {/* Tab Switcher */}
      <div className="bg-white p-1.5 rounded-xl inline-flex border border-gray-200 shadow-sm">
        {["booking", "walkin"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            {tab === "booking"
              ? "Từ Booking Đặt Trước"
              : "Khách Vãng Lai (Walk-in)"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[500px]">
        {activeTab === "booking" ? <BookingCheckIn /> : <WalkInCheckIn />}
      </div>
    </div>
  );
};

export default CheckInPage;
//src/features/staff/CheckinPage.jsx
