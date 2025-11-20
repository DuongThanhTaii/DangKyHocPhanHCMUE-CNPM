export function CreateEmailSinhVienWithMaSinhVien(mssv: string): string {
    const mssvReplace = mssv.replace(/\./g, '');
    return mssvReplace + "@student.hcmue.edu.vn";
}