// ...existing types...

/**
 * ✅ Thông tin lớp học trong TKB
 */
export interface ThongTinLopHoc {
    id?: string; // ID nếu lớp đã tồn tại
    tenLop: string;
    phongHoc?: string; // Tên phòng (B.310)
    phongHocId?: string; // ✅ UUID reference
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
 * Request type - Xếp thời khóa biểu
 */
export interface XepThoiKhoaBieuRequest {
    maHocPhan: string;
    hocKyId: string;
    giangVienId?: string; // ✅ Thêm giảng viên ID (optional)
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