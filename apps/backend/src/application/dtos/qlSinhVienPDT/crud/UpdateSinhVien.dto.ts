import { z } from "zod";

export const UpdateSinhVienSchema = z.object({
    hoTen: z.string().min(1).optional(),
    maKhoa: z.string().optional(),
    maNganh: z.string().optional(),
    lop: z.string().optional(),
    khoaHoc: z.string().optional(),
    ngayNhapHoc: z.string().optional(),
    matKhau: z.string().min(6).optional(),
    trangThaiHoatDong: z.boolean().optional(),
});

export type UpdateSinhVienInputDTO = z.infer<typeof UpdateSinhVienSchema>;
