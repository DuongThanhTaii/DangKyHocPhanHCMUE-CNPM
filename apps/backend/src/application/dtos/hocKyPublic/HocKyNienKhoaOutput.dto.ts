export interface HocKyItemDTO {
    id: string;
    tenHocKy: string;
    maHocKy: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
}

export interface HocKyNienKhoaOutputDTO {
    nienKhoaId: string;
    tenNienKhoa: string;
    hocKy: HocKyItemDTO[];
}
