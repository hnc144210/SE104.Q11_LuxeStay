const { supabase } = require('../utils/supabaseClient');


exports.checkAvailability = async (req, res) => {
  try {
    const {
      check_in_date,
      check_out_date,
      room_type_id,
      max_guests
    } = req.query;

    // Validation ngày
    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ngày check-in và check-out'
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Kiểm tra ngày hợp lệ
    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-in không thể là ngày trong quá khứ'
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-out phải sau ngày check-in'
      });
    }

    // Query tất cả phòng
    let roomsQuery = supabase
      .from('rooms')
      .select(`
        *,
        room_types (
          id,
          name,
          base_price,
          max_guests
        )
      `)
      .eq('status', 'available');

    // Lọc theo loại phòng nếu có
    if (room_type_id) {
      roomsQuery = roomsQuery.eq('room_type_id', room_type_id);
    }

    const { data: allRooms, error: roomsError } = await roomsQuery;

    if (roomsError) {
      throw roomsError;
    }

    // Lấy danh sách booking trong khoảng thời gian 
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('room_id, check_in_date, check_out_date')
      .in('status', ['pending', 'confirmed'])
      .or(`and(check_in_date.lte.${check_out_date},check_out_date.gte.${check_in_date})`);

    if (bookingsError) {
      throw bookingsError;
    }

    // Lấy danh sách rentals đang active trong khoảng thời gian
    const { data: rentals, error: rentalsError } = await supabase
      .from('rentals')
      .select('room_id, start_date, end_date')
      .eq('status', 'active')
      .or(`and(start_date.lte.${check_out_date},end_date.gte.${check_in_date})`);

    if (rentalsError) {
      throw rentalsError;
    }

    // Tạo Set các room_id đã được book hoặc rent
    const bookedRoomIds = new Set(bookings.map(b => b.room_id));
    rentals.forEach(r => bookedRoomIds.add(r.room_id));

    // Lọc phòng trống
    let availableRooms = allRooms.filter(room => !bookedRoomIds.has(room.id));

    // Lọc theo số khách nếu có
    if (max_guests) {
      availableRooms = availableRooms.filter(
        room => room.room_types.max_guests >= parseInt(max_guests)
      );
    }

    // Tính số ngày thuê
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Format kết quả
    const formattedRooms = availableRooms.map(room => {
      const basePrice = room.room_types.base_price;
      const totalPrice = basePrice * nights;

      return {
        room_id: room.id,
        room_number: room.room_number,
        room_type: {
          id: room.room_types.id,
          name: room.room_types.name,
          max_guests: room.room_types.max_guests
        },
        pricing: {
          base_price: basePrice,
          nights: nights,
          total_price: totalPrice,
          currency: 'VND'
        },
        status: room.status
      };
    });

    // Nhóm theo loại phòng
    const groupedByType = formattedRooms.reduce((acc, room) => {
      const typeId = room.room_type.id;
      if (!acc[typeId]) {
        acc[typeId] = {
          room_type: room.room_type,
          available_count: 0,
          rooms: []
        };
      }
      acc[typeId].available_count++;
      acc[typeId].rooms.push(room);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách phòng trống thành công',
      data: {
        search_criteria: {
          check_in_date,
          check_out_date,
          nights,
          room_type_id: room_type_id || 'all',
          max_guests: max_guests || 'any'
        },
        summary: {
          total_available: formattedRooms.length,
          room_types_available: Object.keys(groupedByType).length
        },
        rooms_by_type: Object.values(groupedByType),
        all_available_rooms: formattedRooms
      }
    });

  } catch (error) {
    console.error('Room availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra phòng trống',
      error: error.message
    });
  }
};

// 6. GET /api/v1/reports/room-status
// Báo cáo tình trạng phòng hôm nay
// =====================
exports.getRoomReport = async (req, res) => {
  try {
    const today = new Date();
    // Chuyển về định dạng YYYY-MM-DD để so sánh trong DB
    const todayStr = today.toISOString().split('T')[0];

    // 1. Lấy tổng quan danh sách phòng
    const { data: allRooms, error: roomError } = await supabase
      .from('rooms')
      .select('id, status, room_type_id');
    
    if (roomError) throw roomError;

    // 2. Đếm theo trạng thái phòng (Status cứng trong bảng rooms)
    const totalRooms = allRooms.length;
    const maintenanceRooms = allRooms.filter(r => r.status === 'maintenance').length;

    // 3. Lấy các Booking liên quan đến hôm nay
    // - Check-in hôm nay
    // - Check-out hôm nay
    // - Đang ở (Checked-in) hoặc Đã đặt (Confirmed) mà thời gian bao trùm hôm nay
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, check_in_date, check_out_date, room_id')
      .in('status', ['confirmed', 'checked_in', 'pending']) // Chỉ quan tâm các đơn hoạt động
      .or(`check_in_date.eq.${todayStr},check_out_date.eq.${todayStr},and(check_in_date.lte.${todayStr},check_out_date.gte.${todayStr})`);

    if (bookingError) throw bookingError;

    // --- XỬ LÝ SỐ LIỆU ---
    
    // Khách đến hôm nay (Check-in Today)
    const arrivingToday = bookings.filter(b => 
      b.check_in_date === todayStr && ['confirmed', 'pending'].includes(b.status)
    ).length;

    // Khách đi hôm nay (Check-out Today)
    const departingToday = bookings.filter(b => 
      b.check_out_date === todayStr && b.status === 'checked_in'
    ).length;

    // Phòng đang có khách (Occupied)
    // Là các booking có status 'checked_in' VÀ ngày hiện tại nằm trong khoảng ở
    const occupiedRooms = bookings.filter(b => 
      b.status === 'checked_in' && 
      b.check_in_date <= todayStr && 
      b.check_out_date >= todayStr
    ).length;

    // Phòng trống sẵn sàng đón khách (Available)
    // = Tổng - (Bảo trì + Đang ở + Sắp đến check-in)
    // Công thức này chỉ mang tính tương đối, tùy nghiệp vụ
    const availableToday = totalRooms - maintenanceRooms - occupiedRooms;

    return res.json({
      success: true,
      message: 'Lấy báo cáo tình trạng phòng thành công',
      data: {
        date: todayStr,
        summary: {
          total_rooms: totalRooms,
          available_rooms: availableToday, // Phòng trống
          maintenance_rooms: maintenanceRooms, // Đang sửa
          occupied_rooms: occupiedRooms,   // Đang có khách
        },
        activity: {
          arriving_today: arrivingToday,   // Sắp đến
          departing_today: departingToday  // Sắp đi
        }
      }
    });

  } catch (err) {
    console.error('Report error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};