export interface MonHocGhiDanhForSinhVien {
    id: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien: string;
}

export interface MonHocDaGhiDanh {
    ghiDanhId: string;      // ✅ ID của record GhiDanh
    monHocId: string;       // ID môn học
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien?: string;
}

/**
 * ✅ Request ghi danh 1 môn học
 */
export interface RequestGhiDanhMonHoc {
    monHocId: string; // ✅ Add this field
}

/**
 * ✅ Request ghi danh nhiều môn (bulk)
 */
export interface RequestGhiDanhBulk {
    ids: string[]; // Mảng ID học phần
}

export interface RequestHuyGhiDanhMonHoc {
    ghiDanhIds: string[];
}
