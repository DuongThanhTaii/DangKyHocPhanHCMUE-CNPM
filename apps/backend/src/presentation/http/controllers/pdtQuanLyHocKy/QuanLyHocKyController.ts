import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { SetHocKyHienHanhUseCase } from "../../../../application/use-cases/pdtQuanLyHocKy/SetHocKyHienHanh.usecase";
import { CreateBulkKyPhaseUseCase } from "../../../../application/use-cases/pdtQuanLyHocKy/CreateBulkKyPhase.usecase";
import { GetPhasesByHocKyUseCase } from "../../../../application/use-cases/pdtQuanLyHocKy/GetPhasesByHocKy.usecase";
import { SetHocKyHienHanhSchema } from "../../../../application/dtos/pdtQuanLyHocKy/SetHocKyHienHanh.dto";
import { CreateBulkKyPhaseSchema } from "../../../../application/dtos/pdtQuanLyHocKy/CreateBulkKyPhase.dto";

@injectable()
export class QuanLyHocKyController {
    constructor(
        @inject(SetHocKyHienHanhUseCase) private setHocKyHienHanhUseCase: SetHocKyHienHanhUseCase,
        @inject(CreateBulkKyPhaseUseCase) private createBulkKyPhaseUseCase: CreateBulkKyPhaseUseCase,
        @inject(GetPhasesByHocKyUseCase) private getPhasesByHocKyUseCase: GetPhasesByHocKyUseCase
    ) { }

    async setHocKyHienHanh(req: Request, res: Response) {
        try {
            const parsed = SetHocKyHienHanhSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.setHocKyHienHanhUseCase.execute(parsed.data);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[QuanLyHocKyController.setHocKyHienHanh] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async createBulkKyPhase(req: Request, res: Response) {
        try {
            const parsed = CreateBulkKyPhaseSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.createBulkKyPhaseUseCase.execute(parsed.data);

            return res.status(result.isSuccess ? 201 : 400).json(result);
        } catch (error: any) {
            console.error("[QuanLyHocKyController.createBulkKyPhase] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getPhasesByHocKy(req: Request, res: Response) {
        try {
            const { hocKyId } = req.params;

            const result = await this.getPhasesByHocKyUseCase.execute(hocKyId);

            return res.status(result.isSuccess ? 200 : 404).json(result);
        } catch (error: any) {
            console.error("[QuanLyHocKyController.getPhasesByHocKy] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
