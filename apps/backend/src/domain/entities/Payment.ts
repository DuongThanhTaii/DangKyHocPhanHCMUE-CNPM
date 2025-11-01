export enum PaymentStatus {
    CREATED = "created",
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed",
}

export interface PaymentProps {
    id: string;
    orderId: string;
    sinhVienId: string;
    hocKyId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: string;
    payUrl?: string;
    resultCode?: string;
    message?: string;
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Payment {
    private constructor(private readonly props: PaymentProps) { }

    // Factory method
    static create(data: Omit<PaymentProps, "id" | "createdAt" | "updatedAt">): Payment {
        return new Payment({
            ...data,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Reconstruct from DB
    static from(props: PaymentProps): Payment {
        return new Payment(props);
    }

    // Getters
    get id(): string {
        return this.props.id;
    }

    get orderId(): string {
        return this.props.orderId;
    }

    get sinhVienId(): string {
        return this.props.sinhVienId;
    }

    get amount(): number {
        return this.props.amount;
    }

    get status(): PaymentStatus {
        return this.props.status;
    }

    get payUrl(): string | undefined {
        return this.props.payUrl;
    }

    // Business methods
    markAsPending(payUrl: string): void {
        this.props.status = PaymentStatus.PENDING;
        this.props.payUrl = payUrl;
        this.props.updatedAt = new Date();
    }

    markAsSuccess(transactionId: string, resultCode: string): void {
        this.props.status = PaymentStatus.SUCCESS;
        this.props.transactionId = transactionId;
        this.props.resultCode = resultCode;
        this.props.updatedAt = new Date();
    }

    markAsFailed(resultCode: string, message: string): void {
        this.props.status = PaymentStatus.FAILED;
        this.props.resultCode = resultCode;
        this.props.message = message;
        this.props.updatedAt = new Date();
    }

    updateOrderId(newOrderId: string): void {
        this.props.orderId = newOrderId;
    }

    // Validation
    isSuccessful(): boolean {
        return this.props.status === PaymentStatus.SUCCESS;
    }

    // Export
    toObject(): PaymentProps {
        return { ...this.props };
    }
}
