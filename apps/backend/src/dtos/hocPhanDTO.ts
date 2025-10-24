export interface HocPhanForCreateLopDTO {
    id: string;
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    soSinhVienGhiDanh: number;
    tenGiangVien?: string; // ✅ Thêm optional
    giangVienId?: string;  // ✅ Thêm ID giảng viên
}
