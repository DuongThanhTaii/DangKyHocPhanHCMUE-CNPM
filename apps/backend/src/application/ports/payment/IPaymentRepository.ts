import { Payment } from "../../../domain/entities/Payment";

export interface IPaymentRepository {
    save(payment: Payment): Promise<void>;
    findByOrderId(orderId: string): Promise<Payment | null>;
    update(payment: Payment): Promise<void>;
}

export const IPaymentRepository = Symbol.for("IPaymentRepository");
