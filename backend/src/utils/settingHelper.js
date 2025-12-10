const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.getSystemSettings = async () => {
  const { data, error } = await supabase.from("settings").select("key, value");

  if (error) {
    console.error("Lỗi lấy settings:", error);
    return {}; // Trả về rỗng nếu lỗi
  }

  // Chuyển mảng [{key: 'deposit_percentage', value: '50'}]
  // thành object { deposit_percentage: 50, foreign_coefficient: 1.5 ... }
  const settings = {};
  data.forEach((item) => {
    // Ép kiểu số cho giá trị
    settings[item.key] = Number(item.value);
  });

  return {
    depositPercent: settings.deposit_percentage || 50, // Mặc định 50%
    foreignFactor: settings.foreign_coefficient || 1.5, // Mặc định 1.0
    maxGuests: settings.max_guests_per_room || 3, // Mặc định 3
    surchargeRate: settings.surcharge_rate || 0.25, // Mặc định 0
  };
};
