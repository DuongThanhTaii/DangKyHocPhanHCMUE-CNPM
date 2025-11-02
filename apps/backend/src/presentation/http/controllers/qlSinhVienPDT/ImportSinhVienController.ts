import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { ImportSinhVienUseCase } from "../../../../application/use-cases/qlSinhVienPDT/import/ImportSinhVien.usecase";
import { IImportStrategy } from "../../../../application/ports/qlSinhVienPDT/services/IImportStrategy";

@injectable()
export class ImportSinhVienController {
    constructor(
        @inject(ImportSinhVienUseCase) private importUseCase: ImportSinhVienUseCase,
        @inject("IImportStrategy.Excel") private excelStrategy: IImportStrategy,
        @inject("IImportStrategy.SelfInput") private selfInputStrategy: IImportStrategy
    ) { }

    async importWithExcel(req: Request, res: Response) {
        try {
            if (!req.file?.buffer) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Thiếu file upload",
                });
            }

            const result = await this.importUseCase.execute(this.excelStrategy, req.file.buffer);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[ImportSinhVienController.importWithExcel] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async importWithSelfInput(req: Request, res: Response) {
        try {
            const { records } = req.body;

            if (!Array.isArray(records) || records.length === 0) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Danh sách sinh viên không hợp lệ",
                });
            }

            const result = await this.importUseCase.execute(this.selfInputStrategy, records);

            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[ImportSinhVienController.importWithSelfInput] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
