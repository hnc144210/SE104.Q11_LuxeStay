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
function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
