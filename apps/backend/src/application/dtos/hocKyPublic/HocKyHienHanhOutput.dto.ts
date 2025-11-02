export interface HocKyHienHanhOutputDTO {
    id: string;
    tenHocKy: string;
    maHocKy: string;
    nienKhoa: {
        id: string;
        tenNienKhoa: string;
    };
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
}
