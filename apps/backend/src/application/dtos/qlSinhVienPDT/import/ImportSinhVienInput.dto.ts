export interface ImportSinhVienExcelInputDTO {
    file: Buffer;
}

export interface ImportSinhVienSelfInputDTO {
    records: Array<{
        maSoSinhVien: string;
        hoTen: string;
        maKhoa: string;
        maNganh: string;
        lop?: string;
        khoaHoc?: string;
        ngayNhapHoc?: string;
    }>;
}
