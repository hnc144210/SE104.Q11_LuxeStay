const { supabase } = require("../utils/supabaseClient");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.registerCustomer = async (req, res) => {
  const {
    full_name,
    identity_card,
    phone_number,
    email,
    password,
    address,
    type = "domestic",
  } = req.body;

  if (!full_name || !identity_card || !phone_number || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin bắt buộc",
    });
  }

  try {
    //Đăng ký + tự động login
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const user = data.user;
    const session = data.session;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Không tạo được tài khoản",
      });
    }

    //Dùng session.access_token để insert
    const { data: customer, error: insertError } = await supabase
      .from("customers")
      .insert({
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        identity_card: identity_card.trim(),
        phone_number: phone_number.trim(),
        address: address?.trim() || null,
        type,
        user_id: user.id,
      })
      .select("id, full_name, email")
      .single();

    if (insertError) {
      console.error("Insert customer error:", insertError);
      // Cleanup user nếu insert fail
      await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
        {
          method: "DELETE",
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res.status(500).json({
        success: false,
        message: "Lỗi lưu thông tin khách hàng",
      });
    }

    //Tạo JWT của bạn
    const token = jwt.sign(
      {
        userId: user.id,
        email: customer.email,
        role: "customer",
        customerId: customer.id,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        token,
        customerId: customer.id,
        full_name: customer.full_name,
        email: customer.email,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
//ĐĂNG NHẬP
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu email hoặc mật khẩu" });

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData?.user) {
      return res
        .status(401)
        .json({ success: false, message: "Sai email hoặc mật khẩu" });
    }

    const userId = authData.user.id;

    // Kiểm tra role
    const [{ data: profile }, { data: customer }] = await Promise.all([
      supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single()
        .maybeSingle(),
      supabase
        .from("customers")
        .select("id, full_name")
        .eq("user_id", userId)
        .single()
        .maybeSingle(),
    ]);

    const role = profile?.role || "customer";
    const full_name = profile?.full_name || customer?.full_name || email;
    const customerId = customer?.id || null;

    const token = jwt.sign({ userId, email, role, customerId }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: { token, role, full_name, customerId },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

//TẠO ADMIN/STAFF
exports.createStaffOrAdmin = async (req, res) => {
  const { email, password, full_name, role = "staff" } = req.body;

  if (!email || !password || !full_name || !["admin", "staff"].includes(role)) {
    return res
      .status(400)
      .json({ success: false, message: "Dữ liệu không hợp lệ" });
  }

  try {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError)
      return res
        .status(400)
        .json({ success: false, message: authError.message });

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: authData.user.id, full_name, role });

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi tạo profile" });
    }

    res
      .status(201)
      .json({ success: true, message: "Tạo tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

//controllers/authController.js
