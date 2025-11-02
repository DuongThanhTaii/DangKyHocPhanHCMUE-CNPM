import { z } from "zod";

export const CreateBulkKyPhaseSchema = z.object({
    hocKyId: z.string().uuid("ID học kỳ không hợp lệ"),
    phases: z.array(
        z.object({
            phase: z.string().min(1, "Phase không được để trống"),
            startAt: z.string().datetime("startAt phải là ISO datetime"),
            endAt: z.string().datetime("endAt phải là ISO datetime"),
            isEnabled: z.boolean().optional().default(true),
        })
    ).min(1, "Phải có ít nhất 1 phase"),
});

export type CreateBulkKyPhaseInputDTO = z.infer<typeof CreateBulkKyPhaseSchema>;
