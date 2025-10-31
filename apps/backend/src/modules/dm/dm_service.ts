import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const getAllKhoaHandler = async (req: Request, res: Response) => {
    try {
        const result = await serviceFactory.danhMucService.getAllKhoa();
        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getAllNganhHandler = async (req: Request, res: Response) => {
    try {
        const { khoa_id } = req.query;

        const result = await serviceFactory.danhMucService.getAllNganh(
            khoa_id as string | undefined
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getAllCoSoHandler = async (req: Request, res: Response) => {
    try {
        const result = await serviceFactory.danhMucService.getAllCoSo();
        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const getNganhChuaCoChinhSachHandler = async (req: Request, res: Response) => {
    try {
        const { hoc_ky_id, khoa_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu học kỳ ID")
            );
        }

        if (!khoa_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu khoa ID")
            );
        }

        const result = await serviceFactory.danhMucService.getNganhChuaCoChinhSach(
            hoc_ky_id as string,
            khoa_id as string
        );

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
