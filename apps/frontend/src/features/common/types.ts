export interface TuChoiDeXuatHocPhanRequest {
    id: string;
}

export interface HocKyHienHanhDTO {
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

export interface HocKyItemDTO {
    id: string;
    tenHocKy: string;
    maHocKy: string;
    ngayBatDau?: Date;
    ngayKetThuc?: Date;
}

export interface HocKyNienKhoaDTO {
    nienKhoaId: string;
    tenNienKhoa: string;
    hocKy: HocKyItemDTO[];
}
export interface NganhDTO {
    id: string;
    ten_nganh: string; // ✅ Changed from tenNganh
    khoa_id: string;   // ✅ Changed from khoaId
}

// ✅ Alias for backward compatibility - use HocKyItemDTO structure
export type HocKyDTO = HocKyItemDTO;
