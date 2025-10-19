/**
 * Thông tin 1 lớp học trong thời khóa biểu
 */
export interface ThongTinLopHoc {
    tenLop: string;
    phongHoc?: string;
    ngayBatDau: Date;
    ngayKetThuc: Date;
    tietBatDau: number;      // 1-12
    tietKetThuc: number;     // 1-12
    thuTrongTuan?: number;   // 2=T2, 3=T3, ..., 7=CN
}

/**
 * DTO response - Thời khóa biểu môn học
 */
export interface ThoiKhoaBieuMonHocDTO {
    id: string;
    maHocPhan: string;
    hocKyId: string;
    danhSachLop: ThongTinLopHoc[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * DTO request - Tạo thời khóa biểu mới
 */
export interface CreateThoiKhoaBieuRequest {
    maHocPhan: string;
    hocKyId: string;
    danhSachLop: ThongTinLopHoc[];
}

/**
 * DTO request - Update danh sách lớp
 */
export interface UpdateDanhSachLopRequest {
    id: string;
    danhSachLop: ThongTinLopHoc[];
}

/**
 * DTO request - Query thời khóa biểu
 */
export interface GetThoiKhoaBieuQuery {
    maHocPhan?: string;
    hocKyId?: string;
}