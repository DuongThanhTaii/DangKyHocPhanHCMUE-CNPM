export interface CreatePaymentInputDTO {
    sinhVienId: string;
    hocKyId: string;
    provider?: "momo" | "vnpay" | "zalopay";
    ipAddr?: string; // ✅ Thêm field này
}
