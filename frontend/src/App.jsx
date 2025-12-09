import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Thêm Navigate để redirect

// Context
import { AuthProvider } from "./features/context/AuthContext";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import StaffLayout from "./components/layout/StaffLayout";
// Public Pages
import HomePage from "./features/home/HomePage";
import AuthPage from "./features/auth/AuthPage";
import SearchResultsPage from "./features/room/SearchResultsPage";
import RoomDetailsPage from "./features/room/RoomDetailsPage";

// Customer Pages
import BookingConfirmationPage from "./features/booking/BookingConfirmationPage";
import BookingSuccessPage from "./features/booking/BookingSuccessPage";
import MyBookingsPage from "./features/booking/MyBookingPage";

// Admin Pages
import DashboardPage from "./features/admin/DashboardPage";
import RoomManagementPage from "./features/admin/RoomManagementPage";
import BookingManagementPage from "./features/admin/BookingManagementPage";
import CustomerManagementPage from "./features/admin/CustomerManagementPage";
import StaffManagementPage from "./features/admin/StaffManagementPage";

// Staff Pages
import StaffDashboard from "./features/staff/StaffDashboard";
import StaffBookingPage from "./features/staff/StaffBookingPage";
import StaffCustomerPage from "./features/staff/StaffCustomerPage";
import CheckInPage from "./features/staff/CheckinPage";
import CheckOutPage from "./features/staff/CheckOutPage";
function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/room-details/:id" element={<RoomDetailsPage />} />

          {/* === CUSTOMER ROUTES === */}
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmationPage />}
          />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          {/* === KHU VỰC STAFF === */}
          <Route path="/staff" element={<StaffLayout />}>
            {/* Mặc định vào Dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="bookings" element={<StaffBookingPage />} />
            <Route path="customers" element={<StaffCustomerPage />} />
            <Route path="checkin" element={<CheckInPage />} />
            <Route path="checkout" element={<CheckOutPage />} />
          </Route>
          {/* === ADMIN ROUTES (Đã sửa lại cấu trúc chuẩn) === */}
          {/* Mọi route con bên trong sẽ được bao bọc bởi AdminLayout (có Sidebar) */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* Mặc định vào /admin sẽ tự nhảy sang /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Path con không cần dấu / ở đầu */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="rooms" element={<RoomManagementPage />} />
            <Route path="bookings" element={<BookingManagementPage />} />
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="staffs" element={<StaffManagementPage />} />
            {/* Trang cài đặt chưa làm thì để tạm div */}
            <Route
              path="settings"
              element={<div>Trang Cài đặt (Đang phát triển)</div>}
            />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
//frontend/src/App.jsx
