export function CreateEmailSinhVienWithMaSinhVien(mssv: string): string {
  const mssvReplace = mssv.replace(/\./g, "");
  return mssvReplace + "@student.hcmue.edu.vn";
}

export function CreateEmailGiangVienWithMaGiangVien(mgv: string): string {
  const mgvReplace = mgv.replace(/\./g, "");
  return mgvReplace + "@hcmue.edu.vn";
}
