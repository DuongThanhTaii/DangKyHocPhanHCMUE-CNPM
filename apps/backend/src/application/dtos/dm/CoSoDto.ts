import { z } from "zod";

export const CoSoDtoSchema = z.object({
    id: z.string().uuid(),
    ten_co_so: z.string(),
    dia_chi: z.string().nullable(),
});

export type CoSoDto = z.infer<typeof CoSoDtoSchema>;
