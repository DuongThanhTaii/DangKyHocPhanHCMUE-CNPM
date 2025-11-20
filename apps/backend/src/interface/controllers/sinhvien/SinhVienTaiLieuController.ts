import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { GetLopDaDangKyWithTaiLieuUseCase } from "../../../application/use-cases/sinhvien/GetLopDaDangKyWithTaiLieu.usecase";
import { GetTaiLieuByLopHocPhanUseCase } from "../../../application/use-cases/sinhvien/GetTaiLieuByLopHocPhan.usecase";

@injectable()
export class SinhVienTaiLieuController {
    constructor(
        @inject(GetLopDaDangKyWithTaiLieuUseCase) private getLopDaDangKyWithTaiLieuUseCase: GetLopDaDangKyWithTaiLieuUseCase,
        @inject(GetTaiLieuByLopHocPhanUseCase) private getTaiLieuByLopHocPhanUseCase: GetTaiLieuByLopHocPhanUseCase
    ) { }

    /**
     * GET /api/sv/lop-da-dang-ky/tai-lieu?hoc_ky_id=xxx
     */
    async getLopDaDangKyWithTaiLieu(req: Request, res: Response): Promise<void> {
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

            const result = await this.getLopDaDangKyWithTaiLieuUseCase.execute(sinhVienId, hoc_ky_id);

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
            console.error("[SINH_VIEN_TAI_LIEU_CONTROLLER] getLopDaDangKyWithTaiLieu Error:", error);
            res.status(500).json({
                isSuccess: false,
                message: "Internal server error",
                errorCode: "INTERNAL_ERROR"
            });
        }
    }

    /**
     * GET /api/sv/lop-hoc-phan/:id/tai-lieu
     */
    async getTaiLieuByLopHocPhan(req: Request, res: Response): Promise<void> {
        try {
            const sinhVienId = req.auth!.sub;
            const lop_hoc_phan_id = req.params.id;

            if (!lop_hoc_phan_id) {
                res.status(400).json({
                    isSuccess: false,
                    message: "Thiếu lop_hoc_phan_id",
                    errorCode: "MISSING_PARAM"
                });
                return;
            }

            const result = await this.getTaiLieuByLopHocPhanUseCase.execute(sinhVienId, lop_hoc_phan_id);

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
            console.error("[SINH_VIEN_TAI_LIEU_CONTROLLER] getTaiLieuByLopHocPhan Error:", error);
            res.status(500).json({
                isSuccess: false,
                message: "Internal server error",
                errorCode: "INTERNAL_ERROR"
            });
        }
    }
}
