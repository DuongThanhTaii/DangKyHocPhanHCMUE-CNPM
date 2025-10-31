export interface PolicyData {
    id: string;
    phi_moi_tin_chi: number;
}

export interface IPolicyService {
    getPolicyForStudent(sinh_vien_id: string, hoc_ky_id: string): Promise<PolicyData | null>;
}

export const IPolicyService = Symbol.for("IPolicyService");
