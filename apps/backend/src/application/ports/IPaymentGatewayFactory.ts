import { IPaymentGateway } from "./IPaymentGateway";

export type PaymentProvider = "momo" | "vnpay" | "bank_transfer";

export interface IPaymentGatewayFactory {
    create(provider: PaymentProvider): IPaymentGateway;
}

export const IPaymentGatewayFactory = Symbol.for("IPaymentGatewayFactory");
