import { z } from "zod";

export const BaoCaoQuerySchema = z.object({
    hoc_ky_id: z.string().uuid("ID học kỳ không hợp lệ"),
    khoa_id: z.string().uuid("ID khoa không hợp lệ").optional(),
    nganh_id: z.string().uuid("ID ngành không hợp lệ").optional(),
});

export type BaoCaoQueryDTO = z.infer<typeof BaoCaoQuerySchema>;
