import { injectable, inject } from "inversify";
import { PrismaClient } from "@prisma/client";
import { Payment } from "../../../domain/entities/Payment";
import { IPaymentRepository } from "../../../application/ports/payment/IPaymentRepository";

@injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(@inject(PrismaClient) private prisma: PrismaClient) { }

    async save(payment: Payment): Promise<void> {
        const props = payment.toObject();
        await this.prisma.payment_transactions.create({
            data: {
                id: props.id,
                order_id: props.orderId,
                sinh_vien_id: props.sinhVienId,
                hoc_ky_id: props.hocKyId,
                amount: props.amount,
                currency: props.currency,
                status: props.status,
                provider: props.provider,
                pay_url: props.payUrl,
                result_code: props.resultCode,
                message: props.message,
                created_at: props.createdAt,
                updated_at: props.updatedAt,
            },
        });
    }

    async findByOrderId(orderId: string): Promise<Payment | null> {
        const record = await this.prisma.payment_transactions.findUnique({
            where: { order_id: orderId },
        });

        if (!record) return null;

        return Payment.from({
            id: record.id,
            orderId: record.order_id,
            sinhVienId: record.sinh_vien_id,
            hocKyId: record.hoc_ky_id,
            amount: parseFloat(record.amount.toString()),
            currency: record.currency || "VND",
            status: record.status as any,
            provider: record.provider || "momo",
            payUrl: record.pay_url || undefined,
            resultCode: record.result_code || undefined,
            message: record.message || undefined,
            transactionId: undefined,
            createdAt: record.created_at || new Date(),
            updatedAt: record.updated_at || new Date(),
        });
    }

    async update(payment: Payment): Promise<void> {
        const props = payment.toObject();
        await this.prisma.payment_transactions.update({
            where: { order_id: props.orderId },
            data: {
                status: props.status,
                pay_url: props.payUrl,
                result_code: props.resultCode,
                message: props.message,
                updated_at: new Date(),
            },
        });
    }
}
