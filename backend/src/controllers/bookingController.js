// src/controllers/bookingController.js
const { supabase } = require("../utils/supabaseClient");
const { getSystemSettings } = require("../utils/settingHelper"); // GET /api/v1/bookings/:id
exports.getBookingById = async (req, res) => {
  const bookingId = req.params.id;
  const user = req.user; // lấy từ middleware authenticate

  try {
    // Lấy booking + join room + room_type + customer
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        check_in_date,
        check_out_date,
        deposit_amount,
        created_at,
        customer:customers (
          id,
          full_name,
          phone_number,
          email,
          type
        ),
        room:rooms (
          id,
          room_number,
          status,
          room_type:room_types (
            id,
            name,
            base_price,
            max_guests
          )
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (error) {
      console.error("getBookingById error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi truy vấn booking",
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    // 🔒 Phân quyền:
    // - customer: chỉ xem được booking của chính mình
    // - staff/admin: xem tất cả
    if (user.role === "customer") {
      if (!user.customerId || booking.customer.id !== user.customerId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem booking này",
        });
      }
    }

    return res.json({
      success: true,
      data: {
        id: booking.id,
        status: booking.status,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        deposit_amount: booking.deposit_amount,
        created_at: booking.created_at,
        customer: booking.customer,
        room: booking.room,
      },
    });
  } catch (err) {
    console.error("getBookingById exception:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

/**
 * GET /api/v1/bookings/mine
 * Customer xem danh sách booking của chính mình
 */
exports.getMyBookings = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Chưa đăng nhập",
      });
    }

    if (user.role !== "customer" || !user.customerId) {
      return res.status(403).json({
        success: false,
        message: "Chỉ khách hàng mới xem được danh sách booking của mình",
      });
    }

    const customerId = user.customerId;

    // Có thể nhận thêm ?status=pending|confirmed|cancelled nếu muốn
    const { status } = req.query;

    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        check_in_date,
        check_out_date,
        status,
        deposit_amount,
        created_at,
        rooms (
          id,
          room_number,
          room_type_id,
          room_types (
            id,
            name
          )
        )
      `
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("getMyBookings error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách booking",
      });
    }

    return res.json({
      success: true,
      message: "Lấy danh sách booking thành công",
      data: bookings,
    });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// =====================
// POST /api/v1/bookings
// Khách tạo đơn đặt phòng
// =====================
exports.createBookingForCustomer = async (req, res) => {
  try {
    const user = req.user;

    // 1. Kiểm tra quyền
    if (!user || user.role !== "customer" || !user.customerId) {
      return res.status(403).json({
        success: false,
        message: "Chỉ khách hàng đăng nhập mới được đặt phòng",
      });
    }

    const {
      room_id,
      check_in_date,
      check_out_date,
      num_guests,
      deposit_amount,
      note,
    } = req.body;

    // 2. Validate Input
    if (!room_id || !check_in_date || !check_out_date || !num_guests) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (phòng, ngày, số khách)",
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today)
      return res
        .status(400)
        .json({ success: false, message: "Ngày check-in không hợp lệ" });
    if (checkOut <= checkIn)
      return res
        .status(400)
        .json({ success: false, message: "Ngày check-out phải sau check-in" });

    // 3. Lấy thông tin Phòng
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select(
        `
        id, room_number, status, 
        room_types (id, name, max_guests, base_price)
      `
      )
      .eq("id", room_id)
      .single();

    if (roomError || !room)
      return res
        .status(404)
        .json({ success: false, message: "Phòng không tồn tại" });

    // Nếu phòng ĐANG ở trạng thái maintenance thì không cho đặt
    if (room.status === "maintenance") {
      return res
        .status(400)
        .json({ success: false, message: "Phòng đang bảo trì, không thể đặt" });
    }

    // 4. Kiểm tra số khách (ĐÃ NỚI LỎNG)
    const settings = await getSystemSettings();
    const stdGuests = room.room_types.max_guests || settings.maxGuests;
    const HARD_LIMIT = stdGuests + 3; // Cho phép vượt quá tối đa 3 người

    if (num_guests > HARD_LIMIT) {
      return res.status(400).json({
        success: false,
        message: `Phòng này chỉ nhận tối đa ${HARD_LIMIT} khách (bao gồm ở ghép).`,
      });
    }

    // 5. Kiểm tra Trùng lịch
    const { data: conflictBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", room_id)
      .in("status", ["pending", "confirmed", "checked_in"])
      .or(
        `and(check_in_date.lte.${check_out_date},check_out_date.gte.${check_in_date})`
      );

    const { data: conflictRentals } = await supabase
      .from("rentals")
      .select("id")
      .eq("room_id", room_id)
      .eq("status", "active")
      .or(
        `and(start_date.lte.${check_out_date},end_date.gte.${check_in_date})`
      );

    if (
      (conflictBookings && conflictBookings.length > 0) ||
      (conflictRentals && conflictRentals.length > 0)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Phòng đã kín trong thời gian này" });
    }

    // 6. Tính toán tiền cọc (Nếu FE gửi 0 thì BE tự tính)
    let finalDeposit = deposit_amount;
    if (!finalDeposit) {
      const nights =
        Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
      const basePrice = room.room_types.base_price;
      let totalEst = basePrice * nights;

      // Tính phụ thu nếu quá người
      if (num_guests > stdGuests) {
        const extra = num_guests - stdGuests;
        totalEst += basePrice * settings.surchargeRate * extra * nights;
      }

      // Tính tiền cọc
      finalDeposit = totalEst * (settings.depositPercent / 100);
    }

    // 7. Tạo Booking
    const { data: newBooking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.customerId,
        room_id,
        check_in_date,
        check_out_date,
        num_guests,
        deposit_amount: finalDeposit,
        status: "pending",
        created_by: user.userId,
        note,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Booking Error:", insertError);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi tạo đơn đặt phòng" });
    }

    // 8. Cập nhật trạng thái phòng -> 'maintenance' (THEO YÊU CẦU CỦA BẠN)
    // Lưu ý: Việc này sẽ làm phòng chuyển sang màu xám/bảo trì ngay lập tức
    const { error: updateRoomError } = await supabase
      .from("rooms")
      .update({ status: "maintenance" })
      .eq("id", room_id);

    if (updateRoomError) {
      console.error("Lỗi update status phòng:", updateRoomError);
    }

    return res.status(201).json({
      success: true,
      message: "Đặt phòng thành công",
      data: newBooking,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
// =====================
// DELETE /api/v1/bookings/:id
// Khách hủy booking của chính mình
// =====================
exports.cancelMyBooking = async (req, res) => {
  try {
    const user = req.user;
    const bookingId = req.params.id;

    // Phải là customer
    if (!user || user.role !== "customer" || !user.customerId) {
      return res.status(403).json({
        success: false,
        message: "Chỉ khách hàng đăng nhập mới được hủy booking",
      });
    }

    // 1️⃣ Lấy booking cần hủy
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, customer_id, status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    // 2️⃣ Kiểm tra quyền sở hữu
    if (booking.customer_id !== user.customerId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền hủy booking này",
      });
    }

    // 3️⃣ Kiểm tra trạng thái hợp lệ để hủy
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy booking ở trạng thái "${booking.status}"`,
      });
    }

    // 4️⃣ Cập nhật trạng thái -> cancelled
    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select("id, status")
      .single();

    if (updateError) {
      console.error("cancelMyBooking updateError:", updateError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi hủy booking",
      });
    }

    return res.json({
      success: true,
      message: "Hủy booking thành công",
      data: updated,
    });
  } catch (err) {
    console.error("cancelMyBooking exception:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
// =====================
// GET /api/v1/admin/bookings
// GET /api/v1/staff/bookings
// Staff/Admin xem danh sách booking với filter
// =====================
exports.getBookingsForStaffAdmin = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !["staff", "admin"].includes(user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    const { status, room_id, from, to } = req.query;

    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        check_in_date,
        check_out_date,
        deposit_amount,
        num_guests, 
        created_at,
        
        customer:customers (
          id,
          full_name,
          phone_number,
          email
        ),
        
        room:rooms (
          id,
          room_number,
          room_type:room_types (
            name
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    // Các bộ lọc giữ nguyên
    if (status) query = query.eq("status", status);
    if (room_id) query = query.eq("room_id", room_id);
    if (from) query = query.gte("check_in_date", from);
    if (to) query = query.lte("check_out_date", to);

    const { data: bookings, error } = await query;

    if (error) {
      console.error("getBookingsForStaffAdmin error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi lấy dữ liệu" });
    }

    return res.json({
      success: true,
      message: "Lấy danh sách thành công",
      data: bookings,
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// =====================
// DELETE /api/v1/admin/bookings/:id
// DELETE /api/v1/staff/bookings/:id
// Staff/Admin hủy bất kỳ booking hợp lệ
// =====================
exports.cancelBookingByStaffAdmin = async (req, res) => {
  try {
    const user = req.user;
    const bookingId = req.params.id;

    if (!user || !["staff", "admin"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ staff/admin được hủy booking",
      });
    }

    // 1️⃣ Lấy booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    // 2️⃣ Kiểm tra trạng thái
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy booking ở trạng thái "${booking.status}"`,
      });
    }

    // 3️⃣ Update -> cancelled
    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select("id, status")
      .single();

    if (updateError) {
      console.error("cancelBookingByStaffAdmin updateError:", updateError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi hủy booking",
      });
    }

    return res.json({
      success: true,
      message: "Hủy booking thành công (staff/admin)",
      data: updated,
    });
  } catch (err) {
    console.error("cancelBookingByStaffAdmin exception:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ... (code cũ giữ nguyên)

// --- 6. PUT: Cập nhật thông tin Booking ---
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_id,
      check_in_date,
      check_out_date,
      status,
      deposit_amount,
      num_guests,
    } = req.body;

    // 1. Kiểm tra booking tồn tại
    const { data: booking, error: findError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !booking) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy booking" });
    }

    // 2. Nếu đổi phòng hoặc đổi ngày -> Check trùng lịch
    if (room_id || check_in_date || check_out_date) {
      const newRoomId = room_id || booking.room_id;
      const newCheckIn = check_in_date || booking.check_in_date;
      const newCheckOut = check_out_date || booking.check_out_date;

      if (new Date(newCheckOut) <= new Date(newCheckIn)) {
        return res.status(400).json({
          success: false,
          message: "Ngày check-out phải sau check-in",
        });
      }

      // Check trùng (loại trừ chính booking này ra)
      const { data: conflicts } = await supabase
        .from("bookings")
        .select("id")
        .eq("room_id", newRoomId)
        .neq("id", id)
        .in("status", ["pending", "confirmed", "checked_in"])
        .or(
          `and(check_in_date.lte.${newCheckOut},check_out_date.gte.${newCheckIn})`
        );

      if (conflicts && conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Phòng đã bị đặt trong khoảng thời gian mới",
        });
      }
    }

    // 3. Update
    const updates = {};
    if (room_id) updates.room_id = room_id;
    if (check_in_date) updates.check_in_date = check_in_date;
    if (check_out_date) updates.check_out_date = check_out_date;
    if (status) updates.status = status;
    if (deposit_amount !== undefined) updates.deposit_amount = deposit_amount;
    if (num_guests) updates.num_guests = num_guests;

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: "Cập nhật booking thành công",
      data: updated,
    });
  } catch (err) {
    console.error("Update booking error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 7. POST: Gia hạn Booking (Extend) ---
exports.extendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_check_out_date } = req.body;

    if (!new_check_out_date) {
      return res
        .status(400)
        .json({ success: false, message: "Cần nhập ngày check-out mới" });
    }

    const { data: booking, error: findError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking không tồn tại" });
    }

    if (new Date(new_check_out_date) <= new Date(booking.check_out_date)) {
      return res.status(400).json({
        success: false,
        message: "Ngày mới phải sau ngày check-out cũ",
      });
    }

    // Check trùng lịch cho khoảng thời gian gia hạn thêm
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", booking.room_id)
      .neq("id", id)
      .in("status", ["pending", "confirmed", "checked_in"])
      .or(
        `and(check_in_date.lte.${new_check_out_date},check_out_date.gte.${booking.check_out_date})`
      );

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phòng đã có người đặt trong những ngày gia hạn thêm",
      });
    }

    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({ check_out_date: new_check_out_date })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: "Gia hạn phòng thành công",
      data: updated,
    });
  } catch (err) {
    console.error("Extend booking error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// src/controllers/bookingController.js
