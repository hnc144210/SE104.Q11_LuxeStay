// backend/src/controllers/serviceController.js
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET /api/services
// Lấy danh sách dịch vụ
// Quyền: staff, admin
exports.getServices = async (req, res) => {
  try {
    const userRole = req.user?.role;

    if (!["staff", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền xem danh sách dịch vụ",
      });
    }

    const {
      is_active: isActive,
      search,
      page = 1,
      limit = 20,
      sortOrder = "desc",
    } = req.query;

    // Validate page và limit
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase.from("services").select("*", { count: "exact" });

    // Filter theo is_active
    if (isActive !== undefined) {
      const activeValue = isActive === "true" || isActive === true;
      query = query.eq("is_active", activeValue);
    }

    // Search theo tên
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.ilike("name", `%${searchTerm}%`);
    }

    // Sorting
    const sortDirection = sortOrder === "asc" ? true : false;
    query = query.order("id", { ascending: sortDirection });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: services, error, count } = await query;

    if (error) throw error;

    // Calculate pagination info
    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách dịch vụ thành công",
      data: services,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("getServices error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// GET /api/services/:id
// Lấy chi tiết dịch vụ
// Quyền: staff, admin
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (!["staff", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền xem thông tin dịch vụ",
      });
    }

    // Validate ID
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: "ID dịch vụ không hợp lệ",
      });
    }

    // Lấy thông tin dịch vụ
    const { data: service, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    console.error("getServiceById error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// POST /api/services
// Tạo dịch vụ mới
// Quyền: admin only
exports.createService = async (req, res) => {
  try {
    const { name, price, unit, is_active: isActive } = req.body;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền tạo dịch vụ",
      });
    }

    // Validate bắt buộc
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (name, price)",
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá dịch vụ phải lớn hơn 0",
      });
    }

    // Kiểm tra tên dịch vụ đã tồn tại
    const { data: existing, error: findErr } = await supabase
      .from("services")
      .select("*")
      .ilike("name", name)
      .maybeSingle();

    if (findErr) throw findErr;

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Tên dịch vụ đã tồn tại",
      });
    }

    // Tạo dịch vụ
    const { data: service, error: insertErr } = await supabase
      .from("services")
      .insert({
        name: name.trim(),
        price,
        unit: unit || null,
        is_active: isActive !== undefined ? isActive : true,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    return res.status(201).json({
      success: true,
      message: "Tạo dịch vụ thành công",
      data: service,
    });
  } catch (error) {
    console.error("createService error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// PUT /api/services/:id
// Cập nhật dịch vụ
// Quyền: admin only
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, unit, is_active: isActive } = req.body;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền cập nhật dịch vụ",
      });
    }

    // Validate ID
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: "ID dịch vụ không hợp lệ",
      });
    }

    // Kiểm tra dịch vụ có tồn tại
    const { data: existingService, error: findErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr) throw findErr;

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    // Build object cập nhật
    const updates = {};

    if (name !== undefined && name !== existingService.name) {
      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Tên dịch vụ không được để trống",
        });
      }

      // Kiểm tra tên mới có trùng không
      const { data: duplicate, error: dupErr } = await supabase
        .from("services")
        .select("*")
        .ilike("name", name.trim())
        .neq("id", id)
        .maybeSingle();

      if (dupErr) throw dupErr;

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Tên dịch vụ đã tồn tại",
        });
      }

      updates.name = name.trim();
    }

    if (price !== undefined && price !== existingService.price) {
      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Giá dịch vụ phải lớn hơn 0",
        });
      }
      updates.price = price;
    }

    if (unit !== undefined && unit !== existingService.unit) {
      updates.unit = unit || null;
    }

    if (isActive !== undefined && isActive !== existingService.is_active) {
      updates.is_active = isActive;
    }

    // Nếu không có gì thay đổi
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({
        success: true,
        message: "Không có thông tin nào thay đổi",
        data: existingService,
      });
    }

    // Cập nhật
    const { data: updatedService, error: updateErr } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({
      success: true,
      message: "Cập nhật dịch vụ thành công",
      data: updatedService,
    });
  } catch (error) {
    console.error("updateService error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// PATCH /api/services/:id/toggle-status
// Bật/tắt trạng thái dịch vụ (soft delete)
// Quyền: staff, admin
exports.toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (!["staff", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền thay đổi trạng thái dịch vụ",
      });
    }

    // Validate ID
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: "ID dịch vụ không hợp lệ",
      });
    }

    // Kiểm tra dịch vụ có tồn tại
    const { data: service, error: findErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr) throw findErr;

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    // Đổi trạng thái is_active
    const newStatus = !service.is_active;

    const { data: updatedService, error: updateErr } = await supabase
      .from("services")
      .update({ is_active: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({
      success: true,
      message: newStatus
        ? "Đã kích hoạt dịch vụ"
        : "Đã tắt dịch vụ (dịch vụ sẽ không khả dụng để yêu cầu)",
      data: updatedService,
    });
  } catch (error) {
    console.error("toggleServiceStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// DELETE /api/admin/services/:id
// Xóa vĩnh viễn dịch vụ khỏi database (hard delete)
// Quyền: admin only
// Lưu ý: Chỉ xóa được nếu dịch vụ chưa từng được sử dụng
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Chỉ admin mới có quyền xóa vĩnh viễn dịch vụ",
      });
    }

    // Validate ID
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: "ID dịch vụ không hợp lệ",
      });
    }

    // Kiểm tra dịch vụ có tồn tại
    const { data: service, error: findErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr) throw findErr;

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    // Kiểm tra dịch vụ có đang được sử dụng không
    const { count, error: usageErr } = await supabase
      .from("service_usage")
      .select("id", { count: "exact", head: true })
      .eq("service_id", id);

    if (usageErr) throw usageErr;

    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa dịch vụ vì đã có ${count} lượt sử dụng. Bạn có thể tắt trạng thái dịch vụ thay thế.`,
      });
    }

    // Xóa vĩnh viễn khỏi database
    const { error: deleteErr } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (deleteErr) throw deleteErr;

    return res.status(200).json({
      success: true,
      message: "Đã xóa vĩnh viễn dịch vụ khỏi hệ thống",
      data: {
        id: service.id,
        name: service.name,
        deleted: true,
      },
    });
  } catch (error) {
    console.error("deleteService error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// POST /api/services/request
// Yêu cầu dịch vụ cho rental
// Quyền: staff, admin
exports.requestService = async (req, res) => {
  try {
    const { rental_id: rentalId, service_id: serviceId, quantity } = req.body;
    const userRole = req.user?.role;

    if (!["staff", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền yêu cầu dịch vụ",
      });
    }

    // Validate bắt buộc
    if (!rentalId || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (rental_id, service_id)",
      });
    }

    // Validate quantity
    const qty = quantity || 1;
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải lớn hơn 0",
      });
    }

    // Validate ID
    const rentalIdNum = parseInt(rentalId, 10);
    const serviceIdNum = parseInt(serviceId, 10);

    if (isNaN(rentalIdNum) || isNaN(serviceIdNum)) {
      return res.status(400).json({
        success: false,
        message: "rental_id hoặc service_id không hợp lệ",
      });
    }

    // Kiểm tra rental có tồn tại và đang active
    const { data: rental, error: rentalErr } = await supabase
      .from("rentals")
      .select("*")
      .eq("id", rentalId)
      .maybeSingle();

    if (rentalErr) throw rentalErr;

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin thuê phòng",
      });
    }

    if (rental.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể yêu cầu dịch vụ cho phòng đang thuê",
      });
    }

    // Kiểm tra dịch vụ có tồn tại và đang active
    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceErr) throw serviceErr;

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    if (!service.is_active) {
      return res.status(400).json({
        success: false,
        message: "Dịch vụ này hiện không khả dụng",
      });
    }

    // Tính tổng giá
    const totalPrice = service.price * qty;
    console.log("Total Price:", totalPrice);
    // Tạo service_usage
    const { data: serviceUsage, error: insertErr } = await supabase
      .from("service_usage")
      .insert({
        rental_id: rentalId,
        service_id: serviceId,
        quantity: qty,
        total_price: totalPrice,
        used_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        services(*),
        rentals(
          *,
          rooms(*),
          rental_guests(*, customers(*))
        )
      `
      )
      .single();

    if (insertErr) throw insertErr;

    return res.status(201).json({
      success: true,
      message: "Yêu cầu dịch vụ thành công",
      data: serviceUsage,
    });
  } catch (error) {
    console.error("requestService error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
