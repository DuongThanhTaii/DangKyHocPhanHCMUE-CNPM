import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { TYPES } from "../../../../infrastructure/di/types";
import { ToggleKyPhaseUseCase } from "../../../../application/use-cases/pdtQuanLyPhase/ToggleKyPhase.usecase";
import { ToggleKyPhaseInputDTOSchema } from "../../../../application/dtos/pdtQuanLyPhase/ToggleKyPhase.dto";
import { GetCurrentActivePhaseUseCase } from "../../../../application/use-cases/pdtQuanLyPhase/GetCurrentActivePhase.usecase";

@injectable()
export class KyPhaseController {
    constructor(
        @inject(TYPES.PdtQuanLyPhase.ToggleKyPhaseUseCase) private toggleUseCase: ToggleKyPhaseUseCase,
        // ✅ ADD: Inject new use case
        @inject(TYPES.PdtQuanLyPhase.GetCurrentActivePhaseUseCase) private getCurrentActivePhaseUseCase: GetCurrentActivePhaseUseCase
    ) { }

    async togglePhase(req: Request, res: Response) {
        try {
            // ✅ Validate input (phase name)
            const parsed = ToggleKyPhaseInputDTOSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            // ✅ Execute use case with phase name
            const result = await this.toggleUseCase.execute(parsed.data.phase);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[KyPhaseController.togglePhase] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    // ✅ NEW: Get current active phase
    async getCurrentActivePhase(_req: Request, res: Response) {
        try {
            const result = await this.getCurrentActivePhaseUseCase.execute();

            return res.status(result.isSuccess ? 200 : 404).json(result);
        } catch (error: any) {
            console.error("[KyPhaseController.getCurrentActivePhase] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
