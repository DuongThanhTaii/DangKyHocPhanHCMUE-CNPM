import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export type JwtPayload = {
  sub: string;
  tai_khoan_id: string;
  role:
  | "phong_dao_tao"
  | "truong_khoa"
  | "tro_ly_khoa"
  | "giang_vien"
  | "sinh_vien";
  // ✅ Thêm các trường mới cho sinh viên
  mssv?: string;
  hoTen?: string;
  lop?: string;
  nganh?: string;
};

const secret: Secret = process.env.JWT_SECRET ?? "dev_secret_change_me";

// Chuẩn hóa expiresIn về đúng kiểu (number hoặc chuỗi '7d', '1h'...)
function normalizeExpiresIn(v?: string): NonNullable<SignOptions["expiresIn"]> {
  if (!v) return "7d";
  const asNum = Number(v);
  return Number.isFinite(asNum)
    ? asNum
    : (v as NonNullable<SignOptions["expiresIn"]>);
}

const options: SignOptions = {
  algorithm: "HS256",
  expiresIn: normalizeExpiresIn(process.env.JWT_EXPIRES),
};

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, secret, options);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
