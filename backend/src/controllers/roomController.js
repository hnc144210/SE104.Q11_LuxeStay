const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
exports.checkAvailability = async (req, res) => {
  try {
    const { check_in_date, check_out_date, room_type_id, max_guests } =
      req.query;

    console.log("🔍 Đang kiểm tra phòng:", {
      check_in_date,
      check_out_date,
      room_type_id,
    });

    // --- 1. VALIDATION NGÀY THÁNG (FIX LỖI CRASH DATE) ---
    if (!check_in_date || !check_out_date) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ngày check-in/out" });
    }

    const reqCheckIn = new Date(check_in_date);
    const reqCheckOut = new Date(check_out_date);

    // Kiểm tra xem ngày có hợp lệ không (Tránh NaN)
    if (isNaN(reqCheckIn.getTime()) || isNaN(reqCheckOut.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Định dạng ngày không hợp lệ" });
    }

    // Đặt giờ về 0 để so sánh ngày chuẩn xác
    reqCheckIn.setHours(0, 0, 0, 0);
    reqCheckOut.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reqCheckIn < today) {
      return res.status(400).json({
        success: false,
        message: "Ngày check-in không được ở quá khứ",
      });
    }
    if (reqCheckOut <= reqCheckIn) {
      return res
        .status(400)
        .json({ success: false, message: "Ngày check-out phải sau check-in" });
    }

    // --- 2. LẤY DỮ LIỆU TỪ SUPABASE ---
    let roomsQuery = supabase
      .from("rooms")
      .select(
        `
        id, 
        room_number, 
        status, 
        room_type_id,
        room_types (
          id, name, base_price, max_guests
        )
      `
      )
      .neq("status", "maintenance");

    if (room_type_id) {
      roomsQuery = roomsQuery.eq("room_type_id", room_type_id);
    }

    const { data: allRooms, error: roomsError } = await roomsQuery;

    if (roomsError) {
      console.error("Supabase Error (Rooms):", roomsError);
      throw new Error(roomsError.message);
    }

    // --- 3. KIỂM TRA BOOKING & RENTAL ---
    const { data: potentialBookings, error: bookingErr } = await supabase
      .from("bookings")
      .select("room_id, check_in_date, check_out_date")
      .in("status", ["pending", "confirmed"])
      .gte("check_out_date", check_in_date); // Lấy booking kết thúc SAU ngày khách định đến

    if (bookingErr) throw new Error(bookingErr.message);

    const { data: activeRentals, error: rentalErr } = await supabase
      .from("rentals")
      .select("room_id, start_date, end_date")
      .eq("status", "active");

    if (rentalErr) throw new Error(rentalErr.message);

    // --- 4. XỬ LÝ LOGIC TRÙNG LỊCH ---
    const busyRoomIds = new Set();

    // Check Bookings
    if (potentialBookings) {
      potentialBookings.forEach((b) => {
        const bCheckIn = new Date(b.check_in_date);
        const bCheckOut = new Date(b.check_out_date);
        bCheckIn.setHours(0, 0, 0, 0);
        bCheckOut.setHours(0, 0, 0, 0);

        // Logic trùng: (Start A < End B) && (End A > Start B)
        if (bCheckIn < reqCheckOut && bCheckOut > reqCheckIn) {
          busyRoomIds.add(b.room_id);
        }
      });
    }

    // Check Rentals
    if (activeRentals) {
      activeRentals.forEach((r) => {
        const rStart = new Date(r.start_date);
        rStart.setHours(0, 0, 0, 0);

        if (!r.end_date) {
          // Nếu không có ngày kết thúc (đang ở vô thời hạn) -> Bận
          busyRoomIds.add(r.room_id);
        } else {
          const rEnd = new Date(r.end_date);
          rEnd.setHours(0, 0, 0, 0);
          if (rStart < reqCheckOut && rEnd > reqCheckIn) {
            busyRoomIds.add(r.room_id);
          }
        }
      });
    }

    // --- 5. LỌC VÀ FORMAT DỮ LIỆU (FIX LỖI NULL POINTER) ---
    // Lọc phòng trống và lọc theo số khách
    let availableRooms = allRooms.filter((room) => {
      if (busyRoomIds.has(room.id)) return false;

      // Kiểm tra an toàn: Nếu room_types bị null (do lỗi join), bỏ qua phòng này
      if (!room.room_types) return false;

      if (max_guests && room.room_types.max_guests < parseInt(max_guests)) {
        return false;
      }
      return true;
    });

    // Tính số đêm
    const timeDiff = reqCheckOut.getTime() - reqCheckIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const finalNights = nights > 0 ? nights : 1;

    // Map dữ liệu trả về (Dùng Optional Chaining ?. để an toàn)
    const formattedRooms = availableRooms.map((room) => ({
      room_id: room.id,
      room_number: room.room_number,
      room_type: room.room_types, // Đã check !null ở filter trên
      pricing: {
        base_price: Number(room.room_types?.base_price || 0),
        nights: finalNights,
        total_price: Number(room.room_types?.base_price || 0) * finalNights,
        currency: "VND",
      },
      status: room.status,
    }));

    // Group theo loại phòng
    const groupedByType = formattedRooms.reduce((acc, room) => {
      const typeId = room.room_type.id;
      if (!acc[typeId]) {
        acc[typeId] = { room_type: room.room_type, count: 0, rooms: [] };
      }
      acc[typeId].count++;
      acc[typeId].rooms.push(room);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách phòng trống thành công",
      data: {
        search_criteria: {
          check_in_date,
          check_out_date,
          nights: finalNights,
          max_guests,
        },
        all_available_rooms: formattedRooms,
        rooms_by_type: Object.values(groupedByType),
      },
    });
  } catch (error) {
    // Log lỗi chi tiết ra terminal để debug
    console.error(" API Error [checkAvailability]:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra phòng trống",
      error: error.message || "Unknown error",
    });
  }
};
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: room, error } = await supabase
      .from("rooms")
      .select(
        `
        id,
        room_number,
        status,
        note,
        room_types (
          id,
          name,
          base_price,
          max_guests
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Get room detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
exports.getRooms = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;

    // Tính phân trang
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("rooms").select(
      `
        id,
        room_number,
        status,
        note,
        created_at,
        room_types (
          id,
          name,
          base_price,
          max_guests
        )
      `,
      { count: "exact" }
    );

    // Áp dụng bộ lọc nếu có
    if (type) query = query.eq("room_type_id", type);
    if (status) query = query.eq("status", status);

    // Áp dụng phân trang & sắp xếp
    query = query.range(from, to).order("room_number", { ascending: true });

    const { data, error, count } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      message: "Lấy danh sách phòng thành công",
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("getRooms error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 2. POST: Tạo phòng mới ---
exports.createRoom = async (req, res) => {
  try {
    const { room_number, room_type_id, status = "available", note } = req.body;

    // Validate
    if (!room_number || !room_type_id) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin phòng" });
    }

    // Kiểm tra số phòng trùng
    const { data: exist } = await supabase
      .from("rooms")
      .select("id")
      .eq("room_number", room_number)
      .single();

    if (exist) {
      return res
        .status(400)
        .json({ success: false, message: `Phòng ${room_number} đã tồn tại` });
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert({ room_number, room_type_id, status, note })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Tạo phòng thành công",
      data: data,
    });
  } catch (error) {
    console.error("createRoom error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 3. PUT: Cập nhật thông tin phòng ---
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, room_type_id, note } = req.body;

    const { data, error } = await supabase
      .from("rooms")
      .update({ room_number, room_type_id, note })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Cập nhật phòng thành công",
      data: data,
    });
  } catch (error) {
    console.error("updateRoom error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 4. PUT: Cập nhật TRẠNG THÁI phòng (API riêng biệt) ---
exports.updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // available, occupied, maintenance, cleaning

    const validStatuses = ["available", "occupied", "maintenance", "cleaning"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ" });
    }

    const { data, error } = await supabase
      .from("rooms")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: data,
    });
  } catch (error) {
    console.error("updateRoomStatus error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 5. DELETE: Xóa phòng ---
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra ràng buộc (nếu phòng đang có booking hoặc rental active thì ko cho xóa)
    // Tạm thời xóa thẳng (Supabase sẽ báo lỗi nếu có Foreign Key constraint)
    const { error } = await supabase.from("rooms").delete().eq("id", id);

    if (error) {
      // Mã lỗi Postgres cho vi phạm khóa ngoại là 23503
      if (error.code === "23503") {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa phòng đang có dữ liệu đặt phòng/thuê.",
        });
      }
      throw error;
    }

    return res.json({
      success: true,
      message: "Xóa phòng thành công",
    });
  } catch (error) {
    console.error("deleteRoom error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
//controllers/roomController.js
