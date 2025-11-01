import { injectable } from "inversify";
import crypto from "crypto";
import axios from "axios";
import { IPaymentGateway, CreatePaymentRequest, CreatePaymentResponse, VerifyIPNRequest, VerifyIPNResponse } from "../../application/ports/payment/IPaymentGateway";

@injectable()
export class MoMoGateway implements IPaymentGateway {
    private readonly accessKey = process.env.MOMO_ACCESS_KEY!;
    private readonly secretKey = process.env.MOMO_SECRET_KEY!;
    private readonly partnerCode = process.env.MOMO_PARTNER_CODE!;
    private readonly endpoint = process.env.MOMO_ENDPOINT!;

    async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> { // ✅ Đổi từ DTO sang Interface
        // ✅ Tạo orderId từ metadata
        const orderId = `ORDER_${Date.now()}_${request.metadata?.sinhVienId || 'UNKNOWN'}`;
        const extraData = "";
        const requestType = "payWithMethod";

        // ✅ Chỉ lấy từ env, không hardcode
        const ipnUrl = process.env.UNIFIED_IPN_URL!;

        const signature = this.signCreateRequest({
            accessKey: this.accessKey,
            secretKey: this.secretKey,
            amount: request.amount,
            orderId,
            orderInfo: request.orderInfo,
            redirectUrl: request.redirectUrl,
            ipnUrl,
            partnerCode: this.partnerCode,
            requestId: orderId, // Sử dụng orderId làm requestId
            requestType,
            extraData,
        });

        const response = await axios.post(`${this.endpoint}/v2/gateway/api/create`, {
            partnerCode: this.partnerCode,
            accessKey: this.accessKey,
            requestId: orderId, // Sử dụng orderId làm requestId
            amount: request.amount,
            orderId,
            orderInfo: request.orderInfo,
            redirectUrl: request.redirectUrl,
            ipnUrl,
            requestType,
            extraData,
            signature,
            lang: "vi",
        });

        return {
            payUrl: response.data.payUrl,
            orderId, // ✅ Trả về orderId đã tạo
            requestId: response.data.requestId,
        };
    }

    async verifyIPN(request: VerifyIPNRequest): Promise<VerifyIPNResponse> {
        const isValid = this.verifyIPNSignature({
            secretKey: this.secretKey,
            data: request.data,
        });

        return {
            isValid,
            orderId: request.data.orderId,
            transactionId: request.data.transId,
            resultCode: request.data.resultCode,
            message: request.data.message,
        };
    }

    private signCreateRequest(params: {
        accessKey: string;
        secretKey: string;
        amount: number;
        orderId: string;
        orderInfo: string;
        redirectUrl: string;
        ipnUrl: string;
        partnerCode: string;
        requestId: string;
        requestType: string;
        extraData: string;
    }): string {
        const raw =
            `accessKey=${params.accessKey}` +
            `&amount=${params.amount}` +
            `&extraData=${params.extraData}` +
            `&ipnUrl=${params.ipnUrl}` +
            `&orderId=${params.orderId}` +
            `&orderInfo=${params.orderInfo}` +
            `&partnerCode=${params.partnerCode}` +
            `&redirectUrl=${params.redirectUrl}` +
            `&requestId=${params.requestId}` +
            `&requestType=${params.requestType}`;

        return crypto.createHmac("sha256", params.secretKey).update(raw).digest("hex");
    }

    private verifyIPNSignature(params: { secretKey: string; data: any }): boolean {
        // accessKey phải lấy từ biến môi trường, không lấy từ payload
        const accessKey = this.accessKey;
        const get = (k: string) => (params.data[k] !== undefined && params.data[k] !== null ? params.data[k] : "");
        const raw =
            `accessKey=${accessKey}` +
            `&amount=${get("amount")}` +
            `&extraData=${get("extraData")}` +
            `&message=${get("message")}` +
            `&orderId=${get("orderId")}` +
            `&orderInfo=${get("orderInfo")}` +
            `&orderType=${get("orderType")}` +
            `&partnerCode=${get("partnerCode")}` +
            `&payType=${get("payType")}` +
            `&requestId=${get("requestId")}` +
            `&responseTime=${get("responseTime")}` +
            `&resultCode=${get("resultCode")}` +
            `&transId=${get("transId")}`;

        const expected = require("crypto")
            .createHmac("sha256", params.secretKey)
            .update(raw)
            .digest("hex");

        // Debug log để so sánh
        console.log("[MoMoGateway] Raw string for signature:", raw);
        console.log("[MoMoGateway] Expected signature:", expected);
        console.log("[MoMoGateway] Received signature:", get("signature"));

        return expected === get("signature");
    }
}
