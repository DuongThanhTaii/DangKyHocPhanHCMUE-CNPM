export interface DeXuatHocPhanRequest {
    maHocPhan: string;
    maGiangVien: string;
}
export interface DeXuatHocPhanForTroLyKhoaDTO {
    id: string;
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    giangVien: string;
    trangThai: string;
}

export interface PhongHocDTO {
    id: string;
    maPhong: string;
    tenCoSo: string;
    sucChua: number;
}
export interface HocPhanForCreateLopDTO {
    id: string;
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    soSinhVienGhiDanh: number;
    tenGiangVien: string;
    giangVienId: string;
}

export interface HocKyHienHanhDTO {
    id: string;
    hoc_ky_id: string;
    nien_khoa_id: string;
    hoc_ky: {
        so_hoc_ky: number;
        ten_hoc_ky: string;
    };
    nien_khoa: {
        nam_bat_dau: number;
        nam_ket_thuc: number;
    };
}

export interface XepTKBRequest {
    maHocPhan: string;
    hocKyId: string;
    danhSachLop: {
        tenLop: string;
        phongHocId: string;
        ngayBatDau: Date;
        ngayKetThuc: Date;
        tietBatDau: number;
        tietKetThuc: number;
        thuTrongTuan: number;
    }[];
}// ...existing types...

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