import { RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";

const serviceFactory = ServiceFactory.getInstance();

export const getAllDotDangKyByHocKyHandler: RequestHandler = async (req, res, next) => {
    try {
        const { hocKyId } = req.params;

        const result = await serviceFactory.dotDangKyService.getAllDotDangKyByHocKy(hocKyId);

        const statusCode = result.isSuccess ? 200 : 404;
        res.status(statusCode).json(result);
    } catch (error) {
        next(error);
    }
};