import { z } from "zod";

export const ExportPDFSchema = z.object({
    hoc_ky_id: z.string().uuid(),
    khoa_id: z.string().uuid().optional(),
    nganh_id: z.string().uuid().optional(),
    charts: z.array(
        z.object({
            name: z.string().max(100),
            dataUrl: z.string()
                .refine((val) => val.startsWith('data:image/'), 'Invalid image data URL')
                .refine((val) => val.length < 5 * 1024 * 1024, 'Image too large (max 5MB)')
        })
    ).max(10).optional(),
});

export type ExportPDFInputDTO = z.infer<typeof ExportPDFSchema>;
