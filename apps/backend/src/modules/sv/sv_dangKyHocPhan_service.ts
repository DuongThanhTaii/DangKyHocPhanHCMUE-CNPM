import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const dangKyHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { lop_hoc_phan_id, hoc_ky_id } = req.body;

        if (!lop_hoc_phan_id || !hoc_ky_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu thông tin lớp học phần hoặc học kỳ")
            );
        }

        const result = await serviceFactory.dangKyHocPhanSinhVienService.dangKyHocPhan(sinhVienId, {
            lop_hoc_phan_id,
            hoc_ky_id,
        });

        if (result.isSuccess) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const huyDangKyHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { lop_hoc_phan_id } = req.body;

        if (!lop_hoc_phan_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu ID lớp học phần")
            );
        }

        const result = await serviceFactory.dangKyHocPhanSinhVienService.huyDangKyHocPhan(
            sinhVienId,
            lop_hoc_phan_id
        );

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const chuyenLopHocPhanHandler = async (req: Request, res: Response) => {
    try {
        const sinhVienId = req.auth!.sub;
        const { lop_hoc_phan_id_cu, lop_hoc_phan_id_moi } = req.body;

        if (!lop_hoc_phan_id_cu || !lop_hoc_phan_id_moi) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu ID lớp cũ hoặc lớp mới")
            );
        }

        if (lop_hoc_phan_id_cu === lop_hoc_phan_id_moi) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Lớp cũ và lớp mới không được trùng nhau")
            );
        }

        const result = await serviceFactory.dangKyHocPhanSinhVienService.chuyenLopHocPhan(
            sinhVienId,
            lop_hoc_phan_id_cu,
            lop_hoc_phan_id_moi
        );

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
