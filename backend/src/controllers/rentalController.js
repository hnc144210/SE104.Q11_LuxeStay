const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET /api/rentals/:id
exports.getRentalById = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy chi tiết phiếu thuê + Phòng + Khách + Dịch vụ đã dùng
    const { data: rental, error } = await supabase
      .from("rentals")
      .select(
        `
        *,
        room:rooms (id, room_number, room_type:room_types(name, base_price)),
        rental_guests (
          is_primary,
          customer:customers (id, full_name, phone_number, identity_card)
        ),
        service_usage (
          id, quantity, total_price,
          service:services (name, price)
        ),
        invoices (id, total_amount, issue_date)
      `
      )
      .eq("id", id)
      .single();

    if (error || !rental) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu thuê" });
    }
    console.log("rental:", rental);
    return res.json({ success: true, data: rental });
  } catch (err) {
    console.error("getRentalById error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/rentals/:id (Gia hạn trực tiếp)
exports.updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_end_date } = req.body;

    if (!new_end_date)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ngày kết thúc mới" });

    // 1. Lấy rental
    const { data: rental, error: findError } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", id)
      .single();

    if (findError || !rental)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phiếu thuê" });

    if (rental.status !== "active")
      return res.status(400).json({
        success: false,
        message: "Chỉ gia hạn được phiếu đang hoạt động",
      });

    // 2. Check trùng lịch (Booking hoặc Rental khác)
    const { data: conflicts } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", rental.room_id)
      .in("status", ["confirmed", "pending"])
      .or(
        `and(check_in_date.lte.${new_end_date},check_in_date.gte.${rental.end_date})`
      );

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phòng bị vướng lịch đặt trong khoảng gia hạn",
      });
    }

    // 3. Update
    const { data: updated, error: updateError } = await supabase
      .from("rentals")
      .update({ end_date: new_end_date })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: "Gia hạn phiếu thuê thành công",
      data: updated,
    });
  } catch (err) {
    console.error("updateRental error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
