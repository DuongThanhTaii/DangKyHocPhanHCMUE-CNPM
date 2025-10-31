export interface IPaymentValidationService {
    checkAlreadyPaid(sinh_vien_id: string, hoc_ky_id: string): Promise<boolean>;
    validateAmount(sinh_vien_id: string, hoc_ky_id: string, amount: number): Promise<boolean>;
}

export const IPaymentValidationService = Symbol.for("IPaymentValidationService");
