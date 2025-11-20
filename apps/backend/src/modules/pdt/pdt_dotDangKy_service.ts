import { Request, Response, RequestHandler } from "express";
import { ServiceFactory } from "../../services/serviceFactory";
import { ServiceResultBuilder } from "../../types/serviceResult";

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

export const getDotDangKyByHocKyHandler = async (req: Request, res: Response) => {
    try {
        const { hoc_ky_id } = req.query;

        if (!hoc_ky_id) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu học kỳ ID")
            );
        }

        const result = await serviceFactory.dotDangKyService.getDotDangKyByHocKy(hoc_ky_id as string);

        return res.json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};

export const updateDotDangKyHandler = async (req: Request, res: Response) => {
    try {
        const request = req.body;

        if (!request.hocKyId) {
            return res.status(400).json(
                ServiceResultBuilder.failure("Thiếu học kỳ ID")
            );
        }

        const result = await serviceFactory.dotDangKyService.updateDotDangKy(request);

        if (result.isSuccess) {
            return res.status(201).json(result);
        }

        return res.status(400).json(result);
    } catch (err: any) {
        res.status(500).json(ServiceResultBuilder.failure(err.message));
    }
};