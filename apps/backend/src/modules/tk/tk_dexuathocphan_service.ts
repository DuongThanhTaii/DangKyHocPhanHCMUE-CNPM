import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

const serviceFactory = ServiceFactory.getInstance();

export const getDeXuatHocPhanForTruongKhoaHandler: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.auth!.sub;
        const hocKyId = req.query.hocKyId as string | undefined;

        const result = await serviceFactory.deXuatHocPhanService.getDeXuatHocPhanForTruongKhoa(
            userId,
            hocKyId
        );

        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateTrangThaiByTruongKhoaHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body;
        const userId = req.auth!.sub;
        const loaiTaiKhoan = req.auth!.role;

        const result = await serviceFactory.deXuatHocPhanService.updateTrangThaiByTruongKhoa(
            request,
            userId,
            loaiTaiKhoan
        );

        const statusCode = result.isSuccess ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

// Handler mới - Từ chối đề xuất
export const tuChoiDeXuatHocPhanHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body; // { id: "uuid" }
        const userId = req.auth!.sub;
        const loaiTaiKhoan = req.auth!.role;

        const result = await serviceFactory.deXuatHocPhanService.tuChoiDeXuatHocPhan(
            request,
            userId,
            loaiTaiKhoan
        );

        const statusCode = result.isSuccess ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};