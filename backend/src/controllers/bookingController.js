// src/controllers/bookingController.js
const { supabase } = require('../utils/supabaseClient');

// GET /api/v1/bookings/:id
exports.getBookingById = async (req, res) => {
  const bookingId = req.params.id;
  const user = req.user; // lấy từ middleware authenticate

  try {
    // Lấy booking + join room + room_type + customer
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
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
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error('getBookingById error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn booking'
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // 🔒 Phân quyền:
    // - customer: chỉ xem được booking của chính mình
    // - staff/admin: xem tất cả
    if (user.role === 'customer') {
      if (!user.customerId || booking.customer.id !== user.customerId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem booking này'
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
        room: booking.room
      }
    });
  } catch (err) {
    console.error('getBookingById exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
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
        message: 'Chưa đăng nhập'
      });
    }

    if (user.role !== 'customer' || !user.customerId) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng mới xem được danh sách booking của mình'
      });
    }

    const customerId = user.customerId;

    // Có thể nhận thêm ?status=pending|confirmed|cancelled nếu muốn
    const { status } = req.query;

    let query = supabase
      .from('bookings')
      .select(`
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
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('getMyBookings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách booking'
      });
    }

    return res.json({
      success: true,
      message: 'Lấy danh sách booking thành công',
      data: bookings
    });
  } catch (err) {
    console.error('getMyBookings error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
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

    // Phải đăng nhập với role customer
    if (!user || user.role !== 'customer' || !user.customerId) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng đăng nhập mới được đặt phòng'
      });
    }

    const {
      room_id,
      check_in_date,
      check_out_date,
      num_guests,
      deposit_amount = 0
    } = req.body;

    // Kiểm tra input
    if (!room_id || !check_in_date || !check_out_date || !num_guests) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu room_id, check_in_date, check_out_date hoặc num_guests'
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-in không được nhỏ hơn hôm nay'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-out phải sau ngày check-in'
      });
    }

    // 1️⃣ Lấy thông tin phòng + loại phòng
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        id,
        room_number,
        status,
        room_type_id,
        room_types (
          id,
          name,
          max_guests,
          base_price
        )
      `)
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }

    if (room.status === 'maintenance') {
      return res.status(400).json({
        success: false,
        message: 'Phòng đang bảo trì, không thể đặt'
      });
    }

    // 2️⃣ Kiểm tra số khách (QĐ2)
    const maxGuests = room.room_types.max_guests || 3;
    if (num_guests > maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Số khách tối đa cho phòng này là ${maxGuests}`
      });
    }

    // 3️⃣ Kiểm tra phòng còn trống trong khoảng ngày hay không
    // 3.1. Booking trùng
    const { data: conflictBookings, error: conflictBookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room_id)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .or(`and(check_in_date.lte.${check_out_date},check_out_date.gte.${check_in_date})`);

    if (conflictBookingError) {
      console.error('Check conflict bookings error:', conflictBookingError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra lịch đặt phòng'
      });
    }

    // 3.2. Rental đang active trùng
    const { data: conflictRentals, error: conflictRentalError } = await supabase
      .from('rentals')
      .select('id')
      .eq('room_id', room_id)
      .eq('status', 'active')
      .or(`and(start_date.lte.${check_out_date},end_date.gte.${check_in_date})`);

    if (conflictRentalError) {
      console.error('Check conflict rentals error:', conflictRentalError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kiểm tra lịch thuê phòng'
      });
    }

    if ((conflictBookings && conflictBookings.length > 0) ||
        (conflictRentals && conflictRentals.length > 0)) {
      return res.status(400).json({
        success: false,
        message: 'Phòng đã được đặt/thuê trong khoảng thời gian này'
      });
    }

    // 4️⃣ Tạo booking
    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.customerId,
        room_id,
        check_in_date,
        check_out_date,
        status: 'pending',      // cho staff/admin duyệt sau
        deposit_amount,
        created_by: user.userId
      })
      .select(`
        id,
        customer_id,
        room_id,
        check_in_date,
        check_out_date,
        status,
        deposit_amount,
        created_at
      `)
      .single();

    if (insertError) {
      console.error('createBookingForCustomer insertError:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo booking'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo booking thành công',
      data: newBooking
    });
  } catch (err) {
    console.error('createBookingForCustomer exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
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
    if (!user || user.role !== 'customer' || !user.customerId) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ khách hàng đăng nhập mới được hủy booking'
      });
    }

    // 1️⃣ Lấy booking cần hủy
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_id, status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // 2️⃣ Kiểm tra quyền sở hữu
    if (booking.customer_id !== user.customerId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy booking này'
      });
    }

    // 3️⃣ Kiểm tra trạng thái hợp lệ để hủy
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy booking ở trạng thái "${booking.status}"`
      });
    }

    // 4️⃣ Cập nhật trạng thái -> cancelled
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select('id, status')
      .single();

    if (updateError) {
      console.error('cancelMyBooking updateError:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi hủy booking'
      });
    }

    return res.json({
      success: true,
      message: 'Hủy booking thành công',
      data: updated
    });
  } catch (err) {
    console.error('cancelMyBooking exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
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
    if (!user || !['staff', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ staff/admin được xem danh sách booking'
      });
    }

    const { status, room_id, from, to } = req.query;

    let query = supabase
      .from('bookings')
      .select(`
        id,
        status,
        check_in_date,
        check_out_date,
        deposit_amount,
        created_at,
        customers (
          id,
          full_name,
          phone_number,
          email
        ),
        rooms (
          id,
          room_number,
          room_type_id
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (room_id) query = query.eq('room_id', room_id);
    if (from) query = query.gte('check_in_date', from);
    if (to) query = query.lte('check_out_date', to);

    const { data: bookings, error } = await query;

    if (error) {
      console.error('getBookingsForStaffAdmin error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách booking'
      });
    }

    return res.json({
      success: true,
      message: 'Lấy danh sách booking thành công',
      data: bookings
    });
  } catch (err) {
    console.error('getBookingsForStaffAdmin exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
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

    if (!user || !['staff', 'admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ staff/admin được hủy booking'
      });
    }

    // 1️⃣ Lấy booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // 2️⃣ Kiểm tra trạng thái
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể hủy booking ở trạng thái "${booking.status}"`
      });
    }

    // 3️⃣ Update -> cancelled
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select('id, status')
      .single();

    if (updateError) {
      console.error('cancelBookingByStaffAdmin updateError:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi hủy booking'
      });
    }

    return res.json({
      success: true,
      message: 'Hủy booking thành công (staff/admin)',
      data: updated
    });
  } catch (err) {
    console.error('cancelBookingByStaffAdmin exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// ... (Các code cũ giữ nguyên) ...

// =====================
// 3. PUT /api/v1/bookings/:id
// Cập nhật thông tin booking (Đổi phòng, đổi ngày, sửa số khách)
// Dành cho: Staff / Admin (Khách thường phải hủy đặt lại)
// =====================
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_id, check_in_date, check_out_date, status, deposit_amount } = req.body;

    // 1. Kiểm tra booking tồn tại
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !booking) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
    }

    // 2. Nếu có đổi phòng hoặc đổi ngày -> Phải check trùng lịch
    if (room_id || check_in_date || check_out_date) {
      const newRoomId = room_id || booking.room_id;
      const newCheckIn = check_in_date || booking.check_in_date;
      const newCheckOut = check_out_date || booking.check_out_date;

      // Check logic ngày
      if (new Date(newCheckOut) <= new Date(newCheckIn)) {
        return res.status(400).json({ success: false, message: 'Ngày check-out phải sau check-in' });
      }

      // Check trùng (loại trừ chính booking hiện tại ra)
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', newRoomId)
        .neq('id', id) // 👈 Quan trọng: Không check trùng với chính nó
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .or(`and(check_in_date.lte.${newCheckOut},check_out_date.gte.${newCheckIn})`);

      if (conflicts && conflicts.length > 0) {
        return res.status(400).json({ success: false, message: 'Phòng đã bị đặt trong khoảng thời gian mới' });
      }
    }

    // 3. Thực hiện Update
    const updates = {};
    if (room_id) updates.room_id = room_id;
    if (check_in_date) updates.check_in_date = check_in_date;
    if (check_out_date) updates.check_out_date = check_out_date;
    if (status) updates.status = status;
    if (deposit_amount !== undefined) updates.deposit_amount = deposit_amount;

    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: 'Cập nhật booking thành công',
      data: updated
    });

  } catch (err) {
    console.error('Update booking error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// =====================
// 5. POST /api/v1/bookings/extend/:id
// Gia hạn phòng (Extend)
// =====================
exports.extendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_check_out_date } = req.body; // Ngày check-out MỚI

    if (!new_check_out_date) {
      return res.status(400).json({ success: false, message: 'Cần nhập ngày check-out mới' });
    }

    // 1. Lấy thông tin booking cũ
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (findError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking không tồn tại' });
    }

    const currentCheckOut = new Date(booking.check_out_date);
    const newCheckOut = new Date(new_check_out_date);

    if (newCheckOut <= currentCheckOut) {
      return res.status(400).json({ success: false, message: 'Ngày mới phải sau ngày check-out cũ' });
    }

    // 2. Kiểm tra xem khoảng thời gian GIA TĂNG (từ cũ -> mới) có trống không
    // Check từ [booking.check_out_date] đến [new_check_out_date]
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', booking.room_id)
      .neq('id', id)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .or(`and(check_in_date.lte.${new_check_out_date},check_out_date.gte.${booking.check_out_date})`);

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Phòng đã có người đặt trong những ngày gia hạn thêm' });
    }

    // 3. Update ngày check-out
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ check_out_date: new_check_out_date })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.json({
      success: true,
      message: 'Gia hạn phòng thành công',
      data: updated
    });

  } catch (err) {
    console.error('Extend booking error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// 7. POST /api/v1/bookings/staff-create
// Staff tạo booking cho khách (Walk-in hoặc qua điện thoại)
// =====================
exports.createBookingByStaff = async (req, res) => {
  try {
    const user = req.user; // Staff đang thao tác
    const {
      customer_id, // Quan trọng: Staff phải chọn khách nào
      room_id,
      check_in_date,
      check_out_date,
      num_guests,
      deposit_amount = 0,
      status = 'confirmed' // Staff đặt thì thường là confirm luôn
    } = req.body;

    // 1. Validate dữ liệu đầu vào
    if (!customer_id || !room_id || !check_in_date || !check_out_date || !num_guests) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: customer_id, room_id, dates hoặc num_guests'
      });
    }

    // 2. Validate ngày
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({ success: false, message: 'Ngày check-in không hợp lệ (quá khứ)' });
    }
    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: 'Ngày check-out phải sau check-in' });
    }

    // 3. Kiểm tra Khách hàng có tồn tại không
    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', customer_id)
      .single();

    if (custError || !customer) {
      return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
    }

    // 4. Kiểm tra Phòng có trống không (Check trùng lịch)
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room_id)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .or(`and(check_in_date.lte.${check_out_date},check_out_date.gte.${check_in_date})`);

    if (conflicts && conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'Phòng đã có người đặt trong khoảng thời gian này' });
    }

    // 5. Tạo Booking
    const { data: newBooking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        customer_id: customer_id, // Đặt cho khách này
        room_id: room_id,
        check_in_date,
        check_out_date,
        status: status,           // Staff có quyền set luôn là 'confirmed' hoặc 'checked_in'
        deposit_amount,
        created_by: user.userId   // Ghi nhận Staff nào tạo đơn
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      success: true,
      message: 'Staff tạo booking thành công',
      data: newBooking
    });

  } catch (err) {
    console.error('Staff create booking error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};