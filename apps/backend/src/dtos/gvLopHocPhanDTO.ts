export interface StudentOfLHPDTO {
    id: string; // ✅ UUID sinh viên
    mssv: string;
    hoTen: string;
    lop: string | null;
    email: string;
}

export interface GVGradeDTO {
    sinh_vien_id: string; // ✅ UUID sinh viên
    diem_so?: number;
}
