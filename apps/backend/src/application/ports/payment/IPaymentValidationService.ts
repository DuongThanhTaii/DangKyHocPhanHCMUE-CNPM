export interface IPaymentValidationService {
    checkAlreadyPaid(sinh_vien_id: string, hoc_ky_id: string): Promise<boolean>;
    validateAmount(sinh_vien_id: string, hoc_ky_id: string, amount: number): Promise<boolean>;
    getTuitionAmount(sinh_vien_id: string, hoc_ky_id: string): Promise<{ tong_hoc_phi: number; trang_thai_thanh_toan: string } | null>;
}

export const IPaymentValidationService = Symbol.for("IPaymentValidationService");
