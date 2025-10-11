export interface DeXuatHocPhanDTO {
    id: string;
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    giangVien: string;
    trangThai: string;
}

export interface UpdateTrangThaiByTruongKhoaRequest {
    id: string;
}

export interface TuChoiDeXuatHocPhanRequest {
    id: string; // ID của đề xuất
}