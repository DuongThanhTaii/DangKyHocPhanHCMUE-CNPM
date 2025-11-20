import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const traCuuHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu học kỳ ID")
            );
        }

        const result = await serviceFactory.lopHocPhanSinhVienService.traCuuHocPhan(
            hoc_ky_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
