import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();

export const getHocKyNienKhoaHandler: RequestHandler = async (_req, res, next) => {
    try {
        const data = await serviceFactory.hocKyService.GetHocKyNienKhoa();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const createBulkKyPhaseHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await serviceFactory.kyPhaseService.CreateBulkKyPhase(request);

        const statusCode = result.isSuccess ? 201 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const setHocKyHienThanhHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await serviceFactory.hocKyService.SetHocKyHienHanh(request);
        const statusCode = result.isSuccess ? 200 : 400;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const getHocKyHienHanhHandler: RequestHandler = async (_req, res, next) => {
    try {
        const result = await serviceFactory.hocKyService.GetHocKyHienHanh();
        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const getDeXuatHocPhanForPDTHandler: RequestHandler = async (req, res, next) => {
    try {
        const hocKyId = req.query.hocKyId as string | undefined;

        const result = await serviceFactory.deXuatHocPhanService.getDeXuatHocPhanForPDT(hocKyId);

        const statusCode = result.isSuccess ? 200 : 500;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};

export const updateTrangThaiByPDTHandler: RequestHandler = async (req, res, next) => {
    try {
        const request = req.body; // { id: "uuid" }
        const userId = req.auth!.sub;
        const loaiTaiKhoan = req.auth!.role;

        const result = await serviceFactory.deXuatHocPhanService.updateTrangThaiByPhongDaoTao(
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

// Export handler từ chối (dùng chung)
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