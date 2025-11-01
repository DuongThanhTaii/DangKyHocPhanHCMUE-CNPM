export type Role =
  | "phong_dao_tao"
  | "truong_khoa"
  | "tro_ly_khoa"
  | "giang_vien"
  | "sinh_vien";

export interface User {
  id: string;
  hoTen: string; 
  maNhanVien?: string;
  loaiTaiKhoan: Role; 
  mssv?: string;
  lop?: string;
  nganh?: string;
}

export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
