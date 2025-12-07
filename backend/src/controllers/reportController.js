const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// GET /api/reports/revenue
exports.getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Mặc định tháng này
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

    const startDate = from || firstDay;
    const endDate = to || lastDay;

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("total_amount, issue_date, payment_method")
      .gte("issue_date", startDate)
      .lte("issue_date", endDate);

    if (error) throw error;

    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
    const count = invoices.length;

    return res.json({
      success: true,
      data: {
        period: { from: startDate, to: endDate },
        total_revenue: totalRevenue,
        total_invoices: count,
        invoices: invoices
      }
    });

  } catch (err) {
    console.error("Report error:", err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};