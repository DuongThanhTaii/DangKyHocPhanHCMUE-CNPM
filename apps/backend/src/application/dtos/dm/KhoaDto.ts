import { z } from "zod";

export const KhoaDtoSchema = z.object({
    id: z.string().uuid(),
    ma_khoa: z.string().max(10),
    ten_khoa: z.string().max(255),
    ngay_thanh_lap: z.date().nullable(),
    trang_thai_hoat_dong: z.boolean().default(true),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
});

export type KhoaDto = z.infer<typeof KhoaDtoSchema>;
