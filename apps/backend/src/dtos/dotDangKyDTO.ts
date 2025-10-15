// Request DTO từ Frontend - FE gửi full data
export interface UpdateDotGhiDanhRequest {
    hocKyId: string;
    isToanTruong: boolean;

    // Nếu isToanTruong = true
    thoiGianBatDau?: string;
    thoiGianKetThuc?: string;
    dotToanTruongId?: string; // ✅ Thêm id (nếu đã tồn tại)

    // Nếu isToanTruong = false
    dotTheoKhoa?: DotGhiDanhTheoKhoaDTO[];
}

export interface DotGhiDanhTheoKhoaDTO {
    id?: string; // ✅ Có id nếu record đã tồn tại, null nếu tạo mới
    khoaId: string;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
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