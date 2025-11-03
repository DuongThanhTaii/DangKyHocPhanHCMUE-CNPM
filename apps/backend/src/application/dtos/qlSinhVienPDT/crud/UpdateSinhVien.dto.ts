import { z } from "zod";

export const UpdateSinhVienInputDTOSchema = z.object({
  // ✅ All fields optional (FE chỉ gửi field nào thay đổi)
  maSoSinhVien: z.string().min(1).max(20).optional(),
  hoTen: z.string().min(1).max(255).optional(),
  khoaId: z.string().uuid().optional(),
  nganhId: z.string().uuid().nullable().optional(),
  lop: z.string().max(50).nullable().optional(),
  khoaHoc: z.string().max(10).nullable().optional(),
  ngayNhapHoc: z.coerce.date().nullable().optional(),
  matKhau: z.string().min(6).optional(), // ✅ Chỉ hash nếu FE gửi
  trangThaiHoatDong: z.boolean().optional(),
});

export type UpdateSinhVienInputDTO = z.infer<typeof UpdateSinhVienInputDTOSchema>;
