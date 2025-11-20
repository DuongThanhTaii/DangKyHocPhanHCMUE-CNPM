import "reflect-metadata";
import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth";
import { PaymentController } from "../controllers/Payment.controller";
import { container } from "../../../infrastructure/di/container";
import { UnifiedIPNHandlerUseCase } from "../../../application/use-cases/payment/UnifiedIPNHandler.usecase";
import { IPaymentRepository } from "../../../application/ports/payment/IPaymentRepository";

const router = Router();
const paymentController = new PaymentController();

// ✅ Tạo payment (Sinh viên)
router.post(
    "/create",
    requireAuth,
    requireRole(["sinh_vien"]),
    (req, res) => paymentController.createPayment(req, res)
);

// ✅ Unified IPN Callback - Router chỉ nhận request và forward
router.all("/ipn", async (req, res) => {

    try {
        const requestData = { ...req.body, ...req.query };

        const useCase = container.get<UnifiedIPNHandlerUseCase>(UnifiedIPNHandlerUseCase);
        const result = await useCase.execute(requestData);

        console.log("[IPN_ROUTE] Use case result:", result);

        if (result.isSuccess && result.data) {
            const { responseFormat, responseData } = result.data;

            // Trả response theo format use case chỉ định
            if (responseFormat === "no_content") {
                console.log("[IPN_ROUTE] Returning 204 No Content");
                return res.status(204).send();
            } else {
                console.log("[IPN_ROUTE] Returning JSON:", responseData);
                return res.status(200).json(responseData);
            }
        } else {
            console.error("[IPN_ROUTE] Use case failed:", result.message);
            const provider = result.data?.provider || "unknown";
            if (provider === "momo") {
                return res.status(400).json({ success: false });
            } else {
                return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
            }
        }
    } catch (error) {
        console.error("[IPN_ROUTE] IPN Error:", error);
        return res.status(500).json({ success: false });
    }
});

// ✅ Lấy trạng thái payment - Chỉ dùng query param
router.get("/status", async (req, res) => {
    try {
        const orderId = req.query.orderId;

        if (!orderId) {
            return res.status(400).json({
                isSuccess: false,
                message: "Thiếu orderId",
            });
        }

        const paymentRepo = container.get<IPaymentRepository>(IPaymentRepository);
        const payment = await paymentRepo.findByOrderId(orderId as string);

        if (!payment) {
            return res.status(404).json({
                isSuccess: false,
                message: "Không tìm thấy mã đơn hàng",
            });
        }

        const paymentData = payment.toObject();

        return res.status(200).json({
            isSuccess: true,
            data: {
                orderId: paymentData.orderId,
                status: paymentData.status,
                amount: paymentData.amount,
                provider: paymentData.provider,
                transactionId: paymentData.transactionId,
                createdAt: paymentData.createdAt,
                updatedAt: paymentData.updatedAt,
            },
        });
    } catch (error: any) {
        console.error("[PAYMENT_STATUS] Error:", error);
        return res.status(500).json({
            isSuccess: false,
            message: "Internal server error",
        });
    }
});

export default router;
