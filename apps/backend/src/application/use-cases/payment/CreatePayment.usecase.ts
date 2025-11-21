import { injectable, inject } from "inversify";
import { Payment, PaymentStatus } from "../../../domain/entities/Payment";
import { IPaymentRepository } from "../../ports/payment/IPaymentRepository";
import { IPaymentGatewayFactory } from "../../ports/payment/IPaymentGatewayFactory";
import { IPaymentValidationService } from "../../ports/payment/IPaymentValidationService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";
import { CreatePaymentInputDTO } from "../../dtos/payment/CreatePaymentInput.dto";
import { CreatePaymentOutputDTO } from "../../dtos/payment/CreatePaymentOutput.dto";


@injectable()
export class CreatePaymentUseCase {
    constructor(
        @inject(IPaymentRepository) private paymentRepo: IPaymentRepository,
        @inject(IPaymentGatewayFactory) private gatewayFactory: IPaymentGatewayFactory,
        @inject(IPaymentValidationService) private validationService: IPaymentValidationService
    ) { }

    async execute(input: CreatePaymentInputDTO): Promise<ServiceResult<CreatePaymentOutputDTO>> {
        try {
            const hocPhi = await this.validationService.getTuitionAmount(
                input.sinhVienId,
                input.hocKyId
            );

            if (!hocPhi) {
                return ServiceResultBuilder.failure(
                    "Không tìm thấy thông tin học phí. Vui lòng tính học phí trước khi thanh toán.",
                    "TUITION_NOT_FOUND"
                );
            }

            const amount = hocPhi.tong_hoc_phi;

            // Validation: Amount
            if (amount <= 0) {
                return ServiceResultBuilder.failure(
                    "Số tiền học phí không hợp lệ",
                    "INVALID_AMOUNT"
                );
            }

            if (hocPhi.trang_thai_thanh_toan === "da_thanh_toan") {
                return ServiceResultBuilder.failure(
                    "Học phí đã được thanh toán rồi",
                    "ALREADY_PAID"
                );
            }

            const provider = input.provider || "momo";
            const gateway = this.gatewayFactory.create(provider);

            // ✅ Gateway tự tạo orderId
            const response = await gateway.createPayment({
                amount,
                orderInfo: `Thanh toan hoc phi HK ${input.hocKyId}`,
                redirectUrl: `${process.env.FRONTEND_URL}/payment/result`,
                ipnUrl: process.env.UNIFIED_IPN_URL,
                ipAddr: input.ipAddr,
                metadata: {
                    sinhVienId: input.sinhVienId,
                    hocKyId: input.hocKyId,
                },
            });

            // ✅ Dùng orderId do Gateway trả về
            const orderId = response.orderId;

            const payment = Payment.create({
                orderId,
                sinhVienId: input.sinhVienId,
                hocKyId: input.hocKyId,
                amount,
                currency: "VND", // ✅ Thêm field bị thiếu
                status: PaymentStatus.CREATED,
                provider,
            });

            await this.paymentRepo.save(payment);
            payment.markAsPending(response.payUrl);
            await this.paymentRepo.update(payment);

            return ServiceResultBuilder.success("Tạo payment thành công", {
                payUrl: response.payUrl,
                orderId, // ✅ Trả về orderId từ Gateway
                amount,
            });
        } catch (error: any) {
            console.error("[CREATE_PAYMENT] Error:", error);
            return ServiceResultBuilder.failure(error.message || "Lỗi khi tạo payment");
        }
    }
}
