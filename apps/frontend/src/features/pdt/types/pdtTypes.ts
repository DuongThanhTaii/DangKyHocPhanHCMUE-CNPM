/**
* PDT Types - System Phase Management
*/

export interface HienHanh {
    phase?: string;
    ten_hoc_ky?: string;
    ten_nien_khoa?: string;
    ngay_bat_dau?: string | null;
    ngay_ket_thuc?: string | null;
    id_nien_khoa?: string;
    id_hoc_ky?: string;
}

export interface NienKhoa {
    id: string;
    ten_nien_khoa: string;
}

export interface HocKy {
    id: string;
    ten_hoc_ky: string;
    ma_hoc_ky: string;
}

export interface PhaseTime {
    start: string;
    end: string;
}

export interface KyPhase {
    phase: string;
    start_at: string;
    end_at: string;
    is_enabled: boolean;
}

export interface SetHocKyRequest {
    id_nien_khoa: string;
    id_hoc_ky: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
}

export interface BulkUpsertPhaseRequest {
    items: KyPhase[];
}

export interface HocKyDTO {
    id: string;
    tenHocKy: string;
    ngayBatDau: Date | null;
    ngayKetThuc: Date | null;
}

export interface HocKyNienKhoaDTO {
    id: string;
    tenNienKhoa: string;
    ngayBatDau: Date | null;
    ngayKetThuc: Date | null;
    hocKy: HocKyDTO[];
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

export interface CreateBulkKyPhaseDTO {
    hocKyId: string;
    phases: Array<{
        phase: string;
        startAt: Date;
        endAt: Date;
    }>;
}

export interface KyPhaseResponseDTO {
    id: string;
    hocKyId: string;
    phase: string;
    startAt: Date; // BE trả về Date
    endAt: Date;
    isEnabled: boolean;
}

export interface SetHocKyHienTaiRequest {
    id_nien_khoa: string;
    id_hoc_ky: string;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
}

export const PHASE_NAMES: Record<string, string> = {
    de_xuat_phe_duyet: "Tiền ghi danh",
    ghi_danh: "Ghi danh học phần",
    sap_xep_tkb: "Sắp xếp thời khóa biểu",
    dang_ky_hoc_phan: "Đăng ký học phần",
    binh_thuong: "Bình thường",
};

export const PHASE_ORDER: string[] = [
    "de_xuat_phe_duyet",
    "ghi_danh",
    "sap_xep_tkb",
    "dang_ky_hoc_phan",
    "binh_thuong",
];

export interface SetHocKyHienThanhRequest {
    hocKyId: string;
}


export interface DeXuatHocPhanForPDTDTO {
    id: string;
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    giangVien: string;
    trangThai: string;
}


export interface UpdateTrangThaiByPDTRequest {
    id: string;
}
