const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET /api/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        customer:customers (full_name, phone_number, address),
        staff:profiles (full_name),
        rental:rentals (
          start_date, end_date,
          room:rooms (room_number, room_types(name, base_price))
        )
      `)
      .eq("id", id)
      .single();

    if (error || !invoice) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
    }

    return res.json({ success: true, data: invoice });
  } catch (err) {
    console.error("getInvoiceById error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};