export class PaymentDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PaymentDomainError";
    }
}

export class InvalidPaymentAmountError extends PaymentDomainError {
    constructor(amount: number) {
        super(`Invalid payment amount: ${amount}. Must be greater than 0.`);
        this.name = "InvalidPaymentAmountError";
    }
}

export class PaymentAlreadyProcessedError extends PaymentDomainError {
    constructor(orderId: string) {
        super(`Payment for order ${orderId} has already been processed.`);
        this.name = "PaymentAlreadyProcessedError";
    }
}

export class PaymentNotFoundError extends PaymentDomainError {
    constructor(orderId: string) {
        super(`Payment with order ID ${orderId} not found.`);
        this.name = "PaymentNotFoundError";
    }
}
