import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { GetTuitionDetailsUseCase } from "../../../application/use-cases/tuition/GetTuitionDetails.usecase";
import { ComputeTuitionUseCase } from "../../../application/use-cases/tuition/ComputeTuition.usecase";

@injectable()
export class TuitionController {
    constructor(
        @inject(GetTuitionDetailsUseCase) private getTuitionDetailsUseCase: GetTuitionDetailsUseCase,
        @inject(ComputeTuitionUseCase) private computeTuitionUseCase: ComputeTuitionUseCase
    ) { }

    async getTuitionDetails(req: Request, res: Response): Promise<void> {
        try {
            const sinhVienId = req.auth!.sub;
            const hoc_ky_id = req.query.hoc_ky_id as string;

            if (!hoc_ky_id) {
                res.status(400).json({
                    isSuccess: false,
                    message: "Thiếu hoc_ky_id",
                    errorCode: "MISSING_PARAM"
                });
                return;
            }

            const result = await this.getTuitionDetailsUseCase.execute(sinhVienId, hoc_ky_id);

            if (result.isSuccess) {
                res.status(200).json({
                    isSuccess: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                    errorCode: result.errorCode
                });
            }
        } catch (error) {
            console.error("[TUITION_CONTROLLER] getTuitionDetails Error:", error);
            res.status(500).json({
                isSuccess: false,
                message: "Internal server error",
                errorCode: "INTERNAL_ERROR"
            });
        }
    }

    async computeTuition(req: Request, res: Response): Promise<void> {
        try {
            const sinhVienId = req.auth!.sub;
            const { hoc_ky_id } = req.body;

            if (!hoc_ky_id) {
                res.status(400).json({
                    isSuccess: false,
                    message: "Thiếu hoc_ky_id",
                    errorCode: "MISSING_PARAM"
                });
                return;
            }

            const result = await this.computeTuitionUseCase.execute(sinhVienId, hoc_ky_id);

            if (result.isSuccess) {
                res.status(200).json({
                    isSuccess: true,
                    message: result.message,
                    data: { tongHocPhi: result.data }
                });
            } else {
                res.status(400).json({
                    isSuccess: false,
                    message: result.message,
                    errorCode: result.errorCode
                });
            }
        } catch (error) {
            console.error("[TUITION_CONTROLLER] computeTuition Error:", error);
            res.status(500).json({
                isSuccess: false,
                message: "Internal server error",
                errorCode: "INTERNAL_ERROR"
            });
        }
    }
}
