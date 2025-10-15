export interface MonHocGhiDanhForSinhVien {
    id: string;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    tenKhoa: string;
    tenGiangVien: string;
}

/**
 * ✅ Request ghi danh 1 môn học
 */
export interface RequestGhiDanhMonHoc {
    id: string; // ID của học phần
}

/**
 * ✅ Request ghi danh nhiều môn (bulk)
 */
export interface RequestGhiDanhBulk {
    ids: string[]; // Mảng ID học phần
}

