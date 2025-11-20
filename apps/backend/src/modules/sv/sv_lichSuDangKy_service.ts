import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const getLichSuDangKyByHocKyHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
        }

        const result = await serviceFactory.lichSuDangKySinhVienService.getLichSuDangKyByHocKy(
            sinhVienId,
            hoc_ky_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getAllLichSuDangKyHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;

        const result = await serviceFactory.lichSuDangKySinhVienService.getAllLichSuDangKy(sinhVienId);

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getTKBSinhVienHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(ServiceResultBuilder.failure("Thiếu học kỳ ID"));
        }

        const result = await serviceFactory.lichSuDangKySinhVienService.getTKBSinhVien(
            sinhVienId,
            hoc_ky_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getTKBWeeklyHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { hoc_ky_id, date_start, date_end } = req.query;

        if (!hoc_ky_id || !date_start || !date_end) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu học kỳ ID, ngày bắt đầu hoặc ngày kết thúc")
            );
        }

        const dateStart = new Date(date_start as string);
        const dateEnd = new Date(date_end as string);

        if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Ngày không hợp lệ")
            );
        }

        const result = await serviceFactory.lichSuDangKySinhVienService.getTKBWeekly(
            sinhVienId,
            hoc_ky_id as string,
            dateStart,
            dateEnd
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
