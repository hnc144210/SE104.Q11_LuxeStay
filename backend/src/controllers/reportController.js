const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper: Lấy chuỗi ngày YYYY-MM-DD theo giờ địa phương
const getLocalDateString = (dateObj) => {
  const offset = dateObj.getTimezoneOffset() * 60000;
  const localDate = new Date(dateObj.getTime() - offset);
  return localDate.toISOString().split("T")[0];
};

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStr = getLocalDateString(now); // "2025-12-09"

    // Khung giờ lọc cho Timestamp (00:00 -> 23:59)
    const startOfDay = `${todayStr}T00:00:00.000Z`;
    const endOfDay = `${todayStr}T23:59:59.999Z`;

    // 7 ngày trước
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startOf7DaysStr = getLocalDateString(sevenDaysAgo);
    const startOf7DaysTimestamp = `${startOf7DaysStr}T00:00:00.000Z`;

    // --- 1. SỐ LIỆU TỔNG HỢP ---

    // a. DOANH THU HÔM NAY (Từ Invoices)
    const { data: invoicesToday, error: invErr } = await supabase
      .from("invoices")
      .select("total_amount")
      .gte("issue_date", startOfDay)
      .lte("issue_date", endOfDay);

    if (invErr) throw invErr;
    const revenueToday = invoicesToday.reduce(
      (sum, inv) => sum + (Number(inv.total_amount) || 0),
      0
    );

    // b. TỈ LỆ LẤP ĐẦY (Từ Rooms)
    const { count: totalRooms } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true });
    const { count: occupiedRooms } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "occupied");
    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // c. CHECK-IN HÔM NAY (Logic mới)
    // = (Đã đến: Rentals start hôm nay) + (Sắp đến: Bookings confirmed check-in hôm nay)

    // 1. Đếm Rentals bắt đầu hôm nay (Bao gồm cả Walk-in + Booking đã check-in)
    const { count: rentalsStartedToday, error: rentStartErr } = await supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .gte("start_date", startOfDay)
      .lte("start_date", endOfDay);

    if (rentStartErr) throw rentStartErr;

    const checkInsToday = rentalsStartedToday;

    // d. CHECK-OUT HÔM NAY (Logic mới)
    // = Tất cả Rentals có ngày kết thúc là hôm nay (Bao gồm cả Walk-in và Booking)
    // Bảng Rentals chứa tất cả khách đang ở, nên chỉ cần query bảng này là đủ.
    const { count: checkOutsToday, error: rentEndErr } = await supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")

      .gte("end_date", startOfDay)
      .lte("end_date", endOfDay);
    // Lưu ý: Không cần filter status, vì dù 'active' (sắp đi) hay 'completed' (đã đi) thì đều là Check-out hôm nay.
    console.log("checkOutsToday : ", checkOutsToday);
    if (rentEndErr) throw rentEndErr;

    // --- 2. BIỂU ĐỒ DOANH THU 7 NGÀY ---
    const { data: weeklyInvoices } = await supabase
      .from("invoices")
      .select("total_amount, issue_date")
      .gte("issue_date", startOf7DaysTimestamp);

    const revenueChartData = [];
    const dateMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const [year, month, day] = dateStr.split("-");
      const displayStr = `${day}/${month}`;
      dateMap[dateStr] = { name: displayStr, revenue: 0 };
    }

    weeklyInvoices.forEach((inv) => {
      const key = inv.issue_date.split("T")[0];
      if (dateMap[key]) {
        dateMap[key].revenue += Number(inv.total_amount);
      }
    });
    Object.values(dateMap).forEach((val) => revenueChartData.push(val));

    // --- 3. CÁC THỐNG KÊ KHÁC (Giữ nguyên) ---
    const { data: customers } = await supabase.from("customers").select("type");
    const customerStats = [
      { name: "Trong nước", value: 0, color: "#3B82F6" },
      { name: "Quốc tế", value: 0, color: "#F59E0B" },
    ];
    customers.forEach((c) => {
      if (c.type === "domestic") customerStats[0].value++;
      else if (c.type === "foreign") customerStats[1].value++;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: topBookings } = await supabase
      .from("bookings")
      .select(`room:rooms(room_type:room_types(name))`)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const roomTypeCount = {};
    topBookings.forEach((b) => {
      const typeName = b.room?.room_type?.name || "Khác";
      roomTypeCount[typeName] = (roomTypeCount[typeName] || 0) + 1;
    });
    const topRoomTypes = Object.entries(roomTypeCount)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          revenueToday,
          occupancyRate,
          checkInsToday,
          checkOutsToday,
          totalRooms,
          occupiedRooms,
        },
        charts: {
          revenueLast7Days: revenueChartData,
          customerTypes: customerStats,
          topRoomTypes: topRoomTypes,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
