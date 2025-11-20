export interface VerifyIPNRequestDTO {
    data: Record<string, any>;
}

export interface VerifyIPNResponseDTO {
    isValid: boolean;
    orderId: string;
    transactionId?: string;
    resultCode?: string;
    message?: string;
}
