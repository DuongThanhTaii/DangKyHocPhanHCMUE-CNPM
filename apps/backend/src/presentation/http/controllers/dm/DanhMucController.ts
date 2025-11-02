import { Request, Response } from "express";
import { container } from "../../../../infrastructure/di/container";
import { TYPES } from "../../../../infrastructure/di/types";
import { DanhMucUseCases } from "../../../../application/use-cases/dm/DanhMucUseCases";
import { ServiceResultBuilder } from "../../../../types/serviceResult";

export class DanhMucController {
    private useCases: DanhMucUseCases;

    constructor() {
        this.useCases = container.get<DanhMucUseCases>(TYPES.DanhMucUseCases);
    }

    /**
     * GET /api/dm/khoa
     */
    getAllKhoa = async (_req: Request, res: Response) => {
        try {
            const khoas = await this.useCases.getAllKhoa();
            return res.json(ServiceResultBuilder.success(khoas as any));
        } catch (err: any) {
            return res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    };

    /**
     * GET /api/dm/nganh?khoa_id=xxx
     */
    getAllNganh = async (req: Request, res: Response) => {
        try {
            const { khoa_id } = req.query;
            const nganhs = await this.useCases.getAllNganh(khoa_id as string | undefined);
            return res.json(ServiceResultBuilder.success(nganhs as any));
        } catch (err: any) {
            return res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    };

    /**
     * GET /api/dm/co-so
     */
    getAllCoSo = async (_req: Request, res: Response) => {
        try {
            const coSos = await this.useCases.getAllCoSo();
            return res.json(ServiceResultBuilder.success(coSos as any));
        } catch (err: any) {
            return res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    };

    /**
     * GET /api/dm/nganh/chua-co-chinh-sach?hoc_ky_id=xxx&khoa_id=yyy
     */
    getNganhChuaCoChinhSach = async (req: Request, res: Response) => {
        try {
            const { hoc_ky_id, khoa_id } = req.query;

            if (!hoc_ky_id) {
                return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
            }

            if (!khoa_id) {
                return res.status(400).json(ServiceResultBuilder.failure("Thiếu khoa ID"));
            }

            const nganhs = await this.useCases.getNganhChuaCoChinhSach(
                hoc_ky_id as string,
                khoa_id as string
            );

            return res.json(ServiceResultBuilder.success(nganhs as any));
        } catch (err: any) {
            return res.status(500).json(ServiceResultBuilder.failure(err.message));
        }
    };
}
