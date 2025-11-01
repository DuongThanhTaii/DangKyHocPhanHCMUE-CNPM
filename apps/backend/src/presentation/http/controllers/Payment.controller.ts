import { Request, Response } from "express";
import { container } from "../../../infrastructure/di/container";
import { CreatePaymentUseCase } from "../../../application/use-cases/payment/CreatePayment.usecase";
import { ServiceResultBuilder } from "../../../types/serviceResult";
import { GetPaymentStatusUseCase } from "../../../application/use-cases/payment/GetPaymentStatus.usecase";

export class PaymentController {
    /**
     * Tạo payment URL
     */
    async createPayment(req: Request, res: Response): Promise<void> {
        try {
            const sinhVienId = req.auth!.sub;
            const { hocKyId, provider } = req.body;

            if (!hocKyId) {
                res.status(400).json({
                    isSuccess: false,
                    message: "Thiếu thông tin hocKyId",
                    errorCode: "MISSING_HOC_KY_ID"
                });
                return;
            }

            console.log("[PAYMENT_CONTROLLER] Selected Provider:", provider);

            const validProviders = ["momo", "vnpay", "zalopay"]; // ✅ Enable lại zalopay
            const selectedProvider = provider && validProviders.includes(provider) ? provider : "momo";

            console.log("[PAYMENT_CONTROLLER] Final Provider:", selectedProvider); // ✅ Log

            const createPaymentUseCase = container.get<CreatePaymentUseCase>(CreatePaymentUseCase);
            const result = await createPaymentUseCase.execute({
                sinhVienId,
                hocKyId,
                provider: selectedProvider,
            });

            if (result.isSuccess) {
                res.status(200).json({
                    isSuccess: true,
                    message: result.message,
                    data: result.data,
                });
            } else {
                res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                    errorCode: result.errorCode
                });
            }
        } catch (error) {
            console.error("[PAYMENT_CONTROLLER] createPayment Error:", error);
            res.status(500).json({
                isSuccess: false,
                message: "Internal server error",
                errorCode: "INTERNAL_ERROR"
            });
        }
    }

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
