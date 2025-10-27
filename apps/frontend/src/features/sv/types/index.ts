// src/features/sv/types/index.ts

// ========== ĐĂNG KÝ HỌC PHẦN ==========

export interface CheckPhaseDangKyResponse {
    canRegister: boolean;
    message: string;
}

export interface DanhSachLopHocPhanDTO {
    monChung: MonHocGroupDTO[];
    batBuoc: MonHocGroupDTO[];
    tuChon: MonHocGroupDTO[];
}

export interface MonHocGroupDTO {
    monHocId: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    danhSachLop: LopHocPhanItemDTO[];
}

export interface LopHocPhanItemDTO {
    id: string;
    maLop: string;
    tenLop: string;
    soLuongHienTai: number;
    soLuongToiDa: number;
    tkb: TKBItemDTO[];
}

export interface TKBItemDTO {
    thu: number;
    tiet: string;
    phong: string;
    giangVien: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    formatted: string;
}

// ✅ Response đã đăng ký (flat list)
export interface LopDaDangKyItemDTO {
    lopHocPhanId: string; // ✅ ID để hủy đăng ký
    maLop: string;
    tenLop: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    giangVien: string;
    tkbFormatted: string;
}

// ✅ Request hủy đăng ký (single) - ONLY lop_hoc_phan_id
export interface HuyDangKyHocPhanRequest {
    lop_hoc_phan_id: string;
}

// ✅ Request chuyển lớp
export interface ChuyenLopHocPhanRequest {
    lop_hoc_phan_id_cu: string;
    lop_hoc_phan_id_moi: string;
}