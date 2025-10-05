export interface HocKyDTO {
    id: string;
    tenHocKy: string;
    ngayBatDau: Date | null;
    ngayKetThuc: Date | null;
}

export interface HocKyNienKhoaDTO {
    id: string;
    tenNienKhoa: string;
    ngayBatDau: Date | null;
    ngayKetThuc: Date | null;
    hocKy: HocKyDTO[];
}