export interface CreatePaymentInputDTO {
    sinhVienId: string;
    hocKyId: string;
    amount: number;
}

export interface CreatePaymentOutputDTO {
    payUrl: string;
    orderId: string;
    amount: number;
}
