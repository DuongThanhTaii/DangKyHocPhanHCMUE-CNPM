import { Request, Response } from "express";
import { container } from "../../../infrastructure/di/container";
import { CreatePaymentUseCase } from "../../../application/use-cases/payment/CreatePayment.usecase";
import { ProcessIPNUseCase } from "../../../application/use-cases/payment/ProcessIPN.usecase";
import { ServiceResultBuilder } from "../../../types/serviceResult";
import { GetPaymentStatusUseCase } from "../../../application/use-cases/payment/GetPaymentStatus.usecase";

export class PaymentController {
    /**
     * Tạo payment URL
     */
    async createPayment(req: Request, res: Response) {
        try {
            const { hocKyId, amount } = req.body;
            const sinhVienId = req.auth!.sub;

            if (!hocKyId || !amount) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Thiếu thông tin học kỳ hoặc số tiền",
                });
            }

            const createPaymentUseCase = container.get<CreatePaymentUseCase>(CreatePaymentUseCase);

            const result = await createPaymentUseCase.execute({
                sinhVienId,
                hocKyId,
                amount,
            });

            if (result.isSuccess) {
                return res.status(201).json(result);
            }

            return res.status(400).json(result);
        } catch (error: any) {
            console.error("Error creating payment:", error);
            return res.status(500).json({
                isSuccess: false,
                message: error.message || "Lỗi khi tạo payment",
            });
        }
    }

    /**
     * ✅ IPN Callback từ MoMo (update hoc_phi status)
     */
    async handleIPN(req: Request, res: Response) {
        try {
            const ipnData = req.body;

            console.log("[CONTROLLER] ========== IPN HANDLER START ==========");
            console.log("[CONTROLLER] Received IPN from IP:", req.ip);
            console.log("[CONTROLLER] Content-Type:", req.headers["content-type"]);

            // Validate IPN data
            if (!ipnData || Object.keys(ipnData).length === 0) {
                console.error("[CONTROLLER] ❌ Empty IPN data");
                return res.status(400).json({
                    success: false,
                    message: "Empty IPN data",
                });
            }

            const processIPNUseCase = container.get<ProcessIPNUseCase>(ProcessIPNUseCase);
            const result = await processIPNUseCase.execute(ipnData);

            console.log("[CONTROLLER] Processing result:", result);

            if (result.isSuccess) {
                console.log("[CONTROLLER] ✅ IPN processed successfully");
                return res.status(200).json({ success: true });
            }

            console.error("[CONTROLLER] ❌ IPN processing failed:", result.message);
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        } catch (error) {
            console.error("[CONTROLLER] ========== IPN HANDLER ERROR ==========");
            console.error("[CONTROLLER] Error:", error);
            console.error("[CONTROLLER] Stack:", (error as Error).stack);
            return res.status(500).json({ success: false });
        }
    }

    /**
     * ✅ Lấy trạng thái payment (FE poll)
     */
    async getPaymentStatus(req: Request, res: Response) {
        try {
            const { orderId } = req.query;

            if (!orderId) {
                return res.status(400).json(ServiceResultBuilder.failure("Thiếu order ID"));
            }

            const useCase = container.get<GetPaymentStatusUseCase>(GetPaymentStatusUseCase);
            const result = await useCase.execute(orderId as string);

            return res.status(result.isSuccess ? 200 : 404).json(result);
        } catch (error: any) {
            return res.status(500).json(ServiceResultBuilder.failure(error.message));
        }
    }
}
