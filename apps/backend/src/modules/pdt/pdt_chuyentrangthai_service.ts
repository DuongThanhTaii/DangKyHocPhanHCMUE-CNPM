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