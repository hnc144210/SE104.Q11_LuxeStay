import React from "react";
import { Routes, Route } from "react-router-dom";

// 1. Import AuthProvider từ file Context bạn vừa tạo
import { AuthProvider } from "./features/context/AuthContext.jsx";
// 2. Import các trang (Features)

import HomePage from "./features/home/HomePage.jsx";
// Lưu ý: Nếu AuthPage export default thì import như dòng dưới, nếu export { AuthPage } thì giữ nguyên như cũ của bạn
import AuthPage from "./features/auth/AuthPage.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import SearchResultsPage from "./features/room/SearchResultsPage"; // Import trang mới
import RoomDetailsPage from "./features/room/RoomDetailsPage.jsx";
import BookingConfirmationPage from "./features/booking/BookingConfirmationPage.jsx";
import BookingSuccessPage from "./features/booking/BookingSuccessPage.jsx";
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* 👇 THÊM DÒNG NÀY */}
        <Route path="/search-results" element={<SearchResultsPage />} />

        <Route path="/room-details" element={<RoomDetailsPage />} />
        <Route
          path="/booking-confirmation"
          element={<BookingConfirmationPage />}
        />
        <Route path="/booking-success" element={<BookingSuccessPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
//frontend/src/App.jsx
