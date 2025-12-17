// backend/src/controllers/configController.js
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * GET /api/admin/config
 * Lấy toàn bộ cấu hình hệ thống
 */
exports.getConfig = async (req, res) => {
  try {
    // const userRole = req.user?.role;

    // if (userRole !== "admin") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Chỉ admin mới có quyền xem cấu hình hệ thống"
    //   });
    // }

    // Lấy tất cả regulations
    const { data: regulations, error: regErr } = await supabase
      .from("regulations")
      .select("*")
      .order("key", { ascending: true });

    if (regErr) throw regErr;

    // Lấy room_types
    const { data: roomTypes, error: rtErr } = await supabase
      .from("room_types")
      .select("*")
      .order("id", { ascending: true });

    if (rtErr) throw rtErr;

    // Lấy services
    const { data: services, error: servErr } = await supabase
      .from("services")
      .select("*")
      .order("id", { ascending: true });

    if (servErr) throw servErr;

    // Format regulations thành object dễ đọc
    const regulationsMap = {};
    regulations.forEach((reg) => {
      regulationsMap[reg.key] = {
        value: reg.value,
        description: reg.description,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Lấy cấu hình hệ thống thành công",
      data: {
        regulations: regulationsMap,
        room_types: roomTypes,
        services: services,
        customer_types: ["domestic", "foreign"],
      },
    });
  } catch (error) {
    console.error("getConfig error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/config/room-types
 * Cập nhật loại phòng
 */
exports.updateRoomTypes = async (req, res) => {
  try {
    const { room_types: roomTypes } = req.body;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền cập nhật loại phòng",
      });
    }

    if (!roomTypes || !Array.isArray(roomTypes) || roomTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin room_types hoặc dữ liệu không hợp lệ",
      });
    }

    // Validate từng room type
    for (const rt of roomTypes) {
      if (!rt.id || !rt.name || !rt.base_price) {
        return res.status(400).json({
          success: false,
          message: "Mỗi loại phòng phải có id, name và base_price",
        });
      }

      if (rt.base_price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Giá phòng phải lớn hơn 0",
        });
      }

      if (rt.max_guests && rt.max_guests < 1) {
        return res.status(400).json({
          success: false,
          message: "Số khách tối đa phải ít nhất là 1",
        });
      }

      if (rt.surcharge_ratio !== undefined) {
        if (rt.surcharge_ratio < 0 || rt.surcharge_ratio > 1) {
          return res.status(400).json({
            success: false,
            message: "Hệ số phụ thu phải từ 0-1 (0-100%)",
          });
        }
      }
    }

    // Cập nhật từng room type
    const updatePromises = roomTypes.map(async (rt) => {
      const updates = {
        name: rt.name,
        base_price: rt.base_price,
      };

      if (rt.max_guests !== undefined) {
        updates.max_guests = rt.max_guests;
      }

      if (rt.surcharge_ratio !== undefined) {
        updates.surcharge_ratio = rt.surcharge_ratio;
      }

      return supabase
        .from("room_types")
        .update(updates)
        .eq("id", rt.id)
        .select()
        .single();
    });

    const results = await Promise.all(updatePromises);

    // Kiểm tra lỗi
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.error("Update room types errors:", errors);
      throw errors[0].error;
    }

    const updatedRoomTypes = results.map((r) => r.data);

    return res.status(200).json({
      success: true,
      message: "Cập nhật loại phòng thành công",
      data: updatedRoomTypes,
    });
  } catch (error) {
    console.error("updateRoomTypes error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/config/guest-types
 * Cập nhật phụ thu loại khách (customer_type)
 */
exports.updateGuestTypes = async (req, res) => {
  try {
    // ❌ CŨ (SAI): const { foreign_surcharge_ratio: foreignSurchargeRatio } = req.body;

    // ✅ MỚI (ĐÚNG): Lấy đúng key 'foreign_guest_surcharge_ratio' từ Frontend gửi lên
    const { foreign_guest_surcharge_ratio } = req.body;

    // Đặt lại tên biến cho gọn để dùng ở dưới
    const foreignSurchargeRatio = foreign_guest_surcharge_ratio;

    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền cập nhật cấu hình loại khách",
      });
    }

    // Kiểm tra giá trị
    if (foreignSurchargeRatio === undefined || foreignSurchargeRatio < 1) {
      return res.status(400).json({
        success: false,
        message: "Hệ số phụ thu khách nước ngoài phải >= 1",
      });
    }

    // Kiểm tra regulation có tồn tại không
    const { data: existing, error: findErr } = await supabase
      .from("regulations")
      .select("*")
      .eq("key", "foreign_guest_surcharge_ratio")
      .maybeSingle();

    if (findErr) throw findErr;

    let result;
    if (existing) {
      // Update
      const { data, error: updateErr } = await supabase
        .from("regulations")
        .update({
          value: foreignSurchargeRatio,
          description:
            "Hệ số phụ thu khách nước ngoài (" + foreignSurchargeRatio + "x)",
        })
        .eq("key", "foreign_guest_surcharge_ratio")
        .select()
        .single();

      if (updateErr) throw updateErr;
      result = data;
    } else {
      // Insert
      const { data, error: insertErr } = await supabase
        .from("regulations")
        .insert({
          key: "foreign_guest_surcharge_ratio",
          value: foreignSurchargeRatio,
          description:
            "Hệ số phụ thu khách nước ngoài (" + foreignSurchargeRatio + "x)",
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      result = data;
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật cấu hình loại khách thành công",
      data: {
        key: result.key,
        value: result.value,
        description: result.description,
      },
    });
  } catch (error) {
    console.error("updateGuestTypes error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/config/surcharges
 * Cập nhật các loại phụ thu
 */
exports.updateSurcharges = async (req, res) => {
  try {
    const {
      deposit_percentage: depositPercentage,
      surcharge_rate: surchargeRate, // SỬA: Đổi tên key khớp với DB
      max_guests_per_room: maxGuestsPerRoom, // THÊM: Update số khách tối đa
    } = req.body;

    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền cập nhật phụ thu",
      });
    }

    const updates = [];

    // --- 1. CẬP NHẬT deposit_percentage ---
    if (depositPercentage !== undefined) {
      if (depositPercentage < 0 || depositPercentage > 100) {
        return res
          .status(400)
          .json({ success: false, message: "Phần trăm đặt cọc phải từ 0-100" });
      }

      const { error } = await supabase
        .from("regulations")
        .update({
          value: depositPercentage,
          description: "Phần trăm tiền đặt cọc (" + depositPercentage + "%)",
        })
        .eq("key", "deposit_percentage");

      if (error) throw error;

      updates.push({ key: "deposit_percentage", value: depositPercentage });
    }

    // --- 2. CẬP NHẬT surcharge_rate (Thay cho extra_guest...) ---
    if (surchargeRate !== undefined) {
      if (surchargeRate < 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Tỉ lệ phụ thu quá người phải >= 0",
          });
      }

      const { error } = await supabase
        .from("regulations")
        .update({
          value: surchargeRate,
          description:
            "Tỉ lệ phụ thu cho khách thứ 3 trở đi (" +
            surchargeRate * 100 +
            "%)",
        })
        .eq("key", "surcharge_rate"); // Dùng đúng key surcharge_rate

      if (error) throw error;

      updates.push({ key: "surcharge_rate", value: surchargeRate });
    }

    // --- 3. CẬP NHẬT max_guests_per_room ---
    if (maxGuestsPerRoom !== undefined) {
      if (maxGuestsPerRoom < 1) {
        return res
          .status(400)
          .json({ success: false, message: "Số khách tiêu chuẩn phải >= 1" });
      }

      const { error } = await supabase
        .from("regulations")
        .update({
          value: maxGuestsPerRoom,
          description: "Số khách tối đa trong một phòng",
        })
        .eq("key", "max_guests_per_room");

      if (error) throw error;

      updates.push({ key: "max_guests_per_room", value: maxGuestsPerRoom });
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không có thông tin nào để cập nhật (Kiểm tra tên biến gửi lên)",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật phụ thu thành công",
      data: updates,
    });
  } catch (error) {
    console.error("updateSurcharges error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
