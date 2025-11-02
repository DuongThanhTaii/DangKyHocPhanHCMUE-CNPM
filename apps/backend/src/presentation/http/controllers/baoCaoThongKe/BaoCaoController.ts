import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { GetDangKyTheoKhoaUseCase } from "../../../../application/use-cases/baoCaoThongKe/GetDangKyTheoKhoa.usecase";
import { GetDangKyTheoNganhUseCase } from "../../../../application/use-cases/baoCaoThongKe/GetDangKyTheoNganh.usecase";
import { GetTaiGiangVienUseCase } from "../../../../application/use-cases/baoCaoThongKe/GetTaiGiangVien.usecase";
import { ExportBaoCaoUseCase } from "../../../../application/use-cases/baoCaoThongKe/ExportBaoCao.usecase";
import { BaoCaoQuerySchema } from "../../../../application/dtos/baoCaoThongKe/BaoCaoQuery.dto";
import { ExportPDFSchema } from "../../../../application/dtos/baoCaoThongKe/ExportPDF.dto";
import { ExcelExportStrategy } from "../../../../infrastructure/services/baoCaoThongKe/export-strategies/ExcelExportStrategy";
import { PDFExportStrategy } from "../../../../infrastructure/services/baoCaoThongKe/export-strategies/PDFExportStrategy";
import { GetOverviewUseCase } from "../../../../application/use-cases/baoCaoThongKe/GetOverview.usecase";
@injectable()
export class BaoCaoController {
    constructor(
        @inject(GetOverviewUseCase) private overviewUseCase: GetOverviewUseCase,
        @inject(GetDangKyTheoKhoaUseCase) private khoaUseCase: GetDangKyTheoKhoaUseCase,
        @inject(GetDangKyTheoNganhUseCase) private nganhUseCase: GetDangKyTheoNganhUseCase,
        @inject(GetTaiGiangVienUseCase) private giangVienUseCase: GetTaiGiangVienUseCase,
        @inject(ExportBaoCaoUseCase) private exportUseCase: ExportBaoCaoUseCase,
        @inject("ExcelExportStrategy") private excelStrategy: ExcelExportStrategy,
        @inject("PDFExportStrategy") private pdfStrategy: PDFExportStrategy
    ) { }

    async getOverview(req: Request, res: Response) {
        try {
            const parsed = BaoCaoQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.overviewUseCase.execute(parsed.data);
            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[BaoCaoController.getOverview] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getDangKyTheoKhoa(req: Request, res: Response) {
        try {
            const hocKyId = req.query.hoc_ky_id as string;
            if (!hocKyId) {
                return res.status(400).json({ isSuccess: false, message: "Thiếu hoc_ky_id" });
            }

            const result = await this.khoaUseCase.execute(hocKyId);
            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[BaoCaoController.getDangKyTheoKhoa] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getDangKyTheoNganh(req: Request, res: Response) {
        try {
            const hocKyId = req.query.hoc_ky_id as string;
            const khoaId = req.query.khoa_id as string | undefined;

            if (!hocKyId) {
                return res.status(400).json({ isSuccess: false, message: "Thiếu hoc_ky_id" });
            }

            const result = await this.nganhUseCase.execute(hocKyId, khoaId);
            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[BaoCaoController.getDangKyTheoNganh] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async getTaiGiangVien(req: Request, res: Response) {
        try {
            const hocKyId = req.query.hoc_ky_id as string;
            const khoaId = req.query.khoa_id as string | undefined;

            if (!hocKyId) {
                return res.status(400).json({ isSuccess: false, message: "Thiếu hoc_ky_id" });
            }

            const result = await this.giangVienUseCase.execute(hocKyId, khoaId);
            return res.status(result.isSuccess ? 200 : 400).json(result);
        } catch (error: any) {
            console.error("[BaoCaoController.getTaiGiangVien] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async exportExcel(req: Request, res: Response) {
        try {
            const parsed = BaoCaoQuerySchema.safeParse(req.query);
            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.exportUseCase.execute(this.excelStrategy, parsed.data);

            if (!result.isSuccess || !result.data) {
                return res.status(400).json(result);
            }

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="bao_cao_${parsed.data.hoc_ky_id}.xlsx"`);
            return res.send(result.data);
        } catch (error: any) {
            console.error("[BaoCaoController.exportExcel] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }

    async exportPDF(req: Request, res: Response) {
        try {
            const parsed = ExportPDFSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    isSuccess: false,
                    message: "Dữ liệu không hợp lệ",
                    errors: parsed.error.flatten(),
                });
            }

            const result = await this.exportUseCase.execute(this.pdfStrategy, parsed.data, parsed.data.charts);

            if (!result.isSuccess || !result.data) {
                return res.status(400).json(result);
            }

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="bao_cao_${parsed.data.hoc_ky_id}.pdf"`);
            return res.send(result.data);
        } catch (error: any) {
            console.error("[BaoCaoController.exportPDF] Error:", error);
            return res.status(500).json({ isSuccess: false, message: "Internal server error" });
        }
    }
}
