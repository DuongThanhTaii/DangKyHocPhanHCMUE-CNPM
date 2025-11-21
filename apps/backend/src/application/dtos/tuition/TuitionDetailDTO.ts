export interface TuitionDetailDTO {
    sinhVienId: string;
    hocKyId: string;
    tongHocPhi: number;
    soTinChiDangKy: number;
    donGiaTinChi: number;
    chinhSach: {
        tenChinhSach: string;
        ngayHieuLuc: string;
        ngayHetHieuLuc: string;
    };
    chiTiet: Array<{
        maMon: string;
        tenMon: string;
        maLop: string;
        soTinChi: number;
        donGia: number;
        thanhTien: number;
    }>;
    trangThaiThanhToan: string;
}
