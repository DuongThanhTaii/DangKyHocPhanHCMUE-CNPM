import { z } from "zod";

export const NganhDtoSchema = z.object({
    id: z.string().uuid(),
    ma_nganh: z.string().max(20),
    ten_nganh: z.string().max(255),
    khoa_id: z.string().uuid(),
    created_at: z.date().nullable(),
    updated_at: z.date().nullable(),
});

export type NganhDto = z.infer<typeof NganhDtoSchema>;
