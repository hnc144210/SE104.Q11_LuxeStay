const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// --- 1. GET: Lấy danh sách Staff (từ bảng profiles) ---
exports.getStaffs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, department } = req.query;

    // Tính phân trang
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // QUERY: Chỉ lấy bản ghi có role là 'staff'
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        role
      `,
        { count: "exact" }
      )
      .eq("role", "staff"); // <--- QUAN TRỌNG: Chỉ lấy Staff

    // Áp dụng tìm kiếm
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Áp dụng bộ lọc bổ sung
    if (status) query = query.eq("status", status);
    if (department) query = query.eq("department", department);

    // Áp dụng phân trang & sắp xếp
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      message: "Lấy danh sách nhân viên thành công",
      data: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("getStaffs error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 2. GET: Lấy chi tiết một Staff ---
exports.getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: staff, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .eq("role", "staff") // Đảm bảo ID này là của nhân viên
      .single();

    if (error || !staff) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên",
      });
    }

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("getStaffById error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// --- 3. POST: Tạo Staff mới (Insert vào profiles) ---
exports.createStaff = async (req, res) => {
  try {
    const { full_name, email } = req.body;

    if (!full_name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Tên và Email là bắt buộc" });
    }

    // Kiểm tra Email trùng trong profiles
    const { data: exist } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (exist) {
      return res
        .status(400)
        .json({ success: false, message: `Email ${email} đã được sử dụng` });
    }

    // Insert với role cứng là 'staff'
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        full_name,
        email,
        role: "staff", // <--- QUAN TRỌNG
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: "Thêm nhân viên thành công",
      data: data,
    });
  } catch (error) {
    console.error("createStaff error:", error);
    // Xử lý lỗi đặc thù Supabase nếu cần
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

/**
 * PUT /users/staff/:id
 * Cập nhật thông tin nhân viên
 */
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, staff_code } = req.body;

    // Kiểm tra nhân viên có tồn tại không
    const { data: existingStaff, error: checkError } = await supabase
      .from("profiles")
      .select("id, email, staff_code")
      .eq("id", id)
      .eq("role", "staff")
      .single();

    if (checkError || !existingStaff) {
      return errorResponse(res, 404, "Không tìm thấy nhân viên");
    }

    // Kiểm tra email trùng nếu có thay đổi
    if (email && email !== existingStaff.email) {
      const { data: existEmail } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .neq("id", id)
        .single();

      if (existEmail) {
        return errorResponse(res, 400, `Email ${email} đã được sử dụng`);
      }
    }

    // Kiểm tra staff_code trùng nếu có thay đổi
    if (staff_code && staff_code !== existingStaff.staff_code) {
      const { data: existCode } = await supabase
        .from("profiles")
        .select("id")
        .eq("staff_code", staff_code)
        .neq("id", id)
        .single();

      if (existCode) {
        return errorResponse(
          res,
          400,
          `Mã nhân viên ${staff_code} đã được sử dụng`
        );
      }
    }

    // Tạo object update chỉ với các field được gửi lên
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (staff_code !== undefined) updateData.staff_code = staff_code;

    // Kiểm tra có data để update không
    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, 400, "Không có dữ liệu để cập nhật");
    }

    // Cập nhật thông tin
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .eq("role", "staff")
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Cập nhật thông tin nhân viên thành công",
      data: data,
    });
  } catch (error) {
    console.error("updateStaff error:", error);
    return errorResponse(res, 500, "Lỗi server");
  }
};

// --- 5. DELETE: Xóa Staff (Xóa Profile) ---
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa khỏi bảng profiles
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)
      .eq("role", "staff"); // Chỉ xóa nếu là staff

    if (error) {
      if (error.code === "23503") {
        return errorResponse(
          res,
          400,
          "Không thể xóa nhân viên này do có dữ liệu liên quan."
        );
      }
      throw error;
    }

    return res.json({
      success: true,
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    console.error("deleteStaff error:", error);
    return errorResponse(res, 500, "Lỗi server");
  }
};
// backend/src/controllers/staffController.js
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // Lấy ngày YYYY-MM-DD

    // 1. Đếm khách sắp đến (Booking hôm nay + status confirmed)
    const { count: arrivals, error: err1 } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "confirmed");

    // 2. Đếm khách sắp đi (Booking check-out hôm nay + status checked_in)
    // Lưu ý: Logic này giả định check-out dựa trên booking.
    // Nếu dựa trên rental, cần query bảng rentals.
    const { count: departures, error: err2 } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "checked_in");

    // 3. Đếm đang lưu trú (Rentals active)
    const { count: staying, error: err3 } = await supabase
      .from("rentals")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // 4. Đếm phòng trống (Total rooms - Occupied - Maintenance)
    // Cách đơn giản: Đếm phòng có status = 'available'
    const { count: availableRooms, error: err4 } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .eq("status", "available");

    if (err1 || err2 || err3 || err4) throw new Error("Lỗi khi lấy thống kê");

    res.status(200).json({
      status: "success",
      data: {
        arrivals: arrivals || 0,
        departures: departures || 0,
        staying: staying || 0,
        availableRooms: availableRooms || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
