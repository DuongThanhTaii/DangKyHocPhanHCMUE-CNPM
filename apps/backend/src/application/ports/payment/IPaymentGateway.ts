import { CreatePaymentRequestDTO, CreatePaymentResponseDTO } from "../../dtos/payment/CreatePayment.dto";
import { VerifyIPNRequestDTO, VerifyIPNResponseDTO } from "../../dtos/payment/VerifyIPN.dto";

export interface CreatePaymentRequest {
    orderId: string;
    amount: number;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl: string;
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
    createPayment(request: CreatePaymentRequestDTO): Promise<CreatePaymentResponseDTO>;
    verifyIPN(request: VerifyIPNRequestDTO): Promise<VerifyIPNResponseDTO>;
}

export const IPaymentGateway = Symbol.for("IPaymentGateway");
