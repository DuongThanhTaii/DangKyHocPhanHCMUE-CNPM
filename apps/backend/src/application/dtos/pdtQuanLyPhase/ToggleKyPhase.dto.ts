import { z } from "zod";

// ✅ Updated: 5 valid phases
export const VALID_PHASES = [
    "de_xuat_phe_duyet",
    "ghi_danh",
    "dang_ky_hoc_phan",
    "sap_xep_tkb",
    "binh_thuong",
] as const;

export const ToggleKyPhaseInputDTOSchema = z.object({
    phase: z.enum(VALID_PHASES),
});

export type ToggleKyPhaseInputDTO = z.infer<typeof ToggleKyPhaseInputDTOSchema>;
