export interface HocPhanForCreateLopHocPhanDTO {
    id: string;
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    soSinhVienGhiDanh: number;
    tenGiangVien: string;
}

/**
 * Query filter
 */
export interface GetHocPhanForCreateLopQuery {
    hocKyId: string;
}