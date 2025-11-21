// Request DTO từ Frontend - FE gửi full data
export interface UpdateDotGhiDanhRequest {
    hocKyId: string;
    isToanTruong: boolean;

    // Nếu isToanTruong = true
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
    dotToanTruongId?: string;
    gioiHanTinChi?: number; // ✅ Thêm optional, default 50
    hanHuyDen?: string; // ✅ Thêm optional, default null

    // Nếu isToanTruong = false
    dotTheoKhoa?: DotGhiDanhTheoKhoaDTO[];
}

export interface DotGhiDanhTheoKhoaDTO {
    id?: string;
    khoaId: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    gioiHanTinChi?: number; // ✅ Thêm optional, default 50
    hanHuyDen?: string; // ✅ Thêm optional, default null
}

// Response DTO
export interface DotGhiDanhResponseDTO {
    id: string;
    hocKyId: string;
    loaiDot: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    isCheckToanTruong: boolean;
    khoaId: string | null;
    tenKhoa: string | null;
    gioiHanTinChi: number;
}

// ✅ Request DTO cho Đăng ký học phần
export interface UpdateDotDangKyRequest {
    hocKyId: string;
    isToanTruong: boolean;
    gioiHanTinChi?: number; // ✅ Optional, default 9999

    // Nếu isToanTruong = true
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
    hanHuyDen?: string; // ✅ Hạn hủy đăng ký
    dotToanTruongId?: string;

    // Nếu isToanTruong = false
    dotTheoKhoa?: DotDangKyTheoKhoaDTO[];
}

export interface DotDangKyTheoKhoaDTO {
    id?: string;
    khoaId: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
    hanHuyDen?: string;
    gioiHanTinChi?: number;
}

// ✅ Response DTO cho Đăng ký học phần
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