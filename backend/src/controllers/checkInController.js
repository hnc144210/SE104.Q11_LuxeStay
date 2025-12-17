// backend/src/controllers/checkInController.js
const { getSystemSettings } = require("../utils/settingHelper");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Gửi phản hồi lỗi
function errorResponse(res, status, message) {
  return res.status(status).json({
    success: false,
    message: message,
  });
}

// Helper: Tính số đêm giữa 2 ngày
function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = checkOut - checkIn;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper: Tính giá thuê
function calculateRentalPrice(
  nights,
  basePrice,
  numGuests,
  maxGuests,
  surchargeRatio
) {
  let totalPrice = nights * basePrice;

  // Áp dụng phụ phí nếu vượt quá số khách tối đa
  if (numGuests > maxGuests) {
    const extraGuests = numGuests - maxGuests;
    const surcharge = totalPrice * surchargeRatio * (extraGuests / maxGuests);
    totalPrice += surcharge;
  }

  return Math.round(totalPrice);
}

// POST /api/check-in
// Check-in từ booking đã tồn tại
exports.checkInFromBooking = async (req, res) => {
  try {
    const { booking_id: bookingId, deposit_amount: depositAmount } = req.body;
    const userRole = req.user?.role;
    const staffId = req.user?.id;
    // Kiểm tra quyền
    if (!["staff", "admin"].includes(userRole)) {
      return errorResponse(
        res,
        403,
        "Chỉ nhân viên mới có quyền thực hiện check-in"
      );
    }

    // Kiểm tra trường bắt buộc
    if (!bookingId) {
      return errorResponse(res, 400, "Thiếu booking_id");
    }

    // Lấy booking cùng dữ liệu liên quan
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select(
        `
        *,
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
            max_guests,
            surcharge_ratio
          )
        )
      `
      )
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingErr) throw bookingErr;

    if (!booking) {
      return errorResponse(res, 404, "Không tìm thấy booking");
    }

    // Kiểm tra trạng thái booking
    if (booking.status === "checked_in") {
      return errorResponse(res, 400, "Booking đã được check-in");
    }

    if (booking.status === "cancelled") {
      return errorResponse(res, 400, "Booking đã bị hủy");
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return errorResponse(
        res,
        400,
        "Trạng thái booking không hợp lệ để check-in"
      );
    }

    // Kiểm tra phòng
    if (!booking.room) {
      return errorResponse(res, 404, "Không tìm thấy thông tin phòng");
    }

    // Tính giá
    const nights = calculateNights(
      booking.check_in_date,
      booking.check_out_date
    );
    const basePrice = booking.room.room_type.base_price;
    const maxGuests = booking.room.room_type.max_guests || 3;
    const surchargeRatio = booking.room.room_type.surcharge_ratio || 0.25;

    // Mặc định: 1 khách chính (khách từ booking)
    const priceAtRental = calculateRentalPrice(
      nights,
      basePrice,
      1,
      maxGuests,
      surchargeRatio
    );

    // Tính deposit_amount
    let calculatedDeposit = depositAmount || booking.deposit_amount || 0;

    if (calculatedDeposit === 0) {
      // Lấy quy định từ regulations
      const { data: regulation, error: regErr } = await supabase
        .from("regulations")
        .select("value")
        .eq("key", "deposit_percentage")
        .maybeSingle();

      if (regErr) {
        console.error("Get deposit regulation error:", regErr);
      }

      const depositPercentage = regulation?.value || 30;
      calculatedDeposit = Math.round((priceAtRental * depositPercentage) / 100);
    }

    // Tạo rental
    const { data: rental, error: rentalErr } = await supabase
      .from("rentals")
      .insert({
        booking_id: bookingId,
        room_id: booking.room.id,
        start_date: new Date().toISOString(),
        end_date: booking.check_out_date,
        status: "active",
        price_at_rental: priceAtRental,
        staff_id: staffId,
      })
      .select()
      .single();

    if (rentalErr) {
      console.error("Lỗi tạo rental:", rentalErr);
      throw rentalErr;
    }

    // Tạo rental_guests (khách chính)
    const { error: guestsErr } = await supabase.from("rental_guests").insert({
      rental_id: rental.id,
      customer_id: booking.customer.id,
      is_primary: true,
    });

    if (guestsErr) {
      console.error("Lỗi tạo rental_guests:", guestsErr);
      await supabase.from("rentals").delete().eq("id", rental.id);
      throw guestsErr;
    }

    // Cập nhật phòng sang "occupied"
    const { error: updateRoomErr } = await supabase
      .from("rooms")
      .update({ status: "occupied" })
      .eq("id", booking.room.id);

    if (updateRoomErr) {
      console.error("Lỗi cập nhật trạng thái phòng:", updateRoomErr);
      await supabase.from("rental_guests").delete().eq("rental_id", rental.id);
      await supabase.from("rentals").delete().eq("id", rental.id);
      throw updateRoomErr;
    }

    // Cập nhật booking sang checked_in và deposit_amount
    const { error: updateBookingErr } = await supabase
      .from("bookings")
      .update({
        status: "checked_in",
        deposit_amount: calculatedDeposit,
      })
      .eq("id", bookingId);

    if (updateBookingErr) {
      console.error("Lỗi cập nhật trạng thái booking:", updateBookingErr);
    }

    // Lấy đầy đủ dữ liệu rental
    const { data: rentalWithGuests, error: fetchErr } = await supabase
      .from("rentals")
      .select(
        `
        *,
        rooms(*, room_types(*)),
        rental_guests(*, customers(*)),
        bookings(*)
      `
      )
      .eq("id", rental.id)
      .single();

    if (fetchErr) throw fetchErr;

    return res.status(201).json({
      success: true,
      message: "Check-in thành công",
      data: rentalWithGuests,
      deposit_amount: calculatedDeposit,
    });
  } catch (error) {
    console.error("Lỗi checkInFromBooking:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// POST /api/check-in/walk-in
// Check-in khách lẻ (không có booking)

exports.checkInWalkIn = async (req, res) => {
  try {
    const { room_id, customer_ids, check_out_date, num_guests } = req.body;
    const staffId = req.user?.id;

    if (!room_id || !customer_ids?.length || !check_out_date) {
      return errorResponse(res, 400, "Thiếu thông tin bắt buộc");
    }

    const { data: room } = await supabase
      .from("rooms")
      .select("*, room_types(base_price)")
      .eq("id", room_id)
      .single();

    if (!room || room.status !== "available")
      return errorResponse(res, 400, "Phòng không khả dụng");

    // Tạo Rental
    const { data: rental, error: rentalErr } = await supabase
      .from("rentals")
      .insert({
        room_id: room_id,
        start_date: new Date().toISOString(),
        end_date: check_out_date,
        status: "active",
        price_at_rental: room.room_types.base_price, // Giá gốc
        staff_id: staffId,
        num_guests: num_guests || customer_ids.length, // Lưu số khách thực tế
      })
      .select()
      .single();

    if (rentalErr) throw rentalErr;

    // Lưu khách
    const guestsData = customer_ids.map((cid, index) => ({
      rental_id: rental.id,
      customer_id: cid,
      is_primary: index === 0,
    }));
    await supabase.from("rental_guests").insert(guestsData);
    await supabase
      .from("rooms")
      .update({ status: "occupied" })
      .eq("id", room_id);

    return res
      .status(201)
      .json({ success: true, message: "Check-in thành công", data: rental });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------
// 3. TÍNH TOÁN GIÁ (PREVIEW) - ĐÃ UPDATE
// ---------------------------------------------------------
exports.calculateWalkInPrice = async (req, res) => {
  try {
    const { room_id, check_out_date, customer_ids, num_guests } = req.body;

    // 1. Lấy thông tin Phòng và Quy định hệ thống song song (để tối ưu tốc độ)
    const [roomRes, regRes] = await Promise.all([
      supabase
        .from("rooms")
        .select("*, room_types(*)")
        .eq("id", room_id)
        .single(),
      supabase
        .from("regulations")
        .select("*")
        .in("key", [
          "max_guests_per_room",
          "surcharge_rate",
          "foreign_guest_surcharge_ratio",
        ]),
    ]);

    const room = roomRes.data;
    if (!room)
      return res
        .status(404)
        .json({ success: false, message: "Phòng không tồn tại" });

    // 2. Parse Quy định từ mảng sang Object để dễ dùng
    // Default fallback nếu DB chưa có dữ liệu
    const config = {
      max_guests: 3,
      surcharge_rate: 0.25,
      foreign_ratio: 1.5,
    };

    if (regRes.data) {
      regRes.data.forEach((item) => {
        if (item.key === "max_guests_per_room")
          config.max_guests = Number(item.value);
        if (item.key === "surcharge_rate")
          config.surcharge_rate = Number(item.value);
        if (item.key === "foreign_guest_surcharge_ratio")
          config.foreign_ratio = Number(item.value);
      });
    }

    // 3. Tính số đêm (Check-in là NOW, Check-out là input)
    const checkIn = new Date(); // Walk-in là vào ngay bây giờ
    const checkOut = new Date(check_out_date);

    // Tính khoảng cách ngày, tối thiểu là 1 đêm
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = Math.max(1, diffDays);

    // 4. Tính tiền phòng cơ bản
    const basePrice = Number(room.room_types.base_price);
    const roomCharge = basePrice * nights;

    // 5. Tính phụ thu quá người
    let surcharge = 0;
    // Ưu tiên lấy num_guests từ input form, nếu không có thì đếm số khách chọn
    const actualGuests = num_guests
      ? parseInt(num_guests)
      : customer_ids?.length || 1;

    // So sánh với quy định hệ thống (hoặc quy định riêng của loại phòng nếu muốn)
    // Ở đây dùng quy định chung hệ thống như yêu cầu
    if (actualGuests > config.max_guests) {
      const extraPeople = actualGuests - config.max_guests;
      // Công thức: Giá gốc * Tỉ lệ * Số người thừa * Số đêm
      surcharge = basePrice * config.surcharge_rate * extraPeople * nights;
    }

    // 6. Tính phụ thu khách nước ngoài
    let foreignSurcharge = 0;
    const tempTotal = roomCharge + surcharge;

    // Kiểm tra trong danh sách khách có ai là người nước ngoài không
    if (customer_ids && customer_ids.length > 0) {
      const { data: customers } = await supabase
        .from("customers") // Lưu ý: Staff module dùng bảng 'customers' riêng
        .select("type")
        .in("id", customer_ids);

      if (customers && customers.some((c) => c.type === "foreign")) {
        // Công thức: Tổng tạm tính * (Hệ số - 1)
        // Ví dụ: Hệ số 1.5 => Phụ thu thêm 0.5 (50%)
        foreignSurcharge = tempTotal * (config.foreign_ratio - 1);
      }
    }

    // 7. Tổng cuối cùng
    const finalTotal = tempTotal + foreignSurcharge;

    return res.status(200).json({
      success: true,
      data: {
        room_number: room.room_number,
        room_type_name: room.room_types.name,
        room_price: basePrice,
        nights,
        room_charge: roomCharge,
        surcharge: surcharge, // Tiền quá người
        foreign_surcharge: foreignSurcharge, // Tiền khách nước ngoài
        total_price: finalTotal,
        // Các thông số để Frontend hiển thị giải thích
        debug_info: {
          max_guests_standard: config.max_guests,
          actual_guests: actualGuests,
          surcharge_rate: config.surcharge_rate,
          foreign_ratio: config.foreign_ratio,
        },
      },
    });
  } catch (err) {
    console.error("Calc Price Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi tính toán: " + err.message });
  }
};

// POST /api/check-in/calculate-price
// Tính giá thuê cho khách walk-in
// ---------------------------------------------------------
// 3. TÍNH TOÁN GIÁ (PREVIEW) - ĐÃ SỬA LOGIC ĐẾM KHÁCH
// ---------------------------------------------------------
