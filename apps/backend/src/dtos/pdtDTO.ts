export interface HocKyDTO {
    id: string;
    tenHocKy: string;
    ngayBatDau: Date | null;
    ngayKetThuc: Date | null;
}

export interface HocKyHienHanhDTO {
    id: string;
    tenHocKy: string;
    nienKhoaId?: string;
    tenNienKhoa?: string;
    ngayBatDau: string | null; // ISO string
    ngayKetThuc: string | null; // ISO string
}

export interface HocKyNienKhoaDTO {
    id: string;
    tenNienKhoa: string;
    ngayBatDau: Date | null;
    ngayKetThuc: Date | null;
    hocKy: HocKyDTO[];
}

export interface SetHocKyHienThanhRequest {
    hocKyId: string;
}
export interface UpdateTrangThaiByPDTRequest {
    id: string; // ID của đề xuất
}

export interface KhoaDTO {
    id: string;
    tenKhoa: string;
}