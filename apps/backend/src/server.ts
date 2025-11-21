import "dotenv/config";
import app from "./app";
import router from "./routes";

const PORT = process.env.PORT || 3000;

// ❌ REMOVE: Duplicate tuition routes mounting
// app.use("/api/tuition", tuitionRoutes);

// ✅ KEEP: Single mounting via routes.ts
app.use("/api", router);

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
