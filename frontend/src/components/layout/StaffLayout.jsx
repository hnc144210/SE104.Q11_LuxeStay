import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import StaffSidebar from "../StaffSidebar";
import { useAuthContext } from "../../features/context/AuthContext"; // Sửa đường dẫn

const StaffLayout = () => {
  const { user } = useAuthContext();

  // Bảo vệ route: Nếu chưa login hoặc không phải staff -> đá ra ngoài
  // Lưu ý: Nếu user load trang lần đầu, user có thể null, cần handle loading state ở AuthContext
  if (user && user.role !== "staff" && user.role !== "admin") {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar cố định bên trái */}
      <StaffSidebar />

      {/* Nội dung chính bên phải */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 overflow-hidden">
        {/* Header đơn giản (nếu cần) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">
                {user?.full_name || "Nhân viên"}
              </p>
              <p className="text-xs text-green-600">Đang làm việc</p>
            </div>
            <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
              S
            </div>
          </div>
        </header>

        {/* Nội dung thay đổi (Outlet) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
