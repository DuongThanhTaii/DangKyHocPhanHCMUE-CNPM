export interface CreateKyPhaseDTO {
    id_hoc_ky: string;
    phase: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
}

export interface KyPhaseResponseDTO {
    id: string;
    hocKyId: string;
    phase: string;
    startAt: Date;
    endAt: Date;
    isEnabled: boolean;
}
export interface PhaseItemDTO {
    phase: string;
    startAt: string;
    endAt: string;
}

export interface CreateBulkKyPhaseRequest {
    hocKyId: string;
    phases: PhaseItemDTO[];
}
