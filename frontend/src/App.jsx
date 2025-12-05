// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Context
import { AuthProvider } from "./features/context/AuthContext";

// Public Pages
import HomePage from "./features/home/HomePage";
import AuthPage from "./features/auth/AuthPage";
import SearchResultsPage from "./features/room/SearchResultsPage";
import RoomDetailsPage from "./features/room/RoomDetailsPage";

// Customer Pages (protected by logic inside)
import BookingConfirmationPage from "./features/booking/BookingConfirmationPage";
import BookingSuccessPage from "./features/booking/BookingSuccessPage";
import MyBookingsPage from "./features/booking/MyBookingPage";

// Admin/Staff Pages (protected by logic inside)
import BookingManagementPage from "./features/admin/BookingManagementPage";
import CustomerManagementPage from "./features/admin/CustomerManagementPage";

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
          <Route path="/booking-success/:id" element={<BookingSuccessPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />

          {/* === ADMIN/STAFF ROUTES === */}
          <Route path="/admin/bookings" element={<BookingManagementPage />} />
          <Route path="/admin/customers" element={<CustomerManagementPage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
//App.jsx
