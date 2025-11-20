export interface TaiLieuDTO {
    id: string;
    tenTaiLieu: string;
    fileType: string | null;
    fileUrl: string;
    uploadedAt: Date;
    uploadedBy: string;
}

export interface LopDaDangKyWithTaiLieuDTO {
    lopHocPhanId: string;
    maLop: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    giangVien: string;
    trangThaiDangKy: string;
    ngayDangKy: Date;
    taiLieu: TaiLieuDTO[];
}
