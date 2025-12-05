const { supabase } = require('../utils/supabaseClient');
const { supabase: supabasePublic } = require('../utils/supabasePublicClient');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.registerCustomer = async (req, res) => {
  const {
    full_name,
    identity_card,
    phone_number,
    email,
    password,
    address,
    type = 'domestic'
  } = req.body;

  if (!full_name || !identity_card || !phone_number || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu thông tin bắt buộc'
    });
  }

  try {
    // Đăng ký + tự động login
    const { data, error } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
      data: { full_name },
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const user = data.user;
    const session = data.session;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Không tạo được tài khoản'
      });
    }

    // Dùng session.access_token để insert
    const { data: customer, error: insertError } = await supabasePublic
      .from('customers')
      .insert({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        identity_card: identity_card.trim(),
        phone_number: phone_number.trim(),
        address: address?.trim() || null,
        type,
        user_id: user.id
      })
      .select('id, full_name, email')
      .single();
  if (insertError) {
    console.error('Insert customer error:', insertError);

    let userMessage = 'Lỗi lưu thông tin khách hàng';

    if (insertError.code === '23505') {
      if (insertError.message.includes('customers_email_key')) {
        userMessage = 'Email đã được sử dụng';
      } else if (insertError.message.includes('customers_identity_card_key')) {
        userMessage = 'Số CMND/CCCD đã được sử dụng';
      }
    }

    if (user?.id) {
      await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }

  return res.status(400).json({
    success: false,
    message: userMessage
  });
}

    // Tạo JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: customer.email,
        role: 'customer',
        customerId: customer.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        customerId: customer.id,
        full_name: customer.full_name,
        email: customer.email
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// login
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
    });
  }

  try {
    let email;
    const trimmedIdentifier = identifier.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(trimmedIdentifier);

    if (isEmail) {
      // Admin và Customer đăng nhập bằng email
      email = trimmedIdentifier.toLowerCase();
    } else {
      // Staff đăng nhập bằng staff_code
      const { data: staffData, error: staffError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, staff_code')
        .eq('staff_code', trimmedIdentifier)
        .eq('role', 'staff')
        .maybeSingle();

      if (staffData?.email) {
        email = staffData.email;
      } else {
        return res.status(401).json({
          success: false,
          message: 'Mã nhân viên không tồn tại'
        });
      }
    }

    // Đăng nhập với Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập không chính xác'
      });
    }

    const userId = authData.user.id;
    let role = 'customer';
    let full_name = authData.user.email.split('@')[0];
    let customerId = null;
    let staff_code = null;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, full_name, staff_code')
      .eq('id', userId)
      .maybeSingle();

    if (profileData) {
      role = profileData.role;
      full_name = profileData.full_name || full_name;
      staff_code = profileData.staff_code;

      // Validation: Nếu đăng nhập bằng staff_code nhưng role không phải staff
      if (!isEmail && role !== 'staff') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản này không thể đăng nhập bằng mã nhân viên'
        });
      }
      
      // Validation: Nếu đăng nhập bằng email nhưng là staff
      if (isEmail && role === 'staff') {
        return res.status(403).json({
          success: false,
          message: 'Nhân viên vui lòng đăng nhập bằng mã nhân viên'
        });
      }
      
    } else {
      // Kiểm tra trong customers
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, full_name')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (customerData) {
        customerId = customerData.id;
        full_name = customerData.full_name || full_name;
        role = 'customer';
      }
    }
    
    // Tạo JWT
    const token = jwt.sign(
      {
        userId,
        email: authData.user.email,
        role,
        customerId,
        staff_code: staff_code || undefined
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        role,
        full_name,
        staff_code,
        customerId,
      },
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
    });
  }
};

// Taoj staff
exports.createStaff = async (req, res) => {
  const { email, password, full_name, staff_code } = req.body;
  
  if (!email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'Thiếu email, password hoặc full_name'
    });
  }
  
  try {
    const { data: userData, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });
    
    if (error) {
      if (error.status === 409 || error.message.includes('already been registered')) {
        return res.status(409).json({
          success: false,
          message: 'Email này đã được sử dụng'
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    const userId = userData.user.id;
    const code = staff_code?.trim().toUpperCase() || `NV${Date.now().toString().slice(-6)}`;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        staff_code: code,
        role: 'staff'
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Update profile error:', updateError);
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      return res.status(500).json({
        success: false,
        message: 'Lỗi cập nhật hồ sơ: ' + updateError.message
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản nhân viên thành công',
      data: { email, full_name, staff_code: code, role: 'staff' }
    });
    
  } catch (err) {
    console.error('Create staff error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // customer
    if (user.role === 'customer' && user.customerId) {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('id, full_name, email, phone_number, identity_card, address, type')
        .eq('id', user.customerId)
        .single();

      if (error || !customer) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
      }

      return res.json({
        success: true,
        data: {
          customerId: customer.id,
          full_name: customer.full_name,
          email: customer.email,
          phone_number: customer.phone_number,
          identity_card: customer.identity_card,
          address: customer.address,
          type: customer.type,
          role: user.role
        }
      });
    }

    // admin hoặc staff
    if (['admin', 'staff'].includes(user.role)) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, staff_code')
        .eq('id', user.userId)
        .single();

      if (error || !profile) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy profile' });
      }

      return res.json({
        success: true,
        data: {
          full_name: profile.full_name,
          email: profile.email || user.email,
          staff_code: profile.staff_code,
          role: profile.role
        }
        .select('id, full_name, email, staff_code, role')
      });
      
    }

    // Fallback
    return res.json({
      success: true,
      data: {
        email: user.email,
        role: user.role,
        full_name: user.full_name || 'User'
      }
    });

  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
// LOGOUT
exports.logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  try {
    // customer
    if (user.role === 'customer' && user.customerId) {
      const { full_name, phone_number, address, type } = req.body;

      const updates = {};
      if (full_name) updates.full_name = full_name.trim();
      if (phone_number) updates.phone_number = phone_number.trim();
      if (address) updates.address = address?.trim() || null;
      if (type) updates.type = type;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không có thông tin để cập nhật'
        });
      }

      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', user.customerId)
        .select('id, full_name, phone_number, address, type')
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Cập nhật hồ sơ thành công',
        data
      });
    }

    // admin/staff
    if (['admin', 'staff'].includes(user.role)) {
      const { full_name } = req.body;

      if (!full_name) {
        return res.status(400).json({
          success: false,
          message: 'Không có thông tin để cập nhật'
        });
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: full_name.trim() })
        .eq('id', user.userId)
        .select('id, full_name, role')
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Cập nhật hồ sơ thành công',
        data
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Không có quyền cập nhật'
    });

  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};