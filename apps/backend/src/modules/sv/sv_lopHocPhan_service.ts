import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const checkPhaseDangKyHandler = async (req: Request, res: Response) => {
    try {
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
        }

        const result = await serviceFactory.lopHocPhanSinhVienService.checkPhaseDangKyHocPhan(hoc_ky_id as string);

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getDanhSachLopHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
        }

        const result = await serviceFactory.lopHocPhanSinhVienService.getDanhSachLopHocPhan(
            sinhVienId,
            hoc_ky_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getDanhSachLopDaDangKyHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
        }

        const result = await serviceFactory.lopHocPhanSinhVienService.getDanhSachLopDaDangKy(
            sinhVienId,
            hoc_ky_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getDanhSachLopChuaDangKyByMonHocHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { mon_hoc_id, hoc_ky_id } = req.query;

        if (!mon_hoc_id || !hoc_ky_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu môn học ID hoặc học kỳ ID")
            );
        }

        // ✅ Validate hoc_ky_id phải là UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(hoc_ky_id as string)) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Học kỳ ID không hợp lệ (phải là UUID)")
            );
        }

        // ✅ mon_hoc_id có thể là UUID hoặc mã môn (COMP1060)
        const result = await serviceFactory.lopHocPhanSinhVienService.getDanhSachLopChuaDangKyByMonHoc(
            sinhVienId,
            mon_hoc_id as string,
            hoc_ky_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
