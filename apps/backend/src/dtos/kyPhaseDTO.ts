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
    hocKyStartAt: string;
    hocKyEndAt: string;
    phases: PhaseItemDTO[];
}
export interface PhaseDTO {
    phase: string;
    ngayBatDau: string;
    ngayKetThuc: string;
}

export interface HocKyHienHanhChiTietDTO {
    hocKy: {
        id: string;
        tenHocKy: string;
        ngayBatDau: string;
        ngayKetThuc: string;
    };
    nienKhoa: {
        id: string;
        tenNienKhoa: string;
    };
    phases: PhaseDTO[];
    phaseHienTai: string | null;
}

// ✅ Thêm DTOs mới
export interface PhaseItemDetailDTO {
    id: string;
    phase: string;
    startAt: string; // ISO string
    endAt: string; // ISO string
    isEnabled: boolean;
}

export interface PhasesByHocKyDTO {
    hocKyId: string;
    tenHocKy: string;
    phases: PhaseItemDetailDTO[];
}

export interface GetPhasesByHocKyRequest {
    hocKyId: string;
}
