import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();

export const createDeXuatHocPhanHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body;
        const userId = req.auth!.sub;
        const loaiTaiKhoan = req.auth!.role;

        console.log(`User ${userId} với loại TK: ${loaiTaiKhoan}`);

        const result = await serviceFactory.deXuatHocPhanService.createDeXuatHocPhan(
            request,
            userId,
            loaiTaiKhoan
        );

        const statusCode = result.isSuccess ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

// Handler mới - Lấy tất cả đề xuất của khoa
export const getDeXuatHocPhanForTroLyKhoaHandler: RequestHandler = async (req, res, next) => {
    try {
        const userId = req.auth!.sub;
        const hocKyId = req.query.hocKyId as string | undefined;

        const result = await serviceFactory.deXuatHocPhanService.getDeXuatHocPhanForTroLyKhoa(
            userId,
            hocKyId
        );

        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};