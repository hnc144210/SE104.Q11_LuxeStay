// backend/src/controllers/checkInController.js
const { createClient } = require("@supabase/supabase-js");
const { getSystemSettings } = require("../utils/settingHelper");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut - checkIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
// Lấy danh sách các phòng đang có khách (Active Rentals)
exports.getActiveRentals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("rentals")
      .select(
        `
        id,  
        room_id,
        start_date,
        end_date,
        price_at_rental,
        status,
        rooms (
          id, 
          room_number, 
          room_types (name)
        ),
        rental_guests!inner (
          is_primary,
          customers (full_name, phone_number)
        )
      `
      )
      .eq("status", "active")
      .eq("rental_guests.is_primary", true); // Chỉ lấy khách chính để hiển thị tên

    if (error) throw error;

    return res.json({
      success: true,
      message: "Lấy danh sách phòng đang thuê thành công",
      data: data,
    });
  } catch (error) {
    console.error("getActiveRentals error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
// =========================================================
exports.checkOut = async (req, res) => {
  try {
    const { rental_id, payment_method } = req.body; // <-- Lấy biến payment_method ở đây (snake_case)
    const staffId = req.user?.id;

    const settings = await getSystemSettings();

    const { data: rental } = await supabase
      .from("rentals")
      .select(
        `
            *,
            rooms(*, room_types(*)),
            rental_guests(*, customers(*)),
            service_usage(*, services(*))
        `
      )
      .eq("id", rental_id)
      .single();

    if (!rental || rental.status !== "active") {
      return errorResponse(res, 400, "Hợp đồng không hợp lệ để check-out");
    }

    const endDate = new Date();
    const nights = calculateNights(rental.start_date, endDate);
    const roomCharge = rental.price_at_rental * nights;

    const serviceCharge =
      rental.service_usage?.reduce(
        (sum, item) => sum + (item.total_price || 0),
        0
      ) || 0;

    let surcharge = 0;
    const guestCount = rental.num_guests || rental.rental_guests.length;
    const maxGuests = rental.rooms.room_types.max_guests || settings.maxGuests;

    if (guestCount > maxGuests) {
      const extra = guestCount - maxGuests;
      const ratio =
        rental.rooms.room_types.surcharge_ratio || settings.surchargeRate;
      surcharge = rental.price_at_rental * ratio * extra * nights;
    }

    let foreignSurcharge = 0;
    const hasForeigner = rental.rental_guests.some(
      (g) => g.customers.type === "foreign"
    );

    if (hasForeigner) {
      const taxableAmount = roomCharge + surcharge;
      foreignSurcharge = taxableAmount * (settings.foreignFactor - 1);
    }

    const totalAmount =
      roomCharge + serviceCharge + surcharge + foreignSurcharge;

    // Lưu Hóa Đơn
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        rental_id: rental_id,
        customer_id: rental.rental_guests.find((g) => g.is_primary)
          ?.customer_id,
        issue_date: endDate.toISOString(),
        room_charge: roomCharge,
        service_charge: serviceCharge,
        surcharge: surcharge,
        foreign_surcharge_amount: foreignSurcharge,
        total_amount: totalAmount,
        // 👇 [ĐÃ SỬA] Sử dụng biến payment_method lấy từ req.body
        payment_method: payment_method,
        staff_id: staffId,
      })
      .select(
        `*, customer:customers(full_name, phone_number), staff:profiles(full_name), rental:rentals(room:rooms(room_number, room_types(name)), service_usage(quantity, total_price, service:services(name, unit)))`
      )
      .single();

    if (invErr) throw invErr;

    await supabase
      .from("rentals")
      .update({ status: "completed", end_date: endDate.toISOString() })
      .eq("id", rental_id);
    await supabase
      .from("rooms")
      .update({ status: "available" })
      .eq("id", rental.room_id);

    if (rental.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", rental.booking_id);
    }

    return res.json({
      success: true,
      message: "Check-out thành công",
      data: { invoice },
    });
  } catch (err) {
    console.error("CheckOut Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
