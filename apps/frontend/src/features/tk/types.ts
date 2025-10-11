export interface DeXuatHocPhanForTruongKhoaDTO {
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