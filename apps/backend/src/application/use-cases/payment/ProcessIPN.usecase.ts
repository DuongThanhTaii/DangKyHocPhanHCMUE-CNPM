import { injectable, inject } from "inversify";
import { IPaymentRepository } from "../../ports/payment/IPaymentRepository";
import { IPaymentGateway } from "../../ports/payment/IPaymentGateway";
import { IHocPhiService } from "../../ports/tuition/IHocPhiService";
import { ServiceResult, ServiceResultBuilder } from "../../../types/serviceResult";

@injectable()
export class ProcessIPNUseCase {
    constructor(
        @inject(IPaymentRepository) private paymentRepo: IPaymentRepository,
        @inject(IPaymentGateway) private paymentGateway: IPaymentGateway,
        @inject(IHocPhiService) private hocPhiService: IHocPhiService
    ) { }

    async execute(ipnData: Record<string, any>): Promise<ServiceResult<null>> {
        try {
            console.log("[IPN_USE_CASE] ========== START PROCESSING ==========");
            console.log("[IPN_USE_CASE] Data:", JSON.stringify(ipnData, null, 2));

            // 1. Verify IPN signature
            console.log("[IPN_USE_CASE] Step 1: Verifying signature...");
            const verifyResult = await this.paymentGateway.verifyIPN({ data: ipnData });
            console.log("[IPN_USE_CASE] Signature valid:", verifyResult.isValid);

            if (!verifyResult.isValid) {
                console.error("[IPN_USE_CASE] ❌ Invalid signature!");
                return ServiceResultBuilder.failure("Invalid IPN signature", "INVALID_SIGNATURE");
            }

            const { orderId, transactionId, resultCode, message } = verifyResult;
            console.log("[IPN_USE_CASE] Order ID:", orderId);
            console.log("[IPN_USE_CASE] Transaction ID:", transactionId);
            console.log("[IPN_USE_CASE] Result Code:", resultCode);

            // 2. Find payment
            console.log("[IPN_USE_CASE] Step 2: Finding payment...");
            const payment = await this.paymentRepo.findByOrderId(orderId);

            if (!payment) {
                console.error("[IPN_USE_CASE] ❌ Payment not found:", orderId);
                return ServiceResultBuilder.failure("Payment not found", "PAYMENT_NOT_FOUND");
            }

            console.log("[IPN_USE_CASE] Payment found:", payment.toObject().status);

            // 3. Check if already processed
            if (payment.isSuccessful()) {
                console.log("[IPN_USE_CASE] ⚠️ Payment already processed");
                return ServiceResultBuilder.success("Payment already processed", null);
            }

            // 4. Update payment status
            console.log("[IPN_USE_CASE] Step 3: Updating payment status...");
            // Always compare as string to avoid TS warning
            if (String(resultCode) === "0") {
                payment.markAsSuccess(transactionId || "", resultCode?.toString() || "0");
                await this.paymentRepo.update(payment);
                console.log("[IPN_USE_CASE] ✅ Payment updated to SUCCESS");

                // 5. Update hoc_phi status
                console.log("[IPN_USE_CASE] Step 4: Updating hoc_phi...");
                const props = payment.toObject();

                try {
                    await this.hocPhiService.updatePaymentStatus(
                        props.sinhVienId,
                        props.hocKyId
                    );
                    console.log("[IPN_USE_CASE] ✅ Hoc phi updated to da_thanh_toan");
                } catch (hocPhiError) {
                    console.error("[IPN_USE_CASE] ❌ Failed to update hoc_phi:", hocPhiError);
                    // Không throw error để vẫn trả về success cho MoMo
                }
            } else {
                payment.markAsFailed(resultCode?.toString() || "", message || "Payment failed");
                await this.paymentRepo.update(payment);
                console.log("[IPN_USE_CASE] ❌ Payment marked as FAILED");
            }

            console.log("[IPN_USE_CASE] ========== PROCESSING COMPLETE ==========");
            return ServiceResultBuilder.success("IPN processed successfully", null);
        } catch (error) {
            console.error("[IPN_USE_CASE] ========== PROCESSING ERROR ==========");
            console.error("[IPN_USE_CASE] Error:", error);
            console.error("[IPN_USE_CASE] Stack:", (error as Error).stack);
            return ServiceResultBuilder.failure("Error processing IPN", "INTERNAL_ERROR");
        }
    }
}
