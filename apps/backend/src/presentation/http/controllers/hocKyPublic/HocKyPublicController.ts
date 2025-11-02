import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { GetHocKyNienKhoaUseCase } from "../../../../application/use-cases/hocKyPublic/GetHocKyNienKhoa.usecase";
import { GetHocKyHienHanhUseCase } from "../../../../application/use-cases/hocKyPublic/GetHocKyHienHanh.usecase";

@injectable()
export class HocKyPublicController {
    constructor(
        @inject(GetHocKyNienKhoaUseCase) private getHocKyNienKhoaUseCase: GetHocKyNienKhoaUseCase,
        @inject(GetHocKyHienHanhUseCase) private getHocKyHienHanhUseCase: GetHocKyHienHanhUseCase
    ) { }

    async getHocKyNienKhoa(req: Request, res: Response) {
        try {
            const result = await this.getHocKyNienKhoaUseCase.execute();
            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[HocKyPublicController.getHocKyNienKhoa] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getHocKyHienHanh(req: Request, res: Response) {
        try {
            const result = await this.getHocKyHienHanhUseCase.execute();
            return res.status(result.isSuccess ? 200 : 404).json(result);
        } catch (error: any) {
            console.error("[HocKyPublicController.getHocKyHienHanh] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
