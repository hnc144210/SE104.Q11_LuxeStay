const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.getSystemSettings = async () => {
  // 👇 SỬA Ở ĐÂY: Đổi "settings" thành "regulations"
  const { data, error } = await supabase
    .from("regulations")
    .select("key, value");

  if (error) {
    console.error("Lỗi lấy settings:", error);
    // Trả về giá trị mặc định để không crash app
    return {
      depositPercent: 50,
      foreignFactor: 1.5,
      maxGuests: 3,
      surchargeRate: 0.25,
    };
  }

  const settings = {};
  if (data) {
    data.forEach((item) => {
      settings[item.key] = Number(item.value);
    });
  }

  return {
    // Map đúng key trong DB sang biến sử dụng
    depositPercent: settings.deposit_percentage || 50,
    foreignFactor: settings.foreign_coefficient || 1.5,
    maxGuests: settings.max_guests_per_room || 3,
    surchargeRate: settings.surcharge_rate || 0.25,
  };
};
