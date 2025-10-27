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

// ✅ Thêm nấc mới: MonHocInfoDTO chứa thông tin môn học + danh sách lớp
export interface MonHocInfoDTO {
    maMon: string;
    tenMon: string;
    soTinChi: number;
    danhSachLop: LopHocPhanItemDTO[]; // ✅ Danh sách lớp học phần của môn này
}

// ✅ Deprecated - Giữ để backward compatible
export interface MonHocGroupDTO {
    monHocId: string;
    maMon: string;
    tenMon: string;
    soTinChi: number;
    danhSachLop: LopHocPhanItemDTO[];
}

// ✅ Response chính
export interface DanhSachLopHocPhanDTO {
    monChung: MonHocInfoDTO[];
    batBuoc: MonHocInfoDTO[];
    tuChon: MonHocInfoDTO[];
}
