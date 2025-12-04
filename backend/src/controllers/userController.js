const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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