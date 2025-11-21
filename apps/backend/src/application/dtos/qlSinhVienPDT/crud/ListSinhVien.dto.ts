export interface ListSinhVienQueryDTO {
    page?: number;
    pageSize?: number;
    search?: string;
}

export interface SinhVienItemDTO {
    id: string;
    maSoSinhVien: string;
    hoTen: string;
    tenKhoa: string;
    tenNganh?: string;
    lop?: string;
    khoaHoc?: string;
    trangThaiHoatDong: boolean;
}

export interface ListSinhVienOutputDTO {
    items: SinhVienItemDTO[];
    total: number;
    page: number;
    pageSize: number;
}
