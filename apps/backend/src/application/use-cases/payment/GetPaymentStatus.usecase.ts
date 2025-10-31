import { injectable, inject } from "inversify";
import { IPaymentStatusService } from "../../ports/payment/IPaymentStatusService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

export interface PaymentStatusDTO {
    orderId: string;
    status: "pending" | "success" | "failed" | "cancelled";
    amount: number;
    createdAt: string;
    updatedAt: string;
}

@injectable()
export class GetPaymentStatusUseCase {
    constructor(
        @inject(IPaymentStatusService) private statusService: IPaymentStatusService
    ) { }

    async execute(orderId: string): Promise<ServiceResult<PaymentStatusDTO>> {
        try {
            const payment = await this.statusService.getStatus(orderId);

            if (!payment) {
                return ServiceResultBuilder.failure("Payment không tồn tại", "PAYMENT_NOT_FOUND");
            }

            return ServiceResultBuilder.success("Lấy trạng thái payment thành công", {
                orderId: payment.orderId,
                status: payment.status,
                amount: payment.amount,
                createdAt: payment.createdAt.toISOString(),
                updatedAt: payment.updatedAt.toISOString(),
            });
        } catch (error) {
            console.error("[GET_PAYMENT_STATUS] Error:", error);
            return ServiceResultBuilder.failure("Lỗi khi lấy trạng thái payment", "INTERNAL_ERROR");
        }
    }
}
