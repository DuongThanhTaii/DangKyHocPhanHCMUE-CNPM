import { z } from "zod";

export const SetHocKyHienHanhSchema = z.object({
    hocKyId: z.string().uuid("ID học kỳ không hợp lệ"),
});

export type SetHocKyHienHanhInputDTO = z.infer<typeof SetHocKyHienHanhSchema>;
