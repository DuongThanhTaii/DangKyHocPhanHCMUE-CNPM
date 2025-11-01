import { injectable, inject } from "inversify";
import { IPaymentRepository } from "../../ports/payment/IPaymentRepository";
import { IPaymentGatewayFactory } from "../../ports/payment/IPaymentGatewayFactory";
import { IHocPhiService } from "../../ports/tuition/IHocPhiService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

export interface IPNHandlerResult {
    isSuccess: boolean;
    provider: "momo" | "vnpay" | "zalopay"; // ✅ Thêm zalopay
    responseFormat: "no_content" | "json";
    responseData?: { RspCode: string; Message: string };
}

@injectable()
export class UnifiedIPNHandlerUseCase {
    constructor(
        @inject(IPaymentRepository) private paymentRepo: IPaymentRepository,
        @inject(IPaymentGatewayFactory) private gatewayFactory: IPaymentGatewayFactory,
        @inject(IHocPhiService) private hocPhiService: IHocPhiService
    ) { }

    async execute(requestData: Record<string, any>): Promise<ServiceResult<IPNHandlerResult>> {
        try {
            console.log("[UNIFIED_IPN] ========== START PROCESSING ==========");
            console.log("[UNIFIED_IPN] Request Data:", JSON.stringify(requestData, null, 2));

            // ✅ Step 1: Detect provider
            const provider = this.detectProvider(requestData);
            if (!provider) {
                console.error("[UNIFIED_IPN] ❌ Cannot detect provider");
                return ServiceResultBuilder.failure("Cannot detect provider", "INVALID_PROVIDER");
            }

            console.log(`[UNIFIED_IPN] ✅ Detected provider: ${provider}`);

            // ✅ Step 2: Verify signature
            const gateway = this.gatewayFactory.create(provider);
            const verifyResult = await gateway.verifyIPN({ data: requestData });

            console.log("[UNIFIED_IPN] Verify result:", {
                isValid: verifyResult.isValid,
                orderId: verifyResult.orderId,
                transactionId: verifyResult.transactionId,
                resultCode: verifyResult.resultCode,
            });

            if (!verifyResult.isValid) {
                console.error("[UNIFIED_IPN] ❌ Invalid signature");
                return ServiceResultBuilder.failure("Invalid signature", "INVALID_SIGNATURE");
            }

            console.log("[UNIFIED_IPN] ✅ Signature valid");

            const { orderId, transactionId, resultCode } = verifyResult;

            // ✅ Step 3: Find payment
            const payment = await this.paymentRepo.findByOrderId(orderId);
            if (!payment) {
                console.error("[UNIFIED_IPN] ❌ Payment not found:", orderId);
                return ServiceResultBuilder.failure("Payment not found", "PAYMENT_NOT_FOUND");
            }

            console.log("[UNIFIED_IPN] ✅ Payment found:", payment.toObject());

            // ✅ Step 4: Check if already processed
            if (payment.isSuccessful()) {
                console.log("[UNIFIED_IPN] ⚠️ Payment already processed");
                return ServiceResultBuilder.success("Already processed", {
                    isSuccess: true,
                    provider,
                    responseFormat: provider === "momo" ? "no_content" : "json",
                    responseData: provider === "vnpay" ? { RspCode: "00", Message: "success" } : undefined,
                });
            }

            // ✅ Step 5: Update payment status
            const isSuccess = String(resultCode) === "0" || String(resultCode) === "00" || String(resultCode) === "1";

            console.log("[UNIFIED_IPN] Result code:", resultCode, "Is success:", isSuccess);

            if (isSuccess) {
                payment.markAsSuccess(transactionId || "", resultCode?.toString() || "0");
                await this.paymentRepo.update(payment);
                console.log("[UNIFIED_IPN] ✅ Payment updated to SUCCESS");

                // Update hoc_phi
                const props = payment.toObject();
                try {
                    await this.hocPhiService.updatePaymentStatus(props.sinhVienId, props.hocKyId);
                    console.log("[UNIFIED_IPN] ✅ Hoc phi updated");
                } catch (error) {
                    console.error("[UNIFIED_IPN] ❌ Failed to update hoc_phi:", error);
                }
            } else {
                payment.markAsFailed(resultCode?.toString() || "", "Payment failed");
                await this.paymentRepo.update(payment);
                console.log("[UNIFIED_IPN] ❌ Payment marked as FAILED");
            }

            console.log("[UNIFIED_IPN] ========== PROCESSING COMPLETE ==========");

            return ServiceResultBuilder.success("IPN processed successfully", {
                isSuccess: true,
                provider,
                responseFormat: provider === "momo" ? "no_content" : "json",
                responseData: provider === "vnpay" || provider === "zalopay"
                    ? { RspCode: "00", Message: "success" } // ✅ Fix: Thêm zalopay
                    : undefined,
            });
        } catch (error) {
            console.error("[UNIFIED_IPN] ========== ERROR ==========", error);
            return ServiceResultBuilder.failure("Error processing IPN", "INTERNAL_ERROR");
        }
    }

    private detectProvider(data: Record<string, any>): "momo" | "vnpay" | "zalopay" | null {
        // MoMo: có partnerCode hoặc transId
        if (data.partnerCode || data.transId) {
            return "momo";
        }

        // VNPay: có vnp_TmnCode hoặc vnp_SecureHash
        if (data.vnp_TmnCode || data.vnp_SecureHash) {
            return "vnpay";
        }

        // ZaloPay: có type=1 và data là JSON string
        if (data.type === 1 && typeof data.data === 'string' && data.mac) {
            return "zalopay";
        }

        // Fallback: check nếu data.data chứa app_id (ZaloPay)
        if (data.data && typeof data.data === 'string') {
            try {
                const parsed = JSON.parse(data.data);
                if (parsed.app_id && parsed.app_trans_id) {
                    return "zalopay";
                }
            } catch (e) {
                // Not JSON
            }
        }

        return null;
    }
}
