import { Request, Response } from "express";
import { PhongHocService } from "../../services/phongHocService";
import { ServiceResultBuilder } from "../../types/serviceResult";

const phongHocService = new PhongHocService();

// Lấy danh sách phòng học có sẵn (chưa được sử dụng)
export const getAvailablePhongHocHandler = async (_req: Request, res: Response) => {
    try {
        const result = await phongHocService.getAvailablePhongHoc();

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Lấy tất cả phòng học theo khoa ID
export const getAllPhongHocByKhoaIdHandler = async (req: Request, res: Response) => {
    try {
        const { khoaId } = req.params;

        if (!khoaId) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu khoa ID")
            );
        }

        const result = await phongHocService.getAllPhongHocByKhoaId(khoaId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Gán phòng học cho khoa
export const assignPhongHocByKhoaIdHandler = async (req: Request, res: Response) => {
    try {
        const { khoaId } = req.params;
        const { phongHocIds } = req.body;

        if (!khoaId) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu khoa ID")
            );
        }

        if (!phongHocIds || !Array.isArray(phongHocIds)) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Danh sách phòng học không hợp lệ")
            );
        }

        const result = await phongHocService.assignRoomsToKhoa(phongHocIds, khoaId);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

// Xóa gán phòng học khỏi khoa
export const unassignPhongHocByKhoaIdHandler = async (req: Request, res: Response) => {
    try {
        const { khoaId } = req.params;
        const { phongHocIds } = req.body;

        if (!khoaId) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu khoa ID")
            );
        }

        if (!phongHocIds || !Array.isArray(phongHocIds)) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Danh sách phòng học không hợp lệ")
            );
        }

        const result = await phongHocService.unassignRoomsFromKhoa(phongHocIds);

        if (result.isSuccess) {
            return res.json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};
