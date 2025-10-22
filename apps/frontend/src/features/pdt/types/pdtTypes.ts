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
    hocKyStartAt: string;
    hocKyEndAt: string;
    phases: PhaseItemDTO[];
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

export interface HocKyHienHanhDTO {
    hocKyId: string;
    tenHocKy: string;
    nienKhoaId: string;
    tenNienKhoa: string;
    ngayBatDau: string; // ISO string
    ngayKetThuc: string; // ISO string
}

export interface PhasesByHocKyDTO {
    hocKyId: string;
    tenHocKy: string;
    phases: PhaseItemDetailDTO[];
}

export interface PhaseItemDetailDTO {
    id: string;
    phase: string;
    startAt: string;
    endAt: string;
    isEnabled: boolean;
}

export interface GetPhasesByHocKyRequest {
    hocKyId: string;
}

export interface KhoaDTO {
    id: string;
    tenKhoa: string;
}

export interface UpdateDotGhiDanhRequest {
    hocKyId: string;
    isToanTruong: boolean; // true: áp dụng toàn trường, false: theo từng khoa

    // Nếu isToanTruong = true, dùng 2 field này
    thoiGianBatDau?: string; // ISO string
    thoiGianKetThuc?: string; // ISO string
    dotToanTruongId?: string;
    // Nếu isToanTruong = false, dùng array này
    dotTheoKhoa?: DotGhiDanhTheoKhoaDTO[];
}

export interface DotGhiDanhTheoKhoaDTO {
    khoaId: string;
    thoiGianBatDau: string; // ISO string
    thoiGianKetThuc: string; // ISO string
}

// ✅ Response DTO
export interface DotGhiDanhResponseDTO {
    id: string;
    hocKyId: string;
    loaiDot: string; // luôn là "ghi_danh"
    tenDot: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    isCheckToanTruong: boolean;
    khoaId: string | null;
    tenKhoa: string | null;
    gioiHanTinChi: number;
    trangThai: boolean;
}


// ========== PHÂN BỔ PHÒNG HỌC ==========

export interface PhongHocDTO {
    id: string;
    maPhong: string;
    tenCoSo: string;
    sucChua: number;
}

export interface AssignPhongRequest {
    phongHocIds: string[];
}

export interface UnassignPhongRequest {
    phongHocIds: string[];
}