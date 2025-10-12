import { z } from "zod";

export const CreateSinhVienDTO = z.object({
  // tai_khoan
  ten_dang_nhap: z.string().min(4).max(50),
  mat_khau: z.string().min(6).max(255),
  trang_thai_hoat_dong: z.boolean().optional(),

  // users
  ho_ten: z.string().min(2).max(255),

  // sinh_vien
  ma_so_sinh_vien: z.string().min(3).max(20),
  khoa_id: z.string().uuid(),
  lop: z.string().max(50).optional(),
  khoa_hoc: z.string().max(10).optional(),
  ngay_nhap_hoc: z.string().optional(), // ISO date (YYYY-MM-DD)
  nganh_id: z.string().uuid().optional(),
});
export type TCreateSinhVienDTO = z.infer<typeof CreateSinhVienDTO>;

export const UpdateSinhVienDTO = z.object({
  // tai_khoan
  mat_khau: z.string().min(6).max(255).optional(),
  trang_thai_hoat_dong: z.boolean().optional(),

  // users
  ho_ten: z.string().min(2).max(255).optional(),

  // sinh_vien
  ma_so_sinh_vien: z.string().min(3).max(20).optional(),
  khoa_id: z.string().uuid().optional(),
  lop: z.string().max(50).optional(),
  khoa_hoc: z.string().max(10).optional(),
  ngay_nhap_hoc: z.string().optional(), // ISO
  nganh_id: z.string().uuid().optional(),
});
export type TUpdateSinhVienDTO = z.infer<typeof UpdateSinhVienDTO>;
