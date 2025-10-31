import { Request, Response } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const getAllChinhSachTinChiHandler = async (req: Request, res: Response) => {
    try {
        const result = await serviceFactory.chinhSachTinChiService.getAllChinhSach();
        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const createChinhSachTinChiHandler = async (req: Request, res: Response) => {
    try {
        const { hocKyId, khoaId, nganhId, phiMoiTinChi } = req.body;

        if (!hocKyId || !phiMoiTinChi) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu thông tin bắt buộc")
            );
        }

        const result = await serviceFactory.chinhSachTinChiService.createChinhSach({
            hocKyId,
            khoaId: khoaId || null,
            nganhId: nganhId || null,
            phiMoiTinChi,
        });

        if (result.isSuccess) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const updateChinhSachTinChiHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { phiMoiTinChi } = req.body;

        if (!id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu ID chính sách")
            );
        }

        if (!phiMoiTinChi || phiMoiTinChi <= 0) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Phí tín chỉ không hợp lệ")
            );
        }

        const result = await serviceFactory.chinhSachTinChiService.updatePhiTinChi(
            id,
            phiMoiTinChi
        );

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
