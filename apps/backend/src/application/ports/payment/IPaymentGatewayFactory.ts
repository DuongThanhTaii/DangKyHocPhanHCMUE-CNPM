import { IPaymentGateway } from "./IPaymentGateway";

export type PaymentProvider = "momo" | "vnpay" | "zalopay"; // ✅ Thêm zalopay

export interface IPaymentGatewayFactory {
    create(provider: PaymentProvider): IPaymentGateway;
}

export const IPaymentGatewayFactory = Symbol.for("IPaymentGatewayFactory");
