import { z } from "zod";

export const CreateSinhVienSchema = z.object({
    maSoSinhVien: z.string().min(1, "Mã số sinh viên không được để trống"),
    hoTen: z.string().min(1, "Họ tên không được để trống"),
    maKhoa: z.string().min(1, "Mã khoa không được để trống"),
    maNganh: z.string().min(1, "Mã ngành không được để trống"),
    lop: z.string().optional(),
    khoaHoc: z.string().optional(),
    ngayNhapHoc: z.string().optional(),
    tenDangNhap: z.string().min(1, "Tên đăng nhập không được để trống"),
    matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    trangThaiHoatDong: z.boolean().optional().default(true),
});

export type CreateSinhVienInputDTO = z.infer<typeof CreateSinhVienSchema>;

export interface CreateSinhVienOutputDTO {
    id: string;
    maSoSinhVien: string;
    hoTen: string;
    tenKhoa: string;
    tenNganh: string;
    lop?: string;
    khoaHoc?: string;
}
