import "reflect-metadata"; // ✅ Import reflect-metadata
import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth";
import { PaymentController } from "../controllers/Payment.controller";

const router = Router();
const paymentController = new PaymentController();

// ✅ Tạo payment (Sinh viên)
router.post(
    "/create",
    requireAuth,
    requireRole(["sinh_vien"]),
    (req, res) => paymentController.createPayment(req, res)
);

// ✅ IPN Callback (PUBLIC - KHÔNG requireAuth)
router.post("/payment/ipn", (req, res) => {
    console.log("[IPN] ========== RECEIVED IPN CALLBACK ==========");
    console.log("[IPN] Headers:", req.headers);
    console.log("[IPN] Body:", JSON.stringify(req.body, null, 2));
    console.log("[IPN] ===========================================");

    return paymentController.handleIPN(req, res);
});

// ✅ Lấy trạng thái payment
router.get("/status", requireAuth, (req, res) => paymentController.getPaymentStatus(req, res));

// ✅ Health check (để MoMo test connectivity)
router.get("/ipn/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

export default router;
