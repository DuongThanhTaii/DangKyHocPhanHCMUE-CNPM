import "dotenv/config";
import app from "./app";
import tuitionRoutes from "./interface/routes/tuition.routes";
import paymentRoutes from "./presentation/http/routes/payment.routes";

const PORT = process.env.PORT || 3000;

app.use("/api/sv/hoc-phi", tuitionRoutes);
app.use("/api/payment", paymentRoutes); // ✅ Thêm payment routes

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
