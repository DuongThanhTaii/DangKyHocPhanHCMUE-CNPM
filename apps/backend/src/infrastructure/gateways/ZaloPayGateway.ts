import { injectable } from "inversify";
import crypto from "crypto";
import axios from "axios";
import type { IPaymentGateway, CreatePaymentRequest, CreatePaymentResponse, VerifyIPNRequest, VerifyIPNResponse } from "../../application/ports/payment/IPaymentGateway";

@injectable()
export class ZaloPayGateway implements IPaymentGateway {
    private readonly appId = process.env.ZALOPAY_APP_ID!;
    private readonly key1 = process.env.ZALOPAY_KEY1!;
    private readonly key2 = process.env.ZALOPAY_KEY2!;
    private readonly endpoint = process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn";

    async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> { 
        const appTime = Date.now();
        const transID = Math.floor(Math.random() * 1000000);
        const appTransId = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}_${transID}`;

        const embedData = {
            redirecturl: request.redirectUrl,
            merchant_order_id: `ORDER_${appTime}_${request.metadata?.sinhVienId || 'UNKNOWN'}`, 
        };

        const items = [{
            itemid: appTransId, 
            itemname: request.orderInfo,
            itemprice: request.amount,
            itemquantity: 1
        }];

        const orderData = {
            app_id: parseInt(this.appId),
            app_trans_id: appTransId,
            app_user: "user123",
            app_time: appTime,
            amount: request.amount,
            item: JSON.stringify(items),
            embed_data: JSON.stringify(embedData),
            description: request.orderInfo,
            bank_code: "",
            callback_url: process.env.UNIFIED_IPN_URL, 
        };

        // ✅ Build MAC theo đúng spec v2: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`;
        const mac = crypto.createHmac("sha256", this.key1).update(data).digest("hex");

        const requestBody = { ...orderData, mac };

        console.log("[ZALOPAY_GATEWAY] Create Order Request:", requestBody);
        console.log("[ZALOPAY_GATEWAY] Callback URL:", orderData.callback_url); // ✅ Log để check

        try {
            const response = await axios.post(`${this.endpoint}/v2/create`, requestBody, {
                headers: { "Content-Type": "application/json" },
            });

            console.log("[ZALOPAY_GATEWAY] Response:", response.data);

            if (response.data.return_code !== 1) {
                throw new Error(`ZaloPay error: ${response.data.return_message}`);
            }

            return {
                payUrl: response.data.order_url,
                orderId: appTransId, // ✅ Trả về app_trans_id
                requestId: appTransId,
            };
        } catch (error: any) {
            console.error("[ZALOPAY_GATEWAY] Error:", error.response?.data || error.message);
            throw error;
        }
    }

    async verifyIPN(request: VerifyIPNRequest): Promise<VerifyIPNResponse> {
        console.log("[ZALOPAY_GATEWAY] ========== VERIFY IPN ==========");
        console.log("[ZALOPAY_GATEWAY] IPN Data:", JSON.stringify(request.data, null, 2));

        try {
            const { mac: receivedMac, data: dataStr } = request.data;

            // ✅ Verify MAC theo spec v2: HMAC(key2, data)
            const calculatedMac = crypto.createHmac("sha256", this.key2).update(dataStr).digest("hex");

            const isValid = calculatedMac === receivedMac;

            console.log("[ZALOPAY_GATEWAY] Calculated MAC:", calculatedMac);
            console.log("[ZALOPAY_GATEWAY] Received MAC:", receivedMac);
            console.log("[ZALOPAY_GATEWAY] Is Valid:", isValid);

            // ✅ Parse data JSON
            const dataJson = JSON.parse(dataStr);

            return {
                isValid,
                orderId: dataJson.app_trans_id || '',
                transactionId: dataJson.zp_trans_id?.toString() || '',
                resultCode: isValid ? "1" : "0",
                message: isValid ? "Success" : "Invalid signature",
            };
        } catch (error) {
            console.error("[ZALOPAY_GATEWAY] ❌ Verify IPN error:", error);
            return {
                isValid: false,
                orderId: '',
                transactionId: '',
                resultCode: '99',
                message: 'Invalid IPN data',
            };
        }
    }
}
