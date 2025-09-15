export type Role =
  | "phong_dao_tao"
  | "truong_khoa"
  | "tro_ly_khoa"
  | "giang_vien"
  | "sinh_vien";

export interface User {
  id: string;
  ho_ten: string;
  loai_tai_khoan: Role;
}

export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
