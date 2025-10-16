import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();

// Handler - Lấy danh sách môn học ghi danh
export const getMonHocGhiDanhHandler: RequestHandler = async (req, res, next) => {
    try {
        const hocKyId = req.query.hocKyId as string | undefined;

        const result = await serviceFactory.sinhVienService.getMonHocGhiDanh(hocKyId);

        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

// Handler - Ghi danh môn học
export const ghiDanhMonHocHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body; // { id: "uuid" }
        const sinhVienId = req.auth!.sub;

        const result = await serviceFactory.sinhVienService.ghiDanhMonHoc(
            request,
            sinhVienId
        );

        const statusCode = result.isSuccess ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

// Handler - Lấy danh sách đã ghi danh
export const getDanhSachDaGhiDanhHandler: RequestHandler = async (req, res, next) => {
    try {
        const sinhVienId = req.auth!.sub;
        const result = await serviceFactory.sinhVienService.getDanhSachDaGhiDanh(sinhVienId);

        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};