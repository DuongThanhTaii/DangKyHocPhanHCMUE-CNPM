export interface IHocPhiService {
    updatePaymentStatus(sinhVienId: string, hocKyId: string): Promise<void>;
    computeTuition(sinhVienId: string, hocKyId: string): Promise<number>;
}

export const IHocPhiService = Symbol.for("IHocPhiService");
