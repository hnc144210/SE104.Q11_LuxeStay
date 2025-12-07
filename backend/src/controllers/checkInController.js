// backend/src/controllers/checkInController.js
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Gửi phản hồi lỗi
function errorResponse(res, status, message) {
  return res.status(status).json({
    success: false,
    message: message
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
function calculateRentalPrice(nights, basePrice, numGuests, maxGuests, surchargeRatio) {
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
      return errorResponse(res, 403, "Chỉ nhân viên mới có quyền thực hiện check-in");
    }

    // Kiểm tra trường bắt buộc
    if (!bookingId) {
      return errorResponse(res, 400, "Thiếu booking_id");
    }

    // Lấy booking cùng dữ liệu liên quan
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select(`
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
      `)
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
      return errorResponse(res, 400, "Trạng thái booking không hợp lệ để check-in");
    }

    // Kiểm tra phòng
    if (!booking.room) {
      return errorResponse(res, 404, "Không tìm thấy thông tin phòng");
    }

    if (booking.room.status !== "available") {
      return errorResponse(res, 400, "Phòng không khả dụng để check-in");
    }

    // Tính giá
    const nights = calculateNights(booking.check_in_date, booking.check_out_date);
    const basePrice = booking.room.room_type.base_price;
    const maxGuests = booking.room.room_type.max_guests || 3;
    const surchargeRatio = booking.room.room_type.surcharge_ratio || 0.25;
    
    // Mặc định: 1 khách chính (khách từ booking)
    const priceAtRental = calculateRentalPrice(nights, basePrice, 1, maxGuests, surchargeRatio);

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
        staff_id: staffId
      })
      .select()
      .single();

    if (rentalErr) {
      console.error("Lỗi tạo rental:", rentalErr);
      throw rentalErr;
    }

    // Tạo rental_guests (khách chính)
    const { error: guestsErr } = await supabase
      .from("rental_guests")
      .insert({
        rental_id: rental.id,
        customer_id: booking.customer.id,
        is_primary: true
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
        deposit_amount: calculatedDeposit
      })
      .eq("id", bookingId);

    if (updateBookingErr) {
      console.error("Lỗi cập nhật trạng thái booking:", updateBookingErr);
    }

    // Lấy đầy đủ dữ liệu rental
    const { data: rentalWithGuests, error: fetchErr } = await supabase
      .from("rentals")
      .select(`
        *,
        rooms(*, room_types(*)),
        rental_guests(*, customers(*)),
        bookings(*)
      `)
      .eq("id", rental.id)
      .single();

    if (fetchErr) throw fetchErr;

    return res.status(201).json({
      success: true,
      message: "Check-in thành công",
      data: rentalWithGuests,
      deposit_amount: calculatedDeposit
    });

  } catch (error) {
    console.error("Lỗi checkInFromBooking:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};


// POST /api/check-in/walk-in
// Check-in khách lẻ (không có booking)

exports.checkInWalkIn = async (req, res) => {
  try {
    const {
      room_id: roomId,
      customer_ids: customerIds,
      check_out_date: checkOutDate,
      deposit_amount: depositAmount
    } = req.body;

    const userRole = req.user?.role;
    const staffId = req.user?.id;
    
    // Kiểm tra quyền
    if (!["staff", "admin"].includes(userRole)) {
      return errorResponse(res, 403, "Chỉ nhân viên mới có quyền thực hiện check-in");
    }

    // Kiểm tra trường bắt buộc
    if (!roomId) {
      return errorResponse(res, 400, "Thiếu room_id");
    }

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return errorResponse(res, 400, "Thiếu customer_ids hoặc danh sách khách trống");
    }

    if (!checkOutDate) {
      return errorResponse(res, 400, "Thiếu check_out_date");
    }

    // Kiểm tra ngày hợp lệ
    const checkInDate = new Date().toISOString();
    const nights = calculateNights(checkInDate, checkOutDate);

    if (nights <= 0) {
      return errorResponse(res, 400, "Ngày check-out phải sau ngày hiện tại");
    }

    // Lấy thông tin phòng
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("*, room_types(*)")
      .eq("id", roomId)
      .maybeSingle();

    if (roomErr) throw roomErr;

    if (!room) {
      return errorResponse(res, 404, "Không tìm thấy phòng");
    }

    // Kiểm tra phòng khả dụng
    if (room.status !== "available") {
      return errorResponse(res, 400, "Phòng không khả dụng để check-in");
    }

    // Kiểm tra số khách tối đa
    const maxGuests = room.room_types.max_guests || 3;
    if (customerIds.length > maxGuests) {
      return errorResponse(res, 400, `Phòng chỉ cho phép tối đa ${maxGuests} khách`);
    }

    // Kiểm tra khách hàng tồn tại
    const { data: customers, error: customersErr } = await supabase
      .from("customers")
      .select("*")
      .in("id", customerIds);

    if (customersErr) throw customersErr;

    if (!customers || customers.length !== customerIds.length) {
      return errorResponse(res, 404, "Một hoặc nhiều khách hàng không tồn tại");
    }

    // Tính giá
    const basePrice = room.room_types.base_price;
    const surchargeRatio = room.room_types.surcharge_ratio || 0.25;
    const priceAtRental = calculateRentalPrice(nights, basePrice, customerIds.length, maxGuests, surchargeRatio);

    // Tính deposit_amount
    let calculatedDeposit = depositAmount || 0;

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
        booking_id: null,
        room_id: roomId,
        start_date: checkInDate,
        end_date: checkOutDate,
        status: "active",
        price_at_rental: priceAtRental,
        staff_id: staffId
      })
      .select()
      .single();

    if (rentalErr) {
      console.error("Lỗi tạo rental:", rentalErr);
      throw rentalErr;
    }

    // Tạo rental_guests
    const rentalGuests = customerIds.map((customerId, index) => ({
      rental_id: rental.id,
      customer_id: customerId,
      is_primary: index === 0
    }));

    const { error: guestsErr } = await supabase
      .from("rental_guests")
      .insert(rentalGuests);

    if (guestsErr) {
      console.error("Lỗi tạo rental_guests:", guestsErr);
      await supabase.from("rentals").delete().eq("id", rental.id);
      throw guestsErr;
    }

    // Cập nhật trạng thái phòng
    const { error: updateRoomErr } = await supabase
      .from("rooms")
      .update({ status: "occupied" })
      .eq("id", roomId);

    if (updateRoomErr) {
      console.error("Lỗi cập nhật phòng:", updateRoomErr);
      await supabase.from("rental_guests").delete().eq("rental_id", rental.id);
      await supabase.from("rentals").delete().eq("id", rental.id);
      throw updateRoomErr;
    }

    // Lấy dữ liệu đầy đủ
    const { data: rentalWithGuests, error: fetchErr } = await supabase
      .from("rentals")
      .select(`
        *,
        rooms(*, room_types(*)),
        rental_guests(*, customers(*))
      `)
      .eq("id", rental.id)
      .single();

    if (fetchErr) throw fetchErr;

    return res.status(201).json({
      success: true,
      message: "Check-in thành công",
      data: rentalWithGuests
    });

  } catch (error) {
    console.error("Lỗi checkInWalkIn:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// POST /api/check-in/calculate-price
// Tính giá thuê cho khách walk-in
exports.calculateWalkInPrice = async (req, res) => {
  try {
    const { 
      room_id: roomId, 
      check_out_date: checkOutDate,
      num_guests: numGuests 
    } = req.body;

    const userRole = req.user?.role;
    
    // Kiểm tra quyền
    if (!["staff", "admin"].includes(userRole)) {
      return errorResponse(res, 403, "Chỉ nhân viên mới có quyền tính giá");
    }

    // Kiểm tra trường bắt buộc
    if (!roomId || !checkOutDate || !numGuests) {
      return errorResponse(res, 400, "Thiếu thông tin bắt buộc (room_id, check_out_date, num_guests)");
    }

    // Kiểm tra ngày
    const checkInDate = new Date().toISOString();
    const nights = calculateNights(checkInDate, checkOutDate);

    if (nights <= 0) {
      return errorResponse(res, 400, "Ngày check-out phải sau ngày hiện tại");
    }

    // Lấy phòng & loại phòng
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("*, room_types(*)")
      .eq("id", roomId)
      .maybeSingle();

    if (roomErr) throw roomErr;

    if (!room) {
      return errorResponse(res, 404, "Không tìm thấy phòng");
    }

    // Tính giá
    const basePrice = room.room_types.base_price;
    const maxGuests = room.room_types.max_guests || 3;
    const surchargeRatio = room.room_types.surcharge_ratio || 0.25;
    
    const roomCharge = nights * basePrice;
    const totalPrice = calculateRentalPrice(nights, basePrice, numGuests, maxGuests, surchargeRatio);
    const surcharge = totalPrice - roomCharge;

    // Tính deposit
    const { data: regulation, error: regErr } = await supabase
      .from("regulations")
      .select("value")
      .eq("key", "deposit_percentage")
      .maybeSingle();

    if (regErr) {
      console.error("Get deposit regulation error:", regErr);
    }

    const depositPercentage = regulation?.value || 30;
    const depositAmount = Math.round((totalPrice * depositPercentage) / 100);

    return res.json({
      success: true,
      data: {
        room_number: room.room_number,
        room_type: room.room_types.name,
        base_price: basePrice,
        nights: nights,
        num_guests: numGuests,
        max_guests: maxGuests,
        room_charge: roomCharge,
        surcharge: surcharge,
        total_price: totalPrice,
        deposit_percentage: depositPercentage,
        deposit_amount: depositAmount
      }
    });

  } catch (error) {
    console.error("Lỗi calculateWalkInPrice:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
