import { injectable, inject } from "inversify";
import { Payment, PaymentStatus } from "../../../domain/entities/Payment";
import { InvalidPaymentAmountError } from "../../../domain/errors/PaymentErrors";
import { IPaymentRepository } from "../../ports/payment/IPaymentRepository";
import { IPaymentGateway } from "../../ports/payment/IPaymentGateway";
import { IPaymentValidationService } from "../../ports/payment/IPaymentValidationService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

export interface CreatePaymentInputDTO {
    sinhVienId: string;
    hocKyId: string;
    amount: number;
}

export interface CreatePaymentOutputDTO {
    payUrl: string;
    orderId: string;
    amount: number;
}

@injectable()
export class CreatePaymentUseCase {
    constructor(
        @inject(IPaymentRepository) private paymentRepo: IPaymentRepository,
        @inject(IPaymentGateway) private paymentGateway: IPaymentGateway,
        @inject(IPaymentValidationService) private validationService: IPaymentValidationService
    ) { }

    async execute(input: CreatePaymentInputDTO): Promise<ServiceResult<CreatePaymentOutputDTO>> {
        try {
            // Validation: Amount
            if (input.amount <= 0) {
                throw new InvalidPaymentAmountError(input.amount);
            }

            // ✅ Validation: Already paid?
            const alreadyPaid = await this.validationService.checkAlreadyPaid(
                input.sinhVienId,
                input.hocKyId
            );

            if (alreadyPaid) {
                return ServiceResultBuilder.failure(
                    "Học phí đã được thanh toán rồi",
                    "ALREADY_PAID"
                );
            }

            // ✅ Validation: Amount matches tuition?
            const amountValid = await this.validationService.validateAmount(
                input.sinhVienId,
                input.hocKyId,
                input.amount
            );

            if (!amountValid) {
                return ServiceResultBuilder.failure(
                    "Số tiền không khớp với học phí",
                    "AMOUNT_MISMATCH"
                );
            }

            // Create Payment Entity
            const orderId = `ORDER_${Date.now()}_${input.sinhVienId}`;
            const payment = Payment.create({
                orderId,
                sinhVienId: input.sinhVienId,
                hocKyId: input.hocKyId,
                amount: input.amount,
                currency: "VND",
                status: PaymentStatus.CREATED,
                provider: "momo",
            });

            // Save to DB
            await this.paymentRepo.save(payment);

            // Create payment URL via Gateway
            const response = await this.paymentGateway.createPayment({
                orderId,
                amount: input.amount,
                orderInfo: `Thanh toan hoc phi HK ${input.hocKyId}`,
                redirectUrl: `${process.env.FRONTEND_URL}${process.env.MOMO_REDIRECT_PATH || '/payment/result'}`,
                ipnUrl: `${process.env.NGROK_URL}/api/payment/ipn`,
            });

            // Update payment with pay URL
            payment.markAsPending(response.payUrl);
            await this.paymentRepo.update(payment);

            return ServiceResultBuilder.success("Tạo payment thành công", {
                payUrl: response.payUrl,
                orderId,
                amount: input.amount,
            });
        } catch (error: any) {
            console.error("[CREATE_PAYMENT] Error:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi tạo payment");
        }
    }
}
