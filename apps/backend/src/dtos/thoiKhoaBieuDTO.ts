/**
 * Thông tin 1 lớp học trong thời khóa biểu
 */
export interface ThongTinLopHoc {
    tenLop: string;
    phongHoc?: string;
    phongHocId?: string; // UUID reference
    ngayBatDau: Date;
    ngayKetThuc: Date;
    tietBatDau: number;
    tietKetThuc: number;
    thuTrongTuan?: number;
}

/**
 * DTO response - Thời khóa biểu môn học
 */
export interface ThoiKhoaBieuMonHocDTO {
    id: string;
    maHocPhan: string;
    danhSachLop: ThongTinLopHoc[];
}

/**
 * DTO request - Xếp thời khóa biểu
 */
export interface XepTKBRequest {
    maHocPhan: string;
    hocKyId: string;
    giangVienId?: string; // ✅ Thêm giảng viên ID (optional)
    soLuongToiDa?: number; // Optional, default 50
    danhSachLop: {
        tenLop: string;
        phongHocId: string;
        ngayBatDau: Date;
        ngayKetThuc: Date;
        tietBatDau: number;
        tietKetThuc: number;
        thuTrongTuan: number;
    }[];
}