export interface PaymentStatusData {
    orderId: string;
    status: "pending" | "success" | "failed" | "cancelled";
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPaymentStatusService {
    getStatus(orderId: string): Promise<PaymentStatusData | null>;
}

export const IPaymentStatusService = Symbol.for("IPaymentStatusService");
