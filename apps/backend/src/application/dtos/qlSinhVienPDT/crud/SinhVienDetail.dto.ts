export interface SinhVienDetailDTO {
    id: string;
    maSoSinhVien: string;
    hoTen: string;
    email: string;
    khoa: {
        id: string;
        maKhoa: string;
        tenKhoa: string;
    };
    nganh?: {
        id: string;
        maNganh: string;
        tenNganh: string;
    };
    lop?: string;
    khoaHoc?: string;
    ngayNhapHoc?: Date;
    trangThaiHoatDong: boolean;
}
