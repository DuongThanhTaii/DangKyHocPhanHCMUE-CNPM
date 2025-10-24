import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const getMyLopHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const result = await serviceFactory.giangVienService.getMyLopHocPhan(gvUserId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getTKBWeeklyHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { hoc_ky_id, date_start, date_end } = req.query;

        if (!hoc_ky_id || !date_start || !date_end) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu học kỳ ID, ngày bắt đầu hoặc ngày kết thúc")
            );
        }

        const result = await serviceFactory.giangVienService.getTKBWeekly(
            gvUserId,
            hoc_ky_id as string,
            new Date(date_start as string),
            new Date(date_end as string)
        );

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getLopHocPhanDetailHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;

        const result = await serviceFactory.giangVienService.getLopHocPhanDetail(id, gvUserId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getStudentsOfLHPHandler = async (req: Request, res: Response) => {
    try {
        const gvUserId = req.auth!.sub;
        const { id } = req.params;

        const result = await serviceFactory.giangVienService.getStudentsOfLHP(id, gvUserId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
