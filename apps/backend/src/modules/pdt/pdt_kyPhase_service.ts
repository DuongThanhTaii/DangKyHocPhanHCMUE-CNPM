import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();



// ✅ Handler - Lấy danh sách phases theo học kỳ
export const getPhasesByHocKyHandler: RequestHandler = async (req, res, next) => {
    try {
        const { hocKyId } = req.params;

        const result = await serviceFactory.kyPhaseService.getPhasesByHocKy(hocKyId);

        const statusCode = result.isSuccess ? 200 : 404;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const getDanhSachKhoaHandler: RequestHandler = async (req, res, next) => {
    try {
        const result = await serviceFactory.kyPhaseService.getDanhSachKhoa();

        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateDotGhiDanhHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body; // UpdateDotGhiDanhRequest

        const result = await serviceFactory.kyPhaseService.updateDotGhiDanh(request);

        const statusCode = result.isSuccess ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

