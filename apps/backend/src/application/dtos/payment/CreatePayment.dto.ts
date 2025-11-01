export interface CreatePaymentRequestDTO {
    orderId: string;
    amount: number;
    orderInfo: string;
    redirectUrl: string;
}

export interface CreatePaymentResponseDTO {
    payUrl: string;
    orderId: string;
    requestId: string;
}
