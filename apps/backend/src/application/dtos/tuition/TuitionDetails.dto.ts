export interface TuitionDetailsDTO {
    sinhVienId: string;
    hocKyId: string;
    tongHocPhi: number;
    trangThaiThanhToan: string;
    ngayThanhToan?: Date;
    chiTiet: TuitionDetailItemDTO[];
}

export interface TuitionDetailItemDTO {
    monHocId: string;
    tenMonHoc: string;
    soTinChi: number;
    donGia: number;
    thanhTien: number;
}
