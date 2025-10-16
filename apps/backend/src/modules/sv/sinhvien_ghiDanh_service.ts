import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();

/**
 * Handler - Check xem sinh viên có được phép ghi danh không
 */
export const checkTrangThaiGhiDanhHandler: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.auth!.sub; // Lấy từ JWT token

        const result = await serviceFactory.checkTrangThaiForSinhVien.checkTrangThaiForGhiDanh(userId);

        const statusCode = result.isSuccess ? 200 : 403;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Handler - Hủy nhiều ghi danh môn học
 */
export const huyGhiDanhMonHocHandler: RequestHandler = async (req, res, next) => {
    try {
        const sinhVienId = req.auth!.sub;

        // ✅ Validate body trước khi destructure
        if (!req.body || !req.body.ghiDanhIds) {
            return res.status(400).json({
                isSuccess: false,
                message: "Danh sách ghiDanhIds không được để trống",
                errorCode: "INVALID_INPUT",
                data: null,
            });
        }

        const { ghiDanhIds } = req.body;

        const result = await serviceFactory.sinhVienService.huyGhiDanhMonHoc(
            ghiDanhIds,
            sinhVienId
        );

        const statusCode = result.isSuccess ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};