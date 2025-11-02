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
    id: string;
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
    khoaId?: string; // ✅ Optional - will be merged in API call
    phongHocIds: string[];
}

export interface UnassignPhongRequest {
    khoaId?: string; // ✅ Optional - will be merged in API call
    phongHocIds: string[];
}

// ========== PHASE MANAGEMENT ==========

export interface PhaseTimeConfigDTO {
    phaseType: "ghi_danh" | "dang_ky";
    ngayBatDau: string;
    ngayKetThuc: string;
    trangThai: "active" | "upcoming" | "ended";
}

export interface UpdatePhaseTimeRequest {
    phaseType: "ghi_danh" | "dang_ky";
    ngayBatDau: string;
    ngayKetThuc: string;
}

export interface GetPhaseTimeResponse {
    ghiDanh: PhaseTimeConfigDTO | null;
    dangKy: PhaseTimeConfigDTO | null;
}

// ✅ Response đợt đăng ký (giống cấu trúc ghi danh)
export interface DotDangKyResponseDTO {
    id: string;
    hocKyId: string;
    loaiDot: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    hanHuyDen: string | null;
    isCheckToanTruong: boolean;
    khoaId: string | null;
    tenKhoa: string | null;
    gioiHanTinChi: number;
}

export interface DotDangKyTheoKhoaDTO {
    id?: string;
    khoaId: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    hanHuyDen?: string;
    gioiHanTinChi?: number;
}

export interface UpdateDotDangKyRequest {
    hocKyId: string;
    isToanTruong: boolean;
    gioiHanTinChi?: number;

    // Nếu isToanTruong = true
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
    hanHuyDen?: string;
    dotToanTruongId?: string;

    // Nếu isToanTruong = false
    dotTheoKhoa?: DotDangKyTheoKhoaDTO[];
}

// ========== CHÍNH SÁCH TÍN CHỈ ==========

export interface ChinhSachTinChiDTO {
    id: string;
    hocKy?: {
        tenHocKy?: string | null;
        maHocKy?: string | null;
    } | null;
    khoa?: {
        tenKhoa?: string | null;
    } | null;
    nganhHoc?: {
        tenNganh?: string | null;
    } | null;
    phiMoiTinChi: number;
    ngayHieuLuc?: string | null;
    ngayHetHieuLuc?: string | null;
}

export interface CreateChinhSachTinChiRequest {
    hocKyId: string;
    khoaId?: string | null;
    nganhId?: string | null;
    phiMoiTinChi: number;
}

export interface UpdateChinhSachTinChiRequest {
    phiMoiTinChi: number;
}

export interface NganhDTO {
    id: string;
    maNganh: string; // ✅ Add maNganh
    tenNganh: string;
    khoaId: string;
}

// ========== HỌC PHÍ ==========

export interface TinhHocPhiHangLoatRequest {
    hoc_ky_id: string;
}

export interface TinhHocPhiErrorItem {
    sinhVienId: string;
    mssv: string;
    error: string;
}

export interface TinhHocPhiHangLoatResponse {
    totalProcessed: number;
    successCount: number;
    failedCount: number;
    errors: TinhHocPhiErrorItem[];
}

// ✅ Types cho Báo cáo thống kê
export interface OverviewPayload {
    svUnique: number;
    soDangKy: number; // ✅ Changed from soDK
    soLopHocPhan: number; // ✅ Changed from soLHP
    taiChinh: { thuc_thu: number; ky_vong: number };
    ketLuan: string;
}

export interface DKTheoKhoaRow {
    ten_khoa: string;
    so_dang_ky: number;
}

export interface DKTheoNganhRow {
    ten_nganh: string;
    so_dang_ky: number;
}

export interface TaiGiangVienRow {
    ho_ten: string;
    so_lop: number;
}

export interface BaoCaoTheoKhoaResponse {
    data: DKTheoKhoaRow[];
    ketLuan: string;
}

export interface BaoCaoTheoNganhResponse {
    data: DKTheoNganhRow[];
    ketLuan: string;
}

export interface BaoCaoTaiGVResponse {
    data: TaiGiangVienRow[];
    ketLuan: string;
}