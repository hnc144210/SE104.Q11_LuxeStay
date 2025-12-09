// backend/src/controllers/checkInController.js
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
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
exports.checkOut = async (req, res) => {
  try {
    const { rental_id: rentalId, payment_method: paymentMethod } = req.body;

    // Kiểm tra quyền
    const userRole = req.user?.role;
    const staffId = req.user?.id;

    if (!["staff", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền thực hiện check-out",
      });
    }

    // Validate bắt buộc
    if (!rentalId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin rental_id",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu phương thức thanh toán",
      });
    }

    // Validate ID
    const rentalIdNum = parseInt(rentalId, 10);
    if (isNaN(rentalIdNum)) {
      return res.status(400).json({
        success: false,
        message: "rental_id không hợp lệ",
      });
    }

    // Lấy thông tin rental
    const { data: rental, error: rentalErr } = await supabase
      .from("rentals")
      .select(
        `
        *,
        rooms(*, room_types(*)),
        rental_guests(*, customers(*)),
        service_usage(*, services(*))
      `
      )
      .eq("id", rentalId)
      .maybeSingle();

    if (rentalErr) throw rentalErr;

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin thuê phòng",
      });
    }

    // Kiểm tra trạng thái rental
    if (rental.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Phòng không ở trạng thái đang thuê",
      });
    }

    // Tính thời gian thuê
    const startDate = new Date(rental.start_date);
    const endDate = new Date();
    const daysRented = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (daysRented < 1) {
      return res.status(400).json({
        success: false,
        message: "Thời gian thuê phải ít nhất 1 ngày",
      });
    }

    // Tính tiền phòng
    const roomCharge = rental.price_at_rental * daysRented;

    // Tính tiền dịch vụ
    let serviceCharge = 0;
    if (rental.service_usage && rental.service_usage.length > 0) {
      serviceCharge = rental.service_usage.reduce((sum, usage) => {
        return sum + (parseFloat(usage.total_price) || 0);
      }, 0);
    }

    // Kiểm tra phụ thu người nước ngoài
    const primaryGuest = rental.rental_guests?.find((g) => g.is_primary);
    let foreignSurchargeAmount = 0;

    if (primaryGuest?.customers?.type === "foreign") {
      // Lấy quy định phụ thu từ regulations
      const { data: regulation, error: regErr } = await supabase
        .from("regulations")
        .select("value")
        .eq("key", "foreign_guest_surcharge_ratio")
        .maybeSingle();

      if (regErr) {
        console.error("Get regulation error:", regErr);
      }

      const surchargeRatio = regulation?.value || 1.5;
      foreignSurchargeAmount = roomCharge * (surchargeRatio - 1);
    }

    // Tính phụ thu vượt số khách
    let surcharge = 0;
    const maxGuests = rental.rooms?.room_types?.max_guests || 3;
    const guestCount = rental.rental_guests?.length || 0;

    if (guestCount > maxGuests) {
      const surchargeRatio = rental.rooms?.room_types?.surcharge_ratio || 0.25;
      const extraGuests = guestCount - maxGuests;
      surcharge = roomCharge * surchargeRatio * extraGuests;
    }

    // Tổng tiền
    const totalAmount =
      roomCharge + serviceCharge + surcharge + foreignSurchargeAmount;
    console.log("total check-out amount:", totalAmount);
    // Lấy customer_id của khách primary
    const customerId = primaryGuest?.customer_id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin khách hàng chính",
      });
    }

    // Tạo invoice
    const { data: invoice, error: invoiceErr } = await supabase
      .from("invoices")
      .insert({
        rental_id: rentalId,
        customer_id: customerId,
        issue_date: endDate.toISOString(),
        room_charge: roomCharge,
        service_charge: serviceCharge,
        surcharge: surcharge,
        foreign_surcharge_amount: foreignSurchargeAmount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        staff_id: staffId,
      })
      .select()
      .single();

    if (invoiceErr) throw invoiceErr;

    // Cập nhật rental status và end_date
    const { error: updateRentalErr } = await supabase
      .from("rentals")
      .update({
        status: "completed",
        end_date: endDate.toISOString(),
        staff_id: staffId,
      })
      .eq("id", rentalId);

    if (updateRentalErr) {
      // Rollback invoice
      await supabase.from("invoices").delete().eq("id", invoice.id);
      throw updateRentalErr;
    }

    // Cập nhật trạng thái phòng về available
    const { error: updateRoomErr } = await supabase
      .from("rooms")
      .update({ status: "available" })
      .eq("id", rental.room_id);

    if (updateRoomErr) {
      console.error("Update room status error:", updateRoomErr);
      // Không rollback vì check-out đã thành công
    }

    // Nếu có booking, cập nhật status
    if (rental.booking_id) {
      const { error: updateBookingErr } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", rental.booking_id);

      if (updateBookingErr) {
        console.error("Update booking status error:", updateBookingErr);
      }
    }

    // Lấy thông tin invoice đầy đủ
    const { data: invoiceWithDetails, error: fetchErr } = await supabase
      .from("invoices")
      .select(
        `
        *,
        rentals(
          *,
          rooms(*, room_types(*)),
          rental_guests(*, customers(*)),
          service_usage(*, services(*))
        ),
        customers(*)
      `
      )
      .eq("id", invoice.id)
      .single();

    if (fetchErr) throw fetchErr;

    return res.status(201).json({
      success: true,
      message: "Check-out thành công",
      data: {
        invoice: invoiceWithDetails,
        rental_info: {
          days_rented: daysRented,
          check_in: startDate.toISOString(),
          check_out: endDate.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("checkOut error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
