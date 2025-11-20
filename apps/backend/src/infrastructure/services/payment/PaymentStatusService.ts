import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { IPaymentStatusService, PaymentStatusData } from "../../../application/ports/payment/IPaymentStatusService";

@injectable()
export class PaymentStatusService implements IPaymentStatusService {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async getStatus(orderId: string): Promise<PaymentStatusData | null> {
        const payment = await this.prisma.payment_transactions.findUnique({
            where: { order_id: orderId },
        });

        if (!payment) return null;

        return {
            orderId: payment.order_id,
            status: payment.status as any,
            amount: parseFloat(payment.amount.toString()),
            createdAt: payment.created_at || new Date(),
            updatedAt: payment.updated_at || new Date(),
        };
    }
}
