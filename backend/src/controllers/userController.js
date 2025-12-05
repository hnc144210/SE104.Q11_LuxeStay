const { supabase } = require('../utils/supabaseClient');

exports.createCustomer = async (req, res) => {
  try {
    const {
      identity_card: identityCard,
      full_name: fullName,
      type,                 // 'domestic' | 'foreign'
      phone_number: phone,
      email,
      address
    } = req.body;

    // kiểm tra quyền
    const userRole = req.user?.role;
    if (!['staff', 'admin'].includes(userRole)) {
      return errorResponse(res, 403, 'Chỉ nhân viên mới có quyền tạo hồ sơ khách hàng');
    }

    // validate bắt buộc
    if (!identityCard || !fullName || !type || !phone) {
      return errorResponse(res, 400, 'Thiếu thông tin bắt buộc');
    }

    // phone
    if (!/^[0-9]{10,11}$/.test(phone)) {
      return errorResponse(res, 400, 'Số điện thoại phải có 10-11 chữ số');
    }

// Kiểm tra khách hàng tồn tại qua identity_card
    const { data: existingCustomer, error: findErr } = await supabase
      .from('customers')
      .select('*')
      .eq('identity_card', identityCard)
      .maybeSingle();

    if (findErr) throw findErr;

    if (existingCustomer) {
      // Cập nhật thông tin nếu có
      const updates = {};
      if (fullName && fullName !== existingCustomer.full_name) updates.full_name = fullName;
      if (type && type !== existingCustomer.type) updates.type = type;
      if (phone && phone !== existingCustomer.phone_number) updates.phone_number = phone;
      if (email && email !== existingCustomer.email) updates.email = email;
      if (address && address !== existingCustomer.address) updates.address = address;

      if (Object.keys(updates).length > 0) {
        const { data: updatedCustomer, error: updateErr } = await supabase
          .from('customers')
          .update(updates)
          .eq('id', existingCustomer.id)
          .select()
          .single();

        if (updateErr) throw updateErr;

        return res.status(200).json({
          success: true,
          message: 'Cập nhật khách hàng thành công',
          data: updatedCustomer,
          isExisting: true
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Khách hàng đã tồn tại',
        data: existingCustomer,
        isExisting: true
      });
    }
    // tạo khách hàng
    const defaultAddress = type === 'domestic' ? 'Vietnam' : address ?? '';
    const { data: newCustomer, error: insertErr } = await supabase
      .from('customers')
      .insert({
        identity_card: identityCard,
        full_name: fullName,
        type,
        phone_number: phone,
        email: email ?? null,
        address: defaultAddress,
      })
      .select()
      .single();

    if (insertErr) {
      // xử lý duplicate từ DB error
      if (insertErr.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Số CMND/CCCD hoặc email đã tồn tại'
        });
      }
      throw insertErr;
    }


    return res.status(201).json({
      success: true,
      message: 'Đã lưu khách hàng',
      data: newCustomer,
      isExisting: false,
    });

  } catch (error) {
    console.error('createCustomer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (!['staff', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ nhân viên mới có quyền xem danh sách khách hàng'
      });
    }

    // Lấy query params để filter và phân trang
    const {
      type,           // 'domestic' | 'foreign'
      search,         // tìm theo tên, CMND, phone
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Validate page và limit
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query
    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    // Filter theo type
    if (type && ['domestic', 'foreign'].includes(type)) {
      query = query.eq('type', type);
    }

    // Search theo tên, CMND, phone
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(
        `full_name.ilike.%${searchTerm}%,identity_card.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`
      );
    }

    // Sorting
    const validSortFields = ['created_at', 'full_name', 'type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? true : false;
    
    query = query.order(sortField, { ascending: sortDirection });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    // Execute query
    const { data: customers, error, count } = await query;

    if (error) throw error;

    // Calculate pagination info
    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách khách hàng thành công',
      data: customers,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('getCustomers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


exports.getCustomerById = async (req, res) => {
  try {
      const { id } = req.params;
      
    const userRole = req.user?.role;
    if (!['staff', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ nhân viên mới có quyền xem thông tin khách hàng'
      });
    }

    // Validate ID
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: 'ID khách hàng không hợp lệ'
      });
    }

    // Lấy thông tin khách hàng
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin khách hàng thành công',
      data: customer
    });

  } catch (error) {
    console.error('getCustomerById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      identity_card: identityCard,
      full_name: fullName,
      type,
      phone_number: phone,
      email,
      address
    } = req.body;

    // Kiểm tra quyền
    const userRole = req.user?.role;
    if (!['staff', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ nhân viên mới có quyền cập nhật thông tin khách hàng'
      });
    }

    // Validate ID
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return res.status(400).json({
        success: false,
        message: 'ID khách hàng không hợp lệ'
      });
    }

    // Kiểm tra khách hàng có tồn tại
    const { data: existingCustomer, error: findErr } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findErr) throw findErr;

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Build object cập nhật
    const updates = {};

    if (identityCard !== undefined && identityCard !== existingCustomer.identity_card) {
      updates.identity_card = identityCard;
    }

    if (fullName !== undefined && fullName !== existingCustomer.full_name) {
      if (!fullName || fullName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Họ tên không được để trống'
        });
      }
      updates.full_name = fullName;
    }

    
    if (phone !== undefined && phone !== existingCustomer.phone_number) {
      if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại phải có 10-11 chữ số'
        });
      }
      updates.phone_number = phone;
    }

    if (email !== undefined && email !== existingCustomer.email) {
      updates.email = email || null;
    }

    if (address !== undefined && address !== existingCustomer.address) {
      updates.address = address || '';
    }

    // Nếu không có gì thay đổi
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Không có thông tin nào thay đổi',
        data: existingCustomer
      });
    }


    // Cập nhật
    const { data: updatedCustomer, error: updateErr } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      // Xử lý duplicate từ DB error
      if (updateErr.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Số CMND/CCCD hoặc email đã tồn tại'
        });
      }
      throw updateErr;
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin khách hàng thành công',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('updateCustomer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem danh sách nhân viên'
      });
    }

    // Lấy query params để filter và phân trang
    const {
      status,         // 'active' | 'inactive'
      search,         // tìm theo tên, email
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Validate page và limit
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Build query - chỉ lấy user có role là 'staff'
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, phone_number, status, role, created_at, updated_at', { count: 'exact' })
      .eq('role', 'staff');

    // Filter theo status
    if (status && ['active', 'inactive'].includes(status)) {
      query = query.eq('status', status);
    }

    // Search theo tên, email, username
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(
        `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    // Sorting
    const validSortFields = ['created_at', 'full_name', 'email', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? true : false;
    
    query = query.order(sortField, { ascending: sortDirection });

    query = query.range(offset, offset + limitNum - 1);

    const { data: staff, error, count } = await query;

    if (error) throw error;

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách nhân viên thành công',
      data: staff,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('getStaff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};