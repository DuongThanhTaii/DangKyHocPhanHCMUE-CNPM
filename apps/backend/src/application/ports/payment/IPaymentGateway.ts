import { CreatePaymentRequestDTO, CreatePaymentResponseDTO } from "../../dtos/payment/CreatePayment.dto";
import { VerifyIPNRequestDTO, VerifyIPNResponseDTO } from "../../dtos/payment/VerifyIPN.dto";

export interface CreatePaymentRequest {
    amount: number;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl?: string;
    ipAddr?: string;
    metadata?: {
        sinhVienId: string;
        hocKyId: string;
    };
}

export interface CreatePaymentResponse {
    payUrl: string;
    orderId: string;
    requestId: string;
}

export interface VerifyIPNRequest {
    data: Record<string, any>;
}

export interface VerifyIPNResponse {
    isValid: boolean;
    orderId: string;
    transactionId?: string;
    resultCode?: string;
    message?: string;
}

export interface IPaymentGateway {
    createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponseDTO>;
    verifyIPN(request: VerifyIPNRequestDTO): Promise<VerifyIPNResponseDTO>;
}

export const IPaymentGateway = Symbol.for("IPaymentGateway");
