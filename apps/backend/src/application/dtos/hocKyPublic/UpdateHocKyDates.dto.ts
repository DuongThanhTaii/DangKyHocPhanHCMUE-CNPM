import { z } from "zod";

export const UpdateHocKyDatesInputDTOSchema = z.object({
  hocKyId: z.string().uuid(),
  // ✅ SIMPLEST: Accept string, convert in Use Case
  ngayBatDau: z.string(),
  ngayKetThuc: z.string(),
}).refine((data) => new Date(data.ngayBatDau) < new Date(data.ngayKetThuc), {
  message: "Ngày bắt đầu phải trước ngày kết thúc",
  path: ["ngayKetThuc"],
});

export type UpdateHocKyDatesInputDTO = z.infer<typeof UpdateHocKyDatesInputDTOSchema>;
