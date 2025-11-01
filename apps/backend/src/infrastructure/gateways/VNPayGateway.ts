import { injectable } from "inversify";
import type { IPaymentGateway, CreatePaymentRequest, CreatePaymentResponse, VerifyIPNRequest, VerifyIPNResponse } from "../../application/ports/payment/IPaymentGateway";

@injectable()
export class VNPayGateway implements IPaymentGateway {
    private vnpay: any;

    constructor() {
        this.initVNPay();
    }

    private async initVNPay() {
        const { VNPay, ignoreLogger, HashAlgorithm } = await import("vnpay");
        this.vnpay = new VNPay({
            tmnCode: process.env.VNPAY_TMN_CODE!,
            secureSecret: process.env.VNPAY_SECRET_KEY!,
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
            enableLog: true,
            loggerFn: ignoreLogger,
        });
    }

    async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> { // ✅ Đổi từ DTO sang Interface
        if (!this.vnpay) await this.initVNPay();

        const { ProductCode, VnpLocale, dateFormat } = await import("vnpay");

        // ✅ Tạo orderId từ metadata
        const orderId = `ORDER_${Date.now()}_${request.metadata?.sinhVienId || 'UNKNOWN'}`;

        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const paymentUrl = this.vnpay.buildPaymentUrl({
            vnp_Amount: request.amount,
            vnp_IpAddr: request.ipAddr || '127.0.0.1',
            vnp_ReturnUrl: request.redirectUrl,
            vnp_TxnRef: orderId, // ✅ Dùng orderId vừa tạo
            vnp_OrderInfo: request.orderInfo,
            vnp_OrderType: ProductCode.Other,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(tomorrow),
        });

        console.log("[VNPAY_GATEWAY] Payment URL:", paymentUrl);

        return {
            payUrl: paymentUrl,
            orderId, // ✅ Trả về orderId đã tạo
            requestId: orderId,
        };
    }

    async verifyIPN(request: VerifyIPNRequest): Promise<VerifyIPNResponse> {
        if (!this.vnpay) await this.initVNPay();

        console.log("[VNPAY_GATEWAY] ========== VERIFY IPN ==========");
        console.log("[VNPAY_GATEWAY] IPN Data:", JSON.stringify(request.data, null, 2));

        try {
            const verify = this.vnpay.verifyReturnUrl(request.data);

            console.log("[VNPAY_GATEWAY] Verify result:", {
                isVerified: verify.isVerified,
                isSuccess: verify.isSuccess,
                message: verify.message,
            });

            return {
                isValid: verify.isVerified && verify.isSuccess,
                orderId: request.data.vnp_TxnRef as string,
                transactionId: request.data.vnp_TransactionNo as string,
                resultCode: request.data.vnp_ResponseCode as string,
                message: verify.message,
            };
        } catch (error) {
            console.error("[VNPAY_GATEWAY] ❌ Verify IPN error:", error);
            return {
                isValid: false,
                orderId: request.data.vnp_TxnRef as string || '',
                transactionId: '',
                resultCode: '99',
                message: 'Invalid IPN data',
            };
        }
    }
}
