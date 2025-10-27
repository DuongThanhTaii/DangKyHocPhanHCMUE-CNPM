// ========== GHI DANH ==========

export interface MonHocGhiDanhForSinhVien {
    id: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien: string;
}

export interface MonHocDaGhiDanh {
    ghiDanhId: string;
    monHocId: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien?: string;
}

export interface RequestGhiDanhMonHoc {
    monHocId: string;
}

export interface RequestGhiDanhBulk {
    ids: string[];
}

export interface RequestHuyGhiDanhMonHoc {
    ghiDanhIds: string[];
}

// ========== ĐĂNG KÝ HỌC PHẦN ==========

export interface CheckPhaseDangKyResponse {
    canRegister: boolean;
    message: string;
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

export interface LopHocPhanItemDTO {
    id: string;
    maLop: string;
    tenLop: string;
    soLuongHienTai: number;
    soLuongToiDa: number;
    tkb: TKBItemDTO[];
}

export interface MonHocInfoDTO {
    maMon: string;
    tenMon: string;
    soTinChi: number;
    danhSachLop: LopHocPhanItemDTO[];
}

export interface DanhSachLopHocPhanDTO {
    monChung: MonHocInfoDTO[];
    batBuoc: MonHocInfoDTO[];
    tuChon: MonHocInfoDTO[];
}

// ✅ Response đã đăng ký (array of MonHocInfoDTO)
export type DanhSachLopDaDangKyDTO = MonHocInfoDTO[];

// ✅ Request đăng ký
export interface DangKyHocPhanRequest {
    lop_hoc_phan_id: string;
    hoc_ky_id: string;
}


export interface HuyDangKyHocPhanRequest {
    lop_hoc_phan_id: string;
}

// ✅ Request chuyển lớp
export interface ChuyenLopHocPhanRequest {
    lop_hoc_phan_id_cu: string;
    lop_hoc_phan_id_moi: string;
}